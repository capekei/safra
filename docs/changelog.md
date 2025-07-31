# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Monorepo Foundation**: Established pnpm workspace configuration
- **CI/CD Pipeline**: Comprehensive GitHub Actions workflow with linting, type-checking, testing, and security audit
- **Organized Documentation**: Moved documentation files to structured directories
- **Script Organization**: Organized scripts into logical categories (database, deployment, testing, maintenance, analysis)
- **Configuration Management**: Centralized deployment configurations

### Changed
- **Project Structure**: Reorganized root directory with clear separation of concerns
- **Documentation**: Moved deployment guides, testing guides, and security documentation to appropriate directories
- **Scripts**: Organized utility scripts into functional categories

### Removed
- **Root Clutter**: Moved configuration and documentation files from root directory to organized structure

## [1.0.0] - 2025-07-31

### Added
- Initial SafraReport application
- Vite + React frontend
- Express.js backend
- Supabase integration
- Drizzle ORM
- Tailwind CSS + Radix UI components
- Authentication system
- Article management system
- Admin panel
- Deployment configuration for Render

### Technical Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js 20+
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Deployment**: Render
- **Package Manager**: pnpm 