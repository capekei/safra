# 🛠️ SafraReport Development Guide

## Local Development Setup

### Prerequisites
- Node.js 20+ and npm 10+
- PostgreSQL database (local or cloud)
- Git

### Installation
```bash
# 1. Clone repository
git clone https://github.com/capekei/safra.git
cd safra

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.production .env
# Edit .env with your local database credentials

# 4. Database setup
npm run db:push
npm run db:seed

# 5. Start development servers
npm run dev
```

### Development Commands
```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Client only (Vite dev server)
npm run dev:server       # Server only (tsx watch mode)

# Building
npm run build            # Production build
npm run build:client     # Client build only
npm run build:server     # Server build only

# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed with sample data
npm run db:migrate       # Run migrations

# Testing
npm run test             # Run all tests
npm run test:client      # Client tests only
npm run test:server      # Server tests only
npm run test:e2e         # End-to-end tests

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript check
npm run format           # Prettier format
```

## Project Structure

```
src/
├── client/              # React frontend
│   ├── components/      # React components
│   │   ├── ui/         # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── news/       # News-specific components
│   │   └── admin/      # Admin components
│   ├── pages/          # Route components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   └── __tests__/      # Component tests
├── server/             # Express.js backend
│   ├── routes/         # API route handlers
│   ├── middleware/     # Express middleware
│   ├── auth/           # Authentication logic
│   ├── database/       # Database utilities
│   ├── seeds/          # Database seeders
│   └── tests/          # API tests
└── shared/             # Shared types and schemas
    ├── types.ts        # TypeScript types
    ├── schema.ts       # Database schema
    └── enums.ts        # Shared enums
```

## Development Workflow

### Feature Development
1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Develop and test**: Use `npm run dev` for hot reloading
3. **Run tests**: `npm run test` before committing
4. **Type check**: `npm run type-check` for TypeScript
5. **Lint and format**: `npm run lint:fix && npm run format`
6. **Commit and push**: Standard git workflow

### Database Changes
1. **Update schema**: Modify `src/shared/schema.ts`
2. **Generate migration**: `npm run db:push`
3. **Test locally**: `npm run db:seed`
4. **Update seed data**: If needed in `src/server/seeds/`

### Component Development
1. **Create component**: In appropriate `src/client/components/` directory
2. **Add tests**: In `src/client/__tests__/`
3. **Update exports**: In component directory index files
4. **Test integration**: Use development server

## Debugging

### Client-Side Debugging
- **React DevTools**: Browser extension
- **Vite HMR**: Hot module replacement for instant updates
- **Console logs**: Standard browser debugging

### Server-Side Debugging
- **tsx watch mode**: Automatic restart on changes
- **API testing**: Use `/api/debug/` endpoints
- **Database queries**: Check server logs
- **Health check**: `/api/health` endpoint

### Common Issues
- **Import errors**: Check path aliases in `vite.config.ts`
- **Database connection**: Verify DATABASE_URL in `.env`
- **Port conflicts**: Check ports 5173 (client) and 4000 (server)
- **TypeScript errors**: Run `npm run type-check` for details

## Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Commit messages**: Conventional commits format

### Pull Request Process
1. **Create feature branch** from `main`
2. **Implement changes** with tests
3. **Run full test suite**: `npm run test`
4. **Update documentation** if needed
5. **Submit PR** with clear description