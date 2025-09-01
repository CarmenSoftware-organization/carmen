-- Keycloak Database Initialization Script
-- This script prepares the PostgreSQL database for Keycloak

-- Ensure the keycloak database exists (created by POSTGRES_DB env var)
-- and set proper encoding and collation

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optimize PostgreSQL settings for Keycloak
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Note: RELOAD configuration (requires restart in Docker)
-- SELECT pg_reload_conf();

-- Create indexes for better performance (Keycloak will create tables)
-- These will be created after Keycloak starts up

DO $$
BEGIN
    -- Create a function to add indexes after tables are created
    CREATE OR REPLACE FUNCTION create_keycloak_performance_indexes()
    RETURNS VOID AS $func$
    BEGIN
        -- Only create indexes if tables exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_entity') THEN
            -- User-related indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_entity_email 
                ON user_entity(email);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_entity_realm_email 
                ON user_entity(realm_id, email);
            
            -- Session-related indexes
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_session') THEN
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_session_realm_user 
                    ON user_session(realm_id, user_id);
            END IF;
            
            -- Client session indexes
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_session') THEN
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_session_user_session 
                    ON client_session(user_session);
            END IF;
        END IF;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Note: This function can be called later via:
    -- SELECT create_keycloak_performance_indexes();
END $$;