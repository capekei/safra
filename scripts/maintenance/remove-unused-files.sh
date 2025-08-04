#!/bin/bash

# Script to remove unused files identified by knip analysis
# This script removes files that are completely unused in the codebase

echo "🧹 Starting unused file cleanup..."

# Create backup directory
BACKUP_DIR="backup-unused-files-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR"

# Remove unused client components
echo "🗑️  Removing unused client components..."
mkdir -p "$BACKUP_DIR/client/components"

# Remove unused UI components (all of them according to knip)
mv client/src/components/ui/accordion.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/alert-dialog.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/alert.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/aspect-ratio.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/avatar.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/badge.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/breadcrumb.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/calendar.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/card.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/carousel.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/chart.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/checkbox.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/collapsible.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/command.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/context-menu.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/dialog.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/drawer.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/form.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/hover-card.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/input-otp.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/input.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/label.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/LazyImage.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/menubar.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/multi-select.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/navigation-menu.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/pagination.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/popover.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/progress.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/radio-group.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/resizable.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/scroll-area.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/select.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/separator.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/sheet.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/sidebar.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/skeleton.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/slider.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/switch.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/table.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/tabs.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/textarea.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/toaster.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/toggle-group.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/toggle.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/ui/tooltip.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true

# Remove unused admin components
mv client/src/components/admin/admin-layout.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/admin/admin-route-guard.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/admin/image-dropzone.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/admin/rich-text-editor.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/admin/video-dropzone.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true

# Remove unused other components
mv client/src/components/alert/DRMobileAlert.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/article/floating-audio-player.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/article/social-share.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/article/text-to-speech.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/auth/SupabaseLoginForm.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/editor/rich-text-editor.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/error/DRErrorBoundary.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/error/ProductionErrorBoundary.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/location/province-map.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/location/province-selector.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/social-embed-renderer.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true
mv client/src/components/UploadButton.tsx "$BACKUP_DIR/client/components/" 2>/dev/null || true

# Remove unused pages
echo "🗑️  Removing unused pages..."
mkdir -p "$BACKUP_DIR/client/pages"
mv client/src/pages/admin-articles-test.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/ads.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/articles.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/audit.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/classifieds.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/database.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/login.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/moderation.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/reviews.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/admin/users.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/article-preview.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/article.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/auth-callback.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/category.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/clasificados.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/cuenta.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/login.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/not-found.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/resenas.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/reset-password.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/test-simple.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/ui-showcase.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/user/dashboard.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/user/news-preferences.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/user/post-classified.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true
mv client/src/pages/user/post-review.tsx "$BACKUP_DIR/client/pages/" 2>/dev/null || true

# Remove unused hooks and lib files
echo "🗑️  Removing unused hooks and lib files..."
mkdir -p "$BACKUP_DIR/client/hooks"
mkdir -p "$BACKUP_DIR/client/lib"
mv client/src/hooks/use-mobile.tsx "$BACKUP_DIR/client/hooks/" 2>/dev/null || true
mv client/src/hooks/useRouteGuard.ts "$BACKUP_DIR/client/hooks/" 2>/dev/null || true
mv client/src/lib/api.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/apiTypes.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/authUtils.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/currency.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/dominican-utils.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/queryClient.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/routeUtils.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true
mv client/src/lib/tiptap-social-embed.ts "$BACKUP_DIR/client/lib/" 2>/dev/null || true

# Remove unused server files
echo "🗑️  Removing unused server files..."
mkdir -p "$BACKUP_DIR/server"
mv server/auth.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/middleware/index.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/middleware/rls-context.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/routes/admin/supabase.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/routes/health.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/routes/index.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/seed-ads.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/seeds/admin.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/seeds/main.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/test-supabase-auth.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/utils.ts "$BACKUP_DIR/server/" 2>/dev/null || true
mv server/utils/logger.ts "$BACKUP_DIR/server/" 2>/dev/null || true

# Remove unused shared files
echo "🗑️  Removing unused shared files..."
mkdir -p "$BACKUP_DIR/shared"
mv shared/supabase-storage.ts "$BACKUP_DIR/shared/" 2>/dev/null || true
mv shared/supabase.ts "$BACKUP_DIR/shared/" 2>/dev/null || true

# Remove unused scripts
echo "🗑️  Removing unused scripts..."
mkdir -p "$BACKUP_DIR/scripts"
mv scripts/database/create-admin-user.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/database/inspect-db.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/database/run-migration.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/deployment/check-production-readiness.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/migrate.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/testing/test-articles-api.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/transfer-data.js "$BACKUP_DIR/scripts/" 2>/dev/null || true
mv scripts/verify.js "$BACKUP_DIR/scripts/" 2>/dev/null || true

# Remove other unused files
echo "🗑️  Removing other unused files..."
mv client/components/MobileErrorAlert.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv client/src/App.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv client/src/main.tsx "$BACKUP_DIR/" 2>/dev/null || true
mv config/deployment/railway-healthcheck.js "$BACKUP_DIR/" 2>/dev/null || true
mv middleware.ts "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Unused files moved to backup directory: $BACKUP_DIR"
echo "📝 You can review the backup and delete it if everything looks good"
echo "💡 To restore files: mv $BACKUP_DIR/* ." 