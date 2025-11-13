# BR-SYSADMIN: System Administration Business Requirements

**Module**: System Administration
**Sub-Module**: ABAC Permission Management, User Management, Workflow Configuration
**Document Type**: Business Requirements (BR)
**Version**: 1.0.0
**Last Updated**: 2025-11-13
**Status**: Draft

---

## 1. Overview

### 1.1 Purpose
Define business requirements for System Administration, focusing on Attribute-Based Access Control (ABAC) permission management, user lifecycle management, workflow configuration, and organizational structure management for hospitality operations.

### 1.2 Scope
- Dynamic ABAC permission system with JSON-based policies
- User management with role assignments and contextual access
- Workflow configuration for approval processes
- Location and department management
- Subscription and package management
- Audit logging and compliance tracking

### 1.3 Stakeholders
- **IT Manager**: System configuration and security
- **General Manager**: User access oversight
- **Department Managers**: Team access and workflow configuration
- **Chief Engineer**: Technical integration
- **Financial Controller**: Approval limit management

---

## 2. Functional Requirements

### FR-SYSADMIN-001: Dynamic Policy Management
**Priority**: High
**User Story**: As an IT Manager, I want to create and manage flexible attribute-based access policies so that I can control permissions based on user attributes, resource properties, and environmental conditions.

**Requirements**:
- Create policies with PERMIT/DENY effects
- Define policies using JSON structure for flexibility
- Set policy priority (0-1000) for evaluation order
- Configure combining algorithms (DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, ONLY_ONE_APPLICABLE)
- Support policy status (DRAFT, ACTIVE, INACTIVE, ARCHIVED)
- Version control for policy changes
- Set validity periods (validFrom, validTo)
- Tag policies for categorization

**Acceptance Criteria**:
- Policy JSON structure includes target, rules, obligations, and advice sections
- Policies evaluated in priority order
- Status transitions follow approval workflow
- Historical versions preserved

### FR-SYSADMIN-002: Dynamic Resource Definitions
**Priority**: High
**User Story**: As an IT Manager, I want to define resource types dynamically so that I can add new modules and features without code changes.

**Requirements**:
- Define resource types with unique identifiers (e.g., "purchase_request", "inventory_item")
- Specify available actions per resource type (view, create, approve, delete)
- Configure resource attributes for policy evaluation
- Define workflow stages for each resource type
- Set classification levels (public, internal, confidential, restricted)
- Categorize resources (procurement, inventory, financial)

**Acceptance Criteria**:
- Resource definitions stored as JSON
- Actions support conditional requirements (e.g., approval limits)
- Attributes typed (string, number, boolean, date)
- Active/inactive toggle for resource types

### FR-SYSADMIN-003: Role-Based Access with Hierarchy
**Priority**: High
**User Story**: As an IT Manager, I want to define roles with hierarchical inheritance so that managers inherit permissions from staff roles while adding management capabilities.

**Requirements**:
- Create roles with unique names and display names
- Build role hierarchy with parent-child relationships
- Store role attributes as JSON (department, clearanceLevel, approvalLimit, locations, shifts)
- Define base permissions per role
- Inherit permissions from parent roles with ability to override
- Set time and location restrictions per role
- Assign colors and icons for UI display

**Acceptance Criteria**:
- Roles support multi-level hierarchy
- Child roles inherit parent permissions
- Override mechanism for specific permissions
- System roles protected from modification
- Role path stored as hierarchical string (e.g., "/admin/manager/supervisor")

### FR-SYSADMIN-004: User Profile Management
**Priority**: High
**User Story**: As a General Manager, I want to manage user profiles with complete attribute storage so that access decisions can consider all relevant user context.

**Requirements**:
- Store user profile (firstName, lastName, employeeId, hireDate, phone, emergency contact)
- Maintain user context (primaryRole, department, location, clearanceLevel, activeShift, timezone)
- Configure user attributes (approvalLimit, weekendAccess, mobileAccess, specializations, certifications)
- Set user preferences (language, dateFormat, timeFormat, currency, notifications)
- Track user status (active, inactive, suspended)
- Record last login timestamp

