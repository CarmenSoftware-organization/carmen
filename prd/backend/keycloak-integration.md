# Keycloak IAM Integration - Carmen System

## Document Information

| **Attribute**     | **Value**                           |
|-------------------|-------------------------------------|
| **Document Type** | Keycloak Integration Guide          |
| **Version**       | 1.0.0                              |
| **Date**          | January 2025                       |
| **Status**        | Production Ready                   |
| **Owner**         | Backend Team                       |

---

## Executive Summary

This document outlines the comprehensive Keycloak integration architecture for the Carmen Hospitality System, providing centralized identity and access management (IAM) across all microservices. Keycloak serves as the cornerstone of our security architecture, implementing Single Sign-On (SSO), multi-factor authentication (MFA), role-based access control (RBAC), and multi-tenant support.

---

## Keycloak Architecture Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Cluster                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Keycloak-1  │  │ Keycloak-2  │  │ Keycloak-3  │        │
│  │   Master    │  │   Standby   │  │   Standby   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │            PostgreSQL Cluster (Primary + 2 Replicas)   ││
│  └─────────────────────────────────────────────────────────┘│
│         │                 │                 │             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Redis Cluster (Session Store)           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Keycloak Server Configuration
- **Version**: Keycloak 23.0.x (LTS)
- **Runtime**: Quarkus-based distribution
- **Database**: PostgreSQL 15+ with connection pooling
- **Cache**: Infinispan with Redis backend
- **Load Balancer**: Traefik/Kong with sticky sessions
- **SSL/TLS**: Let's Encrypt with automatic renewal

#### 2. Realm Architecture
```yaml
master-realm:
  purpose: Administrative realm
  users: Keycloak administrators only
  roles: [admin, realm-management]
  
carmen-hospitality:
  purpose: Primary business realm
  clients: [web-app, mobile-app, api-gateway, microservices]
  roles: [hotel-admin, manager, staff, vendor, auditor]
  identity-providers: [ldap, google, microsoft]
```

---

## Realm Configuration

### Primary Realm: carmen-hospitality

#### Realm Settings
```json
{
  "realm": "carmen-hospitality",
  "displayName": "Carmen Hospitality System",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "registrationEmailAsUsername": true,
  "rememberMe": true,
  "verifyEmail": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  "defaultSignatureAlgorithm": "RS256",
  "revokeRefreshToken": true,
  "refreshTokenMaxReuse": 0,
  "accessTokenLifespan": 300,
  "accessTokenLifespanForImplicitFlow": 900,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "offlineSessionIdleTimeout": 2592000,
  "offlineSessionMaxLifespanEnabled": true,
  "offlineSessionMaxLifespan": 5184000
}
```

#### Security Policies
```yaml
password-policy: |
  - length(12)
  - upperCase(1)
  - lowerCase(1)
  - digits(2)
  - notUsername
  - notEmail
  - specialChars(1)
  - passwordHistory(5)
  - maxLength(128)

brute-force-detection:
  enabled: true
  max-login-failures: 5
  wait-increment-seconds: 60
  max-wait-seconds: 900
  failure-reset-time: 43200

otp-policy:
  type: totp
  algorithm: HmacSHA256
  digits: 6
  period: 30
  look-ahead-window: 1
```

---

## Client Configuration

### 1. Web Application Client

#### Client Settings
```json
{
  "clientId": "carmen-web-app",
  "name": "Carmen Web Application",
  "description": "Main web application for hospitality management",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "secret": "${KEYCLOAK_WEB_CLIENT_SECRET}",
  "redirectUris": [
    "https://app.carmen.io/*",
    "https://staging.carmen.io/*",
    "http://localhost:3000/*"
  ],
  "webOrigins": [
    "https://app.carmen.io",
    "https://staging.carmen.io",
    "http://localhost:3000"
  ],
  "protocol": "openid-connect",
  "access": {
    "view": true,
    "configure": true,
    "manage": true
  },
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false,
  "publicClient": false,
  "frontchannelLogout": true,
  "fullScopeAllowed": false,
  "defaultClientScopes": [
    "web-origins",
    "role_list",
    "roles",
    "profile",
    "email"
  ],
  "optionalClientScopes": [
    "address",
    "phone",
    "offline_access",
    "microprofile-jwt"
  ]
}
```

