import Link from 'next/link';

export default function ClassifiedsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Clasificados</h1>
        <p className="text-gray-600">
          Encuentra y publica anuncios de vehículos, bienes raíces, empleos y más.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar clasificados..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Todas las categorías</option>
            <option value="vehiculos">Vehículos</option>
            <option value="bienes-raices">Bienes Raíces</option>
            <option value="empleos">Empleos</option>
            <option value="servicios">Servicios</option>
            <option value="electronica">Electrónica</option>
          </select>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Link href="/clasificados/vehiculos" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Vehículos</span>
          </Link>
          
          <Link href="/clasificados/bienes-raices" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm font-medium">Bienes Raíces</span>
          </Link>
          
          <Link href="/clasificados/empleos" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <span className="text-sm font-medium">Empleos</span>
          </Link>
          
          <Link href="/clasificados/servicios" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Servicios</span>
          </Link>
          
          <Link href="/clasificados/electronica" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Electrónica</span>
          </Link>
          
          <Link href="/clasificados/otros" className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm font-medium">Otros</span>
          </Link>
        </div>
      </div>

      {/* Featured Classifieds */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Clasificados Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Classified 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Vehículos
                </span>
                <span className="text-green-600 font-semibold">RD$ 450,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/vehiculo-1" className="hover:text-green-600">
                  Toyota Corolla 2020 - Excelente estado
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Vehículo en excelente estado, mantenimiento al día, 
                una sola mano, 45,000 km. Santo Domingo.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Santo Domingo</span>
                <span>Hace 2 horas</span>
              </div>
            </div>
          </article>

          {/* Classified 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Bienes Raíces
                </span>
                <span className="text-green-600 font-semibold">RD$ 2,500,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/apartamento-1" className="hover:text-green-600">
                  Apartamento 2 habitaciones - Zona Colonial
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Hermoso apartamento en el corazón de la Zona Colonial, 
                2 habitaciones, 1 baño, cocina equipada.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Zona Colonial</span>
                <span>Hace 4 horas</span>
              </div>
            </div>
          </article>

          {/* Classified 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Empleos
                </span>
                <span className="text-green-600 font-semibold">RD$ 35,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/empleo-1" className="hover:text-green-600">
                  Desarrollador Full Stack - Empresa tecnológica
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Buscamos desarrollador con experiencia en React, Node.js y PostgreSQL. 
                Modalidad híbrida, beneficios completos.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Santo Domingo</span>
                <span>Hace 6 horas</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Latest Classifieds */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Últimos Clasificados</h2>
        <div className="space-y-6">
          {/* Classified Item 1 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Servicios
                </span>
                <span className="text-green-600 font-semibold">RD$ 15,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/servicio-1" className="hover:text-green-600">
                  Servicio de limpieza profesional - Hogares y oficinas
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                Servicio de limpieza profesional para hogares y oficinas. 
                Personal capacitado, productos de calidad, precios competitivos.
              </p>
            </div>
          </article>

          {/* Classified Item 2 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Electrónica
                </span>
                <span className="text-green-600 font-semibold">RD$ 25,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/electronica-1" className="hover:text-green-600">
                  iPhone 13 Pro - 128GB - Como nuevo
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                iPhone 13 Pro en excelente estado, 128GB, color azul sierra. 
                Incluye cargador y funda original. Solo 6 meses de uso.
              </p>
            </div>
          </article>

          {/* Classified Item 3 */}
          <article className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Vehículos
                </span>
                <span className="text-green-600 font-semibold">RD$ 180,000</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                <Link href="/clasificados/vehiculo-2" className="hover:text-green-600">
                  Honda Civic 2018 - Automático - Gasolina
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">
                Honda Civic 2018, automático, gasolina, 65,000 km. 
                Mantenimiento al día, documentos en orden. Santiago.
              </p>
            </div>
          </article>
        </div>
      </div>

      {/* Post Classified Button */}
      <div className="text-center mt-8">
        <Link 
          href="/clasificados/publicar" 
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Publicar Clasificado
        </Link>
      </div>
    </div>
  );
} 