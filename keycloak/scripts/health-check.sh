#!/bin/bash

# Keycloak Health Check Script
# This script performs comprehensive health checks for Keycloak deployment

set -e

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM_NAME="${REALM_NAME:-carmen}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-keycloak}"
DB_USER="${DB_USER:-keycloak}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
ALERT_THRESHOLD="${ALERT_THRESHOLD:-3}"
WEBHOOK_URL="${WEBHOOK_URL:-}"

# Health check results
HEALTH_STATUS="HEALTHY"
HEALTH_ISSUES=()
CHECK_RESULTS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Record health check result
record_result() {
    local check_name="$1"
    local status="$2"
    local message="$3"
    local response_time="${4:-N/A}"
    
    CHECK_RESULTS+=("$check_name:$status:$message:$response_time")
    
    if [ "$status" != "PASS" ]; then
        HEALTH_STATUS="UNHEALTHY"
        HEALTH_ISSUES+=("$check_name: $message")
    fi
}

# Check Keycloak service availability
check_keycloak_service() {
    log "Checking Keycloak service availability..."
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health" || echo "000")
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response" = "200" ]; then
        record_result "Keycloak Service" "PASS" "Service is responding" "${response_time}ms"
    else
        record_result "Keycloak Service" "FAIL" "Service returned HTTP $response" "${response_time}ms"
    fi
}

# Check Keycloak health endpoints
check_keycloak_health() {
    log "Checking Keycloak health endpoints..."
    
    # Check readiness
    local start_time=$(date +%s%N)
    local ready_response=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health/ready" || echo "000")
    local end_time=$(date +%s%N)
    local ready_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$ready_response" = "200" ]; then
        record_result "Keycloak Readiness" "PASS" "Service is ready" "${ready_time}ms"
    else
        record_result "Keycloak Readiness" "FAIL" "Readiness check failed: HTTP $ready_response" "${ready_time}ms"
    fi
    
    # Check liveness
    start_time=$(date +%s%N)
    local live_response=$(curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_URL/health/live" || echo "000")
    end_time=$(date +%s%N)
    local live_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$live_response" = "200" ]; then
        record_result "Keycloak Liveness" "PASS" "Service is alive" "${live_time}ms"
    else
        record_result "Keycloak Liveness" "FAIL" "Liveness check failed: HTTP $live_response" "${live_time}ms"
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    local start_time=$(date +%s%N)
    
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        record_result "Database Connectivity" "PASS" "Database is accessible" "${response_time}ms"
        
        # Check database performance
        check_database_performance
    else
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        record_result "Database Connectivity" "FAIL" "Database is not accessible" "${response_time}ms"
    fi
}

# Check database performance
check_database_performance() {
    log "Checking database performance..."
    
    local start_time=$(date +%s%N)
    local query_result=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -t -c "SELECT count(*) FROM public.realm;" 2>/dev/null || echo "ERROR")
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$query_result" != "ERROR" ] && [ -n "$query_result" ]; then
        record_result "Database Performance" "PASS" "Query executed successfully ($query_result realms)" "${response_time}ms"
    else
        record_result "Database Performance" "FAIL" "Database query failed" "${response_time}ms"
    fi
}

# Check realm accessibility
check_realm() {
    log "Checking realm accessibility..."
    
    local start_time=$(date +%s%N)
    local realm_response=$(curl -s -o /dev/null -w "%{http_code}" \
        "$KEYCLOAK_URL/realms/$REALM_NAME/.well-known/openid_configuration" || echo "000")
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$realm_response" = "200" ]; then
        record_result "Realm Access" "PASS" "Realm $REALM_NAME is accessible" "${response_time}ms"
    else
        record_result "Realm Access" "FAIL" "Realm $REALM_NAME returned HTTP $realm_response" "${response_time}ms"
    fi
}

