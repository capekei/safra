import { db } from '../db.js';
import { articles, categories, adminUsers, users } from '../../shared/schema.js';

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create test user (using existing schema)
    const [testUser] = await db.insert(users).values({
      id: 'test-user-1',
      email: 'admin@safrareport.com',
      first_name: 'Admin',
      last_name: 'SafraReport',
      role: 'admin',
    }).returning();

    console.log('✅ Created test user:', testUser.email);

    // Create test admin user
    const [testAuthor] = await db.insert(adminUsers).values({
      name: 'José Alvarez',
      email: 'jose@safrareport.com',
      bio: 'Editor principal de SafraReport',
      user_id: testUser.id,
    }).returning();

    console.log('✅ Created test author:', testAuthor.name);

    // Create test category
    const [testCategory] = await db.insert(categories).values({
      name: 'Noticias Nacionales',
      slug: 'noticias-nacionales',
      description: 'Noticias importantes de República Dominicana',
      icon: '🇩🇴',
      color: '#10B981',
    }).returning();

    console.log('✅ Created test category:', testCategory.name);

    // Create test articles
    const testArticles = [
      {
        title: 'Nueva inversión en energía renovable llegará a República Dominicana',
        slug: 'nueva-inversion-energia-renovable-republica-dominicana',
        content: `
          <p>El gobierno dominicano anunció hoy una nueva inversión millonaria en energía renovable que transformará el panorama energético del país.</p>
          
          <p>Esta iniciativa, que representa una inversión de más de US$500 millones, incluye la construcción de varios parques solares en las provincias de Monte Cristi, Barahona y Azua.</p>
          
          <h2>Beneficios para el país</h2>
          <p>Los beneficios esperados incluyen:</p>
          <ul>
            <li>Reducción del 30% en los costos de electricidad</li>
            <li>Creación de más de 2,000 empleos directos</li>
            <li>Disminución significativa de las emisiones de CO2</li>
          </ul>
          
          <p>El proyecto está programado para iniciarse en el primer trimestre del próximo año y se espera que esté completamente operativo para 2026.</p>
        `,
        excerpt: 'El gobierno anuncia una inversión de US$500 millones en energía renovable para transformar el sector energético nacional.',
        featured_image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=630&fit=crop',
        category_id: testCategory.id,
        author_id: testAuthor.id,
        status: 'published',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        is_featured: true,
        is_breaking: false,
        published: true,
        views: 1250,
        likes: 89,
      },
      {
        title: 'Sector turístico dominicano registra récord histórico en 2024',
        slug: 'sector-turistico-dominicano-record-historico-2024',
        content: `
          <p>El sector turístico de República Dominicana ha alcanzado cifras récord este año, superando todas las expectativas del gobierno y la industria.</p>
          
          <p>Según datos del Ministerio de Turismo, el país ha recibido más de 8.5 millones de visitantes en lo que va del año, representando un crecimiento del 15% comparado con el mismo período del año anterior.</p>
          
          <h2>Destinos más visitados</h2>
          <p>Los destinos que lideraron las preferencias fueron:</p>
          <ol>
            <li>Punta Cana - 45% del total de visitantes</li>
            <li>Puerto Plata - 20%</li>
            <li>Samaná - 18%</li>
            <li>Barahona - 12%</li>
            <li>Otros destinos - 5%</li>
          </ol>
          
          <p>Este crecimiento ha significado ingresos por más de US$8.2 mil millones para la economía nacional, consolidando al turismo como el principal motor económico del país.</p>
        `,
        excerpt: 'República Dominicana recibe más de 8.5 millones de turistas en 2024, estableciendo un nuevo récord histórico.',
        featured_image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=1200&h=630&fit=crop',
        category_id: testCategory.id,
        author_id: testAuthor.id,
        status: 'published',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        is_featured: false,
        is_breaking: true,
        published: true,
        views: 892,
        likes: 67,
      },
      {
        title: 'Gobierno lanza programa de digitalización para pequeñas empresas',
        slug: 'gobierno-lanza-programa-digitalizacion-pequenas-empresas',
        content: `
          <p>El Ministerio de Industria, Comercio y Mipymes presentó oficialmente el nuevo programa "Empresa Digital RD", una iniciativa que busca impulsar la transformación digital de las pequeñas y medianas empresas del país.</p>
          
          <p>El programa ofrece capacitación gratuita, herramientas tecnológicas subsidiadas y apoyo técnico para que las empresas puedan modernizar sus operaciones y competir en el mercado digital.</p>
          
          <h2>Componentes del programa</h2>
          <p>La iniciativa incluye:</p>
          <ul>
            <li>Capacitación en marketing digital y e-commerce</li>
            <li>Desarrollo de páginas web y presencia en redes sociales</li>
            <li>Implementación de sistemas de punto de venta digital</li>
            <li>Acceso a plataformas de facturación electrónica</li>
          </ul>
          
          <p>Se espera que más de 10,000 empresas se beneficien del programa durante su primera fase, que se extenderá hasta diciembre de 2025.</p>
        `,
        excerpt: 'Nueva iniciativa gubernamental busca digitalizar más de 10,000 pequeñas empresas dominicanas con capacitación y herramientas tecnológicas gratuitas.',
        featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop',
        category_id: testCategory.id,
        author_id: testAuthor.id,
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        is_featured: true,
        is_breaking: false,
        published: true,
        views: 445,
        likes: 23,
      }
    ];

    for (const article of testArticles) {
      const [createdArticle] = await db.insert(articles).values(article).returning();
      console.log('✅ Created article:', createdArticle.title);
    }

    console.log('🎉 Test data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData().then(() => {
    console.log('✅ Seeding process completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

export { seedTestData };