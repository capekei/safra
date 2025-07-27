import { Link } from "wouter";

export function Footer() {
  return (
        <footer className="hidden md:block mt-16 mb-8 mx-4">
      <div className="glass-effect p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 group cursor-pointer">
                <div className="ghost-logo"></div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                    SafraReport
                  </h3>
                  <span className="text-xs text-primary/70 font-medium tracking-wide">
                    Desde 2024
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Tu fuente confiable de noticias y marketplace en República Dominicana. 
                Conectando a los dominicanos con información relevante y oportunidades locales 
                desde el corazón del Caribe.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="group relative text-gray-400 hover:text-primary transition-all duration-300 p-2 hover:bg-primary/10 rounded-lg">
                  <i className="fab fa-facebook text-xl group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Facebook
                  </span>
                </a>
                <a href="#" className="group relative text-gray-400 hover:text-primary transition-all duration-300 p-2 hover:bg-primary/10 rounded-lg">
                  <i className="fab fa-twitter text-xl group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Twitter
                  </span>
                </a>
                <a href="#" className="group relative text-gray-400 hover:text-primary transition-all duration-300 p-2 hover:bg-primary/10 rounded-lg">
                  <i className="fab fa-instagram text-xl group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Instagram
                  </span>
                </a>
                <a href="#" className="group relative text-gray-400 hover:text-primary transition-all duration-300 p-2 hover:bg-primary/10 rounded-lg">
                  <i className="fab fa-youtube text-xl group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    YouTube
                  </span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Secciones</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-primary transition-colors">Noticias</Link></li>
                <li><Link href="/clasificados" className="hover:text-primary transition-colors">Clasificados</Link></li>
                <li><Link href="/resenas" className="hover:text-primary transition-colors">Reseñas</Link></li>
                <li><Link href="/seccion/nacional" className="hover:text-primary transition-colors">Nacional</Link></li>
                <li><Link href="/seccion/internacional" className="hover:text-primary transition-colors">Internacional</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Políticas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos de uso</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Publicidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-[12px]">© 2025 SafraReport. Todos los derechos reservados.</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs">En línea</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 group cursor-pointer px-3 py-1 rounded-full hover:bg-primary/10 transition-all duration-300">
                <span className="group-hover:animate-bounce">🇩🇴</span>
                <span className="group-hover:text-primary transition-colors duration-300 text-[12px]">Developed by JJ 👻 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
