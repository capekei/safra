# Task Master AI - Agent Integration Guide

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research        # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Key Files & Project Structure

### Core Files

- `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
- `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
- `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
- `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
- `.env` - API keys for CLI usage

### Claude Code Integration Files

- `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
- `.claude/settings.json` - Claude Code tool allowlist and preferences
- `.claude/commands/` - Custom slash commands for repeated workflows
- `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Task files directory
│   │   ├── tasks.json      # Main task database
│   │   ├── task-1.md      # Individual task files
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd.txt        # Product requirements
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.txt  # Example PRD template
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .env                  # API keys
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

## MCP Integration

Task Master provides an MCP server that Claude Code can connect to. Configure in `.mcp.json`:

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "PERPLEXITY_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "OPENAI_API_KEY_HERE",
        "GOOGLE_API_KEY": "GOOGLE_API_KEY_HERE",
        "XAI_API_KEY": "XAI_API_KEY_HERE",
        "OPENROUTER_API_KEY": "OPENROUTER_API_KEY_HERE",
        "MISTRAL_API_KEY": "MISTRAL_API_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "AZURE_OPENAI_API_KEY_HERE",
        "OLLAMA_API_KEY": "OLLAMA_API_KEY_HERE"
      }
    }
  }
}
```

### Essential MCP Tools

```javascript
help; // = shows available taskmaster commands
// Project setup
initialize_project; // = task-master init
parse_prd; // = task-master parse-prd

// Daily workflow
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// Task management
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// Analysis
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## Claude Code Workflow Integration

### Standard Development Workflow

#### 1. Project Initialization

```bash
# Initialize Task Master
task-master init

# Create or obtain PRD, then parse it
task-master parse-prd .taskmaster/docs/prd.txt

# Analyze complexity and expand tasks
task-master analyze-complexity --research
task-master expand --all --research
```

If tasks already exist, another PRD can be parsed (with new information only!) using parse-prd with --append flag. This will add the generated tasks to the existing list of tasks..

#### 2. Daily Development Loop

```bash
# Start each session
task-master next                           # Find next available task
task-master show <id>                     # Review task details

# During implementation, check in code context into the tasks and subtasks
task-master update-subtask --id=<id> --prompt="implementation notes..."

# Complete tasks
task-master set-status --id=<id> --status=done
```

#### 3. Multi-Claude Workflows

For complex projects, use multiple Claude Code sessions:

```bash
# Terminal 1: Main implementation
cd project && claude

# Terminal 2: Testing and validation
cd project-test-worktree && claude

# Terminal 3: Documentation updates
cd project-docs-worktree && claude
```

### Custom Slash Commands

Create `.claude/commands/taskmaster-next.md`:

```markdown
Find the next available Task Master task and show its details.

Steps:

1. Run `task-master next` to get the next task
2. If a task is available, run `task-master show <id>` for full details
3. Provide a summary of what needs to be implemented
4. Suggest the first implementation step
```

Create `.claude/commands/taskmaster-complete.md`:

```markdown
Complete a Task Master task: $ARGUMENTS

Steps:

1. Review the current task with `task-master show $ARGUMENTS`
2. Verify all implementation is complete
3. Run any tests related to this task
4. Mark as complete: `task-master set-status --id=$ARGUMENTS --status=done`
5. Show the next available task with `task-master next`
```

## Tool Allowlist Recommendations

Add to `.claude/settings.json`:

```json
{
  "allowedTools": [
    "Edit",
    "Bash(task-master *)",
    "Bash(git commit:*)",
    "Bash(git add:*)",
    "Bash(npm run *)",
    "mcp__task_master_ai__*"
  ]
}
```

## Configuration & Setup

### API Keys Required

At least **one** of these API keys must be configured:

- `ANTHROPIC_API_KEY` (Claude models) - **Recommended**
- `PERPLEXITY_API_KEY` (Research features) - **Highly recommended**
- `OPENAI_API_KEY` (GPT models)
- `GOOGLE_API_KEY` (Gemini models)
- `MISTRAL_API_KEY` (Mistral models)
- `OPENROUTER_API_KEY` (Multiple models)
- `XAI_API_KEY` (Grok models)

