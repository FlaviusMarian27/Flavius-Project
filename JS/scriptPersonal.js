document.addEventListener("DOMContentLoaded", () => {
      const elements = document.querySelectorAll(
        ".hidden"
      );
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      elements.forEach((el, i) => {
        el.classList.add(`delay-${(i % 6) + 1}`);
        observer.observe(el);
      });

      // Seteaza anul automat in footer
      const year = document.getElementById("year");
      if(year) year.textContent = new Date().getFullYear();
    });