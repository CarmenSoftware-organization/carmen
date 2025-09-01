#!/bin/bash

# Carmen ERP Keycloak Setup Script
# This script sets up Keycloak with the Carmen ERP realm configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM_NAME="${REALM_NAME:-carmen}"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "docker is required but not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is required but not installed"
        exit 1
    fi
    
    log "All dependencies are available"
}

# Wait for Keycloak to be ready
wait_for_keycloak() {
    log "Waiting for Keycloak to be ready at $KEYCLOAK_URL..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; then
            log "Keycloak is ready!"
            return 0
        fi
        
        info "Attempt $attempt/$max_attempts: Keycloak not ready yet, waiting 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error "Keycloak did not become ready within the expected time"
    exit 1
}

# Get admin access token
get_admin_token() {
    log "Getting admin access token..."
    
    local admin_user="${KEYCLOAK_ADMIN_USER:-admin}"
    local admin_password="${KEYCLOAK_ADMIN_PASSWORD:-admin123}"
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$admin_user" \
        -d "password=$admin_password" \
        -d "grant_type=password" \
        -d "client_id=admin-cli")
    
    if ! echo "$response" | jq -e . >/dev/null 2>&1; then
        error "Failed to get admin token: Invalid JSON response"
        error "Response: $response"
        exit 1
    fi
    
    local access_token=$(echo "$response" | jq -r '.access_token // empty')
    
    if [ -z "$access_token" ] || [ "$access_token" = "null" ]; then
        error "Failed to get admin access token"
        error "Response: $response"
        exit 1
    fi
    
    echo "$access_token"
}

# Create or update realm
setup_realm() {
    local admin_token="$1"
    
    log "Setting up Carmen ERP realm..."
    
    # Check if realm exists
    local realm_exists=$(curl -s -H "Authorization: Bearer $admin_token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME" | jq -r '.realm // "not_found"')
    
    if [ "$realm_exists" = "not_found" ]; then
        log "Creating new realm: $REALM_NAME"
        
        # Create realm from export
        local realm_config="$PROJECT_ROOT/realm-exports/carmen-realm-config.json"
        if [ ! -f "$realm_config" ]; then
            error "Realm configuration file not found: $realm_config"
            exit 1
        fi
        
        local response=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
            -H "Authorization: Bearer $admin_token" \
            -H "Content-Type: application/json" \
            -d "@$realm_config")
        
        if [ -n "$response" ]; then
            error "Failed to create realm. Response: $response"
            exit 1
        fi
        
        log "Realm created successfully"
    else
        log "Realm $REALM_NAME already exists"
    fi
}

# Setup roles and groups
setup_roles_and_groups() {
    local admin_token="$1"
    
    log "Setting up roles and groups..."
    
    local roles_groups_config="$PROJECT_ROOT/realm-exports/carmen-roles-groups.json"
    if [ ! -f "$roles_groups_config" ]; then
        error "Roles and groups configuration file not found: $roles_groups_config"
        exit 1
    fi
    
    # Create realm roles
    local roles=$(jq -r '.roles.realm[] | @base64' "$roles_groups_config")
    
    for role_data in $roles; do
        local role=$(echo "$role_data" | base64 --decode)
        local role_name=$(echo "$role" | jq -r '.name')
        
        # Check if role exists
        local role_exists=$(curl -s -H "Authorization: Bearer $admin_token" \
            "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$role_name" \
            | jq -r '.name // "not_found"')
        
        if [ "$role_exists" = "not_found" ]; then
            log "Creating role: $role_name"
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
                -H "Authorization: Bearer $admin_token" \
                -H "Content-Type: application/json" \
                -d "$role"
        else
            log "Role $role_name already exists"
        fi
    done
    
    # Create groups
    local groups=$(jq -r '.groups[] | @base64' "$roles_groups_config")
    
    for group_data in $groups; do
        local group=$(echo "$group_data" | base64 --decode)
        local group_name=$(echo "$group" | jq -r '.name')
        
        # Check if group exists
        local existing_groups=$(curl -s -H "Authorization: Bearer $admin_token" \
            "$KEYCLOAK_URL/admin/realms/$REALM_NAME/groups?search=$group_name")
        
        if [ "$(echo "$existing_groups" | jq '. | length')" -eq 0 ]; then
            log "Creating group: $group_name"
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/groups" \
                -H "Authorization: Bearer $admin_token" \
                -H "Content-Type: application/json" \
                -d "$group"
        else
            log "Group $group_name already exists"
        fi
    done
    
    log "Roles and groups setup completed"
}

