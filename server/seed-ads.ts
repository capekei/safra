import { db } from "./db";
import { adPlacements, provinces } from "@shared/schema";

async function seedAdsData() {
  console.log("Seeding ad placements and provinces...");

  try {
    // Seed ad placements
    const placementsData = [
      {
        name: "Banner Principal",
        slug: "banner-principal",
        position: "home-top",
        width: 728,
        height: 90,
        description: "Banner horizontal en la parte superior de la página principal",
        active: true,
      },
      {
        name: "Rectángulo Mediano",
        slug: "rectangulo-mediano",
        position: "sidebar-top",
        width: 300,
        height: 250,
        description: "Rectángulo mediano en la barra lateral",
        active: true,
      },
      {
        name: "Banner Móvil",
        slug: "banner-movil",
        position: "mobile-banner",
        width: 320,
        height: 50,
        description: "Banner optimizado para dispositivos móviles",
        active: true,
      },
      {
        name: "Banner Artículo",
        slug: "banner-articulo",
        position: "article-middle",
        width: 728,
        height: 90,
        description: "Banner dentro del contenido del artículo",
        active: true,
      },
      {
        name: "Cuadrado Pequeño",
        slug: "cuadrado-pequeno",
        position: "sidebar-bottom",
        width: 250,
        height: 250,
        description: "Cuadrado en la parte inferior de la barra lateral",
        active: true,
      },
    ];

    await db.insert(adPlacements).values(placementsData).onConflictDoNothing();
    console.log("✓ Ad placements seeded");

    // Seed Dominican Republic provinces
    const provincesData = [
      { name: "Azua", code: "AZ" },
      { name: "Bahoruco", code: "BH" },
      { name: "Barahona", code: "BR" },
      { name: "Dajabón", code: "DJ" },
      { name: "Distrito Nacional", code: "DN" },
      { name: "Duarte", code: "DU" },
      { name: "Elías Piña", code: "EP" },
      { name: "El Seibo", code: "ES" },
      { name: "Espaillat", code: "ET" },
      { name: "Hato Mayor", code: "HM" },
      { name: "Hermanas Mirabal", code: "HMB" },
      { name: "Independencia", code: "IN" },
      { name: "La Altagracia", code: "LA" },
      { name: "La Romana", code: "LR" },
      { name: "La Vega", code: "LV" },
      { name: "María Trinidad Sánchez", code: "MTS" },
      { name: "Monseñor Nouel", code: "MN" },
      { name: "Monte Cristi", code: "MC" },
      { name: "Monte Plata", code: "MP" },
      { name: "Pedernales", code: "PD" },
      { name: "Peravia", code: "PV" },
      { name: "Puerto Plata", code: "PP" },
      { name: "Samaná", code: "SM" },
      { name: "Sánchez Ramírez", code: "SR" },
      { name: "San Cristóbal", code: "SC" },
      { name: "San José de Ocoa", code: "SJO" },
      { name: "San Juan", code: "SJ" },
      { name: "San Pedro de Macorís", code: "SPM" },
      { name: "Santiago", code: "ST" },
      { name: "Santiago Rodríguez", code: "STR" },
      { name: "Santo Domingo", code: "SD" },
      { name: "Valverde", code: "VV" },
    ];

    await db.insert(provinces).values(provincesData).onConflictDoNothing();
    console.log("✓ Provinces seeded");

    console.log("✅ Ads data seeding completed!");
  } catch (error) {
    console.error("Error seeding ads data:", error);
  } finally {
    process.exit(0);
  }
}

seedAdsData();