#### Client Scopes
```yaml
carmen-app-scope:
  name: "Carmen Application Access"
  protocol: "openid-connect"
  attributes:
    include.in.token.scope: "true"
    display.on.consent.screen: "true"
  protocolMappers:
    - name: "hotel-properties"
      protocol: "openid-connect"
      protocolMapper: "oidc-usermodel-attribute-mapper"
      config:
        userinfo.token.claim: "true"
        user.attribute: "hotel_properties"
        id.token.claim: "true"
        access.token.claim: "true"
        claim.name: "hotel_properties"
        jsonType.label: "JSON"
```

### 2. API Gateway Client

#### Service Account Client
```json
{
  "clientId": "carmen-api-gateway",
  "name": "Carmen API Gateway",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "secret": "${KEYCLOAK_API_GATEWAY_SECRET}",
  "standardFlowEnabled": false,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": true,
  "publicClient": false,
  "protocol": "openid-connect",
  "defaultClientScopes": [
    "role_list",
    "roles"
  ],
  "serviceAccountRealmRoles": [
    "realm-management"
  ]
}
```

### 3. Microservice Clients

#### Generic Microservice Template
```json
{
  "clientId": "carmen-{service-name}",
  "name": "Carmen {Service Name} Service",
  "enabled": true,
  "clientAuthenticatorType": "client-jwt",
  "attributes": {
    "use.jwks.url": "true",
    "jwks.url": "https://api.carmen.io/{service-name}/.well-known/jwks.json",
    "jwt.credential.certificate": "${SERVICE_PUBLIC_KEY}"
  },
  "standardFlowEnabled": false,
  "serviceAccountsEnabled": true,
  "bearerOnly": true,
  "protocol": "openid-connect"
}
```

---

## Role and Permission Model

### Realm Roles

#### Core Roles
```yaml
# Administrative Roles
hotel-admin:
  description: "Full system administration access"
  composite: true
  composites:
    - system-admin
    - data-admin
    - user-admin
    - audit-viewer

# Management Roles  
general-manager:
  description: "Hotel general manager access"
  composite: true
  composites:
    - procurement-manager
    - inventory-manager
    - finance-manager
    - reports-viewer

department-manager:
  description: "Department-level management access"
  composite: true
  composites:
    - procurement-user
    - inventory-user
    - staff-coordinator

# Operational Roles
procurement-manager:
  description: "Full procurement module access"
  permissions:
    - purchase-request:create,read,update,approve
    - purchase-order:create,read,update,approve
    - vendor:read,update
    - budget:read,validate

procurement-user:
  description: "Standard procurement user access"
  permissions:
    - purchase-request:create,read,update
    - inventory:read
    - vendor:read

# Finance Roles
finance-manager:
  description: "Financial oversight and approval"
  permissions:
    - budget:create,read,update,delete
    - financial-reports:read,generate
    - approval:finance-review

# Vendor Roles
vendor-admin:
  description: "Vendor portal administrative access"
  permissions:
    - vendor-profile:read,update
    - pricelist:create,read,update,delete
    - campaign:read,participate

vendor-user:
  description: "Basic vendor portal access"
  permissions:
    - vendor-profile:read
    - pricelist:read,update
    - campaign:read,participate
```

#### Department-Specific Roles
```yaml
kitchen-manager:
  parent: department-manager
  department: kitchen
  additional-permissions:
    - recipe:create,read,update,delete
    - menu:create,read,update
    - production:manage

housekeeping-manager:
  parent: department-manager
  department: housekeeping
  additional-permissions:
    - cleaning-supplies:manage
    - maintenance:coordinate

front-office-manager:
  parent: department-manager
  department: front-office
  additional-permissions:
    - guest-supplies:manage
    - reservations:coordinate
```

### Client Roles

#### Web Application Roles
```yaml
web-app-roles:
  dashboard-access:
    description: "Access to main dashboard"
  
  module-procurement:
    description: "Procurement module access"
  
  module-inventory:
    description: "Inventory module access"
    
  module-vendor-management:
    description: "Vendor management module access"
    
  reports-basic:
    description: "Basic reporting access"
    
  reports-advanced:
    description: "Advanced reporting and analytics"
```

---

## User Management

### User Attributes

