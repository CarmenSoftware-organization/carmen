# Environment Variables Reference

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Complete reference for all environment variables used in Carmen ERP security and configuration.

## Table of Contents

1. [Required Variables](#required-variables)
2. [Database Configuration](#database-configuration)
3. [Authentication & JWT](#authentication--jwt)
4. [Session Security](#session-security)
5. [Data Encryption](#data-encryption)
6. [API Security](#api-security)
7. [Security Headers](#security-headers)
8. [Audit Logging](#audit-logging)
9. [Application Settings](#application-settings)
10. [Optional Features](#optional-features)
11. [Environment Examples](#environment-examples)

## Required Variables

These variables MUST be set for the application to function securely:

### Critical Security Variables

```bash
# Database connection (REQUIRED)
DATABASE_URL="postgresql://username:password@localhost:5432/carmen_erp"

# JWT authentication (REQUIRED)
JWT_SECRET="your-256-bit-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"

# Session security (REQUIRED)
SESSION_SECRET="your-session-secret-key-here"

# Data encryption (REQUIRED)
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## Database Configuration

### Connection Settings

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | URL | **Required** | PostgreSQL connection string |
| `DB_CONNECTION_LIMIT` | Number | `10` | Maximum database connections |
| `DB_POOL_TIMEOUT` | Number | `10` | Connection pool timeout (seconds) |

### Reliability Features

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_CIRCUIT_BREAKER` | Boolean | `true` | Enable circuit breaker pattern |
| `DB_MONITORING` | Boolean | `true` | Enable connection monitoring |
| `DB_TIMEOUTS` | Boolean | `true` | Enable operation timeouts |

### Circuit Breaker Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_CB_FAILURE_THRESHOLD` | Number | `5` | Failures before opening circuit |
| `DB_CB_TIMEOUT` | Number | `60000` | Circuit breaker timeout (ms) |

### Monitoring Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_HEALTH_CHECK_INTERVAL` | Number | `30000` | Health check interval (ms) |
| `DB_ALERT_WEBHOOK_URL` | URL | Optional | Database alert webhook URL |

### Alert Thresholds

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DB_ALERT_HEALTH_SCORE_THRESHOLD` | Number | `70` | Minimum health score (0-100) |
| `DB_ALERT_POOL_UTILIZATION_THRESHOLD` | Number | `80` | Maximum pool utilization (%) |
| `DB_ALERT_QUERY_TIME_THRESHOLD` | Number | `1000` | Maximum query time (ms) |
| `DB_ALERT_ERROR_RATE_THRESHOLD` | Number | `5` | Maximum error rate (%) |
| `DB_ALERT_CONNECTION_TIMEOUT_THRESHOLD` | Number | `3` | Maximum connection timeouts |

## Authentication & JWT

### JWT Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET` | String | **Required** | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | String | `24h` | Access token expiration |
| `JWT_REFRESH_SECRET` | String | **Required** | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | String | `7d` | Refresh token expiration |

#### Token Expiration Format

Use these formats for token expiration:
- `60s` - 60 seconds
- `5m` - 5 minutes  
- `2h` - 2 hours
- `7d` - 7 days

#### Generating JWT Secrets

```bash
# Generate strong JWT secret (64 characters)
openssl rand -base64 64

# Alternative method
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Session Security

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SESSION_SECRET` | String | **Required** | Session signing secret (min 32 chars) |
| `SESSION_SECURE` | Boolean | `true` | Require HTTPS for cookies |
| `SESSION_HTTP_ONLY` | Boolean | `true` | HTTP-only cookies |
| `SESSION_SAME_SITE` | Enum | `strict` | SameSite cookie attribute |

### Session Configuration Values

#### SESSION_SAME_SITE Options
- `strict` - Strictest protection (recommended)
- `lax` - Moderate protection
- `none` - No protection (requires HTTPS)

## Data Encryption

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ENCRYPTION_KEY` | String | **Required** | Encryption key (exactly 32 chars) |
| `ENCRYPTION_ALGORITHM` | String | `aes-256-gcm` | Encryption algorithm |

### Generating Encryption Key

```bash
# Generate 32-character encryption key
openssl rand -hex 16

# Verify length (should output 32)
echo "your-key-here" | wc -c
```

## API Security

### Rate Limiting

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `API_RATE_LIMIT_WINDOW` | Number | `900` | Rate limit window (seconds) |
| `API_RATE_LIMIT_MAX_REQUESTS` | Number | `1000` | Max requests per window |
| `API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS` | Boolean | `false` | Skip successful requests in count |

### Account Security

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FAILED_LOGIN_THRESHOLD` | Number | `5` | Failed attempts before lockout |
| `ACCOUNT_LOCKOUT_DURATION` | Number | `1800` | Lockout duration (seconds) |

## Security Headers

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SECURITY_HEADERS_ENABLED` | Boolean | `true` | Enable security headers |
| `CORS_ORIGIN` | String/Array | `*` | Allowed CORS origins |
| `CORS_CREDENTIALS` | Boolean | `true` | Allow credentials in CORS |

### Content Security Policy

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CSP_ENABLED` | Boolean | `true` | Enable Content Security Policy |
| `CSP_REPORT_URI` | URL | Optional | CSP violation report endpoint |

### CORS Configuration Examples

```bash
# Single origin
CORS_ORIGIN="https://app.carmen-erp.com"

# Multiple origins (JSON array)
CORS_ORIGIN='["https://app.carmen-erp.com", "https://admin.carmen-erp.com"]'

# Development (allow all)
CORS_ORIGIN="*"

# Production (restrict to domain)
CORS_ORIGIN="https://yourdomain.com"
```

## Audit Logging

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `AUDIT_LOG_ENABLED` | Boolean | `true` | Enable audit logging |
| `AUDIT_LOG_LEVEL` | Enum | `info` | Minimum log level |
| `AUDIT_LOG_RETENTION_DAYS` | Number | `90` | Log retention period |
| `SECURITY_EVENTS_WEBHOOK_URL` | URL | Optional | Security events webhook |

### Log Levels

- `debug` - All events (verbose)
- `info` - Informational events
- `warn` - Warning events
- `error` - Error events only

## Application Settings

### Core Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | Enum | `development` | Application environment |
| `PORT` | Number | `3000` | Application port |
| `HOST` | String | `localhost` | Application host |

### Next.js Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXTAUTH_URL` | URL | Optional | NextAuth.js base URL |
| `NEXTAUTH_SECRET` | String | Optional | NextAuth.js secret |

### File Upload

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAX_FILE_SIZE` | Number | `10485760` | Maximum file size (bytes) |
| `ALLOWED_FILE_TYPES` | String | See below | Allowed MIME types |
| `UPLOAD_PATH` | String | `./uploads` | Upload directory path |

#### Default Allowed File Types
```
image/jpeg,image/png,image/gif,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Logging

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `LOG_LEVEL` | Enum | `info` | Application log level |
| `ENABLE_METRICS` | Boolean | `false` | Enable metrics collection |
| `METRICS_PORT` | Number | Optional | Metrics server port |

## Optional Features

### External API Keys

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ANTHROPIC_API_KEY` | String | Optional | Claude AI API key |
| `OPENAI_API_KEY` | String | Optional | OpenAI API key |
| `GOOGLE_API_KEY` | String | Optional | Google APIs key |

### Email Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EMAIL_SERVICE` | Enum | `disabled` | Email service provider |
| `EMAIL_HOST` | String | Optional | SMTP host |
| `EMAIL_PORT` | Number | Optional | SMTP port |
| `EMAIL_USER` | String | Optional | SMTP username |
| `EMAIL_PASSWORD` | String | Optional | SMTP password |
| `EMAIL_FROM` | String | Optional | From email address |

### Redis Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | URL | Optional | Redis connection URL |
| `REDIS_PASSWORD` | String | Optional | Redis password |
| `REDIS_DB` | Number | `0` | Redis database number |

### Feature Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `FEATURE_ADVANCED_ANALYTICS` | Boolean | `false` | Enable advanced analytics |
| `FEATURE_MULTI_CURRENCY` | Boolean | `true` | Enable multi-currency support |
| `FEATURE_VENDOR_PORTAL` | Boolean | `true` | Enable vendor portal |
| `FEATURE_MOBILE_APP` | Boolean | `false` | Enable mobile app features |

## Environment Examples

### Development Environment (.env.local)

```bash
# Development configuration
NODE_ENV="development"
PORT="3000"

# Database
DATABASE_URL="postgresql://carmen_user:carmen_pass@localhost:5432/carmen_erp_dev"

# Security (use development keys)
JWT_SECRET="dev-jwt-secret-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="dev-refresh-secret-key-different-from-jwt"
SESSION_SECRET="dev-session-secret-key-at-least-32-characters"
ENCRYPTION_KEY="dev-encryption-key-exactly-32-char"

# CORS (allow all for development)
CORS_ORIGIN="*"

# Logging (verbose for development)
LOG_LEVEL="debug"
AUDIT_LOG_LEVEL="debug"

# Disable production features
SESSION_SECURE="false"
CSP_ENABLED="false"
```

### Production Environment (.env.production)

```bash
# Production configuration
NODE_ENV="production"
PORT="3000"
HOST="0.0.0.0"

# Database (with SSL)
DATABASE_URL="postgresql://user:pass@prod-db:5432/carmen_erp?sslmode=require"
DB_CONNECTION_LIMIT="20"

# Security (strong keys)
JWT_SECRET="prod-strong-jwt-secret-256-bit-key-generated-with-openssl"
JWT_REFRESH_SECRET="prod-strong-refresh-secret-different-from-jwt-key"
SESSION_SECRET="prod-strong-session-secret-key-also-256-bit-strong"
ENCRYPTION_KEY="prod-32-char-encryption-key-here"

# Security settings (strict for production)
SESSION_SECURE="true"
SESSION_SAME_SITE="strict"
CSP_ENABLED="true"
SECURITY_HEADERS_ENABLED="true"

# CORS (restrict to production domains)
CORS_ORIGIN="https://carmen-erp.yourdomain.com"
CORS_CREDENTIALS="true"

# Rate limiting (stricter)
API_RATE_LIMIT_MAX_REQUESTS="500"
FAILED_LOGIN_THRESHOLD="3"

# Monitoring
DB_ALERT_WEBHOOK_URL="https://monitoring.yourdomain.com/db-alerts"
SECURITY_EVENTS_WEBHOOK_URL="https://monitoring.yourdomain.com/security"
CSP_REPORT_URI="https://monitoring.yourdomain.com/csp-reports"

# Logging (less verbose)
LOG_LEVEL="info"
AUDIT_LOG_LEVEL="info"
AUDIT_LOG_RETENTION_DAYS="365"

# Features
FEATURE_ADVANCED_ANALYTICS="true"
FEATURE_VENDOR_PORTAL="true"
```

### Testing Environment (.env.test)

```bash
# Test configuration
NODE_ENV="test"

# Test database
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/carmen_erp_test"

# Test security keys
JWT_SECRET="test-jwt-secret-key-for-testing-only"
JWT_REFRESH_SECRET="test-refresh-secret-for-testing-only"
SESSION_SECRET="test-session-secret-for-testing-only"
ENCRYPTION_KEY="test-encryption-key-32-characters"

# Disable external services
EMAIL_SERVICE="disabled"
SECURITY_EVENTS_WEBHOOK_URL=""

# Fast settings for tests
API_RATE_LIMIT_MAX_REQUESTS="10000"
DB_CONNECTION_LIMIT="5"

# Minimal logging
LOG_LEVEL="error"
AUDIT_LOG_ENABLED="false"
```

## Validation Commands

### Environment Validation Script

Create a validation script to check your environment:

```bash
#!/bin/bash

# Check required variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "JWT_REFRESH_SECRET"
  "SESSION_SECRET"
  "ENCRYPTION_KEY"
)

echo "🔍 Validating environment variables..."

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ $var is not set"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

# Check JWT secret length
if [[ ${#JWT_SECRET} -lt 32 ]]; then
  echo "⚠️  JWT_SECRET should be at least 32 characters"
fi

# Check encryption key length
if [[ ${#ENCRYPTION_KEY} -ne 32 ]]; then
  echo "❌ ENCRYPTION_KEY must be exactly 32 characters"
  exit 1
fi

echo "✅ Environment validation complete!"
```

### Node.js Validation

Use the built-in validation:

```bash
npm run validate-env
```

This runs the environment validation from `lib/config/environment.ts` and reports:
- Missing required variables
- Invalid formats
- Security warnings
- Production-specific issues

## Security Best Practices

### Key Generation
1. Use cryptographically secure random generators
2. Never reuse keys across environments
3. Store keys securely (use secret management systems)
4. Rotate keys regularly in production

### Environment Security
1. Never commit environment files to version control
2. Use different keys for each environment
3. Restrict access to production environment variables
4. Use secret management services in production

### Monitoring
1. Monitor for environment variable changes
2. Log configuration validation results
3. Alert on security configuration issues
4. Regular security configuration audits

This completes the comprehensive Environment Variables Reference for the Carmen ERP system.