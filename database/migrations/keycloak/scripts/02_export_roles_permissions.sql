-- Carmen ERP Roles and Permissions Export Script
-- Exports detailed role definitions and permission structures for Keycloak migration
--
-- This script exports:
-- - Detailed role definitions with permissions
-- - Permission hierarchies and inheritance
-- - Role-to-role relationships (composite roles)
-- - Permission scopes and resource mappings

-- ============================================================================
-- CREATE MIGRATION LOG TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type VARCHAR(100) NOT NULL,
    operation_status VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMPREHENSIVE ROLE DEFINITIONS EXPORT
-- ============================================================================

-- Create comprehensive role definitions based on Carmen ERP structure
CREATE OR REPLACE VIEW comprehensive_roles_export AS
WITH carmen_roles AS (
    -- Executive Level Roles
    SELECT 
        'role-001' as role_id,
        'system_administrator' as keycloak_role_name,
        'System Administrator' as display_name,
        'Full system access with complete administrative privileges' as description,
        'REALM' as role_type,
        1 as hierarchy_level,
        true as is_system_role,
        ARRAY['*'] as permissions,
        ARRAY[]::text[] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', null,
            'clearance_level', 'top-secret',
            'can_assign_roles', true,
            'can_create_users', true,
            'can_delete_users', true,
            'workflow_admin', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-002' as role_id,
        'general_manager' as keycloak_role_name,
        'General Manager' as display_name,
        'Overall property operations management with full business access' as description,
        'REALM' as role_type,
        2 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'purchase_request:*', 'purchase_order:*', 'budget:*', 'financial_report:*',
            'user:create', 'user:update', 'user:assign_role', 'workflow:configure',
            'vendor:*', 'product:*', 'inventory:*', 'recipe:*'
        ] as permissions,
        ARRAY['role-001'] as parent_roles,
        ARRAY['role-003', 'role-004', 'role-005'] as child_roles,
        jsonb_build_object(
            'approval_limit', 100000,
            'clearance_level', 'secret',
            'can_assign_roles', true,
            'can_create_users', true,
            'workflow_admin', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-003' as role_id,
        'finance_director' as keycloak_role_name,
        'Finance Director' as display_name,
        'Financial operations oversight and budget management authority' as description,
        'CLIENT' as role_type,
        3 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'purchase_request:approve_finance', 'purchase_order:approve_finance',
            'invoice:*', 'payment:*', 'budget:*', 'financial_report:*',
            'journal_entry:*', 'exchange_rate:manage', 'cost_center:*'
        ] as permissions,
        ARRAY['role-002'] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 500000,
            'clearance_level', 'confidential',
            'financial_authority', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-004' as role_id,
        'procurement_manager' as keycloak_role_name,
        'Procurement Manager' as display_name,
        'Procurement operations management and vendor relationships' as description,
        'CLIENT' as role_type,
        4 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'purchase_request:*', 'purchase_order:*', 'vendor:*', 'vendor_quotation:*',
            'goods_receipt_note:approve', 'credit_note:*', 'procurement_report:*',
            'contract:manage', 'supplier_performance:view'
        ] as permissions,
        ARRAY['role-002'] as parent_roles,
        ARRAY['role-009'] as child_roles,
        jsonb_build_object(
            'approval_limit', 50000,
            'clearance_level', 'basic',
            'vendor_management', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-005' as role_id,
        'inventory_manager' as keycloak_role_name,
        'Inventory Manager' as display_name,
        'Inventory operations and stock management oversight' as description,
        'CLIENT' as role_type,
        4 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'inventory:*', 'stock_count:*', 'stock_adjustment:*', 'wastage:*',
            'transfer:*', 'inventory_report:*', 'reorder_management:*'
        ] as permissions,
        ARRAY['role-002'] as parent_roles,
        ARRAY['role-010'] as child_roles,
        jsonb_build_object(
            'approval_limit', 25000,
            'clearance_level', 'basic',
            'inventory_authority', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-006' as role_id,
        'department_manager' as keycloak_role_name,
        'Department Manager' as display_name,
        'Department-level operations management and staff supervision' as description,
        'CLIENT' as role_type,
        5 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'purchase_request:create', 'purchase_request:approve_department',
            'staff:manage_department', 'schedule:manage', 'performance:review',
            'budget:view_department', 'report:department'
        ] as permissions,
        ARRAY['role-002'] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 10000,
            'clearance_level', 'basic',
            'department_authority', true,
            'staff_management', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-007' as role_id,
        'head_chef' as keycloak_role_name,
        'Head Chef' as display_name,
        'Kitchen operations leadership and culinary program management' as description,
        'CLIENT' as role_type,
        6 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'recipe:*', 'menu_item:*', 'recipe_category:*', 'cuisine_type:*',
            'production_order:*', 'batch_production:*', 'quality_control:*',
            'kitchen_staff:manage', 'food_cost:analyze'
        ] as permissions,
        ARRAY['role-006'] as parent_roles,
        ARRAY['role-011'] as child_roles,
        jsonb_build_object(
            'approval_limit', 15000,
            'clearance_level', 'confidential',
            'kitchen_authority', true,
            'recipe_confidential_access', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-008' as role_id,
        'financial_manager' as keycloak_role_name,
        'Financial Manager' as display_name,
        'Financial operations execution and accounting management' as description,
        'CLIENT' as role_type,
        6 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'invoice:*', 'payment:process', 'reconciliation:*', 'tax:manage',
            'cost_allocation:*', 'financial_analysis:*', 'audit_support:*'
        ] as permissions,
        ARRAY['role-003'] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 25000,
            'clearance_level', 'confidential',
            'financial_operations', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-009' as role_id,
        'purchasing_staff' as keycloak_role_name,
        'Purchasing Staff' as display_name,
        'Purchase request processing and vendor coordination' as description,
        'CLIENT' as role_type,
        7 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'purchase_request:create', 'purchase_request:update', 'purchase_request:submit',
            'purchase_order:create', 'vendor:read', 'vendor:contact',
            'product:read', 'quotation:request', 'price:compare'
        ] as permissions,
        ARRAY['role-004'] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 5000,
            'clearance_level', 'basic',
            'purchasing_operations', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-010' as role_id,
        'inventory_staff' as keycloak_role_name,
        'Inventory Staff' as display_name,
        'Inventory operations and stock management tasks' as description,
        'CLIENT' as role_type,
        7 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'inventory:read', 'inventory:update', 'stock_count:perform',
            'stock_adjustment:create', 'transfer:process', 'receiving:process',
            'wastage:record', 'stock_inquiry:*'
        ] as permissions,
        ARRAY['role-005'] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 1000,
            'clearance_level', 'basic',
            'inventory_operations', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-011' as role_id,
        'chef' as keycloak_role_name,
        'Chef' as display_name,
        'Kitchen operations and food preparation responsibilities' as description,
        'CLIENT' as role_type,
        8 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'recipe:read', 'recipe:use', 'menu_item:read',
            'production_order:read', 'production_order:execute',
            'inventory:read_kitchen', 'requisition:create'
        ] as permissions,
        ARRAY['role-007'] as parent_roles,
        ARRAY['role-012'] as child_roles,
        jsonb_build_object(
            'approval_limit', 500,
            'clearance_level', 'basic',
            'kitchen_operations', true
        ) as attributes
    
    UNION ALL
    
    SELECT 
        'role-012' as role_id,
        'staff' as keycloak_role_name,
        'General Staff' as display_name,
        'General operational staff with basic system access' as description,
        'CLIENT' as role_type,
        10 as hierarchy_level,
        false as is_system_role,
        ARRAY[
            'dashboard:read', 'profile:update', 'notification:read',
            'basic_inquiry:*', 'timesheet:manage_own'
        ] as permissions,
        ARRAY[]::text[] as parent_roles,
        ARRAY[]::text[] as child_roles,
        jsonb_build_object(
            'approval_limit', 0,
            'clearance_level', 'basic',
            'basic_access', true
        ) as attributes
)
SELECT * FROM carmen_roles;

