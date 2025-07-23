import { db } from "./db";
import { authors } from "@shared/schema";

export async function seedAuthors() {
  console.log("Seeding authors...");
  
  try {
    // Check if authors already exist
    const existingAuthors = await db.select().from(authors);
    if (existingAuthors.length > 0) {
      console.log("Authors already exist, skipping seed");
      return;
    }

    // Insert default authors
    const defaultAuthors = [
      {
        name: "Juan Pérez",
        email: "juan.perez@safrareport.com",
        bio: "Editor principal de SafraReport con más de 10 años de experiencia en periodismo digital.",
      },
      {
        name: "María García",
        email: "maria.garcia@safrareport.com",
        bio: "Periodista especializada en economía y negocios en República Dominicana.",
      },
      {
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@safrareport.com",
        bio: "Corresponsal de deportes y eventos culturales.",
      },
      {
        name: "Ana Martínez",
        email: "ana.martinez@safrareport.com",
        bio: "Editora de contenido internacional y política.",
      },
      {
        name: "Luis Hernández",
        email: "luis.hernandez@safrareport.com",
        bio: "Especialista en tecnología y tendencias digitales.",
      },
      {
        name: "SafraReport Redacción",
        email: "redaccion@safrareport.com",
        bio: "Equipo editorial de SafraReport.",
      },
    ];

    await db.insert(authors).values(defaultAuthors);
    console.log(`Seeded ${defaultAuthors.length} authors`);
  } catch (error) {
    console.error("Error seeding authors:", error);
  }
}

