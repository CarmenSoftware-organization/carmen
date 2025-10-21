# General Settings

**Module**: System Administration
**Feature**: General Settings
**Route**: `/system-administration/settings`
**Version**: 1.0
**Last Updated**: October 21, 2025

---

## Overview

The General Settings feature provides administrators with centralized control over organization-wide configurations, security policies, application infrastructure, and company information. This comprehensive interface serves as the central hub for all system-level settings that apply across the entire Carmen ERP system.

### Purpose

- Configure company information and branding
- Manage security policies and authentication
- Set up application infrastructure and integrations
- Control system-wide features and performance
- Define operational parameters and preferences
- Manage backup and data retention policies

### Target Users

- **Primary**: System Administrators managing organization-wide configurations
- **Secondary**: IT Administrators configuring application infrastructure
- **Tertiary**: Security Administrators managing security policies and compliance

---

## Key Features

### 1. Settings Hub (Central Dashboard)

The settings hub provides quick access to all configuration areas with clear visual organization and navigation cards.

**Settings Categories**:
- **Company Settings**: Organization information, branding, and operational parameters
- **Security Settings**: Security policies, authentication, and access control
- **Application Settings**: Email, backup, integrations, and performance
- **Notification Settings**: Notification preferences and delivery infrastructure
- **Backup & Data** (Planned): Backup schedules and data retention
- **Appearance & Branding** (Planned): Theme customization and visual settings

### 2. Company Settings

Configure organizational information, branding assets, and operational parameters across three comprehensive tabs.

#### Tab 1: General Information
**Company Identity**:
- Company name and legal entity name
- Tax identification number (TIN/EIN)
- Registration number and incorporation date
- Company website URL

**Contact Information**:
- Primary phone number with extension
- Secondary phone number
- Primary email address
- Support email address

**Business Address**:
- Street address and suite/unit
- City, state/province, postal code
- Country selection

#### Tab 2: Branding
**Logo Management**:
- Logo URL for light mode display
- Logo URL for dark mode display
- Favicon URL for browser tabs
- Logo display guidelines

**Brand Colors**:
- Primary brand color (hex code)
- Secondary brand color (hex code)
- Accent color for highlights
- Color usage guidelines

**Visual Identity**:
- Brand guidelines documentation
- Logo file format requirements
- Color accessibility compliance

#### Tab 3: Operational Settings
**Localization**:
- Default currency (multi-currency support)
- System timezone configuration
- Preferred language and locale
- Date and time format preferences

**Fiscal Configuration**:
- Fiscal year start date
- Fiscal year end date
- Tax year alignment
- Accounting period definitions

**Operating Hours**:
- Business hours (Monday-Sunday)
- Holiday calendar management
- Shift schedules
- Service availability windows

**Organizational Structure**:
- Department hierarchy
- Location management
- Cost center definitions
- Division structure

### 3. Security Settings

Configure comprehensive security policies across four critical security domains.