**Acceptance Criteria**:
- User data stored as JSON for flexibility
- All attributes available for policy evaluation
- User status controls system access
- Profile updates audited

### FR-SYSADMIN-005: Contextual Role Assignment
**Priority**: High
**User Story**: As a Department Manager, I want to assign roles to users with specific context so that access is scoped to relevant departments, locations, and time periods.

**Requirements**:
- Assign multiple roles to single user
- Designate one role as primary
- Scope assignment to specific departments and locations
- Set effective date ranges for assignments
- Configure work shift restrictions
- Set custom approval limits per assignment
- Attach training and certification requirements
- Allow delegated authorities per assignment

**Acceptance Criteria**:
- Context stored as JSON
- Multiple active assignments per user
- Time-based activation/deactivation
- Scope enforcement in policy evaluation

### FR-SYSADMIN-006: Dynamic Attribute Management
**Priority**: High
**User Story**: As an IT Manager, I want to store and manage attributes for subjects, resources, and environment so that policies can evaluate complex conditions.

**Requirements**:
- Store attributes for subjects (users), resources, and environment
- Support multiple data types (string, number, boolean, datetime, array)
- Compute derived attributes from base values
- Set confidence scores for attribute values
- Track attribute sources and verification methods
- Apply temporal validity to attributes
- Define allowed values and validation rules

**Acceptance Criteria**:
- Attributes stored with metadata and constraints
- Support for global and entity-specific attributes
- Attribute updates audited
- Context and scope define applicability

### FR-SYSADMIN-007: Access Request Evaluation
**Priority**: High
**User Story**: As a Chef, I want my access requests to be evaluated quickly and accurately so that I can perform my duties without delays.

**Requirements**:
- Evaluate access requests with complete context (subject, resource, action, environment)
- Apply applicable policies in priority order
- Execute policy rules and conditions
- Generate decision (PERMIT, DENY, NOT_APPLICABLE, INDETERMINATE)
- Return obligations that must be fulfilled
- Provide advice and recommendations
- Cache decisions for performance
- Record evaluation time and metrics

**Acceptance Criteria**:
- Evaluation completes <50ms for cached decisions
- Evaluation completes <200ms for non-cached decisions
- Decision includes confidence score
- Applicable policies identified
- Debug information available for troubleshooting

### FR-SYSADMIN-008: Workflow Configuration
**Priority**: High
**User Story**: As a Department Manager, I want to configure approval workflows with stages and routing rules so that purchase requests follow the right approval path.

**Requirements**:
- Define workflow with multiple stages
- Assign users to each stage with role types (requester, purchaser, approver, reviewer)
- Set SLA per stage (hours, days)
- Configure available actions per stage (approve, reject, send back, skip)
- Hide sensitive fields (pricePerUnit, totalPrice) by stage
- Define routing rules with conditions (field, operator, value)
- Configure routing actions (SKIP_STAGE, NEXT_STAGE)
- Set up notifications per event (onSubmit, onApprove, onReject, onSendBack, onSLA)

**Acceptance Criteria**:
- Workflow supports flexible stage sequence
- Routing evaluates conditions and applies actions
- SLA tracked and alerts triggered
- Notifications sent via configured channels (Email, System)
- Stage assignments consider user department and location

### FR-SYSADMIN-009: Location and Department Management
**Priority**: High
**User Story**: As a General Manager, I want to manage locations and departments hierarchically so that access can be scoped appropriately.

**Requirements**:
- Define locations with types (hotel, restaurant, warehouse, office, kitchen)
- Store location address and coordinates
- Support parent-child location hierarchy
- Create departments with codes and descriptions
- Set department status (active, inactive)
- Assign department manager
- Link department to cost center
- Support parent-child department hierarchy
- Assign users to departments

**Acceptance Criteria**:
- Location hierarchy supports unlimited depth
- Departments support parent-child relationships
- Department status controls visibility and access
- User assignments tracked per department
- Manager designation per department

### FR-SYSADMIN-010: Subscription Package Management
**Priority**: High
**User Story**: As an IT Manager, I want to manage subscription packages so that access is limited based on the organization's plan.