An API key is required for any provider used across any of the 3 roles defined in the `models` command.

### Model Configuration

```bash
# Interactive setup (recommended)
task-master models --setup

# Set specific models
task-master models --set-main claude-3-5-sonnet-20241022
task-master models --set-research perplexity-llama-3.1-sonar-large-128k-online
task-master models --set-fallback gpt-4o-mini
```

## Task Structure & IDs

### Task ID Format

- Main tasks: `1`, `2`, `3`, etc.
- Subtasks: `1.1`, `1.2`, `2.1`, etc.
- Sub-subtasks: `1.1.1`, `1.1.2`, etc.

### Task Status Values

- `pending` - Ready to work on
- `in-progress` - Currently being worked on
- `done` - Completed and verified
- `deferred` - Postponed
- `cancelled` - No longer needed
- `blocked` - Waiting on external factors

### Task Fields

```json
{
  "id": "1.2",
  "title": "Implement user authentication",
  "description": "Set up JWT-based auth system",
  "status": "pending",
  "priority": "high",
  "dependencies": ["1.1"],
  "details": "Use bcrypt for hashing, JWT for tokens...",
  "testStrategy": "Unit tests for auth functions, integration tests for login flow",
  "subtasks": []
}
```

## Claude Code Best Practices with Task Master

### Context Management

- Use `/clear` between different tasks to maintain focus
- This CLAUDE.md file is automatically loaded for context
- Use `task-master show <id>` to pull specific task context when needed

### Iterative Implementation

1. `task-master show <subtask-id>` - Understand requirements
2. Explore codebase and plan implementation
3. `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan
4. `task-master set-status --id=<id> --status=in-progress` - Start work
5. Implement code following logged plan
6. `task-master update-subtask --id=<id> --prompt="what worked/didn't work"` - Log progress
7. `task-master set-status --id=<id> --status=done` - Complete task

### Complex Workflows with Checklists

For large migrations or multi-step processes:

1. Create a markdown PRD file describing the new changes: `touch task-migration-checklist.md` (prds can be .txt or .md)
2. Use Taskmaster to parse the new prd with `task-master parse-prd --append` (also available in MCP)
3. Use Taskmaster to expand the newly generated tasks into subtasks. Consdier using `analyze-complexity` with the correct --to and --from IDs (the new ids) to identify the ideal subtask amounts for each task. Then expand them.
4. Work through items systematically, checking them off as completed
5. Use `task-master update-subtask` to log progress on each task/subtask and/or updating/researching them before/during implementation if getting stuck

### Git Integration

Task Master works well with `gh` CLI:

```bash
# Create PR for completed task
gh pr create --title "Complete task 1.2: User authentication" --body "Implements JWT auth system as specified in task 1.2"

# Reference task in commits
git commit -m "feat: implement JWT auth (task 1.2)"
```

### Parallel Development with Git Worktrees

```bash
# Create worktrees for parallel task development
git worktree add ../project-auth feature/auth-system
git worktree add ../project-api feature/api-refactor

# Run Claude Code in each worktree
cd ../project-auth && claude    # Terminal 1: Auth work
cd ../project-api && claude     # Terminal 2: API work
```

## Troubleshooting

### AI Commands Failing

```bash
# Check API keys are configured
cat .env                           # For CLI usage

# Verify model configuration
task-master models

# Test with different model
task-master models --set-fallback gpt-4o-mini
```

### MCP Connection Issues

- Check `.mcp.json` configuration
- Verify Node.js installation
- Use `--mcp-debug` flag when starting Claude Code
- Use CLI as fallback if MCP unavailable

### Task File Sync Issues

```bash
# Regenerate task files from tasks.json
task-master generate

# Fix dependency issues
task-master fix-dependencies
```

DO NOT RE-INITIALIZE. That will not do anything beyond re-adding the same Taskmaster core files.

## Important Notes

### AI-Powered Operations

These commands make AI calls and may take up to a minute:

- `parse_prd` / `task-master parse-prd`
- `analyze_project_complexity` / `task-master analyze-complexity`
- `expand_task` / `task-master expand`
- `expand_all` / `task-master expand --all`
- `add_task` / `task-master add-task`
- `update` / `task-master update`
- `update_task` / `task-master update-task`
- `update_subtask` / `task-master update-subtask`

### File Management

- Never manually edit `tasks.json` - use commands instead
- Never manually edit `.taskmaster/config.json` - use `task-master models`
- Task markdown files in `tasks/` are auto-generated
- Run `task-master generate` after manual changes to tasks.json

### Claude Code Session Management

- Use `/clear` frequently to maintain focused context
- Create custom slash commands for repeated Task Master workflows
- Configure tool allowlist to streamline permissions
- Use headless mode for automation: `claude -p "task-master next"`

### Multi-Task Updates

- Use `update --from=<id>` to update multiple future tasks
- Use `update-task --id=<id>` for single task updates
- Use `update-subtask --id=<id>` for implementation logging

### Research Mode

- Add `--research` flag for research-based AI enhancement
- Requires a research model API key like Perplexity (`PERPLEXITY_API_KEY`) in environment
- Provides more informed task creation and updates
- Recommended for complex technical tasks

---

_This guide ensures Claude Code has immediate access to Task Master's essential functionality for agentic development workflows._

# SafraReport - AI Assistant Context

## 🚀 Project Overview
**Name**: SafraReport  
**Type**: Dominican Republic News and Marketplace Platform  
**Stage**: Production-Ready (Migrating to Render)  
**Repository**: /Users/josealvarez/Desktop/SafraReport  
**Architecture**: Converting from Monorepo to Single Repo

## 🎯 Current Migration
**Goal**: Consolidate everything to Render (hosting + database) and simplify to single repo structure

### Migration Status
- [ ] Convert monorepo to single repo
- [ ] Migrate database from Neon/Supabase to Render PostgreSQL
- [ ] Replace Supabase Auth with simple JWT auth
- [ ] Deploy everything to Render
- [ ] Organize root-level files properly

## 🏗️ Architecture

### Current State (Monorepo)
- **Structure**: pnpm workspaces with Turborepo
- **Issues**: pnpm/Vite conflicts, complex build process
- **Packages**: client/, server/, shared/, packages/

### Target State (Single Repo)
- **Structure**: Unified src/ directory
- **Package Manager**: npm (simpler, no conflicts)
- **Build**: Direct commands, no turborepo

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.0
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **State Management**: @tanstack/react-query 5.60.5
- **Routing**: Wouter 3.3.5
- **Validation**: Zod 3.24.2
- **Port**: 3000 (development)

### Backend
- **Runtime**: Node.js v23.11.0
- **Framework**: Express.js 4.21.2 with TypeScript
- **ORM**: Drizzle ORM 0.39.3
- **Authentication**: JWT + bcrypt (replacing Supabase Auth)
- **Logging**: Pino 9.7.0
- **Security**: Helmet 8.1.0
- **Port**: 4000
- **API Style**: REST with OpenAPI documentation

### Database
- **Current**: Split between Neon + Supabase
- **Target**: Render PostgreSQL only
- **ORM**: Drizzle ORM 0.39.3
- **Cost**: $7/month (Render Starter)

### Hosting
- **Platform**: Render
- **Services**: Web Service + PostgreSQL
- **Total Cost**: ~$14-20/month
- **Region**: Oregon (US West)

## 📁 Target Project Structure
```
SafraReport/
├── src/                      # All source code
│   ├── client/              # Frontend (React/Vite)
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── App.tsx         # App entry
│   ├── server/              # Backend (Express)
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # DB connection & queries
│   │   ├── auth/           # JWT authentication
│   │   └── index.ts        # Server entry
│   └── shared/              # Shared types/utils
│       ├── types/          # TypeScript types
│       └── utils/          # Shared utilities
├── public/                   # Static assets
├── dist/                     # Build output (gitignored)
├── config/                   # Configuration files
│   └── render/              # Render-specific configs
├── scripts/                  # Utility scripts
│   ├── migrate-db.ts        # Database migration
│   ├── seed-db.ts           # Database seeding
│   └── migrate-to-single.sh # Monorepo migration
├── docs/                     # Documentation
│   ├── API.md               # API documentation
│   ├── SETUP.md             # Setup guide
│   └── DEPLOYMENT.md        # Deployment guide
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── .env.example             # Example environment variables
├── .env                     # Local environment (gitignored)
├── .eslintrc.js             # ESLint configuration
├── .gitignore               # Git ignore patterns
├── .prettierrc              # Prettier configuration
├── package.json             # Single package.json
├── README.md                # Project documentation
├── render.yaml              # Render deployment config
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🔑 Key Features

