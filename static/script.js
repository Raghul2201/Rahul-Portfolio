"use strict";

/* =========================================
   1. TYPING ANIMATION
========================================= */

const typingElement = document.getElementById("typingText");

const roles = [
    "Python Developer",
    "Full-Stack Developer",
    "UI/UX Designer",
    "AI Enthusiast"
];

let roleIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeRole() {
    if (!typingElement) return;

    const currentRole = roles[roleIndex];

    if (deleting) {
        characterIndex--;
    } else {
        characterIndex++;
    }

    typingElement.textContent = currentRole.substring(0, characterIndex);

    let delay = deleting ? 40 : 85;

    if (!deleting && characterIndex === currentRole.length) {
        deleting = true;
        delay = 1300;
    } else if (deleting && characterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 300;
    }

    window.setTimeout(typeRole, delay);
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typingElement.textContent = roles[0];
} else {
    typeRole();
}


/* =========================================
   2. FUTURISTIC PARTICLE BACKGROUND
========================================= */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];
let mouse = { x: -1000, y: -1000 };
let animationFrame = null;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(
        90,
        Math.max(25, Math.floor(window.innerWidth / 15))
    );

    particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.7 + 0.5
    }));

    drawParticles();
}

function drawParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const particle of particles) {
        if (!reducedMotion) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -1;
            }

            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -1;
            }

            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 120 && distance > 0) {
                particle.x -= (dx / distance) * 0.35;
                particle.y -= (dy / distance) * 0.35;
            }
        }

        ctx.beginPath();
        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "rgba(65, 234, 255, 0.65)";
        ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const first = particles[i];
            const second = particles[j];

            const distance = Math.hypot(
                first.x - second.x,
                first.y - second.y
            );

            if (distance < 105) {
                ctx.beginPath();
                ctx.moveTo(first.x, first.y);
                ctx.lineTo(second.x, second.y);

                ctx.strokeStyle =
                    `rgba(65, 234, 255, ${0.13 * (1 - distance / 105)})`;

                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    if (!reducedMotion) {
        animationFrame = requestAnimationFrame(drawParticles);
    }
}

window.addEventListener("resize", () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    resizeCanvas();
});

window.addEventListener("pointermove", event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener("pointerleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

resizeCanvas();


/* =========================================
   3. SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach(element => revealObserver.observe(element));
} else {
    revealElements.forEach(element => element.classList.add("visible"));
}


/* =========================================
   4. ACTIVE NAVIGATION
========================================= */

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".navbar nav a");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navLinks.forEach(link => {
                const isActive =
                    link.getAttribute("href") === `#${entry.target.id}`;

                link.classList.toggle("active", isActive);
            });
        });
    }, {
        rootMargin: "-25% 0px -60% 0px"
    });

    sections.forEach(section => sectionObserver.observe(section));
}


/* =========================================
   5. PROJECT DETAIL POPUPS
========================================= */

const projects = {
    jarvis: {
        title: "JARVIS — Personal AI Assistant",
        description:
            "A personal AI assistant prototype designed to explore AI interaction, " +
            "voice responses, and computer automation.",
        features: [
            "AI-powered question answering.",
            "Voice interaction and text-to-speech exploration.",
            "Opening applications and computer automation.",
            "System information and control experiments.",
            "Hand gesture control experiments."
        ],
        technologies:
            "Technologies: Python, Flask, AI APIs, automation tools."
    },

    laura: {
        title: "LAURA — Mobile AI Assistant",
        description:
            "A Siri-inspired mobile assistant concept with a laptop-hosted backend " +
            "and an Android-facing interface.",
        features: [
            "Voice assistant experience.",
            "Wake-word activation is under development.",
            "Futuristic animated assistant interface.",
            "Planned device-aware commands.",
            "Future integration of mobile and laptop actions."
        ],
        technologies:
            "Technologies: Python, Flask, Android interface, voice technologies."
    },

    spam: {
        title: "Email Spam Detection Using Machine Learning",
        description:
            "A text classification project developed during the Oasis Infobyte " +
            "Data Science Internship.",
        features: [
            "Text preprocessing and feature extraction.",
            "CountVectorizer for converting text into numerical features.",
            "Multinomial Naive Bayes classification.",
            "Spam and ham message classification.",
            "Dataset processing with spam.csv."
        ],
        technologies:
            "Technologies: Python, Pandas, NumPy, Scikit-learn, Jupyter Notebook."
    }
};

