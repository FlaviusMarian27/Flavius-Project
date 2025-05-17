// Animatie aparitie smooth
    document.addEventListener("DOMContentLoaded", () => {
        const elements = document.querySelectorAll(".hidden");
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.09}s`;
            observer.observe(el);
        });

        // Year in footer
        document.getElementById("year").textContent = new Date().getFullYear();

        // Go to top
        const goTopBtn = document.getElementById('goTopBtn');
        window.addEventListener('scroll', function () {
            if (window.scrollY > 200) {
                goTopBtn.classList.add('show');
            } else {
                goTopBtn.classList.remove('show');
            }
        });
        goTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });