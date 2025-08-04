# SafraReport Security Refactor & Schema Alignment

## Project Overview
SafraReport is a Vite/React + Express/Drizzle news platform backed by Supabase. The database schema has been updated to use admin_users (no longer authors), and critical security vulnerabilities need to be addressed.

## Security Issues Identified
- Emergency TLS bypass disabled certificate validation ✅ FIXED
- Insecure dev helper files exposed secrets ✅ FIXED  
- Legacy authors table references throughout codebase ✅ FIXED
- Hard-coded credentials removed ✅ FIXED
- Row Level Security not fully enabled ✅ FIXED
- Environment variables inconsistently configured ✅ FIXED

## Tasks

### 1. Authentication & Session Security ✅ COMPLETED
**Priority: High**
- [x] Implement secure authentication using admin_users table via Supabase
- [x] Hash passwords with bcrypt and store sessions in admin_sessions with secure cookies
- [x] Remove any remaining hard-coded credentials from frontend

### 2. Schema Alignment & Legacy Cleanup ✅ COMPLETED
**Priority: High**
- [x] Remove all legacy authors imports from server code
- [x] Update Drizzle schema to fully reference admin_users instead of authors
- [x] Align ORM column names with DB (is_featured, is_breaking, published, etc.)
- [x] Delete unused/duplicate .env and stray author-related files

### 3. Environment Configuration ✅ COMPLETED
**Priority: Medium**
- [x] Consolidate environment variables into single .env.example
- [x] Ensure DATABASE_URL, JWT_SECRET are defined
- [x] Remove duplicate .env.production or outdated files
- [x] Configure PostgreSQL pool with proper SSL option

### 4. Row Level Security (RLS) & Database Policies ✅ COMPLETED
**Priority: High**
- [x] Enable RLS for all tables in database
- [x] Create policies for read-only access for anonymous users on articles
- [x] Require admin_users authentication for insert/update operations
- [x] Ensure no table is left publicly writable

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

### 7. Final Cleanup & Documentation ✅ COMPLETED
**Priority: Low**
- [x] Update README with new configuration and setup instructions
- [x] Update .env.example to reflect new configuration
- [x] Commit all security changes
- [x] Verify all security vulnerabilities are resolved

## Expected Outcome
After completion, SafraReport should:
- Authenticate admins securely via Supabase without exposing passwords
- Align ORM schema with actual database structure, eliminating 500 errors
- Load content reliably with accurate fallback states
- Enforce proper security through environment variables, RLS policies, and secure TLS handling
