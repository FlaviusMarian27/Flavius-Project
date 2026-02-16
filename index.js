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