#### Standard Attributes
```yaml
required-attributes:
  - username (email format)
  - email
  - firstName
  - lastName
  - enabled

business-attributes:
  hotel-properties: 
    type: "JSON array"
    description: "List of hotel properties user has access to"
    example: ["property-001", "property-002"]
    
  department:
    type: "string"
    description: "Primary department assignment"
    values: ["kitchen", "housekeeping", "front-office", "maintenance", "administration"]
    
  employee-id:
    type: "string"
    description: "Internal employee identifier"
    
  cost-center:
    type: "string"
    description: "Financial cost center code"
    
  vendor-id:
    type: "string"
    description: "Vendor identifier for vendor portal users"
    
  approval-limit:
    type: "number"
    description: "Maximum approval amount in base currency"
    
  location-restrictions:
    type: "JSON array"
    description: "Restricted location access for vendors"
    
  session-timeout:
    type: "number"
    description: "Custom session timeout in seconds"
```

#### Dynamic Attributes via SPI
```java
@Provider
public class CarmenUserAttributeProvider implements UserStorageProvider {
    
    @Override
    public UserModel getUserByUsername(String username, RealmModel realm) {
        // Integrate with Carmen user database
        CarmenUser carmenUser = carmenUserService.findByUsername(username);
        if (carmenUser != null) {
            return new CarmenUserAdapter(session, realm, carmenUser);
        }
        return null;
    }
    
    @Override
    public UserModel getUserByEmail(String email, RealmModel realm) {
        CarmenUser carmenUser = carmenUserService.findByEmail(email);
        if (carmenUser != null) {
            return new CarmenUserAdapter(session, realm, carmenUser);
        }
        return null;
    }
}
```

### User Federation

#### LDAP Integration
```yaml
ldap-config:
  vendor: "Active Directory"
  connection-url: "ldaps://ad.company.com:636"
  bind-dn: "CN=keycloak-service,OU=Service Accounts,DC=company,DC=com"
  bind-credential: "${LDAP_BIND_PASSWORD}"
  users-dn: "OU=Users,DC=company,DC=com"
  username-ldap-attribute: "sAMAccountName"
  rdn-ldap-attribute: "sAMAccountName"
  uuid-ldap-attribute: "objectGUID"
  user-object-classes: "person, organizationalPerson, user"
  
  attribute-mappers:
    - name: "username"
      ldap-attribute: "sAMAccountName"
      user-model-attribute: "username"
    - name: "email"
      ldap-attribute: "mail"
      user-model-attribute: "email"
    - name: "first-name"
      ldap-attribute: "givenName"
      user-model-attribute: "firstName"
    - name: "last-name"
      ldap-attribute: "sn"
      user-model-attribute: "lastName"
    - name: "department"
      ldap-attribute: "department"
      user-model-attribute: "department"
```

---

## Multi-Factor Authentication

### TOTP Configuration
```yaml
otp-policy:
  type: "totp"
  algorithm: "HmacSHA256"
  digits: 6
  period: 30
  initial-counter: 0
  look-ahead-window: 1
  
required-actions:
  - CONFIGURE_TOTP
  
conditional-otp:
  enabled: true
  conditions:
    - role: ["hotel-admin", "finance-manager"]
      force: true
    - ip-range-exclusion: ["192.168.1.0/24", "10.0.0.0/8"]
      force: false
```

### WebAuthn Configuration
```yaml
webauthn-policy:
  relying-party-entity-name: "Carmen Hospitality"
  relying-party-id: "carmen.io"
  signature-algorithms: ["ES256", "PS256", "RS256"]
  attestation-conveyance-preference: "not specified"
  authenticator-attachment: "not specified"
  require-resident-key: "not specified"
  user-verification-requirement: "not specified"
  create-timeout: 60
  avoid-same-authenticator-register: true
  acceptable-aaguids: []
```

### SMS Authentication (Twilio Integration)
```yaml
sms-authenticator:
  provider: "twilio"
  configuration:
    account-sid: "${TWILIO_ACCOUNT_SID}"
    auth-token: "${TWILIO_AUTH_TOKEN}"
    from-number: "${TWILIO_FROM_NUMBER}"
    message-template: "Your Carmen verification code is: %s"
    code-length: 6
    code-ttl: 300
```

---

## Identity Providers

