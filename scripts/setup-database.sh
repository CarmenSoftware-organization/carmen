#!/bin/bash

# ABAC Database Setup Script
# Sets up PostgreSQL database for Carmen ABAC system

set -e  # Exit on any error

echo "🗄️  Carmen ABAC Database Setup"
echo "================================"

# Configuration
DB_HOST="localhost"
DB_PORT="5435"
DB_USER="postgres"
DB_PASSWORD="password"
DB_NAME="carmen_abac_db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if PostgreSQL is installed
check_postgresql() {
    log_info "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL client found"
        psql --version
    else
        log_error "PostgreSQL client not found"
        log_info "Please install PostgreSQL:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
        echo "  Windows: Download from https://www.postgresql.org/download/"
        exit 1
    fi
}

# Start PostgreSQL service if not running
start_postgresql() {
    log_info "Checking if PostgreSQL is running on port $DB_PORT..."
    
    if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER &> /dev/null; then
        log_success "PostgreSQL is running on port $DB_PORT"
    else
        log_warning "PostgreSQL not running on port $DB_PORT"
        log_info "Attempting to start PostgreSQL..."
        
        # Try different methods to start PostgreSQL
        if command -v brew &> /dev/null && brew services list | grep postgresql &> /dev/null; then
            # macOS with Homebrew
            brew services start postgresql
            sleep 2
        elif systemctl --version &> /dev/null; then
            # Linux with systemd
            sudo systemctl start postgresql
            sleep 2
        else
            log_warning "Could not auto-start PostgreSQL"
            log_info "Please start PostgreSQL manually:"
            echo "  macOS: brew services start postgresql"
            echo "  Linux: sudo systemctl start postgresql"
            echo "  Then configure it to run on port $DB_PORT"
            exit 1
        fi
    fi
}

# Create database user and database
create_database() {
    log_info "Creating database and user..."
    
    # Check if database exists
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_success "Database '$DB_NAME' already exists"
    else
        log_info "Creating database '$DB_NAME'..."
        
        # Create database
        PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME || {
            log_error "Failed to create database"
            log_info "You may need to create the database manually:"
            echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c \"CREATE DATABASE $DB_NAME;\""
            exit 1
        }
        
        log_success "Database '$DB_NAME' created successfully"
    fi
}

# Set up database extensions and configuration
setup_database() {
    log_info "Setting up database extensions and configuration..."
    
    # Run the SQL setup script
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f prisma/setup-abac-db.sql || {
        log_error "Failed to set up database extensions"
        log_info "Trying to set up basic extensions..."
        
        # Try basic extensions only
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
            CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
            CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
        " && log_success "Basic extensions installed"
    }
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" &> /dev/null; then
        log_success "Database connection successful"
        
        # Show database info
        log_info "Database information:"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
            SELECT 
                current_database() as database,
                current_user as user,
                version() as postgresql_version;
        "
    else
        log_error "Database connection failed"
        exit 1
    fi
}

# Update .env file
update_env() {
    log_info "Updating .env file..."
    
    ENV_FILE=".env"
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    if [ -f "$ENV_FILE" ]; then
        # Update existing .env
        if grep -q "DATABASE_URL" "$ENV_FILE"; then
            # Replace existing DATABASE_URL
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
            else
                # Linux
                sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
            fi
            log_success "Updated DATABASE_URL in existing .env file"
        else
            # Add DATABASE_URL
            echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
            log_success "Added DATABASE_URL to .env file"
        fi
    else
        # Create new .env file
        echo "DATABASE_URL=\"$DATABASE_URL\"" > "$ENV_FILE"
        log_success "Created .env file with DATABASE_URL"
    fi
    
    log_info "Database URL: $DATABASE_URL"
}

# Main setup process
main() {
    echo
    log_info "Starting database setup process..."
    echo
    
    check_postgresql
    start_postgresql
    create_database
    setup_database
    test_connection
    update_env
    
    echo
    log_success "Database setup completed successfully!"
    echo
    log_info "Next steps:"
    echo "  1. Deploy ABAC schema: npm run db:push"
    echo "  2. Seed with sample data: npm run db:seed"
    echo "  3. Or run both at once: npm run db:setup-abac"
    echo "  4. Validate setup: npm run db:test-setup"
    echo "  5. Browse database: npm run db:studio"
    echo
}

# Run main function
main "$@"