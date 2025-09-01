-- Carmen ERP User Export Script
-- Exports all user data from Carmen database for Keycloak migration
-- 
-- This script exports:
-- - User profiles and basic information
-- - Role assignments and hierarchies
-- - Department and location assignments
-- - User preferences and attributes
-- - Account status and validity periods

-- ============================================================================
-- EXPORT USER PROFILES
-- ============================================================================

-- Export basic user information
COPY (
    SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.role as primary_role_id,
        u.department as primary_department,
        u.location as primary_location,
        u.is_active,
        u.created_at,
        u.updated_at,
        -- Add computed full name
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        -- Add normalized email (lowercase)
        LOWER(u.email) as normalized_email,
        -- Add account status mapping
        CASE 
            WHEN u.is_active = true THEN 'ENABLED'
            ELSE 'DISABLED'
        END as keycloak_status
    FROM users.users u
    ORDER BY u.created_at
) TO '/tmp/carmen_users_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- EXPORT USER ROLES AND PERMISSIONS
-- ============================================================================

-- Create a view for user role assignments with expanded permissions
CREATE OR REPLACE VIEW user_role_assignments_export AS
SELECT 
    u.id as user_id,
    u.email,
    u.role as primary_role_id,
    -- Primary role details
    pr.name as primary_role_name,
    pr.permissions as primary_role_permissions,
    pr.hierarchy as role_hierarchy,
    pr.parent_roles,
    -- Department and location context
    u.department,
    u.location,
    -- Account details
    u.is_active,
    u.created_at as user_created_at
FROM users.users u
LEFT JOIN (
    -- Mock roles data - in production, this would be a proper roles table
    SELECT 
        'admin' as id, 'System Administrator' as name, 
        ARRAY['*'] as permissions, 
        1 as hierarchy,
        ARRAY[]::text[] as parent_roles
    UNION ALL
    SELECT 
        'chef' as id, 'Head Chef' as name,
        ARRAY['recipe:*', 'menu_item:*', 'production_order:*'] as permissions,
        4 as hierarchy,
        ARRAY['staff'] as parent_roles
    UNION ALL
    SELECT 
        'purchasing-staff' as id, 'Purchasing Staff' as name,
        ARRAY['purchase_request:*', 'vendor:read', 'product:read'] as permissions,
        5 as hierarchy,
        ARRAY['staff'] as parent_roles
    UNION ALL
    SELECT 
        'staff' as id, 'General Staff' as name,
        ARRAY['dashboard:read', 'profile:update'] as permissions,
        10 as hierarchy,
        ARRAY[]::text[] as parent_roles
) pr ON u.role = pr.id;

-- Export user role assignments
COPY (
    SELECT * FROM user_role_assignments_export
    ORDER BY user_created_at
) TO '/tmp/carmen_user_roles_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- EXPORT DEPARTMENT AND LOCATION DATA
-- ============================================================================

-- Export departments for group creation
COPY (
    SELECT DISTINCT
        department as dept_id,
        department as dept_name,
        department as dept_code,
        'Department group for ' || department as description,
        COUNT(*) OVER (PARTITION BY department) as user_count
    FROM users.users 
    WHERE department IS NOT NULL
    ORDER BY department
) TO '/tmp/carmen_departments_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- Export locations for group creation
COPY (
    SELECT DISTINCT
        location as location_id,
        location as location_name,
        'Location group for ' || location as description,
        COUNT(*) OVER (PARTITION BY location) as user_count
    FROM users.users 
    WHERE location IS NOT NULL
    ORDER BY location
) TO '/tmp/carmen_locations_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- EXPORT USER ATTRIBUTES AND PREFERENCES
-- ============================================================================

-- Export user attributes for Keycloak user attributes
COPY (
    SELECT 
        u.id as user_id,
        u.email,
        -- Standard attributes
        jsonb_build_object(
            'department', u.department,
            'location', u.location,
            'primary_role', u.role,
            'full_name', CONCAT(u.first_name, ' ', u.last_name),
            'first_name', u.first_name,
            'last_name', u.last_name,
            'created_date', u.created_at::date,
            'account_type', 'carmen_migrated',
            'migration_date', NOW()::date
        ) as keycloak_attributes
    FROM users.users u
    ORDER BY u.created_at
) TO '/tmp/carmen_user_attributes_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- EXPORT MIGRATION METADATA
-- ============================================================================