### Google Workspace Integration
```json
{
  "alias": "google",
  "displayName": "Google Workspace",
  "providerId": "oidc",
  "enabled": true,
  "trustEmail": true,
  "storeToken": false,
  "addReadTokenRoleOnCreate": false,
  "authenticateByDefault": false,
  "linkOnly": false,
  "firstBrokerLoginFlowAlias": "first broker login",
  "config": {
    "clientId": "${GOOGLE_CLIENT_ID}",
    "clientSecret": "${GOOGLE_CLIENT_SECRET}",
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth",
    "tokenUrl": "https://www.googleapis.com/oauth2/v4/token",
    "userInfoUrl": "https://www.googleapis.com/oauth2/v3/userinfo",
    "issuer": "https://accounts.google.com",
    "jwksUrl": "https://www.googleapis.com/oauth2/v3/certs",
    "defaultScope": "openid email profile",
    "hostedDomain": "yourcompany.com"
  }
}
```

### Microsoft Azure AD Integration
```json
{
  "alias": "azure-ad",
  "displayName": "Microsoft Azure AD",
  "providerId": "oidc",
  "enabled": true,
  "trustEmail": true,
  "config": {
    "clientId": "${AZURE_CLIENT_ID}",
    "clientSecret": "${AZURE_CLIENT_SECRET}",
    "authorizationUrl": "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize",
    "tokenUrl": "https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token",
    "userInfoUrl": "https://graph.microsoft.com/oidc/userinfo",
    "issuer": "https://login.microsoftonline.com/${TENANT_ID}/v2.0",
    "jwksUrl": "https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys",
    "defaultScope": "openid email profile"
  }
}
```

---

## Token Configuration

### Access Token Claims
```yaml
token-mappers:
  # User Information
  - name: "username"
    type: "User Property"
    property: "username"
    token-claim-name: "preferred_username"
    claim-json-type: "String"
    add-to-id-token: true
    add-to-access-token: true
    add-to-userinfo: true
    
  - name: "email"
    type: "User Property"
    property: "email"
    token-claim-name: "email"
    claim-json-type: "String"
    add-to-id-token: true
    add-to-access-token: true
    add-to-userinfo: true
    
  # Business Context
  - name: "hotel-properties"
    type: "User Attribute"
    user-attribute: "hotel_properties"
    token-claim-name: "hotel_properties"
    claim-json-type: "JSON"
    add-to-access-token: true
    
  - name: "department"
    type: "User Attribute"
    user-attribute: "department"
    token-claim-name: "department"
    claim-json-type: "String"
    add-to-access-token: true
    
  - name: "approval-limit"
    type: "User Attribute"
    user-attribute: "approval_limit"
    token-claim-name: "approval_limit"
    claim-json-type: "int"
    add-to-access-token: true
    
  # Roles and Permissions
  - name: "realm-roles"
    type: "User Realm Role"
    realm-role-prefix: ""
    token-claim-name: "realm_access.roles"
    claim-json-type: "String"
    add-to-access-token: true
    multivalued: true
    
  - name: "client-roles"
    type: "User Client Role"
    token-claim-name: "resource_access"
    claim-json-type: "String"
    add-to-access-token: true
    multivalued: true
```

### Sample Access Token
```json
{
  "exp": 1700000000,
  "iat": 1699999700,
  "jti": "a123b456-c789-d012-e345-f678901234567",
  "iss": "https://auth.carmen.io/realms/carmen-hospitality",
  "aud": ["carmen-web-app", "carmen-api-gateway"],
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "typ": "Bearer",
  "azp": "carmen-web-app",
  "session_state": "uuid-session-state",
  "preferred_username": "john.doe@hotel.com",
  "email": "john.doe@hotel.com",
  "email_verified": true,
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "hotel_properties": ["PROP001", "PROP002"],
  "department": "kitchen",
  "employee_id": "EMP001234",
  "approval_limit": 5000,
  "realm_access": {
    "roles": ["department-manager", "procurement-user"]
  },
  "resource_access": {
    "carmen-web-app": {
      "roles": ["module-procurement", "module-inventory", "dashboard-access"]
    }
  },
  "scope": "openid email profile carmen-app-scope"
}
```

---

## Microservice Integration

### JWT Validation in NestJS Services

#### JWT Strategy Implementation
```typescript
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/protocol/openid_connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get('KEYCLOAK_CLIENT_ID'),
      issuer: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: [
        ...(payload.realm_access?.roles || []),
        ...(Object.values(payload.resource_access || {}).flatMap((client: any) => client.roles || []))
      ],
      hotelProperties: payload.hotel_properties || [],
      department: payload.department,
      approvalLimit: payload.approval_limit || 0,
      employeeId: payload.employee_id,
    };
  }
}
```

