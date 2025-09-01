#!/bin/bash

# =============================================================================
# Carmen ERP Keycloak Integration Test Script
# =============================================================================
# This script validates the Keycloak integration by running various tests
# including configuration validation, connectivity tests, and authentication flows.
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
KEYCLOAK_URL="http://localhost:8080"
CARMEN_URL="http://localhost:3000"
TEST_RESULTS_FILE="keycloak-test-results.json"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_section() {
    echo -e "\n${PURPLE}🔹 $1${NC}"
}

log_test() {
    echo -e "${CYAN}🧪 $1${NC}"
}

# Initialize test results
init_test_results() {
    cat > "$TEST_RESULTS_FILE" << EOF
{
  "testSuite": "Carmen ERP Keycloak Integration",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "results": {
    "configuration": {},
    "connectivity": {},
    "authentication": {},
    "api": {},
    "security": {}
  },
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0
  }
}
EOF
}

# Update test result
update_test_result() {
    local category="$1"
    local test_name="$2"
    local status="$3"
    local message="$4"
    
    # Use a temporary file for jq operations
    local temp_file=$(mktemp)
    
    if command -v jq >/dev/null 2>&1; then
        jq ".results.$category[\"$test_name\"] = {\"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" "$TEST_RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$TEST_RESULTS_FILE"
        
        # Update summary
        local total=$(jq '.summary.total + 1' "$TEST_RESULTS_FILE")
        case "$status" in
            "PASS") 
                jq ".summary.total = $total | .summary.passed = (.summary.passed + 1)" "$TEST_RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$TEST_RESULTS_FILE"
                ;;
            "FAIL")
                jq ".summary.total = $total | .summary.failed = (.summary.failed + 1)" "$TEST_RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$TEST_RESULTS_FILE"
                ;;
            "WARN")
                jq ".summary.total = $total | .summary.warnings = (.summary.warnings + 1)" "$TEST_RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$TEST_RESULTS_FILE"
                ;;
        esac
    fi
}

