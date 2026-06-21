/**
 * Castle Travel Hub - Main Interactive Script
 * Safe for multi-page execution (safeguards missing DOM elements).
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. SCROLL NAVBAR EFFECT
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    // 2. MOBILE HAMBURGER MENU
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            // Toggle hamburger icon between open (☰) and close (✕)
            hamburger.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove("active");
                hamburger.textContent = "☰";
            }
        });
    }

    // 3. ACTIVE NAVIGATION LINK HIGHLIGHTING
    const currentPath = window.location.pathname.split("/").pop();
    const navAnchors = document.querySelectorAll(".nav-links a");
    navAnchors.forEach(anchor => {
        const href = anchor.getAttribute("href");
        if (href === currentPath || (currentPath === "" && href === "index.html")) {
            anchor.classList.add("active");
        } else {
            anchor.classList.remove("active");
        }
    });

    // 4. TYPEWRITER EFFECT
    const typingElement = document.getElementById("typing");
    if (typingElement) {
        const words = ["Kerala", "Paradise", "Nature", "Culture", "Adventure", "Beauty"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 120;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at full word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before typing next word
            }

            setTimeout(type, typeSpeed);
        }
        type();
    }

    // 5. GALLERY CAROUSEL SLIDER (Home Page)
    const galleryImages = [
        { image: "/Images/gallery/kerala1.jpg", title: "📍 Munnar" },
        { image: "/Images/gallery/kerala2.jpg", title: "📍 Alleppey" },
        { image: "/Images/gallery/kerala3.jpg", title: "📍 Wayanad" },
        { image: "/Images/gallery/kerala4.jpg", title: "📍 Athirappilly" },
        { image: "/Images/gallery/kerala5.jpg", title: "📍 Varkala" },
        { image: "/Images/gallery/kerala6.jpg", title: "📍 Thekkady" }
    ];

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    if (img1 && img2 && img3 && nextBtn && prevBtn) {
        let currentIndex = 0;

        function updateCardSpan(parent, title) {
            let span = parent.querySelector("span");
            if (!span) {
                span = document.createElement("span");
                parent.appendChild(span);
            }
            span.textContent = title;
        }

        function updateGallery() {
            const total = galleryImages.length;
            const left = galleryImages[currentIndex % total];
            const center = galleryImages[(currentIndex + 1) % total];
            const right = galleryImages[(currentIndex + 2) % total];

            // Transition effect: fade out
            [img1, img2, img3].forEach(img => {
                img.style.opacity = "0.5";
                img.style.transform = "scale(0.95)";
            });

            setTimeout(() => {
                img1.src = left.image;
                img2.src = center.image;
                img3.src = right.image;

                updateCardSpan(img1.parentElement, left.title);
                updateCardSpan(img2.parentElement, center.title);
                updateCardSpan(img3.parentElement, right.title);

                [img1, img2, img3].forEach(img => {
                    img.style.opacity = "1";
                    img.style.transform = "";
                });
            }, 200);
        }

        // Event Listeners
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateGallery();
            resetAutoSlide();
        });

        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGallery();
            resetAutoSlide();
        });

        // Auto Slide
        let autoSlide = setInterval(() => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateGallery();
        }, 4000);

        function resetAutoSlide() {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                updateGallery();
            }, 4000);
        }

        // Pause on Hover
        const galleryShowcase = document.querySelector(".gallery-showcase");
        if (galleryShowcase) {
            galleryShowcase.addEventListener("mouseenter", () => clearInterval(autoSlide));
            galleryShowcase.addEventListener("mouseleave", () => resetAutoSlide());
        }

        // Initial Load
        updateGallery();
    }

    // 6. FILTER LOGIC (For Destinations & Gallery Pages)
    const filterButtons = document.querySelectorAll(".filter-btn");
    const filterItems = document.querySelectorAll(".filter-item");

    if (filterButtons.length > 0 && filterItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                // Toggle active class on buttons
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filterValue = btn.getAttribute("data-filter");

                filterItems.forEach(item => {
                    if (filterValue === "all" || item.classList.contains(filterValue)) {
                        item.style.display = "block";
                        setTimeout(() => {
                            item.style.opacity = "1";
                            item.style.transform = "scale(1)";
                        }, 50);
                    } else {
                        item.style.opacity = "0";
                        item.style.transform = "scale(0.8)";
                        setTimeout(() => {
                            item.style.display = "none";
                        }, 300);
                    }
                });
            });
        });
    }

    // 7. LIGHTBOX MODAL (For Gallery Page)
    const galleryGridImages = document.querySelectorAll(".gallery-grid-card img");
    if (galleryGridImages.length > 0) {
        // Create Lightbox Elements
        const lightbox = document.createElement("div");
        lightbox.id = "lightbox";
        lightbox.className = "lightbox";
        lightbox.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-content" src="" alt="Expanded View">
            <div class="lightbox-caption"></div>
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector(".lightbox-content");
        const lightboxCaption = lightbox.querySelector(".lightbox-caption");
        const lightboxClose = lightbox.querySelector(".lightbox-close");

        galleryGridImages.forEach(img => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", () => {
                lightbox.style.display = "flex";
                lightboxImg.src = img.src;
                const card = img.closest(".gallery-grid-card");
                const title = card ? card.querySelector("h3") : null;
                lightboxCaption.textContent = title ? title.textContent : (img.alt || "Kerala Beauty");
            });
        });

        // Close Lightbox
        const closeLightbox = () => {
            lightbox.style.display = "none";
        };

        lightboxClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeLightbox();
        });
    }
});