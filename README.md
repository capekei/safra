# SafraReport - Dominican Republic News & Marketplace Platform

A cutting-edge news and marketplace platform delivering hyper-localized, mobile-first content experiences for Dominican Republic users.

## Features

### News Platform
- 📰 Professional news CMS with 10 categories (Nacional, Internacional, Economía, Deportes, etc.)
- 🔥 Breaking news ticker with real-time updates
- ⭐ Featured articles and hero content sections
- 📱 Mobile-first responsive design (optimized for 70% mobile users)
- 🌐 Spanish language support with Dominican idioms

### Marketplace & Classifieds
- 🏪 Classified ads system with 8 categories (Vehículos, Inmuebles, Empleos, etc.)
- 📍 Province-based location filtering for Dominican Republic
- 📸 Image gallery support with drag & drop uploads
- 💬 WhatsApp integration for direct contact
- ⏰ Auto-expiration after 30 days

### Business Reviews
- ⭐ 1-5 star rating system for local businesses
- 💰 Price indicators in DOP (Dominican Peso)
- 🏢 6 business categories (Restaurantes, Hoteles, Productos Tech, etc.)
- 📝 User-generated reviews with photo uploads

### Admin CMS
- 🔐 JWT-based authentication with role-based access (admin, editor, moderator)
- 📊 Real-time dashboard with statistics and metrics
- ✏️ Rich text editor with TipTap (bold, italic, headings, lists, links, images, tables)
- 📸 Multi-file upload support (images and videos)
- 📅 Scheduled publishing with date picker
- 👥 User management and moderation queue
- 📈 Audit logging with CSV export
- 🗄️ Database management tools

## Technology Stack

### Frontend
- **React 18** with TypeScript (strict mode)
- **Vite** for fast builds and HMR
- **Tailwind CSS** with custom Liquid Glass design system
- **shadcn/ui** components with Radix UI primitives
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js server
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Multer** for file uploads
- **JWT** authentication
- **Zod** validation

### Design System
- **Liquid Glass Theme**: Apple-inspired glassmorphism with frost effects
- **Mobile-First**: Optimized for Caribbean internet speeds
- **Responsive**: Desktop and mobile adaptations

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/safrareport.git
cd safrareport

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your DATABASE_URL and other secrets

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development
PORT=5000
```

## Project Structure

```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   └── lib/            # Utility functions
├── server/             # Express backend
│   ├── admin-routes.ts # Admin API endpoints
│   ├── routes.ts       # Public API endpoints
│   └── storage.ts      # Database interface
├── shared/             # Shared types and schemas
│   └── schema.ts       # Drizzle database schema
└── uploads/           # File upload directory
```

## API Endpoints

### Public API
- `GET /api/articles` - Get paginated articles
- `GET /api/articles/featured` - Get featured articles
- `GET /api/articles/breaking` - Get breaking news
- `GET /api/clasificados` - Get classified ads
- `GET /api/resenas` - Get business reviews

### Admin API
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/articles` - Create/update articles
- `GET /api/admin/moderation` - Moderation queue
- `GET /api/admin/audit-logs` - Audit history

## Deployment

### Render Deployment (Recommended)
This project is optimized for Render deployment with Supabase PostgreSQL. 

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

**Quick Deploy:**
1. Connect repository to Render
2. Render auto-detects `render.yaml` 
3. Automatic deployment with Supabase integration

**Local Development:**
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

## Features in Detail

### Real-Time Data
- Fuel prices with auto-refresh
- Exchange rates (USD/DOP)
- Weather information
- Breaking news ticker

### Content Management
- Multi-category article support
- Scheduled publishing
- Image and video uploads
- SEO optimization with meta tags

### User Experience
- Spanish error messages
- Loading states and skeletons
- Toast notifications
- Responsive navigation

## Development

### Database Schema
Uses Drizzle ORM with PostgreSQL:
- Articles with categories and authors
- Classified ads with provinces
- Business reviews with ratings
- User management with roles
- Audit logs for admin actions

### Error Handling
- Comprehensive validation with Zod
- Spanish error messages for Dominican users
- Detailed logging for debugging
- Graceful fallbacks for connectivity issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**SafraReport** - Delivering hyper-localized news and marketplace experiences for the Dominican Republic. 🇩🇴