import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SafraReport - Dominican Republic News & Marketplace',
  description: 'Your trusted source for Dominican Republic news, classifieds, and business reviews. Stay informed with the latest local news and find great deals in your area.',
  keywords: 'Dominican Republic, news, classifieds, marketplace, Santo Domingo, DOP',
  authors: [{ name: 'SafraReport Team' }],
  openGraph: {
    title: 'SafraReport - Dominican Republic News & Marketplace',
    description: 'Your trusted source for Dominican Republic news, classifieds, and business reviews.',
    url: 'https://safrareport.com',
    siteName: 'SafraReport',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafraReport - Dominican Republic News & Marketplace',
    description: 'Your trusted source for Dominican Republic news, classifieds, and business reviews.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">
                    SafraReport
                  </Link>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    Inicio
                  </Link>
                  <Link href="/noticias" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    Noticias
                  </Link>
                  <Link href="/clasificados" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    Clasificados
                  </Link>
                  <Link href="/negocios" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                    Negocios
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">SafraReport</h3>
                  <p className="text-gray-300">
                    Tu fuente confiable de noticias, clasificados y reseñas de negocios en la República Dominicana.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
                  <ul className="space-y-2">
                    <li><Link href="/noticias" className="text-gray-300 hover:text-white">Noticias</Link></li>
                    <li><Link href="/clasificados" className="text-gray-300 hover:text-white">Clasificados</Link></li>
                    <li><Link href="/negocios" className="text-gray-300 hover:text-white">Negocios</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                  <p className="text-gray-300">
                    República Dominicana<br />
                    info@safrareport.com
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
                <p>&copy; 2024 SafraReport. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 