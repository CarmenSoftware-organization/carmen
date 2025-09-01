#!/bin/bash

# =============================================================================
# Carmen ERP Keycloak Setup Script
# =============================================================================
# This script sets up Keycloak for local development and testing.
# It handles Docker Compose orchestration, initial configuration,
# and provides useful management commands.
# 
# Usage:
#   ./scripts/setup-keycloak.sh [command]
#
# Commands:
#   start     - Start Keycloak and dependencies
#   stop      - Stop all services
#   restart   - Restart all services
#   reset     - Reset all data and start fresh
#   logs      - Show logs for all services
#   status    - Show status of all services
#   config    - Show configuration summary
#   users     - List available test users
#   help      - Show this help message
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.keycloak.yml"
PROJECT_NAME="carmen-keycloak"

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

# Check dependencies
check_dependencies() {
    log_section "Checking dependencies"
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Dependencies are installed"
}

# Check if compose file exists
check_compose_file() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file '$COMPOSE_FILE' not found"
        log_info "Make sure you're running this script from the project root directory"
        exit 1
    fi
}

# Start services
start_services() {
    log_section "Starting Keycloak services"
    
    check_dependencies
    check_compose_file
    
    # Create directories if they don't exist
    mkdir -p keycloak/themes
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
    
    log_success "Services started successfully"
    log_info "Keycloak will be available at: http://localhost:8080"
    log_info "Admin console: http://localhost:8080/admin"
    log_info "MailHog interface: http://localhost:8025"
    log_info ""
    log_warning "It may take a few minutes for Keycloak to fully initialize"
    
    # Wait for services to be healthy
    wait_for_services
}

# Stop services
stop_services() {
    log_section "Stopping Keycloak services"
    
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    
    log_success "Services stopped successfully"
}

# Restart services
restart_services() {
    log_section "Restarting Keycloak services"
    
    stop_services
    sleep 2
    start_services
}

# Reset all data
reset_services() {
    log_section "Resetting Keycloak services"
    
    log_warning "This will DELETE ALL Keycloak data including users, realms, and configuration"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Reset cancelled"
        exit 0
    fi
    
    # Stop services
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    
    # Remove volumes
    docker volume rm "${PROJECT_NAME}_keycloak_data" 2>/dev/null || true
    docker volume rm "${PROJECT_NAME}_keycloak_postgres_data" 2>/dev/null || true
    docker volume rm "${PROJECT_NAME}_redis_data" 2>/dev/null || true
    
    log_success "Data reset completed"
    
    # Start services
    start_services
}

# Show logs
show_logs() {
    log_section "Showing service logs"
    
    if [ -n "$1" ]; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$1"
    else
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
    fi
}

# Show status
show_status() {
    log_section "Service status"
    
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    
    echo -e "\n${BLUE}Health Checks:${NC}"
    
    # Check Keycloak
    if curl -s http://localhost:8080/health/ready > /dev/null 2>&1; then
        log_success "Keycloak is healthy"
    else
        log_warning "Keycloak is not ready"
    fi
    
    # Check PostgreSQL
    if docker exec "${PROJECT_NAME}_keycloak-postgres_1" pg_isready -U keycloak > /dev/null 2>&1 || \
       docker exec "${PROJECT_NAME}-keycloak-postgres-1" pg_isready -U keycloak > /dev/null 2>&1; then
        log_success "PostgreSQL is healthy"
    else
        log_warning "PostgreSQL is not ready"
    fi
    
    # Check Redis
    if docker exec "${PROJECT_NAME}_redis_1" redis-cli ping > /dev/null 2>&1 || \
       docker exec "${PROJECT_NAME}-redis-1" redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is healthy"
    else
        log_warning "Redis is not ready"
    fi
}

# Wait for services to be healthy
wait_for_services() {
    log_section "Waiting for services to be ready"
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    local postgres_ready=false
    for i in {1..30}; do
        if docker exec "${PROJECT_NAME}_keycloak-postgres_1" pg_isready -U keycloak > /dev/null 2>&1 || \
           docker exec "${PROJECT_NAME}-keycloak-postgres-1" pg_isready -U keycloak > /dev/null 2>&1; then
            postgres_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$postgres_ready" = true ]; then
        log_success "PostgreSQL is ready"
    else
        log_warning "PostgreSQL is not ready after 60 seconds"
    fi
    
    # Wait for Keycloak
    log_info "Waiting for Keycloak..."
    local keycloak_ready=false
    for i in {1..60}; do
        if curl -s http://localhost:8080/health/ready > /dev/null 2>&1; then
            keycloak_ready=true
            break
        fi
        sleep 5
    done
    
    if [ "$keycloak_ready" = true ]; then
        log_success "Keycloak is ready"
        show_config_summary
    else
        log_warning "Keycloak is not ready after 5 minutes"
        log_info "Check logs with: $0 logs keycloak"
    fi
}

# Show configuration summary
show_config_summary() {
    log_section "Configuration Summary"
    
    echo -e "${CYAN}🔐 Keycloak Admin Console:${NC}"
    echo "  URL: http://localhost:8080/admin"
    echo "  Username: admin"
    echo "  Password: admin_password"
    echo ""
    
    echo -e "${CYAN}🌍 Carmen Realm:${NC}"
    echo "  Name: carmen"
    echo "  URL: http://localhost:8080/realms/carmen"
    echo ""
    
    echo -e "${CYAN}📧 MailHog (Email Testing):${NC}"
    echo "  Web Interface: http://localhost:8025"
    echo "  SMTP: localhost:1025"
    echo ""
    
    echo -e "${CYAN}🔧 Client Configuration:${NC}"
    echo "  Client ID: carmen-web"
    echo "  Client Secret: (configured in realm)"
    echo ""
    
    show_test_users
}

# Show test users
show_test_users() {
    echo -e "${CYAN}👥 Test Users:${NC}"
    echo "  admin / admin123           - Super Administrator"
    echo "  chef.maria / chef123       - Chef (Kitchen Department)"
    echo "  finance.manager / finance123 - Financial Manager"
    echo "  procurement.staff / procurement123 - Procurement Staff"
    echo ""
    
    log_info "These users are automatically created when Keycloak starts"
}

# Show help
show_help() {
    echo -e "${BLUE}Carmen ERP Keycloak Setup Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  start     - Start Keycloak and dependencies"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  reset     - Reset all data and start fresh"
    echo "  logs      - Show logs for all services"
    echo "  status    - Show status of all services"
    echo "  config    - Show configuration summary"
    echo "  users     - List available test users"
    echo "  help      - Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs keycloak           # Show logs for Keycloak service only"
    echo "  $0 reset                   # Reset all data and restart"
    echo ""
    echo -e "${YELLOW}Development URLs:${NC}"
    echo "  Keycloak Admin: http://localhost:8080/admin"
    echo "  Carmen Realm: http://localhost:8080/realms/carmen"
    echo "  MailHog: http://localhost:8025"
}

# Main command handling
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reset)
        reset_services
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    config)
        show_config_summary
        ;;
    users)
        show_test_users
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        log_warning "No command specified"
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac