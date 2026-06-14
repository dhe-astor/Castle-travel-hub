document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navAnchors = document.querySelectorAll(".nav-links a");
    const typingElement = document.getElementById("typing");
    const enquiryForm = document.getElementById("enquiryForm");
    const formStatus = document.getElementById("formStatus");

    const setNavbarState = () => {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 60);
    };

    setNavbarState();
    window.addEventListener("scroll", setNavbarState);

    // Hamburger menu functionality
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            hamburger.classList.toggle("active", isOpen);
            hamburger.setAttribute("aria-expanded", String(isOpen));
        });

        navAnchors.forEach((anchor) => {
            anchor.addEventListener("click", () => {
                navLinks.classList.remove("active");
                hamburger.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });
    }

    // Typing animation
    if (typingElement) {
        const words = ["Kerala", "Backwaters", "Munnar", "Wayanad", "Beaches", "Culture"];
        let wordIndex = 0;

        setInterval(() => {
            wordIndex = (wordIndex + 1) % words.length;
            typingElement.textContent = words[wordIndex];
        }, 1800);
    }
// Active section navigation observer
    
    const sections = [...document.querySelectorAll("main section[id], footer[id]")];

    if (sections.length && navAnchors.length) {
        const activeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                navAnchors.forEach((anchor) => {
                    anchor.classList.toggle("active", anchor.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, {
            rootMargin: "-45% 0px -50% 0px",
            threshold: 0
        });

        sections.forEach((section) => activeObserver.observe(section));
    }
// Enquiry form handler
    
    if (enquiryForm && formStatus) {
        enquiryForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(enquiryForm);
            const name = String(formData.get("name") || "traveller").trim();
            const destination = String(formData.get("destination") || "Kerala").trim();

            formStatus.textContent = `Thanks ${name}. Your ${destination} trip request is ready. Please contact us on WhatsApp to confirm the details.`;
            enquiryForm.reset();
        });
    }

    setupGallery();
// Gallery functionality
});

function setupGallery() {
    const mainImage = document.getElementById("galleryMainImage");
    const prevImage = document.getElementById("galleryPrevImage");
    const nextImageElement = document.getElementById("galleryNextImage");
    const incomingImage = document.getElementById("galleryIncomingImage");
    const galleryTitle = document.getElementById("galleryTitle");
    const prevTitle = document.getElementById("galleryPrevTitle");
    const nextTitle = document.getElementById("galleryNextTitle");
    const incomingTitle = document.getElementById("galleryIncomingTitle");
    const galleryCounter = document.getElementById("galleryCounter");
    const thumbsContainer = document.getElementById("galleryThumbs");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const galleryStage = document.querySelector(".gallery-stage");

    if (!mainImage || !prevImage || !nextImageElement || !incomingImage || !galleryTitle || !prevTitle || !nextTitle || !incomingTitle || !galleryCounter || !thumbsContainer || !prevBtn || !nextBtn) {
        return;
    }

    const galleryImages = [
        { image: "/Images/gallery/kerala1.jpg", title: "Alleppey Backwaters" },
        { image: "/Images/gallery/kerala2.jpg", title: "Ashtamudi lake" },
        { image: "/Images/gallery/kerala3.jpg", title: "Alleppey" },
        { image: "/Images/gallery/kerala4.jpg", title: "Top Station View" },
        { image: "/Images/gallery/kerala5.jpg", title: "Kumbalangi" },
        { image: "/Images/gallery/kerala6.jpg", title: "Kadamakkudy island" },
        { image: "/Images/gallery/kerala7.jpg", title: "Kerala Village Life" },
        { image: "/Images/gallery/kerala8.jpg", title: "Silver cascade" },
        { image: "/Images/gallery/kerala9.jpg", title: "Tea Garden Roads" },
        { image: "/Images/gallery/kerala10.jpg", title: "Coastal Kerala" },
        { image: "/Images/gallery/kerala11.jpg", title: "Green Escapes" },
        { image: "/Images/gallery/kerala12.jpg", title: "Waterfront Views" },
        { image: "/Images/gallery/kerala13.jpg", title: "Kerala Culture" },
        { image: "/Images/gallery/kerala14.jpg", title: "Mountain Mist" },
        { image: "/Images/gallery/kerala15.jpg", title: "Scenic Drives" },
        { image: "/Images/gallery/kerala16.jpg", title: "Holiday Moments" },
        { image: "/Images/gallery/kerala17.jpg", title: "Nature Trails" }
    ];

    let currentIndex = 0;
    // Create gallery thumbnails
    let autoSlide;
    let isAnimating = false;

    // Render current image set
    
    const thumbButtons = [];

    const renderImageSet = (index) => {
        currentIndex = (index + galleryImages.length) % galleryImages.length;
        const previousItem = galleryImages[(currentIndex - 1 + galleryImages.length) % galleryImages.length];
        const currentItem = galleryImages[currentIndex];
        const nextItem = galleryImages[(currentIndex + 1) % galleryImages.length];
        const incomingItem = galleryImages[(currentIndex + 2) % galleryImages.length];

        prevImage.src = previousItem.image;
        prevImage.alt = previousItem.title;
        prevTitle.textContent = previousItem.title;

        mainImage.src = currentItem.image;
        mainImage.alt = currentItem.title;
        galleryTitle.textContent = currentItem.title;

        nextImageElement.src = nextItem.image;
        nextImageElement.alt = nextItem.title;
        nextTitle.textContent = nextItem.title;

        incomingImage.src = incomingItem.image;
        incomingImage.alt = "";
        incomingTitle.textContent = incomingItem.title;
    };

    // Set incoming image for animation
    const setIncomingImage = (targetIndex, direction) => {
        const incomingIndex = direction === "prev"
            ? targetIndex - 1
            : targetIndex + 1;
        const incomingItem = galleryImages[(incomingIndex + galleryImages.length) % galleryImages.length];

        incomingImage.src = incomingItem.image;
        incomingImage.alt = "";
        incomingTitle.textContent = incomingItem.title;
    };

    const showImage = (index, direction = "next", animate = true) => {
        if (isAnimating) return;

        const targetIndex = (index + galleryImages.length) % galleryImages.length;

        renderImageSet(targetIndex);
        setIncomingImage(targetIndex, direction);
    };

    const nextImage = () => showImage(currentIndex + 1, "next");
    const previousImage = () => showImage(currentIndex - 1, "prev");

    const startAutoSlide = () => {
        autoSlide = window.setInterval(nextImage, 4500);
    };

    const stopAutoSlide = () => {
        window.clearInterval(autoSlide);
    };

    const restartAutoSlide = () => {
        stopAutoSlide();
        startAutoSlide();
    };

    // Button event listeners
    nextBtn.addEventListener("click", () => {
        nextImage();
    });

    // Keyboard navigation
    prevBtn.addEventListener("click", () => {
        previousImage();
    });

    document.addEventListener("keydown", (event) => {
        const galleryIsVisible = document.querySelector("#gallery:hover, #gallery:focus-within");
        if (!galleryIsVisible) return;

        if (event.key === "ArrowRight") {
            nextImage();
        }

        if (event.key === "ArrowLeft") {
            previousImage();
        }
    });

    showImage(0, "next", false);
}
