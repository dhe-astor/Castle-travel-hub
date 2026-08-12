-- ============================================================================
-- CASTLE TRAVEL HUB - SUPABASE DATABASE SCHEMA & SECURITY POLICIES
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Site Settings Policies
CREATE POLICY "Public can view site settings" 
    ON public.site_settings FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated admins can modify site settings" 
    ON public.site_settings FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 3. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    travel_date DATE,
    travelers INTEGER DEFAULT 1,
    destination TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'contacted', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Enquiries Policies: Public can insert enquiries, only authenticated users can view/manage
CREATE POLICY "Public visitors can submit enquiries" 
    ON public.enquiries FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Authenticated admins can view enquiries" 
    ON public.enquiries FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated admins can update enquiries" 
    ON public.enquiries FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete enquiries" 
    ON public.enquiries FOR DELETE 
    TO authenticated 
    USING (true);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT DEFAULT 'Traveller',
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    photo_url TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews Policies
CREATE POLICY "Public can view approved reviews" 
    ON public.reviews FOR SELECT 
    USING (is_approved = true);

CREATE POLICY "Authenticated admins can manage all reviews" 
    ON public.reviews FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 5. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'nature' CHECK (category IN ('mountains', 'backwaters', 'beach', 'nature', 'culture')),
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Gallery Policies
CREATE POLICY "Public can view active gallery photos" 
    ON public.gallery FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Authenticated admins can manage gallery photos" 
    ON public.gallery FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 6. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL DEFAULT 'hill-station' CHECK (category IN ('hill-station', 'backwaters', 'beach', 'wildlife')),
    category_label TEXT DEFAULT 'Hill Station',
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Destinations Policies
CREATE POLICY "Public can view active destinations" 
    ON public.destinations FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Authenticated admins can manage destinations" 
    ON public.destinations FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 7. INITIAL SEED DATA
INSERT INTO public.site_settings (key, value, description) VALUES
    ('business_name', 'Castle Travel Hub', 'Official Business Name'),
    ('contact_person', 'ASWIN', 'Primary Contact Name'),
    ('phone_number', '+9539415251', 'Primary Support Hotline'),
    ('email_address', 'info@castletravelhub.com', 'Primary Business Email'),
    ('corporate_email', 'corporate@castletravelhub.com', 'Corporate Booking Email'),
    ('address', 'puthenpurakal (h) irumalapady', 'Office Physical Address'),
    ('whatsapp_number', '919539415251', 'WhatsApp Chat Number without +'),
    ('tagline', 'Discover God''s Own Country with premium comfort and local expertise.', 'Header & Footer Tagline')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.destinations (name, tagline, category, category_label, description, image_url, is_featured, is_active, sort_order) VALUES
    ('Munnar', 'Hill Station Paradise', 'hill-station', 'Hill Station', 'Situated at 1,600m above sea level, Munnar features sprawling green tea estates, clean mountain streams, and the majestic Anamudi peak.', '/Images/destinations/munnar.jpg', true, true, 1),
    ('Alleppey (Alappuzha)', 'Venice of the East', 'backwaters', 'Backwaters', 'Renowned for houseboat cruises along the tranquil backwaters, lush paddy fields, and iconic coconut tree fringed shorelines.', '/Images/destinations/alleppey.jpg', true, true, 2),
    ('Wayanad', 'Mystic Forests & Hills', 'wildlife', 'Forest & Wildlife', 'A bio-diverse hill district offering spiced plantations, waterfalls, ancient Edakkal caves, wild elephant spotting, and peak trekking.', '/Images/destinations/wayanad.jpg', true, true, 3),
    ('Kovalam', 'Golden Crescent Coast', 'beach', 'Beach', 'Famous for its shallow waters, low tidal currents, and three adjacent crescent beaches separated by rocky outcroppings.', '/Images/destinations/kovalam.jpg', true, true, 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.reviews (name, location, rating, comment, is_approved) VALUES
    ('Rahul', 'Mumbai', 5, 'Excellent customer service! The Innova Crysta was spotless, and the driver was friendly and extremely helpful with navigating Munnar''s mountain curves.', true),
    ('Sarah', 'UK', 5, 'Booking our family trip through Castle Travel Hub was seamless. The houseboat experience in Alleppey they recommended was the highlight of our vacation.', true),
    ('Ahmed', 'UAE', 5, 'Outstanding 24/7 client support. We requested a last-minute routing adjustment on the third day, and they coordinated it in under an hour.', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery (title, description, category, image_url, sort_order, is_active) VALUES
    ('Munnar Misty Hills', 'Scenic Munnar Tea Hills at Dawn', 'mountains', '/Images/gallery/kerala1.jpg', 1, true),
    ('Vembanad Lake Side', 'Serene Lake Backwaters in Kumarakom', 'backwaters', '/Images/gallery/kerala2.jpg', 2, true),
    ('Wayanad Western Ghats', 'Lush Forest Roads & Wildlife Trails', 'nature', '/Images/gallery/kerala3.jpg', 3, true),
    ('Athirappilly Waterfall', 'The Majestic Niagara of South India', 'nature', '/Images/gallery/kerala4.jpg', 4, true),
    ('Varkala Beach Cliffs', 'Unique Red Sandstone Coastal Cliffs', 'beach', '/Images/gallery/kerala5.jpg', 5, true),
    ('Periyar Forest Boating', 'Wildlife Boat Safaris in Thekkady', 'nature', '/Images/gallery/kerala6.jpg', 6, true),
    ('Traditional Kathakali Art', 'Vibrant Heritage Makeup & Classical Dance', 'culture', '/Images/gallery/kerala7.jpg', 7, true),
    ('Cruising Alleppey Backwaters', 'Luxury Houseboat Floating on Backwaters', 'backwaters', '/Images/gallery/kerala8.jpg', 8, true),
    ('Munnar Tea Pickers', 'Traditional Tea Harvesting in Western Ghats', 'mountains', '/Images/gallery/kerala9.jpg', 9, true),
    ('Fort Kochi Chinese Nets', 'Ancient Mechanical Fishing Nets at Sunset', 'culture', '/Images/gallery/kerala10.jpg', 10, true),
    ('Kovalam Lighthouse Beach', 'Iconic Striped Lighthouse by the Ocean', 'beach', '/Images/gallery/kerala11.jpg', 11, true),
    ('Kerala Village Backwaters', 'Village Life Along the Canals', 'backwaters', '/Images/gallery/kerala12.jpg', 12, true),
    ('Misty Tea Garden Trails', 'Foggy Morning in Munnar Estates', 'mountains', '/Images/gallery/kerala13.jpg', 13, true),
    ('Traditional Kerala Boat', 'Country Canoe Gliding Across the Waters', 'backwaters', '/Images/gallery/kerala14.jpg', 14, true),
    ('Kochi Heritage Streets', 'Colonial Dutch & Portuguese Architecture', 'culture', '/Images/gallery/kerala15.jpg', 15, true),
    ('Elephant Safari Experience', 'Gentle Giants in Forest Reserves', 'nature', '/Images/gallery/kerala16.jpg', 16, true),
    ('Kerala Sunset Horizon', 'Golden Hour Over Coconut Palm Lagoons', 'beach', '/Images/gallery/kerala17.jpg', 17, true)
ON CONFLICT DO NOTHING;
