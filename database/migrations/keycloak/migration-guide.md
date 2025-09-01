# Carmen ERP to Keycloak Migration Guide

This comprehensive guide walks you through migrating Carmen ERP users and authentication data to Keycloak Identity and Access Management system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Migration Planning](#pre-migration-planning)
3. [Environment Setup](#environment-setup)
4. [Migration Process](#migration-process)
5. [Post-Migration Configuration](#post-migration-configuration)
6. [Validation and Testing](#validation-and-testing)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 12.0 or higher (Carmen ERP database)
- **Keycloak**: Version 22.0 or higher
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Disk Space**: At least 2GB free space for migration files and logs

### Access Requirements

- **Database Admin**: Full access to Carmen ERP PostgreSQL database
- **Keycloak Admin**: Administrator access to Keycloak server
- **System Admin**: Ability to run migration scripts and modify configurations
- **Network Access**: Connectivity between migration host, database, and Keycloak server

### Knowledge Requirements

- Basic understanding of PostgreSQL and SQL
- Familiarity with Keycloak concepts (realms, roles, users, clients)
- Command line interface experience
- Understanding of Carmen ERP user management

## Pre-Migration Planning

### 1. Data Assessment

First, assess your current Carmen ERP data:

```sql
-- Connect to Carmen database and run assessment queries
-- User count by status
SELECT 
    is_active,
    COUNT(*) as user_count
FROM users.users 
GROUP BY is_active;

-- Role distribution
SELECT 
    role,
    COUNT(*) as user_count
FROM users.users 
GROUP BY role
ORDER BY user_count DESC;

-- Department distribution
SELECT 
    department,
    COUNT(*) as user_count
FROM users.users 
WHERE department IS NOT NULL
GROUP BY department
ORDER BY user_count DESC;
```

### 2. Migration Strategy

Choose your migration approach:

#### Option A: Complete Migration (Recommended)
- Migrate all users, roles, and permissions
- Replace Carmen authentication with Keycloak
- Requires application integration work

#### Option B: Gradual Migration
- Migrate users in phases
- Keep Carmen authentication temporarily
- Gradual transition to Keycloak

#### Option C: Hybrid Approach
- Migrate to Keycloak for SSO
- Keep Carmen for application-specific permissions
- More complex but allows incremental adoption

### 3. Timeline Planning

Typical migration timeline:

- **Week 1**: Planning and environment setup
- **Week 2**: Development environment migration and testing
- **Week 3**: Staging environment migration and validation
- **Week 4**: Production migration and monitoring

### 4. Risk Assessment

Identify and plan for potential risks:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Authentication failure | Medium | High | Complete backup and rollback plan |
| User permission loss | Low | High | Thorough testing and validation |
| Performance degradation | Low | Medium | Performance testing and monitoring |
| Integration issues | Medium | Medium | Staged deployment and testing |

## Environment Setup

### 1. Install Dependencies

```bash
# Clone or navigate to the migration directory
cd database/migrations/keycloak

# Install Node.js dependencies
npm install

# Verify installation
node --version  # Should be 18.0.0+
npm list       # Should show all dependencies installed
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration file
nano .env
```

Update the following key configurations:

```bash
# Database connection
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=carmen
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Keycloak configuration
KEYCLOAK_BASE_URL=https://your-keycloak-server:8080
KEYCLOAK_REALM=carmen
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=your-admin-password

# Migration settings
MIGRATION_INTERACTIVE=true
MIGRATION_AUTO_CONFIRM=false
```

### 3. Verify Connectivity

```bash
# Test database connection
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "\l"

# Test Keycloak connectivity
curl -f "$KEYCLOAK_BASE_URL/health"

# Test admin authentication
curl -d "client_id=admin-cli" -d "username=$KEYCLOAK_ADMIN_USERNAME" \
  -d "password=$KEYCLOAK_ADMIN_PASSWORD" -d "grant_type=password" \
  "$KEYCLOAK_BASE_URL/realms/master/protocol/openid-connect/token"
```

## Migration Process

### Step 1: Pre-Migration Validation

Run comprehensive pre-migration checks:

```bash
# Run validation script
node validation/pre_migration_checks.js

# Review validation report
cat /tmp/keycloak_migration_logs/pre_migration_validation_report.json
```

Address any failures before proceeding. Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Database connection failed | Check credentials and network connectivity |
| Keycloak server unreachable | Verify server is running and accessible |
| Insufficient permissions | Grant required database and Keycloak permissions |
| Missing Node.js packages | Run `npm install` to install dependencies |

### Step 2: Run Migration Orchestrator

Execute the complete migration process:

```bash
# Run interactive migration
node tools/migration_orchestrator.js

# Or run with automatic confirmation (use with caution)
node tools/migration_orchestrator.js --auto-confirm

# Or run in non-interactive mode
node tools/migration_orchestrator.js --non-interactive
```

The orchestrator will guide you through each step:

1. **Pre-Migration Validation**: Validates system requirements
2. **Database Export - Users**: Exports user data from Carmen
3. **Database Export - Roles & Permissions**: Exports role definitions
4. **Data Transformation - Users**: Converts user data to Keycloak format
5. **Data Transformation - Roles**: Converts role data to Keycloak format
6. **Keycloak Import**: Imports all data into Keycloak
7. **Post-Migration Validation**: Validates migration success

### Step 3: Monitor Progress

During migration, monitor:

```bash
# Watch migration logs
tail -f /tmp/keycloak_migration_logs/migration_orchestrator_*.log

# Check system resources
top
df -h /tmp

# Monitor Keycloak server
curl "$KEYCLOAK_BASE_URL/metrics" | grep keycloak_users
```

### Step 4: Handle Issues

If the migration fails:

1. **Review Error Logs**:
   ```bash
   # Check detailed logs
   ls -la /tmp/keycloak_migration_logs/
   cat /tmp/keycloak_migration_logs/step_*.log
   ```

2. **Common Issues and Solutions**:
   - **Timeout Errors**: Increase timeout values in .env
   - **Memory Issues**: Reduce batch size or increase available memory
   - **Permission Errors**: Verify Keycloak admin permissions
   - **Data Validation Errors**: Check source data integrity

3. **Use Retry Options**:
   - Choose "retry" when prompted by orchestrator
   - Fix underlying issues before retrying
   - Consider rollback if issues persist

## Post-Migration Configuration

### 1. Verify Keycloak Realm

Access Keycloak Admin Console:

1. Navigate to `$KEYCLOAK_BASE_URL/admin`
2. Login with admin credentials
3. Select "Carmen" realm
4. Verify users, roles, and groups are imported correctly

### 2. Configure Carmen ERP Integration

Update Carmen ERP to use Keycloak authentication:

```javascript
// Update authentication configuration
// File: app/lib/auth/keycloak-config.js
export const keycloakConfig = {
  url: process.env.KEYCLOAK_BASE_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  'ssl-required': 'external',
  'public-client': false,
  'confidential-port': 0
};
```

```bash
# Update environment variables
echo "KEYCLOAK_BASE_URL=https://your-keycloak-server:8080" >> .env
echo "KEYCLOAK_REALM=carmen" >> .env
echo "KEYCLOAK_CLIENT_ID=carmen-erp" >> .env
echo "KEYCLOAK_CLIENT_SECRET=your-client-secret" >> .env

# Rebuild application
npm run build
npm run start
```

### 3. Configure Client Settings

In Keycloak Admin Console:

1. Navigate to **Clients** → **carmen-erp**
2. Update **Valid Redirect URIs**:
   - `https://your-carmen-domain.com/*`
   - `http://localhost:3000/*` (for development)
3. Update **Web Origins**: `https://your-carmen-domain.com`
4. Set **Access Type**: `confidential`
5. Enable **Authorization Enabled**
6. Save settings

### 4. Set Up Password Reset Workflow

Configure password reset for migrated users:

1. **Email Configuration** in Keycloak:
   - Realm Settings → Email
   - Configure SMTP settings
   - Test email configuration

2. **Password Policy**:
   - Authentication → Password Policy
   - Set complexity requirements
   - Configure temporary password policy

3. **Required Actions**:
   - Users → Required Actions
   - Enable "Update Password" for all users

### 5. Configure Role Mappings

Verify and adjust role mappings:

```bash
# Review role mapping report
cat /tmp/keycloak_import/role_transformation_stats.json

# Test role assignments
curl -H "Authorization: Bearer $USER_TOKEN" \
  "$KEYCLOAK_BASE_URL/realms/carmen/protocol/openid-connect/userinfo"
```

## Validation and Testing

### 1. Automated Post-Migration Testing

```bash
# Run comprehensive validation
node validation/post_migration_validation.js

# Review validation results
cat /tmp/keycloak_migration_logs/post_migration_validation_report.json
```

### 2. Manual Testing Checklist

#### User Authentication Testing
- [ ] Admin user can login with Keycloak
- [ ] Regular users can login with Keycloak
- [ ] Password reset workflow works
- [ ] Account lockout policy works
- [ ] Session timeout is appropriate

#### Permission Testing
- [ ] System administrators have full access
- [ ] Department managers have appropriate permissions
- [ ] Regular staff have limited access
- [ ] Role-based access control works correctly
- [ ] Group memberships are correct

#### Integration Testing
- [ ] Carmen ERP redirects to Keycloak for login
- [ ] User sessions persist correctly
- [ ] Logout works from both systems
- [ ] Role information is passed correctly
- [ ] API authentication works with Bearer tokens

### 3. Performance Testing

```bash
# Load testing script (example)
for i in {1..100}; do
  curl -s -w "Time: %{time_total}s\n" \
    -d "username=testuser$i" -d "password=testpass" \
    "$KEYCLOAK_BASE_URL/realms/carmen/protocol/openid-connect/token" \
    > /dev/null &
done
wait
```

Monitor:
- Authentication response times (should be <500ms)
- Server resource usage
- Database connection pool usage
- Error rates in logs

### 4. Security Validation

- [ ] SSL/TLS certificates are valid
- [ ] No sensitive data in logs
- [ ] Password policies are enforced
- [ ] Session security headers are set
- [ ] CSRF protection is enabled
- [ ] Brute force protection is working

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failures

**Symptom**: Users cannot login after migration

**Diagnosis**:
```bash
# Check Keycloak logs
docker logs keycloak 2>&1 | grep ERROR

# Check user status in Keycloak
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$KEYCLOAK_BASE_URL/admin/realms/carmen/users?username=problemuser"
```

**Solutions**:
- Verify user is enabled in Keycloak
- Check if user needs to reset password
- Verify client configuration
- Check role assignments

#### 2. Permission Issues

**Symptom**: Users have incorrect permissions

**Diagnosis**:
```bash
# Check user's role mappings
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$KEYCLOAK_BASE_URL/admin/realms/carmen/users/$USER_ID/role-mappings"
```

**Solutions**:
- Review role transformation logs
- Manually adjust role assignments
- Check group memberships
- Verify client role mappings

#### 3. Performance Issues

**Symptom**: Slow authentication or authorization

**Diagnosis**:
```bash
# Monitor Keycloak performance
curl "$KEYCLOAK_BASE_URL/metrics" | grep response_time

# Check database connections
netstat -an | grep :5432 | wc -l
```

**Solutions**:
- Increase Keycloak memory allocation
- Optimize database connection pools
- Enable caching
- Review query performance

#### 4. Integration Problems

**Symptom**: Carmen ERP cannot communicate with Keycloak

**Diagnosis**:
```bash
# Test connectivity
curl -v "$KEYCLOAK_BASE_URL/realms/carmen/.well-known/openid_configuration"

# Check Carmen application logs
tail -f /var/log/carmen/application.log
```

**Solutions**:
- Verify network connectivity
- Check firewall rules
- Validate client credentials
- Review CORS configuration

### Getting Help

If you encounter issues not covered in this guide:

1. **Review Logs**: Always start with detailed log analysis
2. **Check Documentation**: Refer to Keycloak and Carmen ERP documentation
3. **Community Forums**: Search Keycloak community forums
4. **Support Channels**: Contact your support team with:
   - Detailed error messages
   - Steps to reproduce
   - Environment information
   - Migration logs

## Rollback Procedures

If migration fails or issues are discovered, follow rollback procedures:

### Quick Rollback Commands

```bash
# Rollback Keycloak changes only
node rollback/restore_procedures.js --stage keycloak-import

# Complete rollback (includes Carmen configuration)
node rollback/restore_procedures.js --stage full-rollback

# Dry run to see what would be rolled back
node rollback/restore_procedures.js --stage full-rollback --dry-run
```

### Detailed Rollback Guide

Refer to [Rollback Procedures](rollback/rollback_procedures.md) for comprehensive rollback instructions.

## Best Practices

### Security Best Practices

1. **Use Strong Admin Credentials**: Use complex passwords for Keycloak admin accounts
2. **Enable HTTPS**: Always use HTTPS in production
3. **Regular Backups**: Schedule regular backups of both systems
4. **Monitor Access**: Set up monitoring and alerting for authentication failures
5. **Audit Logs**: Enable and monitor audit logging
6. **Update Regularly**: Keep Keycloak updated with latest security patches

### Operational Best Practices

1. **Test Thoroughly**: Test migration process in development/staging first
2. **Plan Maintenance Windows**: Schedule migration during low-usage periods
3. **Communicate Changes**: Inform users about authentication changes
4. **Monitor Performance**: Watch system performance after migration
5. **Document Changes**: Keep detailed records of all configuration changes
6. **Train Support Staff**: Ensure support team understands new authentication flow

### Maintenance Best Practices

1. **Regular Health Checks**: Monitor system health and performance
2. **Backup Strategy**: Maintain regular backups with tested restore procedures
3. **User Management**: Establish processes for user lifecycle management
4. **Permission Reviews**: Regularly review and audit user permissions
5. **Update Procedures**: Establish procedures for system updates and patches

## Conclusion

This migration guide provides a comprehensive approach to migrating from Carmen ERP's built-in authentication to Keycloak. Following this guide will help ensure a successful migration with minimal disruption to users.

Remember:
- **Test everything** in a development environment first
- **Have a rollback plan** ready before starting production migration  
- **Monitor closely** during and after migration
- **Communicate proactively** with users about any changes

For additional support or questions, refer to the troubleshooting section or contact your system administrator.