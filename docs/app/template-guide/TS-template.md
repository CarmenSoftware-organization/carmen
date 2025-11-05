# Technical Specification: {Sub-Module Name}

## Module Information
- **Module**: {Module Name}
- **Sub-Module**: {Sub-Module Name}
- **Route**: {Application Route Path}
- **Version**: 1.0.0
- **Last Updated**: {YYYY-MM-DD}
- **Owner**: {Team/Person Name}
- **Status**: Draft | Review | Approved | Deprecated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | {YYYY-MM-DD} | {Author} | Initial version |

---

## Overview

{Provide technical overview of the implementation. How does this sub-module work technically? What technologies are used? How does it fit into the overall architecture?}

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Definition) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-template.md) - Requirements in text format (no code)
- [Use Cases](./UC-template.md) - Use cases in text format (no code)
- [Data Definition](./DD-template.md) - Data definitions in text format (no SQL code)
- [Flow Diagrams](./FD-template.md) - Visual diagrams (no code)
- [Validations](./VAL-template.md) - Validation rules in text format (no code)

---

## Architecture

### High-Level Architecture

{Describe the architectural pattern used. Include diagram if helpful.}

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────┐
│  Next.js    │
│   Server    │
├─────────────┤
│   React     │
│ Components  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Supabase  │
│  Database   │
└─────────────┘
```

### Component Architecture

{Describe major components and their relationships}

- **Frontend Layer**
  - Page Components
  - UI Components
  - State Management
  - API Client

- **Backend Layer**
  - API Routes / Server Actions
  - Business Logic
  - Data Access Layer
  - External Integrations

- **Data Layer**
  - Database Tables
  - Views
  - Stored Procedures
  - Triggers

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: Zustand, React Query
- **Form Handling**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js Server Actions / API Routes
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma (if applicable)
- **Authentication**: NextAuth.js / Supabase Auth
- **File Storage**: Supabase Storage

### Testing
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **API Tests**: Supertest

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel
- **Monitoring**: {Tool name}

---

## Component Structure

### Directory Structure

```
app/(main)/{module}/{sub-module}/
├── page.tsx                      # Main page component
├── [id]/
│   └── page.tsx                  # Detail page
├── components/
│   ├── {SubModule}List.tsx       # List component
│   ├── {SubModule}Detail.tsx     # Detail component
│   ├── {SubModule}Form.tsx       # Form component
│   ├── {SubModule}Filters.tsx    # Filter component
│   └── ...
├── types.ts                      # TypeScript types
├── actions.ts                    # Server actions
├── api.ts                        # API client functions
└── hooks/
    ├── use{SubModule}.ts         # Custom hooks
    └── ...
```

### Key Components

#### Page Component
**File**: `page.tsx`
**Purpose**: {Main page purpose}
**Responsibilities**:
- Render main page layout
- Fetch initial data via server actions
- Handle client-side routing
- Manage page-level state

#### List Component
**File**: `components/{SubModule}List.tsx`
**Purpose**: {Display list of items}
**Responsibilities**:
- Display paginated list of entities
- Handle sorting and filtering
- Manage selection state
- Trigger actions (view, edit, delete)
**Props**: Accepts array of items, selection handler, filter state

#### Form Component
**File**: `components/{SubModule}Form.tsx`
**Purpose**: {Create/edit form}
**Responsibilities**:
- Render form fields with validation
- Handle form submission
- Display validation errors
- Support draft saving
**Props**: Accepts initial data (for edit mode), submit handler, cancel handler

---

## Data Flow

### Read Operations

```
User Action
    ↓
Component
    ↓
React Query (cache check)
    ↓ (cache miss)
API Client Function
    ↓
Server Action / API Route
    ↓
Data Access Layer
    ↓
Database Query
    ↓
Return Data
    ↓
Cache Update
    ↓
Component Update
```

### Write Operations

```
User Submits Form
    ↓
Form Validation (Client)
    ↓
Server Action
    ↓
Validation (Server)
    ↓
Business Logic
    ↓
Database Transaction
    ↓
Success Response
    ↓
Cache Invalidation
    ↓
