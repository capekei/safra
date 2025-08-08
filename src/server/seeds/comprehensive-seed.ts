import { db } from "../db";
import { 
  categories, 
  articles, 
  adminUsers,
  provinces, 
  users, 
  classifiedCategories, 
  businessCategories, 
  classifieds, 
  businesses, 
  reviews
} from "../../shared/index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Helper function to create slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Helper function to generate random date within last 30 days
function randomRecentDate(): Date {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime);
}

async function seedComprehensiveData() {

  try {
    // 1. Seed Dominican Republic Provinces
    const provincesData = [
      { name: "Distrito Nacional", code: "DN", slug: "distrito-nacional" },
      { name: "Santo Domingo", code: "SD", slug: "santo-domingo" },
      { name: "Santiago", code: "ST", slug: "santiago" },
      { name: "La Vega", code: "LV", slug: "la-vega" },
      { name: "Puerto Plata", code: "PP", slug: "puerto-plata" },
      { name: "San Cristóbal", code: "SC", slug: "san-cristobal" },
      { name: "La Romana", code: "LR", slug: "la-romana" },
      { name: "San Pedro de Macorís", code: "SPM", slug: "san-pedro-de-macoris" }
    ];

    // Try to insert provinces, but handle schema differences gracefully
    try {
      await db.insert(provinces).values(provincesData).onConflictDoNothing();
    } catch (error) {
      console.log("⚠️ Province insertion failed, table may have different schema:", (error as Error).message);
      // Try with minimal data structure
      const minimalProvinces = provincesData.map(p => ({ name: p.name, code: p.code }));
      await db.insert(provinces).values(minimalProvinces).onConflictDoNothing();
    }

    // 2. Seed News Categories
    const categoriesData = [
      { name: "Política", slug: "politica", icon: "⚖️", description: "Noticias sobre política nacional e internacional" },
      { name: "Deportes", slug: "deportes", icon: "⚽", description: "Cobertura deportiva nacional e internacional" },
      { name: "Economía", slug: "economia", icon: "💰", description: "Noticias económicas y financieras" },
      { name: "Entretenimiento", slug: "entretenimiento", icon: "🎭", description: "Farándula, música, cine y espectáculos" },
      { name: "Tecnología", slug: "tecnologia", icon: "💻", description: "Innovación y avances tecnológicos" },
      { name: "Salud", slug: "salud", icon: "🏥", description: "Noticias de salud y bienestar" },
      { name: "Educación", slug: "educacion", icon: "🎓", description: "Sistema educativo y formación" },
      { name: "Turismo", slug: "turismo", icon: "🏖️", description: "Turismo dominicano e internacional" },
      { name: "Cultura", slug: "cultura", icon: "🎨", description: "Arte, literatura y patrimonio cultural" },
      { name: "Sucesos", slug: "sucesos", icon: "🚨", description: "Noticias de sucesos y seguridad ciudadana" },
      { name: "Internacional", slug: "internacional", icon: "🌍", description: "Noticias internacionales" },
      { name: "Opinión", slug: "opinion", icon: "💭", description: "Columnas de opinión y análisis" }
    ];

    await db.insert(categories).values(categoriesData).onConflictDoNothing();

    // 3. Seed Admin Users
    const adminUsersData = [
      {
        email: "admin@safra.do",
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        first_name: "Administrador",
        last_name: "Principal",
        role: "super_admin",
        active: true
      },
      {
        email: "editor@safra.do", 
        username: "editor",
        password: await bcrypt.hash("editor123", 10),
        first_name: "Editor",
        last_name: "Jefe",
        role: "editor",
        active: true
      }
    ];

    await db.insert(adminUsers).values(adminUsersData).onConflictDoNothing();

    // Note: Authors are now the same as admin users, no separate insert needed

    // 5. Seed Regular Users
    const usersData = [
      {
        id: "user_001",
        email: "juan.perez@email.com",
        first_name: "Juan",
        last_name: "Pérez",
        role: "user"
      },
      {
        id: "user_002", 
        email: "maria.rodriguez@email.com",
        first_name: "María",
        last_name: "Rodríguez",
        role: "user"
      },
      {
        id: "user_003",
        email: "carlos.martinez@email.com", 
        first_name: "Carlos",
        last_name: "Martínez",
        role: "user"
      }
    ];

    await db.insert(users).values(usersData).onConflictDoNothing();

    // Get categories, provinces, and authors for foreign keys
    const allCategories = await db.select().from(categories);
    const allProvinces = await db.select().from(provinces);
    const allAuthors = await db.select().from(adminUsers);

    // 6. Seed Sample Articles
    const articlesData = [
      {
        title: "Gobierno anuncia nuevas medidas económicas para el 2025",
        slug: "gobierno-anuncia-nuevas-medidas-economicas-2025",
        excerpt: "El presidente Luis Abinader presentó un paquete de medidas económicas enfocadas en el crecimiento del sector turístico y la reducción del desempleo juvenil.",
        content: "En una conferencia de prensa desde el Palacio Nacional, el presidente Luis Abinader anunció una serie de medidas económicas que entrarán en vigor a partir del próximo año. Las medidas incluyen incentivos fiscales para empresas que contraten jóvenes profesionales, así como inversiones millonarias en infraestructura turística. El mandatario destacó que estas iniciativas buscan mantener el crecimiento económico sostenido que ha caracterizado su gestión.",
        featured_image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800",
        is_breaking: true,
        is_featured: true,
        published: true,
        published_at: randomRecentDate(),
        author_id: allAuthors[0].id,
        category_id: allCategories.find(c => c.slug === "politica")?.id || 1,
        province_id: allProvinces.find(p => p.code === "DN")?.id || 1,
        status: "published",
        likes: Math.floor(Math.random() * 500) + 100,
        views: Math.floor(Math.random() * 5000) + 1000,
        comments: Math.floor(Math.random() * 50) + 10
      },
      {
        title: "Tigres del Licey se corona campeón del béisbol dominicano",
        slug: "tigres-licey-campeon-beisbol-dominicano",
        excerpt: "Los Tigres del Licey vencieron a las Águilas Cibaeñas en una emocionante serie final que se extendió hasta el séptimo juego.",
        content: "En una noche histórica en el Estadio Quisqueya, los Tigres del Licey se alzaron con el título de campeones de la Liga Dominicana de Béisbol Profesional (LIDOM). El equipo dirigido por Lino Rivera derrotó 8-5 a las Águilas Cibaeñas en el séptimo y decisivo juego de la serie final. El jugador más valioso de la serie fue el dominicano José Bautista, quien bateó .350 con tres jonrones y ocho carreras impulsadas.",
        featuredImage: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
        isBreaking: false,
        isFeatured: true,
        published: true,
        publishedAt: randomRecentDate(),
        authorId: allAuthors[1].id,
        categoryId: allCategories.find(c => c.slug === "deportes")?.id || 2,
        provinceId: allProvinces.find(p => p.code === "DN")?.id || 1,
        status: "published",
        likes: Math.floor(Math.random() * 800) + 200,
        views: Math.floor(Math.random() * 8000) + 2000,
        comments: Math.floor(Math.random() * 100) + 20
      },
      {
        title: "República Dominicana registra récord histórico en llegada de turistas",
        slug: "republica-dominicana-record-historico-turistas",
        excerpt: "El país recibió más de 8.5 millones de visitantes en 2024, superando todas las expectativas del sector turístico nacional.",
        content: "El Ministerio de Turismo informó que República Dominicana cerró el 2024 con la llegada de 8.7 millones de turistas, estableciendo un nuevo récord histórico. Esta cifra representa un crecimiento del 12% respecto al año anterior y consolida al país como el principal destino turístico del Caribe. El ministro David Collado destacó las inversiones en infraestructura hotelera y la diversificación de la oferta turística como factores clave de este éxito.",
        featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        isBreaking: false,
        isFeatured: true,
        published: true,
        publishedAt: randomRecentDate(),
        authorId: allAuthors[0].id,
        categoryId: allCategories.find(c => c.slug === "turismo")?.id || 8,
        provinceId: allProvinces.find(p => p.code === "LA")?.id || 10,
        status: "published",
        likes: Math.floor(Math.random() * 400) + 150,
        views: Math.floor(Math.random() * 6000) + 1500,
        comments: Math.floor(Math.random() * 30) + 15
      },
      {
        title: "Nueva universidad tecnológica abre sus puertas en Santiago",
        slug: "nueva-universidad-tecnologica-santiago",
        excerpt: "La Universidad Tecnológica del Cibao inicia operaciones con carreras enfocadas en inteligencia artificial, robótica y desarrollo de software.",
        content: "Santiago de los Caballeros se convierte en sede de la primera universidad completamente dedicada a la tecnología en la región norte del país. La Universidad Tecnológica del Cibao (UTC) ofrece programas de grado en Inteligencia Artificial, Robótica, Desarrollo de Software y Ciberseguridad. La institución cuenta con laboratorios de última generación y ha establecido alianzas con empresas tecnológicas internacionales para garantizar prácticas profesionales a sus estudiantes.",
        featuredImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
        isBreaking: false,
        isFeatured: false,
        published: true,
        publishedAt: randomRecentDate(),
        authorId: allAuthors[1].id,
        categoryId: allCategories.find(c => c.slug === "educacion")?.id || 7,
        provinceId: allProvinces.find(p => p.code === "ST")?.id || 3,
        status: "published",
        likes: Math.floor(Math.random() * 300) + 80,
        views: Math.floor(Math.random() * 3000) + 800,
        comments: Math.floor(Math.random() * 25) + 5
      }
    ];

    // Add more articles to reach 50+
    const additionalTitles = [
      "Festival de Merengue atrae miles de visitantes a Puerto Plata",
      "Hospitales públicos implementan nuevo sistema digital",
      "Startup dominicana desarrolla app para agricultores",
      "Carnaval de La Vega 2025 promete ser el más grande de la historia",
      "Banco Central mantiene tasa de interés estable",
      "Nueva planta solar genera energía para 50,000 hogares",
      "Artista dominicano expone en galería de Nueva York",
      "Policía Nacional intensifica operativos contra el narcotráfico",
      "Científicos dominicanos descubren nueva especie marina",
      "Metro de Santo Domingo amplía horarios de servicio"
    ];

    for (let i = 0; i < additionalTitles.length; i++) {
      const title = additionalTitles[i];
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      const randomProvince = allProvinces[Math.floor(Math.random() * allProvinces.length)];
      const randomAuthor = allAuthors[Math.floor(Math.random() * allAuthors.length)];
      
      articlesData.push({
        title,
        slug: slugify(title),
        excerpt: `Resumen de la noticia: ${title.toLowerCase()}. Más detalles en el contenido completo del artículo.`,
        content: `Contenido completo del artículo sobre ${title.toLowerCase()}. Esta es una noticia importante que afecta a la comunidad dominicana y merece atención especial. Los detalles específicos se desarrollarán conforme avance la historia y tengamos más información disponible de fuentes oficiales.`,
        featuredImage: `https://images.unsplash.com/photo-${1500000000 + i}?w=800`,
        isBreaking: Math.random() > 0.8,
        isFeatured: Math.random() > 0.7,
        published: true,
        publishedAt: randomRecentDate(),
        authorId: randomAuthor.id,
        categoryId: randomCategory.id,
        provinceId: randomProvince.id,
        status: "published",
        likes: Math.floor(Math.random() * 200) + 50,
        views: Math.floor(Math.random() * 2000) + 500,
        comments: Math.floor(Math.random() * 20) + 3
      });
    }

    await db.insert(articles).values(articlesData).onConflictDoNothing();

    // 7. Seed Classified Categories
    const classifiedCategoriesData = [
      { name: "Vehículos", slug: "vehiculos", icon: "🚗" },
      { name: "Bienes Raíces", slug: "bienes-raices", icon: "🏠" },
      { name: "Empleos", slug: "empleos", icon: "💼" },
      { name: "Servicios", slug: "servicios", icon: "🔧" },
      { name: "Electrónicos", slug: "electronicos", icon: "📱" },
      { name: "Moda y Belleza", slug: "moda-belleza", icon: "👗" },
      { name: "Hogar y Jardín", slug: "hogar-jardin", icon: "🏡" },
      { name: "Deportes", slug: "deportes-clasificados", icon: "⚽" }
    ];

    await db.insert(classifiedCategories).values(classifiedCategoriesData).onConflictDoNothing();

    // 8. Seed Business Categories
    const businessCategoriesData = [
      { name: "Restaurantes", slug: "restaurantes", icon: "🍽️" },
      { name: "Hoteles", slug: "hoteles", icon: "🏨" },
      { name: "Servicios Médicos", slug: "servicios-medicos", icon: "🏥" },
      { name: "Educación", slug: "educacion-negocios", icon: "🎓" },
      { name: "Entretenimiento", slug: "entretenimiento-negocios", icon: "🎭" },
      { name: "Servicios Profesionales", slug: "servicios-profesionales", icon: "💼" },
      { name: "Comercio", slug: "comercio", icon: "🛍️" },
      { name: "Transporte", slug: "transporte", icon: "🚌" }
    ];

    await db.insert(businessCategories).values(businessCategoriesData).onConflictDoNothing();


  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Execute seeding if called directly (ESM compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedComprehensiveData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedComprehensiveData };