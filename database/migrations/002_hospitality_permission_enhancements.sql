-- =====================================================================================
-- Carmen ERP: Hospitality-Specific Permission Management Enhancements
-- =====================================================================================
-- This migration adds hospitality industry-specific enhancements to the existing
-- ABAC permission management system
--
-- Prerequisites: Requires existing ABAC schema from schema.prisma
-- Author: Carmen ERP Team
-- Version: 1.0.0
-- =====================================================================================

-- Add hospitality-specific indexes for performance
CREATE INDEX IF NOT EXISTS idx_abac_policies_hospitality_tags ON abac_policies USING GIN (tags) 
WHERE tags && ARRAY['hospitality', 'kitchen', 'front_office', 'housekeeping', 'food_safety'];

CREATE INDEX IF NOT EXISTS idx_abac_users_hospitality_context ON abac_users USING GIN ((userData->'context')) 
WHERE (userData->'context'->'department')::text IN ('"kitchen"', '"front_office"', '"housekeeping"', '"maintenance"');

CREATE INDEX IF NOT EXISTS idx_abac_resource_definitions_hospitality ON abac_resource_definitions (category, resourceType) 
WHERE category IN ('procurement', 'inventory', 'operational_planning', 'store_operations');

-- Add hospitality-specific views for common queries
CREATE OR REPLACE VIEW hospitality_user_permissions AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    u.userData->'context'->>'department' as department,
    u.userData->'context'->>'location' as location,
    u.userData->'context'->>'primaryRole' as primary_role,
    u.userData->'attributes'->>'approvalLimit' as approval_limit,
    u.userData->'context'->>'activeShift' as active_shift,
    u.isActive,
    u.lastLoginAt,
    jsonb_agg(DISTINCT r.name) as roles,
    jsonb_agg(DISTINCT r.roleData->'attributes') as role_attributes
FROM abac_users u
JOIN abac_user_role_assignments ura ON u.id = ura.userId AND ura.isActive = true
JOIN abac_roles r ON ura.roleId = r.id AND r.isActive = true
WHERE u.isActive = true
GROUP BY u.id, u.name, u.email, u.userData, u.isActive, u.lastLoginAt;

-- Create hospitality resource access summary
CREATE OR REPLACE VIEW hospitality_resource_access AS
SELECT 
    rd.resourceType,
    rd.displayName,
    rd.category,
    COUNT(DISTINCT ar.userId) as unique_users_accessed,
    COUNT(ar.id) as total_access_requests,
    COUNT(CASE WHEN ar.decision = 'PERMIT' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN ar.decision = 'DENY' THEN 1 END) as denied_requests,
    ROUND(
        COUNT(CASE WHEN ar.decision = 'PERMIT' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(ar.id), 0), 2
    ) as approval_rate_percent,
    AVG(ar.evaluationTime) as avg_evaluation_time_ms
FROM abac_resource_definitions rd
LEFT JOIN abac_access_requests ar ON 
    ar.requestData->'resource'->>'resourceType' = rd.resourceType
WHERE rd.isActive = true 
    AND rd.category IN ('procurement', 'inventory', 'operational_planning', 'store_operations')
    AND ar.createdAt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY rd.resourceType, rd.displayName, rd.category
ORDER BY total_access_requests DESC;

-- Add function for hospitality-specific policy evaluation
CREATE OR REPLACE FUNCTION evaluate_hospitality_shift_access(
    p_user_id TEXT,
    p_resource_type TEXT,
    p_action TEXT,
    p_current_time TIMESTAMP DEFAULT NOW()
) RETURNS JSON AS $$
DECLARE
    v_user_data JSON;
    v_active_shift TEXT;
    v_department TEXT;
    v_shift_start TIME;
    v_shift_end TIME;
    v_current_time TIME;
    v_result JSON;
BEGIN
    -- Get user context
    SELECT userData INTO v_user_data 
    FROM abac_users 
    WHERE id = p_user_id AND isActive = true;
    
    IF v_user_data IS NULL THEN
        RETURN json_build_object(
            'permitted', false,
            'reason', 'User not found or inactive',
            'code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Extract shift and department information
    v_active_shift := v_user_data->'context'->>'activeShift';
    v_department := v_user_data->'context'->>'department';
    v_current_time := p_current_time::TIME;
    
    -- Define shift hours (can be made configurable)
    CASE v_active_shift
        WHEN 'morning' THEN
            v_shift_start := '06:00'::TIME;
            v_shift_end := '14:00'::TIME;
        WHEN 'afternoon' THEN
            v_shift_start := '14:00'::TIME;
            v_shift_end := '22:00'::TIME;
        WHEN 'night' THEN
            v_shift_start := '22:00'::TIME;
            v_shift_end := '06:00'::TIME;
        WHEN 'full_day' THEN
            v_shift_start := '00:00'::TIME;
            v_shift_end := '23:59'::TIME;
        ELSE
            RETURN json_build_object(
                'permitted', false,
                'reason', 'Invalid or undefined shift',
                'code', 'INVALID_SHIFT'
            );
    END CASE;
    
    -- Check if current time is within shift hours
    -- Handle night shift that crosses midnight
    IF v_active_shift = 'night' THEN
        IF NOT (v_current_time >= v_shift_start OR v_current_time <= v_shift_end) THEN
            RETURN json_build_object(
                'permitted', false,
                'reason', 'Access outside shift hours',
                'code', 'OUTSIDE_SHIFT_HOURS',
                'details', json_build_object(
                    'current_time', v_current_time,
                    'shift', v_active_shift,
                    'shift_hours', v_shift_start || ' - ' || v_shift_end
                )
            );
        END IF;
    ELSE
        IF NOT (v_current_time BETWEEN v_shift_start AND v_shift_end) THEN
            RETURN json_build_object(
                'permitted', false,
                'reason', 'Access outside shift hours',
                'code', 'OUTSIDE_SHIFT_HOURS',
                'details', json_build_object(
                    'current_time', v_current_time,
                    'shift', v_active_shift,
                    'shift_hours', v_shift_start || ' - ' || v_shift_end
                )
            );
        END IF;
    END IF;
    
    -- Additional department-specific rules
    IF v_department = 'kitchen' AND p_resource_type = 'purchase_request' THEN
        -- Kitchen staff can only access food-related purchase requests during shift
        RETURN json_build_object(
            'permitted', true,
            'reason', 'Kitchen shift access approved',
            'code', 'SHIFT_ACCESS_GRANTED',
            'obligations', json_build_array(
                json_build_object(
                    'type', 'LOG_ACCESS',
                    'message', 'Kitchen shift access logged'
                )
            )
        );
    END IF;
    
    -- Default approval for valid shift access
    RETURN json_build_object(
        'permitted', true,
        'reason', 'Valid shift access',
        'code', 'SHIFT_ACCESS_GRANTED',
        'details', json_build_object(
            'shift', v_active_shift,
            'department', v_department
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Add hospitality-specific trigger for audit logging
CREATE OR REPLACE FUNCTION log_hospitality_access() RETURNS TRIGGER AS $$
BEGIN
    -- Log high-value transactions
    IF NEW.requestData->'resource'->>'resourceType' = 'purchase_request' 
       AND (NEW.requestData->'resource'->'attributes'->>'value')::NUMERIC > 10000 THEN
        
        INSERT INTO abac_audit_logs (
            eventType,
            eventCategory,
            eventData,
            complianceFlags,
            retentionDate,
            source
        ) VALUES (
            'HIGH_VALUE_ACCESS_REQUEST',
            'FINANCIAL',
            json_build_object(
                'access_request_id', NEW.id,
                'user_id', NEW.requestData->'subject'->>'userId',
                'resource_type', NEW.requestData->'resource'->>'resourceType',
                'resource_value', NEW.requestData->'resource'->'attributes'->>'value',
                'action', NEW.requestData->'action'->>'actionType',
                'decision', NEW.decision,
                'timestamp', NEW.createdAt
            ),
            ARRAY['FINANCIAL_AUDIT', 'HIGH_VALUE'],
            CURRENT_DATE + INTERVAL '7 years',
            'trigger'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for high-value transaction logging
DROP TRIGGER IF EXISTS tr_hospitality_access_log ON abac_access_requests;
CREATE TRIGGER tr_hospitality_access_log
    AFTER INSERT ON abac_access_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_hospitality_access();

-- Add hospitality-specific policy examples as stored procedures
CREATE OR REPLACE FUNCTION create_hospitality_sample_policies() RETURNS VOID AS $$
DECLARE
    v_policy_id TEXT;
BEGIN
    -- Kitchen Staff Access Policy
    v_policy_id := 'pol_' || encode(gen_random_bytes(8), 'hex');
    INSERT INTO abac_policies (
        id, name, description, priority, effect, status, 
        policyData, createdBy, updatedBy, tags
    ) VALUES (
        v_policy_id,
        'Kitchen Staff Procurement Access',
        'Allows kitchen staff to create and view purchase requests for food items during their shifts',
        100,
        'PERMIT',
        'DRAFT',
        json_build_object(
            'target', json_build_object(
                'subjects', json_build_array(
                    json_build_object('type', 'department', 'values', json_build_array('kitchen')),
                    json_build_object('type', 'role', 'values', json_build_array('chef', 'cook', 'kitchen_manager'))
                ),
                'resources', json_build_array(
                    json_build_object(
                        'type', 'purchase_request',
                        'attributes', json_build_object(
                            'category', json_build_object('operator', 'equals', 'value', 'food_ingredients')
                        )
                    )
                ),
                'actions', json_build_array('create', 'view', 'submit'),
                'environment', json_build_array(
                    json_build_object('attribute', 'current_time', 'operator', 'within', 'value', 'shift_hours'),
                    json_build_object('attribute', 'location', 'operator', 'in', 'value', json_build_array('main_kitchen', 'prep_area'))
                )
            ),
            'rules', json_build_array(
                json_build_object(
                    'id', 'rule_shift_check',
                    'name', 'Shift Time Validation',
                    'priority', 100,
                    'condition', json_build_object(
                        'type', 'AND',
                        'expressions', json_build_array(
                            json_build_object(
                                'type', 'simple',
                                'attribute', 'subject.context.activeShift',
                                'operator', 'EXISTS',
                                'value', true
                            ),
                            json_build_object(
                                'type', 'simple',
                                'attribute', 'environment.isBusinessHours',
                                'operator', 'EQUALS',
                                'value', true
                            )
                        )
                    )
                )
            ),
            'obligations', json_build_array(
                json_build_object(
                    'type', 'LOG_ACCESS',
                    'description', 'Log kitchen procurement access',
                    'parameters', json_build_object(
                        'level', 'info',
                        'category', 'procurement',
                        'department', 'kitchen'
                    )
                )
            )
        ),
        'system',
        'system',
        ARRAY['hospitality', 'kitchen', 'procurement', 'food_safety']
    );

    -- Manager Override Policy
    v_policy_id := 'pol_' || encode(gen_random_bytes(8), 'hex');
    INSERT INTO abac_policies (
        id, name, description, priority, effect, status,
        policyData, createdBy, updatedBy, tags
    ) VALUES (
        v_policy_id,
        'Manager Emergency Override',
        'Allows department managers to override system restrictions during emergencies',
        1000, -- Highest priority
        'PERMIT',
        'DRAFT',
        json_build_object(
            'target', json_build_object(
                'subjects', json_build_array(
                    json_build_object('type', 'role', 'values', json_build_array('department_manager', 'general_manager'))
                ),
                'resources', json_build_array(
                    json_build_object('type', '*', 'attributes', json_build_object())
                ),
                'actions', json_build_array('*'),
                'environment', json_build_array(
                    json_build_object('attribute', 'emergencyMode', 'operator', 'equals', 'value', true)
                )
            ),
            'rules', json_build_array(
                json_build_object(
                    'id', 'rule_emergency_check',
                    'name', 'Emergency Mode Validation',
                    'priority', 1000,
                    'condition', json_build_object(
                        'type', 'AND',
                        'expressions', json_build_array(
                            json_build_object(
                                'type', 'simple',
                                'attribute', 'environment.emergencyMode',
                                'operator', 'EQUALS',
                                'value', true
                            ),
                            json_build_object(
                                'type', 'simple',
                                'attribute', 'subject.role',
                                'operator', 'IN',
                                'value', json_build_array('department_manager', 'general_manager')
                            )
                        )
                    )
                )
            ),
            'obligations', json_build_array(
                json_build_object(
                    'type', 'AUDIT_DETAILED',
                    'description', 'Detailed audit for emergency override',
                    'parameters', json_build_object(
                        'level', 'critical',
                        'notifyAdmins', true,
                        'requireJustification', true
                    )
                ),
                json_build_object(
                    'type', 'NOTIFICATION',
                    'description', 'Notify security team of emergency override',
                    'parameters', json_build_object(
                        'recipients', json_build_array('security_team'),
                        'priority', 'high'
                    )
                )
            )
        ),
        'system',
        'system',
        ARRAY['hospitality', 'emergency', 'management', 'override']
    );

    RAISE NOTICE 'Hospitality sample policies created successfully';
END;
$$ LANGUAGE plpgsql;

-- Create sample resource definitions for hospitality
CREATE OR REPLACE FUNCTION create_hospitality_resource_definitions() RETURNS VOID AS $$
BEGIN
    -- Purchase Request Resource
    INSERT INTO abac_resource_definitions (
        id, resourceType, displayName, description, category,
        definition, isActive, version, createdBy, updatedBy
    ) VALUES (
        'res_' || encode(gen_random_bytes(8), 'hex'),
        'purchase_request',
        'Purchase Request',
        'Purchase requests for procurement of goods and services',
        'procurement',
        json_build_object(
            'actions', json_build_array(
                json_build_object('id', 'view', 'name', 'View', 'description', 'View purchase request details'),
                json_build_object('id', 'create', 'name', 'Create', 'description', 'Create new purchase request'),
                json_build_object('id', 'edit', 'name', 'Edit', 'description', 'Modify purchase request'),
                json_build_object('id', 'submit', 'name', 'Submit', 'description', 'Submit for approval'),
                json_build_object('id', 'approve', 'name', 'Approve', 'description', 'Approve purchase request', 'requiresApprovalLimit', true),
                json_build_object('id', 'reject', 'name', 'Reject', 'description', 'Reject purchase request'),
                json_build_object('id', 'cancel', 'name', 'Cancel', 'description', 'Cancel purchase request')
            ),
            'attributes', json_build_array(
                json_build_object('name', 'totalValue', 'type', 'money', 'description', 'Total monetary value'),
                json_build_object('name', 'status', 'type', 'string', 'description', 'Current status'),
                json_build_object('name', 'category', 'type', 'string', 'description', 'Item category'),
                json_build_object('name', 'urgency', 'type', 'string', 'description', 'Urgency level'),
                json_build_object('name', 'department', 'type', 'string', 'description', 'Requesting department'),
                json_build_object('name', 'vendor', 'type', 'string', 'description', 'Selected vendor'),
                json_build_object('name', 'deliveryDate', 'type', 'date', 'description', 'Expected delivery date')
            ),
            'workflows', json_build_array(
                json_build_object(
                    'name', 'approval',
                    'stages', json_build_array('draft', 'submitted', 'department_approved', 'finance_approved', 'rejected', 'cancelled')
                )
            ),
            'classification', json_build_object(
                'levels', json_build_array('public', 'internal', 'confidential', 'restricted'),
                'defaultLevel', 'internal'
            )
        ),
        true,
        '1.0',
        'system',
        'system'
    ) ON CONFLICT (resourceType) DO NOTHING;

    -- Inventory Item Resource
    INSERT INTO abac_resource_definitions (
        id, resourceType, displayName, description, category,
        definition, isActive, version, createdBy, updatedBy
    ) VALUES (
        'res_' || encode(gen_random_bytes(8), 'hex'),
        'inventory_item',
        'Inventory Item',
        'Items tracked in inventory management system',
        'inventory',
        json_build_object(
            'actions', json_build_array(
                json_build_object('id', 'view', 'name', 'View', 'description', 'View inventory item details'),
                json_build_object('id', 'adjust', 'name', 'Adjust Stock', 'description', 'Adjust stock quantities'),
                json_build_object('id', 'count', 'name', 'Physical Count', 'description', 'Perform physical stock count'),
                json_build_object('id', 'transfer', 'name', 'Transfer', 'description', 'Transfer between locations'),
                json_build_object('id', 'reserve', 'name', 'Reserve', 'description', 'Reserve stock for orders')
            ),
            'attributes', json_build_array(
                json_build_object('name', 'currentStock', 'type', 'number', 'description', 'Current stock level'),
                json_build_object('name', 'minimumStock', 'type', 'number', 'description', 'Minimum stock threshold'),
                json_build_object('name', 'unitCost', 'type', 'money', 'description', 'Cost per unit'),
                json_build_object('name', 'location', 'type', 'string', 'description', 'Storage location'),
                json_build_object('name', 'category', 'type', 'string', 'description', 'Item category'),
                json_build_object('name', 'expirationDate', 'type', 'date', 'description', 'Expiration date for perishables')
            ),
            'workflows', json_build_array(
                json_build_object(
                    'name', 'stock_management',
                    'stages', json_build_array('available', 'reserved', 'transferred', 'expired', 'disposed')
                )
            )
        ),
        true,
        '1.0',
        'system',
        'system'
    ) ON CONFLICT (resourceType) DO NOTHING;

    RAISE NOTICE 'Hospitality resource definitions created successfully';
END;
$$ LANGUAGE plpgsql;

-- Add performance monitoring for hospitality operations
CREATE OR REPLACE FUNCTION monitor_hospitality_performance() RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_metric_id TEXT;
BEGIN
    -- Monitor policy performance for hospitality operations
    FOR v_metric_id IN 
        SELECT p.id FROM abac_policies p 
        WHERE p.tags && ARRAY['hospitality'] 
        AND p.status = 'ACTIVE'
    LOOP
        INSERT INTO abac_policy_performance_metrics (
            id, policyId, metricDate, periodType, performanceData
        )
        SELECT 
            'metric_' || encode(gen_random_bytes(8), 'hex'),
            v_metric_id,
            v_today,
            'daily',
            json_build_object(
                'evaluation', json_build_object(
                    'totalEvaluations', COUNT(*),
                    'averageEvaluationTime', AVG(pel.evaluationTime),
                    'maxEvaluationTime', MAX(pel.evaluationTime),
                    'minEvaluationTime', MIN(pel.evaluationTime)
                ),
                'decisions', json_build_object(
                    'permitCount', COUNT(CASE WHEN pel.finalDecision = 'PERMIT' THEN 1 END),
                    'denyCount', COUNT(CASE WHEN pel.finalDecision = 'DENY' THEN 1 END),
                    'errorCount', COUNT(CASE WHEN pel.finalDecision = 'INDETERMINATE' THEN 1 END),
                    'notApplicableCount', COUNT(CASE WHEN pel.finalDecision = 'NOT_APPLICABLE' THEN 1 END)
                ),
                'hospitality_metrics', json_build_object(
                    'shift_based_access', COUNT(CASE 
                        WHEN ar.requestData->'environment'->>'isBusinessHours' = 'true' 
                        THEN 1 END),
                    'department_based_access', COUNT(CASE 
                        WHEN ar.requestData->'subject'->'attributes'->>'department' IN ('kitchen', 'front_office') 
                        THEN 1 END),
                    'high_value_transactions', COUNT(CASE 
                        WHEN (ar.requestData->'resource'->'attributes'->>'totalValue')::NUMERIC > 10000 
                        THEN 1 END)
                )
            )
        FROM abac_policy_evaluation_logs pel
        JOIN abac_access_requests ar ON pel.accessRequestId = ar.id
        WHERE pel.policyId = v_metric_id
        AND pel.createdAt >= v_today
        AND pel.createdAt < v_today + INTERVAL '1 day'
        GROUP BY pel.policyId
        ON CONFLICT (policyId, metricDate, periodType) DO UPDATE SET
            performanceData = EXCLUDED.performanceData;
    END LOOP;

    RAISE NOTICE 'Hospitality performance monitoring completed for %', v_today;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled task for daily performance monitoring (requires pg_cron extension)
-- SELECT cron.schedule('monitor-hospitality-performance', '0 1 * * *', 'SELECT monitor_hospitality_performance();');

-- Add indexes for common hospitality queries
CREATE INDEX IF NOT EXISTS idx_access_requests_hospitality_filters 
ON abac_access_requests USING GIN (
    (requestData->'subject'->'attributes'),
    (requestData->'resource'->'attributes'),
    (requestData->'environment')
) WHERE requestData->'subject'->'attributes'->>'department' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_policy_evaluation_hospitality_time
ON abac_policy_evaluation_logs (createdAt DESC, finalDecision)
WHERE createdAt >= CURRENT_DATE - INTERVAL '30 days';

-- Comments and documentation
COMMENT ON VIEW hospitality_user_permissions IS 'Provides a consolidated view of user permissions specific to hospitality operations including department, location, shift, and approval limits';
COMMENT ON VIEW hospitality_resource_access IS 'Analytics view showing resource access patterns for hospitality operations over the last 30 days';
COMMENT ON FUNCTION evaluate_hospitality_shift_access IS 'Evaluates whether a user has access to resources based on their current shift and department context';
COMMENT ON FUNCTION create_hospitality_sample_policies IS 'Creates sample policies specific to hospitality industry requirements';
COMMENT ON FUNCTION monitor_hospitality_performance IS 'Monitors and records performance metrics for hospitality-specific policy evaluations';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Carmen ERP Hospitality Permission Enhancements Applied Successfully';
    RAISE NOTICE 'Views created: hospitality_user_permissions, hospitality_resource_access';
    RAISE NOTICE 'Functions created: evaluate_hospitality_shift_access, create_hospitality_sample_policies, monitor_hospitality_performance';
    RAISE NOTICE 'Indexes created for performance optimization';
    RAISE NOTICE 'Triggers configured for audit logging';
    RAISE NOTICE 'Run create_hospitality_sample_policies() to create sample policies';
    RAISE NOTICE 'Run create_hospitality_resource_definitions() to create resource definitions';
END $$;