const dialog = document.getElementById("projectDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const dialogFeatures = document.getElementById("dialogFeatures");
const dialogTech = document.getElementById("dialogTech");
const closeDialogButton = document.getElementById("closeDialog");

document.querySelectorAll(".project-details").forEach(button => {
    button.addEventListener("click", () => {
        const project = projects[button.dataset.project];

        if (!project) return;

        dialogTitle.textContent = project.title;
        dialogDescription.textContent = project.description;
        dialogTech.textContent = project.technologies;

        dialogFeatures.replaceChildren();

        project.features.forEach(feature => {
            const item = document.createElement("li");
            item.textContent = feature;
            dialogFeatures.appendChild(item);
        });

        dialog.showModal();
    });
});

closeDialogButton.addEventListener("click", () => {
    dialog.close();
});

dialog.addEventListener("click", event => {
    if (event.target === dialog) {
        dialog.close();
    }
});


/* =========================================
   6. ENGLISH / TAMIL LANGUAGE TOGGLE
========================================= */

const languageToggle = document.getElementById("languageToggle");

let currentLanguage = "en";

const translations = {
    en: {
        "Home": "Home",
        "About": "About",
        "Skills": "Skills",
        "Projects": "Projects",
        "Internship": "Internship",
        "Contact": "Contact",
        "GET TO KNOW ME": "GET TO KNOW ME",
        "About Me": "About Me",
        "MY TOOLKIT": "MY TOOLKIT",
        "Technical Skills": "Technical Skills",
        "SELECTED WORK": "SELECTED WORK",
        "Featured Projects": "Featured Projects",
        "PRACTICAL EXPERIENCE": "PRACTICAL EXPERIENCE",
        "Internship Experience": "Internship Experience",
        "LET'S BUILD SOMETHING": "LET'S BUILD SOMETHING",
        "Get In Touch": "Get In Touch"
    },

    ta: {
        "Home": "முகப்பு",
        "About": "என்னைப் பற்றி",
        "Skills": "திறன்கள்",
        "Projects": "திட்டங்கள்",
        "Internship": "பயிற்சி",
        "Contact": "தொடர்பு",
        "GET TO KNOW ME": "என்னைப் பற்றி அறியுங்கள்",
        "About Me": "என்னைப் பற்றி",
        "MY TOOLKIT": "எனது திறன்கள்",
        "Technical Skills": "தொழில்நுட்ப திறன்கள்",
        "SELECTED WORK": "தேர்ந்தெடுக்கப்பட்ட பணிகள்",
        "Featured Projects": "முக்கிய திட்டங்கள்",
        "PRACTICAL EXPERIENCE": "நடைமுறை அனுபவம்",
        "Internship Experience": "இன்டர்ன்ஷிப் அனுபவம்",
        "LET'S BUILD SOMETHING": "ஒன்றாக உருவாக்குவோம்",
        "Get In Touch": "தொடர்பு கொள்ளுங்கள்"
    }
};

const originalText = new WeakMap();

document.querySelectorAll(
    ".navbar nav a, .section-heading .eyebrow, .section-heading h2"
).forEach(element => {
    originalText.set(element, element.textContent.trim());
});

languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ta" : "en";

    document.documentElement.lang = currentLanguage;
    languageToggle.textContent =
        currentLanguage === "en" ? "தமிழ்" : "English";

    document.querySelectorAll(
        ".navbar nav a, .section-heading .eyebrow, .section-heading h2"
    ).forEach(element => {
        const english = originalText.get(element);

        if (!english) return;

        element.textContent =
            translations[currentLanguage][english] || english;
    });
});


/* =========================================
   7. CONTACT FORM
========================================= */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");

    const formData = {
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        subject: contactForm.elements.subject.value.trim(),
        message: contactForm.elements.message.value.trim()
    };

    formStatus.textContent = "";
    formStatus.className = "form-status";
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to send message.");
        }

        formStatus.textContent = result.message;
        formStatus.classList.add("success");
        contactForm.reset();

    } catch (error) {
        formStatus.textContent =
            error.message || "Could not connect to the server. Try again.";

        formStatus.classList.add("error");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message ↗";
    }
});


/* =========================================
   8. PLACEHOLDER SOCIAL LINKS
========================================= */

document.querySelectorAll("[data-placeholder-link]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        alert(
            "Replace this placeholder with your actual profile URL " +
            "before publishing your portfolio."
        );
    });
});