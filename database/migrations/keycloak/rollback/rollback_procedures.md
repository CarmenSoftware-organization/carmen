# Keycloak Migration Rollback Procedures

This document provides comprehensive rollback procedures for the Carmen ERP to Keycloak migration. These procedures should be used if the migration fails or if issues are discovered after migration.

## Overview

The rollback process can be performed at different stages depending on how far the migration progressed. Each stage has specific rollback procedures to ensure system integrity.

## Rollback Stages

### Stage 1: Pre-Migration (Before Data Export)
**Scenario**: Issues discovered during pre-migration validation or before data export begins.

**Actions Required**: None - no changes have been made to either system.

**Steps**:
1. Address validation failures identified in pre-migration checks
2. Re-run validation when issues are resolved
3. Proceed with migration when all checks pass

### Stage 2: Post Data Export (After SQL Export, Before Keycloak Import)
**Scenario**: Issues discovered during data transformation or before Keycloak import.

**Actions Required**: Clean up temporary export files.

**Steps**:
```bash
# Remove temporary export files
rm -f /tmp/carmen_*.csv
rm -f /tmp/keycloak_import/*.json

# Clean up log files if desired (optional)
rm -rf /tmp/keycloak_migration_logs/
```

**Impact**: No impact on production systems.

### Stage 3: Post Keycloak Import (After Users/Roles Import)
**Scenario**: Issues discovered after importing data into Keycloak but before application integration.

**Actions Required**: 
- Remove created Keycloak realm and all associated data
- Restore Keycloak to pre-migration state

**Steps**:
1. **Manual Keycloak Cleanup**:
   ```bash
   # Login to Keycloak admin console
   # Delete the Carmen realm (this removes all users, roles, groups, and clients)
   ```

2. **Automated Cleanup** (using rollback script):
   ```bash
   node rollback/restore_procedures.js --stage keycloak-import
   ```

3. **Verify Cleanup**:
   ```bash
   # Verify realm is deleted
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
        "$KEYCLOAK_URL/admin/realms/carmen" 
   # Should return 404 Not Found
   ```

**Impact**: Keycloak returns to pre-migration state. Carmen ERP authentication remains unchanged.

### Stage 4: Post Application Integration (After Carmen Integration)
**Scenario**: Issues discovered after integrating Carmen ERP with Keycloak authentication.

**Actions Required**:
- Rollback Carmen ERP authentication configuration
- Remove Keycloak realm
- Restore original authentication system

**Steps**:
1. **Rollback Carmen Application Configuration**:
   ```bash
   # Restore original authentication configuration
   git checkout HEAD~1 -- app/lib/auth/
   
   # Or manually restore authentication files
   cp backup/auth-config/* app/lib/auth/
   
   # Restart Carmen ERP application
   npm run build
   npm run start
   ```

2. **Remove Keycloak Integration**:
   ```bash
   # Remove Keycloak configuration from Carmen
   rm -f .env.keycloak
   
   # Restore original .env configuration
   cp .env.backup .env
   ```

3. **Clean Up Keycloak**:
   ```bash
   node rollback/restore_procedures.js --stage full-rollback
   ```

**Impact**: Carmen ERP returns to original authentication system. All user sessions will be invalidated and users must log in again with original credentials.

## Automated Rollback Script

The migration includes an automated rollback script that can handle most rollback scenarios:

```bash
node rollback/restore_procedures.js [options]
```

### Options:
- `--stage <stage>`: Specify rollback stage (keycloak-import, full-rollback)
- `--confirm`: Skip confirmation prompts (use with caution)
- `--dry-run`: Show what would be done without executing
- `--backup-path <path>`: Specify custom backup location

### Examples:
```bash
# Dry run to see what would be rolled back
node rollback/restore_procedures.js --stage full-rollback --dry-run

# Rollback Keycloak import only
node rollback/restore_procedures.js --stage keycloak-import

# Full rollback with confirmation
node rollback/restore_procedures.js --stage full-rollback --confirm
```

## Manual Rollback Procedures

### 1. Keycloak Realm Removal

#### Via Admin Console:
1. Login to Keycloak Admin Console
2. Navigate to Realm Settings for the Carmen realm
3. Click "Delete" in the Actions dropdown
4. Confirm deletion by typing the realm name

