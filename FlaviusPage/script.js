//Go to top buttom
const goTopBtn = document.querySelector('.go-top-btn');

window. addEventListener('scroll', checkHeight)

function checkHeight() {
    if (window.scrollY > 20) {
        goTopBtn.classList.remove('hide');
        goTopBtn.style.display = "flex";
    } else {
        if (!goTopBtn.classList.contains('hide')) {
            goTopBtn.classList.add('hide');
            setTimeout(() => {
                goTopBtn.style.display = "none";
            }, 500);
        }
    }
}

goTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
})

//Copyright function
document.getElementById("year").textContent = new Date().getFullYear();

//functie scriere
document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.querySelector(".typewriter");
    const text = "Hi, I'm Flavius!";
    let index = 0;
    let isDeleting = false;

    function typeEffect() {
        if (!isDeleting) {
            textElement.textContent = text.substring(0, index++);
        } else {
            textElement.textContent = text.substring(0, index--);
        }

        if (index === text.length + 1) {
            isDeleting = true;
            setTimeout(typeEffect, 1000); // Pauză după scriere
        } else if (index === 0) {
            isDeleting = false;
            setTimeout(typeEffect, 500); // Pauză după ștergere
        } else {
            setTimeout(typeEffect, isDeleting ? 100 : 150); // Viteză tastare și ștergere
        }
    }

    typeEffect();
});

