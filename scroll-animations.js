// ============================================================
// SCROLL ANIMATIONS - Flavius Personal Page
// Adauga in index.html inainte de </body>:
//   <script src="scroll-animations.js"></script>
// ============================================================


// ============================================================
// 1. FADE-IN + SLIDE-UP la scroll (Intersection Observer)
// ============================================================

// Adaugam clasa .reveal la toate elementele care trebuie animate
const revealTargets = [
    '.section-title',
    '.about-text',
    '.about-stats',
    '.stat-box',
    '.about-logos',
    '.project-item',
    '.interest-card',
    '.contact-card',
    '.social-connect',
    '.interests-intro',
    '.contact-intro',
    '.skills-category',
];

revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
        el.classList.add('reveal');

        // Staggered delay pentru carduri (proiecte, interese, stat-box-uri)
        const staggerSelectors = ['.project-item', '.interest-card', '.stat-box', '.contact-card'];
        if (staggerSelectors.includes(selector)) {
            el.style.transitionDelay = `${index * 0.08}s`;
        }
    });
});

// Observer care detecteaza cand elementul intra in ecran
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Dupa ce apare o data, nu mai e nevoie sa il observam
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,       // 12% din element trebuie sa fie vizibil
    rootMargin: '0px 0px -40px 0px'  // se declanseaza putin inainte
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ============================================================
// 2. NAVBAR - shrink la scroll + active link highlight
// ============================================================

const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links li a');
const sections = document.querySelectorAll('main section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // --- Shrink navbar ---
    if (scrollY > 60) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }

    // --- Active nav link ---
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('nav-active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('nav-active');
        }
    });
});


// ============================================================
// 3. HERO - efect parallax usor pe text la scroll
// ============================================================

const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
    if (heroContent) {
        const scrollY = window.scrollY;
        // Misca hero-ul putin in sus cand dai scroll - efect de depth
        heroContent.style.transform = `translateY(${scrollY * 0.18}px)`;
        heroContent.style.opacity = 1 - scrollY / 600;
    }
}, { passive: true });


// ============================================================
// 4. CSS injectat dinamic (nu trebuie sa modifici style.css)
// ============================================================

const style = document.createElement('style');
style.textContent = `

    /* --- Stare initiala a elementelor animate --- */
    .reveal {
        opacity: 0;
        transform: translateY(32px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    /* --- Stare finala: element vizibil --- */
    .reveal.visible {
        opacity: 1;
        transform: translateY(0);
    }

    /* --- Navbar shrink la scroll --- */
    nav.nav-scrolled {
        height: 58px !important;
        background: rgba(15, 23, 42, 0.97) !important;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
        transition: height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }

    nav {
        transition: height 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }

    /* --- Active nav link --- */
    nav ul li a.nav-active {
        color: #38bdf8 !important;
        border-bottom: 2px solid #38bdf8;
        padding-bottom: 2px;
    }

    /* --- Hero parallax - nu clipeste la incarcare --- */
    .hero-content {
        will-change: transform, opacity;
    }
`;

document.head.appendChild(style);