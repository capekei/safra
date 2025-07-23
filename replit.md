# SafraReport - Dominican Republic News & Marketplace Platform

## Overview

SafraReport is a professional news and marketplace platform tailored for Dominican Republic users. It's a news-first platform with integrated classifieds and business reviews, designed with a focus on mobile-first architecture (70% mobile users) and optimized for Caribbean internet speeds. The platform includes a comprehensive custom CMS with admin dashboard, content management, user moderation, analytics, and role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a modern full-stack architecture with a clear separation between client and server:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Routing**: Client-side routing using Wouter
- **State Management**: TanStack Query for server state management

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with custom Liquid Glass design system
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **HTTP Client**: Fetch API with TanStack Query
- **Routing**: Wouter for lightweight client-side routing

## Key Components

### Database Layer
- **PostgreSQL**: Primary database using Neon serverless
- **Schema Management**: Drizzle schema with relations between articles, authors, categories, classifieds, businesses, and reviews
- **Migrations**: Automated schema migrations via Drizzle Kit

### API Layer
- **Express.js Server**: RESTful API with middleware for logging and error handling
- **Storage Interface**: Abstract storage layer for database operations
- **Error Handling**: Centralized error handling with Spanish error messages for Dominican users

### Frontend Components
- **Layout System**: Header, footer, and mobile bottom navigation
- **News Components**: Article cards, hero articles, breaking news ticker, category navigation
- **UI System**: Custom glass card components implementing Liquid Glass design
- **Responsive Design**: Mobile-first with desktop adaptations
- **Admin Components**: Dashboard, articles management, moderation queue, database management
- **Form Components**: Rich form handling with react-hook-form and zod validation

### Design System
- **Liquid Glass Theme**: Apple-inspired glassmorphism with frost effects
- **Custom Components**: GlassCard variants (default, hover, button, pill)
- **Color Palette**: Neutral base with primary green accent
- **Typography**: Clean, readable fonts optimized for Spanish content

## Data Flow

### Content Structure
1. **News Section (Primary)**
   - 10 categories: Nacional, Internacional, Economía, Deportes, etc.
   - Featured articles, breaking news, and categorized content
   - Routes: `/`, `/seccion/[slug]`, `/articulo/[slug]`

2. **Classifieds Section**
   - 8 categories: Vehículos, Inmuebles, Empleos, etc.
   - WhatsApp integration, image galleries, location-based search
   - Auto-expiration after 30 days
   - Routes: `/clasificados`, `/clasificados/[category]`

3. **Business Reviews Section**
   - 6 categories: Restaurantes, Hoteles, Productos Tech, etc.
   - 1-5 star rating system, price indicators (DOP ranges)
   - Routes: `/resenas`, `/resenas/[category]`

4. **Admin CMS Section**
   - JWT-based authentication with role-based access (admin, editor, moderator)
   - Dashboard with real-time statistics and metrics
   - Content management: Articles CRUD, publish/unpublish controls
   - Enhanced article editor:
     - Multiple category selection support
     - Image upload (drag & drop, up to 5 images)
     - Video upload (drag & drop, up to 3 videos, 50MB max)
     - Publishing status management (draft, published, scheduled)
     - Scheduled publishing with date picker
     - Rich text editor with TipTap (bold, italic, headings, lists, links, images, tables)
   - Classifieds management: View, filter, approve/reject/delete classified ads
   - Reviews management: Moderate business reviews, approve/reject with reasons
   - User management: Full CRUD for users, role assignment (admin/editor/moderator/user)
   - Moderation queue for user-submitted content
   - Database management: Schema visualization, SQL query editor, export/import
   - Audit logging: Complete activity tracking with filters, export to CSV
   - Routes: `/admin/*`
   - Default credentials: username: admin, password: admin123

### API Endpoints

#### Public Endpoints
- `GET /api/articles` - Paginated articles with category filtering
- `GET /api/articles/featured` - Featured articles for homepage
- `GET /api/articles/breaking` - Breaking news for ticker
- `GET /api/articles/:slug` - Individual article details
- Additional endpoints for classifieds and business reviews

