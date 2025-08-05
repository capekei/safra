-- SafraReport Fixed Database Schema
-- This version handles existing tables and conflicts

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.classifieds CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create categories table first (referenced by articles)
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE public.articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    slug TEXT UNIQUE NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    category_id INTEGER REFERENCES public.categories(id),
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    breaking_news BOOLEAN DEFAULT false,
    image_url TEXT,
    video_url TEXT,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create classifieds table
CREATE TABLE public.classifieds (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'DOP',
    category_id INTEGER REFERENCES public.categories(id),
    user_id UUID REFERENCES auth.users(id),
    location TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    images TEXT[],
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    business_name TEXT,
    business_category TEXT,
    reviewer_name TEXT,
    reviewer_email TEXT,
    location TEXT,
    verified BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (extends Supabase auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_articles_published ON public.articles(published);
CREATE INDEX idx_articles_featured ON public.articles(featured);
CREATE INDEX idx_articles_breaking ON public.articles(breaking_news);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_created_at ON public.articles(created_at);
CREATE INDEX idx_articles_slug ON public.articles(slug);

CREATE INDEX idx_classifieds_active ON public.classifieds(active);
CREATE INDEX idx_classifieds_featured ON public.classifieds(featured);
CREATE INDEX idx_classifieds_category ON public.classifieds(category_id);
CREATE INDEX idx_classifieds_created_at ON public.classifieds(created_at);

CREATE INDEX idx_reviews_published ON public.reviews(published);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Política', 'politica', 'Noticias políticas y gubernamentales', '#DC2626'),
('Economía', 'economia', 'Noticias económicas y financieras', '#059669'),
('Deportes', 'deportes', 'Noticias deportivas y resultados', '#2563EB'),
('Cultura', 'cultura', 'Arte, música y eventos culturales', '#7C3AED'),
('Tecnología', 'tecnologia', 'Innovación y tecnología', '#0891B2'),
('Salud', 'salud', 'Noticias de salud y bienestar', '#DC2626'),
('Educación', 'educacion', 'Sistema educativo y universidades', '#EA580C'),
('Turismo', 'turismo', 'Destinos y noticias turísticas', '#059669');

-- Insert sample articles
INSERT INTO public.articles (title, content, excerpt, slug, featured, published, breaking_news, category_id, image_url, published_at) VALUES
(
    'SafraReport: Tu nueva fuente de noticias dominicanas',
    'Bienvenidos a SafraReport, la plataforma digital que revoluciona la forma en que los dominicanos acceden a las noticias más importantes del país. Nuestro compromiso es brindar información veraz, oportuna y de calidad sobre los acontecimientos que marcan el día a día en República Dominicana.

    Con un equipo de periodistas experimentados y corresponsales en todo el territorio nacional, SafraReport se posiciona como la fuente más confiable de información para la comunidad dominicana tanto en el país como en el exterior.

    Nuestra plataforma ofrece cobertura completa de política, economía, deportes, cultura, tecnología y mucho más. Además, contamos con secciones especializadas en clasificados y reseñas de negocios locales, convirtiéndonos en un verdadero centro de información y servicios para nuestros usuarios.',
    'SafraReport se presenta como la nueva plataforma digital para noticias dominicanas, comprometida con la información veraz y oportuna.',
    'safrareport-nueva-fuente-noticias-dominicanas',
    true,
    true,
    false,
    1,
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    NOW()
),
(
    'Economía dominicana muestra signos de recuperación',
    'Los últimos indicadores económicos muestran una tendencia positiva en el crecimiento del PIB dominicano. Los sectores turismo y manufactura lideran la recuperación post-pandemia, generando optimismo entre los analistas económicos.

    Según datos del Banco Central, el crecimiento interanual alcanzó el 5.2%, superando las expectativas iniciales. El sector turístico, en particular, ha mostrado una recuperación robusta con la llegada de más de 2 millones de visitantes en los primeros seis meses del año.

    Las exportaciones también han contribuido significativamente a este crecimiento, especialmente en los sectores de textiles y productos agrícolas. Los expertos prevén que esta tendencia positiva se mantenga durante el resto del año.',
    'Indicadores económicos positivos señalan recuperación en turismo y manufactura.',
    'economia-dominicana-signos-recuperacion',
    true,
    true,
    false,
    2,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    NOW()
),
(
    'Nueva temporada de béisbol dominicano genera expectativas',
    'La Liga Dominicana de Béisbol Profesional inicia su nueva temporada con grandes expectativas. Los equipos han reforzado sus plantillas con jugadores de las Grandes Ligas, prometiendo una competencia emocionante.

    Los Tigres del Licey y las Águilas Cibaeñas llegan como favoritos, pero equipos como los Leones del Escogido y las Estrellas Orientales han realizado movimientos importantes en el mercado de jugadores.

    La temporada regular comenzará el próximo mes y se extenderá hasta enero, culminando con la serie final que determinará al representante dominicano en la Serie del Caribe.',
    'La nueva temporada de béisbol dominicano promete emoción con refuerzos de MLB.',
    'nueva-temporada-beisbol-dominicano-expectativas',
    false,
    true,
    false,
    3,
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800',
    NOW()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifieds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for articles (public read, admin write)
CREATE POLICY "Articles are viewable by everyone" ON public.articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage articles" ON public.articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for classifieds
CREATE POLICY "Active classifieds are viewable by everyone" ON public.classifieds
    FOR SELECT USING (active = true);

CREATE POLICY "Users can manage their own classifieds" ON public.classifieds
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "Published reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (published = true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by owner" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.classifieds TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.articles IS 'News articles for SafraReport';
COMMENT ON TABLE public.categories IS 'Article and content categories';
COMMENT ON TABLE public.classifieds IS 'Classified advertisements';
COMMENT ON TABLE public.reviews IS 'Business and service reviews';
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