**Requirements**:
- Configure subscription packages (BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM)
- Set limits (maxUsers, maxLocations, maxDepartments, maxPolicies, maxRoles, maxResourceTypes)
- Enable/disable modules per package
- Track usage against limits (currentUsers, currentLocations, currentPolicies, storageUsed, apiCallsThisMonth)
- Configure billing information
- Set subscription timeline (start, end dates)
- Auto-renewal configuration

**Acceptance Criteria**:
- System enforces subscription limits
- Usage tracked in real-time
- Alerts when approaching limits
- Subscription status affects access

### FR-SYSADMIN-011: Comprehensive Audit Logging
**Priority**: High
**User Story**: As a Financial Controller, I want all permission-related activities logged so that I can audit access and ensure compliance.

**Requirements**:
- Log all policy operations (CREATE, UPDATE, ACTIVATE, DEACTIVATE, DELETE)
- Log all access requests with full context
- Log policy evaluations with decision details
- Log role and user assignments
- Store actor information (userId, sessionId, ipAddress, userAgent)
- Record action details (actionType, resource, resourceId, resourceName)
- Capture changes (oldValues, newValues, fieldsChanged)
- Set retention periods based on compliance requirements
- Tag logs with compliance flags (GDPR, HIPAA, SOX)

**Acceptance Criteria**:
- All write operations audited
- Audit logs immutable
- 7-year retention for financial logs
- Search and filter capabilities
- Export for compliance reports

### FR-SYSADMIN-012: Policy Testing Framework
**Priority**: Medium
**User Story**: As an IT Manager, I want to test policies before activation so that I can ensure they work correctly.

**Requirements**:
- Create test scenarios with input (subject, resource, action, environment)
- Define expected output (decision, obligations, advice)
- Execute tests against policies
- Compare actual vs expected results
- Calculate test pass/fail and score
- Group tests into test runs
- Track test execution history
- Categorize tests (smoke, regression, edge-case)

**Acceptance Criteria**:
- Tests execute without affecting production
- Test results show detailed comparison
- Failed tests highlight specific mismatches
- Test scenarios reusable across policy versions

### FR-SYSADMIN-013: Performance Monitoring
**Priority**: Medium
**User Story**: As an IT Manager, I want to monitor policy performance so that I can optimize slow evaluations.

**Requirements**:
- Track policy evaluation metrics (totalEvaluations, averageTime, maxTime, minTime)
- Monitor decision breakdown (permitCount, denyCount, errorCount)
- Track cache performance (hit rate, size, evictions)
- Analyze resource and action patterns
- Measure rule effectiveness and policy relevance
- Aggregate metrics by time period (hourly, daily, weekly, monthly)
- Generate performance reports

**Acceptance Criteria**:
- Metrics collected without impacting performance
- Dashboard shows real-time statistics
- Historical trends available
- Alerts for performance degradation

---

## 3. Business Rules

### BR-SYSADMIN-001: Policy Evaluation Order
**Rule**: Policies evaluated in descending priority order (highest priority first). If multiple policies match, combining algorithm determines final decision.

### BR-SYSADMIN-002: Role Hierarchy Inheritance
**Rule**: Child roles automatically inherit parent role permissions unless explicitly overridden. Maximum role hierarchy depth: 10 levels.

### BR-SYSADMIN-003: Single Primary Role
**Rule**: Each user must have exactly one primary role. Primary role determines default permissions and UI experience.

### BR-SYSADMIN-004: Approval Limit Enforcement
**Rule**: User approval limits must not exceed their role's maximum approval limit. Limits enforced in base currency (USD).

### BR-SYSADMIN-005: Subscription Limit Enforcement
**Rule**: System must prevent operations that would exceed subscription limits (users, locations, policies, etc.). Hard stop, not soft warning.

### BR-SYSADMIN-006: Audit Log Immutability
**Rule**: Audit logs cannot be modified or deleted. Records retained per compliance requirements (minimum 7 years for financial transactions).

### BR-SYSADMIN-007: Policy Status Transitions
**Rule**: Policy status transitions must follow: DRAFT → ACTIVE → INACTIVE → ARCHIVED. Cannot skip states. ACTIVE policies require approval.

