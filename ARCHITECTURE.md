# 🏛️ SafraReport Architecture Overview

## System Architecture

SafraReport is a modern, single-repository web application optimized for the Dominican Republic market, featuring news aggregation, classified ads, and business reviews.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Render Deployment                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)           Backend (Express)     Database      │
│  ┌─────────────────┐        ┌─────────────────┐   ┌──────────┐  │
│  │ Vite + React 18 │────────│ Express + tsx   │───│PostgreSQL│  │
│  │ Tailwind CSS    │        │ JWT Auth        │   │ (Render) │  │
│  │ Radix UI        │        │ Drizzle ORM     │   │          │  │
│  │ React Query     │        │ Rate Limiting   │   │          │  │
│  └─────────────────┘        └─────────────────┘   └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure
```
src/client/components/
├── ui/                 # Base UI components (Radix + Tailwind)
├── layout/             # Header, Footer, Navigation
├── news/               # Article cards, grids, categories
├── admin/              # Admin panel components
└── location/           # Dominican Republic specific components
```

### State Management
- **React Query**: Server state management and caching
- **React Context**: Authentication and global UI state
- **Local State**: Component-specific state with hooks

### Routing
- **Wouter**: Lightweight client-side routing
- **Protected Routes**: Admin authentication guards
- **Dynamic Routes**: Article slugs, categories, provinces

## Backend Architecture

### API Structure
```
src/server/routes/
├── /api/articles       # News and content management
├── /api/clasificados   # Classified advertisements
├── /api/resenas        # Business reviews
├── /api/admin/         # Administrative functions
├── /api/auth           # Authentication endpoints
└── /api/health         # Health checks and monitoring
```

### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: API protection
4. **JWT Authentication**: User sessions
5. **Request Logging**: Morgan + Pino
6. **Error Handling**: Centralized error management

### Database Layer
- **Drizzle ORM**: Type-safe database queries
- **Connection Pooling**: Optimized for Render PostgreSQL
- **Migrations**: Version-controlled schema changes
- **Seeding**: Sample data for development

## Data Models

### Core Entities
```typescript
// Articles (News Content)
articles {
  id: serial
  title: string
  slug: string
  content: text
  category_id: integer
  author_id: integer
  published: boolean
  created_at: timestamp
}

// Classifieds (Marketplace)
classifieds {
  id: serial
  title: string
  description: text
  price: decimal
  category_id: integer
  province_id: integer
  user_id: string
  status: enum
}

// Business Reviews
businesses {
  id: serial
  name: string
  description: text
  category_id: integer
  province_id: integer
  average_rating: decimal
}
```

### Dominican Republic Specific Features
- **31 Provinces**: Complete geographical coverage
- **Peso Dominicano (DOP)**: Native currency support
- **Spanish Localization**: es-DO locale
- **Mobile-First**: Optimized for Dominican mobile networks

## Security Architecture

### Authentication Flow
```
1. User Login → JWT Token Generation
2. Token Storage → HttpOnly Cookie + Local Storage
3. API Requests → Bearer Token Validation
4. Admin Routes → Role-based Access Control
5. Session Management → Refresh Token Rotation
```

### Security Measures
- **bcrypt**: Password hashing (12 rounds)
- **JWT**: Stateless authentication
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Zod schema validation
- **SQL Injection**: Parameterized queries via Drizzle

## Performance Architecture

### Frontend Optimization
- **Code Splitting**: Dynamic imports for routes
- **Bundle Size**: 484kB optimized production build
- **Asset Optimization**: Vite build optimizations
- **Caching**: React Query with stale-while-revalidate

### Backend Optimization
- **Runtime Transpilation**: tsx for zero-build deployment
- **Database Indexing**: Optimized queries
- **Response Compression**: Gzip compression
- **Connection Pooling**: Efficient database connections

### Render Deployment Benefits
- **Auto-scaling**: 1-3 instances based on load
- **Global CDN**: Asset distribution
- **Zero-downtime**: Rolling deployments
- **Health Monitoring**: Automatic restart on failures

## Migration Architecture

SafraReport successfully migrated from a complex monorepo to a streamlined single repository:

### Before (Monorepo)
- **pnpm workspaces**: Complex dependency management
- **Turborepo**: Build orchestration overhead
- **Multiple configs**: Scattered configuration files
- **Vercel + Railway**: Multiple deployment targets
- **$50/month**: Higher infrastructure costs

### After (Single Repo)
- **npm**: Simplified package management
- **Direct builds**: Streamlined build process
- **Unified config**: Centralized configuration
- **Render**: Single deployment target
- **$14/month**: 72% cost reduction

## Scalability Considerations

### Current Capacity
- **Single Render Service**: Handles moderate traffic
- **PostgreSQL**: Standard database tier
- **Auto-scaling**: Up to 3 instances

### Growth Path
1. **Database Scaling**: Upgrade PostgreSQL tier
2. **CDN Integration**: Static asset optimization
3. **Caching Layer**: Redis for session storage
4. **Microservices**: Split by domain if needed
5. **Mobile App**: React Native integration

## Dominican Republic Context

### Market Optimization
- **Mobile-First**: 70%+ mobile internet usage
- **3G Networks**: Optimized for slower connections
- **Spanish Content**: Native language support
- **Local Payment**: DOP currency integration
- **Provincial Coverage**: All 31 provinces supported

### Content Strategy
- **Breaking News**: Real-time updates
- **Classified Ads**: Local marketplace
- **Business Reviews**: Community-driven ratings
- **Cultural Events**: Dominican-specific content
- **Weather Integration**: Caribbean climate data