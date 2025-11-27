# API Security Reference

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Complete reference for implementing and using the Carmen ERP API security features.

## Table of Contents

1. [Security Middleware](#security-middleware)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Input Validation](#input-validation)
5. [Rate Limiting](#rate-limiting)
6. [Security Headers](#security-headers)
7. [Audit Logging](#audit-logging)
8. [API Examples](#api-examples)

## Security Middleware

### Overview

The Carmen ERP API security system consists of layered middleware components:

```
Request → Rate Limiting → Security Headers → Input Validation → Authentication → Authorization → Handler
```

### Middleware Chain

```typescript
import { withAuth } from '@/lib/middleware/auth'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity } from '@/lib/middleware/security'
import { withRateLimit } from '@/lib/security/rate-limiter'

// Complete security chain
export const GET = withSecurity(
  withAuth(
    withAuthorization('resource', 'action', handler)
  ),
  securityConfig
)
```

## Authentication

### JWT Token System

The system uses JWT tokens with refresh token support:

#### Token Generation

```typescript
import { authMiddleware } from '@/lib/middleware/auth'

const tokens = await authMiddleware.generateTokens(user, {
  includeRefreshToken: true,
  customExpiry: '2h',
  additionalClaims: { department: user.department }
})
```

#### Token Validation

```typescript
const result = await authMiddleware.validateToken(token)
if (result.success) {
  console.log('User:', result.user)
} else {
  console.error('Auth error:', result.error)
}
```

#### Authentication Middleware Usage

```typescript
import { withAuth, requireAuth, getAuthenticatedUser } from '@/lib/middleware/auth'

// Protect entire route
export const POST = withAuth(async (request, { user }) => {
  // Handler has authenticated user
})

// Manual authentication check
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    // Continue with authenticated user
  } catch (error) {
    // Handle authentication error
  }
}

// Optional authentication
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (user) {
    // User is authenticated
  } else {
    // Anonymous access
  }
}
```

### Authentication Headers

Include JWT token in requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or direct token (less secure):

```http
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Authorization

### Role-Based Access Control

#### Permission Structure

Permissions follow the format: `action:resource`

```typescript
// Examples
'read:vendors'          // Read vendor data
'create:purchase_orders' // Create purchase orders  
'approve:invoices'      // Approve invoices
'manage_users:users'    // Manage users
'*:*'                   // Super admin access
```

#### Authorization Middleware

```typescript
import { withAuthorization, checkPermission } from '@/lib/middleware/rbac'

// Protect route with specific permission
export const GET = withAuth(
  withAuthorization('vendors', 'read', handler)
)

// Check permission manually
export const POST = withAuth(async (request, { user }) => {
  const canApprove = await checkPermission(user, 'approve', 'purchase_orders')
  if (!canApprove) {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Continue with authorized action
})
```

#### Role Hierarchy

```typescript
export const ROLE_HIERARCHY: Record<Role, number> = {
  'super-admin': 100,      // Full access
  'admin': 90,             // Administrative access
  'financial-manager': 80, // Financial operations
  'department-manager': 70, // Department operations
  'purchasing-staff': 60,  // Procurement operations
  'chef': 50,              // Kitchen operations
  'counter': 40,           // Sales operations
  'staff': 30              // Basic access
}
```

#### Default Role Permissions

```typescript
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
  'purchasing-staff': [
    'create_purchase_requests:purchase_requests',
    'read:vendors',
    'manage_vendors:vendors',
    'receive_goods:goods_receipts'
  ],
  'chef': [
    'create:recipes',
    'read:inventory_items',
    'adjust_inventory:inventory_items'
  ]
  // ... other roles
}
```

## Input Validation

### Security-Enhanced Validation

All inputs are validated with security threat detection:

```typescript
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'

// Basic validation with security checks
const result = await validateInput(userInput, schema, {
  maxLength: 1000,
  trimWhitespace: true,
  removeSuspiciousPatterns: true,
  allowHtml: false
})

if (!result.success) {
  console.log('Validation errors:', result.errors)
  console.log('Security threats:', result.threats)
  console.log('Risk level:', result.riskLevel)
}
```

### Secure Schema Definitions

Use pre-built secure schemas:

```typescript
import { SecureSchemas } from '@/lib/security/input-validator'

const userSchema = z.object({
  name: SecureSchemas.safeString(255),
  email: z.string().email(),
  phone: SecureSchemas.phoneNumber.optional(),
  website: z.string().url().optional(),
  notes: SecureSchemas.safeString(1000).optional()
})
```

### Custom Validation

Create custom secure validation:

```typescript
const customSchema = z.object({
  username: SecureSchemas.username,
  password: SecureSchemas.strongPassword,
  apiKey: SecureSchemas.uuid
})
```

### Threat Detection

The validator detects common attack patterns:

- **XSS**: Script injection, JavaScript protocols
- **SQL Injection**: SQL keywords and patterns
- **Command Injection**: System commands
- **Path Traversal**: Directory traversal attempts
- **LDAP Injection**: LDAP special characters
- **Email Injection**: Header injection patterns

## Rate Limiting

### Preset Configurations

```typescript
import { RateLimitPresets, withRateLimit } from '@/lib/security/rate-limiter'

// Authentication endpoints (strict)
export const POST = withRateLimit(RateLimitPresets.AUTH)(handler)

// API endpoints (moderate)
export const GET = withRateLimit(RateLimitPresets.API)(handler)

// Admin endpoints (very strict)
export const DELETE = withRateLimit(RateLimitPresets.ADMIN)(handler)
```

### Custom Rate Limiting

```typescript
export const POST = withRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,         // 100 requests per window
  skipSuccessfulRequests: true,
  keyGenerator: (request) => request.ip + ':' + request.url
})(handler)
```

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:15:00Z
Retry-After: 900
```

### Rate Limit Management

```typescript
import { rateLimit } from '@/lib/security/rate-limiter'

// Block IP manually
await rateLimit.blockIP('192.168.1.100', 3600000) // 1 hour

// Unblock IP
await rateLimit.unblockIP('192.168.1.100')

// Get statistics
const stats = await rateLimit.getStats()
```

## Security Headers

### Comprehensive Headers

The system applies comprehensive security headers:

```typescript
import { withSecurity, createSecureResponse } from '@/lib/middleware/security'

export const GET = withSecurity(handler, {
  headersConfig: {
    enableHSTS: true,
    enableCSP: true,
    enableXSS: true,
    customHeaders: {
      'X-API-Version': '1.0'
    }
  }
})
```

### Content Security Policy

Default CSP configuration:

```csp
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://api.anthropic.com;
object-src 'none';
frame-src 'none'
```

### CORS Configuration

```typescript
export const GET = withSecurity(handler, {
  corsConfig: {
    origin: ['https://app.carmen-erp.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})
```

## Audit Logging

### Security Event Logging

```typescript
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'

await createSecurityAuditLog({
  eventType: SecurityEventType.DATA_MODIFICATION,
  userId: user.id,
  ipAddress: request.ip,
  userAgent: request.headers.get('user-agent'),
  details: {
    resource: 'vendors',
    action: 'create',
    vendorId: result.id
  }
})
```

### Event Types

```typescript
enum SecurityEventType {
  // Authentication
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  TOKEN_REVOKED = 'token_revoked',
  
  // Authorization  
  AUTHORIZATION_GRANTED = 'authorization_granted',
  AUTHORIZATION_DENIED = 'authorization_denied',
  
  // Security Violations
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_REQUEST = 'malicious_request',
  
  // Data Operations
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_EXPORT = 'data_export'
}
```

### Audit Queries

```typescript
import { securityAuditLogger } from '@/lib/security/audit-logger'

// Get recent events
const events = await securityAuditLogger.getAuditLogs({
  eventType: SecurityEventType.AUTH_FAILED,
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  limit: 50
})

// Get user activity
const userActivity = await securityAuditLogger.getAuditLogs({
  userId: 'user-123',
  limit: 100
})
```

## API Examples

### Complete Secure API Route

```typescript
// /app/api/vendors/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withAuth, type AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Validation schema
const createVendorSchema = z.object({
  name: SecureSchemas.safeString(255),
  email: z.string().email(),
  phone: SecureSchemas.phoneNumber.optional(),
  website: z.string().url().optional()
})

// Secure API handler
const createVendor = withSecurity(
  withAuth(
    withAuthorization('vendors', 'create', 
      async (request: NextRequest, { user }: { user: AuthenticatedUser }) => {
        try {
          const body = await request.json()

          // Validate with security checks
          const validation = await validateInput(body, createVendorSchema, {
            maxLength: 10000,
            trimWhitespace: true,
            removeSuspiciousPatterns: true,
            allowHtml: false
          })

          if (!validation.success) {
            await auditSecurityEvent(
              SecurityEventType.MALICIOUS_REQUEST,
              request,
              user.id,
              {
                threats: validation.threats,
                riskLevel: validation.riskLevel
              }
            )

            return createSecureResponse(
              {
                success: false,
                error: 'Invalid input data',
                details: validation.errors
              },
              400
            )
          }

          // Log data modification
          await auditSecurityEvent(
            SecurityEventType.DATA_MODIFICATION,
            request,
            user.id,
            {
              resource: 'vendors',
              action: 'create',
              vendorName: validation.data.name
            }
          )

          // Process with sanitized data
          const result = await vendorService.create(validation.sanitized)

          if (!result.success) {
            return createSecureResponse(
              { success: false, error: 'Creation failed' },
              500
            )
          }

          return createSecureResponse(
            {
              success: true,
              data: result.data,
              message: 'Vendor created successfully'
            },
            201
          )

        } catch (error) {
          await auditSecurityEvent(
            SecurityEventType.SYSTEM_ERROR,
            request,
            user.id,
            { error: error.message }
          )

          return createSecureResponse(
            { success: false, error: 'Internal server error' },
            500
          )
        }
      }
    )
  ),
  {
    validationConfig: {
      maxBodySize: 50 * 1024, // 50KB
      allowedContentTypes: ['application/json'],
      requireContentType: true,
      validateOrigin: true
    },
    corsConfig: {
      methods: ['POST']
    }
  }
)

// Apply rate limiting
export const POST = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
  skipSuccessfulRequests: false
})(createVendor)
```

### Authentication API

```typescript
// /app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { withSecurity, createSecureResponse } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { authMiddleware } from '@/lib/middleware/auth'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const loginHandler = withSecurity(
  async (request: NextRequest) => {
    const body = await request.json()
    
    const validation = await validateInput(body, loginSchema)
    if (!validation.success) {
      return createSecureResponse(
        { success: false, error: 'Invalid credentials format' },
        400
      )
    }

    // Authenticate user
    const user = await authenticateUser(validation.data.email, validation.data.password)
    if (!user) {
      return createSecureResponse(
        { success: false, error: 'Invalid credentials' },
        401
      )
    }

    // Generate tokens
    const tokens = await authMiddleware.generateTokens(user)

    return createSecureResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      tokens
    })
  },
  {
    corsConfig: {
      methods: ['POST'],
      credentials: true
    }
  }
)

export const POST = withRateLimit(RateLimitPresets.AUTH)(loginHandler)
```

### Public API with Optional Authentication

```typescript
// /app/api/public/vendors/route.ts
export const GET = withSecurity(
  async (request: NextRequest) => {
    // Get user if authenticated (optional)
    const user = await getAuthenticatedUser(request)
    
    let vendors
    if (user) {
      // Full vendor data for authenticated users
      vendors = await vendorService.getFullVendors()
    } else {
      // Limited public data
      vendors = await vendorService.getPublicVendors()
    }

    return createSecureResponse({
      success: true,
      data: vendors
    })
  },
  {
    corsConfig: {
      methods: ['GET'],
      origin: '*' // Allow public access
    }
  }
)
```

### File Upload API

```typescript
// /app/api/upload/route.ts
export const POST = withSecurity(
  withAuth(
    withAuthorization('files', 'create',
      async (request: NextRequest, { user }) => {
        const formData = await request.formData()
        const file = formData.get('file') as File
        
        if (!file) {
          return createSecureResponse(
            { success: false, error: 'No file provided' },
            400
          )
        }

        // Validate file
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          return createSecureResponse(
            { success: false, error: 'File too large' },
            413
          )
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
          return createSecureResponse(
            { success: false, error: 'File type not allowed' },
            400
          )
        }

        // Log file upload
        await auditSecurityEvent(
          SecurityEventType.DATA_MODIFICATION,
          request,
          user.id,
          {
            resource: 'files',
            action: 'upload',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        )

        // Process file upload
        const result = await uploadService.upload(file, user.id)

        return createSecureResponse({
          success: true,
          data: result
        })
      }
    )
  ),
  {
    validationConfig: {
      maxBodySize: 10 * 1024 * 1024, // 10MB
      allowedContentTypes: ['multipart/form-data']
    }
  }
)
```

## Security Testing

### Testing Authentication

```typescript
// Test authentication middleware
describe('Authentication', () => {
  test('should authenticate valid token', async () => {
    const token = await authMiddleware.generateTokens(testUser)
    const result = await authMiddleware.validateToken(token.accessToken)
    
    expect(result.success).toBe(true)
    expect(result.user?.id).toBe(testUser.id)
  })

  test('should reject invalid token', async () => {
    const result = await authMiddleware.validateToken('invalid-token')
    expect(result.success).toBe(false)
  })
})
```

### Testing Authorization

```typescript
// Test RBAC system
describe('Authorization', () => {
  test('should allow authorized action', async () => {
    const result = await rbacAuth.authorize({
      user: purchasingStaffUser,
      resource: 'vendors',
      action: 'create'
    })
    
    expect(result.allowed).toBe(true)
  })

  test('should deny unauthorized action', async () => {
    const result = await rbacAuth.authorize({
      user: staffUser,
      resource: 'vendors',
      action: 'delete'
    })
    
    expect(result.allowed).toBe(false)
  })
})
```

## Error Handling

### Security Error Responses

Standard error response format:

```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED",
  "details": {
    "message": "No valid authentication token provided",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication token missing
- `AUTH_INVALID`: Authentication token invalid
- `AUTH_EXPIRED`: Authentication token expired
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_FAILED`: Input validation failed
- `SECURITY_VIOLATION`: Security threat detected

This completes the comprehensive API Security Reference for the Carmen ERP system.