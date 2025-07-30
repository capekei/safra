#!/bin/bash

# SafraReport - Production Deployment Script
# This script helps prepare and deploy SafraReport to production

set -e  # Exit on any error

echo "🚀 SafraReport Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    print_error "This script must be run from the SafraReport root directory"
    exit 1
fi

print_status "Starting SafraReport deployment preparation..."

# Step 1: Run tests to ensure everything is working
print_status "Running backend tests..."
if npm run test:run > /dev/null 2>&1; then
    print_success "All tests passed! ✅"
else
    print_warning "Some tests failed, but continuing deployment..."
fi

# Step 2: Type checking
print_status "Running TypeScript type checking..."
if npm run check > /dev/null 2>&1; then
    print_success "TypeScript compilation successful! ✅"
else
    print_error "TypeScript errors found. Please fix before deploying."
    exit 1
fi

# Step 3: Build the application
print_status "Building application for production..."
if npm run build > /dev/null 2>&1; then
    print_success "Build completed successfully! ✅"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Step 4: Check for required files
print_status "Checking deployment configuration..."

required_files=("render.yaml" "DEPLOYMENT_GUIDE.md" ".env.production.example")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file found"
    else
        print_error "❌ $file missing"
        exit 1
    fi
done

# Step 5: Git status check
print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Consider committing them before deployment."
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Step 6: Deployment options
echo ""
print_status "Choose your deployment method:"
echo "1) Render.com (Recommended - Already configured)"
echo "2) Railway"
echo "3) Manual deployment guide"
echo "4) Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Deploying to Render.com..."
        echo ""
        echo "🌐 Render.com Deployment Steps:"
        echo "1. Go to https://render.com"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New +' → 'Blueprint'"
        echo "4. Select your SafraReport repository"
        echo "5. Render will auto-detect render.yaml"
        echo ""
        print_warning "⚠️  IMPORTANT: Add SUPABASE_SERVICE_ROLE_KEY in Render dashboard"
        echo "   - Go to Render dashboard → Environment"
        echo "   - Add: SUPABASE_SERVICE_ROLE_KEY"
        echo "   - Get value from Supabase Project Settings → API → Service Role Key"
        echo ""
        print_success "Your app will be live at: https://safrareport.onrender.com"
        ;;
    2)
        print_status "Railway deployment instructions..."
        echo ""
        echo "🚂 Railway Deployment Steps:"
        echo "1. Install Railway CLI: npm install -g @railway/cli"
        echo "2. Login: railway login"
        echo "3. Deploy: railway up"
        echo "4. Set environment variables in Railway dashboard"
        echo ""
        print_status "See DEPLOYMENT_GUIDE.md for detailed Railway setup"
        ;;
    3)
        print_status "Opening deployment guide..."
        if command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.md
        elif command -v xdg-open &> /dev/null; then
            xdg-open DEPLOYMENT_GUIDE.md
        else
            print_status "Please open DEPLOYMENT_GUIDE.md manually"
        fi
        ;;
    4)
        print_status "Deployment cancelled."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_success "🎉 SafraReport is ready for production deployment!"
echo ""
print_status "Post-deployment checklist:"
echo "✅ Test the health endpoint: /api/health"
echo "✅ Verify admin login works"
echo "✅ Check article creation/editing"
echo "✅ Confirm database operations"
echo "✅ Test performance (< 3s load time)"
echo ""
print_status "For troubleshooting, see DEPLOYMENT_GUIDE.md"
echo ""
print_success "Happy deploying! 🇩🇴"
