-- SafraReport Standard PostgreSQL Database Schema
-- Modified to work without Supabase auth schema

-- Create users table (replaces auth.users dependency)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
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
CREATE TABLE IF NOT EXISTS public.articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    slug TEXT UNIQUE NOT NULL,
    author_id UUID REFERENCES public.users(id),
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
CREATE TABLE IF NOT EXISTS public.classifieds (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'DOP',
    category_id INTEGER REFERENCES public.categories(id),
    user_id UUID REFERENCES public.users(id),
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
CREATE TABLE IF NOT EXISTS public.reviews (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON public.articles(breaking_news);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

CREATE INDEX IF NOT EXISTS idx_classifieds_active ON public.classifieds(active);
CREATE INDEX IF NOT EXISTS idx_classifieds_featured ON public.classifieds(featured);
CREATE INDEX IF NOT EXISTS idx_classifieds_category ON public.classifieds(category_id);
CREATE INDEX IF NOT EXISTS idx_classifieds_created_at ON public.classifieds(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_published ON public.reviews(published);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Nacional', 'nacional', 'Noticias nacionales de República Dominicana', '#DC2626'),
('Internacional', 'internacional', 'Noticias internacionales', '#059669'),
('Política', 'politica', 'Noticias políticas y gubernamentales', '#DC2626'),
('Economía', 'economia', 'Noticias económicas y financieras', '#059669'),
('Deportes', 'deportes', 'Noticias deportivas y resultados', '#2563EB'),
('Cultura', 'cultura', 'Arte, música y eventos culturales', '#7C3AED'),
('Tecnología', 'tecnologia', 'Innovación y tecnología', '#0891B2'),
('Salud', 'salud', 'Noticias de salud y bienestar', '#DC2626'),
('Educación', 'educacion', 'Sistema educativo y universidades', '#EA580C'),
('Turismo', 'turismo', 'Destinos y noticias turísticas', '#059669')
ON CONFLICT (slug) DO NOTHING;

-- Create a default admin user (you should change this password!)
INSERT INTO public.users (email, password_hash, first_name, last_name, role) VALUES
('admin@safrareport.com', '$2b$10$rQZ5qZ5qZ5qZ5qZ5qZ5qZOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ', 'Admin', 'User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample articles with the admin user as author
INSERT INTO public.articles (title, content, excerpt, slug, featured, published, breaking_news, category_id, image_url, published_at, author_id) VALUES
(
    'SafraReport: Tu nueva fuente de noticias dominicanas',
    'Bienvenidos a SafraReport, la plataforma digital que revoluciona la forma en que los dominicanos acceden a las noticias más importantes del país. Nuestro compromiso es brindar información veraz, oportuna y de calidad sobre los acontecimientos que marcan el día a día en República Dominicana.

    Con una interfaz moderna y fácil de usar, SafraReport se convierte en tu ventana al mundo de las noticias dominicanas. Desde política hasta deportes, desde economía hasta cultura, cubrimos todos los aspectos que interesan a nuestra comunidad.

    Nuestro equipo de periodistas experimentados trabaja las 24 horas para mantenerte informado sobre los eventos más relevantes, tanto a nivel nacional como internacional, siempre con el enfoque en cómo estos afectan a República Dominicana.',
    'SafraReport se presenta como la nueva plataforma digital para noticias dominicanas, comprometida con la información veraz y oportuna.',
    'safrareport-nueva-fuente-noticias-dominicanas',
    true,
    true,
    false,
    1,
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    NOW(),
    (SELECT id FROM public.users WHERE email = 'admin@safrareport.com' LIMIT 1)
),
(
    'Economía dominicana muestra signos de recuperación post-pandemia',
    'Los últimos indicadores económicos muestran una tendencia positiva en el crecimiento del PIB dominicano. Los sectores turismo y manufactura lideran la recuperación post-pandemia, generando optimismo entre los analistas económicos.

    Según el Banco Central, el crecimiento interanual se sitúa en 5.2%, superando las expectativas iniciales. El sector turístico, uno de los más afectados durante la pandemia, muestra signos claros de recuperación con un aumento del 15% en las llegadas de visitantes extranjeros.

    La manufactura también contribuye significativamente a este repunte, especialmente en las zonas francas, donde la producción ha aumentado un 8% comparado con el mismo período del año anterior.',
    'Indicadores económicos positivos señalan recuperación en turismo y manufactura, con crecimiento del PIB del 5.2%.',
    'economia-dominicana-signos-recuperacion-post-pandemia',
    true,
    true,
    false,
    4,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    NOW(),
    (SELECT id FROM public.users WHERE email = 'admin@safrareport.com' LIMIT 1)
),
(
    'Nueva temporada de béisbol dominicano genera grandes expectativas',
    'La Liga Dominicana de Béisbol Profesional inicia su nueva temporada con grandes expectativas. Los equipos han reforzado sus plantillas con jugadores de las Grandes Ligas, prometiendo una competencia emocionante.

    Los Tigres del Licey y las Águilas Cibaeñas llegan como favoritos, pero equipos como los Leones del Escogido y las Estrellas Orientales han hecho movimientos importantes en el mercado de jugadores.

    La temporada promete ser una de las más competitivas de los últimos años, con la participación confirmada de varios peloteros dominicanos que brillaron en la MLB durante la temporada regular.',
    'La nueva temporada de béisbol dominicano promete emoción con refuerzos de MLB y gran competitividad.',
    'nueva-temporada-beisbol-dominicano-expectativas',
    false,
    true,
    false,
    5,
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800',
    NOW(),
    (SELECT id FROM public.users WHERE email = 'admin@safrareport.com' LIMIT 1)
),
(
    'Gobierno anuncia nuevas medidas para impulsar el turismo nacional',
    'El Ministerio de Turismo presentó un paquete de medidas destinadas a fortalecer el sector turístico nacional, incluyendo incentivos fiscales para hoteles y mejoras en la infraestructura turística.

    Las medidas incluyen la reducción del ITBIS para servicios turísticos, programas de capacitación para empleados del sector y la modernización de aeropuertos en destinos emergentes como Barahona y Monte Cristi.

    Se espera que estas iniciativas generen un impacto positivo en la economía local y contribuyan a la diversificación de la oferta turística dominicana.',
    'Nuevas medidas gubernamentales buscan impulsar el turismo con incentivos fiscales y mejoras en infraestructura.',
    'gobierno-medidas-impulsar-turismo-nacional',
    true,
    true,
    true,
    10,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    NOW(),
    (SELECT id FROM public.users WHERE email = 'admin@safrareport.com' LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;
