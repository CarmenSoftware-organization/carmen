-- ABAC Permission Management Database Setup Script
-- Run this script to create the database and configure it for ABAC system

-- Create database (run this as superuser if database doesn't exist)
-- CREATE DATABASE carmen_abac_db;

-- Connect to the database
\c carmen_abac_db;

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema for ABAC system (optional - use if you want separate schema)
-- CREATE SCHEMA IF NOT EXISTS abac;

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE carmen_abac_db TO postgres;
-- GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- Create indexes for JSON queries (will be created automatically by Prisma, but listed here for reference)
-- These will be created after running: npx prisma db push

-- Performance optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Reload configuration
SELECT pg_reload_conf();