import { db } from "../db";
import { 
  categories, 
  articles, 
  adminUsers,
  provinces
} from "../../shared/index.js";
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

async function seedMinimalData() {
  console.log("🌱 Starting minimal database seeding...");

  try {
    // 1. Seed basic provinces (only essential columns)
    const provincesData = [
      { name: "Distrito Nacional", code: "DN", slug: "distrito-nacional" },
      { name: "Santo Domingo", code: "SD", slug: "santo-domingo" },
      { name: "Santiago", code: "ST", slug: "santiago" }
    ];

    console.log("📍 Seeding provinces...");
    await db.insert(provinces).values(provincesData).onConflictDoNothing();

    // 2. Seed basic categories
    const categoriesData = [
      { name: "Política", slug: "politica", icon: "⚖️", description: "Noticias sobre política nacional" },
      { name: "Deportes", slug: "deportes", icon: "⚽", description: "Cobertura deportiva nacional" },
      { name: "Economía", slug: "economia", icon: "💰", description: "Noticias económicas y financieras" }
    ];

    console.log("📂 Seeding categories...");
    await db.insert(categories).values(categoriesData).onConflictDoNothing();

    // 3. Seed admin user
    const adminUsersData = [
      {
        email: "admin@safra.do",
        username: "admin",
        password: await bcrypt.hash("admin123", 10),
        first_name: "Administrador",
        last_name: "Sistema",
        role: "admin",
        active: true
      }
    ];

    console.log("👤 Seeding admin users...");
    await db.insert(adminUsers).values(adminUsersData).onConflictDoNothing();

    // Get the inserted data for foreign keys
    const allCategories = await db.select().from(categories);
    const allProvinces = await db.select().from(provinces);
    const allAuthors = await db.select().from(adminUsers);

    // 4. Seed sample articles
    const articlesData = [
      {
        title: "Sistema de noticias SafraReport en funcionamiento",
        slug: "sistema-noticias-safrareport-funcionamiento",
        excerpt: "El nuevo sistema de noticias de SafraReport está operativo y listo para servir contenido actualizado.",
        content: "SafraReport presenta su nueva plataforma de noticias, diseñada para mantener informada a la comunidad dominicana con las últimas noticias locales e internacionales. El sistema cuenta con funcionalidades modernas y un diseño optimizado para dispositivos móviles.",
        featured_image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
        is_breaking: false,
        is_featured: true,
        published: true,
        published_at: new Date(),
        author_id: allAuthors[0].id,
        category_id: allCategories[0].id,
        province_id: allProvinces[0].id,
        status: "published",
        likes: 42,
        views: 156,
        comments: 8,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log("📰 Seeding articles...");
    await db.insert(articles).values(articlesData).onConflictDoNothing();

    console.log("✅ Minimal seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error during minimal seeding:", error);
    // Don't throw - let the deployment continue
    console.log("⚠️ Continuing deployment despite seeding errors...");
  }
}

// Execute seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMinimalData()
    .then(() => {
      console.log("🎉 Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedMinimalData };