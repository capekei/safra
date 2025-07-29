# SafraReport Project Structure
## Estructura del Proyecto - Marketplace Dominicano

### 📁 Organización de Archivos

SafraReport ha sido organizado con una estructura limpia y eficiente, optimizada para el mercado dominicano:

#### 🏠 Root Directory (Archivos Principales)
```
SafraReport/
├── README.md              # Documentación principal
├── LICENSE                # Licencia del proyecto
├── CLAUDE.md              # Instrucciones para Claude AI
├── GEMINI.md              # Instrucciones para Gemini AI
├── package.json           # Dependencias del proyecto
├── package-lock.json      # Lock file de dependencias
├── tsconfig.json          # Configuración TypeScript
├── vite.config.ts         # Configuración Vite bundler
├── tailwind.config.ts     # Configuración Tailwind CSS
├── postcss.config.js      # Configuración PostCSS
├── components.json        # Configuración componentes UI
├── drizzle.config.ts      # Configuración base de datos
└── middleware.ts          # Middleware de aplicación
```

#### 📚 Documentation (`docs/`)
```
docs/
├── README.md              # Índice de documentación
├── deployment/
│   ├── railway.md         # Guía Railway
│   ├── replit-checklist.md # Lista Replit
│   ├── audit.md           # Auditoría despliegue
│   └── supabase-migration.md # Migración Supabase
├── guides/
│   ├── routing.md         # Configuración rutas
│   ├── proxy-setup.md     # Setup proxy
│   └── lighthouse-optimization.md # Optimización
└── admin/
    └── access-guide.md    # Guía acceso admin
```

#### 🔧 Scripts (`scripts/`)
```
scripts/
├── README.md              # Documentación scripts
├── database/
│   ├── create-admin-user.js # Crear admin
│   └── backup.sql         # Respaldo BD
├── deployment/
│   └── setup-supabase-env.sh # Config Supabase
├── testing/
│   ├── test-commands.sh   # Pruebas principales
│   ├── complete-solution.sh # Prueba completa
│   └── ts-fixes.sh        # Pruebas TypeScript
├── maintenance/
│   ├── safe-cleanup.sh    # Limpieza segura
│   ├── fix-import-paths.sh # Corregir imports
│   ├── fix-ts-quick.sh    # Correcciones TS
│   ├── final-fix.sh       # Correcciones finales
│   ├── dr-organize-root-files.sh # Organizar
│   └── dr-organize-root-safe.sh # Organizar seguro
└── analysis/
    ├── cleanup-analysis.sh # Análisis limpieza
    └── organize-files.sh  # Organizar archivos
```

#### ⚙️ Configuration (`config/`)
```
config/
├── README.md              # Documentación config
└── deployment/
    ├── railway.toml       # Config Railway
    ├── railway-healthcheck.js # Health check
    └── replit.md         # Notas Replit
```

#### 🛠️ Tools (`tools/`)
```
tools/
├── README.md              # Documentación herramientas
└── testing/
    ├── quick-access-test.html # Prueba acceso
    ├── lighthouse-desktop-report.json # Reporte desktop
    └── lighthouse-mobile-report.json # Reporte móvil
```

#### 💻 Application Structure
```
client/                    # Frontend React + TypeScript
├── src/
│   ├── components/
│   │   ├── admin/        # Componentes admin
│   │   ├── auth/         # Autenticación
│   │   ├── error/        # Manejo errores (DRErrorBoundary)
│   │   ├── alert/        # Alertas móviles (DRMobileAlert)
│   │   ├── layout/       # Layout componentes
│   │   ├── news/         # Componentes noticias
│   │   └── ui/           # Componentes UI base
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilidades y helpers
│   ├── pages/            # Páginas de la aplicación
│   └── utils/            # Utilidades generales
└── components/           # Componentes externos

server/                   # Backend Express + TypeScript
├── routes/
│   ├── admin/           # Rutas administrativas
│   ├── user/            # Rutas de usuario
│   └── author-routes.ts # Rutas de autores
├── middleware/
│   ├── admin.ts         # Middleware admin
│   └── auth.ts          # Middleware autenticación
├── database/
│   └── storage.ts       # Capa de almacenamiento
├── lib/
│   └── helpers/
│       └── dominican.ts # Helpers dominicanos
└── seeds/               # Datos iniciales

shared/                  # Código compartible
├── schema.ts           # Esquemas de base de datos
├── supabase-storage.ts # Storage Supabase
└── supabase.ts         # Cliente Supabase
```

### 🇩🇴 Dominican Republic Optimizations

#### Spanish-First Features
- Error messages in Spanish
- Dominican Spanish locale (es-DO)
- DOP currency formatting
- Dominican phone validation
- Cédula validation

#### Mobile-First Design
- Responsive components (`sm:`, `md:`, `lg:` classes)
- Touch-friendly interfaces
- Optimized for slow connections
- Progressive Web App features

#### Dominican Market Features
- Province-specific filtering
- Dominican business hours validation
- Local payment methods support
- WhatsApp integration ready
- Local timezone (EST -04:00)

### 🚀 Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Database operations
npm run db:migrate
npm run db:seed

# Maintenance scripts
./scripts/testing/test-commands.sh
./scripts/maintenance/safe-cleanup.sh
```

### 📊 File Organization Benefits

1. **Clean Root Directory**: Only essential config files remain in root
2. **Logical Grouping**: Files organized by functionality
3. **Spanish Documentation**: All docs include Spanish translations
4. **Maintainable Structure**: Easy to find and modify files
5. **Scalable Architecture**: Ready for team development
6. **Dominican Optimized**: Tailored for Dominican Republic market

### 🔒 Security & Best Practices

- Backup scripts before any major changes
- Spanish error messages for better UX
- Type-safe implementations
- Production-ready error handling
- Secure authentication with Supabase
- Rate limiting and CSRF protection

---

**SafraReport** - Marketplace optimizado para República Dominicana 🇩🇴