UI Update / Redirect
```

---

## Server Actions

### Overview
Server actions are located in `actions.ts` and handle all server-side operations including data validation, business logic execution, and database transactions.

### Create Operations

#### create{Entity}
**Purpose**: Create new entity
**Input**: Entity data conforming to input schema
**Validation**: Zod schema validation on server
**Returns**: Success result with created entity or error response
**Errors**: Validation errors, database constraint violations, business rule violations

### Read Operations

#### get{Entity}ById
**Purpose**: Fetch single entity by ID
**Input**: Entity UUID
**Returns**: Entity object or null if not found
**Authorization**: Check user has permission to view entity

#### list{Entities}
**Purpose**: Fetch filtered list of entities
**Input**: Filter options (status, date range, department, etc.)
**Returns**: Array of entities matching filters
**Pagination**: Supports page size and offset parameters

### Update Operations

#### update{Entity}
**Purpose**: Update existing entity
**Input**: Entity ID and partial entity data
**Validation**: Validate changed fields only
**Returns**: Updated entity or error response
**Concurrency**: Version checking to prevent concurrent update conflicts

### Delete Operations

#### delete{Entity}
**Purpose**: Soft delete or hard delete entity
**Input**: Entity ID
**Validation**: Check entity can be deleted (no dependencies)
**Returns**: Success confirmation or error response

---

## Database Schema

**NOTE**: Detailed database definitions are documented in the [Data Definition (DD) document](./DD-template.md). This section provides a high-level overview only.

### Tables Overview

#### {table_name}
**Purpose**: {What this table stores}
**Key Fields**:
- Primary key: UUID identifier
- Core business fields: {list main fields}
- Status field: Tracks entity lifecycle
- Foreign keys: References to related tables
- Audit fields: created_at, created_by, updated_at, updated_by

**Indexes**: Indexes created on frequently queried fields (status, dates, foreign keys)
**Constraints**: Business rule constraints enforced at database level

### Views
Database views provide pre-joined data and calculated fields for common queries. Views simplify complex queries and improve performance.

### Stored Procedures
Stored procedures encapsulate complex business logic and multi-step operations at the database level for performance and consistency.

---

## State Management

### Global State (Zustand)

**Purpose**: Manage UI state that needs to be shared across multiple components
**Usage**: Used for filters, selected items, UI preferences, sidebar state
**Store Structure**:
- State properties: items array, selected item, filter state, UI flags
- Action methods: setters for state updates, filter updates, selection handlers
**When to Use**: Cross-component UI state, user preferences, temporary selections

### Server State (React Query)

**Purpose**: Manage server data with automatic caching and revalidation
**Query Keys**: Hierarchical key structure for cache invalidation
**Cache Strategy**: Stale-while-revalidate pattern
**Hooks Pattern**: Custom hooks wrap useQuery for each data type
**Invalidation**: Manual invalidation on mutations, automatic background refetch

---

## Security Implementation

### Authentication
{How authentication is implemented}

- Session management
- Token handling
- Refresh mechanism

### Authorization
{How authorization is enforced}

- Role-based access control
- Permission checks
- Resource-level security

### Data Protection
{How data is protected}

- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Audit Logging
All write operations are logged to audit trail including:
- Action type (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- Entity type and ID
- User ID and timestamp
- Changes made (before/after values)
- IP address and session information

---

## Error Handling

### Client-Side Error Handling

**Try-Catch Pattern**: All server action calls wrapped in try-catch blocks
**User Feedback**: Toast notifications for success and error messages
**Error Display**: Inline validation errors on form fields
**Navigation**: Redirect on success, stay on page with errors
**Error Types Handled**:
- Validation errors: Display field-specific messages
- Authorization errors: Redirect to login or show access denied
- Network errors: Show retry option
- Generic errors: User-friendly message with support contact

### Server-Side Error Handling

**Validation Layer**: Zod schema validation before business logic
**Error Response Pattern**: Structured response with success flag, data or error message
**Error Logging**: All errors logged with context for debugging
**Database Transaction Rollback**: Automatic rollback on error
**Error Types**:
- ValidationError: Input validation failures
- AuthorizationError: Permission denied
- NotFoundError: Resource not found
- ConflictError: Duplicate or constraint violation
- DatabaseError: Database operation failures
- NetworkError**: External service connectivity issues

---

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for large components
- **Lazy Loading**: Load data on demand
- **Memoization**: useMemo, useCallback for expensive operations
- **Virtualization**: For long lists
- **Debouncing**: Search and filter inputs

### Backend Optimization
- **Database Indexing**: Proper indexes on frequently queried fields
- **Query Optimization**: Efficient SQL queries
- **Caching**: React Query cache, server-side caching
- **Pagination**: Limit data returned per request
- **Batch Operations**: Reduce round trips

### Pagination Implementation

**Approach**: Server-side pagination with page number and page size parameters
**Calculation**: Calculate offset based on page and page size
**Query**: Parallel queries for data and total count
**Response**: Return data with pagination metadata (total, page, pageSize, totalPages)

---

## Testing Strategy

### Unit Tests

**Location**: `__tests__/unit/`
**Framework**: Vitest
**Coverage Target**: >80%
**Focus**:
- Test server actions with mock database
- Test business logic functions
- Test validation schemas
- Test utility functions
**Patterns**:
- Describe blocks group related tests
- Test success cases and error cases
- Mock external dependencies
- Use test fixtures for consistent data

### Integration Tests

**Location**: `__tests__/integration/`
**Framework**: Vitest with test database
**Coverage Target**: >70%
**Focus**:
- Test complete CRUD workflows
- Test database queries and transactions
- Test data validation at integration level
- Test error handling with real database
**Setup**: Test database setup before each test, cleanup after

### E2E Tests

**Location**: `e2e/`
**Framework**: Playwright
**Focus**:
- Test critical user workflows end-to-end
- Test cross-browser compatibility
- Test responsive design
- Test form submissions and validations
**Execution**: Run on staging before production deployment
**Patterns**:
- Use data-testid attributes for element selection
- Test happy paths and error paths
- Verify user feedback (messages, redirects)
- Take screenshots on failure

---

## Deployment Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."

# External Services
{SERVICE}_API_KEY="..."
{SERVICE}_API_URL="..."
```

