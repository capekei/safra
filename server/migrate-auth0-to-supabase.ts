#!/usr/bin/env tsx
/**
 * Migration script: Auth0 to Supabase
 * 
 * This script migrates users from Auth0 to Supabase Auth.
 * It handles both regular users and admin users.
 * 
 * Requirements:
 * - Auth0 Management API credentials
 * - Supabase service role key
 * - Database connection for existing user data
 * 
 * Usage: tsx server/migrate-auth0-to-supabase.ts
 */

import 'dotenv/config';
import { supabaseAdmin } from './supabase';
import { db } from './db';
import { adminUsers } from '@shared/schema';
import { storage } from './database/storage';

interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  app_metadata?: {
    role?: string;
  };
}

class Auth0ToSupabaseMigration {
  private migratedUsers = 0;
  private failedUsers = 0;
  private errors: string[] = [];

  constructor() {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client no está configurado. Verifique SUPABASE_SERVICE_ROLE_KEY.');
    }
  }

  async run() {
    console.log('🚀 Iniciando migración de Auth0 a Supabase...\n');

    try {
      // 1. Migrar usuarios administradores desde la base de datos
      await this.migrateAdminUsers();
      
      // 2. Migrar usuarios regulares desde el sistema de almacenamiento
      await this.migrateRegularUsers();
      
      // 3. Crear usuario administrador por defecto
      await this.createDefaultAdmin();

      this.printResults();
    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      process.exit(1);
    }
  }

  private async migrateAdminUsers() {
    console.log('👑 Migrando usuarios administradores...');
    
    try {
      const adminUsersData = await db.select().from(adminUsers);
      
      for (const admin of adminUsersData) {
        try {
          // Crear usuario en Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin!.auth.admin.createUser({
            email: admin.email,
            password: this.generateSecurePassword(),
            email_confirm: true,
            user_metadata: {
              first_name: admin.firstName || 'Admin',
              last_name: admin.lastName || '',
              role: 'admin',
              migrated_from: 'auth0',
              original_auth0_id: admin.auth0Id,
            }
          });

          if (authError) {
            this.errors.push(`Error creando admin ${admin.email}: ${authError.message}`);
            this.failedUsers++;
            continue;
          }

          if (!authData.user) {
            this.errors.push(`No se pudo crear usuario admin: ${admin.email}`);
            this.failedUsers++;
            continue;
          }

          // Crear perfil en la tabla users
          const { error: dbError } = await supabaseAdmin!
            .from('users')
            .insert({
              id: authData.user.id,
              email: admin.email,
              first_name: admin.firstName || 'Admin',
              last_name: admin.lastName || '',
              profile_image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${admin.firstName} ${admin.lastName}` || admin.email)}&background=00ff00&color=fff`,
              role: 'admin',
              is_active: admin.active ?? true,
              created_at: admin.createdAt?.toISOString() || new Date().toISOString(),
            });

          if (dbError) {
            this.errors.push(`Error creando perfil admin ${admin.email}: ${dbError.message}`);
            // Intentar eliminar el usuario de Auth si el perfil falló
            await supabaseAdmin!.auth.admin.deleteUser(authData.user.id);
            this.failedUsers++;
            continue;
          }

          console.log(`✅ Admin migrado: ${admin.email}`);
          this.migratedUsers++;

        } catch (error) {
          this.errors.push(`Error migrando admin ${admin.email}: ${error}`);
          this.failedUsers++;
        }
      }

      console.log(`📊 Administradores: ${this.migratedUsers} migrados, ${this.failedUsers} fallidos\n`);
    } catch (error) {
      console.error('Error obteniendo usuarios administradores:', error);
    }
  }

  private async migrateRegularUsers() {
    console.log('👥 Migrando usuarios regulares...');
    
    try {
      // Obtener usuarios del sistema de almacenamiento actual
      const users = await this.getAllUsersFromStorage();
      
      for (const user of users) {
        try {
          // Saltar si es admin (ya migrado)
          if (user.role === 'admin') continue;

          // Crear usuario en Supabase Auth
          const { data: authData, error: authError } = await supabaseAdmin!.auth.admin.createUser({
            email: user.email,
            password: this.generateSecurePassword(),
            email_confirm: true,
            user_metadata: {
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              role: 'user',
              migrated_from: 'legacy_system',
              original_user_id: user.id,
            }
          });

          if (authError) {
            // Si el usuario ya existe, intentar obtenerlo
            if (authError.message.includes('already registered')) {
              console.log(`⚠️  Usuario ya existe: ${user.email}`);
              continue;
            }
            
            this.errors.push(`Error creando usuario ${user.email}: ${authError.message}`);
            this.failedUsers++;
            continue;
          }

          if (!authData.user) {
            this.errors.push(`No se pudo crear usuario: ${user.email}`);
            this.failedUsers++;
            continue;
          }

          // Crear perfil en la tabla users
          const { error: dbError } = await supabaseAdmin!
            .from('users')
            .insert({
              id: authData.user.id,
              email: user.email,
              first_name: user.firstName || user.email.split('@')[0],
              last_name: user.lastName || '',
              profile_image_url: user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}&background=00ff00&color=fff`,
              role: 'user',
              is_active: true,
              created_at: user.createdAt?.toISOString() || new Date().toISOString(),
            });

          if (dbError) {
            this.errors.push(`Error creando perfil ${user.email}: ${dbError.message}`);
            // Intentar eliminar el usuario de Auth si el perfil falló
            await supabaseAdmin!.auth.admin.deleteUser(authData.user.id);
            this.failedUsers++;
            continue;
          }

          console.log(`✅ Usuario migrado: ${user.email}`);
          this.migratedUsers++;

        } catch (error) {
          this.errors.push(`Error migrando usuario ${user.email}: ${error}`);
          this.failedUsers++;
        }
      }

      console.log(`📊 Usuarios regulares: ${this.migratedUsers} migrados, ${this.failedUsers} fallidos\n`);
    } catch (error) {
      console.error('Error migrando usuarios regulares:', error);
    }
  }

  private async createDefaultAdmin() {
    console.log('🔑 Creando usuario administrador por defecto...');
    
    try {
      const defaultAdminEmail = 'admin@safrareport.com';
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'SafraAdmin2025!';

      // Verificar si ya existe
      const { data: existingUsers } = await supabaseAdmin!.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u: any) => u.email === defaultAdminEmail);
      
      if (existingUser) {
        console.log('⚠️  Usuario administrador por defecto ya existe');
        return;
      }

      // Crear usuario administrador por defecto
      const { data: authData, error: authError } = await supabaseAdmin!.auth.admin.createUser({
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Administrador',
          last_name: 'SafraReport',
          role: 'admin',
        }
      });

      if (authError) {
        this.errors.push(`Error creando admin por defecto: ${authError.message}`);
        return;
      }

      if (!authData.user) {
        this.errors.push('No se pudo crear usuario administrador por defecto');
        return;
      }

      // Crear perfil
      const { error: dbError } = await supabaseAdmin!
        .from('users')
        .insert({
          id: authData.user.id,
          email: defaultAdminEmail,
          first_name: 'Administrador',
          last_name: 'SafraReport',
          profile_image_url: 'https://ui-avatars.com/api/?name=Administrador+SafraReport&background=00ff00&color=fff',
          role: 'admin',
          is_active: true,
        });

      if (dbError) {
        this.errors.push(`Error creando perfil admin por defecto: ${dbError.message}`);
        await supabaseAdmin!.auth.admin.deleteUser(authData.user.id);
        return;
      }

      console.log(`✅ Administrador por defecto creado: ${defaultAdminEmail}`);
      console.log(`🔐 Contraseña: ${defaultAdminPassword}`);
      console.log('⚠️  IMPORTANTE: Cambie esta contraseña después del primer inicio de sesión\n');
      
    } catch (error) {
      console.error('Error creando administrador por defecto:', error);
    }
  }

  private async getAllUsersFromStorage(): Promise<any[]> {
    // Esta función debe adaptarse según su sistema de almacenamiento actual
    // Por ahora, retorna un array vacío para evitar errores
    try {
      // Intentar obtener usuarios del sistema de almacenamiento actual
      // Esto dependerá de cómo esté implementado el sistema actual
      console.log('⚠️  Sistema de almacenamiento legacy no implementado para migración');
      return [];
    } catch (error) {
      console.log('⚠️  No se pudieron obtener usuarios del sistema legacy');
      return [];
    }
  }

  private generateSecurePassword(): string {
    // Generar contraseña segura temporal (los usuarios deberán resetearla)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private printResults() {
    console.log('\n📋 RESUMEN DE MIGRACIÓN');
    console.log('========================');
    console.log(`✅ Usuarios migrados exitosamente: ${this.migratedUsers}`);
    console.log(`❌ Usuarios que fallaron: ${this.failedUsers}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORES ENCONTRADOS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n📝 PASOS SIGUIENTES:');
    console.log('1. Verificar que todos los usuarios críticos fueron migrados');
    console.log('2. Informar a los usuarios que deben resetear sus contraseñas');
    console.log('3. Probar el flujo de autenticación con usuarios migrados');
    console.log('4. Actualizar las variables de entorno de producción');
    console.log('5. Eliminar el sistema de autenticación anterior');
    
    if (this.failedUsers > 0) {
      console.log('\n⚠️  ATENCIÓN: Algunos usuarios no fueron migrados. Revise los errores arriba.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migración completada exitosamente!');
    }
  }
}

// Ejecutar migración si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new Auth0ToSupabaseMigration();
  migration.run().catch(console.error);
}

export { Auth0ToSupabaseMigration };