
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 100) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});



const words = ["kerala", "Paradise", "nature", "culture", "adventure", "beauty"];

let wordIndex = 0;

const typingElement = document.getElementById("typing");

setInterval(() => {
    typingElement.textContent = words[wordIndex];
    wordIndex = (wordIndex + 1) % words.length;
}, 2000);


// Hamburger menu functionality 
document.addEventListener("DOMContentLoaded", () => {

    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

});