### Build Configuration

Next.js configuration includes module-specific settings such as:
- Environment variable declarations
- Webpack customizations (if needed)
- Redirect rules
- Header configurations

### Database Migrations

```bash
# Create migration
npm run db:migrate:create {migration-name}

# Run migrations
npm run db:migrate

# Rollback
npm run db:migrate:rollback
```

---

## Dependencies

### npm Packages

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.0.0 | UI library |
| next | ^14.0.0 | Framework |
| @tanstack/react-query | ^5.0.0 | Server state |
| zod | ^3.0.0 | Validation |
| ... | ... | ... |

### Internal Dependencies

- **Module**: {Dependent module name and reason}
- **Component**: {Shared component usage}
- **Utility**: {Shared utility functions}

---

## Monitoring and Logging

### Application Logging

All significant operations are logged using centralized logging utility:
- Info level: Successful operations with context
- Warning level: Recoverable errors or unusual conditions
- Error level: Failed operations with error details and context
- Debug level: Detailed execution information (development only)
**Log Structure**: Includes timestamp, log level, message, user ID, entity details, error stack traces

### Performance Monitoring

- Page load times
- API response times
- Database query performance
- Error rates

### Alerts

- Critical errors
- Performance degradation
- Security events
- Capacity warnings

---

## Technical Debt

{Document known technical debt and improvement opportunities}

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| {Description} | High/Medium/Low | Small/Medium/Large | {Details} |

---

## Migration Guide

{If this replaces existing functionality, document migration steps}

### Migration Steps
1. {Step 1}
2. {Step 2}
3. {Step 3}

### Data Migration

Migration scripts handle data transformation from old structure to new structure. Scripts are idempotent and include rollback capability.

### Rollback Plan

{How to rollback if issues occur}

---

## Appendix

### Related Documents
- [Business Requirements](./BR-template.md)
- [Use Cases](./UC-template.md)
- [Data Definition](./DD-template.md)
- [Flow Diagrams](./FD-template.md)
- [Validations](./VAL-template.md)

### Useful Commands

```bash
# Development
npm run dev

# Testing
npm run test
npm run test:e2e

# Database
npm run db:migrate
npm run db:seed

# Deployment
npm run build
npm run start
```

---

**Document End**

> 📝 **Note to Authors**:
> - Remove all placeholder text and instructions
> - Ensure code examples are accurate and tested
> - Include actual database schemas and API contracts
> - Update diagrams to reflect actual architecture
> - Have document reviewed by tech lead