#### Tab 1: Password Policy
**Password Requirements**:
- Minimum password length (6-32 characters, recommended 12+)
- Require uppercase letters (A-Z)
- Require lowercase letters (a-z)
- Require numeric digits (0-9)
- Require special characters (!@#$%^&*)

**Password Management**:
- Password expiry period (days, 0 = never expires)
- Password history count (prevent reuse of last N passwords)
- Password strength indicator (Weak/Medium/Strong)
- Password complexity enforcement

#### Tab 2: Authentication
**Two-Factor Authentication (2FA)**:
- Enable/disable 2FA for organization
- Require 2FA for all users (mandatory enforcement)
- Allowed authentication methods:
  - Authenticator app (TOTP)
  - SMS verification
  - Email verification
- Grace period for 2FA enrollment (days)

**Session Management**:
- Session timeout duration (minutes of inactivity)
- Maximum concurrent sessions per user
- Allow "Remember Me" functionality
- Absolute session timeout (force logout after maximum duration)
- Session token rotation policy

**Login Security**:
- Maximum failed login attempts
- Account lockout duration (minutes)
- Administrator notification on lockout
- CAPTCHA requirements after failed attempts

#### Tab 3: Access Control
**IP Access Control**:
- Enable IP whitelisting
- Whitelisted IP addresses and CIDR ranges
- IP-based access restrictions
- Geolocation-based access policies

**Security Questions**:
- Enable security questions for password recovery
- Minimum number of questions required
- Custom question management
- Security question validation rules

**Role-Based Access**:
- Permission matrix management
- Role hierarchy definitions
- Department-level access control
- Location-based restrictions

#### Tab 4: Audit & Logging
**Audit Logging**:
- Enable comprehensive audit logging
- Log retention period (days)
- Events to log:
  - User login/logout
  - Data access
  - Data modification
  - Settings changes
  - Security events

**Data Encryption**:
- Encrypt data at rest (AES-256, AES-128, RSA-2048)
- Encrypt data in transit (HTTPS/TLS enforcement)
- Encryption algorithm selection
- Key rotation policies

**Compliance**:
- GDPR compliance settings
- Data residency requirements
- Privacy policy enforcement
- Regulatory reporting

### 4. Application Settings

Configure application infrastructure, integrations, and performance across four functional areas.

#### Tab 1: Email Configuration
**SMTP Settings**:
- Email provider selection (SMTP, SendGrid, AWS SES, Custom)
- SMTP host and port
- Authentication credentials (username/password)
- Encryption method (TLS, SSL, None)
- Connection timeout settings

**Email Templates**:
- From email address and display name
- Reply-to email address
- Email signature template
- Default email format (HTML, Plain Text, Both)

**Email Testing**:
- Send test email functionality
- Email delivery monitoring
- Bounce handling configuration
- Email queue management

#### Tab 2: Backup & Recovery
**Automated Backup**:
- Enable automatic backups
- Backup frequency (Hourly, Daily, Weekly, Monthly)
- Backup schedule (time and day selection)
- Backup retention period (days)

**Backup Storage**:
- Storage location (Local, Cloud, Both)
- Cloud provider selection (AWS S3, Azure Blob, Google Cloud)
- Storage capacity management
- Backup encryption settings

**Recovery Options**:
- Point-in-time recovery capability
- Backup verification schedule
- Recovery testing frequency
- Disaster recovery procedures

#### Tab 3: Integrations
**POS Integration**:
- Enable POS system integration
- POS provider selection
- API endpoint configuration
- Authentication settings
- Sync frequency and rules

**ERP Integration**:
- Enable external ERP integration
- ERP system selection
- Integration endpoint URL
- Authentication credentials
- Data mapping configuration

**Accounting System**:
- Enable accounting software integration
- Accounting system type
- Integration mode (Real-time, Batch)
- Chart of accounts mapping
- Transaction sync rules

**Third-Party APIs**:
- API key management
- Webhook configurations
- Rate limiting settings
- Integration monitoring

#### Tab 4: Features & Performance
**Feature Toggles**:
- Advanced search functionality
- Real-time notifications
- Mobile app access
- Offline mode capability
- Beta features access

**Performance Optimization**:
- Enable caching (In-Memory, Redis, Memcached)
- Cache duration settings
- CDN configuration
- Image optimization settings
- Database query caching

**API Configuration**:
- API rate limiting (requests per minute)
- API versioning strategy
- API documentation access
- Developer API keys
- Webhook retry policies

---

## Access Control

### Required Permissions
- `system_administration.settings.view` - View all settings
- `system_administration.settings.company.manage` - Manage company settings
- `system_administration.settings.security.manage` - Manage security settings
- `system_administration.settings.application.manage` - Manage application settings

### Role Requirements
- **System Administrator**: Full access to all settings
- **IT Administrator**: Can manage application settings and integrations
- **Security Administrator**: Can manage security settings and policies
- **Financial Manager**: Can view company settings and fiscal configuration

---

## User Interface

### Settings Hub Layout
```
┌────────────────────────────────────────────────────────┐
│ General Settings                                        │
│ Configure system-wide settings and preferences          │
├────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │ Company Settings│ │Security Settings│ │Application │ │
│ │ Organization    │ │ Security policies│ │Email, backup│ │
│ │ info & branding │ │ & authentication │ │& integration│ │
│ │ [Configure Co.] │ │ [Configure Sec.]│ │ [Configure] │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ │
│ │  Notifications  │ │  Backup & Data  │ │ Appearance │ │
│ │ Notification    │ │ Backup schedules│ │Theme & UI   │ │
│ │ preferences     │ │ & data retention│ │customization│ │
│ │ [Configure Not.]│ │   [Planned]     │ │ [Planned]  │ │
│ └─────────────────┘ └─────────────────┘ └────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Tab Navigation Pattern
All settings screens use consistent horizontal tab navigation:

**Company Settings Example**:
```
[General Information] [Branding] [Operational Settings]
┌────────────────────────────────────────────────────┐
│ Company Name: [Carmen Hospitality Group          ]│
│ Legal Name:   [Carmen Hospitality Group LLC     ]│
│ Tax ID:       [12-3456789                       ]│
│                                                    │
│ [Save Changes] [Reset to Default]                 │
└────────────────────────────────────────────────────┘
```

### Key UI Components

#### Settings Card
```
┌────────────────────────────────────┐
│ Company Settings              🏢   │
├────────────────────────────────────┤
│ Organization information           │
│ and branding                       │
│                                    │
│ [Configure Company Settings]       │
└────────────────────────────────────┘
```

#### Form Input Pattern
```
┌────────────────────────────────────┐
│ Label Name                         │
│ [Input Field                     ] │
│ Helper text or description         │
└────────────────────────────────────┘
```

---

## Data Model

### Company Settings
```typescript
interface CompanySettings {
  general: {
    companyName: string;
    legalName: string;
    taxId: string;
    registrationNumber: string;
    incorporationDate: string;
    website: string;
  };
  contact: {
    primaryPhone: string;
    secondaryPhone?: string;
    primaryEmail: string;
    supportEmail: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  branding: {
    logoUrl: string;
    darkModeLogoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  operational: {
    defaultCurrency: string;
    timezone: string;
    language: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
  };
}
```

### Security Settings
```typescript
interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    historyCount: number;
  };
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: ('authenticator' | 'sms' | 'email')[];
    gracePeriodDays: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions: number;
    rememberMe: boolean;
    absoluteTimeout: boolean;
  };
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number;
    notifyAdmin: boolean;
  };
  ipAccessControl: {
    enabled: boolean;
    whitelist: string[];
  };
  securityQuestions: {
    enabled: boolean;
    minRequired: number;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    events: ('login' | 'logout' | 'dataAccess' | 'dataModification' | 'settingsChange')[];
  };
  dataEncryption: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: 'AES-256' | 'AES-128' | 'RSA-2048';
  };
}
```

### Application Settings
```typescript
interface ApplicationSettings {
  email: {
    provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'custom';
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    encryption: 'tls' | 'ssl' | 'none';
    fromEmail: string;
    fromName: string;
  };
  backup: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    storageLocation: 'local' | 'cloud' | 'both';
    cloudProvider?: string;
  };
  integrations: {
    pos: {
      enabled: boolean;
      provider: string;
      apiEndpoint: string;
      apiKey: string;
    };
    erp: {
      enabled: boolean;
      system: string;
      endpoint: string;
    };
    accounting: {
      enabled: boolean;
      system: string;
      mode: 'realtime' | 'batch';
    };
  };
  features: {
    advancedSearch: boolean;
    realtimeNotifications: boolean;
    mobileAccess: boolean;
    offlineMode: boolean;
  };
  performance: {
    caching: {
      enabled: boolean;
      type: 'memory' | 'redis' | 'memcached';
      duration: number;
    };
    apiRateLimit: number;
  };
}
```

---

## Business Rules

### Company Settings Rules
1. **Company Name**: Required, 3-200 characters, unique within system
2. **Tax ID**: Required, must follow country-specific format validation
3. **Email Addresses**: Must be valid email format, unique within organization
4. **Logo URLs**: Must be valid HTTPS URLs, recommended dimensions provided
5. **Brand Colors**: Must be valid hex color codes (#RRGGBB format)
6. **Fiscal Year**: Start and end dates must be exactly 12 months apart
7. **Timezone**: Must be valid IANA timezone identifier

### Security Settings Rules
1. **Password Complexity**: Minimum 6 characters, recommended 12+ for strong security
2. **Password Expiry**: 0 = never expires, otherwise enforced after specified days
3. **2FA Grace Period**: Applied only when 2FA is required but not mandatory
4. **Session Timeout**: Minimum 5 minutes, maximum 1440 minutes (24 hours)
5. **Failed Login Attempts**: Minimum 3 attempts before lockout
6. **IP Whitelist**: Must be valid IPv4/IPv6 addresses or CIDR notation
7. **Audit Log Retention**: Minimum 30 days, recommended 365 days for compliance
8. **Encryption Algorithm**: AES-256 recommended for production environments

### Application Settings Rules
1. **SMTP Configuration**: All fields required when email provider is SMTP
2. **Backup Retention**: Minimum 7 days, maximum 3650 days (10 years)
3. **Integration Endpoints**: Must be valid HTTPS URLs for security
4. **API Rate Limit**: Minimum 10 requests/minute, maximum 10000 requests/minute
5. **Cache Duration**: Minimum 60 seconds, maximum 86400 seconds (24 hours)
6. **Cloud Storage**: Requires valid credentials and accessible endpoints

---

## Integration Points

### Internal Integrations
- **User Context System**: Retrieves current user permissions for settings access
- **Notification System**: Sends alerts for critical security changes
- **Audit System**: Logs all settings modifications with user identity and timestamp
- **All Business Modules**: Apply company, security, and application settings

### External Integrations
- **Email Providers**: SMTP, SendGrid, AWS SES for email delivery
- **Cloud Storage**: AWS S3, Azure Blob, Google Cloud for backups
- **POS Systems**: Square, Toast, Clover for sales integration
- **ERP Systems**: SAP, Oracle, Microsoft Dynamics for enterprise integration
- **Accounting Systems**: QuickBooks, Xero, Sage for financial integration

---

## Workflows

### Configure Company Settings Workflow
1. Administrator navigates to Settings Hub → Company Settings
2. Selects appropriate tab (General, Branding, or Operational)
3. Updates required fields with new values
4. Reviews changes before saving
5. Clicks "Save Changes" button
6. System validates all inputs against business rules
7. Success notification displayed
8. Changes applied immediately across system

### Update Security Policy Workflow
1. Security Administrator navigates to Security Settings
2. Selects security domain tab to configure
3. Adjusts security parameters (password policy, 2FA, etc.)
4. Reviews security strength indicator
5. Reads security warning about impact
6. Clicks "Save Changes" button
7. System validates security requirements
8. Administrator notification sent if critical changes made
9. Active user sessions affected by new policies
10. Audit log entry created

### Configure Application Integration Workflow
1. IT Administrator navigates to Application Settings → Integrations
2. Selects integration to configure (POS, ERP, Accounting)
3. Enables integration toggle
4. Enters API endpoint and credentials
5. Tests connection using "Test Connection" button
6. Verifies successful connection
7. Configures sync frequency and mapping
8. Saves integration settings
9. Integration activated and monitoring begins
10. First sync initiated automatically

---

## Performance Considerations

### Loading Performance
- Settings Hub load: < 1 second
- Individual settings page load: < 2 seconds
- Tab switching: < 200ms
- Save operations: < 3 seconds
- Integration testing: < 5 seconds

### Optimization Strategies
- Lazy loading for tab content
- Debounced form validation
- Optimistic UI updates for immediate feedback
- Caching of static configuration options
- Progressive enhancement for large forms

---

## Security & Compliance

### Data Protection
- Credentials encrypted at rest (AES-256)
- API keys masked by default in UI
- Sensitive settings require administrator authentication
- Audit logging for all configuration changes
- Permission checks before any save operation

### Input Validation
- Server-side validation for all inputs
- Sanitization for text inputs to prevent XSS
- Email format validation
- URL format validation with HTTPS enforcement
- Number range validation with min/max constraints

### Audit Trail
- All settings changes logged with:
  - User identity and role
  - Timestamp (UTC)
  - Before and after values
  - IP address and session information
- Compliance reporting support
- Change history retention per retention policy

---

## Testing

### Functional Testing Scenarios
1. **Company Settings**: Verify all fields save and persist correctly
2. **Branding**: Test logo uploads and color picker functionality
3. **Security Policy**: Validate password complexity enforcement
4. **2FA Configuration**: Test all authentication methods
5. **Session Management**: Verify timeout and concurrent session limits
6. **Email Configuration**: Test email delivery with various providers
7. **Integration Testing**: Verify successful connection to external systems
8. **Permission Checks**: Ensure role-based access control works correctly

### Edge Cases
1. **Concurrent Modifications**: Handle multiple admins editing simultaneously
2. **Invalid Credentials**: Graceful error handling for integration failures
3. **Network Failures**: Retry logic and error recovery
4. **Invalid Configurations**: Prevent saving invalid settings
5. **Character Limits**: Enforce limits on text inputs
6. **Special Characters**: Handle Unicode and special characters correctly

### Performance Testing
1. **Load Testing**: 50+ concurrent administrators
2. **Save Operations**: Measure response time for large setting objects
3. **Integration Testing**: Measure connection timeout handling
4. **Cache Effectiveness**: Verify cache hit rates

---

## Accessibility

### WCAG 2.1 AA Compliance
- Full keyboard navigation support
- ARIA labels on all interactive elements
- Minimum 4.5:1 color contrast ratio
- Clear visible focus indicators
- Screen reader compatibility
- Form error announcements

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save changes
- `Ctrl/Cmd + R`: Reset to defaults
- `Tab`: Navigate between fields
- `Space/Enter`: Toggle switches and activate buttons
- `Esc`: Close dialogs and cancel operations

---

## Mobile Responsiveness

### Responsive Breakpoints
- **Desktop** (1024px+): Full layout with multi-column grids
- **Tablet** (768px - 1023px): Adapted grid with condensed spacing
- **Mobile** (< 768px): Stacked layout with full-width cards

### Mobile Optimizations
- Tab labels abbreviated on mobile
- Form inputs stack vertically
- Touch-friendly tap targets (minimum 44x44px)
- Single column layout for all settings
- Collapsible sections for better space usage

---

## Future Enhancements

### Phase 2 Features
- **Advanced Backup**: Incremental backups, point-in-time recovery
- **Multi-Tenancy**: Organization-specific settings isolation
- **Settings Templates**: Pre-configured setting bundles for common scenarios
- **Change Approval Workflow**: Require approval for critical security changes
- **Settings Import/Export**: Backup and restore settings configurations
- **Bulk Updates**: Update multiple settings simultaneously

### Phase 3 Features
- **AI-Powered Recommendations**: Suggest optimal security and performance settings
- **Compliance Presets**: One-click GDPR, HIPAA, SOC2 compliance configurations
- **Settings Versioning**: Track and rollback settings changes
- **Automated Testing**: Continuous validation of integration configurations
- **Performance Analytics**: Real-time monitoring of settings impact on system performance

---

## Troubleshooting

### Common Issues

**Issue**: Changes not saving
- **Check**: Verify all required fields are filled
- **Check**: Ensure valid data formats (email, URL, hex colors)
- **Check**: Check browser console for validation errors
- **Solution**: Review error messages and correct invalid fields

**Issue**: Email not sending
- **Check**: Verify SMTP credentials are correct
- **Check**: Confirm SMTP port and encryption settings
- **Check**: Test connection using "Test Email" button
- **Solution**: Review email provider documentation for correct settings

**Issue**: Integration connection fails
- **Check**: Verify API endpoint is accessible
- **Check**: Confirm API credentials are valid and not expired
- **Check**: Check firewall rules allow outbound connections
- **Solution**: Contact integration provider support if issues persist

**Issue**: Security policy too restrictive
- **Check**: Review password strength requirements
- **Check**: Verify 2FA grace period is sufficient
- **Check**: Ensure session timeout allows adequate working time
- **Solution**: Adjust policies based on user feedback and security needs

---

## Support & Documentation

### Related Documentation
- [Company Settings Implementation](/docs/documents/sa/features/general-settings/guides/company-settings.md)
- [Security Settings Implementation](/docs/documents/sa/features/general-settings/guides/security-settings.md)
- [Application Settings Implementation](/docs/documents/sa/features/general-settings/guides/application-settings.md)
- [Notification Settings](/docs/documents/sa/features/notification-settings/) - Notification-specific settings

### Technical References
- Implementation: `app/(main)/system-administration/settings/`
- Type Definitions: `lib/types/settings.ts`
- Mock Data: `lib/mock-data/settings.ts`
- Business Rules: `docs/documents/sa/features/general-settings/guides/business-rules.md`

### Support Channels
- **Product Owner**: System Administration Product Manager
- **Technical Lead**: Senior Full-Stack Developer
- **Documentation**: [GitHub Issues](https://github.com/organization/carmen/issues)

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0 | October 21, 2025 | Documentation Team | Initial general settings documentation covering company, security, and application settings |

---

*This documentation is part of the Carmen Hospitality ERP System Administration module.*
