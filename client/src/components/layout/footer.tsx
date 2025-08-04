import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">SafraReport</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu fuente confiable de noticias, clasificados y reseñas de negocios en la República Dominicana. 
              Mantenerte informado con las últimas noticias locales y encuentra excelentes ofertas en tu área.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Inicio
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/noticias">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Noticias
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/clasificados">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Clasificados
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resenas">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Reseñas
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-gray-400">Santo Domingo, RD</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-gray-400">+1 (809) 555-0123</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-gray-400">info@safrareport.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} SafraReport. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacidad">
                <a className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Privacidad
                </a>
              </Link>
              <Link href="/terminos">
                <a className="text-gray-400 hover:text-white text-sm transition-colors">
                  Términos de Uso
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}