### BR-SYSADMIN-008: Contextual Assignment Scope
**Rule**: Role assignments with scope restrictions (department, location, time) only grant access within defined boundaries.

### BR-SYSADMIN-009: Cache Invalidation
**Rule**: Permission cache must be invalidated when: (1) policy updated, (2) role assignment changed, (3) user attributes modified, (4) cache TTL expired.

### BR-SYSADMIN-010: Attribute Data Types
**Rule**: Attribute values must match declared data type. Type coercion not permitted. Invalid types reject evaluation.

### BR-SYSADMIN-011: Environment Attribute Refresh
**Rule**: Environment attributes (current_time, location, threat_level) must be refreshed on each access request evaluation.

### BR-SYSADMIN-012: Workflow Stage Assignment
**Rule**: Users can only be assigned to workflow stages within their authorized departments and locations.

### BR-SYSADMIN-013: SLA Calculation
**Rule**: Stage SLA countdown starts when stage becomes active. Business hours only (excludes weekends and holidays) unless configured otherwise.

### BR-SYSADMIN-014: Notification Delivery
**Rule**: Notifications sent to all configured channels (Email, System). Delivery failures retried 3 times with exponential backoff.

### BR-SYSADMIN-015: Location Hierarchy
**Rule**: Users assigned to parent location automatically have access to all child locations unless explicitly restricted.

### BR-SYSADMIN-016: Department Manager Authority
**Rule**: Department managers automatically have elevated approval authority for their department's transactions within configured limits.

### BR-SYSADMIN-017: System Role Protection
**Rule**: System-defined roles (admin, system_operator) cannot be deleted or have core permissions removed. Can only be deactivated.

### BR-SYSADMIN-018: Policy Conflict Resolution
**Rule**: When multiple policies apply with conflicting effects, combining algorithm determines result. DENY_OVERRIDES is default (DENY takes precedence over PERMIT).

### BR-SYSADMIN-019: Emergency Access Override
**Rule**: Emergency access requests bypass normal policy evaluation but are logged with high priority for immediate review.

---

## 4. Non-Functional Requirements

### NFR-SYSADMIN-001: Performance
- Policy evaluation: <50ms (cached), <200ms (non-cached)
- User search: <100ms for 1000 users
- Workflow configuration save: <500ms
- Audit log write: <10ms (async)

### NFR-SYSADMIN-002: Scalability
- Support 10,000+ users per organization
- Support 1,000+ active policies
- Support 100+ concurrent access evaluations
- Handle 1M+ audit log entries per month

### NFR-SYSADMIN-003: Availability
- System administration functions: 99.9% uptime
- Access evaluation service: 99.95% uptime
- Maximum planned downtime: 4 hours/month

### NFR-SYSADMIN-004: Security
- All sensitive data encrypted at rest (AES-256)
- All API calls use TLS 1.3
- Password policies enforced (12+ chars, complexity)
- Multi-factor authentication for admin functions
- Session timeout: 30 minutes inactivity

### NFR-SYSADMIN-005: Usability
- New administrator onboarding: <1 hour
- Policy creation: <5 minutes for simple policy
- User assignment: <2 minutes per user
- Mobile-responsive admin interface

### NFR-SYSADMIN-006: Compliance
- GDPR compliance for user data
- SOX compliance for audit trails
- ISO 27001 security standards
- Regular security audits quarterly

---

## 5. Assumptions and Constraints

### Assumptions
- Organization has designated IT Manager or System Administrator
- Users have unique email addresses
- Network connectivity available for cloud-based services
- Sufficient storage for 7-year audit log retention

### Constraints
- Maximum policy evaluation time: 5 seconds (hard timeout)
- Maximum role hierarchy depth: 10 levels
- Subscription limits enforced per package tier
- Audit log retention minimum: 7 years

---

## 6. Dependencies

- **Account Code Mapping**: GL accounts for department cost centers
- **Finance Module**: Approval limits validated against budget
- **All Modules**: Depend on permission system for access control
- **External Services**: Email service for notifications, SMS for alerts

---

**Document End**