#### Admin CMS Endpoints
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Session termination
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/articles` - List articles with filtering
- `POST /api/admin/articles` - Create/update article
- `DELETE /api/admin/articles/:id` - Delete article
- `GET /api/admin/classifieds` - List classifieds with filtering
- `POST /api/admin/classifieds/:id/approve` - Approve classified
- `POST /api/admin/classifieds/:id/reject` - Reject classified
- `DELETE /api/admin/classifieds/:id` - Delete classified
- `GET /api/admin/reviews` - List reviews with filtering
- `POST /api/admin/reviews/:id/approve` - Approve review
- `POST /api/admin/reviews/:id/reject` - Reject review
- `DELETE /api/admin/reviews/:id` - Delete review
- `GET /api/admin/users` - List users with stats
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/moderation` - Moderation queue
- `POST /api/admin/moderation/:id` - Approve/reject content
- `GET /api/admin/database/info` - Database schema info
- `POST /api/admin/database/query` - Execute SELECT queries
- `POST /api/admin/database/migrate` - Run migrations
- `GET /api/admin/database/export` - Export database backup
- `GET /api/admin/audit-logs` - View audit history with filters
- `GET /api/admin/audit-logs/export` - Export audit logs as CSV

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library
- **date-fns**: Date formatting with Spanish locale support

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **react-dropzone**: Drag and drop file uploads

### Development Dependencies
- **typescript**: Strict type checking
- **vite**: Fast build tool with HMR
- **tsx**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **TSX**: Direct TypeScript execution for backend
- **Database**: Neon serverless PostgreSQL

### Production Build
- **Frontend**: Static build via Vite to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database Migrations**: Automated via Drizzle Kit push command

### Performance Optimizations
- **Edge Caching**: Optimized for Caribbean internet speeds
- **Image Optimization**: Lazy loading and responsive images
- **Code Splitting**: Automatic route-based code splitting via Vite
- **Mobile PWA**: Service worker capabilities for offline caching

### Language Support
- **Primary**: Spanish (Dominican Spanish idioms)
- **Secondary**: English with persistent user preference
- **Currency**: DOP (Dominican Peso) primary, USD secondary

## Recent Changes

### January 22, 2025 (Latest Update) - Comprehensive Deployment Audit Complete
- **Application Deployment Issues Resolved**:
  - Fixed critical syntax error in server/storage.ts (unterminated template literal) that prevented app startup
  - Resolved TypeScript interface mismatches between database queries and expected return types  
  - Enhanced query client reliability with retry logic (3 retries, 1s delay) for better deployment robustness
  - Added comprehensive error handling with Spanish error messages for user-facing issues
  - Improved staleTime from infinity to 5 minutes to prevent caching issues in production
  - Added fallback date handling for articles (publishedAt || createdAt) to ensure proper rendering
  - **Added CORS support** with wildcard origin for deployment compatibility
  - **Enhanced logging**: Morgan middleware for server requests, detailed frontend error logging
  - **Improved fallbacks**: Better ArticleGrid empty state with reload button and user-friendly messaging
  - **Environment variable support**: VITE_API_BASE_URL for custom deployment URLs
  - **Production build verified**: Build completes successfully, all TypeScript issues resolved
  - **Status**: Application runs successfully with all 9 published articles displaying correctly
  - **API Performance**: All endpoints responding correctly (/api/articles returns 9 articles, /api/articles/featured returns 3)
  - **Database**: PostgreSQL connection stable with DATABASE_URL secret configured
  - **Frontend**: React Query loading with proper error handling and retry logic