-- Export comprehensive role definitions
COPY (
    SELECT 
        role_id,
        keycloak_role_name,
        display_name,
        description,
        role_type,
        hierarchy_level,
        is_system_role,
        array_to_string(permissions, '|') as permissions_list,
        array_to_string(parent_roles, ',') as parent_roles_list,
        array_to_string(child_roles, ',') as child_roles_list,
        attributes::text as role_attributes
    FROM comprehensive_roles_export
    ORDER BY hierarchy_level, role_id
) TO '/tmp/carmen_comprehensive_roles_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- PERMISSION SCOPES AND RESOURCES EXPORT
-- ============================================================================

-- Export detailed permission structure for Keycloak authorization
CREATE OR REPLACE VIEW permission_scopes_export AS
WITH permission_breakdown AS (
    SELECT 
        unnest(permissions) as permission_string,
        role_id,
        keycloak_role_name
    FROM comprehensive_roles_export
    WHERE permissions != ARRAY['*'] -- Exclude wildcard permissions
),
parsed_permissions AS (
    SELECT 
        role_id,
        keycloak_role_name,
        permission_string,
        split_part(permission_string, ':', 1) as resource_type,
        split_part(permission_string, ':', 2) as scope_action,
        CASE 
            WHEN permission_string LIKE '%:*' THEN 'FULL'
            WHEN permission_string LIKE '%:read' THEN 'READ'
            WHEN permission_string LIKE '%:create' THEN 'CREATE'
            WHEN permission_string LIKE '%:update' THEN 'UPDATE'
            WHEN permission_string LIKE '%:delete' THEN 'DELETE'
            WHEN permission_string LIKE '%:approve%' THEN 'APPROVE'
            WHEN permission_string LIKE '%:manage%' THEN 'MANAGE'
            ELSE 'CUSTOM'
        END as scope_category
    FROM permission_breakdown
)
SELECT DISTINCT
    resource_type,
    scope_action,
    scope_category,
    string_agg(DISTINCT keycloak_role_name, ',') as roles_with_permission,
    COUNT(DISTINCT role_id) as role_count,
    -- Create Keycloak resource name
    CASE 
        WHEN resource_type IN ('purchase_request', 'purchase_order') THEN 'procurement'
        WHEN resource_type IN ('inventory', 'stock_count', 'stock_adjustment') THEN 'inventory'
        WHEN resource_type IN ('vendor', 'supplier') THEN 'vendor_management'
        WHEN resource_type IN ('recipe', 'menu_item') THEN 'culinary'
        WHEN resource_type IN ('invoice', 'payment', 'budget') THEN 'finance'
        WHEN resource_type IN ('user', 'staff') THEN 'user_management'
        ELSE resource_type
    END as keycloak_resource,
    -- Create Keycloak scope
    CASE 
        WHEN scope_action = '*' THEN 'admin'
        WHEN scope_action LIKE 'approve_%' THEN 'approve'
        WHEN scope_action LIKE 'manage%' THEN 'manage'
        ELSE scope_action
    END as keycloak_scope