#### Authorization Guards
```typescript
// auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// auth/department.guard.ts
@Injectable()
export class DepartmentGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { departmentId } = request.params;

    // Check if user has access to specific department
    return user.department === departmentId || 
           user.roles.includes('hotel-admin') ||
           user.hotelProperties.includes(departmentId);
  }
}
```

#### Service Integration Example
```typescript
// procurement/procurement.service.ts
@Injectable()
export class ProcurementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, DepartmentGuard)
  @Roles('procurement-user', 'department-manager')
  async createPurchaseRequest(
    createPRDto: CreatePurchaseRequestDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PurchaseRequest> {
    // Validate user approval limits
    if (createPRDto.totalAmount > user.approvalLimit) {
      throw new ForbiddenException('Purchase amount exceeds approval limit');
    }

    // Create purchase request with user context
    const purchaseRequest = await this.prisma.purchaseRequest.create({
      data: {
        ...createPRDto,
        requestorId: user.userId,
        department: user.department,
        status: 'DRAFT',
      },
    });

    // Audit log
    await this.auditService.log({
      action: 'CREATE_PURCHASE_REQUEST',
      resourceId: purchaseRequest.id,
      userId: user.userId,
      details: { amount: createPRDto.totalAmount },
    });

    return purchaseRequest;
  }
}
```

### Admin API Integration

#### User Management Service
```typescript
// auth/keycloak-admin.service.ts
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService {
  private kcAdminClient: KcAdminClient;

  constructor(private configService: ConfigService) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: configService.get('KEYCLOAK_URL'),
      realmName: configService.get('KEYCLOAK_REALM'),
    });
  }

  async authenticateAdmin() {
    await this.kcAdminClient.auth({
      grantType: 'client_credentials',
      clientId: this.configService.get('KEYCLOAK_ADMIN_CLIENT_ID'),
      clientSecret: this.configService.get('KEYCLOAK_ADMIN_CLIENT_SECRET'),
    });
  }

  async createUser(userData: CreateUserDto): Promise<string> {
    await this.authenticateAdmin();
    
    const user = await this.kcAdminClient.users.create({
      realm: this.configService.get('KEYCLOAK_REALM'),
      username: userData.email,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true,
      emailVerified: true,
      attributes: {
        hotel_properties: userData.hotelProperties,
        department: [userData.department],
        employee_id: [userData.employeeId],
        approval_limit: [userData.approvalLimit.toString()],
      },
    });

    // Assign roles
    if (userData.roles?.length > 0) {
      const realmRoles = await this.kcAdminClient.roles.find({
        realm: this.configService.get('KEYCLOAK_REALM'),
      });

      const rolesToAssign = realmRoles.filter(role => 
        userData.roles.includes(role.name)
      );

      await this.kcAdminClient.users.addRealmRoleMappings({
        realm: this.configService.get('KEYCLOAK_REALM'),
        id: user.id,
        roles: rolesToAssign,
      });
    }

    return user.id;
  }

  async updateUserApprovalLimit(userId: string, approvalLimit: number): Promise<void> {
    await this.authenticateAdmin();
    
    await this.kcAdminClient.users.update(
      {
        realm: this.configService.get('KEYCLOAK_REALM'),
        id: userId,
      },
      {
        attributes: {
          approval_limit: [approvalLimit.toString()],
        },
      }
    );
  }
}
```

---

## Vendor Portal Integration

### Vendor User Registration
```typescript
// vendor/vendor-registration.service.ts
@Injectable()
export class VendorRegistrationService {
  constructor(
    private keycloakAdminService: KeycloakAdminService,
    private vendorService: VendorService,
    private emailService: EmailService,
  ) {}

  async registerVendorUser(registrationDto: VendorUserRegistrationDto): Promise<void> {
    // Validate vendor exists
    const vendor = await this.vendorService.findById(registrationDto.vendorId);
    if (!vendor) {
      throw new BadRequestException('Invalid vendor ID');
    }

    // Create Keycloak user
    const userId = await this.keycloakAdminService.createUser({
      email: registrationDto.email,
      firstName: registrationDto.firstName,
      lastName: registrationDto.lastName,
      roles: ['vendor-user'],
      hotelProperties: vendor.allowedProperties,
      attributes: {
        vendor_id: registrationDto.vendorId,
        vendor_company: vendor.companyName,
        location_restrictions: vendor.locationRestrictions,
      },
    });

    // Send welcome email with login instructions
    await this.emailService.sendVendorWelcome({
      to: registrationDto.email,
      vendorName: vendor.companyName,
      loginUrl: `${this.configService.get('APP_URL')}/vendor-portal`,
    });
  }
}
```

