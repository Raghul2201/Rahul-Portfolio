import os
import re
import time
import sqlite3

from pathlib import Path
from collections import defaultdict, deque
from threading import Lock

import resend

from flask import Flask, render_template, request, jsonify


# =========================================================
# FLASK CONFIGURATION
# =========================================================

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent

DATABASE = Path(
    os.environ.get(
        "DATABASE_PATH",
        str(BASE_DIR / "portfolio.db")
    )
)

app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

rate_limit_data = defaultdict(deque)
rate_limit_lock = Lock()


# =========================================================
# RESEND EMAIL CONFIGURATION
# =========================================================

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()

MAIL_RECEIVER = os.environ.get(
    "MAIL_RECEIVER",
    "raghulraghul5537@gmail.com"
).strip()

MAIL_SENDER = os.environ.get(
    "MAIL_SENDER",
    "Portfolio <onboarding@resend.dev>"
).strip()


# =========================================================
# DATABASE
# =========================================================

def get_db():
    connection = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    DATABASE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with get_db() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)


initialize_database()


# =========================================================
# RATE LIMITING
# =========================================================

def rate_limited(ip):
    now = time.time()

    with rate_limit_lock:
        requests = rate_limit_data[ip]

        while requests and now - requests[0] > 60:
            requests.popleft()

        if len(requests) >= 5:
            return True

        requests.append(now)

        return False


# =========================================================
# SEND EMAIL USING RESEND
# =========================================================

def send_email_notification(
    name,
    sender_email,
    subject,
    message
):
    """
    Send a portfolio contact notification through Resend.

    Required:
        RESEND_API_KEY

    Optional:
        MAIL_RECEIVER
        MAIL_SENDER
    """

    if not RESEND_API_KEY:
        app.logger.error(
            "Email notification failed: RESEND_API_KEY is missing."
        )

        return False

    if not MAIL_RECEIVER:
        app.logger.error(
            "Email notification failed: MAIL_RECEIVER is missing."
        )

        return False

    try:
        # Configure Resend using the private API key.
        resend.api_key = RESEND_API_KEY

        # Send the notification.
        result = resend.Emails.send({
            "from": MAIL_SENDER,
            "to": [MAIL_RECEIVER],
            "reply_to": sender_email,
            "subject": f"Portfolio Contact: {subject}",
            "text": (
                "You received a new message through your portfolio.\n\n"
                f"Name: {name}\n"
                f"Email: {sender_email}\n"
                f"Subject: {subject}\n\n"
                "Message:\n"
                f"{message}\n"
            )
        })

        # Resend should return an email ID when the API accepts the request.
        if isinstance(result, dict) and result.get("id"):
            app.logger.info(
                "Resend accepted the contact notification. Email ID: %s",
                result["id"]
            )

            return True

        app.logger.error(
            "Resend did not return an email ID."
        )

        return False

    except Exception:
        # Avoid logging API keys or other sensitive information.
        app.logger.exception(
            "Unable to send the portfolio email notification."
        )

        return False


# =========================================================
# HOME PAGE
# =========================================================

@app.get("/")
def index():
    return render_template("index.html")


# =========================================================
# CONTACT FORM API
# =========================================================

@app.post("/api/contact")
def submit_contact():

    ip = request.remote_addr or "unknown"

    if rate_limited(ip):
        return jsonify({
            "success": False,
            "message": "Too many requests. Please try again later."
        }), 429

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    subject = str(data.get("subject", "")).strip()
    message = str(data.get("message", "")).strip()

    # Validate required fields.
    if not all([name, email, subject, message]):
        return jsonify({
            "success": False,
            "message": "Please complete every field."
        }), 400

    # Validate field lengths.
    if len(name) > 100 or len(email) > 254:
        return jsonify({
            "success": False,
            "message": "Name or email is too long."
        }), 400

    if len(subject) > 150 or len(message) > 5000:
        return jsonify({
            "success": False,
            "message": "Subject or message is too long."
        }), 400

    # Validate email address.
    if not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        email
    ):
        return jsonify({
            "success": False,
            "message": "Enter a valid email address."
        }), 400

    # Save the message before attempting email delivery.
    try:
        with get_db() as connection:
            connection.execute("""
                INSERT INTO messages (
                    name,
                    email,
                    subject,
                    message
                )
                VALUES (?, ?, ?, ?)
            """, (
                name,
                email,
                subject,
                message
            ))

    except sqlite3.Error:
        app.logger.exception(
            "Unable to save the contact message."
        )

        return jsonify({
            "success": False,
            "message": (
                "We couldn't save your message. "
                "Please try again later."
            )
        }), 500

    # Send the notification after saving the message.
    email_sent = send_email_notification(
        name,
        email,
        subject,
        message
    )

    if email_sent:
        return jsonify({
            "success": True,
            "message": (
                "Thanks! Your message has been sent successfully."
            )
        }), 201

    # The message is saved even if the email service fails.
    return jsonify({
        "success": True,
        "message": (
            "Thanks! Your message has been saved, "
            "but email notification is temporarily unavailable."
        )
    }), 201


# =========================================================
# RUN LOCAL SERVER
# =========================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )