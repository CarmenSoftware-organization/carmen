# DD Files - Prisma Schema Verification Report

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial verification report |

## Overview

This report documents the verification of all Data Definition (DD) files in the system-administration module against the Prisma schema (`docs/app/data-struc/schema.prisma`). The verification identifies tables and fields mentioned in DD files that do not exist in the current Prisma schema.

**Verification Date**: 2025-11-19
**Prisma Schema**: `/Users/peak/Documents/GitHub/carmen/docs/app/data-struc/schema.prisma`
**Total Models in Schema**: 68
**DD Files Verified**: 8

---

## Executive Summary

| DD File | Tables Found | Tables Missing | Fields Missing | Status |
|---------|--------------|----------------|----------------|--------|
| DD-settings.md | 0 | 14 | 0 | ⚠️ Major gaps |
| DD-permission-management.md | 2 | 11 | 0 | ⚠️ Major gaps |
| DD-system-integrations.md | 2 | 25 | 1 | ⚠️ Major gaps |
| DD-business-rules.md | 0 | 21 | 0 | ⚠️ Major gaps |
| DD-workflow.md | 4 | 9 | 6 | ⚠️ Gaps exist |
| DD-location-management.md | 7 | 4 | 6 | ⚠️ Minor gaps |
| DD-user-management.md | 5 | 1 | 0 | ✅ Mostly aligned |
| DD-monitoring.md | 0 | 20 | 0 | ⚠️ Major gaps |

**Overall Status**: 🔴 **Significant schema misalignment detected**

---

## Detailed Findings

### 1. DD-settings.md

**Status**: ⚠️ **Major gaps - 14 tables not in schema**

#### Missing Tables
All tables referenced in this DD file are missing from the Prisma schema:

1. `tb_application_settings` - Application configuration settings
2. `tb_company_settings` - Company-wide configuration
3. `tb_email_template` - Email notification templates
4. `tb_escalation_policy` - Notification escalation rules
5. `tb_notification_log` - Notification history (main table)
6. `tb_notification_log_2025_01` - Partitioned log (January 2025)
7. `tb_notification_log_2025_02` - Partitioned log (February 2025)
8. `tb_notification_log_archive` - Archived notifications
9. `tb_notification_log_partitioned` - Partitioned log view
10. `tb_notification_routing_rule` - Notification routing logic
11. `tb_security_settings` - Security configuration
12. `tb_system_notification_settings` - System notification config
13. `tb_user` - User account information
14. `tb_user_preferences` - User-specific preferences

**Impact**: High - Core settings functionality not implemented in schema

**Recommendation**:
- Add these tables to Prisma schema if settings module is planned
- Or update DD documentation to reflect actual implemented schema

---

### 2. DD-permission-management.md

**Status**: ⚠️ **Major gaps - 11 tables not in schema**

#### Tables Found in Schema ✅
- `tb_department` ✓
- `tb_location` ✓

#### Missing Tables
1. `tb_permission_audit` - Permission change audit trail
2. `tb_policy` - Permission policies
3. `tb_role` - User roles
4. `tb_role_hierarchy` - Role inheritance structure
5. `tb_role_hierarchy_no_self` - Constraint table
6. `tb_role_hierarchy_range` - Constraint table
7. `tb_role_name_unique` - Constraint table
8. `tb_role_soft_delete` - Soft delete support
9. `tb_user` - User accounts
10. `tb_user_role` - User-role assignments
11. `tb_user_role_dates_valid` - Date validation table

**Impact**: High - Permission management system not implemented

**Recommendation**:
- Implement RBAC (Role-Based Access Control) tables in schema
- Add audit trail tables for compliance

---

### 3. DD-system-integrations.md

**Status**: ⚠️ **Major gaps - 25 tables not in schema**

#### Tables Found in Schema ✅
- `tb_inventory_transaction` ✓
- `tb_location` ✓

#### Field Issues
**Table**: `tb_location`
- ❌ Only `id` field referenced, but DD may expect more fields

#### Missing Tables (POS Integration)
1. `tb_pos_api_usage` - API usage tracking
2. `tb_pos_consumption_report` - Consumption analytics
3. `tb_pos_failed_transaction` - Failed transaction log
4. `tb_pos_failed_transaction_failure_type_valid` - Validation table
5. `tb_pos_failed_transaction_resolution_status_valid` - Validation table
6. `tb_pos_failed_transaction_retry_count_non_negative` - Constraint table
7. `tb_pos_gross_profit_report` - Profit reporting
8. `tb_pos_integration_config` - Integration settings
9. `tb_pos_location_history` - Location mapping history
10. `tb_pos_location_mapping` - Location mappings
11. `tb_pos_mapping_history` - Mapping change history
12. `tb_pos_recipe_mapping` - Recipe mappings
13. `tb_pos_recipe_mapping_conversion_rate_positive` - Constraint table
14. `tb_pos_recipe_mapping_soft_delete` - Soft delete support
15. `tb_pos_recipe_mapping_status_valid` - Status validation
16. `tb_pos_sync_log` - Synchronization logs
17. `tb_pos_transaction` - POS transactions
18. `tb_pos_transaction_amount_non_negative` - Constraint table
19. `tb_pos_transaction_history` - Transaction history
20. `tb_pos_transaction_status_valid` - Status validation
21. `tb_pos_unit_history` - Unit mapping history
22. `tb_pos_unit_mapping` - Unit mappings
23. `tb_pos_unit_mapping_conversion_rate_positive` - Constraint table
24. `tb_pos_unit_mapping_unit_type_valid` - Type validation
25. `tb_pos_webhook_subscription` - Webhook subscriptions

#### Missing Tables (Recipe Management)
26. `tb_recipe` - Recipe definitions
27. `tb_recipe_variant` - Recipe variations

**Impact**: Critical - Entire POS integration module not implemented

**Recommendation**:
- Implement POS integration tables if feature is planned
- Add recipe management tables
- Or remove this DD file if POS integration is not in scope

---

### 4. DD-business-rules.md

**Status**: ⚠️ **Major gaps - 21 tables not in schema**

#### Missing Tables
All tables referenced in this DD file are missing:

1. `tb_business_rule` - Business rule definitions
2. `tb_business_rule_name_unique` - Constraint table
3. `tb_business_rule_priority_range` - Constraint table
4. `tb_business_rule_soft_delete` - Soft delete support
5. `tb_business_rule_success_rate_range` - Constraint table
6. `tb_compliance_violation` - Compliance violations
7. `tb_compliance_violation_2025_01` - Partitioned violations
8. `tb_corrective_action` - Corrective action tracking
9. `tb_corrective_action_timestamps_sequential` - Constraint table
10. `tb_food_safety_rule` - Food safety rules
11. `tb_fractional_sales_rule` - Fractional sales rules
12. `tb_inventory_threshold_rule` - Inventory threshold rules
13. `tb_quality_standard` - Quality standards
14. `tb_quality_standard_tolerance_positive` - Constraint table
15. `tb_rule_action` - Rule action definitions
16. `tb_rule_audit` - Rule change audit trail
17. `tb_rule_condition` - Rule conditions
18. `tb_rule_performance` - Rule performance metrics
19. `tb_rule_performance_period_valid` - Period validation
20. `tb_user` - User accounts
21. `tb_violation_timestamps_sequential` - Constraint table
22. `tb_waste_management_rule` - Waste management rules

**Impact**: High - Business rules engine not implemented

**Recommendation**:
- Implement business rules engine if planned
- Or remove this DD file if not in scope

---

### 5. DD-workflow.md

**Status**: ⚠️ **Gaps exist - 9 constraint/method references not in schema**

#### Tables Found in Schema ✅
- `tb_purchase_request` ✓
- `tb_purchase_request_template` ✓
- `tb_store_requisition` ✓
- `tb_workflow` ✓

#### Field Issues

**Table**: `tb_purchase_request`
- ❌ Missing: `count`, `findUnique` (These appear to be Prisma Client methods, not fields)
- ✅ Available fields: `description`, `id`, `pr_date`, `pr_no`, `user_action`, `workflow_current_stage`, `workflow_history`, `workflow_id`, `workflow_name`, `workflow_next_stage`