# Setup clients
setup_clients() {
    local admin_token="$1"
    
    log "Setting up OIDC clients..."
    
    local client_configs=(
        "$PROJECT_ROOT/clients/${ENVIRONMENT}-client.json"
        "$PROJECT_ROOT/clients/service-account-client.json"
    )
    
    for client_config in "${client_configs[@]}"; do
        if [ ! -f "$client_config" ]; then
            warn "Client configuration file not found: $client_config"
            continue
        fi
        
        local client_id=$(jq -r '.clientId' "$client_config")
        
        # Check if client exists
        local existing_clients=$(curl -s -H "Authorization: Bearer $admin_token" \
            "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$client_id")
        
        if [ "$(echo "$existing_clients" | jq '. | length')" -eq 0 ]; then
            log "Creating client: $client_id"
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
                -H "Authorization: Bearer $admin_token" \
                -H "Content-Type: application/json" \
                -d "@$client_config"
        else
            log "Client $client_id already exists"
        fi
    done
    
    log "Client setup completed"
}

# Setup test users (development only)
setup_test_users() {
    local admin_token="$1"
    
    if [ "$ENVIRONMENT" != "development" ]; then
        info "Skipping test users setup (not in development environment)"
        return 0
    fi
    
    log "Setting up test users..."
    
    local users_config="$PROJECT_ROOT/test-users/development-users.json"
    if [ ! -f "$users_config" ]; then
        error "Test users configuration file not found: $users_config"
        exit 1
    fi
    
    local users=$(jq -r '.users[] | @base64' "$users_config")
    
    for user_data in $users; do
        local user=$(echo "$user_data" | base64 --decode)
        local username=$(echo "$user" | jq -r '.username')
        
        # Check if user exists
        local existing_users=$(curl -s -H "Authorization: Bearer $admin_token" \
            "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=$username")
        
        if [ "$(echo "$existing_users" | jq '. | length')" -eq 0 ]; then
            log "Creating test user: $username"
            curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
                -H "Authorization: Bearer $admin_token" \
                -H "Content-Type: application/json" \
                -d "$user"
        else
            log "Test user $username already exists"
        fi
    done
    
    log "Test users setup completed"
}

# Validate setup
validate_setup() {
    local admin_token="$1"
    
    log "Validating Keycloak setup..."
    
    # Check realm
    local realm_check=$(curl -s -H "Authorization: Bearer $admin_token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME" | jq -r '.realm')
    
    if [ "$realm_check" != "$REALM_NAME" ]; then
        error "Realm validation failed"
        exit 1
    fi
    
    # Check roles count
    local roles_count=$(curl -s -H "Authorization: Bearer $admin_token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" | jq '. | length')
    
    if [ "$roles_count" -lt 8 ]; then
        error "Expected at least 8 roles, found: $roles_count"
        exit 1
    fi
    
    # Check clients count
    local clients_count=$(curl -s -H "Authorization: Bearer $admin_token" \
        "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" | jq '. | length')
    
    if [ "$clients_count" -lt 2 ]; then
        error "Expected at least 2 clients, found: $clients_count"
        exit 1
    fi
    
    log "Keycloak setup validation completed successfully"
}

# Generate summary
generate_summary() {
    log "Carmen ERP Keycloak Setup Summary"
    info "=================================="
    info "Realm: $REALM_NAME"
    info "Environment: $ENVIRONMENT"
    info "Keycloak URL: $KEYCLOAK_URL"
    info "Admin Console: $KEYCLOAK_URL/admin/"
    info ""
    info "Next Steps:"
    info "1. Update your Carmen ERP application's environment variables"
    info "2. Configure SSL certificates for production deployment"
    info "3. Set up monitoring and backup procedures"
    info "4. Test authentication flows"
    info ""
    info "For more information, see the deployment guide."
}

# Main execution
main() {
    log "Starting Carmen ERP Keycloak setup for environment: $ENVIRONMENT"
    
    check_dependencies
    wait_for_keycloak
    
    local admin_token=$(get_admin_token)
    
    setup_realm "$admin_token"
    setup_roles_and_groups "$admin_token"
    setup_clients "$admin_token"
    setup_test_users "$admin_token"
    validate_setup "$admin_token"
    generate_summary
    
    log "Carmen ERP Keycloak setup completed successfully!"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi