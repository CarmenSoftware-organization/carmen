# ABAC Permission Management Database Setup

This guide will help you set up the PostgreSQL database for the Carmen ERP ABAC (Attribute-Based Access Control) system.

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Prisma CLI installed (`npm install -g prisma`)

## Database Configuration

The ABAC system is configured to use PostgreSQL with the following connection details:
- **Host**: localhost
- **Port**: 5435
- **Password**: password
- **Database**: carmen_abac_db

## Setup Steps

### 1. Start PostgreSQL Server

Make sure PostgreSQL is running on port 5435:

```bash
# If using Homebrew on macOS
brew services start postgresql

# Or start PostgreSQL with specific port
pg_ctl -D /usr/local/var/postgres -o "-p 5435" start
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -h localhost -p 5435 -U postgres

# Create the database
CREATE DATABASE carmen_abac_db;

# Exit psql
\q
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.abac.example .env.local
```

Edit `.env.local` and update the DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5435/carmen_abac_db"
```

### 4. Run Database Setup Script (Optional)

```bash
psql -h localhost -p 5435 -U postgres -d carmen_abac_db -f prisma/setup-abac-db.sql
```

### 5. Generate Prisma Client and Push Schema

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to the database
npx prisma db push

# Optional: Open Prisma Studio to view the database
npx prisma studio
```

### 6. Seed Initial Data (Optional)

If you have seed data files, run:

```bash
# Seed policies
npx prisma db seed

# Or manually load data
psql -h localhost -p 5435 -U postgres -d carmen_abac_db -c "\copy abac_policies FROM 'prisma/seed-data/policies.json' WITH CSV HEADER;"
```

## Verification

To verify the setup is working correctly:

1. **Check database connection**:
   ```bash
   npx prisma db pull
   ```

2. **View tables in Prisma Studio**:
   ```bash
   npx prisma studio
   ```

3. **Run a simple query**:
   ```bash
   psql -h localhost -p 5435 -U postgres -d carmen_abac_db -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
   ```

## Schema Structure

The ABAC schema includes the following main components:

### Core Tables
- `abac_policies` - Policy definitions
- `abac_policy_rules` - Individual policy rules
- `abac_expressions` - Rule conditions
- `abac_roles` - Enhanced role management
- `abac_user_roles` - User-role assignments

### Attribute Tables
- `abac_subject_attributes` - User attributes
- `abac_resource_attributes` - Resource metadata
- `abac_environment_attributes` - Context attributes

### Evaluation Tables
- `abac_access_requests` - Access decision records
- `abac_policy_evaluation_logs` - Evaluation traces
- `abac_permission_cache` - Performance cache

### Management Tables
- `abac_subscription_configs` - Package management
- `abac_audit_logs` - Comprehensive audit trail
- `abac_policy_test_scenarios` - Testing framework

## Troubleshooting

### Connection Issues

1. **Port not available**: Check if another service is using port 5435
   ```bash
   lsof -i :5435
   ```

2. **Authentication failed**: Verify username/password in connection string

3. **Database doesn't exist**: Make sure you created the `carmen_abac_db` database

### Schema Issues

1. **Table creation failed**: Check PostgreSQL logs for detailed error messages
2. **Permission denied**: Ensure the user has CREATE privileges on the database
3. **Extension issues**: Make sure required extensions are installed

### Performance Issues

1. **Slow queries**: The schema includes comprehensive indexing for performance
2. **Memory usage**: Consider adjusting PostgreSQL configuration for your system
3. **Cache optimization**: Use the `abac_permission_cache` table for frequently accessed permissions

## Next Steps

After setting up the database:

1. Review the [Permission Management Documentation](../docs/permission-management-todos.md)
2. Implement the Policy Engine service layer
3. Create the UI components for policy management
4. Set up monitoring and alerting for the ABAC system

## Support

For issues with the ABAC system setup:
- Check the Carmen ERP documentation
- Review PostgreSQL logs: `/usr/local/var/postgres/server.log` (macOS) or `/var/log/postgresql/` (Linux)
- Use Prisma Studio for visual database inspection