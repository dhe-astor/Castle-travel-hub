/**
 * Castle Travel Hub - Supabase Client & Unified Data Layer
 * Exactly aligned with the user's Supabase tables:
 * 1. "Enquiries table" / enquiries (id, name, email, phone, destination, travel_date, people, message, status, created_at)
 * 2. destinations (id, name, description, image_url, price, duration, visible, created_at)
 * 3. gallery (id, title, description, image_url, category, created_at)
 * 4. reviews (id, name, rating, review, image_url, approved, created_at)
 * 5. website_settings (id, business_name, phone, email, whatsapp, address, instagram, facebook, created_at)
 */

(function () {
    // Initial Seed Data for fallback / offline storage
    const INITIAL_SEED = {
        settings: {
            business_name: 'Castle Travel Hub',
            phone: '+9539415251',
            email: 'info@castletravelhub.com',
            whatsapp: '919539415251',
            address: 'puthenpurakal (h) irumalapady',
            instagram: 'https://instagram.com/castletravelhub',
            facebook: 'https://facebook.com/castletravelhub'
        },
        destinations: [
            {
                id: 'dest-1',
                name: 'Munnar',
                description: 'Situated at 1,600m above sea level, Munnar features sprawling green tea estates, clean mountain streams, and the majestic Anamudi peak.',
                image_url: '/Images/destinations/munnar.jpg',
                price: 14999,
                duration: '5 Days / 4 Nights',
                visible: true
            },
            {
                id: 'dest-2',
                name: 'Alleppey (Alappuzha)',
                description: 'Renowned for houseboat cruises along the tranquil backwaters, lush paddy fields, and iconic coconut tree fringed shorelines.',
                image_url: '/Images/destinations/alleppey.jpg',
                price: 22500,
                duration: '6 Days / 5 Nights',
                visible: true
            },
            {
                id: 'dest-3',
                name: 'Wayanad',
                description: 'A bio-diverse hill district offering spiced plantations, waterfalls, ancient Edakkal caves, wild elephant spotting, and peak trekking.',
                image_url: '/Images/destinations/wayanad.jpg',
                price: 11999,
                duration: '4 Days / 3 Nights',
                visible: true
            },
            {
                id: 'dest-4',
                name: 'Kovalam',
                description: 'Famous for its shallow waters, low tidal currents, and three adjacent crescent beaches separated by rocky outcroppings.',
                image_url: '/Images/destinations/kovalam.jpg',
                price: 16500,
                duration: '4 Days / 3 Nights',
                visible: true
            }
        ],
        reviews: [
            {
                id: 'rev-1',
                name: 'Rahul, Mumbai',
                rating: 5,
                review: 'Excellent customer service! The Innova Crysta was spotless, and the driver was friendly and extremely helpful with navigating Munnar\'s mountain curves.',
                image_url: '',
                approved: true,
                created_at: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
                id: 'rev-2',
                name: 'Sarah, UK',
                rating: 5,
                review: 'Booking our family trip through Castle Travel Hub was seamless. The houseboat experience in Alleppey they recommended was the highlight of our vacation.',
                image_url: '',
                approved: true,
                created_at: new Date(Date.now() - 86400000 * 12).toISOString()
            },
            {
                id: 'rev-3',
                name: 'Ahmed, UAE',
                rating: 5,
                review: 'Outstanding 24/7 client support. We requested a last-minute routing adjustment on the third day, and they coordinated it in under an hour.',
                image_url: '',
                approved: true,
                created_at: new Date(Date.now() - 86400000 * 20).toISOString()
            }
        ],
        gallery: [
            { id: 'gal-1', title: 'Munnar Misty Hills', description: 'Scenic Munnar Tea Hills', category: 'mountains', image_url: '/Images/gallery/kerala1.jpg' },
            { id: 'gal-2', title: 'Vembanad Lake Side', description: 'Lake Backwaters in Kumarakom', category: 'backwaters', image_url: '/Images/gallery/kerala2.jpg' },
            { id: 'gal-3', title: 'Wayanad Western Ghats', description: 'Lush Forest Roads', category: 'nature', image_url: '/Images/gallery/kerala3.jpg' },
            { id: 'gal-4', title: 'Athirappilly Waterfall', description: 'Majestic Waterfall', category: 'nature', image_url: '/Images/gallery/kerala4.jpg' },
            { id: 'gal-5', title: 'Varkala Beach Cliffs', description: 'Red Cliff Beach', category: 'beach', image_url: '/Images/gallery/kerala5.jpg' },
            { id: 'gal-6', title: 'Periyar Forest Boating', description: 'Lake Safari in Thekkady', category: 'nature', image_url: '/Images/gallery/kerala6.jpg' },
            { id: 'gal-7', title: 'Traditional Kathakali Art', description: 'Heritage Dance Art', category: 'culture', image_url: '/Images/gallery/kerala7.jpg' },
            { id: 'gal-8', title: 'Cruising Alleppey Backwaters', description: 'Luxury Houseboat Cruise', category: 'backwaters', image_url: '/Images/gallery/kerala8.jpg' }
        ],
        enquiries: [
            {
                id: 'enq-1',
                name: 'Kiran Sharma',
                email: 'kiran.sharma@example.com',
                phone: '+91 98765 43210',
                destination: 'Munnar & Alleppey',
                travel_date: '2026-09-15',
                people: 4,
                message: 'Looking for a 5-day tour package with Innova Crysta for family including elderly parents.',
                status: 'new',
                created_at: new Date(Date.now() - 3600000 * 2).toISOString()
            }
        ]
    };

    // Helper for Local Storage Fallback
    const StorageEngine = {
        get(key) {
            const raw = localStorage.getItem('castle_data_' + key);
            if (!raw) {
                if (INITIAL_SEED[key]) {
                    this.set(key, INITIAL_SEED[key]);
                    return JSON.parse(JSON.stringify(INITIAL_SEED[key]));
                }
                return key === 'settings' ? {} : [];
            }
            try {
                return JSON.parse(raw);
            } catch (e) {
                return key === 'settings' ? {} : [];
            }
        },
        set(key, val) {
            localStorage.setItem('castle_data_' + key, JSON.stringify(val));
        }
    };

    // Initialize Supabase JS Client if library is loaded and keys exist
    let supabaseClient = null;
    if (window.supabase && window.CASTLE_CONFIG && window.CASTLE_CONFIG.isLiveConfigured()) {
        try {
            supabaseClient = window.supabase.createClient(
                window.CASTLE_CONFIG.SUPABASE_URL,
                window.CASTLE_CONFIG.SUPABASE_ANON_KEY
            );
            console.log('⚡ Castle Supabase Client connected in LIVE mode to:', window.CASTLE_CONFIG.SUPABASE_URL);
        } catch (e) {
            console.warn('Supabase initialization failed, running in fallback mode:', e);
        }
    } else {
        console.log('⚡ Castle Client running in LOCAL/DEMO mode (Storage Ready)');
    }

    // Helper: query multiple candidate table names (handles "Enquiries table" or "enquiries")
    async function queryTable(candidates, queryFn) {
        if (!supabaseClient) return null;
        for (const tableName of candidates) {
            try {
                const query = supabaseClient.from(tableName);
                const result = await queryFn(query, tableName);
                if (result && !result.error) {
                    return { data: result.data, table: tableName, error: null };
                }
            } catch (e) {
                // Continue to next candidate
            }
        }
        return null;
    }

    // Table candidate lists
    const ENQUIRY_TABLES = ['Enquiries table', 'enquiries', 'enquiry', 'Enquiries'];
    const DESTINATION_TABLES = ['destinations', 'destination', 'Destinations'];
    const GALLERY_TABLES = ['gallery', 'galleries', 'Gallery'];
    const REVIEWS_TABLES = ['reviews', 'review', 'Reviews'];
    const SETTINGS_TABLES = ['website_settings', 'site_settings', 'settings'];

    // Unified API Object
    window.CastleDB = {
        isLive: () => Boolean(supabaseClient),
        client: supabaseClient,

        // ================= DATABASE HEALTH CHECK =================
        async checkDatabaseStatus() {
            if (!supabaseClient) {
                return { isConfigured: false, message: 'Running in Local Storage mode (Supabase not configured)' };
            }

            const tablesToCheck = {
                'Enquiries': ENQUIRY_TABLES,
                'Destinations': DESTINATION_TABLES,
                'Gallery': GALLERY_TABLES,
                'Reviews': REVIEWS_TABLES,
                'Website Settings': SETTINGS_TABLES
            };

            const detected = {};
            let allOk = true;

            for (const [label, candidates] of Object.entries(tablesToCheck)) {
                let found = null;
                for (const t of candidates) {
                    try {
                        const { error } = await supabaseClient.from(t).select('*', { count: 'exact', head: true });
                        if (!error) {
                            found = t;
                            break;
                        }
                    } catch (e) {}
                }
                detected[label] = found;
                if (!found) allOk = false;
            }

            return { isConfigured: true, detected, allTablesExist: allOk };
        },

        // ================= AUTHENTICATION =================
        auth: {
            async login(email, password) {
                if (supabaseClient) {
                    try {
                        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                        if (!error && data?.session) {
                            return data;
                        }
                    } catch (err) {
                        console.warn('Supabase auth exception:', err);
                    }
                }

                // Fallback / Demo Auth
                const savedAdminEmail = localStorage.getItem('castle_admin_email') || 'admin@castletravelhub.com';
                const savedAdminPass = localStorage.getItem('castle_admin_pass') || 'castle@admin2026';

                if (email === savedAdminEmail && password === savedAdminPass) {
                    const mockSession = {
                        user: { email, role: 'admin', user_metadata: { name: 'Castle Administrator' } },
                        access_token: 'mock-token-' + Date.now()
                    };
                    sessionStorage.setItem('castle_admin_session', JSON.stringify(mockSession));
                    return mockSession;
                } else {
                    throw new Error('Invalid email or password. Default login: admin@castletravelhub.com / castle@admin2026');
                }
            },
            async logout() {
                if (supabaseClient) {
                    try {
                        await supabaseClient.auth.signOut();
                    } catch (e) {}
                }
                sessionStorage.removeItem('castle_admin_session');
            },
            async getSession() {
                if (supabaseClient) {
                    try {
                        const { data } = await supabaseClient.auth.getSession();
                        if (data?.session) return data.session;
                    } catch (e) {}
                }
                const raw = sessionStorage.getItem('castle_admin_session');
                return raw ? JSON.parse(raw) : null;
            },
            async getUser() {
                const session = await this.getSession();
                return session?.user || null;
            }
        },

        // ================= ENQUIRIES =================
        enquiries: {
            async getAll() {
                const res = await queryTable(ENQUIRY_TABLES, (q) => q.select('*').order('created_at', { ascending: false }));

                if (res && Array.isArray(res.data)) {
                    return res.data.map(row => ({
                        id: row.id,
                        name: row.name || 'Anonymous',
                        email: row.email || '-',
                        phone: row.phone || '-',
                        destination: row.destination || 'General Enquiry',
                        travel_date: row.travel_date || null,
                        people: row.people || row.travelers || 1,
                        message: row.message || '',
                        status: row.status || 'new',
                        created_at: row.created_at || new Date().toISOString()
                    }));
                }

                return StorageEngine.get('enquiries') || [];
            },
            async create(enquiry) {
                const payload = {
                    name: enquiry.name,
                    email: enquiry.email || null,
                    phone: enquiry.phone || null,
                    destination: enquiry.destination || null,
                    travel_date: enquiry.travel_date || null,
                    people: parseInt(enquiry.people || enquiry.travelers) || 1,
                    message: enquiry.message || null,
                    status: 'new'
                };

                for (const t of ENQUIRY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).insert([payload]).select();
                            if (!error && data && data.length > 0) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('enquiries') || [];
                const localItem = { id: 'enq-' + Date.now(), ...payload, created_at: new Date().toISOString() };
                list.unshift(localItem);
                StorageEngine.set('enquiries', list);
                return localItem;
            },
            async updateStatus(id, status) {
                for (const t of ENQUIRY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).update({ status }).eq('id', id).select();
                            if (!error && data) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('enquiries') || [];
                const item = list.find(e => e.id === id);
                if (item) {
                    item.status = status;
                    StorageEngine.set('enquiries', list);
                }
                return item;
            },
            async delete(id) {
                for (const t of ENQUIRY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { error } = await supabaseClient.from(t).delete().eq('id', id);
                            if (!error) return true;
                        }
                    } catch (e) {}
                }

                let list = StorageEngine.get('enquiries') || [];
                list = list.filter(e => e.id !== id);
                StorageEngine.set('enquiries', list);
                return true;
            }
        },

        // ================= DESTINATIONS =================
        destinations: {
            async getAll(onlyVisible = false) {
                const res = await queryTable(DESTINATION_TABLES, (q) => {
                    let query = q.select('*').order('created_at', { ascending: false });
                    if (onlyVisible) query = query.eq('visible', true);
                    return query;
                });

                if (res && Array.isArray(res.data)) {
                    let list = res.data.map(row => ({
                        id: row.id,
                        name: row.name || 'Kerala Spot',
                        description: row.description || '',
                        image_url: row.image_url || '/Images/destinations/munnar.jpg',
                        price: row.price || null,
                        duration: row.duration || null,
                        visible: row.visible !== undefined ? row.visible : true,
                        created_at: row.created_at
                    }));
                    if (onlyVisible) list = list.filter(d => d.visible !== false);
                    return list;
                }

                let list = StorageEngine.get('destinations') || [];
                if (onlyVisible) list = list.filter(d => d.visible !== false);
                return list;
            },
            async create(dest) {
                const payload = {
                    name: dest.name,
                    description: dest.description || '',
                    image_url: dest.image_url || '',
                    price: dest.price ? parseFloat(dest.price) : null,
                    duration: dest.duration || null,
                    visible: dest.visible !== undefined ? dest.visible : true
                };

                for (const t of DESTINATION_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).insert([payload]).select();
                            if (!error && data && data.length > 0) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('destinations') || [];
                const localItem = { id: 'dest-' + Date.now(), ...payload, created_at: new Date().toISOString() };
                list.push(localItem);
                StorageEngine.set('destinations', list);
                return localItem;
            },
            async update(id, updates) {
                for (const t of DESTINATION_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).update(updates).eq('id', id).select();
                            if (!error && data) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('destinations') || [];
                const idx = list.findIndex(d => d.id === id);
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...updates };
                    StorageEngine.set('destinations', list);
                    return list[idx];
                }
                return null;
            },
            async delete(id) {
                for (const t of DESTINATION_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { error } = await supabaseClient.from(t).delete().eq('id', id);
                            if (!error) return true;
                        }
                    } catch (e) {}
                }

                let list = StorageEngine.get('destinations') || [];
                list = list.filter(d => d.id !== id);
                StorageEngine.set('destinations', list);
                return true;
            }
        },

        // ================= GALLERY =================
        gallery: {
            async getAll() {
                const res = await queryTable(GALLERY_TABLES, (q) => q.select('*').order('created_at', { ascending: false }));

                if (res && Array.isArray(res.data)) {
                    return res.data.map(row => ({
                        id: row.id,
                        title: row.title || 'Kerala Photo',
                        description: row.description || '',
                        image_url: row.image_url || '/Images/gallery/kerala1.jpg',
                        category: row.category || 'nature',
                        created_at: row.created_at
                    }));
                }

                return StorageEngine.get('gallery') || [];
            },
            async create(item) {
                const payload = {
                    title: item.title,
                    description: item.description || '',
                    image_url: item.image_url,
                    category: item.category || 'nature'
                };

                for (const t of GALLERY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).insert([payload]).select();
                            if (!error && data && data.length > 0) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('gallery') || [];
                const localItem = { id: 'gal-' + Date.now(), ...payload, created_at: new Date().toISOString() };
                list.push(localItem);
                StorageEngine.set('gallery', list);
                return localItem;
            },
            async update(id, updates) {
                for (const t of GALLERY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).update(updates).eq('id', id).select();
                            if (!error && data) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('gallery') || [];
                const idx = list.findIndex(g => g.id === id);
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...updates };
                    StorageEngine.set('gallery', list);
                    return list[idx];
                }
                return null;
            },
            async delete(id) {
                for (const t of GALLERY_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { error } = await supabaseClient.from(t).delete().eq('id', id);
                            if (!error) return true;
                        }
                    } catch (e) {}
                }

                let list = StorageEngine.get('gallery') || [];
                list = list.filter(g => g.id !== id);
                StorageEngine.set('gallery', list);
                return true;
            }
        },

        // ================= REVIEWS =================
        reviews: {
            async getAll(onlyApproved = false) {
                const res = await queryTable(REVIEWS_TABLES, (q) => {
                    let query = q.select('*').order('created_at', { ascending: false });
                    if (onlyApproved) query = query.eq('approved', true);
                    return query;
                });

                if (res && Array.isArray(res.data)) {
                    let list = res.data.map(row => ({
                        id: row.id,
                        name: row.name || 'Traveler',
                        rating: parseInt(row.rating) || 5,
                        review: row.review || '',
                        image_url: row.image_url || '',
                        approved: Boolean(row.approved),
                        created_at: row.created_at
                    }));
                    if (onlyApproved) list = list.filter(r => r.approved);
                    return list;
                }

                let list = StorageEngine.get('reviews') || [];
                if (onlyApproved) list = list.filter(r => r.approved);
                return list;
            },
            async create(item) {
                const payload = {
                    name: item.name,
                    rating: parseInt(item.rating) || 5,
                    review: item.review || item.comment || '',
                    image_url: item.image_url || '',
                    approved: item.approved !== undefined ? item.approved : false
                };

                for (const t of REVIEWS_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).insert([payload]).select();
                            if (!error && data && data.length > 0) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('reviews') || [];
                const localItem = { id: 'rev-' + Date.now(), ...payload, created_at: new Date().toISOString() };
                list.unshift(localItem);
                StorageEngine.set('reviews', list);
                return localItem;
            },
            async update(id, updates) {
                for (const t of REVIEWS_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { data, error } = await supabaseClient.from(t).update(updates).eq('id', id).select();
                            if (!error && data) return data[0];
                        }
                    } catch (e) {}
                }

                const list = StorageEngine.get('reviews') || [];
                const idx = list.findIndex(r => r.id === id);
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...updates };
                    StorageEngine.set('reviews', list);
                    return list[idx];
                }
                return null;
            },
            async toggleApproval(id, approved) {
                return this.update(id, { approved });
            },
            async delete(id) {
                for (const t of REVIEWS_TABLES) {
                    try {
                        if (supabaseClient) {
                            const { error } = await supabaseClient.from(t).delete().eq('id', id);
                            if (!error) return true;
                        }
                    } catch (e) {}
                }

                let list = StorageEngine.get('reviews') || [];
                list = list.filter(r => r.id !== id);
                StorageEngine.set('reviews', list);
                return true;
            }
        },

        // ================= WEBSITE SETTINGS =================
        settings: {
            async getAll() {
                const res = await queryTable(SETTINGS_TABLES, (q) => q.select('*').limit(1));

                if (res && Array.isArray(res.data) && res.data.length > 0) {
                    const row = res.data[0];
                    return {
                        id: row.id,
                        business_name: row.business_name || 'Castle Travel Hub',
                        phone: row.phone || '+9539415251',
                        email: row.email || 'info@castletravelhub.com',
                        whatsapp: row.whatsapp || '919539415251',
                        address: row.address || 'puthenpurakal (h) irumalapady',
                        instagram: row.instagram || '',
                        facebook: row.facebook || ''
                    };
                }

                return StorageEngine.get('settings') || INITIAL_SEED.settings;
            },
            async update(settingsObj) {
                for (const t of SETTINGS_TABLES) {
                    try {
                        if (supabaseClient) {
                            // Check if a row exists
                            const { data } = await supabaseClient.from(t).select('id').limit(1);
                            if (data && data.length > 0) {
                                const rowId = data[0].id;
                                await supabaseClient.from(t).update(settingsObj).eq('id', rowId);
                            } else {
                                await supabaseClient.from(t).insert([settingsObj]);
                            }
                            break;
                        }
                    } catch (e) {}
                }

                const current = StorageEngine.get('settings') || INITIAL_SEED.settings;
                const updated = { ...current, ...settingsObj };
                StorageEngine.set('settings', updated);
                return updated;
            }
        },

        // ================= STORAGE =================
        storage: {
            async uploadImage(file, bucket = 'gallery') {
                if (!file) throw new Error('No file provided');

                if (!file.type.startsWith('image/')) {
                    throw new Error('Please select a valid image file (PNG, JPG, WEBP, AVIF).');
                }
                if (file.size > 8 * 1024 * 1024) {
                    throw new Error('Image size must be less than 8MB.');
                }

                if (supabaseClient) {
                    try {
                        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                        const filePath = `${Date.now()}_${cleanName}`;
                        const { data, error } = await supabaseClient.storage.from(bucket).upload(filePath, file, {
                            cacheControl: '3600',
                            upsert: false
                        });
                        if (!error) {
                            const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);
                            return publicUrlData.publicUrl;
                        }
                    } catch (uploadErr) {
                        console.warn('Supabase storage bucket notice:', uploadErr);
                    }
                }

                // In Fallback/Demo mode: convert to DataURL
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Failed to read image file'));
                    reader.readAsDataURL(file);
                });
            }
        }
    };
})();
