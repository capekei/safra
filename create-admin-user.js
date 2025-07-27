// Temporary script to create admin user in development
// Run this with: node create-admin-user.js

import { db } from './server/db.js';
import { adminUsers } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    const adminEmail = 'admin@safra-report.com';
    
    // Check if admin user already exists
    const existingAdmin = await db.select().from(adminUsers).where(eq(adminUsers.email, adminEmail)).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists:', adminEmail);
      console.log('User details:', existingAdmin[0]);
      return;
    }

    // Create new admin user
    const newAdmin = await db.insert(adminUsers).values({
      email: adminEmail,
      name: 'SafraReport Admin',
      role: 'admin',
      auth0Id: 'development-admin-id', // Temporary Auth0 ID for development
      createdAt: new Date(),
      isActive: true
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Role: admin');
    console.log('💡 You can now login with this email through Auth0');
    console.log('🔗 Access admin panel at: http://localhost:4000/admin/dashboard');
    
    return newAdmin[0];
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('🎉 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});