### Vendor Session Validation
```typescript
// vendor/vendor-auth.guard.ts
@Injectable()
export class VendorAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    // Verify vendor role
    if (!user.roles?.includes('vendor-user') && !user.roles?.includes('vendor-admin')) {
      return false;
    }

    // Extract vendor ID from token
    const vendorId = user.attributes?.vendor_id?.[0];
    if (!vendorId) {
      return false;
    }

    // Add vendor context to request
    request.vendorId = vendorId;
    return true;
  }
}
```

---

## Event Handling

### Keycloak Event Listener
```java
// Custom Event Listener SPI
public class CarmenEventListenerProvider implements EventListenerProvider {
    
    @Override
    public void onEvent(Event event) {
        switch (event.getType()) {
            case LOGIN:
                handleUserLogin(event);
                break;
            case LOGOUT:
                handleUserLogout(event);
                break;
            case UPDATE_PASSWORD:
                handlePasswordUpdate(event);
                break;
            case LOGIN_ERROR:
                handleLoginError(event);
                break;
        }
    }
    
    private void handleUserLogin(Event event) {
        // Send login event to Carmen audit service
        String userId = event.getUserId();
        String ipAddress = event.getIpAddress();
        
        // Post to webhook
        WebhookPayload payload = new WebhookPayload()
            .setEvent("USER_LOGIN")
            .setUserId(userId)
            .setIpAddress(ipAddress)
            .setTimestamp(new Date());
            
        webhookService.send("/api/audit/keycloak-events", payload);
    }
    
    private void handleLoginError(Event event) {
        String error = event.getError();
        String username = event.getDetails().get(Details.USERNAME);
        
        // Alert on suspicious login attempts
        if (BRUTE_FORCE_ERRORS.contains(error)) {
            alertService.sendSecurityAlert(
                "Brute force attack detected for user: " + username
            );
        }
    }
}
```

### Webhook Configuration
```yaml
keycloak-events:
  webhook-url: "https://api.carmen.io/api/audit/keycloak-events"
  webhook-secret: "${KEYCLOAK_WEBHOOK_SECRET}"
  events:
    - LOGIN
    - LOGOUT
    - LOGIN_ERROR
    - UPDATE_PASSWORD
    - UPDATE_PROFILE
    - REGISTER
  
  admin-events:
    - CREATE_USER
    - UPDATE_USER
    - DELETE_USER
    - UPDATE_REALM
    - CREATE_CLIENT
```

---

## Monitoring and Metrics

### Prometheus Metrics
```yaml
keycloak-metrics:
  enabled: true
  endpoint: "/metrics"
  
  custom-metrics:
    - name: "keycloak_user_logins_total"
      type: "counter"
      description: "Total number of user logins"
      labels: ["realm", "client"]
      
    - name: "keycloak_active_sessions"
      type: "gauge"
      description: "Number of active user sessions"
      labels: ["realm"]
      
    - name: "keycloak_login_errors_total"
      type: "counter"
      description: "Total number of login errors"
      labels: ["realm", "error_type"]
      
    - name: "keycloak_token_exchanges_total"
      type: "counter"
      description: "Total number of token exchanges"
      labels: ["realm", "client"]
```

### Health Checks
```yaml
health-endpoints:
  liveness: "/health/live"
  readiness: "/health/ready"
  
health-checks:
  database:
    enabled: true
    timeout: "5s"
    query: "SELECT 1"
    
  redis:
    enabled: true
    timeout: "3s"
    
  realm-configuration:
    enabled: true
    check-interval: "60s"
```

---

## Backup and Disaster Recovery

### Database Backup Strategy
```bash
#!/bin/bash
# keycloak-backup.sh
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/keycloak"
DATABASE_NAME="keycloak"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Full database backup
pg_dump \
  --host="$DB_HOST" \
  --username="$DB_USER" \
  --dbname="$DATABASE_NAME" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/keycloak_full_$TIMESTAMP.dump"

# Realm export
docker exec keycloak_container \
  /opt/keycloak/bin/kc.sh export \
  --realm=carmen-hospitality \
  --file=/tmp/realm-export-$TIMESTAMP.json

# Copy realm export from container
docker cp keycloak_container:/tmp/realm-export-$TIMESTAMP.json \
  "$BACKUP_DIR/realm-carmen-hospitality-$TIMESTAMP.json"

# Upload to S3
aws s3 sync "$BACKUP_DIR" "s3://carmen-keycloak-backups/"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.json" -mtime +30 -delete
```

