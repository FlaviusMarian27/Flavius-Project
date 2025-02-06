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
