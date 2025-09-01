# Carmen ERP Security Setup Guide

This guide provides comprehensive instructions for setting up and configuring the security features in Carmen ERP, including environment variables, authentication, authorization, and security monitoring.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Authentication Setup](#authentication-setup)
3. [Authorization Configuration](#authorization-configuration)
4. [Security Monitoring](#security-monitoring)
5. [API Security](#api-security)
6. [Production Deployment](#production-deployment)
7. [Security Auditing](#security-auditing)
8. [Troubleshooting](#troubleshooting)

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in your project root with the following configuration:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/carmen_erp"

# JWT Configuration (REQUIRED)
JWT_SECRET="your-256-bit-secret-key-here"  # Generate with: openssl rand -base64 32
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"  # Different from JWT_SECRET
JWT_REFRESH_EXPIRES_IN="7d"

# Session Security (REQUIRED)
SESSION_SECRET="your-session-secret-key-here"  # Generate with: openssl rand -base64 32
SESSION_SECURE="true"
SESSION_HTTP_ONLY="true"
SESSION_SAME_SITE="strict"

# Encryption (REQUIRED)
ENCRYPTION_KEY="your-32-character-encryption-key"  # Exactly 32 characters
ENCRYPTION_ALGORITHM="aes-256-gcm"

# API Security
API_RATE_LIMIT_WINDOW="900"  # 15 minutes in seconds
API_RATE_LIMIT_MAX_REQUESTS="1000"
API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS="false"

# Security Headers
SECURITY_HEADERS_ENABLED="true"
CORS_ORIGIN="https://yourdomain.com"  # Set to your domain in production
CORS_CREDENTIALS="true"

# Content Security Policy
CSP_ENABLED="true"
CSP_REPORT_URI="https://your-logging-service.com/csp-reports"  # Optional

# Audit Logging
AUDIT_LOG_ENABLED="true"
AUDIT_LOG_LEVEL="info"
AUDIT_LOG_RETENTION_DAYS="90"

# Security Monitoring
SECURITY_EVENTS_WEBHOOK_URL="https://your-monitoring-service.com/webhooks"  # Optional
FAILED_LOGIN_THRESHOLD="5"
ACCOUNT_LOCKOUT_DURATION="1800"  # 30 minutes in seconds

# Database Security
DB_CONNECTION_LIMIT="10"
DB_POOL_TIMEOUT="10"
DB_CIRCUIT_BREAKER="true"
DB_MONITORING="true"
DB_TIMEOUTS="true"
```

### Generating Secure Keys

Use these commands to generate secure keys:

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 64

# Generate encryption key (exactly 32 characters)
openssl rand -hex 16
```

## Authentication Setup

### JWT Token Configuration

The system uses JWT tokens for authentication with the following features:

- **Access Tokens**: Short-lived (24 hours by default)
- **Refresh Tokens**: Long-lived (7 days by default)
- **Token Revocation**: Support for blacklisting tokens
- **Session Management**: Secure session handling

### Authentication Flow

1. User provides credentials
2. System validates credentials
3. Generate JWT access token and refresh token
4. Client stores tokens securely
5. Include access token in Authorization header for API requests
6. Use refresh token to get new access tokens

### Example Authentication Usage

```typescript
import { authMiddleware } from '@/lib/middleware/auth'

// Generate tokens
const tokens = await authMiddleware.generateTokens(user)

// Validate token
const result = await authMiddleware.validateToken(accessToken)
```

## Authorization Configuration

### Role-Based Access Control (RBAC)

The system implements comprehensive RBAC with the following roles:

#### Role Hierarchy

1. **super-admin** (Level 100)
   - Full system access
   - User management
   - System configuration

2. **admin** (Level 90)
   - Business operations
   - User management (limited)
   - System monitoring

3. **financial-manager** (Level 80)
   - Financial operations
   - Budget approvals
   - Financial reporting

4. **department-manager** (Level 70)
   - Department operations
   - Team management
   - Departmental reporting

5. **purchasing-staff** (Level 60)
   - Procurement operations
   - Vendor management
   - Purchase orders

6. **chef** (Level 50)
   - Kitchen operations
   - Recipe management
   - Inventory (kitchen)

7. **counter** (Level 40)
   - Sales operations
   - Customer service
   - Basic inventory

8. **staff** (Level 30)
   - Basic operations
   - Limited access

### Permission System

Permissions are structured as `action:resource`:

#### Common Actions
- `create`, `read`, `update`, `delete`
- `approve`, `reject`, `submit`, `cancel`
- `manage_users`, `manage_vendors`, `generate_reports`

#### Resources
- `users`, `vendors`, `products`, `purchase_requests`
- `purchase_orders`, `inventory_items`, `reports`

### Example Authorization Usage

```typescript
import { checkPermission, requirePermission } from '@/lib/middleware/rbac'

// Check permission
const canCreate = await checkPermission(user, 'create', 'vendors')

// Require permission (throws error if not authorized)
await requirePermission(user, 'approve', 'purchase_orders')
```

## Security Monitoring

### Audit Logging

The system logs all security events:

#### Event Types
- Authentication events (success/failure)
- Authorization events (granted/denied)
- Data access and modifications
- Security violations
- System errors

#### Configuration

```typescript
import { createSecurityAuditLog } from '@/lib/security/audit-logger'

await createSecurityAuditLog({
  eventType: SecurityEventType.AUTH_SUCCESS,
  userId: user.id,
  ipAddress: request.ip,
  details: { role: user.role }
})
```

### Webhook Notifications

Configure webhook notifications for high-severity events:

```bash
SECURITY_EVENTS_WEBHOOK_URL="https://your-slack-webhook-url"
```

Webhook payload structure:
```json
{
  "eventType": "auth_failed",
  "severity": "high",
  "timestamp": "2024-01-01T00:00:00Z",
  "message": "Multiple failed login attempts",
  "details": {
    "userId": "user-id",
    "ipAddress": "192.168.1.1",
    "attemptCount": 5
  },
  "environment": "production",
  "service": "carmen-erp"
}
```

## API Security

### Rate Limiting

The system implements adaptive rate limiting:

#### Preset Configurations

```typescript
export const RateLimitPresets = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },
  API: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000
  },
  ADMIN: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100
  }
}
```

#### Usage in API Routes

```typescript
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'

export const GET = withRateLimit(RateLimitPresets.API)(handler)
```

### Input Validation

All inputs are validated and sanitized:

```typescript
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'

const result = await validateInput(userInput, SecureSchemas.safeString(255), {
  maxLength: 1000,
  trimWhitespace: true,
  removeSuspiciousPatterns: true
})
```

### Security Headers

Comprehensive security headers are applied:

- **HSTS**: Strict Transport Security
- **CSP**: Content Security Policy
- **XSS Protection**: Cross-site scripting protection
- **Frame Options**: Clickjacking protection
- **Content Type Options**: MIME type sniffing protection

## Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] JWT secrets generated and secured
- [ ] Database connection secured
- [ ] HTTPS configured
- [ ] Security headers enabled
- [ ] Audit logging configured
- [ ] Monitoring webhooks set up
- [ ] Rate limiting configured
- [ ] CORS origins restricted

### Security Configuration Validation

Run the environment validation:

```bash
npm run validate-env
```

This will check:
- All required environment variables
- Secret key lengths and formats
- Security configuration completeness
- Production-specific requirements

### Database Security

1. **Connection Security**
   - Use SSL/TLS connections
   - Implement connection pooling
   - Enable query monitoring

2. **Data Encryption**
   - Encrypt sensitive fields
   - Use parameterized queries
   - Implement field-level encryption

### Monitoring Setup

1. **Application Monitoring**
   - Set up application performance monitoring
   - Configure error tracking
   - Implement health checks

2. **Security Monitoring**
   - Configure security event alerts
   - Set up suspicious activity detection
   - Implement automated threat response

## Security Auditing

### Regular Security Tasks

#### Daily
- Review security event logs
- Monitor rate limiting statistics
- Check for suspicious activities

#### Weekly
- Review user access patterns
- Audit permission changes
- Check system health metrics

#### Monthly
- Security configuration review
- Dependency security scan
- Access control audit

### Security Metrics

Monitor these key metrics:

- Authentication failure rates
- Authorization denial rates
- Rate limiting triggers
- Security event volumes
- System error rates

### Compliance Reporting

Generate compliance reports:

```bash
npm run security:audit-report
npm run security:compliance-check
npm run security:vulnerability-scan
```

## Troubleshooting

### Common Issues

#### Authentication Problems

**Symptom**: JWT tokens not working
```bash
# Check JWT secret configuration
echo $JWT_SECRET | wc -c  # Should be > 32 characters
```

**Solution**: Regenerate JWT secrets with proper length

#### Authorization Issues

**Symptom**: Permission denied errors
```typescript
// Debug user permissions
console.log('User permissions:', user.permissions)
console.log('Required permission:', `${action}:${resource}`)
```

#### Rate Limiting Issues

**Symptom**: Too many requests errors
```typescript
// Check rate limit status
const stats = await rateLimit.getStats()
console.log('Rate limit stats:', stats)
```

#### Security Header Problems

**Symptom**: CSP violations
```bash
# Check CSP configuration
curl -I https://your-domain.com/api/vendors
```

### Debug Commands

```bash
# Check environment configuration
npm run security:check-env

# Test authentication
npm run security:test-auth

# Validate permissions
npm run security:test-rbac

# Check security headers
npm run security:test-headers
```

### Log Analysis

Security logs are structured for easy analysis:

```bash
# Filter authentication events
grep "auth_" logs/security.log

# Check high-severity events
grep "severity.*high\|critical" logs/security.log

# Monitor specific user activity
grep "userId.*user-123" logs/security.log
```

## Best Practices

### Development
- Use environment-specific configurations
- Never commit secrets to version control
- Test security features in development
- Use security linting tools

### Production
- Implement defense in depth
- Monitor security metrics continuously
- Keep dependencies updated
- Regular security assessments

### Operations
- Backup security configurations
- Document security procedures
- Train team on security practices
- Incident response planning

## Support

For security-related questions or issues:

1. Check this documentation first
2. Review audit logs for clues
3. Test in development environment
4. Contact security team if needed

Remember: Security is everyone's responsibility!