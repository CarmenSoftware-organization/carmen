# General Settings - Business Rules

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Target Audience**: Business Analysts, Product Owners, System Administrators, Developers

---

## Overview

This document defines the comprehensive business rules governing the General Settings feature in Carmen ERP System Administration. These rules ensure data integrity, security compliance, operational consistency, and regulatory adherence across Company Settings, Security Settings, and Application Settings.

All business rules are categorized by functional area and assigned unique identifiers for traceability and implementation reference.

---

## Table of Contents

1. [Company Settings Rules](#company-settings-rules)
2. [Security Settings Rules](#security-settings-rules)
3. [Application Settings Rules](#application-settings-rules)
4. [Cross-Functional Rules](#cross-functional-rules)
5. [Validation Matrix](#validation-matrix)
6. [Error Messages](#error-messages)

---

## Company Settings Rules

### General Information Rules (GI-Series)

#### GI-001: Company Name Validation
**Rule**: Company name must be unique within the system, between 3-200 characters, and contain valid business name characters.

**Validation**:
- Minimum length: 3 characters
- Maximum length: 200 characters
- Allowed characters: Letters, numbers, spaces, hyphens, apostrophes, ampersands, periods
- Cannot consist only of spaces or special characters
- Must be unique across all organizations in the database

**Error Message**: "Company name must be 3-200 characters and contain valid business name characters."

**Business Justification**: Ensures clear company identification and prevents system conflicts.

---

#### GI-002: Legal Name Requirement
**Rule**: Legal name must match official registration documents and follow jurisdiction-specific naming requirements.

**Validation**:
- Minimum length: 3 characters
- Maximum length: 200 characters
- Must include legal entity indicator if applicable (LLC, Inc., Ltd., Corp., etc.)
- Should match incorporation documents

**Error Message**: "Legal name must be 3-200 characters and match official registration documents."

**Business Justification**: Ensures legal compliance and accurate official documentation.

---

#### GI-003: Tax ID Format Validation
**Rule**: Tax Identification Number must follow country-specific format requirements.

**Validation**:
- **USA (EIN)**: Format XX-XXXXXXX (9 digits)
- **UK (UTR)**: Format XXXXXXXXXX (10 digits)
- **Canada (BN)**: Format XXXXXXXXX (9 digits)
- Must be numeric digits only (excluding formatting characters)
- Cannot be all zeros or sequential numbers (123456789)

**Error Message**: "Tax ID must follow country-specific format (e.g., XX-XXXXXXX for US EIN)."

**Business Justification**: Ensures tax compliance and accurate financial reporting.

---

#### GI-004: Website URL Security
**Rule**: Website URL must use HTTPS protocol for security compliance.

**Validation**:
- Must start with `https://`
- Must be a valid URL format
- Domain must be resolvable (optional DNS check)
- Cannot contain unsafe characters

**Error Message**: "Website URL must use HTTPS protocol (e.g., https://example.com)."

**Business Justification**: Ensures secure communications and protects user data privacy.

---

#### GI-005: Incorporation Date Validity
**Rule**: Incorporation date must be a valid past date and cannot be in the future.

**Validation**:
- Must be in ISO format (YYYY-MM-DD)
- Must be a past date (not future)
- Cannot be before 1800-01-01 (reasonable business constraint)
- Cannot be after current date

**Error Message**: "Incorporation date must be a valid past date."

**Business Justification**: Prevents data entry errors and ensures accurate company history.

---

### Contact Information Rules (CI-Series)

#### CI-001: Primary Email Uniqueness
**Rule**: Primary email must be unique within the organization and follow valid email format.

**Validation**:
- Must match email regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Must be unique within organization
- Domain must have valid MX records (optional)
- Cannot be a disposable email address (configurable)

**Error Message**: "Primary email must be a valid, unique email address."

**Business Justification**: Ensures reliable primary communication channel.

---

#### CI-002: Phone Number Format
**Rule**: Phone numbers must follow E.164 international format.

**Validation**:
- Format: `+[country code][number]`
- Length: 7-15 digits (excluding country code prefix)
- Must contain only digits after country code
- Country code must be valid (1-3 digits)

**Error Message**: "Phone number must follow international format (+1234567890)."

**Business Justification**: Enables global communication and accurate contact information.

---

#### CI-003: Support Email Availability
**Rule**: Support email must be different from primary email and accessible for customer inquiries.

**Validation**:
- Must be valid email format
- Cannot be the same as primary email
- Should be a monitored email address
- Must accept incoming messages (optional verification)

**Error Message**: "Support email must be different from primary email and valid."

**Business Justification**: Ensures dedicated customer support channel.

---

### Address Information Rules (AI-Series)

#### AI-001: Street Address Completeness
**Rule**: Street address must be complete and include street number and name.

**Validation**:
- Minimum length: 5 characters
- Maximum length: 200 characters
- Must contain both letters and numbers
- Cannot be a P.O. Box for physical locations

**Error Message**: "Street address must be 5-200 characters and include street number and name."

**Business Justification**: Ensures accurate physical location for deliveries and legal purposes.

---

#### AI-002: City and State Validation
**Rule**: City and state must be valid for the selected country.

**Validation**:
- City: 2-100 characters, letters and spaces only
- State/Province: 2-100 characters, must be valid for country
- Must match country's administrative divisions

**Error Message**: "City and state must be valid for the selected country."

**Business Justification**: Prevents geographical data errors and ensures accurate addressing.

---

#### AI-003: Postal Code Format
**Rule**: Postal code must match country-specific format requirements.

**Validation**:
- **USA**: XXXXX or XXXXX-XXXX (5 or 9 digits)
- **UK**: Format varies (e.g., SW1A 1AA)
- **Canada**: A1A 1A1 (letter-digit-letter space digit-letter-digit)
- Minimum length: 3 characters
- Maximum length: 20 characters

**Error Message**: "Postal code must match country format requirements."

**Business Justification**: Ensures accurate mail delivery and geographical data integrity.

---

#### AI-004: Country Code Standard
**Rule**: Country must be specified using ISO 3166-1 alpha-2 codes.

**Validation**:
- Must be exactly 2 characters
- Must be uppercase
- Must be a valid ISO country code (US, GB, CA, etc.)

**Error Message**: "Country must be a valid 2-letter ISO code (e.g., US, GB, CA)."

**Business Justification**: Ensures standardized international addressing and system interoperability.

---

### Branding Rules (BR-Series)

#### BR-001: Logo URL Security
**Rule**: All logo and image URLs must use HTTPS for security.

**Validation**:
- Must start with `https://`
- Must be a valid URL
- Image must be accessible (optional check)
- Recommended formats: PNG, SVG, JPEG

**Error Message**: "Logo URL must use HTTPS and be accessible."

**Business Justification**: Protects brand assets and ensures secure image delivery.

---

#### BR-002: Color Code Format
**Rule**: Brand colors must be specified in hexadecimal format.

**Validation**:
- Must match format: `#RRGGBB`
- Must be exactly 7 characters (# + 6 hex digits)
- Hex digits must be 0-9, A-F (case insensitive)

**Error Message**: "Color must be in hex format (#RRGGBB)."

**Business Justification**: Ensures consistent color representation across all platforms.

---

#### BR-003: Color Contrast Accessibility
**Rule**: Primary and secondary colors must meet WCAG AA contrast ratio requirements (4.5:1 for text).

**Validation**:
- Calculate contrast ratio between colors
- Primary vs white background: ≥ 4.5:1
- Secondary vs white background: ≥ 4.5:1
- Warning displayed if requirements not met

**Error Message**: "Color contrast does not meet WCAG AA requirements (4.5:1 minimum)."

**Business Justification**: Ensures accessibility for users with visual impairments.

---

#### BR-004: Logo Dimensions Recommendation
**Rule**: Logo images should follow recommended dimensions for optimal display.

**Validation** (Warning only, not enforced):
- Logo: 200x60 pixels to 400x120 pixels (recommended)
- Dark mode logo: Same dimensions as light mode
- Favicon: 32x32 or 64x64 pixels
- File size: < 500 KB per image

**Warning Message**: "Logo dimensions outside recommended range (200x60 to 400x120 pixels)."

**Business Justification**: Ensures optimal visual quality across different display contexts.

---

### Operational Settings Rules (OS-Series)

#### OS-001: Currency Code Standard
**Rule**: Currency must be specified using ISO 4217 3-letter currency codes.

**Validation**:
- Must be exactly 3 characters
- Must be uppercase
- Must be a valid ISO currency code (USD, EUR, GBP, etc.)
- Currency must be supported by the system

**Error Message**: "Currency must be a valid 3-letter ISO code (e.g., USD, EUR, GBP)."

**Business Justification**: Ensures standardized financial reporting and multi-currency support.

---

#### OS-002: Timezone Specification
**Rule**: Timezone must be a valid IANA timezone identifier.

**Validation**:
- Must be a valid IANA timezone (e.g., America/New_York)
- Format: Continent/City or Region/City
- Must be recognized by the system's timezone database

**Error Message**: "Timezone must be a valid IANA identifier (e.g., America/New_York)."

**Business Justification**: Ensures accurate time-based operations and scheduling.

---

#### OS-003: Fiscal Year Validity
**Rule**: Fiscal year start and end dates must be exactly 12 months apart.

**Validation**:
- Format: MM-DD for both start and end
- End date must be exactly 365 days after start (or 366 for leap years)
- Cannot have gaps or overlaps
- Must cover complete 12-month period

**Error Message**: "Fiscal year must be exactly 12 months (365/366 days)."

**Business Justification**: Ensures consistent financial reporting periods.

---

#### OS-004: Language Code Standard
**Rule**: Language must be specified using ISO 639-1 2-letter codes.

**Validation**:
- Must be exactly 2 characters
- Must be lowercase
- Must be a valid ISO language code (en, es, fr, etc.)
- Language must be supported by the system

**Error Message**: "Language must be a valid 2-letter ISO code (e.g., en, es, fr)."

**Business Justification**: Enables multi-language support and localization.

---

## Security Settings Rules

### Password Policy Rules (PP-Series)

#### PP-001: Password Length Requirements
**Rule**: Minimum password length must be between 6-32 characters, with 12+ characters recommended for strong security.

**Validation**:
- Minimum: 6 characters (absolute minimum)
- Maximum: 32 characters
- Recommended: 12+ characters for strong security
- Cannot be 0 or negative

**Error Message**: "Minimum password length must be 6-32 characters (12+ recommended)."

**Business Justification**: Balances security requirements with usability.

---

#### PP-002: Password Complexity Scoring
**Rule**: Password policy strength is calculated based on configured requirements.

**Calculation**:
```
Strength Score =
  (minLength ≥ 12 ? 2 : 1) +
  (requireUppercase ? 1 : 0) +
  (requireLowercase ? 1 : 0) +
  (requireNumbers ? 1 : 0) +
  (requireSpecialChars ? 1 : 0)

Weak: Score ≤ 2
Medium: Score 3-4
Strong: Score ≥ 5
```

**Error Message**: N/A (Informational indicator)

**Business Justification**: Provides administrators visibility into password security strength.

---

#### PP-003: Password Expiry Validation
**Rule**: Password expiry period must be 0 (never expires) or 30-365 days.

**Validation**:
- 0 = Never expires
- If not 0: Must be between 30-365 days
- Cannot be negative

**Error Message**: "Password expiry must be 0 (never) or 30-365 days."

**Business Justification**: Prevents overly frequent password changes that reduce security.

---

#### PP-004: Password History Limit
**Rule**: Password history must track 0-24 previous passwords.

**Validation**:
- Minimum: 0 (no history)
- Maximum: 24 passwords
- Recommended: 5-10 for balance
- Cannot be negative

**Error Message**: "Password history must be 0-24 previous passwords."

**Business Justification**: Prevents password reuse while avoiding excessive history storage.

---

### Authentication Rules (AU-Series)

#### AU-001: 2FA Grace Period
**Rule**: Two-factor authentication grace period must be 0-90 days.

**Validation**:
- Minimum: 0 days (immediate enforcement)
- Maximum: 90 days
- Applied only when 2FA is required but not yet mandatory
- Cannot be negative

**Error Message**: "2FA grace period must be 0-90 days."

**Business Justification**: Provides users time to set up 2FA while maintaining security.

---

#### AU-002: 2FA Method Requirements
**Rule**: At least one 2FA method must be enabled when 2FA is active.

**Validation**:
- At least one method must be selected
- Valid methods: authenticator, sms, email
- Multiple methods can be enabled simultaneously
- Cannot disable all methods while 2FA is enabled

**Error Message**: "At least one 2FA method must be enabled."

**Business Justification**: Ensures 2FA functionality when enabled.

---

#### AU-003: Session Timeout Range
**Rule**: Session timeout must be 5-1440 minutes (24 hours).

**Validation**:
- Minimum: 5 minutes (prevents too-frequent logouts)
- Maximum: 1440 minutes (24 hours)
- Recommended: 15-60 minutes for high-security environments
- Must be a positive integer

**Error Message**: "Session timeout must be 5-1440 minutes."

**Business Justification**: Balances security with user convenience.

---

#### AU-004: Concurrent Sessions Limit
**Rule**: Maximum concurrent sessions per user must be 1-10.

**Validation**:
- Minimum: 1 session (one device at a time)
- Maximum: 10 sessions
- Recommended: 3-5 sessions
- Cannot be 0 or negative

**Error Message**: "Concurrent sessions must be 1-10 per user."

**Business Justification**: Prevents account sharing while allowing legitimate multi-device usage.

---

#### AU-005: Login Attempts Threshold
**Rule**: Maximum failed login attempts before lockout must be 3-20.

**Validation**:
- Minimum: 3 attempts (prevents brute force)
- Maximum: 20 attempts
- Recommended: 5-10 attempts
- Must be a positive integer

**Error Message**: "Failed login attempts must be 3-20 before lockout."

**Business Justification**: Protects against brute force attacks while avoiding user frustration.

---

#### AU-006: Lockout Duration Constraints
**Rule**: Account lockout duration must be 1-1440 minutes.

**Validation**:
- Minimum: 1 minute
- Maximum: 1440 minutes (24 hours)
- Recommended: 15-60 minutes
- Must be a positive integer

**Error Message**: "Lockout duration must be 1-1440 minutes."

**Business Justification**: Discourages brute force while allowing legitimate user recovery.

---

### Access Control Rules (AC-Series)

#### AC-001: IP Whitelist Format
**Rule**: IP addresses in whitelist must be valid IPv4 addresses or CIDR notation.

**Validation**:
- IPv4 format: XXX.XXX.XXX.XXX (each octet 0-255)
- CIDR format: XXX.XXX.XXX.XXX/YY (YY = 0-32)
- Each IP or range must be unique
- Cannot contain private IPs unless explicitly allowed

**Error Message**: "IP address must be valid IPv4 or CIDR format (e.g., 192.168.1.1 or 192.168.1.0/24)."

**Business Justification**: Ensures accurate IP-based access control.

---

#### AC-002: Security Questions Minimum
**Rule**: Minimum required security questions must be 1-10.

**Validation**:
- Minimum: 1 question
- Maximum: 10 questions
- Recommended: 3-5 questions
- Cannot be 0 or negative

**Error Message**: "Minimum security questions must be 1-10."

**Business Justification**: Provides account recovery while preventing security fatigue.

---

### Audit Logging Rules (AL-Series)

#### AL-001: Log Retention Period
**Rule**: Audit log retention period must be 30-3650 days (10 years).

**Validation**:
- Minimum: 30 days (regulatory minimum)
- Maximum: 3650 days (10 years)
- Recommended: 365 days (1 year) for compliance
- Must be a positive integer

**Error Message**: "Log retention must be 30-3650 days."

**Business Justification**: Meets regulatory compliance requirements while managing storage costs.

---

#### AL-002: Audit Event Selection
**Rule**: At least one audit event type must be enabled when audit logging is active.

**Validation**:
- Valid events: login, logout, dataAccess, dataModification, settingsChange
- At least one event must be selected
- Multiple events can be enabled simultaneously
- Cannot disable all events while audit logging is enabled

**Error Message**: "At least one audit event type must be enabled."

**Business Justification**: Ensures meaningful audit trail when logging is enabled.

---

### Data Encryption Rules (DE-Series)

#### DE-001: Encryption Algorithm Selection
**Rule**: Encryption algorithm must be industry-standard (AES-256, AES-128, or RSA-2048).

**Validation**:
- Valid algorithms: AES-256, AES-128, RSA-2048
- AES-256 recommended for production
- Algorithm must be supported by system
- Cannot use deprecated algorithms (MD5, SHA1)

**Error Message**: "Encryption algorithm must be AES-256, AES-128, or RSA-2048."

**Business Justification**: Ensures data security using industry-standard encryption.

---

#### DE-002: TLS/SSL Enforcement
**Rule**: Data in transit encryption (HTTPS/TLS) should be enabled for production environments.

**Validation**:
- TLS 1.2 or higher required
- HTTPS should be enforced for all connections
- Warning displayed if disabled
- Cannot use SSL (deprecated)

**Warning Message**: "Data in transit encryption disabled. Enable HTTPS/TLS for production."

**Business Justification**: Protects data during transmission from interception.

---

## Application Settings Rules

### Email Configuration Rules (EC-Series)

#### EC-001: SMTP Host Validation
**Rule**: SMTP host must be a valid hostname or IP address.

**Validation**:
- Minimum length: 3 characters
- Maximum length: 255 characters
- Valid hostname format or IPv4 address
- Must be resolvable (optional DNS check)

**Error Message**: "SMTP host must be a valid hostname or IP address."

**Business Justification**: Ensures successful email delivery configuration.

---

#### EC-002: SMTP Port Range
**Rule**: SMTP port must be a valid port number (1-65535).

**Validation**:
- Minimum: 1
- Maximum: 65535
- Common ports: 25, 465, 587, 2525
- Recommended: 587 (TLS)

**Error Message**: "SMTP port must be 1-65535 (587 recommended)."

**Business Justification**: Ensures valid network port configuration.

---

#### EC-003: Encryption Method Compatibility
**Rule**: SMTP encryption method must be compatible with selected port.

**Validation**:
- Port 25: None or TLS (STARTTLS)
- Port 465: SSL (implicit)
- Port 587: TLS (STARTTLS)
- Port 2525: TLS (STARTTLS)

**Warning Message**: "Encryption method may not be compatible with selected port."

**Business Justification**: Prevents email configuration errors.

---

#### EC-004: From Email Validity
**Rule**: From email address must be valid and preferably use company domain.

**Validation**:
- Must be valid email format
- Should match company domain (warning if different)
- Cannot be a no-reply address for customer communications
- Domain must have SPF/DKIM records (recommended)

**Error Message**: "From email must be a valid email address."

**Warning Message**: "From email domain does not match company domain."

**Business Justification**: Ensures reliable email delivery and brand consistency.

---

### Backup & Recovery Rules (BK-Series)

#### BK-001: Backup Frequency Options
**Rule**: Backup frequency must be one of the predefined intervals: hourly, daily, weekly, monthly.

**Validation**:
- Valid frequencies: hourly, daily, weekly, monthly
- Hourly: Runs every hour (24 backups/day)
- Daily: Runs once per day at specified time
- Weekly: Runs once per week on specified day
- Monthly: Runs once per month on specified date

**Error Message**: "Backup frequency must be hourly, daily, weekly, or monthly."

**Business Justification**: Balances data protection with storage costs and performance.

---

#### BK-002: Retention Period Constraints
**Rule**: Backup retention period must be 7-3650 days.

**Validation**:
- Minimum: 7 days (one week)
- Maximum: 3650 days (10 years)
- Recommended: 30-90 days for most organizations
- Must be a positive integer

**Error Message**: "Backup retention must be 7-3650 days."

**Business Justification**: Ensures adequate data recovery capability while managing storage.

---

#### BK-003: Storage Location Requirements
**Rule**: Backup storage location must be specified as local, cloud, or both.

**Validation**:
- Valid options: local, cloud, both
- Cloud storage requires cloud provider specification
- Local storage requires sufficient disk space
- "Both" provides redundancy (recommended)

**Error Message**: "Storage location must be local, cloud, or both."

**Business Justification**: Ensures reliable backup storage and disaster recovery.

---

#### BK-004: Cloud Provider Validation
**Rule**: When cloud storage is selected, a cloud provider must be specified.

**Validation**:
- Required when storage location is "cloud" or "both"
- Valid providers: AWS S3, Azure Blob, Google Cloud Storage
- Provider must have valid credentials configured
- Credentials must be tested before activation

**Error Message**: "Cloud provider must be specified for cloud storage."

**Business Justification**: Ensures proper cloud backup configuration.

---

### Integration Rules (IN-Series)

#### IN-001: API Endpoint Security
**Rule**: All integration API endpoints must use HTTPS protocol.

**Validation**:
- Must start with `https://`
- Must be a valid URL
- Endpoint must be accessible (optional check)
- Cannot use localhost or 127.0.0.1 in production

**Error Message**: "API endpoint must use HTTPS protocol."

**Business Justification**: Protects sensitive integration data during transmission.

---

#### IN-002: API Key Format
**Rule**: API keys must be securely stored and properly formatted.

**Validation**:
- Minimum length: 16 characters
- Maximum length: 256 characters
- Must contain alphanumeric characters
- Should be encrypted at rest

**Error Message**: "API key must be 16-256 characters."

**Business Justification**: Ensures secure API authentication.

---

#### IN-003: Integration Testing Requirement
**Rule**: Integration configuration must be tested before activation.

**Validation**:
- Test connection before saving
- Verify API credentials are valid
- Confirm endpoint is accessible
- Validate response format

**Warning Message**: "Integration not tested. Test connection before activation."

**Business Justification**: Prevents integration failures and data synchronization issues.

---

#### IN-004: POS Integration Sync Frequency
**Rule**: POS integration sync frequency must balance real-time needs with system performance.

**Validation**:
- Valid frequencies: real-time, 5 min, 15 min, 30 min, hourly
- Real-time recommended for critical operations
- Less frequent syncs reduce system load
- Cannot exceed API rate limits

**Error Message**: "Sync frequency must be real-time, 5 min, 15 min, 30 min, or hourly."

**Business Justification**: Balances data freshness with system performance.

---

### Performance Settings Rules (PS-Series)

#### PS-001: API Rate Limit Range
**Rule**: API rate limit must be 10-10000 requests per minute.

**Validation**:
- Minimum: 10 requests/minute
- Maximum: 10000 requests/minute
- Recommended: 100-1000 for most applications
- Must consider system capacity

**Error Message**: "API rate limit must be 10-10000 requests per minute."

**Business Justification**: Prevents API abuse while allowing legitimate usage.

---

#### PS-002: Cache Duration Constraints
**Rule**: Cache duration must be 60-86400 seconds (1 minute to 24 hours).

**Validation**:
- Minimum: 60 seconds (1 minute)
- Maximum: 86400 seconds (24 hours)
- Recommended: 300-3600 seconds (5 minutes to 1 hour)
- Must be a positive integer

**Error Message**: "Cache duration must be 60-86400 seconds."

**Business Justification**: Balances performance with data freshness.

---

#### PS-003: Cache Type Compatibility
**Rule**: Cache type must be compatible with system infrastructure.

**Validation**:
- Valid types: memory, redis, memcached
- Memory: Simple, no external dependencies
- Redis: Distributed, persistent (recommended)
- Memcached: Distributed, volatile
- Selected cache server must be running

**Error Message**: "Selected cache type not available. Choose memory, redis, or memcached."

**Business Justification**: Ensures cache functionality and optimal performance.

---

## Cross-Functional Rules

### CFR-001: Settings Change Audit Trail
**Rule**: All settings modifications must be logged in the audit trail.

**Validation**:
- Log user identity (ID and name)
- Log timestamp (UTC)
- Log changed settings (before and after values)
- Log IP address and session information
- Cannot be disabled for compliance settings

**Implementation**: Automatic (enforced by system)

**Business Justification**: Ensures accountability and regulatory compliance.

---

### CFR-002: Permission-Based Access
**Rule**: Users must have appropriate permissions to modify settings.

**Validation**:
- Company Settings: `system_administration.settings.company.manage`
- Security Settings: `system_administration.settings.security.manage`
- Application Settings: `system_administration.settings.application.manage`
- View-only access: `system_administration.settings.view`

**Error Message**: "Insufficient permissions to modify settings."

**Business Justification**: Prevents unauthorized configuration changes.

---

### CFR-003: Critical Settings Confirmation
**Rule**: Critical security and data settings require confirmation before saving.

**Validation**:
- Display warning message for critical changes
- Require explicit confirmation (checkbox or modal)
- Critical settings: Password policy, 2FA requirements, encryption, backup settings
- Confirmation cannot be bypassed

**Warning Message**: "This change affects all users. Are you sure you want to continue?"

**Business Justification**: Prevents accidental security misconfigurations.

---

### CFR-004: Settings Validation Before Save
**Rule**: All settings must pass validation checks before being persisted.

**Validation**:
- Client-side validation for immediate feedback
- Server-side validation for security and integrity
- Validation rules enforced on both sides
- Save operation fails if validation fails

**Error Message**: Specific validation error for failed rule

**Business Justification**: Ensures data integrity and system stability.

---

### CFR-005: Default Settings Restoration
**Rule**: Users must be able to restore default settings without data loss.

**Validation**:
- Reset button available on all settings pages
- Confirmation required before reset
- Reset applies to current tab/section only
- Original custom values are not persisted after reset

**Warning Message**: "Reset will discard unsaved changes. Continue?"

**Business Justification**: Provides recovery option for configuration errors.

---

## Validation Matrix

### Company Settings Validation Matrix

| Field | Required | Min Length | Max Length | Format | Unique | Default |
|-------|----------|-----------|-----------|---------|---------|---------|
| Company Name | Yes | 3 | 200 | Alphanumeric + special | Yes | - |
| Legal Name | Yes | 3 | 200 | Alphanumeric + special | No | - |
| Tax ID | Yes | 9 | 20 | Country-specific | Yes | - |
| Registration Number | No | 5 | 50 | Alphanumeric | No | - |
| Incorporation Date | No | 10 | 10 | YYYY-MM-DD | No | - |
| Website | No | 8 | 255 | HTTPS URL | No | - |
| Primary Phone | Yes | 7 | 15 | E.164 | No | - |
| Secondary Phone | No | 7 | 15 | E.164 | No | - |
| Primary Email | Yes | 5 | 255 | Email | Yes | - |
| Support Email | Yes | 5 | 255 | Email | No | - |
| Street Address | Yes | 5 | 200 | Address | No | - |
| City | Yes | 2 | 100 | Alpha | No | - |
| State | Yes | 2 | 100 | Alpha | No | - |
| Postal Code | Yes | 3 | 20 | Country-specific | No | - |
| Country | Yes | 2 | 2 | ISO 3166-1 | No | "US" |
| Logo URL | No | 8 | 255 | HTTPS URL | No | - |
| Primary Color | Yes | 7 | 7 | Hex color | No | "#000000" |
| Currency | Yes | 3 | 3 | ISO 4217 | No | "USD" |
| Timezone | Yes | 3 | 50 | IANA | No | "America/New_York" |
| Language | Yes | 2 | 2 | ISO 639-1 | No | "en" |
| Fiscal Year Start | Yes | 5 | 5 | MM-DD | No | "01-01" |
| Fiscal Year End | Yes | 5 | 5 | MM-DD | No | "12-31" |

### Security Settings Validation Matrix

| Field | Required | Min | Max | Type | Default |
|-------|----------|-----|-----|------|---------|
| Min Password Length | Yes | 6 | 32 | Number | 12 |
| Require Uppercase | Yes | - | - | Boolean | true |
| Require Lowercase | Yes | - | - | Boolean | true |
| Require Numbers | Yes | - | - | Boolean | true |
| Require Special Chars | Yes | - | - | Boolean | true |
| Password Expiry Days | Yes | 0 | 365 | Number | 90 |
| Password History Count | Yes | 0 | 24 | Number | 5 |
| 2FA Enabled | Yes | - | - | Boolean | false |
| 2FA Required | Yes | - | - | Boolean | false |
| 2FA Grace Period | Yes | 0 | 90 | Number | 7 |
| Session Timeout | Yes | 5 | 1440 | Number | 30 |
| Max Concurrent Sessions | Yes | 1 | 10 | Number | 3 |
| Max Failed Attempts | Yes | 3 | 20 | Number | 5 |
| Lockout Duration | Yes | 1 | 1440 | Number | 30 |
| Audit Log Retention | Yes | 30 | 3650 | Number | 365 |
| Encryption Algorithm | Yes | - | - | Enum | "AES-256" |

### Application Settings Validation Matrix

| Field | Required | Min | Max | Format | Default |
|-------|----------|-----|-----|---------|---------|
| Email Provider | Yes | - | - | Enum | "smtp" |
| SMTP Host | Conditional | 3 | 255 | Hostname/IP | - |
| SMTP Port | Conditional | 1 | 65535 | Number | 587 |
| SMTP User | Conditional | 1 | 255 | String | - |
| SMTP Password | Conditional | 1 | 255 | String | - |
| Encryption Type | Yes | - | - | Enum | "tls" |
| From Email | Yes | 5 | 255 | Email | - |
| From Name | Yes | 1 | 100 | String | - |
| Backup Enabled | Yes | - | - | Boolean | true |
| Backup Frequency | Yes | - | - | Enum | "daily" |
| Retention Days | Yes | 7 | 3650 | Number | 30 |
| Storage Location | Yes | - | - | Enum | "cloud" |
| API Rate Limit | Yes | 10 | 10000 | Number | 1000 |
| Cache Duration | Yes | 60 | 86400 | Number | 3600 |
| Cache Type | Yes | - | - | Enum | "redis" |

---

## Error Messages

### Validation Error Message Templates

**Format**: `{Field Name}: {Error Description}`

**Examples**:
```
Company Name: Must be 3-200 characters and contain valid business name characters.
Tax ID: Must follow country-specific format (e.g., XX-XXXXXXX for US EIN).
Primary Email: Must be a valid, unique email address.
Password Length: Must be 6-32 characters (12+ recommended).
Session Timeout: Must be 5-1440 minutes.
API Rate Limit: Must be 10-10000 requests per minute.
```

### Warning Message Templates

**Format**: `Warning: {Warning Description}`

**Examples**:
```
Warning: This change affects all active users.
Warning: Color contrast does not meet WCAG AA requirements.
Warning: Integration not tested before activation.
Warning: From email domain does not match company domain.
Warning: Data in transit encryption disabled for production.
```

### Confirmation Message Templates

**Format**: `{Action}: {Confirmation Question}`

**Examples**:
```
Security Settings: Changes may affect all users. Are you sure?
Reset Settings: This will discard unsaved changes. Continue?
Enable 2FA Required: All users will need to set up 2FA. Proceed?
Delete API Key: This action cannot be undone. Confirm?
```

---

## Compliance & Regulatory Considerations

### GDPR Compliance Rules
- Data retention periods must comply with GDPR requirements
- Audit logs must be accessible for compliance reporting
- Data encryption must meet GDPR security standards
- User consent required for certain data processing activities

### SOC 2 Compliance Rules
- Password policies must meet SOC 2 Type II requirements
- Audit logging must be comprehensive and tamper-proof
- Access controls must enforce least privilege principle
- Encryption standards must meet SOC 2 security criteria

### Industry-Specific Regulations
- **Healthcare (HIPAA)**: Enhanced encryption and audit logging required
- **Finance (PCI DSS)**: Strict password policies and MFA requirements
- **Government**: Additional security controls and access restrictions

---

## Rule Enforcement Priority

**Priority Levels**:
1. **Critical**: Security, encryption, authentication rules (cannot be bypassed)
2. **High**: Compliance, audit, data integrity rules (should not be bypassed)
3. **Medium**: Operational, format validation rules (warnings allowed)
4. **Low**: Recommendation, optimization rules (informational only)

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0 | October 21, 2025 | Documentation Team | Initial business rules documentation for general settings |

---

*This document is part of the Carmen Hospitality ERP System Administration module documentation.*