**Table**: `tb_workflow`
- ❌ Missing: `create`, `findMany`, `findUnique`, `update` (These are Prisma Client methods)
- ✅ Available fields: `created_at`, `created_by_id`, `data`, `deleted_at`, `deleted_by_id`, `description`, `dimension`, `id`, `info`, `is_active`

#### Missing Tables (Constraints/References)
1. `tb_purchase_request_workflow_fkey` - Foreign key constraint name
2. `tb_store_requisition_workflow_fkey` - Foreign key constraint name
3. `tb_user` - User accounts
4. `tb_workflow_archive` - Archived workflows
5. `tb_workflow_created_by_fkey` - Foreign key constraint name
6. `tb_workflow_delete_consistency` - Constraint table
7. `tb_workflow_deleted_by_fkey` - Foreign key constraint name
8. `tb_workflow_description_max_length` - Constraint table
9. `tb_workflow_name_max_length` - Constraint table
10. `tb_workflow_name_not_empty` - Constraint table
11. `tb_workflow_name_unique` - Constraint table
12. `tb_workflow_pkey` - Primary key constraint name
13. `tb_workflow_updated_by_fkey` - Foreign key constraint name

**Impact**: Low-Medium - Core tables exist, but DD references implementation details

**Notes**:
- The "missing fields" are actually Prisma Client methods (`findUnique`, `create`, etc.), not schema fields
- Constraint names (like `tb_workflow_pkey`) are database implementation details, not models

**Recommendation**:
- Update DD documentation to focus on data model, not implementation details
- Remove references to Prisma Client methods
- Remove constraint table references

---

### 6. DD-location-management.md

**Status**: ⚠️ **Minor gaps - 4 tables not in schema**

#### Tables Found in Schema ✅
- `tb_delivery_point` ✓
- `tb_location` ✓
- `tb_product` ✓
- `tb_product_location` ✓
- `tb_store_requisition` ✓
- `tb_user_location` ✓
- `tb_user_profile` ✓

#### Field Issues

**Table**: `tb_location`
- ❌ Missing: `findMany`, `findUnique`, `update` (Prisma Client methods)
- ✅ Available fields: `created_at`, `created_by_id`, `deleted_at`, `deleted_by_id`, `delivery_point_id`, `delivery_point_name`, `description`, `dimension`, `id`, `info`

**Table**: `tb_user_location`
- ❌ Missing: `createMany`, `findMany` (Prisma Client methods)
- ✅ Available fields: `created_at`, `created_by_id`, `deleted_at`, `deleted_by_id`, `id`, `info`, `location_id`, `note`, `tb_location`, `updated_at`

#### Missing Tables
1. `tb_inventory_item` - Inventory items by location
2. `tb_location_archive` - Archived locations
3. `tb_stock_count` - Stock count records
4. `tb_stock_transaction` - Stock transactions

**Impact**: Low - Core tables exist, minor tables missing

**Recommendation**:
- Update DD to remove Prisma Client method references
- Add missing inventory-related tables if needed

---

### 7. DD-user-management.md

**Status**: ✅ **Mostly aligned - Only 1 archive table missing**

#### Tables Found in Schema ✅
- `tb_department` ✓
- `tb_department_user` ✓
- `tb_location` ✓
- `tb_user_location` ✓
- `tb_user_profile` ✓

#### Field Verification ✅
All referenced fields exist in schema:
- `tb_department.id` ✓
- `tb_department_user.department_id` ✓
- `tb_location.id` ✓
- `tb_user_location.location_id` ✓
- `tb_user_profile.user_id` ✓

#### Missing Tables
1. `tb_department_user_archive` - Archived department-user relationships

**Impact**: Very Low - Only archive table missing

**Recommendation**:
- Add archive table if soft delete/audit is needed
- This DD file is well-aligned with schema

---

### 8. DD-monitoring.md

**Status**: ⚠️ **Major gaps - 20 tables not in schema**

#### Missing Tables
All tables referenced in this DD file are missing:

