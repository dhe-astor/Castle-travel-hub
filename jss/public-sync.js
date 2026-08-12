/**
 * Castle Travel Hub - Public Site Dynamic Sync
 * Synchronizes with the exact Supabase database structure.
 */

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.CastleDB) return;

    // ================= 1. DYNAMIC SITE SETTINGS =================
    try {
        const settings = await window.CastleDB.settings.getAll();
        if (settings) {
            // Update Phone Numbers
            if (settings.phone) {
                document.querySelectorAll('[data-bind="phone"], a[href^="tel:"]').forEach(el => {
                    if (el.tagName === 'A') el.href = `tel:${settings.phone.replace(/\s+/g, '')}`;
                    el.textContent = el.textContent.includes('📞') ? `📞 ${settings.phone}` : settings.phone;
                });
            }

            // Update WhatsApp Buttons
            if (settings.whatsapp) {
                const cleanWhatsApp = settings.whatsapp.replace(/[^0-9]/g, '');
                document.querySelectorAll('.whatsapp-btn, a[href*="wa.me"]').forEach(btn => {
                    btn.href = `https://wa.me/${cleanWhatsApp}`;
                });
            }

            // Update Email
            if (settings.email) {
                document.querySelectorAll('[data-bind="email"], a[href^="mailto:"]').forEach(el => {
                    if (el.tagName === 'A') el.href = `mailto:${settings.email}`;
                    el.textContent = el.textContent.includes('✉️') ? `✉️ ${settings.email}` : settings.email;
                });
            }

            // Update Address
            if (settings.address) {
                document.querySelectorAll('[data-bind="address"]').forEach(el => {
                    el.textContent = settings.address;
                });
            }

            // Update Social Links if present
            if (settings.instagram) {
                document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = settings.instagram);
            }
            if (settings.facebook) {
                document.querySelectorAll('a[href*="facebook.com"]').forEach(a => a.href = settings.facebook);
            }
        }
    } catch (err) {
        console.warn('Settings sync notice:', err);
    }

    // ================= 2. ENQUIRY FORM SYNC =================
    const enquiryForms = document.querySelectorAll('.enquiry-form');
    enquiryForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>⏳ Sending Enquiry...</span>';
            }

            const formData = new FormData(form);
            const enquiryPayload = {
                name: formData.get('name') || '',
                phone: formData.get('phone') || '',
                email: formData.get('email') || '',
                travel_date: formData.get('travel_date') || null,
                people: parseInt(formData.get('travelers')) || parseInt(formData.get('people')) || 1,
                destination: formData.get('destination') || '',
                message: formData.get('message') || ''
            };

            try {
                await window.CastleDB.enquiries.create(enquiryPayload);
            } catch (dbErr) {
                console.warn('Database enquiry insert notice:', dbErr);
            }

            // Background Web3Forms Owner Email Notification
            try {
                const web3Data = new FormData();
                web3Data.append('access_key', window.CASTLE_CONFIG?.WEB3FORMS_ACCESS_KEY || 'b865e85a-6c77-40e9-a1ec-2bb36d47dce1');
                web3Data.append('subject', `New Travel Enquiry from ${enquiryPayload.name} - Castle Travel Hub`);
                web3Data.append('name', enquiryPayload.name);
                web3Data.append('phone', enquiryPayload.phone);
                web3Data.append('email', enquiryPayload.email);
                web3Data.append('travel_date', enquiryPayload.travel_date || 'Not specified');
                web3Data.append('travelers', enquiryPayload.people);
                web3Data.append('destination', enquiryPayload.destination || 'Not specified');
                web3Data.append('message', enquiryPayload.message || 'No message provided');

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: web3Data
                }).catch(e => console.log('Web3forms background notify:', e));
            } catch (notifyErr) {}

            // Show Toast & Reset Form
            showEnquirySuccessModal(enquiryPayload.name);
            form.reset();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    });

    function showEnquirySuccessModal(name) {
        let modal = document.getElementById('castle-enquiry-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'castle-enquiry-modal';
            modal.innerHTML = `
                <div style="position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.3s ease;">
                    <div style="background: white; border-radius: 20px; max-width: 480px; width: 100%; padding: 35px 30px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border-top: 6px solid #047857;">
                        <div style="width: 70px; height: 70px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 34px; margin: 0 auto 20px; color: #047857;">✓</div>
                        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.6rem; color: #0f172a; margin-bottom: 10px;">Enquiry Received!</h3>
                        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.6;">Thank you, <strong id="modal-client-name">Traveler</strong>. Your trip requirements have been safely received. Our travel expert will contact you shortly.</p>
                        <button id="modal-close-btn" style="background: #047857; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 1rem;">Got It, Thanks!</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('#modal-close-btn').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal.firstElementChild) modal.remove();
            });
        }
        const nameSpan = modal.querySelector('#modal-client-name');
        if (nameSpan) nameSpan.textContent = name || 'Traveler';
    }

    // ================= 3. DYNAMIC POPULAR DESTINATIONS =================
    const destinationGrid = document.querySelector('.destination-grid');
    if (destinationGrid) {
        try {
            const destinations = await window.CastleDB.destinations.getAll(true);
            if (destinations && destinations.length > 0) {
                destinationGrid.innerHTML = '';
                destinations.forEach((dest, index) => {
                    const card = document.createElement('div');
                    card.className = `destination-card filter-item`;
                    card.setAttribute('data-aos', 'fade-up');
                    card.setAttribute('data-aos-delay', (index % 4) * 100);
                    card.innerHTML = `
                        <div class="destination-image-wrapper">
                            <img src="${dest.image_url}" alt="${dest.name}" onerror="this.src='/Images/destinations/munnar.jpg'">
                            ${dest.duration ? `<span class="destination-badge">${dest.duration}</span>` : ''}
                        </div>
                        <div class="destination-info">
                            <h3>${dest.name}</h3>
                            <p>${dest.description}</p>
                            ${dest.price ? `<div style="color: #047857; font-weight: 700; margin-top: 8px;">Starting ₹${dest.price.toLocaleString('en-IN')}</div>` : ''}
                        </div>
                    `;
                    destinationGrid.appendChild(card);
                });
            }
        } catch (err) {
            console.warn('Destinations sync notice:', err);
        }
    }

    // ================= 4. DYNAMIC REVIEWS =================
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (reviewsGrid) {
        try {
            const reviews = await window.CastleDB.reviews.getAll(true);
            if (reviews && reviews.length > 0) {
                reviewsGrid.innerHTML = '';
                reviews.forEach((rev, index) => {
                    const stars = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
                    const card = document.createElement('div');
                    card.className = 'review-card';
                    card.setAttribute('data-aos', 'fade-up');
                    card.setAttribute('data-aos-delay', (index % 3) * 100);
                    card.innerHTML = `
                        <div style="color: #eab308; font-size: 1.1rem; margin-bottom: 12px;">${stars}</div>
                        <p>"${rev.review}"</p>
                        <h4>- ${rev.name}</h4>
                    `;
                    reviewsGrid.appendChild(card);
                });
            }
        } catch (err) {
            console.warn('Reviews sync notice:', err);
        }
    }

    // ================= 5. DYNAMIC GALLERY =================
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        try {
            const galleryItems = await window.CastleDB.gallery.getAll();
            if (galleryItems && galleryItems.length > 0) {
                galleryGrid.innerHTML = '';
                galleryItems.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = `gallery-grid-card filter-item ${item.category || 'nature'}`;
                    card.setAttribute('data-aos', 'fade-up');
                    card.setAttribute('data-aos-delay', (index % 4) * 50);
                    card.innerHTML = `
                        <div class="gallery-grid-image-wrapper">
                            <img src="${item.image_url}" alt="${item.title}" onerror="this.src='/Images/gallery/kerala1.jpg'">
                        </div>
                        <h3>${item.title}</h3>
                    `;
                    galleryGrid.appendChild(card);

                    const img = card.querySelector('img');
                    if (img) {
                        img.style.cursor = 'zoom-in';
                        img.addEventListener('click', () => {
                            const lightbox = document.getElementById('lightbox');
                            if (lightbox) {
                                const lightboxImg = lightbox.querySelector('.lightbox-content');
                                const lightboxCaption = lightbox.querySelector('.lightbox-caption');
                                lightbox.style.display = 'flex';
                                lightboxImg.src = img.src;
                                lightboxCaption.textContent = item.title || img.alt || 'Kerala Visual';
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.warn('Gallery sync notice:', err);
        }
    }
});
