-- Habilitar RLS para las tablas críticas
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla 'articles'
-- 1. Permitir acceso de lectura público a todos
CREATE POLICY "Allow public read access to articles" ON public.articles FOR SELECT USING (true);

-- 2. Permitir acceso de escritura solo a administradores
CREATE POLICY "Allow full access to admins" ON public.articles FOR ALL USING (auth.role() = 'admin');

-- Políticas para la tabla 'users'
-- 1. Permitir a los usuarios ver su propia información
CREATE POLICY "Allow users to view their own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Políticas para la tabla 'admin_users'
-- 1. Permitir a los administradores ver todos los usuarios administradores
CREATE POLICY "Allow admins to view all admin users" ON public.admin_users FOR SELECT USING (auth.role() = 'admin');
