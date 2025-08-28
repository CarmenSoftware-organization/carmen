# 🗄️ Database Setup Guide

Quick guide to set up PostgreSQL database for Carmen ABAC system.

## 🚀 Quick Setup (Automated)

### One-Command Complete Setup
```bash
npm run db:full-setup
```
This will:
1. ✅ Install/start PostgreSQL 
2. ✅ Create `carmen_abac_db` database
3. ✅ Configure extensions and permissions
4. ✅ Deploy ABAC schema
5. ✅ Seed with sample data
6. ✅ Validate complete setup

### Step-by-Step Setup
```bash
# 1. Create database
npm run db:create

# 2. Deploy schema and seed data  
npm run db:setup-abac

# 3. Validate setup
npm run db:test-setup
```

## 🛠️ Manual Setup (If Automated Fails)

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Configure PostgreSQL Port

The system expects PostgreSQL on **port 5435** with password **"password"**.

**Option A: Change PostgreSQL to port 5435**
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change: port = 5435

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Option B: Update Carmen to use default port 5432**
```bash
# Update .env file
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/carmen_abac_db"' > .env
```

### 3. Create Database Manually

```bash
# Connect to PostgreSQL
psql -h localhost -p 5435 -U postgres

# Create database
CREATE DATABASE carmen_abac_db;

# Connect to new database  
\c carmen_abac_db;

# Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Exit
\q
```

### 4. Set Environment Variables

Create or update `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5435/carmen_abac_db"
```

### 5. Deploy Schema and Data

```bash
# Deploy schema
npm run db:push

# Seed with data
npm run db:seed

# Validate setup
npm run db:test-setup
```

## 🔍 Verification

### Check Database Connection
```bash
psql -h localhost -p 5435 -U postgres -d carmen_abac_db -c "SELECT version();"
```

### Check Tables
```bash
psql -h localhost -p 5435 -U postgres -d carmen_abac_db -c "\dt"
```

### Validate Complete Setup
```bash
npm run db:test-setup
```

### Browse Database
```bash
npm run db:studio
```

## 🚨 Troubleshooting

### PostgreSQL Not Running
```bash
# macOS
brew services start postgresql

# Linux  
sudo systemctl start postgresql

# Check if running
pg_isready -h localhost -p 5435
```

### Permission Denied
```bash
# Set postgres user password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5435

# Use different port (update .env accordingly)
```

### Connection Refused
1. Check PostgreSQL is running: `pg_isready`
2. Check port configuration: `netstat -an | grep 5435`
3. Check firewall settings
4. Verify DATABASE_URL in `.env`

## 🎯 Expected Result

After successful setup, you should have:

✅ **PostgreSQL running** on localhost:5435  
✅ **Database created**: `carmen_abac_db`  
✅ **Schema deployed**: 15+ ABAC tables  
✅ **Sample data loaded**: Users, roles, policies, etc.  
✅ **Extensions installed**: uuid-ossp, pgcrypto  
✅ **Connection validated**: All tests passing  

## 📊 Database Contents After Setup

- **8 Resource Definitions**: purchase_request, inventory_item, vendor, etc.
- **5 Environment Contexts**: time, location, security, operational, data sensitivity
- **6 Roles**: system_administrator → general_manager → department_manager → executive_chef → chef → staff
- **9 Policies**: Real hospitality scenarios with complex rules
- **5 Users**: Complete profiles with realistic attributes
- **5 Access Request Examples**: Policy evaluation demonstrations

The database is now ready for ABAC development! 🚀