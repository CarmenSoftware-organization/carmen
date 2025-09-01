# Keycloak Production Deployment Guide for Carmen ERP

This comprehensive guide covers the production deployment of Keycloak for Carmen ERP authentication and authorization.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Installation Steps](#installation-steps)
5. [Security Configuration](#security-configuration)
6. [Performance Tuning](#performance-tuning)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance Procedures](#maintenance-procedures)

## Prerequisites

### System Requirements

**Minimum Production Requirements:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 100GB SSD
- **Network:** 1Gbps connection

**Recommended Production Requirements:**
- **CPU:** 8 cores
- **RAM:** 16GB
- **Storage:** 500GB SSD with backup storage
- **Network:** 1Gbps connection with redundancy

### Software Dependencies

- Docker 20.10+ and Docker Compose 2.0+
- PostgreSQL 15+ (managed or self-hosted)
- Nginx or Load Balancer
- SSL/TLS certificates
- Backup solution (AWS S3, Azure Storage, etc.)

### Network Requirements

- **Ports:**
  - 80/443: HTTP/HTTPS (Nginx)
  - 8443: Keycloak HTTPS (internal)
  - 5432: PostgreSQL (internal)
  - 6379: Redis (internal)
  - 9000: Health checks
  - 9090: Prometheus metrics

## Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Load Balancer │    │    Nginx     │    │   Keycloak      │
│   (CloudFlare)  │────┤   (Reverse   │────┤   (Auth Server) │
│                 │    │    Proxy)    │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              │                       │
                    ┌─────────┴──────────┐    ┌──────┴──────┐
                    │   PostgreSQL       │    │    Redis    │
                    │   (Database)       │    │   (Cache)   │
                    └────────────────────┘    └─────────────┘
```

### Component Overview

- **Nginx:** Reverse proxy and SSL termination
- **Keycloak:** Authentication and authorization server
- **PostgreSQL:** Primary database for Keycloak data
- **Redis:** Session clustering and caching
- **Prometheus:** Metrics collection and monitoring

## Pre-Deployment Checklist

### Security Checklist

- [ ] SSL/TLS certificates obtained and validated
- [ ] Strong passwords generated for all services
- [ ] Database credentials secured
- [ ] Client secrets generated and secured
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] CORS policies defined
- [ ] Audit logging enabled

### Infrastructure Checklist

- [ ] DNS records configured
- [ ] Load balancer configured
- [ ] Firewall rules configured
- [ ] Backup solution configured
- [ ] Monitoring solution configured
- [ ] Log aggregation configured

### Configuration Checklist

- [ ] Environment variables configured
- [ ] Realm configuration validated
- [ ] Client configurations validated
- [ ] Role mappings verified
- [ ] Group hierarchies configured
- [ ] Email server configured
- [ ] Theme customization completed

## Installation Steps

### Step 1: Prepare Environment

1. **Create project directory:**
   ```bash
   mkdir -p /opt/carmen-keycloak
   cd /opt/carmen-keycloak
   ```

2. **Clone configuration files:**
   ```bash
   git clone <repository-url>
   cp -r keycloak/* .
   ```

3. **Set up environment variables:**
   ```bash
   cp docker/.env.production .env
   # Edit .env with production values
   nano .env
   ```

### Step 2: Generate SSL Certificates

1. **Using Let's Encrypt:**
   ```bash
   sudo certbot certonly --standalone \
     -d auth.carmen-erp.com \
     --email admin@carmen-erp.com
   
   # Copy certificates
   sudo cp /etc/letsencrypt/live/auth.carmen-erp.com/fullchain.pem certs/server.crt
   sudo cp /etc/letsencrypt/live/auth.carmen-erp.com/privkey.pem certs/server.key
   ```

2. **Using custom certificates:**
   ```bash
   # Place your certificates in the certs directory
   cp your-certificate.crt certs/server.crt
   cp your-private-key.key certs/server.key
   
   # Set appropriate permissions
   chmod 600 certs/server.key
   chmod 644 certs/server.crt
   ```

### Step 3: Configure Nginx

1. **Create Nginx configuration:**
   ```bash
   mkdir -p nginx/conf.d
   ```

2. **Configure SSL and proxy settings:**
   ```nginx
   # nginx/conf.d/keycloak.conf
   upstream keycloak {
       server keycloak:8443;
   }
   
   server {
       listen 80;
       server_name auth.carmen-erp.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name auth.carmen-erp.com;
   
       ssl_certificate /etc/nginx/certs/server.crt;
       ssl_certificate_key /etc/nginx/certs/server.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
   
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Frame-Options DENY always;
       add_header X-Content-Type-Options nosniff always;
       add_header X-XSS-Protection "1; mode=block" always;
   
       location / {
           proxy_pass https://keycloak;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-Port $server_port;
       }
   
       location /health {
           proxy_pass http://keycloak:9000/health;
           access_log off;
       }
   }
   ```

### Step 4: Deploy Services

1. **Start the services:**
   ```bash
   # Production deployment
   docker-compose -f docker/docker-compose.production.yml up -d
   ```

2. **Verify services are running:**
   ```bash
   docker-compose -f docker/docker-compose.production.yml ps
   ```

3. **Check service health:**
   ```bash
   curl -f https://auth.carmen-erp.com/health/ready
   ```

### Step 5: Initialize Keycloak

1. **Run the setup script:**
   ```bash
   cd scripts
   ENVIRONMENT=production ./setup-keycloak.sh
   ```

2. **Verify realm configuration:**
   ```bash
   curl -s "https://auth.carmen-erp.com/realms/carmen/.well-known/openid_configuration" | jq .
   ```

## Security Configuration

### 1. Database Security

```bash
# Create dedicated database user
sudo -u postgres createuser --no-createdb --no-createrole --no-superuser keycloak_prod
sudo -u postgres psql -c "ALTER USER keycloak_prod WITH ENCRYPTED PASSWORD 'secure_password';"

# Configure PostgreSQL authentication
echo "host keycloak keycloak_prod 172.20.0.0/16 md5" >> /etc/postgresql/15/main/pg_hba.conf
```

### 2. Keycloak Security

```bash
# Configure security settings in environment
cat >> .env << EOF
# Security settings
KC_SPI_RATE_LIMITING_ENABLED=true
KC_SPI_RATE_LIMITING_REQUESTS_PER_MINUTE=100
KC_SPI_BRUTE_FORCE_PROTECTION_ENABLED=true
KC_SPI_BRUTE_FORCE_PROTECTION_MAX_LOGIN_FAILURES=5
KC_SPI_BRUTE_FORCE_PROTECTION_WAIT_INCREMENT_SECONDS=60
KC_SPI_BRUTE_FORCE_PROTECTION_MAX_FAILURE_WAIT_SECONDS=900
EOF
```

### 3. Network Security

```bash
# Configure firewall rules
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

# Block direct access to internal services
iptables -A INPUT -p tcp --dport 8443 -s 172.20.0.0/16 -j ACCEPT
iptables -A INPUT -p tcp --dport 8443 -j DROP
```

## Performance Tuning

### 1. JVM Optimization

```bash
# Add JVM tuning to .env
cat >> .env << EOF
# JVM Performance tuning
JAVA_OPTS_APPEND="-Xms2048m -Xmx4096m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=512m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"
EOF
```

### 2. Database Optimization

```sql
-- PostgreSQL configuration optimizations
-- Add to postgresql.conf

shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 64MB
maintenance_work_mem = 512MB
random_page_cost = 1.1
effective_io_concurrency = 200
max_connections = 200
wal_buffers = 64MB
checkpoint_completion_target = 0.9
wal_compression = on
```

### 3. Connection Pooling

```bash
# Configure database connection pooling in .env
cat >> .env << EOF
KC_DB_POOL_INITIAL_SIZE=10
KC_DB_POOL_MIN_SIZE=10
KC_DB_POOL_MAX_SIZE=50
KC_DATASOURCE_POOL_SIZE=50
EOF
```

## Monitoring and Logging

### 1. Prometheus Monitoring

Create monitoring configuration:

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'keycloak'
    static_configs:
      - targets: ['keycloak:9000']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: /metrics

  - job_name: 'postgresql'
    static_configs:
      - targets: ['keycloak-db:5432']
```

### 2. Log Configuration

```bash
# Configure centralized logging
mkdir -p logs

# Add log rotation
cat > /etc/logrotate.d/keycloak << EOF
/opt/carmen-keycloak/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    copytruncate
    create 644 root root
}
EOF
```

### 3. Health Checks

Set up continuous health monitoring:

```bash
# Add to crontab
crontab -e

# Add this line to run health checks every 5 minutes
*/5 * * * * /opt/carmen-keycloak/scripts/health-check.sh >> /var/log/keycloak-health.log 2>&1
```

## Backup and Recovery

### 1. Database Backup

```bash
# Set up automated backups
cat > /etc/cron.d/keycloak-backup << EOF
# Daily backup at 2 AM
0 2 * * * root /opt/carmen-keycloak/scripts/backup.sh
EOF

# Configure backup retention
export BACKUP_RETENTION_DAYS=30
export BACKUP_S3_BUCKET=carmen-erp-backups
```

### 2. Configuration Backup

```bash
# Backup script for configuration
cat > scripts/backup-config.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/keycloak-config"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup configuration files
tar -czf "$BACKUP_DIR/keycloak-config-$DATE.tar.gz" \
    .env \
    nginx/ \
    certs/ \
    realm-exports/ \
    clients/ \
    docker-compose.production.yml

# Upload to S3 (if configured)
if [ -n "$BACKUP_S3_BUCKET" ]; then
    aws s3 cp "$BACKUP_DIR/keycloak-config-$DATE.tar.gz" \
        "s3://$BACKUP_S3_BUCKET/config-backups/"
fi
EOF

chmod +x scripts/backup-config.sh
```

### 3. Disaster Recovery

```bash
# Disaster recovery script
cat > scripts/restore-keycloak.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_FILE="$1"
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "Restoring Keycloak from backup: $BACKUP_FILE"

# Stop services
docker-compose -f docker/docker-compose.production.yml down

# Restore database
pg_restore -h localhost -U keycloak -d keycloak --clean "$BACKUP_FILE"

# Start services
docker-compose -f docker/docker-compose.production.yml up -d

echo "Restore completed successfully"
EOF

chmod +x scripts/restore-keycloak.sh
```

## Troubleshooting

### Common Issues and Solutions

1. **Keycloak fails to start**
   ```bash
   # Check logs
   docker-compose logs keycloak
   
   # Common fixes
   # - Check database connectivity
   # - Verify SSL certificates
   # - Check memory allocation
   ```

2. **Authentication failures**
   ```bash
   # Enable debug logging temporarily
   docker-compose exec keycloak bash
   /opt/keycloak/bin/kc.sh start --log-level=DEBUG
   ```

3. **Database connection issues**
   ```bash
   # Test database connectivity
   docker-compose exec keycloak bash
   pg_isready -h keycloak-db -p 5432 -U keycloak
   ```

4. **SSL certificate problems**
   ```bash
   # Verify certificate validity
   openssl x509 -in certs/server.crt -text -noout
   
   # Check certificate chain
   openssl verify -CAfile ca-bundle.crt certs/server.crt
   ```

### Log Analysis

```bash
# Monitor logs in real-time
docker-compose logs -f keycloak

# Search for specific errors
docker-compose logs keycloak | grep -i error

# Analyze authentication events
docker-compose logs keycloak | grep -i "authentication"
```

## Maintenance Procedures

### 1. Regular Updates

```bash
# Monthly update procedure
cat > scripts/update-keycloak.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting Keycloak maintenance update..."

# Create backup before update
./scripts/backup.sh

# Pull latest images
docker-compose -f docker/docker-compose.production.yml pull

# Update services with zero downtime
docker-compose -f docker/docker-compose.production.yml up -d --no-deps keycloak

# Wait for service to be ready
./scripts/health-check.sh

echo "Update completed successfully"
EOF

chmod +x scripts/update-keycloak.sh
```

### 2. Certificate Renewal

```bash
# Automated certificate renewal
cat > scripts/renew-certificates.sh << 'EOF'
#!/bin/bash
set -e

# Renew Let's Encrypt certificates
certbot renew --quiet

# Copy renewed certificates
cp /etc/letsencrypt/live/auth.carmen-erp.com/fullchain.pem certs/server.crt
cp /etc/letsencrypt/live/auth.carmen-erp.com/privkey.pem certs/server.key

# Reload Nginx
docker-compose exec nginx nginx -s reload

echo "Certificate renewal completed"
EOF

chmod +x scripts/renew-certificates.sh

# Add to crontab for automatic renewal
echo "0 3 1 * * /opt/carmen-keycloak/scripts/renew-certificates.sh" | crontab -
```

### 3. Performance Monitoring

```bash
# Weekly performance report
cat > scripts/performance-report.sh << 'EOF'
#!/bin/bash

echo "Keycloak Performance Report - $(date)"
echo "=================================="

# Database size
echo "Database Size:"
docker-compose exec keycloak-db psql -U keycloak -d keycloak -c "SELECT pg_size_pretty(pg_database_size('keycloak'));"

# Active sessions
echo "Active Sessions:"
docker-compose exec keycloak-db psql -U keycloak -d keycloak -c "SELECT count(*) FROM user_session;"

# Response times (from logs)
echo "Average Response Times (last 24h):"
docker-compose logs --since=24h keycloak | grep -o 'duration=[0-9]*ms' | sed 's/duration=//;s/ms//' | awk '{sum+=$1; count++} END {print "Average: " sum/count "ms"}'

# Memory usage
echo "Memory Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" keycloak
EOF

chmod +x scripts/performance-report.sh
```

## Security Best Practices

### 1. Regular Security Audits

- Review user accounts monthly
- Audit role assignments quarterly
- Check for unused clients and roles
- Monitor failed login attempts
- Review audit logs weekly

### 2. Access Control

- Implement principle of least privilege
- Regular access reviews
- Multi-factor authentication for admin accounts
- Strong password policies
- Account lockout policies

### 3. Network Security

- Use VPN for administrative access
- Implement IP whitelisting
- Regular security updates
- Network segmentation
- DDoS protection

## Support and Resources

### Documentation Links

- [Keycloak Official Documentation](https://www.keycloak.org/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](http://nginx.org/en/docs/)

### Support Contacts

- **Technical Lead:** technical-lead@carmen-erp.com
- **DevOps Team:** devops@carmen-erp.com
- **Emergency Contact:** +1-XXX-XXX-XXXX

### Useful Commands

```bash
# Quick health check
curl -f https://auth.carmen-erp.com/health/ready

# View service status
docker-compose -f docker/docker-compose.production.yml ps

# Restart specific service
docker-compose -f docker/docker-compose.production.yml restart keycloak

# View real-time logs
docker-compose -f docker/docker-compose.production.yml logs -f

# Database connection test
docker-compose exec keycloak-db pg_isready -U keycloak

# Backup database manually
docker-compose exec keycloak-db pg_dump -U keycloak keycloak > backup.sql
```

---

**Note:** This deployment guide should be customized according to your specific infrastructure requirements and security policies. Always test deployments in a staging environment before applying to production.