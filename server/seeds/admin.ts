import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedAdminUser() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@safrareport.com'));
    
    if (!existingAdmin) {
      // Create default admin user
      await db.insert(users).values({
        id: 'admin_default',
        email: 'admin@safrareport.com',
        firstName: 'Admin',
        lastName: 'SafraReport',
        role: 'admin',
        profileImageUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D9B5C&color=fff',
      });
      
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

seedAdminUser();