-- Create migration summary for validation
COPY (
    SELECT 
        'migration_summary' as export_type,
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(DISTINCT role) as unique_roles,
        COUNT(DISTINCT department) as unique_departments,
        COUNT(DISTINCT location) as unique_locations,
        NOW() as export_timestamp,
        current_database() as source_database,
        current_user as exported_by
    FROM users.users
) TO '/tmp/carmen_migration_summary.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- EXPORT ROLE HIERARCHY FOR KEYCLOAK COMPOSITE ROLES
-- ============================================================================

-- Export role relationships for creating composite roles in Keycloak
COPY (
    WITH RECURSIVE role_hierarchy AS (
        -- Base roles (no parent)
        SELECT 
            'admin' as role_id,
            'System Administrator' as role_name,
            ARRAY['*'] as permissions,
            1 as hierarchy_level,
            NULL as parent_role,
            ARRAY[]::text[] as all_parents
        UNION ALL
        SELECT 
            'chef' as role_id,
            'Head Chef' as role_name,
            ARRAY['recipe:*', 'menu_item:*', 'production_order:*'] as permissions,
            4 as hierarchy_level,
            'staff' as parent_role,
            ARRAY['staff'] as all_parents
        UNION ALL
        SELECT 
            'purchasing-staff' as role_id,
            'Purchasing Staff' as role_name,
            ARRAY['purchase_request:*', 'vendor:read', 'product:read'] as permissions,
            5 as hierarchy_level,
            'staff' as parent_role,
            ARRAY['staff'] as all_parents
        UNION ALL
        SELECT 
            'staff' as role_id,
            'General Staff' as role_name,
            ARRAY['dashboard:read', 'profile:update'] as permissions,
            10 as hierarchy_level,
            NULL as parent_role,
            ARRAY[]::text[] as all_parents
    )
    SELECT 
        role_id,
        role_name,
        array_to_string(permissions, ',') as permissions_csv,
        hierarchy_level,
        parent_role,
        array_to_string(all_parents, ',') as inherited_roles_csv,
        -- Calculate effective permissions (including inherited)
        CASE 
            WHEN parent_role IS NOT NULL THEN 
                array_to_string(
                    array_cat(permissions, ARRAY['dashboard:read', 'profile:update']), 
                    ','
                )
            ELSE array_to_string(permissions, ',')
        END as effective_permissions_csv
    FROM role_hierarchy
    ORDER BY hierarchy_level, role_id
) TO '/tmp/carmen_role_hierarchy_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- CLEANUP TEMPORARY VIEWS
-- ============================================================================

DROP VIEW IF EXISTS user_role_assignments_export;

-- ============================================================================
-- EXPORT COMPLETION LOG
-- ============================================================================

-- Log export completion
INSERT INTO public.migration_log (
    operation_type,
    operation_status,
    details,
    created_at
) VALUES (
    'USER_EXPORT',
    'COMPLETED',
    jsonb_build_object(
        'exported_files', ARRAY[
            '/tmp/carmen_users_export.csv',
            '/tmp/carmen_user_roles_export.csv',
            '/tmp/carmen_departments_export.csv',
            '/tmp/carmen_locations_export.csv',
            '/tmp/carmen_user_attributes_export.csv',
            '/tmp/carmen_migration_summary.csv',
            '/tmp/carmen_role_hierarchy_export.csv'
        ],
        'export_timestamp', NOW()
    ),
    NOW()
) ON CONFLICT DO NOTHING;

-- Display export summary
SELECT 
    'Export completed successfully!' as status,
    COUNT(*) as total_users_exported,
    COUNT(DISTINCT role) as roles_exported,
    COUNT(DISTINCT department) as departments_exported,
    COUNT(DISTINCT location) as locations_exported,
    NOW() as export_completed_at
FROM users.users;

-- ============================================================================
-- NOTES FOR NEXT STEPS
-- ============================================================================

/*
FILES CREATED:
1. /tmp/carmen_users_export.csv - Basic user information
2. /tmp/carmen_user_roles_export.csv - User role assignments with permissions
3. /tmp/carmen_departments_export.csv - Department information for groups
4. /tmp/carmen_locations_export.csv - Location information for groups  
5. /tmp/carmen_user_attributes_export.csv - User attributes for Keycloak
6. /tmp/carmen_migration_summary.csv - Migration summary and validation data
7. /tmp/carmen_role_hierarchy_export.csv - Role hierarchy for composite roles

NEXT STEPS:
1. Run script 02_export_roles_permissions.sql for detailed role export
2. Run script 03_transform_users.js to transform data for Keycloak
3. Validate exported data before proceeding with Keycloak import
4. Ensure all required files are present and contain expected data

SECURITY NOTES:
- Exported files contain sensitive user data
- Secure file permissions should be set on exported files
- Files should be deleted after successful migration
- Password hashes are not exported (password reset recommended)
*/