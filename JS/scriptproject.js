document.addEventListener("DOMContentLoaded", function() {
    // Anul din footer
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- MODAL LOGIC ---
    // Deschide modal la click pe card
    const projectCard = document.getElementById("tictactoeC");
    if (projectCard) {
        projectCard.onclick = function() {
            document.getElementById("projectModal").classList.add("active");
            document.body.style.overflow = 'hidden'; // dezactiveaza scroll-ul paginii sub modal
        };
    }

    // Inchide modal la click pe X
    const modalClose = document.getElementById("modalClose");
    if (modalClose) {
        modalClose.onclick = function() {
            document.getElementById("projectModal").classList.remove("active");
            document.body.style.overflow = '';
        };
    }

    // Inchide modal la click pe overlay (exteriorul ferestrei)
    const modalOverlay = document.getElementById("projectModal");
    if (modalOverlay) {
        modalOverlay.onclick = function(e) {
            if (e.target === this) {
                this.classList.remove("active");
                document.body.style.overflow = '';
            }
        };
    }
});