FROM parsed_permissions
ORDER BY resource_type, scope_action;

-- Export permission scopes
COPY (
    SELECT * FROM permission_scopes_export
) TO '/tmp/carmen_permission_scopes_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- ROLE COMPOSITE RELATIONSHIPS EXPORT
-- ============================================================================

-- Export role inheritance for Keycloak composite roles
COPY (
    WITH RECURSIVE role_inheritance AS (
        -- Direct parent-child relationships
        SELECT 
            child.role_id as child_role_id,
            child.keycloak_role_name as child_role_name,
            parent.role_id as parent_role_id,
            parent.keycloak_role_name as parent_role_name,
            1 as inheritance_level,
            ARRAY[child.role_id] as inheritance_path
        FROM comprehensive_roles_export child
        CROSS JOIN unnest(child.parent_roles) as parent_role_ref(role_ref)
        JOIN comprehensive_roles_export parent ON parent.role_id = parent_role_ref.role_ref
        
        UNION ALL
        
        -- Recursive inheritance (grandparent relationships)
        SELECT 
            ri.child_role_id,
            ri.child_role_name,
            parent.role_id as parent_role_id,
            parent.keycloak_role_name as parent_role_name,
            ri.inheritance_level + 1,
            ri.inheritance_path || parent.role_id
        FROM role_inheritance ri
        CROSS JOIN unnest((
            SELECT parent_roles 
            FROM comprehensive_roles_export 
            WHERE role_id = ri.parent_role_id
        )) as grandparent_role_ref(role_ref)
        JOIN comprehensive_roles_export parent ON parent.role_id = grandparent_role_ref.role_ref
        WHERE ri.inheritance_level < 5 -- Prevent infinite recursion
        AND NOT parent.role_id = ANY(ri.inheritance_path) -- Prevent cycles
    )
    SELECT 
        child_role_name,
        parent_role_name,
        inheritance_level,
        array_to_string(inheritance_path, ' -> ') as inheritance_path_display,
        'COMPOSITE' as relationship_type
    FROM role_inheritance
    ORDER BY child_role_name, inheritance_level
) TO '/tmp/carmen_role_inheritance_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- GROUP MAPPINGS FOR DEPARTMENTS AND LOCATIONS
-- ============================================================================

