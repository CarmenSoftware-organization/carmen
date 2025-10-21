# Notification Settings - Business Rules

**Module**: System Administration
**Feature**: Notification Settings
**Document Type**: Business Rules
**Version**: 1.0
**Last Updated**: October 21, 2025

---

## Table of Contents

1. [Global Rules](#global-rules)
2. [Notification Delivery Rules](#notification-delivery-rules)
3. [Channel-Specific Rules](#channel-specific-rules)
4. [Routing Rules](#routing-rules)
5. [Template Rules](#template-rules)
6. [Rate Limiting Rules](#rate-limiting-rules)
7. [Escalation Rules](#escalation-rules)
8. [User Preference Rules](#user-preference-rules)

---

## Global Rules

### GR-001: User Preference Override
**Priority**: High
**Category**: Configuration

**Rule**: Individual user notification preferences MUST override global default settings.

**Business Logic**:
- Global defaults apply only to new users or users who haven't customized their preferences
- When a user modifies their personal notification settings, those settings take precedence over global defaults
- System administrators cannot force global settings on users who have customized their preferences

**Example**:
```
Global Default: Purchase Request Approved → Email + In-App
User Preference: Purchase Request Approved → In-App only

Result: User receives In-App notification only
```

**Validation**:
- Check user-specific settings before applying global defaults
- Log when user preferences override global settings

**Exceptions**:
- Critical security notifications (security-alert) bypass user preferences
- System maintenance notifications cannot be disabled by users

---

### GR-002: Permission-Based Access
**Priority**: High
**Category**: Security

**Rule**: Only users with appropriate permissions can modify notification settings.

**Business Logic**:
- `system_administration.settings.notifications.view`: View notification settings
- `system_administration.settings.notifications.manage`: Modify notification settings
- `system_administration.settings.notifications.test`: Send test notifications

**Validation**:
- Permission check required before any save operation
- Audit log created for all configuration changes
- Failed permission checks logged for security monitoring

---

### GR-003: Mandatory Notification Types
**Priority**: High
**Category**: Compliance

**Rule**: Certain notification types CANNOT be completely disabled for compliance and security reasons.

**Mandatory Notifications**:
- `security-alert`: Security-related notifications
- `workflow-assignment`: Task assignments
- `system-maintenance`: Critical system updates

**Business Logic**:
- UI disables the "Disable" toggle for mandatory notifications
- At least one channel must be enabled for mandatory notifications
- Attempt to disable mandatory notifications returns validation error

---

## Notification Delivery Rules

### ND-001: Delivery Attempt Sequence
**Priority**: High
**Category**: Delivery

**Rule**: Notifications MUST be delivered in the order they are created, per user, per channel.

**Business Logic**:
1. Notifications queued in FIFO (First-In-First-Out) order
2. Each channel maintains separate delivery queue
3. Failed deliveries do not block subsequent notifications
4. Retry attempts maintain original queue position

**Example**:
```
Queue: N1 (Email), N2 (Email), N3 (Email)
N1 fails → N2 and N3 proceed
N1 retries after delay without blocking queue
```

---

### ND-002: Multi-Channel Delivery
**Priority**: Medium
**Category**: Delivery

**Rule**: When multiple channels are enabled for an event, ALL enabled channels MUST receive the notification independently.

**Business Logic**:
- Each channel delivery is independent
- Failure in one channel does not affect other channels
- Success/failure tracked separately per channel
- Delivery timestamps recorded per channel

**Example**:
```
Event: Purchase Request Approved
Channels: Email (success) + In-App (success) + SMS (failed)

Result: User sees notification in email and in-app, SMS retry scheduled
```

---

### ND-003: Delivery Confirmation
**Priority**: Medium
**Category**: Delivery

**Rule**: Delivery status MUST be tracked and recorded for all notification attempts.

**Delivery States**:
- `pending`: Queued for delivery
- `sent`: Successfully sent to channel provider
- `delivered`: Confirmed delivery (when available)
- `failed`: Delivery failed
- `bounced`: Recipient rejected (email)

**Business Logic**:
- Webhook callbacks update delivery status
- Timeout period: 5 minutes for email, 1 minute for SMS/Push
- Failed status triggers retry logic
- All status changes logged with timestamp

---

## Channel-Specific Rules

### CS-001: Email Delivery Rules
**Priority**: High
**Category**: Email Channel

**Business Rules**:

1. **Valid Email Address Required**
   - Recipient must have valid email in profile
   - Email format validated before sending
   - Bounced emails marked in user profile

2. **Subject Line Limits**
   - Maximum 150 characters
   - Special characters encoded properly
   - No empty subject lines allowed

3. **Body Size Limits**
   - HTML body: Maximum 200KB
   - Plain text fallback required
   - Attachments not supported in system notifications

4. **Unsubscribe Requirements**
   - All emails must include unsubscribe link (except security alerts)
   - One-click unsubscribe compliant
   - Unsubscribe preferences saved to user profile

**Example**:
```
Valid Email:
- Subject: "Purchase Request #PR-12345 Approved" (38 chars ✓)
- HTML + Plain text versions included ✓
- Unsubscribe link present ✓

Invalid Email:
- Subject: "" (empty ✗)
- HTML only, no plain text ✗
```

---

### CS-002: SMS Delivery Rules
**Priority**: High
**Category**: SMS Channel

**Business Rules**:

1. **Phone Number Requirements**
   - Valid phone number in international format required
   - Country code mandatory
   - Mobile numbers only (landlines not supported)

2. **Message Length Limits**
   - Maximum 160 characters per SMS
   - Long messages split into segments
   - URL shortening applied automatically

3. **Cost Awareness**
   - SMS delivery incurs cost per message
   - Daily quota enforced
   - Warning when approaching quota limit

4. **Opt-In Requirements**
   - User must explicitly enable SMS notifications
   - Initial verification SMS sent
   - Double opt-in for compliance

**Example**:
```
Valid SMS:
- Phone: +12025551234 (international format ✓)
- Message: "PR #12345 approved" (20 chars ✓)
- User opted in ✓

Invalid SMS:
- Phone: 5551234 (missing country code ✗)
- Message: 200 character message (exceeds limit ✗)
- User hasn't opted in ✗
```

---

### CS-003: In-App Notification Rules
**Priority**: Medium
**Category**: In-App Channel

**Business Rules**:

1. **Real-Time Delivery**
   - Delivered immediately when user online
   - Queued when user offline
   - Delivered on next login

2. **Notification Persistence**
   - Unread notifications persist until dismissed
   - Maximum 100 notifications displayed
   - Older notifications archived automatically

3. **Badge Counter**
   - Unread count displayed in navigation
   - Updates in real-time
   - Maximum display: 99+ for large counts

4. **Mark as Read**
   - Click notification marks as read
   - Bulk "mark all read" available
   - Read status synchronized across devices

---

### CS-004: Push Notification Rules
**Priority**: Medium
**Category**: Push Channel

**Business Rules**:

1. **Device Registration**
   - User must grant push notification permission
   - Device token registered and validated
   - Multiple devices supported per user

2. **Message Format**
   - Title: Maximum 65 characters
   - Body: Maximum 240 characters
   - Deep linking supported

3. **Priority Levels**
   - High: Security alerts, urgent workflow items
   - Normal: Standard notifications
   - Low: Digest notifications

4. **Do Not Disturb**
   - Respects device "do not disturb" settings
   - Critical notifications bypass DND
   - Quiet hours configurable per user

---

## Routing Rules

### RR-001: Rule Evaluation Order
**Priority**: High
**Category**: Routing

**Rule**: Routing rules MUST be evaluated in priority order (High → Medium → Low) until a match is found.

**Business Logic**:
1. Sort rules by priority (High, Medium, Low)
2. Within same priority, sort by creation date (oldest first)
3. Evaluate conditions from top to bottom
4. Stop at first matching rule
5. If no rules match, use default routing

**Example**:
```
Rules:
1. [High] Amount > $10,000 → CFO approval
2. [Medium] Department = Kitchen → Head Chef approval
3. [Low] All others → Department Manager approval

Purchase Request for $15,000 from Kitchen:
→ Matches Rule 1 (High priority) → Routes to CFO
(Rule 2 not evaluated even though it matches)
```

---

### RR-002: Condition Matching
**Priority**: High
**Category**: Routing

**Rule**: ALL conditions in a routing rule MUST be satisfied for the rule to match (AND logic).

**Supported Conditions**:
- Event Type: Specific notification event
- Role: User's primary role
- Department: User's department
- Amount Threshold: Numeric comparison
- Custom Fields: Additional metadata

**Business Logic**:
```typescript
function matchesRule(notification: Notification, rule: RoutingRule): boolean {
  const conditions = rule.conditions;

  if (conditions.eventType && conditions.eventType !== notification.eventType) {
    return false;
  }

  if (conditions.role && !user.roles.includes(conditions.role)) {
    return false;
  }

  if (conditions.department && user.department !== conditions.department) {
    return false;
  }

  if (conditions.amountThreshold && notification.amount < conditions.amountThreshold) {
    return false;
  }

  return true; // All conditions satisfied
}
```

---

### RR-003: Recipient Resolution
**Priority**: High
**Category**: Routing

**Rule**: Routing rules can target roles, specific users, or departments. Recipients MUST be resolved at delivery time.

**Recipient Types**:

1. **Role-Based**
   - Send to all users with specified role
   - Active users only
   - Department context applied if specified

2. **User-Based**
   - Send to specific user IDs
   - User must be active
   - Fallback to manager if user inactive

3. **Department-Based**
   - Send to all users in department
   - Optional role filter within department
   - Hierarchical department support

**Resolution Logic**:
```typescript
function resolveRecipients(rule: RoutingRule): User[] {
  switch (rule.recipients.type) {
    case 'role':
      return getUsersByRole(rule.recipients.values);

    case 'user':
      return getUsersByIds(rule.recipients.values)
        .filter(u => u.isActive);

    case 'department':
      return getUsersByDepartment(rule.recipients.values);
  }
}
```

---

## Template Rules

### TR-001: Variable Substitution
**Priority**: High
**Category**: Templates

**Rule**: All template variables MUST be replaced with actual values before sending notifications.

**Variable Syntax**: `{{variableName}}`

**Standard Variables**:
- `{{userName}}`: Recipient's full name
- `{{documentNumber}}`: Document reference number
- `{{amount}}`: Formatted amount with currency
- `{{requesterName}}`: Name of person who initiated action
- `{{actionDate}}`: Date of action
- `{{actionUrl}}`: Deep link to document

**Business Logic**:
1. Parse template for variable placeholders
2. Validate all required variables have values
3. Apply formatting rules (currency, dates)
4. Replace placeholders with actual values
5. Handle missing variables with fallback text

**Example**:
```
Template:
"Hello {{userName}}, {{requesterName}} submitted {{documentNumber}} for {{amount}}."

Data:
{ userName: "John", requesterName: "Sarah", documentNumber: "PR-12345", amount: "$1,500" }

Output:
"Hello John, Sarah submitted PR-12345 for $1,500."
```

**Fallback Handling**:
```
Missing variable: {{userName}}
Fallback: "Hello, Sarah submitted PR-12345 for $1,500."
```

---

### TR-002: HTML Sanitization
**Priority**: High
**Category**: Security

**Rule**: All user-provided content in templates MUST be sanitized to prevent XSS attacks.

**Sanitization Rules**:
1. Remove all `<script>` tags
2. Remove dangerous attributes (`onclick`, `onerror`, etc.)
3. Allow safe HTML tags (`<p>`, `<strong>`, `<em>`, `<a>`, etc.)
4. Validate URLs in `href` and `src` attributes
5. Encode special characters

**Allowed Tags**:
- Text formatting: `<p>`, `<h1-h6>`, `<strong>`, `<em>`, `<u>`
- Links: `<a href="...">`
- Lists: `<ul>`, `<ol>`, `<li>`
- Tables: `<table>`, `<tr>`, `<td>`, `<th>`
- Other: `<br>`, `<hr>`, `<div>`, `<span>`

---

## Rate Limiting Rules

### RL-001: Per-User Rate Limits
**Priority**: High
**Category**: Rate Limiting

**Rule**: Individual users MUST NOT receive more notifications than the configured per-user hourly limit.

**Default Limits**:
- Per user per hour: 50 notifications
- Configurable range: 1-1000

**Business Logic**:
1. Track notification count per user per hour (rolling window)
2. Increment counter on each notification attempt
3. If limit reached, queue notification for next hour
4. Reset counter after rolling hour passes
5. Critical notifications exempt from limit

**Example**:
```
Limit: 50 per hour
Current count: 49
New notification arrives → Delivered (count: 50)
Next notification arrives → Queued for next hour

Critical security alert arrives → Delivered immediately (exempt)
```

**Priority Handling**:
- Critical notifications: Bypass limit
- High priority: Delivered if < 90% of limit
- Normal priority: Delivered if < 100% of limit
- Low priority: Queued if at limit

---

### RL-002: Organization Rate Limits
**Priority**: High
**Category**: Rate Limiting

**Rule**: The total number of notifications sent organization-wide MUST NOT exceed the configured hourly limit.

**Default Limits**:
- Organization per hour: 10,000 notifications
- Configurable range: 100-100,000

**Business Logic**:
1. Track total notification count across all users (rolling window)
2. Apply organization limit before per-user limit
3. Priority queuing when approaching limit
4. Administrative notifications prioritized

**Quota Allocation**:
- Critical notifications: 10% of quota reserved
- Administrative: 20% of quota reserved
- User notifications: 70% of quota

**Warning Thresholds**:
- 75% quota used: Warning to administrators
- 90% quota used: Alert to administrators
- 100% quota used: Queue normal priority notifications

---

### RL-003: Channel-Specific Quotas
**Priority**: Medium
**Category**: Rate Limiting

**Rule**: Each notification channel MUST respect its configured daily quota.

**Default Quotas**:
- Email: 100,000 per day
- SMS: 10,000 per day
- Push: 1,000,000 per day
- Webhook: Unlimited

**Business Logic**:
1. Track usage per channel per day
2. Reset quota at midnight UTC
3. Reject delivery when quota exhausted
4. Fall back to alternative channels if configured

**Fallback Logic**:
```
Primary: SMS (quota exhausted)
Fallback: Email (available) → Deliver via email
If Email also exhausted → In-App (available) → Deliver via in-app
```

---

## Escalation Rules

### ER-001: Time-Based Escalation
**Priority**: High
**Category**: Escalation

**Rule**: If a notification requiring action is not acknowledged within the configured time, it MUST be escalated to the next level.

**Escalation Triggers**:
- Workflow approval not actioned
- Critical alert not acknowledged
- Time-sensitive notification ignored

**Business Logic**:
1. Start escalation timer when notification delivered
2. Monitor for acknowledgment/action
3. If no response within delay period, escalate
4. Send notification to escalation recipients
5. Log escalation event
6. Repeat escalation up to 3 levels

**Example**:
```
Purchase Request approval sent to Manager
Delay: 4 hours
No response after 4 hours → Escalate to Department Head
Still no response after 4 more hours → Escalate to CFO
```

**Escalation Levels**:
- Level 1: Direct manager (immediate)
- Level 2: Department head (4 hours)
- Level 3: Executive (8 hours from level 2)

---

### ER-002: Priority-Based Escalation
**Priority**: Medium
**Category**: Escalation

**Rule**: Higher priority notifications have shorter escalation timeframes.

**Escalation Delays by Priority**:
- Critical: 1 hour
- High: 4 hours
- Medium: 8 hours
- Low: 24 hours

**Business Logic**:
- Critical items escalate quickly
- Low priority items allow more time for response
- Manual escalation always allowed
- Weekend/holiday delays configurable

---

## User Preference Rules

### UP-001: Opt-Out Restrictions
**Priority**: High
**Category**: User Preferences

**Rule**: Users MAY opt out of non-critical notifications but MUST receive critical notifications.

**Opt-Out Allowed**:
- Procurement notifications
- Inventory notifications
- Vendor notifications
- Finance notifications (non-urgent)

**Opt-Out NOT Allowed**:
- Security alerts
- System maintenance
- Workflow assignments
- Compliance notifications

**Business Logic**:
```typescript
function canOptOut(eventType: NotificationEventType): boolean {
  const mandatoryTypes = [
    'security-alert',
    'system-maintenance',
    'workflow-assignment',
  ];

  return !mandatoryTypes.includes(eventType);
}
```

---

### UP-002: Frequency Preferences
**Priority**: Medium
**Category**: User Preferences

**Rule**: Users can choose notification frequency for supported event types.

**Frequency Options**:
- **Instant**: Deliver immediately
- **Hourly Digest**: Batch notifications hourly
- **Daily Digest**: Batch notifications daily (8 AM local time)
- **Weekly Digest**: Batch notifications weekly (Monday 8 AM)

**Digest Rules**:
1. Collect notifications within time window
2. Combine into single digest message
3. Deliver at scheduled time
4. Include up to 50 notifications per digest
5. Link to view all notifications

**Example Digest**:
```
Daily Digest - October 21, 2025

You have 12 new notifications:
- 5 Purchase Requests pending approval
- 3 Low stock alerts
- 2 Vendor price updates
- 2 Comments on your documents

View all notifications →
```

**Instant Delivery Override**:
- Critical notifications always instant
- User-mentioned notifications always instant
- Workflow assignments always instant

---

## Validation Rules

### VR-001: Configuration Validation
**Priority**: High
**Category**: Validation

**Rule**: All notification settings MUST be validated before saving.

**Validation Checks**:

1. **Rate Limiting**
   - Per-user limit: 1-1,000
   - Organization limit ≥ per-user limit
   - Values must be positive integers

2. **Retry Policy**
   - Max retries: 0-10
   - Initial delay: 10-3,600 seconds
   - Backoff multiplier: 1.0-10.0

3. **Batching**
   - Window: 1-60 minutes
   - Max batch size: 1-100

4. **Channel Configuration**
   - Email: Valid SMTP settings if custom provider
   - SMS: Valid API key and provider
   - Push: Valid FCM/APNS credentials
   - Webhook: Valid HTTPS URLs only

**Validation Error Handling**:
```typescript
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

function validate(settings: DeliverySettings): ValidationError[] {
  const errors: ValidationError[] = [];

  if (settings.rateLimiting.perUserPerHour < 1) {
    errors.push({
      field: 'rateLimiting.perUserPerHour',
      message: 'Must be at least 1',
      severity: 'error'
    });
  }

  return errors;
}
```

---

## Compliance Rules

### CR-001: Data Retention
**Priority**: High
**Category**: Compliance

**Rule**: Notification history MUST be retained for compliance and audit purposes.

**Retention Periods**:
- Active notifications: Indefinite
- Delivered notifications: 12 months
- Failed notifications: 6 months
- Test notifications: 30 days

**Archival Rules**:
- Auto-archive after retention period
- Archived data accessible for audit
- Permanent deletion after 7 years
- Export capability for compliance requests

---

### CR-002: Audit Logging
**Priority**: High
**Category**: Compliance

**Rule**: All notification configuration changes MUST be logged for audit purposes.

**Logged Events**:
- Settings modifications (who, what, when)
- Template changes
- Routing rule updates
- Channel configuration changes
- Test notification sends

**Audit Log Fields**:
- Timestamp
- User ID and name
- Action type
- Before/after values
- IP address
- Session ID

---

## Exception Handling

### EH-001: Delivery Failure Handling
**Priority**: High
**Category**: Error Handling

**Rule**: Failed notification deliveries MUST be handled gracefully with appropriate retry logic.

**Failure Categories**:

1. **Temporary Failures** (Retry automatically)
   - Network timeouts
   - Rate limit exceeded
   - Service temporarily unavailable

2. **Permanent Failures** (Do not retry)
   - Invalid recipient address
   - Blocked recipient
   - Invalid credentials

3. **Partial Failures** (Retry failed channels only)
   - Email delivered, SMS failed
   - Multiple recipients, some failed

**Retry Logic**:
```
Attempt 1: Immediate
Attempt 2: After initial delay (60s)
Attempt 3: After delay * backoff (120s)
Attempt 4: After delay * backoff^2 (240s)
Max attempts: 3

After max attempts: Mark as permanently failed, notify administrators
```

---

## Summary

These business rules ensure:
- Reliable and consistent notification delivery
- User privacy and preference respect
- System performance and scalability
- Security and compliance
- Graceful error handling
- Comprehensive audit capabilities

All rules are enforced at both the application and database levels to ensure data integrity and business logic compliance.

---

*Last Updated: October 21, 2025*
