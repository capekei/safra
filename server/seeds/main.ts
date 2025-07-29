import { db } from '../db';
import { 
  categories,
  authors,
  articles,
  provinces,
  classifiedCategories,
  classifieds,
  businessCategories,
  businesses,
  reviews
} from '@shared/schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional)
    console.log('🧹 Clearing existing data...');
    await db.delete(reviews);
    await db.delete(businesses);
    await db.delete(businessCategories);
    await db.delete(classifieds);
    await db.delete(classifiedCategories);
    await db.delete(articles);
    await db.delete(authors);
    await db.delete(categories);
    await db.delete(provinces);

    // Insert categories
    console.log('📂 Inserting news categories...');
    const newsCategories = await db.insert(categories).values([
      { name: 'Nacional', slug: 'nacional', icon: 'fa-flag', description: 'Noticias nacionales de República Dominicana' },
      { name: 'Internacional', slug: 'internacional', icon: 'fa-globe', description: 'Noticias internacionales y mundiales' },
      { name: 'Economía', slug: 'economia', icon: 'fa-chart-line', description: 'Noticias económicas y financieras' },
      { name: 'Deportes', slug: 'deportes', icon: 'fa-futbol', description: 'Noticias deportivas nacionales e internacionales' },
      { name: 'Entretenimiento', slug: 'entretenimiento', icon: 'fa-star', description: 'Entretenimiento, celebridades y espectáculos' },
      { name: 'Turismo', slug: 'turismo', icon: 'fa-plane', description: 'Turismo y destinos en República Dominicana' },
      { name: 'Tecnología', slug: 'tecnologia', icon: 'fa-laptop', description: 'Noticias de tecnología e innovación' },
      { name: 'Cultura', slug: 'cultura', icon: 'fa-palette', description: 'Arte, cultura y tradiciones dominicanas' },
      { name: 'Opinión', slug: 'opinion', icon: 'fa-edit', description: 'Artículos de opinión y editorial' },
      { name: 'Salud', slug: 'salud', icon: 'fa-heartbeat', description: 'Salud y bienestar' }
    ]).returning();

    // Skip inserting mock data - real data will be added via admin interface
    console.log('✅ Skipping mock data insertion');
    
    /*
    // Commented out mock data - to be replaced with real content via admin
    const authorList = await db.insert(authors).values([
      {
        title: 'Gobierno Dominicano Anuncia Nuevas Políticas de Desarrollo Económico',
        slug: 'gobierno-dominicano-nuevas-politicas-desarrollo-economico',
        excerpt: 'El presidente anunció un paquete de medidas para impulsar el crecimiento económico del país, enfocándose en el turismo y la tecnología.',
        content: `<p>En una conferencia de prensa realizada en el Palacio Nacional, el presidente de la República Dominicana anunció un ambicioso paquete de políticas económicas dirigidas a fortalecer la economía nacional.</p>

<p>Las medidas incluyen incentivos fiscales para empresas tecnológicas, inversión en infraestructura turística y programas de capacitación laboral. "Nuestro objetivo es posicionar a República Dominicana como un líder regional en innovación y turismo sostenible", declaró el mandatario.</p>

<p>Entre los puntos más destacados se encuentran:</p>
<ul>
<li>Reducción del 15% en impuestos para startups tecnológicas</li>
<li>Inversión de 500 millones de pesos en infraestructura hotelera</li>
<li>Creación de 50,000 nuevos empleos en el sector turístico</li>
<li>Programas de capacitación digital para jóvenes</li>
</ul>

<p>La oposición ha recibido las medidas con cautela, pidiendo mayor transparencia en la implementación de los recursos.</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop',
        isBreaking: true,
        isFeatured: true,
        published: true,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        authorId: authorList[0].id,
        categoryId: newsCategories[0].id, // Nacional
        likes: 45,
        comments: 12,
        views: 1250
      },
      {
        title: 'Tigres del Licey Ganan Importante Partido en Serie del Caribe',
        slug: 'tigres-licey-ganan-partido-serie-caribe',
        excerpt: 'Los Tigres del Licey derrotaron 8-5 a los Leones del Caracas en un emocionante encuentro de la Serie del Caribe.',
        content: `<p>En un partido lleno de emociones, los Tigres del Licey se impusieron 8-5 ante los Leones del Caracas en el Estadio Quisqueya Juan Marichal, manteniéndose invictos en la Serie del Caribe.</p>

<p>El juego estuvo marcado por la destacada actuación del dominicano Juan Carlos Pérez, quien conectó dos jonrones y remolcó cinco carreras. "Estoy muy contento de poder ayudar al equipo en este momento crucial", declaró Pérez tras el encuentro.</p>

<p>Los Tigres tomaron la delantera desde temprano con una explosiva tercera entrada donde anotaron cinco carreras. Aunque los Leones intentaron una remontada en la séptima entrada, la sólida labor del bullpen dominicano selló la victoria.</p>

<p>Con este triunfo, los Tigres se posicionan como uno de los favoritos para llevarse el título de la Serie del Caribe, manteniendo vivas las esperanzas dominicanas en el torneo más importante del béisbol invernal.</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop',
        isBreaking: false,
        isFeatured: true,
        published: true,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        authorId: authorList[2].id,
        categoryId: newsCategories[3].id, // Deportes
        likes: 89,
        comments: 23,
        views: 2100
      },
      {
        title: 'Nueva Aplicación Dominicana Revoluciona el Comercio Electrónico Local',
        slug: 'nueva-aplicacion-dominicana-revoluciona-comercio-electronico',
        excerpt: 'Una startup dominicana lanza una innovadora plataforma que conecta pequeños comerciantes con consumidores, facilitando las compras online.',
        content: `<p>DominiShop, una nueva aplicación desarrollada por emprendedores dominicanos, está transformando la manera en que los pequeños comerciantes se conectan con sus clientes a través del comercio electrónico.</p>

<p>La plataforma, que ya cuenta con más de 500 comerciantes registrados y 10,000 usuarios activos, ofrece una solución integral que incluye catálogo digital, sistema de pagos y logística de entrega.</p>

<p>"Vimos la necesidad de democratizar el comercio electrónico para los pequeños negocios dominicanos", explicó María Fernanda Castillo, CEO y cofundadora de la empresa.</p>

<p>Las características principales de DominiShop incluyen:</p>
<ul>
<li>Interfaz intuitiva para comerciantes sin conocimientos técnicos</li>
<li>Integración con métodos de pago locales</li>
<li>Red de delivery que cubre toda la región metropolitana</li>
<li>Comisiones competitivas del 3.5% por transacción</li>
</ul>`,
        featuredImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
        isBreaking: false,
        isFeatured: false,
        published: true,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        authorId: authorList[3].id,
        categoryId: newsCategories[6].id, // Tecnología
        likes: 34,
        comments: 8,
        views: 890
      },
      {
        title: 'Dólar Estadounidense Alcanza Nuevo Máximo Frente al Peso Dominicano',
        slug: 'dolar-estadounidense-maximo-peso-dominicano',
        excerpt: 'La divisa norteamericana cerró la jornada en RD$58.50, marcando un nuevo récord en lo que va del año.',
        content: `<p>El dólar estadounidense alcanzó este martes un nuevo máximo frente al peso dominicano, cerrando la jornada cambiaria en RD$58.50 por cada dólar, lo que representa un incremento del 0.85% respecto al cierre anterior.</p>

<p>Esta alza se debe principalmente a factores externos como las decisiones de política monetaria de la Reserva Federal de Estados Unidos y la incertidumbre en los mercados internacionales.</p>

<p>El Banco Central de la República Dominicana (BCRD) ha indicado que mantiene herramientas suficientes para intervenir en el mercado cambiario si es necesario, aunque por el momento considera que la fluctuación se encuentra dentro de parámetros normales.</p>

<p>Los sectores más afectados por esta alza son:</p>
<ul>
<li>Importadores de materias primas</li>
<li>Empresas con deudas en dólares</li>
<li>Consumidores de productos importados</li>
</ul>

<p>Por otro lado, los exportadores y el sector turístico se ven beneficiados por un dólar más fuerte.</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
        isBreaking: true,
        isFeatured: false,
        published: true,
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        authorId: authorList[1].id,
        categoryId: newsCategories[2].id, // Economía
        likes: 67,
        comments: 18,
        views: 1560
      }
    ]).returning();
    */

    // Insert required system data only
    console.log('🏛️ Inserting provinces...');
    await db.insert(provinces).values([
      { name: 'Distrito Nacional', code: 'DN' },
      { name: 'Santo Domingo', code: 'SD' },
      { name: 'Santiago', code: 'ST' },
      { name: 'La Altagracia', code: 'AL' },
      { name: 'Puerto Plata', code: 'PP' },
      { name: 'San Cristóbal', code: 'SC' },
      { name: 'La Vega', code: 'LV' },
      { name: 'Azua', code: 'AZ' }
    ]);

    // Insert classified categories
    console.log('🏷️ Inserting classified categories...');
    await db.insert(classifiedCategories).values([
      { name: 'Vehículos', slug: 'vehiculos', icon: 'fa-car' },
      { name: 'Inmuebles', slug: 'inmuebles', icon: 'fa-home' },
      { name: 'Empleos', slug: 'empleos', icon: 'fa-briefcase' },
      { name: 'Electrónicos', slug: 'electronicos', icon: 'fa-mobile-alt' },
      { name: 'Hogar', slug: 'hogar', icon: 'fa-couch' },
      { name: 'Servicios', slug: 'servicios', icon: 'fa-tools' }
    ]);

    // Insert business categories
    console.log('🏪 Inserting business categories...');
    await db.insert(businessCategories).values([
      { name: 'Restaurantes', slug: 'restaurantes', icon: 'fa-utensils' },
      { name: 'Hoteles', slug: 'hoteles', icon: 'fa-bed' },
      { name: 'Productos Tech', slug: 'productos-tech', icon: 'fa-laptop' },
      { name: 'Servicios', slug: 'servicios', icon: 'fa-tools' }
    ]);

    console.log('✅ Database seeded successfully!');
    
    // Log summary
    console.log(`
📊 Seeded:
- ${newsCategories.length} news categories
- 8 provinces
- 6 classified categories
- 4 business categories
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });
}

export default seed;