1. `tb_alert` - System alerts
2. `tb_alert_rule` - Alert rules and thresholds
3. `tb_audit_event` - Audit event log
4. `tb_audit_event_archive` - Archived audit events
5. `tb_dashboard` - Dashboard configurations
6. `tb_error_instance` - Error instances
7. `tb_error_log` - Error logs
8. `tb_error_log_archive` - Archived error logs
9. `tb_health_check_log` - Health check results
10. `tb_integration_event` - Integration event log
11. `tb_integration_health` - Integration health status
12. `tb_performance_metric` - Performance metrics
13. `tb_performance_metric_5min` - 5-minute aggregated metrics
14. `tb_performance_metric_hourly` - Hourly aggregated metrics
15. `tb_performance_metric_pkey` - Primary key constraint
16. `tb_service_health` - Service health status
17. `tb_user_activity` - User activity tracking
18. `tb_user_activity_hourly` - Hourly activity aggregation
19. `tb_user_session` - User session tracking
20. `tb_widget` - Dashboard widgets

**Impact**: High - Monitoring system not implemented

**Recommendation**:
- Implement monitoring tables if observability is required
- Or remove this DD file if monitoring is handled externally

---

## Summary of Issues

### Critical Gaps (High Priority)

1. **Missing User Management Tables**
   - `tb_user` referenced in 5+ DD files but not in schema
   - `tb_role` and RBAC tables missing
   - **Action**: Implement core user/role tables

2. **POS Integration Module**
   - 27 POS-related tables defined in DD but not implemented
   - **Action**: Implement or remove from documentation

3. **Monitoring & Observability**
   - 20 monitoring tables defined but not implemented
   - **Action**: Decide on monitoring strategy

4. **Business Rules Engine**
   - 22 business rule tables defined but not implemented
   - **Action**: Implement or remove from scope

### Documentation Issues (Medium Priority)

1. **Prisma Client Method References**
   - DD files incorrectly reference Prisma Client methods as fields
   - Examples: `findUnique`, `create`, `update`, `findMany`
   - **Action**: Update DD documentation to remove method references

2. **Constraint Name References**
   - DD files reference database constraint names as tables
   - Examples: `tb_workflow_pkey`, `tb_workflow_name_unique`
   - **Action**: Remove constraint references from DD files

### Minor Gaps (Low Priority)

1. **Archive Tables**
   - Several `*_archive` tables defined but not implemented
   - **Action**: Implement if audit/soft delete is needed

2. **Settings Module**
   - Complete settings system defined but not implemented
   - **Action**: Implement or remove from documentation

---

## Recommendations

### Immediate Actions

1. **Create `tb_user` table** - Referenced across multiple modules
2. **Implement RBAC tables** - Required for permission management
3. **Update DD documentation** - Remove Prisma Client method references
4. **Clarify scope** - Decide which features are in/out of scope

### Short-term Actions

1. **Implement missing core tables**:
   - User management (tb_user, tb_role, tb_user_role)
   - Permission audit (tb_permission_audit)
   - Settings (tb_application_settings, tb_user_preferences)

2. **Clean up DD documentation**:
   - Remove constraint name references
   - Remove method name references
   - Add "Implementation Status" sections

### Long-term Actions

1. **Evaluate feature scope**:
   - POS Integration - Implement or remove?
   - Business Rules Engine - Implement or remove?
   - Monitoring System - Implement or remove?

2. **Align DD with implementation**:
   - Review all DD files quarterly
   - Update as schema evolves
   - Add implementation status badges

---

## Next Steps

1. ✅ Review this report with technical team
2. ⏳ Prioritize missing tables for implementation
3. ⏳ Update DD documentation to remove implementation details
4. ⏳ Create schema migration plan
5. ⏳ Establish DD-to-schema sync process

---

## Appendix: Schema Statistics

**Current Prisma Schema**: 68 models implemented

**DD File Coverage**:
- Well-aligned: 1 file (12.5%)
- Partially aligned: 2 files (25%)
- Poorly aligned: 5 files (62.5%)

**Tables Referenced in DDs**: 150+ tables
**Tables in Schema**: 68 tables
**Coverage**: ~45% implementation

---

**Report Generated**: 2025-11-19
**Generated By**: Automated DD-Schema Verification Script
**Script Location**: `/Users/peak/Documents/GitHub/carmen/verify_dd_against_schema.py`
