//Pentru copyright
document.getElementById('year').textContent = new Date().getFullYear();

//==============================================================
// Pentru cartonasele de skilluri
const scrollers = document.querySelectorAll('.scroller');

if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addAnimation();
}

function addAnimation() {
    scrollers.forEach((scroller) => {
        scroller.setAttribute("data-animated", true);
        const scrollerInner = Array.from(scroller.children);
        scrollerInner.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute("aria-hidden", "true");
            scroller.appendChild(duplicatedItem);
        })
    })
}

//=========================================================
// ... restul codului pentru skill-uri ...

// ==========================================
// MODAL LOGIC (Pentru Proiecte)
// ==========================================

const modal = document.getElementById("project-modal");
const closeBtn = document.querySelector(".close-modal");
const projectItems = document.querySelectorAll(".project-item");

// Elementele din interiorul modalului pe care le vom modifica
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalTags = document.getElementById("modal-tags");
const modalLink = document.getElementById("modal-github");

// 1. Deschide modalul la click pe un proiect
projectItems.forEach(item => {
    item.addEventListener("click", () => {
        // Luăm datele din atributele data-...
        const title = item.getAttribute("data-title");
        const image = item.getAttribute("data-image");
        const desc = item.getAttribute("data-desc");
        const tags = item.getAttribute("data-tags"); // "C++, SFML, OOP"
        const github = item.getAttribute("data-github");

        // Populăm modalul
        modalTitle.textContent = title;
        modalImg.src = image;
        modalDesc.textContent = desc;
        modalLink.href = github;

        // Generăm tag-urile (spargem textul după virgulă)
        modalTags.innerHTML = "";
        const tagsArray = tags.split(",");
        tagsArray.forEach(tag => {
            const span = document.createElement("span");
            span.classList.add("tag-modal"); // Clasă CSS definită mai sus
            span.textContent = tag.trim();
            modalTags.appendChild(span);
        });

        // Afișăm modalul
        modal.classList.add("show");
    });
});

// 2. Închide modalul la click pe X
closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
});

// 3. Închide modalul la click în afara ferestrei (pe fundal)
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("show");
    }
});