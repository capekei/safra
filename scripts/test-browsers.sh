#!/bin/bash

# SafraReport - Cross-Browser Testing Script
# Automates browser testing and generates reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=================================${NC}"
    echo -e "${BLUE}🧪 SafraReport Browser Testing${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
}

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

# Check if server is running
check_server() {
    print_status "Checking if SafraReport server is running..."
    
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        print_success "✅ Server is running on http://localhost:4000"
        return 0
    else
        print_error "❌ Server is not running"
        echo ""
        echo "Please start the server first:"
        echo "  npm run dev"
        echo ""
        return 1
    fi
}

# Test core endpoints
test_endpoints() {
    print_status "Testing core API endpoints..."
    
    local endpoints=(
        "/api/health"
        "/api/articles"
        "/api/articles/featured"
        "/"
        "/admin/login"
    )
    
    local failed=0
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "http://localhost:4000$endpoint" > /dev/null 2>&1; then
            print_success "✅ $endpoint"
        else
            print_error "❌ $endpoint"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        print_success "All endpoints are working!"
    else
        print_warning "$failed endpoint(s) failed"
    fi
    
    echo ""
}

# Open browsers for manual testing
open_browsers() {
    print_status "Opening browsers for manual testing..."
    
    local base_url="http://localhost:4000"
    
    # Test URLs
    local urls=(
        "$base_url"
        "$base_url/admin/login"
        "$base_url/admin/dashboard"
    )
    
    echo "Testing URLs:"
    for url in "${urls[@]}"; do
        echo "  - $url"
    done
    echo ""
    
    # Try to open different browsers
    if command -v open &> /dev/null; then
        # macOS
        print_status "Opening Chrome..."
        open -a "Google Chrome" "$base_url" 2>/dev/null || print_warning "Chrome not found"
        
        print_status "Opening Safari..."
        open -a "Safari" "$base_url" 2>/dev/null || print_warning "Safari not found"
        
        print_status "Opening Firefox..."
        open -a "Firefox" "$base_url" 2>/dev/null || print_warning "Firefox not found"
        
    elif command -v xdg-open &> /dev/null; then
        # Linux
        print_status "Opening default browser..."
        xdg-open "$base_url"
        
    elif command -v start &> /dev/null; then
        # Windows
        print_status "Opening default browser..."
        start "$base_url"
    else
        print_warning "Could not auto-open browsers. Please manually open:"
        echo "  $base_url"
    fi
    
    echo ""
}

# Generate testing checklist
generate_checklist() {
    local checklist_file="browser-testing-checklist.md"
    
    print_status "Generating testing checklist: $checklist_file"
    
    cat > "$checklist_file" << 'EOF'
# SafraReport Browser Testing Checklist

## Date: $(date)
## Tester: [Your Name]

### Desktop Testing

#### Chrome Desktop
- [ ] Homepage loads correctly
- [ ] Articles display properly
- [ ] Admin login works
- [ ] Admin dashboard functional
- [ ] CRUD operations work
- [ ] Images load correctly
- [ ] Performance acceptable (< 3s)

#### Safari Desktop
- [ ] Homepage loads correctly
- [ ] Articles display properly
- [ ] Admin login works
- [ ] Admin dashboard functional
- [ ] CRUD operations work
- [ ] Images load correctly
- [ ] Performance acceptable (< 3s)

#### Firefox Desktop
- [ ] Homepage loads correctly
- [ ] Articles display properly
- [ ] Admin login works
- [ ] Admin dashboard functional
- [ ] CRUD operations work
- [ ] Images load correctly
- [ ] Performance acceptable (< 3s)

### Mobile Testing

#### Chrome Mobile (Android)
- [ ] Homepage responsive
- [ ] Touch interactions work
- [ ] Navigation menu functional
- [ ] Text readable
- [ ] Performance on 3G
- [ ] Offline behavior

#### Safari Mobile (iOS)
- [ ] Homepage responsive
- [ ] Touch interactions work
- [ ] Navigation menu functional
- [ ] Text readable
- [ ] Performance acceptable
- [ ] iOS-specific features

### Responsive Design

#### Breakpoints
- [ ] Mobile (320px-768px)
- [ ] Tablet (768px-1024px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1440px+)

#### Orientations
- [ ] Portrait mode
- [ ] Landscape mode
- [ ] Rotation handling

### Performance Testing

#### Load Times
- [ ] Homepage: _____ seconds
- [ ] Admin dashboard: _____ seconds
- [ ] Article page: _____ seconds
- [ ] Image loading: _____ seconds

#### Network Conditions
- [ ] Fast WiFi
- [ ] Slow WiFi
- [ ] 3G connection
- [ ] Intermittent connectivity

### Issues Found

#### Critical Issues
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

#### Minor Issues
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

### Overall Assessment

- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes
- [ ] Not ready for production

### Notes
_Add any additional observations here_

---
Testing completed: [Date/Time]
EOF

    print_success "✅ Checklist generated: $checklist_file"
    echo ""
}

# Main testing flow
main() {
    print_header
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Test endpoints
    test_endpoints
    
    # Generate checklist
    generate_checklist
    
    # Ask user what they want to do
    echo "Choose testing option:"
    echo "1) Open browsers for manual testing"
    echo "2) Run automated checks only"
    echo "3) Generate report template"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            open_browsers
            print_status "Browsers opened. Use the generated checklist to test manually."
            print_status "Checklist file: browser-testing-checklist.md"
            ;;
        2)
            print_success "Automated checks completed. See results above."
            ;;
        3)
            print_status "Checklist already generated: browser-testing-checklist.md"
            ;;
        4)
            print_status "Testing cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Browser testing setup complete!"
    echo ""
    print_status "Next steps:"
    echo "1. Use the checklist to test each browser/device"
    echo "2. Document any issues found"
    echo "3. Fix critical issues before deployment"
    echo "4. Re-test after fixes"
    echo ""
    print_status "For detailed testing guide, see: CROSS_BROWSER_TESTING.md"
}

# Run main function
main "$@"
