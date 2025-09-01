# Keycloak Migration Guide for Carmen ERP

This directory contains comprehensive migration scripts and documentation for migrating Carmen ERP users and authentication data to Keycloak.

## Overview

This migration process will:
- Export existing users from Carmen database
- Transform user data to Keycloak-compatible format
- Import users into Keycloak realm with proper role assignments
- Migrate role hierarchies and permissions
- Set up department and location group memberships
- Provide comprehensive validation and rollback procedures

## Directory Structure

```
keycloak/
├── README.md                           # This file
├── migration-guide.md                  # Step-by-step migration guide
├── scripts/
│   ├── 01_export_users.sql            # Export users from Carmen DB
│   ├── 02_export_roles_permissions.sql # Export roles and permissions
│   ├── 03_transform_users.js          # Transform data for Keycloak
│   ├── 04_transform_roles.js          # Transform roles and permissions
│   ├── 05_import_to_keycloak.js       # Import users to Keycloak
│   ├── 06_setup_groups.js             # Create department/location groups
│   ├── 07_assign_roles.js             # Assign roles to users
│   └── 08_setup_clients.js            # Configure Keycloak clients
├── validation/
│   ├── pre_migration_checks.js        # Pre-migration validation
│   ├── post_migration_validation.js   # Post-migration validation
│   └── data_integrity_checks.js       # Data integrity validation
├── rollback/
│   ├── rollback_procedures.md         # Rollback documentation
│   ├── backup_keycloak.js             # Backup current Keycloak state
│   └── restore_procedures.js          # Restore procedures
├── config/
│   ├── keycloak_realm_config.json     # Keycloak realm configuration
│   ├── role_mapping.json              # Carmen to Keycloak role mapping
│   └── client_config.json             # Keycloak client configuration
├── tools/
│   ├── migration_orchestrator.js      # Main migration orchestrator
│   ├── logger.js                      # Migration logging utilities
│   └── monitoring.js                  # Migration monitoring tools
└── docs/
    ├── troubleshooting.md             # Common issues and solutions
    ├── security_considerations.md     # Security best practices
    └── post_migration_setup.md       # Post-migration configuration
```

## Prerequisites

Before starting the migration:

1. **Keycloak Server**: Ensure Keycloak server is installed and running
2. **Database Access**: Full access to Carmen PostgreSQL database
3. **Admin Credentials**: Keycloak admin credentials
4. **Backup**: Complete backup of both Carmen database and Keycloak
5. **Node.js**: Node.js v18+ for running migration scripts
6. **Dependencies**: Install required npm packages

## Quick Start

1. **Install Dependencies**
   ```bash
   cd database/migrations/keycloak
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

3. **Run Pre-Migration Checks**
   ```bash
   node validation/pre_migration_checks.js
   ```

4. **Execute Migration**
   ```bash
   node tools/migration_orchestrator.js
   ```

5. **Validate Migration**
   ```bash
   node validation/post_migration_validation.js
   ```

## Migration Process Overview

### Phase 1: Data Export and Transformation
- Export users, roles, and permissions from Carmen database
- Transform data to Keycloak-compatible format
- Validate data integrity and completeness

### Phase 2: Keycloak Setup
- Configure Keycloak realm and clients
- Create role hierarchies and permissions
- Set up department and location groups

### Phase 3: User Import
- Import users with proper role assignments
- Set up group memberships
- Configure user attributes and preferences

### Phase 4: Validation and Testing
- Comprehensive data validation
- Authentication testing
- Permission verification

## Key Features

### Data Migration
- **Complete User Export**: All user data including profiles, roles, and permissions
- **Role Hierarchy Migration**: Preserves role inheritance and hierarchy
- **Permission Mapping**: Maps Carmen permissions to Keycloak roles and scopes
- **Group Management**: Creates department and location-based groups
- **Attribute Migration**: Migrates user attributes and preferences

### Data Integrity
- **Pre-migration Validation**: Comprehensive checks before migration starts
- **Data Transformation Validation**: Validates transformed data structure
- **Post-migration Verification**: Ensures all data was migrated correctly
- **Consistency Checks**: Verifies role assignments and group memberships

### Security
- **Password Migration**: Secure password handling (reset workflow recommended)
- **Token Management**: Secure API token handling for Keycloak admin
- **Audit Trail**: Complete logging of all migration operations
- **Rollback Capability**: Ability to rollback changes if needed

### Monitoring and Logging
- **Progress Tracking**: Real-time migration progress monitoring
- **Error Handling**: Comprehensive error handling and recovery
- **Performance Metrics**: Migration performance and timing metrics
- **Detailed Logging**: Comprehensive logging for troubleshooting

## Role Mapping Strategy

Carmen ERP roles are mapped to Keycloak as follows:

### Realm Roles (Global)
- System Administrator → `admin`
- General Manager → `general_manager`
- Finance Director → `finance_director`

### Client Roles (Application-specific)
- Department Manager → `department_manager`
- Procurement Manager → `procurement_manager`
- Chef → `chef`
- Staff → `staff`

### Composite Roles
Complex roles with multiple permissions are implemented as composite roles in Keycloak.

### Groups
- **Departments**: Each department becomes a Keycloak group
- **Locations**: Each location becomes a Keycloak group
- **Business Units**: High-level organizational groups

## Important Notes

### Password Migration
- **Recommended**: Use password reset workflow for all users post-migration
- **Alternative**: If password hashes are compatible, they can be migrated
- **Security**: Enforce password policy update after migration

### Testing Strategy
1. **Development Environment**: Test migration in development first
2. **Staging Validation**: Validate in staging environment
3. **User Acceptance Testing**: Have key users test authentication
4. **Performance Testing**: Ensure authentication performance is acceptable

### Rollback Planning
- Complete backup before starting migration
- Rollback scripts available for all major steps
- Database transaction boundaries for atomic operations
- Clear rollback procedures documented

## Support

For issues or questions:
1. Check the troubleshooting guide: `docs/troubleshooting.md`
2. Review migration logs in `logs/` directory
3. Contact the development team
4. Refer to Keycloak documentation

## Version Information

- **Migration Scripts Version**: 1.0.0
- **Compatible Carmen Version**: 1.x
- **Compatible Keycloak Version**: 22.x+
- **Required Node.js Version**: 18.x+

## Next Steps

After successful migration:
1. Review `docs/post_migration_setup.md`
2. Configure application integration with Keycloak
3. Update application authentication flows
4. Train users on any changes to login process
5. Monitor system performance and user feedback