### Disaster Recovery Procedure
```yaml
recovery-procedures:
  rto: "1 hour"  # Recovery Time Objective
  rpo: "15 minutes"  # Recovery Point Objective
  
  steps:
    1. "Provision new Keycloak cluster"
    2. "Restore database from latest backup"
    3. "Import realm configuration"
    4. "Validate certificate configuration"
    5. "Update DNS records"
    6. "Test authentication flows"
    7. "Notify application services"
```

---

## Security Hardening

### Network Security
```yaml
security-configuration:
  network:
    allowed-origins:
      - "https://app.carmen.io"
      - "https://staging.carmen.io"
    
    trusted-proxies:
      - "10.0.0.0/8"
      - "172.16.0.0/12"
      - "192.168.0.0/16"
    
    rate-limiting:
      login-attempts: "10/minute"
      token-requests: "100/minute"
      admin-api: "50/minute"

  headers:
    x-frame-options: "DENY"
    x-content-type-options: "nosniff"
    x-xss-protection: "1; mode=block"
    strict-transport-security: "max-age=31536000; includeSubDomains"
    content-security-policy: "default-src 'self'"
```

### Certificate Management
```yaml
ssl-configuration:
  certificate-provider: "letsencrypt"
  auto-renewal: true
  
  certificates:
    primary: "auth.carmen.io"
    san:
      - "keycloak.carmen.io"
      - "sso.carmen.io"
  
  ocsp-stapling: true
  hsts: true
  cipher-suites:
    - "TLS_AES_256_GCM_SHA384"
    - "TLS_CHACHA20_POLY1305_SHA256"
    - "TLS_AES_128_GCM_SHA256"
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Authentication Failures
```yaml
issue: "Users cannot authenticate"
symptoms:
  - Login page shows error
  - Invalid credentials message
  - Token validation fails

diagnosis:
  - Check Keycloak logs: docker logs keycloak_container
  - Verify realm configuration
  - Test LDAP connection (if configured)
  - Check certificate validity

resolution:
  - Restart Keycloak service
  - Clear user sessions
  - Update LDAP credentials
  - Renew certificates
```

#### 2. Token Validation Errors
```yaml
issue: "Microservices reject valid tokens"
symptoms:
  - 401 Unauthorized responses
  - JWT signature validation failures
  - Expired token errors

diagnosis:
  - Check token expiration time
  - Verify JWKS endpoint accessibility
  - Validate audience claims
  - Check clock synchronization

resolution:
  - Refresh JWKS cache
  - Synchronize server clocks
  - Update client configuration
  - Restart affected services
```

#### 3. Performance Issues
```yaml
issue: "Slow authentication responses"
symptoms:
  - Long login times
  - Token exchange delays
  - Database connection timeouts

diagnosis:
  - Monitor database performance
  - Check Redis cache hit rates
  - Review connection pool settings
  - Analyze GC logs

resolution:
  - Scale database resources
  - Tune connection pools
  - Optimize cache settings
  - Increase JVM heap size
```

### Diagnostic Commands

#### Health Check Script
```bash
#!/bin/bash
# keycloak-health-check.sh

echo "=== Keycloak Health Check ==="

# Check service status
echo "1. Service Status:"
systemctl status keycloak

# Check database connection
echo "2. Database Connection:"
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER

# Check realm configuration
echo "3. Realm Health:"
curl -sf "https://auth.carmen.io/realms/carmen-hospitality/.well-known/openid_connect_configuration" > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✓ Realm configuration accessible"
else
    echo "   ✗ Realm configuration not accessible"
fi

# Check certificate expiration
echo "4. Certificate Status:"
openssl s_client -connect auth.carmen.io:443 -servername auth.carmen.io < /dev/null 2>/dev/null | \
openssl x509 -noout -dates

# Check recent errors
echo "5. Recent Errors:"
journalctl -u keycloak --since "1 hour ago" --grep "ERROR" --no-pager
```

---

## Environment Configuration

### Production Environment
```yaml
# production.env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}

