# ABAC System Setup Guide

This guide walks through setting up the dynamic Attribute-Based Access Control (ABAC) system for Carmen ERP.

## Prerequisites

1. PostgreSQL running on port 5435 with password "password"
2. Node.js v20+ with npm
3. Environment variables configured

## Quick Setup

### Complete Setup (One Command)
```bash
npm run db:full-setup
```
This automatically:
1. ✅ Sets up PostgreSQL database
2. ✅ Deploys ABAC schema  
3. ✅ Seeds with sample data
4. ✅ Validates complete setup

### Manual Setup (Step by Step)

#### 1. Database Creation
```bash
# Create database and configure PostgreSQL
npm run db:create
```

**Note**: If this fails, see [DATABASE-SETUP.md](../DATABASE-SETUP.md) for manual PostgreSQL setup.

#### 2. Environment Configuration  
The database setup automatically creates your `.env` file with:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5435/carmen_abac_db"
```

#### 3. Schema Deployment & Data Seeding
```bash
# Deploy schema and seed with sample data
npm run db:setup-abac
```

Or run individually:
```bash
# Deploy schema
npm run db:push

# Seed with sample data  
npm run db:seed
```

### 4. Verification

Open Prisma Studio to verify the data:

```bash
npm run db:studio
```

## System Architecture

### Dynamic JSON Storage

The ABAC system uses JSON columns in PostgreSQL to store dynamic configurations:

- **Policies**: Complete policy rules with conditions, obligations, and advice
- **Roles**: Role definitions with permissions, attributes, and constraints  
- **Resources**: Dynamic resource types with actions and workflows
- **Environment**: Contextual attributes and constraints
- **Users**: User profiles with attributes and preferences

### Core Models

#### Policy Model
```typescript
model Policy {
  id          String   @id @default(cuid())
  name        String   @unique
  policyData  Json     // Complete policy structure
  priority    Int      @default(0)
  isActive    Boolean  @default(true)
  // ... other fields
}
```

#### Role Model
```typescript
model Role {
  id       String @id @default(cuid())
  name     String @unique
  roleData Json   // Dynamic role structure
  parentId String? // Hierarchical relationships
  // ... other fields
}
```

### Sample Data Structure

The seed data includes:

1. **8 Resource Definitions**: purchase_request, purchase_order, inventory_item, vendor, recipe, invoice, user, report
2. **5 Environment Contexts**: time_constraints, location_access, security_context, operational_context, data_sensitivity  
3. **6 Role Hierarchy**: system_administrator → general_manager → department_manager → executive_chef → chef → staff
4. **9 Policies**: Covering various access scenarios from basic staff permissions to emergency overrides
5. **5 Sample Users**: Admin, manager, chef, staff, purchasing with realistic attributes
6. **5 Access Request Examples**: Demonstrating policy evaluation results

## Testing the System

### Example Access Requests

The system includes sample access requests that demonstrate:

1. **Basic Staff Purchase** (PERMIT): Staff member creating $750 purchase request ✅
2. **Over Limit Purchase** (DENY): Staff member trying $2500 purchase request ❌
3. **Chef Recipe Publishing** (PERMIT): Executive chef publishing recipe with obligations ✅
4. **Emergency Override** (PERMIT): Manager override during emergency with audit trail ✅
5. **Batch Approval** (PERMIT): Department manager bulk approving requests ✅

### Policy Evaluation Flow

```
Request → Subject Attributes → Resource Attributes → Environment Context
    ↓
Policy Matching → Rule Evaluation → Combining Algorithm
    ↓
Decision (PERMIT/DENY) + Obligations + Advice
```

## Key Features

### Dynamic Resource Types
Add new resource types without schema changes:

```json
{
  "resourceType": "maintenance_request",
  "definition": {
    "actions": [
      {"id": "create", "description": "Create maintenance request"},
      {"id": "approve", "requiresApprovalLimit": true}
    ],
    "attributes": ["urgency", "equipment", "cost"],
    "workflows": ["request_approval", "work_assignment"]
  }
}
```

### Flexible Role System
Roles inherit and override permissions:

```json
{
  "basePermissions": [
    {"resource": "purchase_request", "actions": ["view", "create"]}
  ],
  "inheritance": {
    "inheritsFrom": ["staff"],
    "overrides": ["approval_limits"],
    "additions": ["department_reports"]
  }
}
```

### Context-Aware Policies
Policies consider environment factors:

```json
{
  "target": {
    "environment": [
      {"attribute": "business_hours", "operator": "equals", "value": true},
      {"attribute": "threat_level", "operator": "not_equals", "value": "critical"}
    ]
  }
}
```

## Next Steps

1. **Core Service Layer**: Implement Policy Engine and Attribute Resolver
2. **React Integration**: Build hooks for permission checks
3. **UI Components**: Create Policy Builder interface
4. **API Endpoints**: Expose ABAC operations via REST/GraphQL
5. **ERP Integration**: Connect with existing Carmen modules

## Troubleshooting

### Quick Setup Validation
```bash
# Test complete ABAC setup
npm run db:test-setup
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -p 5435 -U postgres -c "SELECT version();"

# Check if database exists
psql -h localhost -p 5435 -U postgres -c "\l" | grep carmen
```

### Schema Issues
```bash
# Generate Prisma client
npm run db:generate

# Push schema without migration
npm run db:push

# Reset and redeploy
npm run db:reset
npm run db:setup-abac
```

### Seed Data Issues
```bash
# Re-run seeding only
npm run db:seed

# Clear and re-seed
npm run db:push --force-reset && npm run db:seed
```

### Common Errors

#### `prisma-json-types-generator: command not found`
**Solution**: This error was resolved by removing the unnecessary JSON types generator from the schema.

#### `Error validating model: unknown fields`
**Solution**: Ensure all field references in indexes match the actual field names in the model.

#### `Connection refused`
**Solutions**:
1. Ensure PostgreSQL is running on port 5435
2. Verify the password is set to "password"
3. Check the DATABASE_URL in your .env file

#### `Permission denied for database`
**Solutions**:
1. Run the setup SQL script: `psql -h localhost -p 5435 -U postgres -f prisma/setup-abac-db.sql`
2. Ensure the postgres user has sufficient privileges

#### `JSON query errors`
**Note**: JSON queries use PostgreSQL-specific syntax. The schema supports advanced JSON operations for complex policy evaluations.

## Architecture Benefits

### ✅ Advantages
- **Flexibility**: Add resources/actions without code changes
- **Scalability**: JSON queries with PostgreSQL performance
- **Maintainability**: Policy changes through data, not code
- **Auditability**: Complete access request history
- **Hospitality Focus**: Domain-specific workflows and constraints

### 📊 Performance Considerations
- JSON queries with GIN indexes for large datasets
- Policy caching for frequently accessed resources
- Bulk evaluation for batch operations
- Connection pooling for concurrent requests

## Carmen ERP Integration

The ABAC system is designed specifically for hospitality operations:

- **Kitchen Operations**: Recipe management, inventory control
- **Procurement**: Purchase approvals, vendor management  
- **Financial Controls**: Budget limits, period-end restrictions
- **Operational Context**: Service periods, peak hours, emergency modes
- **Compliance**: Food safety, audit requirements, data protection

This flexible foundation supports Carmen's complex permission requirements while maintaining performance and usability.