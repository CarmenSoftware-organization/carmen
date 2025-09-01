#!/bin/bash

# Keycloak Database Backup Script
# This script creates automated backups of the Keycloak database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB_HOST="${DB_HOST:-keycloak-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-keycloak}"
DB_USER="${DB_USER:-keycloak}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="keycloak_backup_${TIMESTAMP}.sql"

# AWS S3 Configuration (optional)
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; then
        error "Database connection failed"
        exit 1
    fi
    
    log "Database connection successful"
}

# Create database backup
create_backup() {
    log "Creating database backup: $BACKUP_FILE"
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --compress=9 \
        --file="$backup_path"
    
    if [ $? -eq 0 ]; then
        log "Database backup created successfully"
        
        # Get backup size
        local backup_size=$(du -h "$backup_path" | cut -f1)
        log "Backup size: $backup_size"
    else
        error "Database backup failed"
        exit 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    log "Verifying backup integrity..."
    
    # Check if backup file exists and is not empty
    if [ ! -s "$backup_path" ]; then
        error "Backup file is empty or does not exist"
        exit 1
    fi
    
    # Verify backup structure
    if ! pg_restore --list "$backup_path" > /dev/null 2>&1; then
        error "Backup file is corrupted"
        exit 1
    fi
    
    log "Backup integrity verified"
}

# Upload to S3 (optional)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "S3 upload skipped (no S3_BUCKET configured)"
        return 0
    fi
    
    log "Uploading backup to S3..."
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    local s3_key="keycloak-backups/$(date +%Y)/$(date +%m)/$BACKUP_FILE"
    
    if command -v aws &> /dev/null; then
        aws s3 cp "$backup_path" "s3://$S3_BUCKET/$s3_key" \
            --region "$AWS_REGION" \
            --storage-class STANDARD_IA
        
        if [ $? -eq 0 ]; then
            log "Backup uploaded to S3: s3://$S3_BUCKET/$s3_key"
        else
            error "S3 upload failed"
        fi
    else
        warn "AWS CLI not available, skipping S3 upload"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Local cleanup
    if [ -d "$BACKUP_DIR" ]; then
        deleted_count=$(find "$BACKUP_DIR" -name "keycloak_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
        log "Deleted $deleted_count local backup files"
    fi
    
    # S3 cleanup (if configured)
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        local s3_lifecycle_config=$(cat <<EOF
{
    "Rules": [
        {
            "ID": "KeycloakBackupRetention",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "keycloak-backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 90,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "Expiration": {
                "Days": 365
            }
        }
    ]
}
EOF
)
        
        echo "$s3_lifecycle_config" | aws s3api put-bucket-lifecycle-configuration \
            --bucket "$S3_BUCKET" \
            --lifecycle-configuration file:///dev/stdin \
            --region "$AWS_REGION" 2>/dev/null || true
    fi
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    if [ -n "$WEBHOOK_URL" ]; then
        local payload=$(cat <<EOF
{
    "text": "Keycloak Backup $status",
    "attachments": [
        {
            "color": "$( [ "$status" = "SUCCESS" ] && echo "good" || echo "danger" )",
            "fields": [
                {
                    "title": "Backup File",
                    "value": "$BACKUP_FILE",
                    "short": true
                },
                {
                    "title": "Timestamp",
                    "value": "$(date)",
                    "short": true
                },
                {
                    "title": "Message",
                    "value": "$message",
                    "short": false
                }
            ]
        }
    ]
}
EOF
)
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$WEBHOOK_URL" || true
    fi
}

# Main backup process
main() {
    log "Starting Keycloak database backup..."
    
    create_backup_dir
    test_connection
    create_backup
    verify_backup
    upload_to_s3
    cleanup_old_backups
    
    send_notification "SUCCESS" "Database backup completed successfully"
    log "Backup process completed successfully!"
}

# Error handling
trap 'error "Backup process failed"; send_notification "FAILED" "Database backup process failed"; exit 1' ERR

# Execute main function
main "$@"