# Test configuration
test_configuration() {
    log_section "Testing Configuration"
    
    # Check if .env.local exists
    log_test "Checking environment configuration..."
    if [ -f ".env.local" ]; then
        log_success "Environment file exists"
        update_test_result "configuration" "env_file_exists" "PASS" "Environment file found"
    else
        log_warning "No .env.local file found"
        update_test_result "configuration" "env_file_exists" "WARN" ".env.local file not found"
    fi
    
    # Check required environment variables
    log_test "Checking required environment variables..."
    local missing_vars=()
    
    required_vars=(
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
        "KEYCLOAK_BASE_URL"
        "KEYCLOAK_REALM"
        "KEYCLOAK_CLIENT_ID"
        "KEYCLOAK_CLIENT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "All required environment variables are set"
        update_test_result "configuration" "required_env_vars" "PASS" "All required variables present"
    else
        log_error "Missing environment variables: ${missing_vars[*]}"
        update_test_result "configuration" "required_env_vars" "FAIL" "Missing variables: ${missing_vars[*]}"
    fi
    
    # Check package dependencies
    log_test "Checking package dependencies..."
    if npm list next-auth jwt-decode >/dev/null 2>&1; then
        log_success "Required packages are installed"
        update_test_result "configuration" "package_dependencies" "PASS" "All required packages installed"
    else
        log_error "Missing required packages"
        update_test_result "configuration" "package_dependencies" "FAIL" "Missing required packages"
    fi
}

# Test connectivity
test_connectivity() {
    log_section "Testing Connectivity"
    
    # Test Keycloak server
    log_test "Testing Keycloak server connectivity..."
    if curl -s "$KEYCLOAK_URL/health/ready" >/dev/null; then
        log_success "Keycloak server is reachable"
        update_test_result "connectivity" "keycloak_server" "PASS" "Keycloak server responding"
    else
        log_error "Cannot reach Keycloak server at $KEYCLOAK_URL"
        update_test_result "connectivity" "keycloak_server" "FAIL" "Keycloak server unreachable"
        return 1
    fi
    
    # Test Keycloak realm
    log_test "Testing Carmen realm accessibility..."
    if curl -s "$KEYCLOAK_URL/realms/carmen/.well-known/openid_configuration" >/dev/null; then
        log_success "Carmen realm is accessible"
        update_test_result "connectivity" "carmen_realm" "PASS" "Carmen realm accessible"
    else
        log_error "Cannot access Carmen realm"
        update_test_result "connectivity" "carmen_realm" "FAIL" "Carmen realm not accessible"
    fi
    
    # Test PostgreSQL (if accessible)
    log_test "Testing PostgreSQL connectivity..."
    if docker exec carmen-keycloak-postgres pg_isready -U keycloak >/dev/null 2>&1; then
        log_success "PostgreSQL is healthy"
        update_test_result "connectivity" "postgresql" "PASS" "PostgreSQL healthy"
    else
        log_warning "Cannot verify PostgreSQL status"
        update_test_result "connectivity" "postgresql" "WARN" "PostgreSQL status unknown"
    fi
    
    # Test Redis (if accessible)
    log_test "Testing Redis connectivity..."
    if docker exec carmen-redis redis-cli ping >/dev/null 2>&1; then
        log_success "Redis is healthy"
        update_test_result "connectivity" "redis" "PASS" "Redis healthy"
    else
        log_warning "Cannot verify Redis status"
        update_test_result "connectivity" "redis" "WARN" "Redis status unknown"
    fi
}

# Test authentication flows
test_authentication() {
    log_section "Testing Authentication"
    
    # Get OIDC configuration
    log_test "Retrieving OIDC configuration..."
    local oidc_config
    oidc_config=$(curl -s "$KEYCLOAK_URL/realms/carmen/.well-known/openid_configuration")
    
    if [ -n "$oidc_config" ]; then
        log_success "OIDC configuration retrieved"
        update_test_result "authentication" "oidc_config" "PASS" "OIDC configuration available"
        
        # Check required endpoints
        local endpoints=("authorization_endpoint" "token_endpoint" "userinfo_endpoint" "jwks_uri")
        for endpoint in "${endpoints[@]}"; do
            if echo "$oidc_config" | grep -q "\"$endpoint\""; then
                log_success "✓ $endpoint found"
            else
                log_error "✗ $endpoint missing"
                update_test_result "authentication" "${endpoint}_present" "FAIL" "$endpoint missing from OIDC config"
            fi
        done
    else
        log_error "Cannot retrieve OIDC configuration"
        update_test_result "authentication" "oidc_config" "FAIL" "OIDC configuration not available"
    fi
    
    # Test client configuration (requires admin access)
    log_test "Testing client configuration..."
    # This would require admin credentials, so we'll check basic accessibility
    if curl -s "$KEYCLOAK_URL/realms/carmen" >/dev/null; then
        log_success "Realm endpoint accessible"
        update_test_result "authentication" "realm_accessible" "PASS" "Realm endpoint accessible"
    else
        log_error "Realm endpoint not accessible"
        update_test_result "authentication" "realm_accessible" "FAIL" "Realm endpoint not accessible"
    fi
}

# Test API endpoints
test_api_endpoints() {
    log_section "Testing API Endpoints"
    
    # Test NextAuth.js endpoints
    log_test "Testing NextAuth.js configuration endpoint..."
    
    # First check if Carmen app is running
    if ! curl -s "$CARMEN_URL" >/dev/null; then
        log_warning "Carmen app is not running at $CARMEN_URL"
        update_test_result "api" "carmen_app_running" "WARN" "Carmen app not accessible"
        return 0
    fi
    
    # Test NextAuth.js providers endpoint
    log_test "Testing NextAuth.js providers endpoint..."
    local providers_response
    providers_response=$(curl -s "$CARMEN_URL/api/auth/providers" 2>/dev/null)
    
    if [ -n "$providers_response" ] && echo "$providers_response" | grep -q "keycloak"; then
        log_success "NextAuth.js providers endpoint working with Keycloak"
        update_test_result "api" "nextauth_providers" "PASS" "NextAuth providers endpoint working"
    else
        log_error "NextAuth.js providers endpoint not working or Keycloak not configured"
        update_test_result "api" "nextauth_providers" "FAIL" "NextAuth providers endpoint issues"
    fi
    
    # Test CSRF endpoint
    log_test "Testing CSRF endpoint..."
    if curl -s "$CARMEN_URL/api/auth/csrf" >/dev/null; then
        log_success "CSRF endpoint accessible"
        update_test_result "api" "csrf_endpoint" "PASS" "CSRF endpoint working"
    else
        log_error "CSRF endpoint not accessible"
        update_test_result "api" "csrf_endpoint" "FAIL" "CSRF endpoint not working"
    fi
}

# Test security configuration
test_security() {
    log_section "Testing Security Configuration"
    
    # Check HTTPS configuration in production
    if [ "${NODE_ENV:-development}" = "production" ]; then
        log_test "Checking HTTPS configuration..."
        if [[ "$KEYCLOAK_URL" =~ ^https:// ]] && [[ "$CARMEN_URL" =~ ^https:// ]]; then
            log_success "HTTPS configured for production"
            update_test_result "security" "https_config" "PASS" "HTTPS properly configured"
        else
            log_error "HTTPS not configured for production"
            update_test_result "security" "https_config" "FAIL" "HTTPS not configured for production"
        fi
    else
        log_info "Skipping HTTPS check in development mode"
        update_test_result "security" "https_config" "PASS" "Development mode - HTTPS check skipped"
    fi
    
    # Check secret strength
    log_test "Checking secret configuration..."
    local weak_secrets=()
    
    if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
        weak_secrets+=("NEXTAUTH_SECRET")
    fi
    
    if [ ${#KEYCLOAK_CLIENT_SECRET} -lt 16 ]; then
        weak_secrets+=("KEYCLOAK_CLIENT_SECRET")
    fi
    
    if [ ${#weak_secrets[@]} -eq 0 ]; then
        log_success "Secrets appear to be strong"
        update_test_result "security" "secret_strength" "PASS" "Secrets meet minimum length requirements"
    else
        log_warning "Weak secrets detected: ${weak_secrets[*]}"
        update_test_result "security" "secret_strength" "WARN" "Weak secrets: ${weak_secrets[*]}"
    fi
    
    # Check CORS configuration
    log_test "Checking CORS configuration..."
    if [ "${CORS_ORIGIN:-*}" = "*" ] && [ "${NODE_ENV:-development}" = "production" ]; then
        log_warning "CORS allows all origins in production"
        update_test_result "security" "cors_config" "WARN" "CORS allows all origins in production"
    else
        log_success "CORS configuration appears appropriate"
        update_test_result "security" "cors_config" "PASS" "CORS configuration appropriate"
    fi
}

# Generate test report
generate_report() {
    log_section "Test Summary"
    
    if command -v jq >/dev/null 2>&1; then
        local total=$(jq -r '.summary.total' "$TEST_RESULTS_FILE")
        local passed=$(jq -r '.summary.passed' "$TEST_RESULTS_FILE")
        local failed=$(jq -r '.summary.failed' "$TEST_RESULTS_FILE")
        local warnings=$(jq -r '.summary.warnings' "$TEST_RESULTS_FILE")
        
        echo -e "${CYAN}📊 Test Results Summary:${NC}"
        echo -e "  Total tests: $total"
        echo -e "  ${GREEN}Passed: $passed${NC}"
        echo -e "  ${RED}Failed: $failed${NC}"
        echo -e "  ${YELLOW}Warnings: $warnings${NC}"
        echo ""
        
        if [ "$failed" -eq 0 ]; then
            log_success "All tests passed! Keycloak integration appears to be working correctly."
            if [ "$warnings" -gt 0 ]; then
                log_warning "However, there are $warnings warnings that should be addressed."
            fi
        else
            log_error "$failed tests failed. Please address the issues before proceeding."
            echo -e "\n${YELLOW}Failed tests:${NC}"
            jq -r '.results | to_entries[] | select(.value | to_entries[] | select(.value.status == "FAIL")) | .key' "$TEST_RESULTS_FILE" | while read category; do
                jq -r ".results.$category | to_entries[] | select(.value.status == \"FAIL\") | \"  - \\(.key): \\(.value.message)\"" "$TEST_RESULTS_FILE"
            done
        fi
        
        echo -e "\n${BLUE}Full test results saved to: $TEST_RESULTS_FILE${NC}"
    else
        log_warning "jq not available - cannot generate detailed summary"
    fi
}

# Run specific test category
run_category() {
    case "$1" in
        config|configuration)
            init_test_results
            test_configuration
            generate_report
            ;;
        connectivity|conn)
            init_test_results
            test_connectivity
            generate_report
            ;;
        auth|authentication)
            init_test_results
            test_authentication
            generate_report
            ;;
        api)
            init_test_results
            test_api_endpoints
            generate_report
            ;;
        security|sec)
            init_test_results
            test_security
            generate_report
            ;;
        all|*)
            run_all_tests
            ;;
    esac
}

# Run all tests
run_all_tests() {
    log_section "Carmen ERP Keycloak Integration Test Suite"
    log_info "Starting comprehensive integration tests..."
    
    # Load environment variables if .env.local exists
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        log_info "Loaded environment variables from .env.local"
    fi
    
    init_test_results
    
    test_configuration
    test_connectivity
    test_authentication
    test_api_endpoints
    test_security
    
    generate_report
}

# Show help
show_help() {
    echo -e "${BLUE}Carmen ERP Keycloak Integration Test Script${NC}"
    echo ""
    echo "Usage: $0 [category]"
    echo ""
    echo -e "${YELLOW}Test Categories:${NC}"
    echo "  all           - Run all tests (default)"
    echo "  config        - Test configuration only"
    echo "  connectivity  - Test connectivity only"
    echo "  auth          - Test authentication only"
    echo "  api           - Test API endpoints only"
    echo "  security      - Test security configuration only"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0                    # Run all tests"
    echo "  $0 config            # Test configuration only"
    echo "  $0 connectivity      # Test connectivity only"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "  - Keycloak services running (./scripts/setup-keycloak.sh start)"
    echo "  - Environment variables configured (.env.local)"
    echo "  - Carmen app running (optional for full testing)"
}

# Main execution
case "${1:-all}" in
    help|--help|-h)
        show_help
        ;;
    *)
        run_category "$1"
        ;;
esac