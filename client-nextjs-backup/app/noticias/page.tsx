import Link from 'next/link';

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Noticias</h1>
        <p className="text-gray-600">
          Las últimas noticias de la República Dominicana y el mundo.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Todas
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            Política
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            Deportes
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            Economía
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            Entretenimiento
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
            Tecnología
          </button>
        </div>
      </div>

      {/* Featured News */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Noticias Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Article 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Política
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 2 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-1" className="hover:text-green-600">
                  Nuevas medidas económicas anunciadas por el gobierno
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                El gobierno dominicano anunció hoy una serie de nuevas medidas económicas 
                destinadas a impulsar el crecimiento y la estabilidad financiera del país.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Por Redacción SafraReport</span>
              </div>
            </div>
          </article>

          {/* Featured Article 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Deportes
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 4 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-2" className="hover:text-green-600">
                  Selección dominicana clasifica para el próximo torneo
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                La selección nacional logró una victoria histórica que le permite 
                clasificar para el próximo torneo internacional.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Por Redacción SafraReport</span>
              </div>
            </div>
          </article>

          {/* Featured Article 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Tecnología
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 6 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-3" className="hover:text-green-600">
                  Startup dominicana recibe inversión millonaria
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Una empresa tecnológica local recibió una inversión significativa 
                que permitirá expandir sus operaciones a nivel internacional.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Por Redacción SafraReport</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Latest News */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Últimas Noticias</h2>
        <div className="space-y-6">
          {/* News Item 1 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Economía
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 8 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-4" className="hover:text-green-600">
                  Turismo muestra signos de recuperación en el país
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                Las cifras del sector turístico muestran una recuperación significativa 
                en comparación con el año anterior, impulsando la economía local.
              </p>
            </div>
          </article>

          {/* News Item 2 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Entretenimiento
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 10 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-5" className="hover:text-green-600">
                  Festival de música atrae miles de visitantes a Santo Domingo
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                El festival anual de música dominicana reunió a miles de personas 
                en la capital, celebrando la rica cultura musical del país.
              </p>
            </div>
          </article>

          {/* News Item 3 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Política
                </span>
                <span className="text-gray-500 text-sm ml-2">Hace 12 horas</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/noticias/articulo-6" className="hover:text-green-600">
                  Nuevas leyes de protección ambiental aprobadas
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                El congreso aprobó nuevas leyes destinadas a proteger el medio ambiente 
                y promover el desarrollo sostenible en el país.
              </p>
            </div>
          </article>
        </div>
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
          Cargar Más Noticias
        </button>
      </div>
    </div>
  );
} 