# Database
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://postgres-cluster:5432/keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=${DB_PASSWORD}
KC_DB_POOL_INITIAL_SIZE=5
KC_DB_POOL_MIN_SIZE=5
KC_DB_POOL_MAX_SIZE=20

# HTTP/HTTPS
KC_HOSTNAME=auth.carmen.io
KC_HOSTNAME_STRICT_HTTPS=true
KC_HTTP_ENABLED=false
KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/certs/fullchain.pem
KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/certs/privkey.pem

# Clustering
KC_CACHE=ispn
KC_CACHE_STACK=kubernetes
JGROUPS_DISCOVERY_PROTOCOL=dns.DNS_PING
JGROUPS_DISCOVERY_PROPERTIES=dns_query=keycloak-headless

# Logging
KC_LOG_LEVEL=INFO
KC_LOG=console,file
KC_LOG_FILE=/opt/keycloak/logs/keycloak.log

# Performance
KC_HEALTH_ENABLED=true
KC_METRICS_ENABLED=true
JAVA_OPTS_APPEND="-Xms2g -Xmx4g -XX:MetaspaceSize=256m"
```

### Development Environment
```yaml
# development.env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

# Database
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak_dev
KC_DB_USERNAME=keycloak_dev
KC_DB_PASSWORD=dev_password

# HTTP
KC_HOSTNAME=localhost
KC_HTTP_ENABLED=true
KC_HTTP_PORT=8080
KC_HOSTNAME_STRICT_HTTPS=false

# Development features
KC_CACHE=local
KC_LOG_LEVEL=DEBUG
```

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Monthly Tasks
```bash
# 1. Database maintenance
psql -h $DB_HOST -U $DB_USER -d keycloak -c "VACUUM ANALYZE;"
psql -h $DB_HOST -U $DB_USER -d keycloak -c "REINDEX DATABASE keycloak;"

# 2. Clean up old sessions
curl -X POST \
  "https://auth.carmen.io/admin/realms/carmen-hospitality/logout-all" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Export realm configuration for backup
docker exec keycloak_container \
  /opt/keycloak/bin/kc.sh export \
  --realm=carmen-hospitality \
  --file=/tmp/realm-backup-$(date +%Y%m%d).json

# 4. Review security logs
journalctl -u keycloak --since "1 month ago" | grep "WARN\|ERROR" > /var/log/keycloak-review.log
```

#### Weekly Tasks
```bash
# 1. Check certificate expiration
openssl x509 -in /opt/keycloak/certs/fullchain.pem -noout -checkend 604800
if [ $? -ne 0 ]; then
    echo "Certificate expires within 7 days - renewing"
    certbot renew --nginx
fi

# 2. Monitor failed login attempts
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://auth.carmen.io/admin/realms/carmen-hospitality/events?type=LOGIN_ERROR" | \
  jq '.[] | select(.time > (now - 604800) * 1000)'

# 3. Update user attributes from HR system
./scripts/sync-user-attributes.sh
```

### Upgrade Procedures

#### Minor Version Upgrade
```bash
#!/bin/bash
# keycloak-minor-upgrade.sh

set -e

NEW_VERSION="23.0.7"
CURRENT_VERSION=$(docker exec keycloak_container /opt/keycloak/bin/kc.sh --version)

echo "Upgrading Keycloak from $CURRENT_VERSION to $NEW_VERSION"

# 1. Backup current configuration
docker exec keycloak_container \
  /opt/keycloak/bin/kc.sh export \
  --realm=carmen-hospitality \
  --file=/tmp/pre-upgrade-backup.json

# 2. Pull new image
docker pull quay.io/keycloak/keycloak:$NEW_VERSION

# 3. Stop current container
docker stop keycloak_container

# 4. Start new container with same configuration
docker run -d \
  --name keycloak_container_new \
  --env-file production.env \
  -p 8443:8443 \
  -v keycloak_data:/opt/keycloak/data \
  quay.io/keycloak/keycloak:$NEW_VERSION \
  start --optimized

# 5. Health check
sleep 30
curl -sf "https://auth.carmen.io/health/ready"

# 6. Remove old container
docker rm keycloak_container
docker rename keycloak_container_new keycloak_container

echo "Upgrade completed successfully"
```

---

This comprehensive Keycloak integration document provides the complete configuration and implementation details for the Carmen system's identity and access management. The configuration ensures secure, scalable, and maintainable authentication and authorization across all system components.