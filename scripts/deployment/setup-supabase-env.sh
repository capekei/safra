#!/bin/bash

# SafraReport - Supabase Environment Setup Script
# This script helps configure environment variables for Supabase Auth migration

echo "🚀 SafraReport - Configuración de Supabase Auth"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt_input() {
    local var_name=$1
    local description=$2
    local example=$3
    local is_secret=${4:-false}
    
    echo -e "${BLUE}$description${NC}"
    if [ "$example" != "" ]; then
        echo -e "${YELLOW}Ejemplo: $example${NC}"
    fi
    
    if [ "$is_secret" = true ]; then
        echo -n "Ingrese el valor (no se mostrará): "
        read -s value
        echo ""
    else
        echo -n "Ingrese el valor: "
        read value
    fi
    
    if [ "$value" == "" ]; then
        echo -e "${RED}❌ Valor requerido para $var_name${NC}"
        exit 1
    fi
    
    echo ""
}

# Check if .env already exists
if [ -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Archivo server/.env ya existe.${NC}"
    echo "¿Desea sobrescribirlo? (y/N): "
    read overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Operación cancelada."
        exit 0
    fi
    echo ""
fi

echo "📋 Por favor, proporcione los siguientes valores de Supabase:"
echo "   (Puede encontrarlos en su panel de Supabase > Settings > API)"
echo ""

# Prompt for Supabase URL
prompt_input "SUPABASE_URL" "URL de su proyecto Supabase:" "https://abcdefghijklmnop.supabase.co"
SUPABASE_URL=$value

# Prompt for Supabase Anon Key
prompt_input "SUPABASE_ANON_KEY" "Clave pública (anon key) de Supabase:" "eyJ..."
SUPABASE_ANON_KEY=$value

# Prompt for Supabase Service Role Key
prompt_input "SUPABASE_SERVICE_ROLE_KEY" "Clave de servicio (service role key) de Supabase:" "eyJ..." true
SUPABASE_SERVICE_ROLE_KEY=$value

# Prompt for Frontend URL
echo -e "${BLUE}URL de su frontend (para redirects):${NC}"
echo -e "${YELLOW}Desarrollo: http://localhost:5173${NC}"
echo -e "${YELLOW}Producción: https://sudominio.com${NC}"
echo -n "Ingrese la URL: "
read FRONTEND_URL
if [ "$FRONTEND_URL" == "" ]; then
    FRONTEND_URL="http://localhost:5173"
fi
echo ""

# Prompt for Default Admin Password
echo -e "${BLUE}Contraseña para el administrador por defecto (opcional):${NC}"
echo -e "${YELLOW}Dejar vacío para generar una automática${NC}"
echo -n "Contraseña (no se mostrará): "
read -s DEFAULT_ADMIN_PASSWORD
echo ""
if [ "$DEFAULT_ADMIN_PASSWORD" == "" ]; then
    DEFAULT_ADMIN_PASSWORD="SafraAdmin$(date +%Y)!"
    echo -e "${GREEN}✅ Contraseña generada automáticamente: $DEFAULT_ADMIN_PASSWORD${NC}"
fi
echo ""

# Create server .env file
echo "📁 Creando archivo server/.env..."
cat > server/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Frontend Configuration
FRONTEND_URL=$FRONTEND_URL

# Admin Configuration
DEFAULT_ADMIN_PASSWORD=$DEFAULT_ADMIN_PASSWORD

# Database Configuration (mantener existente si está configurado)
# DATABASE_URL=postgresql://...

# Session Configuration (mantener existente si está configurado)
# SESSION_SECRET=...
EOF

# Create client .env file
echo "📁 Creando archivo client/.env..."
cat > client/.env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# App Configuration
VITE_FRONTEND_URL=$FRONTEND_URL
EOF

echo -e "${GREEN}✅ Archivos de configuración creados exitosamente!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecute el schema SQL en Supabase:"
echo "   - Vaya a su panel de Supabase > SQL Editor"
echo "   - Pegue el contenido de server/supabase-schema.sql"
echo "   - Ejecute el script"
echo ""
echo "2. Configure la autenticación en Supabase:"
echo "   - Vaya a Authentication > Settings"
echo "   - Site URL: $FRONTEND_URL"
echo "   - Redirect URLs: $FRONTEND_URL/auth/callback"
echo ""
echo "3. Ejecute la migración de usuarios:"
echo "   tsx server/migrate-auth0-to-supabase.ts"
echo ""
echo "4. Pruebe el sistema:"
echo "   tsx server/test-supabase-auth.ts"
echo ""
echo -e "${BLUE}🔒 Información de seguridad:${NC}"
echo "- Las claves de servicio son confidenciales"
echo "- No las incluya en control de versiones"
echo "- Cambie la contraseña del admin después del primer login"
echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo "Para más información, consulte SUPABASE_MIGRATION_GUIDE.md"
EOF

# Make the script executable
chmod +x setup-supabase-env.sh

echo "✅ Script de configuración creado: setup-supabase-env.sh"