### Currently Working ✅
- ✅ User Registration/Login (Supabase - to be replaced)
- ✅ Admin Authentication (custom JWT)
- ✅ News Articles Management
- ✅ Classified Ads CRUD
- ✅ Business Directory
- ✅ Business Reviews System
- ✅ Categories & Filtering
- ✅ Search Functionality
- ✅ Image Upload
- ✅ Admin Panel with Audit Logging
- ✅ Text-to-Speech Accessibility
- ✅ Floating Audio Player
- ✅ Social Media Integration

### In Migration 🔄
- 🔄 Converting monorepo → single repo
- 🔄 Supabase Auth → Simple JWT auth
- 🔄 Neon + Supabase DB → Render PostgreSQL
- 🔄 pnpm → npm
- 🔄 Complex builds → Simple builds

### Future Enhancements 📋
- [ ] Payment Processing (Stripe/PayPal)
- [ ] Email Notifications (SendGrid/SES)
- [ ] SMS Notifications
- [ ] Advanced Search with Filters
- [ ] User Messaging System
- [ ] Real-time Updates (WebSocket)
- [ ] Mobile App (React Native)
- [ ] Redis Caching
- [ ] Full-text Search
- [ ] Analytics Dashboard

## 🗄️ Database Schema

### Core Tables (12 Entities)

**User Management**
- `users` - User profiles (adding password field for JWT auth)
- `admin_users` - Admin authentication with bcrypt
- `admin_sessions` - Secure session management
- `user_preferences` - User customization settings

**Content Management**
- `articles` - News articles with metadata
- `categories` - Content categorization
- `classifieds` - Marketplace listings
- `businesses` - Business directory
- `reviews` - Business reviews and ratings

**Geographic & System**
- `provinces` - Dominican Republic provinces
- `audit_logs` - Admin action tracking
- `classified_categories` - Classified taxonomy
- `business_categories` - Business taxonomy

### Key Relationships
- `articles.author_id → admin_users.id`
- `classifieds.user_id → users.id`
- `reviews.business_id → businesses.id`
- `reviews.user_id → users.id`

## 🔧 Environment Variables
```bash
# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://safrareport.onrender.com
API_PREFIX=/api

# Database (Render PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/safrareport

# Security
JWT_SECRET=[auto-generated-by-render]
SESSION_SECRET=[auto-generated-by-render]
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# Email (Future)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Monitoring (Optional)
SENTRY_DSN=
LOG_LEVEL=info
```

## 🐛 Issues & Solutions

### Current Problems 🔴
1. **Monorepo Complexity**: pnpm/Vite chunk resolution errors
   - Solution: Convert to single repo with npm
2. **Multiple Databases**: Expensive and complex
   - Solution: Consolidate to Render PostgreSQL
3. **Auth Complexity**: Supabase + custom admin auth
   - Solution: Simple JWT for everything

### Fixed Issues ✅
- ✅ Hardcoded credentials removed
- ✅ Secure session management implemented
- ✅ RLS policies added
- ✅ Legacy auth bypasses eliminated

## 🚦 Commands

### Current (Monorepo with pnpm)
```bash
pnpm run dev:all      # Start everything
pnpm build:all        # Build all packages
```

### After Migration (Single Repo with npm)
```bash
# Development
npm run dev           # Start frontend + backend
npm run dev:client    # Frontend only
npm run dev:server    # Backend only

# Building
npm run build         # Build everything
npm run build:client  # Build frontend
npm run build:server  # Build backend

# Production
npm start            # Start production server

# Database
npm run db:migrate    # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset and seed

# Code Quality
npm run lint         # ESLint check
npm run lint:fix     # Fix linting issues
npm run format       # Prettier format
npm run typecheck    # TypeScript check
npm run test         # Run tests

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Bundle analysis
```

