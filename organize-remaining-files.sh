#!/bin/bash
# Organize remaining files in SafraReport root directory

echo "🇩🇴 Organizando archivos restantes en SafraReport..."

# Ensure directories exist
mkdir -p docs/deployment scripts/{testing,deployment,maintenance} tools/testing config/deployment

# Move remaining scripts
echo "📋 Moviendo scripts restantes..."
[ -f "dr-final-fix.sh" ] && mv dr-final-fix.sh scripts/maintenance/
[ -f "dr-test-commands.sh" ] && mv dr-test-commands.sh scripts/testing/
[ -f "fix-import-paths.sh" ] && mv fix-import-paths.sh scripts/maintenance/
[ -f "fix-ts-quick.sh" ] && mv fix-ts-quick.sh scripts/maintenance/
[ -f "setup-supabase-env.sh" ] && mv setup-supabase-env.sh scripts/deployment/
[ -f "test-complete-solution.sh" ] && mv test-complete-solution.sh scripts/testing/
[ -f "test-ts-fixes.sh" ] && mv test-ts-fixes.sh scripts/testing/

# Move config files
echo "⚙️ Moviendo archivos de configuración..."
[ -f "railway-healthcheck.js" ] && mv railway-healthcheck.js config/deployment/
[ -f "replit.md" ] && mv replit.md config/deployment/

# Move testing files
echo "🧪 Moviendo archivos de prueba..."
[ -f "QUICK_ACCESS_TEST.html" ] && mv QUICK_ACCESS_TEST.html tools/testing/
[ -f "lighthouse-desktop-report.json" ] && mv lighthouse-desktop-report.json tools/testing/
[ -f "lighthouse-mobile-report.json" ] && mv lighthouse-mobile-report.json tools/testing/

# Clean up organization scripts (move to scripts/maintenance)
[ -f "dr-organize-root-files.sh" ] && mv dr-organize-root-files.sh scripts/maintenance/
[ -f "dr-organize-root-safe.sh" ] && mv dr-organize-root-safe.sh scripts/maintenance/

# Set permissions
find scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null

echo "✅ Archivos organizados exitosamente"
echo ""
echo "📁 Archivos que permanecen en raíz (configuración principal):"
ls -la *.json *.md *.ts *.js | grep -v node_modules | awk '{print "- " $9}'
echo ""
echo "📂 Nueva estructura organizacional creada:"
echo "- scripts/testing/ - Scripts de prueba"
echo "- scripts/deployment/ - Scripts de despliegue"  
echo "- scripts/maintenance/ - Scripts de mantenimiento"
echo "- config/deployment/ - Configuraciones de despliegue"
echo "- tools/testing/ - Herramientas de prueba"