#### Via REST API:
```bash
# Get admin token
TOKEN=$(curl -d "client_id=admin-cli" -d "username=admin" -d "password=admin" \
  -d "grant_type=password" \
  "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" | \
  jq -r '.access_token')

# Delete realm
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$KEYCLOAK_URL/admin/realms/carmen"
```

### 2. Database Restoration (if needed)

If any changes were made to the Carmen database during migration:

```sql
-- Restore from backup (example using pg_restore)
pg_restore --host localhost --port 5432 --username postgres \
  --dbname carmen --clean --if-exists \
  /backup/carmen_pre_migration_backup.sql

-- Or restore specific tables if needed
TRUNCATE TABLE users.users CASCADE;
\copy users.users FROM '/backup/users_backup.csv' WITH CSV HEADER;
```

### 3. Application Configuration Rollback

```bash
# Restore authentication configuration files
cp -r /backup/carmen-auth/* app/lib/auth/

# Restore environment configuration
cp /backup/.env.original .env

# Restore package.json if Keycloak dependencies were added
cp /backup/package.json.original package.json

# Reinstall original dependencies
npm install

# Rebuild application
npm run build
```

### 4. File System Cleanup

```bash
# Remove migration artifacts
rm -rf /tmp/keycloak_import/
rm -rf /tmp/keycloak_migration_logs/
rm -f /tmp/carmen_*.csv

# Remove temporary Keycloak configuration files
rm -f keycloak-config.json
rm -f .env.keycloak
```

## Data Integrity Verification

After rollback, verify system integrity:

### 1. Carmen ERP Verification
```bash
# Test database connectivity
npm run test:db

# Verify user authentication
npm run test:auth

# Check application startup
npm run start
```

### 2. Keycloak Verification
```bash
# Verify realm deletion
curl -f "$KEYCLOAK_URL/realms/carmen/.well-known/openid_configuration" 2>/dev/null
# Should return error (realm not found)

# Verify Keycloak is still operational
curl -f "$KEYCLOAK_URL/realms/master/.well-known/openid_configuration"
# Should return valid configuration
```

### 3. User Access Testing
- Test login with original Carmen credentials
- Verify role-based access is working
- Check that no Keycloak dependencies remain

## Prevention Best Practices

To minimize rollback requirements in future migrations:

### 1. Comprehensive Testing
- Always test migration in development environment first
- Perform load testing with production-like data volumes
- Test all user workflows after migration

### 2. Backup Strategy
- Complete database backup before starting
- Export Keycloak configuration before migration
- Backup application configuration files
- Document all configuration changes

### 3. Staged Deployment
- Migrate in stages (dev → staging → production)
- Use feature flags to control authentication method
- Implement gradual user migration if possible

### 4. Monitoring and Validation
- Monitor authentication success rates
- Set up alerts for authentication failures
- Validate user permissions after migration
- Have support team ready during migration window

## Emergency Contacts

In case of critical issues during rollback:

1. **Database Administrator**: Restore database from backup
2. **System Administrator**: Restore application configuration
3. **Keycloak Administrator**: Clean up Keycloak installation
4. **Development Team**: Address application integration issues

## Recovery Time Estimates

| Rollback Stage | Estimated Time | Risk Level |
|----------------|----------------|------------|
| Pre-Migration | Immediate | None |
| Post-Export | < 5 minutes | Low |
| Post-Keycloak Import | 10-15 minutes | Low |
| Post-Integration | 30-60 minutes | Medium |

## Documentation and Reporting

After completing rollback:

1. **Document the Issue**:
   - Record what went wrong and when
   - Note any data integrity concerns
   - Document lessons learned

2. **Update Procedures**:
   - Update migration procedures based on experience
   - Enhance validation checks if needed
   - Improve rollback procedures if gaps are found

3. **Team Communication**:
   - Notify all stakeholders of rollback completion
   - Schedule post-mortem meeting
   - Plan next steps for migration retry

## Testing Rollback Procedures

Rollback procedures should be tested in development environment:

```bash
# Test rollback in development
export NODE_ENV=development
export KEYCLOAK_BASE_URL=http://dev-keycloak:8080

# Run migration
node tools/migration_orchestrator.js --auto-confirm

# Test rollback
node rollback/restore_procedures.js --stage full-rollback --confirm
```

This ensures rollback procedures work correctly before production migration.