# Check SSL certificate (production)
check_ssl_certificate() {
    if [[ "$KEYCLOAK_URL" == https://* ]]; then
        log "Checking SSL certificate..."
        
        local hostname=$(echo "$KEYCLOAK_URL" | sed -e 's|^[^/]*//||' -e 's|/.*||')
        local cert_info=$(echo | timeout 10 openssl s_client -servername "$hostname" -connect "$hostname:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "ERROR")
        
        if [ "$cert_info" != "ERROR" ]; then
            local expiry_date=$(echo "$cert_info" | grep "notAfter" | sed 's/notAfter=//')
            local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ "$days_until_expiry" -gt 30 ]; then
                record_result "SSL Certificate" "PASS" "Certificate valid for $days_until_expiry days" "N/A"
            elif [ "$days_until_expiry" -gt 0 ]; then
                record_result "SSL Certificate" "WARN" "Certificate expires in $days_until_expiry days" "N/A"
            else
                record_result "SSL Certificate" "FAIL" "Certificate has expired" "N/A"
            fi
        else
            record_result "SSL Certificate" "FAIL" "Could not retrieve certificate information" "N/A"
        fi
    else
        info "SSL certificate check skipped (HTTP URL)"
    fi
}

# Check memory usage
check_memory_usage() {
    log "Checking system memory usage..."
    
    if command -v free >/dev/null 2>&1; then
        local memory_info=$(free -m | grep '^Mem:')
        local total_memory=$(echo $memory_info | awk '{print $2}')
        local used_memory=$(echo $memory_info | awk '{print $3}')
        local memory_percentage=$(( (used_memory * 100) / total_memory ))
        
        if [ "$memory_percentage" -lt 80 ]; then
            record_result "Memory Usage" "PASS" "Memory usage: ${memory_percentage}% (${used_memory}MB/${total_memory}MB)" "N/A"
        elif [ "$memory_percentage" -lt 90 ]; then
            record_result "Memory Usage" "WARN" "High memory usage: ${memory_percentage}% (${used_memory}MB/${total_memory}MB)" "N/A"
        else
            record_result "Memory Usage" "FAIL" "Critical memory usage: ${memory_percentage}% (${used_memory}MB/${total_memory}MB)" "N/A"
        fi
    else
        info "Memory usage check skipped (free command not available)"
    fi
}

# Check disk usage
check_disk_usage() {
    log "Checking disk usage..."
    
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        record_result "Disk Usage" "PASS" "Disk usage: ${disk_usage}%" "N/A"
    elif [ "$disk_usage" -lt 90 ]; then
        record_result "Disk Usage" "WARN" "High disk usage: ${disk_usage}%" "N/A"
    else
        record_result "Disk Usage" "FAIL" "Critical disk usage: ${disk_usage}%" "N/A"
    fi
}

# Generate health report
generate_report() {
    log "Generating health report..."
    
    echo ""
    echo "=========================================="
    echo "Keycloak Health Check Report"
    echo "=========================================="
    echo "Timestamp: $(date)"
    echo "Keycloak URL: $KEYCLOAK_URL"
    echo "Realm: $REALM_NAME"
    echo "Overall Status: $HEALTH_STATUS"
    echo ""
    
    echo "Check Results:"
    echo "--------------"
    for result in "${CHECK_RESULTS[@]}"; do
        IFS=':' read -r check_name status message response_time <<< "$result"
        printf "%-25s %-6s %-50s %s\n" "$check_name" "$status" "$message" "$response_time"
    done
    
    if [ ${#HEALTH_ISSUES[@]} -gt 0 ]; then
        echo ""
        echo "Health Issues:"
        echo "--------------"
        for issue in "${HEALTH_ISSUES[@]}"; do
            echo "• $issue"
        done
    fi
    
    echo ""
    echo "=========================================="
}

# Send alert notification
send_alert() {
    if [ -n "$WEBHOOK_URL" ] && [ "$HEALTH_STATUS" != "HEALTHY" ]; then
        log "Sending alert notification..."
        
        local issues_text=""
        for issue in "${HEALTH_ISSUES[@]}"; do
            issues_text="$issues_text\n• $issue"
        done
        
        local payload=$(cat <<EOF
{
    "text": "Keycloak Health Check Alert",
    "attachments": [
        {
            "color": "danger",
            "fields": [
                {
                    "title": "Status",
                    "value": "$HEALTH_STATUS",
                    "short": true
                },
                {
                    "title": "Keycloak URL",
                    "value": "$KEYCLOAK_URL",
                    "short": true
                },
                {
                    "title": "Issues Found",
                    "value": "$issues_text",
                    "short": false
                },
                {
                    "title": "Timestamp",
                    "value": "$(date)",
                    "short": true
                }
            ]
        }
    ]
}
EOF
)
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$WEBHOOK_URL" || warn "Failed to send alert notification"
    fi
}

# Main health check function
main() {
    log "Starting Keycloak health check..."
    
    check_keycloak_service
    check_keycloak_health
    check_database
    check_realm
    check_ssl_certificate
    check_memory_usage
    check_disk_usage
    
    generate_report
    send_alert
    
    if [ "$HEALTH_STATUS" = "HEALTHY" ]; then
        log "All health checks passed!"
        exit 0
    else
        error "Health check failed with ${#HEALTH_ISSUES[@]} issues"
        exit 1
    fi
}

# Continuous monitoring mode
monitor() {
    log "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)..."
    
    while true; do
        main
        sleep "$CHECK_INTERVAL"
    done
}

# Script execution
if [ "$1" = "monitor" ]; then
    monitor
else
    main
fi