-- Export department to role mappings
COPY (
    WITH department_roles AS (
        SELECT 
            'Kitchen' as department,
            ARRAY['head_chef', 'chef', 'staff'] as typical_roles,
            ARRAY['culinary'] as primary_resources
        UNION ALL
        SELECT 
            'Procurement' as department,
            ARRAY['procurement_manager', 'purchasing_staff', 'staff'] as typical_roles,
            ARRAY['procurement', 'vendor_management'] as primary_resources
        UNION ALL
        SELECT 
            'Finance' as department,
            ARRAY['finance_director', 'financial_manager', 'staff'] as typical_roles,
            ARRAY['finance'] as primary_resources
        UNION ALL
        SELECT 
            'Inventory' as department,
            ARRAY['inventory_manager', 'inventory_staff', 'staff'] as typical_roles,
            ARRAY['inventory'] as primary_resources
        UNION ALL
        SELECT 
            'IT' as department,
            ARRAY['system_administrator'] as typical_roles,
            ARRAY['user_management'] as primary_resources
    )
    SELECT 
        department,
        array_to_string(typical_roles, ',') as typical_roles_csv,
        array_to_string(primary_resources, ',') as primary_resources_csv,
        'DEPARTMENT_GROUP' as group_type
    FROM department_roles
    ORDER BY department
) TO '/tmp/carmen_department_role_mappings_export.csv' 
WITH CSV HEADER DELIMITER ',';

-- ============================================================================
-- CLEANUP AND COMPLETION
-- ============================================================================

-- Drop temporary views
DROP VIEW IF EXISTS comprehensive_roles_export;
DROP VIEW IF EXISTS permission_scopes_export;

-- Log export completion
INSERT INTO public.migration_log (
    operation_type,
    operation_status,
    details,
    created_at
) VALUES (
    'ROLES_PERMISSIONS_EXPORT',
    'COMPLETED',
    jsonb_build_object(
        'exported_files', ARRAY[
            '/tmp/carmen_comprehensive_roles_export.csv',
            '/tmp/carmen_permission_scopes_export.csv',
            '/tmp/carmen_role_inheritance_export.csv',
            '/tmp/carmen_department_role_mappings_export.csv'
        ],
        'export_timestamp', NOW(),
        'total_roles_exported', 12,
        'permission_scopes_exported', true,
        'role_inheritance_mapped', true
    ),
    NOW()
);

-- Display export summary
SELECT 
    'Roles and Permissions export completed successfully!' as status,
    12 as total_roles_exported,
    4 as role_hierarchies_mapped,
    5 as department_mappings_created,
    NOW() as export_completed_at;

-- ============================================================================
-- NOTES FOR NEXT STEPS
-- ============================================================================

/*
FILES CREATED:
1. /tmp/carmen_comprehensive_roles_export.csv - Complete role definitions
2. /tmp/carmen_permission_scopes_export.csv - Permission scopes for authorization
3. /tmp/carmen_role_inheritance_export.csv - Role inheritance for composite roles
4. /tmp/carmen_department_role_mappings_export.csv - Department to role mappings

ROLE STRUCTURE EXPORTED:
- 12 distinct roles with full permission definitions
- Role hierarchy from level 1 (System Admin) to level 10 (Staff)
- Permission scopes mapped to Keycloak resources and scopes
- Composite role relationships defined
- Department-based group mappings

NEXT STEPS:
1. Run script 03_transform_users.js to process exported user data
2. Run script 04_transform_roles.js to process role definitions
3. Validate role hierarchy and permission mappings
4. Ensure all role relationships are correctly defined

KEYCLOAK MAPPING:
- REALM roles: system_administrator, general_manager
- CLIENT roles: All department/operational roles
- COMPOSITE roles: Based on role inheritance
- GROUPS: Department and location based
- SCOPES: Resource-based authorization scopes
*/