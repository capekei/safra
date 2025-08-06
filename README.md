# SafraReport - Dominican Republic News & Marketplace Platform

A modern, mobile-first news and marketplace platform built for the Dominican Republic, featuring news feeds, classifieds, reviews, and comprehensive admin tools.

## 🏗️ Architecture

**Single Repository Structure:**
- `src/client/` - React frontend with Vite
- `src/server/` - Express.js backend with TypeScript  
- `src/shared/` - Shared types, schemas, and DTOs

**Technology Stack:**
- **Frontend:** React 18, Vite, Tailwind CSS, React Query, Radix UI
- **Backend:** Express.js, TypeScript, Drizzle ORM  
- **Database:** PostgreSQL (Render)
- **Authentication:** JWT with bcrypt
- **Deployment:** Render (Single Service)
- **Runtime:** tsx transpilation for server

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 10.11.0+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/safrareport.git
cd safrareport

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start development servers
pnpm dev:all
```

### Development Commands

```bash
# Start all services in development mode
pnpm dev:all

# Build all packages
pnpm build:all

# Run tests across all packages
pnpm test:all

# Lint all packages
pnpm lint:all

# Type check all packages
pnpm type-check
```

## 📦 Monorepo Tooling

### Turborepo
- **Parallel builds** and caching for faster development
- **Dependency management** across packages
- **Incremental builds** with intelligent caching

```bash
# Run Turborepo commands
pnpm turbo build    # Build all packages
pnpm turbo dev      # Start all dev servers
pnpm turbo test     # Run all tests
```

### Changesets
- **Version management** for packages
- **Automated releases** with semantic versioning
- **Release notes** generation

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version-packages

# Release packages
pnpm release
```

### Storybook
- **UI component documentation**
- **Interactive component testing**
- **Design system showcase**

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

## 🏛️ Project Structure

```
safrareport/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
├── shared/                # Shared types and schemas
│   ├── src/
│   │   ├── schema.ts      # Drizzle schemas
│   │   ├── types.ts       # TypeScript types
│   │   └── enums.ts       # Common enums
│   └── package.json
├── packages/              # Additional packages
├── .storybook/           # Storybook configuration
├── turbo.json            # Turborepo configuration
├── .changeset/           # Changesets configuration
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## 🔧 Development

### Adding New Packages

1. Create a new directory in `packages/`
2. Initialize with `package.json`
3. Add to `pnpm-workspace.yaml`
4. Update `turbo.json` pipeline if needed

### Shared Dependencies

Use workspace dependencies for internal packages:

```json
{
  "dependencies": {
    "@safra/shared": "workspace:*"
  }
}
```

### Environment Variables

- Copy `.env.example` to `.env`
- Configure database credentials
- Use different `.env` files for different environments

## 🧪 Testing

```bash
# Run all tests
pnpm test:all

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run specific package tests
pnpm --filter @safra/client test
```

## 📚 Documentation

- [Deployment Guide](./docs/deployment/RENDER_DEPLOYMENT.md)
- [API Documentation](./docs/api/README.md)
- [Component Library](./docs/components/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Create a changeset: `pnpm changeset`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🏆 Elite Organization

This project follows elite organization principles with:
- **Structured monorepo** with clear package boundaries
- **Advanced tooling** (Turborepo, Changesets, Storybook)
- **Comprehensive testing** and quality assurance
- **Automated CI/CD** with GitHub Actions
- **Performance optimization** and caching strategies