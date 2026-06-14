
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
        image: "/images/gallery/kerala1.jpg",
        title: "📍 Munnar"
    },
    {
        image: "/images/gallery/kerala2.jpg",
        title: "📍 Alleppey"
    },
    {
        image: "/images/gallery/kerala3.jpg",
        title: "📍 Wayanad"
    },
    {
        image: "/images/gallery/kerala4.jpg",
        title: "📍 Athirappilly"
    },
    {
        image: "/images/gallery/kerala5.jpg",
        title: "📍 Varkala"
    },
    {
        image: "/images/gallery/kerala6.jpg",
        title: "📍 Thekkady"
    }
];

let currentIndex = 0;

function updateGallery() {

    const total = galleryImages.length;

    const left = galleryImages[currentIndex % total];
    const center = galleryImages[(currentIndex + 1) % total];
    const right = galleryImages[(currentIndex + 2) % total];

    document.getElementById("img1").src = left.image;
    document.getElementById("img2").src = center.image;
    document.getElementById("img3").src = right.image;
}

// Next Button
document.getElementById("nextBtn").addEventListener("click", () => {
    currentIndex++;
    updateGallery();
});

// Previous Button
document.getElementById("prevBtn").addEventListener("click", () => {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = galleryImages.length - 1;
    }

    updateGallery();
});

// Initial Load
updateGallery();

// Auto Slide Every 4 Seconds
let autoSlide = setInterval(() => {
    currentIndex++;
    updateGallery();
}, 4000);

// Pause Auto Slide On Hover
const gallery = document.querySelector(".gallery-showcase");

if (gallery) {

    gallery.addEventListener("mouseenter", () => {
        clearInterval(autoSlide);
    });

    gallery.addEventListener("mouseleave", () => {

        autoSlide = setInterval(() => {
            currentIndex++;
            updateGallery();
        }, 4000);

    });

}