## 📊 Performance & Costs

### Cost Analysis
| Service | Before | After | Savings |
|---------|--------|-------|---------|
| Database | $44/mo (Neon + Supabase) | $7/mo (Render) | $37/mo |
| Hosting | Variable | $7/mo (Render) | Predictable |
| **Total** | **~$50+/mo** | **$14-20/mo** | **~65% reduction** |

### Performance Improvements
- **Install time**: 2-3min → 30-45s (75% faster)
- **Build time**: 45-60s → 15-20s (66% faster)
- **Deploy time**: 5-7min → 2-3min (60% faster)
- **Dev startup**: 30s → 10s (66% faster)
- **Complexity**: 80% reduction

## 🎯 Business Context

### Target Market
- **Primary Location**: Dominican Republic
- **Secondary**: Dominican diaspora worldwide
- **Language**: Spanish (primary), English (secondary)
- **Demographics**: 18-65, urban and rural
- **User Types**: Individual sellers, businesses, news readers

### Main Categories
1. **Vehicles** (Vehículos)
2. **Real Estate** (Bienes Raíces)
3. **Electronics** (Electrónicos)
4. **Jobs** (Empleos)
5. **Services** (Servicios)

### Competitors
- Corotos.com.do
- Mercado Libre Dominicana
- Facebook Marketplace
- Local newspapers' classifieds

### Monetization Strategy
1. **Featured Listings**: Premium placement
2. **Business Accounts**: Enhanced profiles
3. **Banner Ads**: Strategic placement
4. **Transaction Fees**: Future implementation

## 💻 Development Workflow

### Local Development
1. Clone repository
2. Copy `.env.example` to `.env`
3. Install dependencies: `npm install`
4. Start database: `docker-compose up -d`
5. Run migrations: `npm run db:migrate`
6. Start dev server: `npm run dev`

### Git Workflow
- **Main branch**: `main` (production)
- **Development**: `develop`
- **Features**: `feature/description`
- **Fixes**: `fix/description`

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- 90%+ test coverage goal

## 🚀 Deployment

### Render Setup
1. Connect GitHub repository
2. Create PostgreSQL database
3. Create Web Service
4. Configure environment variables
5. Deploy with render.yaml

### Health Checks
- **Endpoint**: `/api/health`
- **Database check**: Included
- **Response time**: <500ms

### Monitoring
- Render dashboard metrics
- Custom health endpoints
- Error tracking (Sentry ready)

## 🆘 Current Priorities

### Phase 1: Migration (Week 1-2)
1. ✅ Backup everything
2. ⏳ Convert monorepo to single repo
3. ⏳ Fix import paths and dependencies
4. ⏳ Test with npm locally

### Phase 2: Database (Week 2-3)
1. Create Render PostgreSQL
2. Export data from Neon
3. Import to Render
4. Update connection strings

### Phase 3: Auth (Week 3)
1. Implement JWT auth
2. Add password field to users
3. Create auth endpoints
4. Remove Supabase SDK

### Phase 4: Deploy (Week 4)
1. Push to GitHub
2. Connect to Render
3. Configure services
4. Go live
5. Cancel old services

## 📝 Notes

### Why These Decisions?
- **Single Repo**: Simpler for small team, fixes pnpm issues
- **Render**: All-in-one solution, cost-effective
- **JWT Auth**: Simple, no external dependencies
- **npm**: Better compatibility, no monorepo issues

### Lessons Learned
- Start simple, scale when needed
- Monorepos add complexity
- External auth can be overkill
- Consolidation reduces costs

### Future Considerations
- May add Redis when scale demands
- Consider CDN for static assets
- Implement APM when traffic grows
- Plan mobile app architecture

---
**Last Updated**: August 2025  
**Status**: Migration in Progress  
**Next Review**: After deployment complete
- Automated quality assurance
