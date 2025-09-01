# Keycloak Integration Guide

This guide covers the complete Keycloak integration for Carmen ERP, including setup, configuration, migration from JWT authentication, and production deployment.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Local Development Setup](#local-development-setup)
4. [Configuration](#configuration)
5. [Authentication Strategies](#authentication-strategies)
6. [API Route Protection](#api-route-protection)
7. [User Context Integration](#user-context-integration)
8. [Migration from JWT](#migration-from-jwt)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Security Best Practices](#security-best-practices)

## Overview

Carmen ERP now supports Keycloak integration for enterprise-grade authentication and authorization. This integration provides:

- **Single Sign-On (SSO)** across multiple applications
- **Role-Based Access Control (RBAC)** with Keycloak roles
- **Multi-Department Support** via Keycloak groups
- **Session Management** with automatic token refresh
- **Backward Compatibility** with existing JWT authentication
- **Audit Logging** for security compliance

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Carmen Web    │    │    Keycloak     │    │   Carmen API    │
│   Application   │◄──►│     Server      │◄──►│    Routes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  NextAuth.js    │    │   PostgreSQL    │    │  Auth Middleware│
│   Provider      │    │   Database      │    │   & RBAC        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Start Keycloak Services

```bash
# Start Keycloak, PostgreSQL, and supporting services
./scripts/setup-keycloak.sh start

# Check status
./scripts/setup-keycloak.sh status
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Keycloak Configuration
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=carmen
KEYCLOAK_CLIENT_ID=carmen-web
KEYCLOAK_CLIENT_SECRET=your-client-secret-here

# Authentication Strategy
AUTH_STRATEGY=auto  # or keycloak-only, jwt-only, hybrid
```

### 3. Update App Router Layout

Add the Keycloak provider to your app:

```typescript
// app/layout.tsx
import { SessionProvider } from 'next-auth/react'
import { KeycloakUserProvider } from '@/lib/context/keycloak-user-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <KeycloakUserProvider>
            {children}
          </KeycloakUserProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 4. Test Authentication

1. Navigate to `http://localhost:3000`
2. Click sign-in (redirects to Keycloak)
3. Use test credentials:
   - **Admin**: `admin / admin123`
   - **Chef**: `chef.maria / chef123`
   - **Finance**: `finance.manager / finance123`

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 20.14.0+
- PostgreSQL (for app database)

### Step-by-Step Setup

#### 1. Start Keycloak Services

```bash
# Start all services (Keycloak, PostgreSQL, Redis, MailHog)
./scripts/setup-keycloak.sh start

# Monitor logs
./scripts/setup-keycloak.sh logs
```

#### 2. Access Keycloak Admin Console

- URL: `http://localhost:8080/admin`
- Username: `admin`
- Password: `admin_password`

#### 3. Verify Realm Configuration

1. Navigate to the **Carmen** realm
2. Check **Clients** → **carmen-web**
3. Verify **Users** are imported
4. Review **Roles** and **Groups**

#### 4. Configure Carmen ERP

Update your `.env.local`:

```bash
# Copy from example
cp .env.example .env.local

# Add Keycloak configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=carmen
KEYCLOAK_CLIENT_ID=carmen-web
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-keycloak

AUTH_STRATEGY=auto
```

#### 5. Start Carmen Application

```bash
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks | `http://localhost:3000` | ✅ |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret | - | ✅ |
| `KEYCLOAK_BASE_URL` | Keycloak server URL | `http://localhost:8080` | ✅ |
| `KEYCLOAK_REALM` | Keycloak realm name | `carmen` | ✅ |
| `KEYCLOAK_CLIENT_ID` | Client ID in Keycloak | `carmen-web` | ✅ |
| `KEYCLOAK_CLIENT_SECRET` | Client secret from Keycloak | - | ✅ |
| `AUTH_STRATEGY` | Authentication strategy | `auto` | ❌ |
| `AUTH_FALLBACK_JWT` | Enable JWT fallback | `true` | ❌ |

### Keycloak Realm Configuration

The Carmen realm includes:

#### Roles
- `carmen-admin` - System Administrator
- `carmen-super-admin` - Super Administrator  
- `carmen-financial-manager` - Financial Manager
- `carmen-department-manager` - Department Manager
- `carmen-purchasing-staff` - Purchasing Staff
- `carmen-chef` - Chef
- `carmen-counter` - Counter Staff
- `carmen-staff` - General Staff

#### Groups
- **Carmen Departments**
  - Kitchen
  - Procurement
  - Finance
  - Inventory
  - Operations
- **Carmen Locations**
  - Main Restaurant
  - Catering Kitchen
  - Central Warehouse

#### Client Settings
- **Standard Flow**: Enabled (Authorization Code Flow)
- **Direct Access**: Disabled (no password grants)
- **Service Accounts**: Disabled for web client
- **Valid Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `http://localhost:3000`

## Authentication Strategies

Carmen ERP supports multiple authentication strategies for gradual migration:

### 1. Auto Strategy (Recommended)
```typescript
// .env.local
AUTH_STRATEGY=auto
AUTH_FALLBACK_JWT=true
```

- Tries Keycloak authentication first
- Falls back to JWT if Keycloak session not found
- Ideal for migration period

### 2. Keycloak-Only Strategy
```typescript
// .env.local
AUTH_STRATEGY=keycloak-only
```

- Only accepts Keycloak sessions
- Recommended for new deployments
- Best security posture

### 3. Hybrid Strategy
```typescript
// .env.local
AUTH_STRATEGY=hybrid
```

- Supports both authentication methods
- Useful for systems integration
- Requires careful session management

### 4. JWT-Only Strategy (Legacy)
```typescript
// .env.local
AUTH_STRATEGY=jwt-only
```

- Legacy JWT authentication only
- Use for rollback scenarios
- Not recommended for new features

## API Route Protection

### Unified Authentication

```typescript
// app/api/protected/route.ts
import { withUnifiedAuth } from '@/lib/auth/api-protection'

export const GET = withUnifiedAuth(async (request, { user }) => {
  // user contains unified interface for both JWT and Keycloak
  return NextResponse.json({
    message: 'Protected data',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider, // 'jwt' or 'keycloak'
    }
  })
})
```

### Role-Based Protection

```typescript
// Admin-only endpoint
export const GET = withRoleAuth(['admin', 'super-admin'], async (request, { user }) => {
  // Only admin and super-admin can access
  return NextResponse.json({ adminData: true })
})

// Multiple roles
export const POST = withRoleAuth(
  ['financial-manager', 'department-manager'], 
  async (request, { user }) => {
    // Financial and department managers can access
    return NextResponse.json({ managerData: true })
  }
)
```

### Permission-Based Protection

```typescript
// Permission-based access
export const PUT = withPermissionAuth(
  ['procurement.*', 'inventory.update'], 
  async (request, { user }) => {
    // Users with procurement.* or inventory.update permissions
    return NextResponse.json({ procurementData: true })
  }
)
```

### Pre-configured Strategies

```typescript
import { authStrategies } from '@/lib/auth/api-protection'

// Use pre-configured strategies
export const GET = authStrategies.adminOnly(async (request, { user }) => {
  // Admin-only access
})

export const POST = authStrategies.procurementAccess(async (request, { user }) => {
  // Procurement staff access
})

export const PUT = authStrategies.keycloakOnly(async (request, { user }) => {
  // Keycloak authentication only
})
```

## User Context Integration

### Using Keycloak User Context

```typescript
// components/MyComponent.tsx
import { useKeycloakUser } from '@/lib/context/keycloak-user-context'

export function MyComponent() {
  const { user, signIn, signOut, isLoading } = useKeycloakUser()

  if (isLoading) return <div>Loading...</div>

  if (!user) {
    return <button onClick={signIn}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <p>Department: {user.department}</p>
      <p>Keycloak Roles: {user.keycloakRoles?.join(', ')}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Backward Compatibility

```typescript
// Existing components continue to work
import { useUser } from '@/lib/context/keycloak-user-context'

export function ExistingComponent() {
  const { user, updateUserContext } = useUser()
  
  // Same interface as before, now powered by Keycloak
  return <div>{user?.name}</div>
}
```

## Migration from JWT

### Phase 1: Parallel Authentication (Recommended)

1. **Deploy with Auto Strategy**:
```bash
AUTH_STRATEGY=auto
AUTH_FALLBACK_JWT=true
```

2. **Users can authenticate with either method**
3. **Gradually migrate users to Keycloak**
4. **Monitor authentication metrics**

### Phase 2: Keycloak Primary

1. **Update to Hybrid Strategy**:
```bash
AUTH_STRATEGY=hybrid
AUTH_FALLBACK_JWT=true
```

2. **New users must use Keycloak**
3. **Existing JWT sessions remain valid**
4. **Implement user migration flows**

### Phase 3: Keycloak Only

1. **Switch to Keycloak-Only**:
```bash
AUTH_STRATEGY=keycloak-only
AUTH_FALLBACK_JWT=false
```

2. **Force all users to Keycloak**
3. **Remove JWT authentication code**

### Migration Script Example

```typescript
// scripts/migrate-users.ts
import { getUsersFromJWT } from './legacy-auth'
import { createKeycloakUser } from './keycloak-admin'

async function migrateUsers() {
  const jwtUsers = await getUsersFromJWT()
  
  for (const user of jwtUsers) {
    try {
      await createKeycloakUser({
        username: user.email,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [mapRoleToKeycloak(user.role)],
        groups: [mapDepartmentToGroup(user.department)]
      })
      console.log(`Migrated user: ${user.email}`)
    } catch (error) {
      console.error(`Failed to migrate ${user.email}:`, error)
    }
  }
}
```

## Production Deployment

### 1. Keycloak Production Setup

#### Option A: Managed Keycloak (Recommended)
- Use Red Hat SSO, AWS SSO, or other managed services
- Handles scaling, backups, and updates
- Better security and compliance

#### Option B: Self-Hosted Keycloak
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: ${KC_DB_USERNAME}
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HOSTNAME: ${KC_HOSTNAME}
      KC_HOSTNAME_STRICT: true
      KC_HOSTNAME_STRICT_HTTPS: true
      KC_HTTP_ENABLED: false
      KC_HTTPS_CERTIFICATE_FILE: /opt/keycloak/conf/tls.crt
      KC_HTTPS_CERTIFICATE_KEY_FILE: /opt/keycloak/conf/tls.key
    command: start
    volumes:
      - ./certs:/opt/keycloak/conf
    ports:
      - "8443:8443"
```

### 2. Environment Configuration

```bash
# Production .env
NODE_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-nextauth-secret

# Keycloak Configuration
KEYCLOAK_BASE_URL=https://your-keycloak-domain.com
KEYCLOAK_REALM=carmen
KEYCLOAK_CLIENT_ID=carmen-web
KEYCLOAK_CLIENT_SECRET=your-production-client-secret

# Authentication Strategy
AUTH_STRATEGY=keycloak-only
AUTH_FALLBACK_JWT=false

# Security Settings
SESSION_SECURE=true
CSP_ENABLED=true
CORS_ORIGIN=https://your-domain.com

# Redis for Session Storage
REDIS_URL=redis://your-redis-cluster:6379
SESSION_STORE=redis
```

### 3. SSL/TLS Configuration

Ensure HTTPS is enabled for:
- Carmen ERP application
- Keycloak server
- All redirect URIs

### 4. Database Configuration

```bash
# Use SSL for database connections
DATABASE_URL="postgresql://username:password@host:5432/carmen_erp?sslmode=require"
```

### 5. Monitoring and Alerting

```bash
# Enable security monitoring
AUDIT_LOG_ENABLED=true
SECURITY_EVENTS_WEBHOOK_URL=https://your-monitoring-system.com/webhook

# Health checks
ENABLE_METRICS=true
METRICS_PORT=9090
```

## Troubleshooting

### Common Issues

#### 1. "Configuration Error" on Sign-In

**Symptoms**: Authentication fails with configuration error

**Causes**:
- Incorrect Keycloak URL or realm
- Wrong client ID or secret
- Network connectivity issues

**Solutions**:
```bash
# Check Keycloak connectivity
curl http://localhost:8080/realms/carmen/.well-known/openid_configuration

# Verify environment variables
echo $KEYCLOAK_BASE_URL
echo $KEYCLOAK_CLIENT_ID

# Check Docker services
./scripts/setup-keycloak.sh status
```

#### 2. "Access Denied" Error

**Symptoms**: User can authenticate but gets access denied

**Causes**:
- User not assigned to Carmen roles
- Incorrect role mapping
- Missing client scopes

**Solutions**:
1. Check user roles in Keycloak Admin Console
2. Verify role mappings in realm configuration
3. Ensure client has required scopes enabled

#### 3. Session Expiry Issues

**Symptoms**: Users logged out frequently

**Causes**:
- Short token expiration
- Session timeout configuration
- Token refresh failures

**Solutions**:
```typescript
// Adjust token lifespans in Keycloak realm settings
Access Token Lifespan: 15 minutes
SSO Session Idle: 30 minutes  
SSO Session Max: 12 hours
```

#### 4. Role Mapping Problems

**Symptoms**: Users have wrong permissions

**Causes**:
- Incorrect role mapping logic
- Missing Keycloak roles
- Group membership issues

**Solutions**:
1. Check role mapping in `next-auth.config.ts`
2. Verify user roles in Keycloak
3. Review group assignments

### Debug Mode

Enable debug logging:

```bash
# Development
DEBUG=true
LOG_LEVEL=debug

# NextAuth debug
NEXTAUTH_DEBUG=true
```

### Health Check Endpoints

```bash
# Check application health
curl http://localhost:3000/api/health

# Check Keycloak health
curl http://localhost:8080/health/ready

# Check authentication status
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/session
```

## Security Best Practices

### 1. Keycloak Security

#### Strong Password Policies
```json
{
  "passwordPolicy": "length(12) and digits(1) and lowerCase(1) and upperCase(1) and specialChars(1) and notUsername"
}
```

#### Brute Force Protection
- Enable in Keycloak realm settings
- Configure failure thresholds
- Set lockout durations

#### Client Security
- Use strong client secrets
- Rotate secrets regularly
- Limit redirect URIs
- Enable PKCE for additional security

### 2. Application Security

#### Session Management
```typescript
// Use secure session storage
SESSION_STORE=redis
SESSION_SECURE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
```

#### CORS Configuration
```typescript
// Restrict CORS origins
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
```

#### Content Security Policy
```typescript
// Enable CSP
CSP_ENABLED=true
CSP_REPORT_URI=https://your-domain.com/api/csp-report
```

### 3. Network Security

- Use HTTPS everywhere
- Implement proper firewall rules
- Use VPNs for internal services
- Regular security audits

### 4. Monitoring and Auditing

```typescript
// Enable comprehensive auditing
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=365

// Security event webhooks
SECURITY_EVENTS_WEBHOOK_URL=https://your-siem.com/webhook
```

### 5. Backup and Recovery

- Regular Keycloak database backups
- Test restore procedures
- Document recovery processes
- Monitor backup integrity

## Support

For additional support:

1. **Documentation**: Check Keycloak official documentation
2. **Issues**: Create GitHub issues for bugs
3. **Security**: Report security issues privately
4. **Community**: Join Carmen ERP community discussions

## Changelog

### Version 1.0.0
- Initial Keycloak integration
- NextAuth.js provider setup
- Role and group mapping
- Backward compatibility with JWT
- Docker Compose development environment
- Comprehensive documentation