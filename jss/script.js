
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

// gallery showcase functionality
const galleryImages = [
    {
        image:"images/gallery/gallery1.jpg",
        title:"📍 Munnar"
    },
    {
        image:"images/gallery/gallery2.jpg",
        title:"📍 Alleppey"
    },
    {
        image:"images/gallery/gallery3.jpg",
        title:"📍 Wayanad"
    },
    {
        image:"images/gallery/gallery4.jpg",
        title:"📍 Athirappilly"
    },
    {
        image:"images/gallery/gallery5.jpg",
        title:"📍 Varkala"
    },
    {
        image:"images/gallery/gallery6.jpg",
        title:"📍 Thekkady"
    }
];

let currentIndex = 0;

function updateGallery(){

    const total = galleryImages.length;

    const left = galleryImages[currentIndex % total];
    const center = galleryImages[(currentIndex + 1) % total];
    const right = galleryImages[(currentIndex + 2) % total];

    document.getElementById("img1").src = left.image;
    document.getElementById("label1").textContent = left.title;

    document.getElementById("img2").src = center.image;
    document.getElementById("label2").textContent = center.title;

    document.getElementById("img3").src = right.image;
    document.getElementById("label3").textContent = right.title;
}

document.getElementById("nextBtn").addEventListener("click", () => {
    currentIndex++;
    updateGallery();
});

document.getElementById("prevBtn").addEventListener("click", () => {
    currentIndex--;
    if(currentIndex < 0){
        currentIndex = galleryImages.length - 1;
    }
    updateGallery();
});

updateGallery();