# SafraReport Security Refactor & Schema Alignment

## Project Overview
SafraReport is a Vite/React + Express/Drizzle news platform backed by Supabase. The database schema has been updated to use admin_users (no longer authors), and critical security vulnerabilities need to be addressed.

## Security Issues Identified
- Emergency TLS bypass disabled certificate validation ✅ FIXED
- Insecure dev helper files exposed secrets ✅ FIXED  
- Legacy authors table references throughout codebase
- Hard-coded credentials removed ✅ FIXED
- Row Level Security not fully enabled
- Environment variables inconsistently configured

## Tasks

### 1. Authentication & Session Security
**Priority: High**
- [ ] Implement secure authentication using admin_users table via Supabase
- [ ] Hash passwords with bcrypt and store sessions in admin_sessions with secure cookies
- [ ] Remove any remaining hard-coded credentials from frontend

### 2. Schema Alignment & Legacy Cleanup  
**Priority: High**
- [ ] Remove all legacy authors imports from server code (IN PROGRESS)
- [ ] Update Drizzle schema to fully reference admin_users instead of authors
- [ ] Align ORM column names with DB (is_featured, is_breaking, published, etc.)
- [ ] Delete unused/duplicate .env and stray author-related files

### 3. Environment Configuration
**Priority: Medium**
- [ ] Consolidate environment variables into single .env.example
- [ ] Ensure SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, JWT_SECRET are defined
- [ ] Remove duplicate .env.production or outdated files
- [ ] Configure PostgreSQL pool with proper SSL option

### 4. Row Level Security (RLS) & Database Policies
**Priority: High**
- [ ] Enable RLS for all tables in Supabase
- [ ] Create policies for read-only access for anonymous users on articles
- [ ] Require admin_users authentication for insert/update operations
- [ ] Ensure no table is left publicly writable

### 5. Frontend Routing & UX
**Priority: Medium**
- [ ] Consolidate login routes into single /login page
- [ ] Redirect admins to /admin/dashboard after authentication
- [ ] Add proper fallback states: "No hay artículos destacados" for empty featured articles
- [ ] Add admin interfaces for creating/editing articles with featured/breaking toggles

### 6. Testing & Monitoring
**Priority: Medium**
- [ ] Add unit and integration tests using Jest or Vitest for API endpoints
- [ ] Test auth flows and admin routes
- [ ] Integrate logging library (Pino) to capture server errors without exposing secrets
- [ ] Add /health endpoint that checks database connectivity

### 7. Final Cleanup & Documentation
**Priority: Low**
- [ ] Update README with new configuration and setup instructions
- [ ] Update .env.example to reflect new configuration
- [ ] Commit all security changes
- [ ] Verify all security vulnerabilities are resolved

## Expected Outcome
After completion, SafraReport should:
- Authenticate admins securely via Supabase without exposing passwords
- Align ORM schema with actual database structure, eliminating 500 errors
- Load content reliably with accurate fallback states
- Enforce proper security through environment variables, RLS policies, and secure TLS handling