- **Deployment Ready**: Enhanced logging, CORS configuration, production build verified
- **Debug Features**: Comprehensive fetch logging, error tracking, fallback UI with reload functionality
- **Database Connection Testing**: Added startup connection validation with detailed error reporting
- **Enhanced Error Handling**: Spanish error messages with deployment-specific fallback UI
- **Environment Validation**: Critical environment variable checks with graceful failure modes
- **Production Audit Complete**: Comprehensive deployment audit with all fixes implemented and tested
- **Custom Fetch Implementation**: VITE_API_BASE_URL support with cache: 'no-store' for deployment
- **Enhanced Debugging**: Debug button in article grid with environment information logging
- **Comprehensive Database Validation**: PostgreSQL format validation, SSL requirement checks, connection testing on startup
- **Detailed Error Diagnostics**: Enhanced error logging with troubleshooting steps, Spanish error messages
- **Replit Deployment Checklist**: Complete checklist and troubleshooting guide (REPLIT_DEPLOYMENT_CHECKLIST.md)
- **Advanced Environment Validation**: DATABASE_URL format validation, SSL mode verification, connection pool testing
- **Production-Ready Deployment**: All critical deployment issues addressed with comprehensive audit infrastructure

### January 22, 2025 - Real-Time Sidebar Data
- **Sidebar Cards Real-Time Updates**:
  - Created API endpoints for real-time data: `/api/fuel-prices`, `/api/exchange-rates`, `/api/weather`, `/api/trending`
  - Updated FuelPricesCard and WeatherCard components to fetch data using React Query
  - Implemented auto-refresh intervals: 5 minutes for fuel/exchange rates, 10 minutes for weather
  - Added loading animations with skeleton screens for better UX
  - Fixed price.toFixed() error by properly handling data types from API responses
  - Added trending articles endpoint that fetches most viewed articles from database
  - Formatted update times to show actual API fetch timestamps in Spanish (Dominican) locale
  - Exchange rates now show trend indicators (↑/↓) based on real-time data

### January 22, 2025
- **Administrative Panel Consolidation**:
  - Unified all admin access into single professional authentication system at `/safra-admin`
  - Implemented JWT-based token authentication for secure admin panel access
  - Fixed social media registration to properly create users and redirect to confirmation pages
  - Added proper authorization headers to admin API requests
  - Consolidated authentication middleware for consistent admin access control
  - Removed redundant admin access points, now single entry at `/safra-admin`
  - Admin credentials: username: `admin`, password: `admin123`

### January 22, 2025
- **Authentication System Overhaul**: 
  - Separated user and admin access paths (user icon → /cuenta, admin → /safra-admin)
  - Implemented social media login page with Google, Facebook, X, and Apple options
  - Created role-based authentication with user/admin role separation
  - Added mock authentication system for testing (stores user session in localStorage)
  - Special admin access route at /safra-admin for top-tier administrators
  - Admin panel only accessible to users with admin role through account page

### January 22, 2025 
- **User-Generated Content System**: 
  - Implemented comprehensive user dashboard at /cuenta/panel with content statistics and management
  - Created forms for users to post classifieds (/clasificados/nuevo) with image uploads and province selection
  - Built review submission system (/resenas/nueva) with star ratings and photo uploads
  - Added news preference customization (/cuenta/preferencias) with category selection and keyword tracking
  - Implemented backend API routes for user content submission with moderation workflows
  - Updated database schema to track user ownership of classifieds and reviews
  - Added moderation status (pending/approved/rejected) for user-generated content
  - Created user preferences table for personalized news feed configuration

### January 22, 2025
- **Ads Management System**: Implemented complete ad management with CRUD operations, placement targeting, and analytics tracking
- **SEO Enhancements**: Added meta tags component, sitemap.xml generation, and robots.txt endpoints
- **Geolocation Features**: Created province selector and map components for Dominican Republic provinces with classifieds integration
- **CSV Export**: Implemented CSV export functionality for admin audit logs
- **Replit Auth**: Integrated Replit authentication for admin users with automatic account creation
- **Article Page Enhancements**: 
  - Ultra-modern design with gradient typography and enhanced layout
  - Social media sharing component with X (2025), Facebook, WhatsApp, LinkedIn, and Telegram
  - Text-to-speech functionality with Spanish (Latin American only), English, and French support
  - Spain Spanish voices completely excluded from voice selection
  - Advanced audio controls: prominent speed adjustment (+/- buttons), pitch control, volume settings
  - Minimalist language selector without flag icons
  - Sidebar with author information, article statistics, and quick share buttons
  - Improved content presentation with featured image overlay and better typography
  - Enhanced pause/resume functionality in text-to-speech player