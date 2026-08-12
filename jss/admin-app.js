/**
 * Castle Travel Hub - Main Admin Portal Controller
 * Synchronized with the user's exact Supabase schema.
 */

window.AdminApp = (function () {
    let currentEnquiries = [];
    let currentReviews = [];
    let currentGallery = [];
    let currentDestinations = [];
    let currentSettings = {};

    let confirmCallback = null;

    // Toast Notification
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.innerHTML = `<span>${type === 'error' ? '❌' : '✅'}</span> <div>${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Modal Helpers
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    function confirmDialog(title, message, callback) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        confirmCallback = callback;
        openModal('confirm-modal');
    }

    // ================= INITIALIZATION =================
    async function init() {
        const user = await window.CastleAuth.requireAuth();
        if (!user) return;

        const userEmailEl = document.getElementById('user-display-email');
        const userInitEl = document.getElementById('user-initial');
        if (userEmailEl) userEmailEl.textContent = user.email || 'Admin';
        if (userInitEl && user.email) userInitEl.textContent = user.email.charAt(0).toUpperCase();

        setupNavigation();
        setupEventListeners();
        await loadAllData();
        await checkAndDisplayDbStatus();
    }

    // Database Status Inspector
    async function checkAndDisplayDbStatus() {
        if (!window.CastleDB) return;
        try {
            const status = await window.CastleDB.checkDatabaseStatus();
            const statusContainer = document.getElementById('db-health-banner');
            if (statusContainer) {
                if (status.isConfigured && status.allTablesExist) {
                    statusContainer.innerHTML = `
                        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px 18px; border-radius: var(--radius-sm); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                            <div>🟢 <strong>Supabase Connected:</strong> Tables detected and synced (Enquiries, Destinations, Gallery, Reviews, Settings).</div>
                        </div>
                    `;
                } else if (status.isConfigured) {
                    statusContainer.innerHTML = `
                        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px 18px; border-radius: var(--radius-sm); margin-bottom: 20px;">
                            <div>🟢 <strong>Supabase Connected:</strong> Database synced with smart table detection.</div>
                        </div>
                    `;
                }
            }
        } catch (e) {
            console.warn('DB check error:', e);
        }
    }

    // ================= NAVIGATION =================
    function setupNavigation() {
        const links = document.querySelectorAll('.sidebar-menu-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                switchTab(tab);
                document.getElementById('adminSidebar')?.classList.remove('open');
            });
        });

        const toggle = document.getElementById('sidebarToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById('adminSidebar')?.classList.toggle('open');
            });
        }

        document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
            window.CastleAuth.logout();
        });

        document.getElementById('confirm-proceed-btn')?.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            closeModal('confirm-modal');
        });
    }

    function switchTab(tabName) {
        document.querySelectorAll('.sidebar-menu-link').forEach(l => {
            l.classList.toggle('active', l.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`section-${tabName}`);
        if (targetSection) targetSection.classList.add('active');

        const titleMap = {
            dashboard: 'Overview Dashboard',
            enquiries: 'Enquiries Management',
            reviews: 'Reviews & Feedback',
            gallery: 'Photo Gallery Management',
            destinations: 'Destinations Management',
            settings: 'Website Settings & Configuration'
        };
        const titleEl = document.getElementById('pageTitleHeading');
        if (titleEl) titleEl.textContent = titleMap[tabName] || 'Admin Dashboard';
    }

    // ================= DATA LOADING =================
    async function loadAllData() {
        try {
            await Promise.all([
                loadEnquiries(),
                loadReviews(),
                loadGallery(),
                loadDestinations(),
                loadSettings()
            ]);
            updateDashboardStats();
        } catch (err) {
            console.error('Data load notice:', err);
        }
    }

    function updateDashboardStats() {
        const totalEnq = Array.isArray(currentEnquiries) ? currentEnquiries.length : 0;
        const unreadEnq = Array.isArray(currentEnquiries) ? currentEnquiries.filter(e => e.status === 'new' || e.status === 'unread').length : 0;
        const totalRev = Array.isArray(currentReviews) ? currentReviews.length : 0;
        const totalGal = Array.isArray(currentGallery) ? currentGallery.length : 0;
        const totalDest = Array.isArray(currentDestinations) ? currentDestinations.length : 0;

        document.getElementById('stat-total-enquiries').textContent = totalEnq;
        document.getElementById('stat-unread-enquiries').textContent = unreadEnq;
        document.getElementById('stat-total-reviews').textContent = totalRev;
        document.getElementById('stat-total-gallery').textContent = totalGal;
        document.getElementById('stat-total-destinations').textContent = totalDest;

        const badge = document.getElementById('sidebar-unread-badge');
        if (badge) {
            badge.textContent = unreadEnq;
            badge.style.display = unreadEnq > 0 ? 'inline-block' : 'none';
        }

        renderDashboardRecentEnquiries();
    }

    // ================= ENQUIRIES =================
    async function loadEnquiries() {
        const data = await window.CastleDB.enquiries.getAll();
        currentEnquiries = Array.isArray(data) ? data : [];
        renderEnquiriesTable(currentEnquiries);
    }

    function renderDashboardRecentEnquiries() {
        const tbody = document.getElementById('dashboard-recent-enquiries-table');
        if (!tbody) return;
        const recent = Array.isArray(currentEnquiries) ? currentEnquiries.slice(0, 5) : [];

        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted);">No enquiries yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = recent.map(enq => {
            const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
            const badgeClass = (enq.status === 'new' || enq.status === 'unread') ? 'badge-unread' : 'badge-completed';
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td><strong>${escapeHtml(enq.name)}</strong></td>
                    <td>${escapeHtml(enq.phone)}</td>
                    <td>${escapeHtml(enq.destination || 'General')}</td>
                    <td><span class="badge ${badgeClass}">${enq.status || 'new'}</span></td>
                    <td>
                        <button class="action-btn" onclick="window.AdminApp.viewEnquiry('${enq.id}')">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderEnquiriesTable(list) {
        const tbody = document.getElementById('enquiries-table-body');
        if (!tbody) return;

        if (!Array.isArray(list) || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 30px;">No matching enquiries found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(enq => {
            const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
            const travelDateStr = enq.travel_date ? new Date(enq.travel_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible';
            const badgeClass = (enq.status === 'new' || enq.status === 'unread') ? 'badge-unread' : 'badge-completed';

            return `
                <tr>
                    <td style="font-size: 0.85rem; color: var(--admin-text-muted);">${dateStr}</td>
                    <td>
                        <div style="font-weight: 700;">${escapeHtml(enq.name)}</div>
                    </td>
                    <td>
                        <div>📞 <a href="tel:${escapeHtml(enq.phone)}" style="color: var(--admin-primary);">${escapeHtml(enq.phone)}</a></div>
                        <div style="font-size: 0.8rem; color: var(--admin-text-muted);">✉️ ${escapeHtml(enq.email)}</div>
                    </td>
                    <td>
                        <div><strong>${escapeHtml(enq.destination || 'Kerala Tour')}</strong></div>
                        <div style="font-size: 0.8rem; color: var(--admin-text-muted);">👥 ${enq.people || enq.travelers || 1} People</div>
                    </td>
                    <td style="font-size: 0.85rem;">${travelDateStr}</td>
                    <td>
                        <span class="badge ${badgeClass}">${enq.status || 'new'}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn" onclick="window.AdminApp.viewEnquiry('${enq.id}')">View Details</button>
                            <button class="action-btn delete" onclick="window.AdminApp.deleteEnquiry('${enq.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function viewEnquiry(id) {
        const enq = currentEnquiries.find(e => e.id === id);
        if (!enq) return;

        const body = document.getElementById('enquiry-modal-body');
        const dateStr = enq.created_at ? new Date(enq.created_at).toLocaleString() : '-';

        body.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
                <div><strong>Customer:</strong> ${escapeHtml(enq.name)}</div>
                <div><strong>Received:</strong> ${dateStr}</div>
                <div><strong>Phone:</strong> <a href="tel:${escapeHtml(enq.phone)}" style="color: var(--admin-primary);">${escapeHtml(enq.phone)}</a></div>
                <div><strong>Email:</strong> <a href="mailto:${escapeHtml(enq.email)}" style="color: var(--admin-primary);">${escapeHtml(enq.email)}</a></div>
                <div><strong>Destination:</strong> ${escapeHtml(enq.destination || 'General')}</div>
                <div><strong>Number of People:</strong> ${enq.people || enq.travelers || 1} Person(s)</div>
                <div><strong>Travel Date:</strong> ${enq.travel_date || 'Flexible'}</div>
                <div>
                    <strong>Status:</strong>
                    <select id="modal-enquiry-status" class="form-control" style="padding: 4px 8px; display: inline-block; width: auto; margin-left: 6px;">
                        <option value="new" ${enq.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="read" ${enq.status === 'read' ? 'selected' : ''}>Read</option>
                        <option value="contacted" ${enq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="completed" ${enq.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--admin-border); margin-bottom: 16px;">
                <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-text-muted);">CLIENT MESSAGE / REQUIREMENTS:</div>
                <p style="white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(enq.message || 'No additional message.')}</p>
            </div>
        `;

        document.getElementById('modal-enquiry-status').addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            await window.CastleDB.enquiries.updateStatus(enq.id, newStatus);
            showToast('Enquiry status updated');
            await loadEnquiries();
            updateDashboardStats();
        });

        const deleteBtn = document.getElementById('enquiry-modal-delete-btn');
        deleteBtn.onclick = () => {
            closeModal('enquiry-modal');
            deleteEnquiry(enq.id);
        };

        if (enq.status === 'new' || enq.status === 'unread') {
            window.CastleDB.enquiries.updateStatus(enq.id, 'read').then(() => {
                loadEnquiries();
                updateDashboardStats();
            });
        }

        openModal('enquiry-modal');
    }

    function deleteEnquiry(id) {
        confirmDialog('Delete Enquiry', 'Are you sure you want to permanently delete this customer enquiry?', async () => {
            await window.CastleDB.enquiries.delete(id);
            showToast('Enquiry deleted successfully');
            await loadEnquiries();
            updateDashboardStats();
        });
    }

    // ================= REVIEWS =================
    async function loadReviews() {
        const data = await window.CastleDB.reviews.getAll(false);
        currentReviews = Array.isArray(data) ? data : [];
        renderReviewsTable(currentReviews);
    }

    function renderReviewsTable(list) {
        const tbody = document.getElementById('reviews-table-body');
        if (!tbody) return;

        if (!Array.isArray(list) || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 30px;">No reviews found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(rev => {
            const stars = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
            return `
                <tr>
                    <td><strong>${escapeHtml(rev.name)}</strong></td>
                    <td>Verified Guest</td>
                    <td style="color: #eab308; font-size: 1.1rem;">${stars}</td>
                    <td style="max-width: 320px; font-size: 0.85rem;">"${escapeHtml(rev.review)}"</td>
                    <td>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" ${rev.approved ? 'checked' : ''} onchange="window.AdminApp.toggleReviewApproval('${rev.id}', this.checked)">
                            <span class="badge ${rev.approved ? 'badge-active' : 'badge-inactive'}">${rev.approved ? 'Approved' : 'Pending'}</span>
                        </label>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn" onclick="window.AdminApp.showEditReviewModal('${rev.id}')">Edit</button>
                            <button class="action-btn delete" onclick="window.AdminApp.deleteReview('${rev.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function showAddReviewModal() {
        document.getElementById('review-id').value = '';
        document.getElementById('review-name').value = '';
        document.getElementById('review-rating').value = '5';
        document.getElementById('review-comment').value = '';
        document.getElementById('review-approved').checked = true;
        document.getElementById('review-modal-title').textContent = 'Add Customer Review';
        openModal('review-modal');
    }

    function showEditReviewModal(id) {
        const rev = currentReviews.find(r => r.id === id);
        if (!rev) return;
        document.getElementById('review-id').value = rev.id;
        document.getElementById('review-name').value = rev.name;
        document.getElementById('review-rating').value = rev.rating || 5;
        document.getElementById('review-comment').value = rev.review || '';
        document.getElementById('review-approved').checked = Boolean(rev.approved);
        document.getElementById('review-modal-title').textContent = 'Edit Review';
        openModal('review-modal');
    }

    async function toggleReviewApproval(id, approved) {
        await window.CastleDB.reviews.toggleApproval(id, approved);
        showToast(`Review ${approved ? 'approved for public display' : 'hidden from public display'}`);
        await loadReviews();
        updateDashboardStats();
    }

    function deleteReview(id) {
        confirmDialog('Delete Review', 'Are you sure you want to delete this customer review?', async () => {
            await window.CastleDB.reviews.delete(id);
            showToast('Review deleted successfully');
            await loadReviews();
            updateDashboardStats();
        });
    }

    // ================= GALLERY =================
    async function loadGallery() {
        const data = await window.CastleDB.gallery.getAll();
        currentGallery = Array.isArray(data) ? data : [];
        renderGalleryCards(currentGallery);
    }

    function renderGalleryCards(list) {
        const container = document.getElementById('gallery-cards-container');
        if (!container) return;

        if (!Array.isArray(list) || list.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted); padding: 40px;">No gallery photos yet. Click "+ Upload New Photo" to add one.</div>`;
            return;
        }

        container.innerHTML = list.map(item => `
            <div class="admin-card-item">
                <img src="${item.image_url}" alt="${escapeHtml(item.title)}" class="admin-card-img" onerror="this.src='/Images/gallery/kerala1.jpg'">
                <div class="admin-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <h4 class="admin-card-title">${escapeHtml(item.title)}</h4>
                        <span class="badge badge-active">${item.category || 'General'}</span>
                    </div>
                    <p class="admin-card-text">${escapeHtml(item.description || 'Kerala Visual')}</p>
                    <div class="admin-card-footer">
                        <span style="font-size: 0.75rem; color: var(--admin-text-muted);">${item.category || ''}</span>
                        <div class="table-actions">
                            <button class="action-btn" onclick="window.AdminApp.showEditGalleryModal('${item.id}')">Edit</button>
                            <button class="action-btn delete" onclick="window.AdminApp.deleteGallery('${item.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function showUploadGalleryModal() {
        document.getElementById('gallery-id').value = '';
        document.getElementById('gallery-title').value = '';
        document.getElementById('gallery-category').value = 'nature';
        document.getElementById('gallery-file-input').value = '';
        document.getElementById('gallery-image-url').value = '';
        document.getElementById('gallery-description').value = '';
        document.getElementById('gallery-img-preview').style.display = 'none';
        document.getElementById('gallery-modal-title').textContent = 'Upload Gallery Photo';
        openModal('gallery-modal');
    }

    function showEditGalleryModal(id) {
        const item = currentGallery.find(g => g.id === id);
        if (!item) return;
        document.getElementById('gallery-id').value = item.id;
        document.getElementById('gallery-title').value = item.title;
        document.getElementById('gallery-category').value = item.category || 'nature';
        document.getElementById('gallery-image-url').value = item.image_url;
        document.getElementById('gallery-description').value = item.description || '';
        const preview = document.getElementById('gallery-img-preview');
        preview.src = item.image_url;
        preview.style.display = 'block';
        document.getElementById('gallery-modal-title').textContent = 'Edit Photo Information';
        openModal('gallery-modal');
    }

    function deleteGallery(id) {
        confirmDialog('Delete Photo', 'Are you sure you want to remove this photo from the gallery?', async () => {
            await window.CastleDB.gallery.delete(id);
            showToast('Gallery photo removed');
            await loadGallery();
            updateDashboardStats();
        });
    }

    // ================= DESTINATIONS =================
    async function loadDestinations() {
        const data = await window.CastleDB.destinations.getAll(false);
        currentDestinations = Array.isArray(data) ? data : [];
        renderDestinationsCards(currentDestinations);
    }

    function renderDestinationsCards(list) {
        const container = document.getElementById('destinations-cards-container');
        if (!container) return;

        if (!Array.isArray(list) || list.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--admin-text-muted); padding: 40px;">No destinations added yet.</div>`;
            return;
        }

        container.innerHTML = list.map(dest => `
            <div class="admin-card-item">
                <img src="${dest.image_url}" alt="${escapeHtml(dest.name)}" class="admin-card-img" onerror="this.src='/Images/destinations/munnar.jpg'">
                <div class="admin-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <h4 class="admin-card-title">${escapeHtml(dest.name)}</h4>
                        ${dest.duration ? `<span class="badge badge-active">${escapeHtml(dest.duration)}</span>` : ''}
                    </div>
                    ${dest.price ? `<div style="font-size: 0.9rem; color: var(--admin-primary); font-weight: 700; margin-bottom: 8px;">₹${parseFloat(dest.price).toLocaleString('en-IN')}</div>` : ''}
                    <p class="admin-card-text">${escapeHtml(dest.description)}</p>
                    <div class="admin-card-footer">
                        <span class="badge ${dest.visible ? 'badge-active' : 'badge-inactive'}">${dest.visible ? 'Visible' : 'Hidden'}</span>
                        <div class="table-actions">
                            <button class="action-btn" onclick="window.AdminApp.showEditDestinationModal('${dest.id}')">Edit</button>
                            <button class="action-btn delete" onclick="window.AdminApp.deleteDestination('${dest.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function showAddDestinationModal() {
        document.getElementById('destination-id').value = '';
        document.getElementById('destination-name').value = '';
        document.getElementById('destination-price').value = '';
        document.getElementById('destination-duration').value = '';
        document.getElementById('destination-file-input').value = '';
        document.getElementById('destination-image-url').value = '';
        document.getElementById('destination-description').value = '';
        document.getElementById('destination-active').checked = true;
        document.getElementById('destination-img-preview').style.display = 'none';
        document.getElementById('destination-modal-title').textContent = 'Add Destination';
        openModal('destination-modal');
    }

    function showEditDestinationModal(id) {
        const dest = currentDestinations.find(d => d.id === id);
        if (!dest) return;
        document.getElementById('destination-id').value = dest.id;
        document.getElementById('destination-name').value = dest.name;
        document.getElementById('destination-price').value = dest.price || '';
        document.getElementById('destination-duration').value = dest.duration || '';
        document.getElementById('destination-image-url').value = dest.image_url;
        document.getElementById('destination-description').value = dest.description;
        document.getElementById('destination-active').checked = Boolean(dest.visible);
        const preview = document.getElementById('destination-img-preview');
        preview.src = dest.image_url;
        preview.style.display = 'block';
        document.getElementById('destination-modal-title').textContent = 'Edit Destination';
        openModal('destination-modal');
    }

    function deleteDestination(id) {
        confirmDialog('Delete Destination', 'Are you sure you want to delete this destination from the website?', async () => {
            await window.CastleDB.destinations.delete(id);
            showToast('Destination deleted');
            await loadDestinations();
            updateDashboardStats();
        });
    }

    // ================= SETTINGS =================
    async function loadSettings() {
        currentSettings = await window.CastleDB.settings.getAll();
        if (currentSettings && typeof currentSettings === 'object') {
            for (const [k, v] of Object.entries(currentSettings)) {
                const el = document.getElementById(`setting-${k}`);
                if (el) el.value = v;
            }
        }

        const urlEl = document.getElementById('setting-supabase_url');
        const keyEl = document.getElementById('setting-supabase_anon_key');
        if (urlEl) urlEl.value = window.CASTLE_CONFIG?.SUPABASE_URL || '';
        if (keyEl) keyEl.value = window.CASTLE_CONFIG?.SUPABASE_ANON_KEY || '';
    }

    // ================= EVENT LISTENERS =================
    function setupEventListeners() {
        // Enquiries search
        document.getElementById('enquiry-search-input')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = currentEnquiries.filter(enq => 
                (enq.name && enq.name.toLowerCase().includes(query)) ||
                (enq.phone && enq.phone.includes(query)) ||
                (enq.email && enq.email.toLowerCase().includes(query)) ||
                (enq.destination && enq.destination.toLowerCase().includes(query))
            );
            renderEnquiriesTable(filtered);
        });

        // Enquiries filter buttons
        document.querySelectorAll('[data-enquiry-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-enquiry-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-enquiry-filter');
                if (filter === 'all') {
                    renderEnquiriesTable(currentEnquiries);
                } else {
                    renderEnquiriesTable(currentEnquiries.filter(e => e.status === filter));
                }
            });
        });

        // Gallery filter buttons
        document.querySelectorAll('[data-gallery-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-gallery-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.getAttribute('data-gallery-filter');
                if (cat === 'all') {
                    renderGalleryCards(currentGallery);
                } else {
                    renderGalleryCards(currentGallery.filter(g => g.category === cat));
                }
            });
        });

        // Review Form Submit
        document.getElementById('review-modal-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('review-id').value;
            const payload = {
                name: document.getElementById('review-name').value.trim(),
                rating: parseInt(document.getElementById('review-rating').value) || 5,
                review: document.getElementById('review-comment').value.trim(),
                approved: document.getElementById('review-approved').checked
            };

            if (id) {
                await window.CastleDB.reviews.update(id, payload);
                showToast('Review updated successfully');
            } else {
                await window.CastleDB.reviews.create(payload);
                showToast('Review added successfully');
            }
            closeModal('review-modal');
            await loadReviews();
            updateDashboardStats();
        });

        // File Input Preview Handlers
        setupImageUploadPreview('gallery-file-input', 'gallery-image-url', 'gallery-img-preview');
        setupImageUploadPreview('destination-file-input', 'destination-image-url', 'destination-img-preview');

        // Gallery Form Submit
        document.getElementById('gallery-modal-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('gallery-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const id = document.getElementById('gallery-id').value;
            let imageUrl = document.getElementById('gallery-image-url').value.trim();
            const fileInput = document.getElementById('gallery-file-input');

            try {
                if (fileInput.files.length > 0) {
                    imageUrl = await window.CastleDB.storage.uploadImage(fileInput.files[0], 'gallery');
                }

                if (!imageUrl) {
                    throw new Error('Please select an image file or provide an image URL.');
                }

                const payload = {
                    title: document.getElementById('gallery-title').value.trim(),
                    category: document.getElementById('gallery-category').value,
                    image_url: imageUrl,
                    description: document.getElementById('gallery-description').value.trim()
                };

                if (id) {
                    await window.CastleDB.gallery.update(id, payload);
                    showToast('Gallery photo updated');
                } else {
                    await window.CastleDB.gallery.create(payload);
                    showToast('Photo uploaded to gallery');
                }
                closeModal('gallery-modal');
                await loadGallery();
                updateDashboardStats();
            } catch (err) {
                showToast(err.message || 'Failed to save photo', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Upload & Save';
            }
        });

        // Destination Form Submit
        document.getElementById('destination-modal-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('destination-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const id = document.getElementById('destination-id').value;
            let imageUrl = document.getElementById('destination-image-url').value.trim();
            const fileInput = document.getElementById('destination-file-input');

            try {
                if (fileInput.files.length > 0) {
                    imageUrl = await window.CastleDB.storage.uploadImage(fileInput.files[0], 'destinations');
                }

                if (!imageUrl) {
                    throw new Error('Please select an image file or provide an image URL.');
                }

                const payload = {
                    name: document.getElementById('destination-name').value.trim(),
                    description: document.getElementById('destination-description').value.trim(),
                    image_url: imageUrl,
                    price: document.getElementById('destination-price').value ? parseFloat(document.getElementById('destination-price').value) : null,
                    duration: document.getElementById('destination-duration').value.trim() || null,
                    visible: document.getElementById('destination-active').checked
                };

                if (id) {
                    await window.CastleDB.destinations.update(id, payload);
                    showToast('Destination updated');
                } else {
                    await window.CastleDB.destinations.create(payload);
                    showToast('Destination added to website');
                }
                closeModal('destination-modal');
                await loadDestinations();
                updateDashboardStats();
            } catch (err) {
                showToast(err.message || 'Failed to save destination', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Destination';
            }
        });

        // Settings Form Submit
        document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const settingsPayload = {
                business_name: document.getElementById('setting-business_name').value.trim(),
                phone: document.getElementById('setting-phone').value.trim(),
                whatsapp: document.getElementById('setting-whatsapp').value.trim(),
                email: document.getElementById('setting-email').value.trim(),
                address: document.getElementById('setting-address').value.trim(),
                instagram: document.getElementById('setting-instagram').value.trim(),
                facebook: document.getElementById('setting-facebook').value.trim()
            };

            await window.CastleDB.settings.update(settingsPayload);

            const newUrl = document.getElementById('setting-supabase_url').value.trim();
            const newKey = document.getElementById('setting-supabase_anon_key').value.trim();
            if (newUrl) localStorage.setItem('castle_supabase_url', newUrl);
            if (newKey) localStorage.setItem('castle_supabase_anon_key', newKey);

            showToast('Settings saved successfully!');
            await checkAndDisplayDbStatus();
        });
    }

    function setupImageUploadPreview(fileInputId, urlInputId, previewImgId) {
        const fileInput = document.getElementById(fileInputId);
        const urlInput = document.getElementById(urlInputId);
        const preview = document.getElementById(previewImgId);

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        preview.src = re.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (urlInput) {
            urlInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    preview.src = e.target.value.trim();
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                }
            });
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        switchTab,
        openModal,
        closeModal,
        viewEnquiry,
        deleteEnquiry,
        showAddReviewModal,
        showEditReviewModal,
        toggleReviewApproval,
        deleteReview,
        showUploadGalleryModal,
        showEditGalleryModal,
        deleteGallery,
        showAddDestinationModal,
        showEditDestinationModal,
        deleteDestination
    };
})();
