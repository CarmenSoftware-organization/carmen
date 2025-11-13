# Spot Check - Validations (VAL)

## Document Information
- **Module**: Inventory Management - Spot Check
- **Document Type**: Validations (VAL)
- **Related Documents**:
  - BR-spot-check.md (Business Requirements)
  - UC-spot-check.md (Use Cases)
  - TS-spot-check.md (Technical Specification)
  - DD-spot-check.md (Data Definition)
  - FD-spot-check.md (Flow Diagrams)
- **Version**: 1.0
- **Last Updated**: 2025-01-11

## Table of Contents
1. [Overview](#overview)
2. [Validation Categories](#validation-categories)
3. [Field-Level Validations](#field-level-validations)
4. [Business Rule Validations](#business-rule-validations)
5. [Cross-Field Validations](#cross-field-validations)
6. [Security Validations](#security-validations)
7. [Error Messages](#error-messages)
8. [Test Scenarios](#test-scenarios)
9. [Validation Matrix](#validation-matrix)

---

## Overview

This document defines all validation rules for the Spot Check sub-module. Validations are organized by category and include field-level, business rule, cross-field, and security validations.

### Validation Layers

**Three-Tier Validation Architecture**:
1. **Client-Side (React Hook Form + Zod)**: Immediate feedback, UX optimization
2. **Server-Side (Server Actions)**: Business logic enforcement, security
3. **Database-Level (Constraints + Triggers)**: Data integrity guarantees

### Validation Priorities
- **Critical**: Data integrity violations, security breaches, financial impact
- **High**: Business rule violations, workflow disruption
- **Medium**: Data quality issues, user experience impact
- **Low**: Formatting preferences, non-critical warnings

---

## Validation Categories

### 1. Field-Level Validations (VAL-SC-001 to 099)
Individual field constraints: required, format, range, length, data type

### 2. Business Rule Validations (VAL-SC-101 to 199)
Business logic enforcement: status transitions, product limits, variance thresholds

### 3. Cross-Field Validations (VAL-SC-201 to 299)
Multi-field dependencies: date relationships, quantity consistency, status dependencies

### 4. Security Validations (VAL-SC-301 to 399)
Access control, permissions, data ownership, audit requirements

---

## Field-Level Validations

### VAL-SC-001: Count Stock Type Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: The `count_stock_type` field must be set to 'spot' for all spot check records.

**Validation Logic**:
```
IF count_stock_type IS NULL OR count_stock_type != 'spot' THEN
  ERROR: "Invalid count type. Spot checks must have type 'spot'."
END IF
```

**Error Message**: "Invalid count type. This record must be a spot check."

**Tested By**: TEST-SC-VAL-001

---

### VAL-SC-002: Location Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: The `location_id` field must reference a valid, active location from tb_location.

**Validation Logic**:
```
IF location_id IS NULL THEN
  ERROR: "Location is required."
ELSE IF NOT EXISTS (SELECT 1 FROM tb_location WHERE id = location_id AND deleted_at IS NULL) THEN
  ERROR: "Invalid location. Location does not exist or is inactive."
END IF
```

**Error Messages**:
- "Location is required to create a spot check."
- "Invalid location. Please select an active location."

**Tested By**: TEST-SC-VAL-002

---

### VAL-SC-003: Count Date Required
**Priority**: High
**Enforcement**: Client, Server

**Rule**: The `count_date` must be a valid date and cannot be null.

**Validation Logic**:
```
IF count_date IS NULL THEN
  ERROR: "Count date is required."
ELSE IF count_date IS NOT a valid date THEN
  ERROR: "Invalid date format."
END IF
```

**Error Messages**:
- "Count date is required."
- "Invalid date format. Please use YYYY-MM-DD."

**Tested By**: TEST-SC-VAL-003

---

### VAL-SC-004: Count Date Range
**Priority**: Medium
**Enforcement**: Client, Server

**Rule**: Count date must be within the last 30 days or up to 1 day in the future.

**Validation Logic**:
```
IF count_date < (CURRENT_DATE - INTERVAL '30 days') THEN
  ERROR: "Count date cannot be more than 30 days in the past."
ELSE IF count_date > (CURRENT_DATE + INTERVAL '1 day') THEN
  ERROR: "Count date cannot be more than 1 day in the future."
END IF
```

**Error Messages**:
- "Count date cannot be more than 30 days in the past."
- "Count date cannot be more than 1 day in the future."

**Tested By**: TEST-SC-VAL-004

---

### VAL-SC-005: Status Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Status must be one of: 'pending', 'in_progress', 'completed', 'cancelled'.

**Validation Logic**:
```
IF status NOT IN ('pending', 'in_progress', 'completed', 'cancelled') THEN
  ERROR: "Invalid status value."
END IF
```

**Error Message**: "Invalid status. Status must be pending, in_progress, completed, or cancelled."

**Tested By**: TEST-SC-VAL-005

---

### VAL-SC-006: Created By Required
**Priority**: Critical
**Enforcement**: Server, Database

**Rule**: The `created_by` field must reference a valid, active user.

**Validation Logic**:
```
IF created_by IS NULL THEN
  ERROR: "Created by user is required."
ELSE IF NOT EXISTS (SELECT 1 FROM tb_user WHERE id = created_by AND deleted_at IS NULL) THEN
  ERROR: "Invalid user reference."
END IF
```

**Error Message**: "Invalid user. Created by user does not exist or is inactive."

**Tested By**: TEST-SC-VAL-006

---

### VAL-SC-007: Product Reference Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Each detail record must reference a valid product from tb_product.

**Validation Logic**:
```
IF product_id IS NULL THEN
  ERROR: "Product is required for each line item."
ELSE IF NOT EXISTS (SELECT 1 FROM tb_product WHERE id = product_id AND deleted_at IS NULL) THEN
  ERROR: "Invalid product reference."
END IF
```

**Error Messages**:
- "Product is required for each line item."
- "Invalid product. Product does not exist or is inactive."

**Tested By**: TEST-SC-VAL-007

---

### VAL-SC-008: Unit Reference Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Each detail record must reference a valid unit from tb_unit.

**Validation Logic**:
```
IF unit_id IS NULL THEN
  ERROR: "Unit of measure is required."
ELSE IF NOT EXISTS (SELECT 1 FROM tb_unit WHERE id = unit_id AND deleted_at IS NULL) THEN
  ERROR: "Invalid unit reference."
END IF
```

**Error Messages**:
- "Unit of measure is required for each product."
- "Invalid unit. Unit does not exist or is inactive."

**Tested By**: TEST-SC-VAL-008

---

### VAL-SC-009: Expected Quantity Non-Negative
**Priority**: High
**Enforcement**: Client, Server, Database

**Rule**: Expected quantity cannot be negative.

**Validation Logic**:
```
IF expected_qty IS NOT NULL AND expected_qty < 0 THEN
  ERROR: "Expected quantity cannot be negative."
END IF
```

**Error Message**: "Expected quantity cannot be negative."

**Tested By**: TEST-SC-VAL-009

---

### VAL-SC-010: Actual Quantity Required for Counted Items
**Priority**: High
**Enforcement**: Client, Server

**Rule**: When status is 'counted', actual_qty must be provided and non-negative.

**Validation Logic**:
```
IF status = 'counted' THEN
  IF actual_qty IS NULL THEN
    ERROR: "Actual quantity is required for counted items."
  ELSE IF actual_qty < 0 THEN
    ERROR: "Actual quantity cannot be negative."
  END IF
END IF
```

**Error Messages**:
- "Actual quantity is required for counted items."
- "Actual quantity cannot be negative."

**Tested By**: TEST-SC-VAL-010

---

### VAL-SC-011: Variance Calculation Accuracy
**Priority**: High
**Enforcement**: Server, Database

**Rule**: Variance quantity must equal (actual_qty - expected_qty) when both are provided.

**Validation Logic**:
```
IF actual_qty IS NOT NULL AND expected_qty IS NOT NULL THEN
  calculated_variance = actual_qty - expected_qty
  IF variance_qty != calculated_variance THEN
    ERROR: "Variance quantity calculation is incorrect."
  END IF
END IF
```

**Error Message**: "Variance quantity calculation is incorrect. Expected {calculated_variance}, got {variance_qty}."

**Tested By**: TEST-SC-VAL-011

---

### VAL-SC-012: Variance Percentage Calculation
**Priority**: High
**Enforcement**: Server, Database

**Rule**: Variance percentage must be calculated correctly: (variance_qty / expected_qty) * 100.

**Validation Logic**:
```
IF variance_qty IS NOT NULL AND expected_qty IS NOT NULL AND expected_qty != 0 THEN
  calculated_pct = (variance_qty / expected_qty) * 100
  IF ABS(variance_pct - calculated_pct) > 0.01 THEN
    ERROR: "Variance percentage calculation is incorrect."
  END IF
END IF
```

**Error Message**: "Variance percentage calculation is incorrect."

**Tested By**: TEST-SC-VAL-012

---

### VAL-SC-013: Variance Value Calculation
**Priority**: High
**Enforcement**: Server

**Rule**: Variance value must equal variance_qty * unit_cost.

**Validation Logic**:
```
IF variance_qty IS NOT NULL AND unit_cost IS NOT NULL THEN
  calculated_value = variance_qty * unit_cost
  IF ABS(variance_value - calculated_value) > 0.01 THEN
    ERROR: "Variance value calculation is incorrect."
  END IF
END IF
```

**Error Message**: "Variance value calculation is incorrect."

**Tested By**: TEST-SC-VAL-013

---

### VAL-SC-014: Unit Cost Non-Negative
**Priority**: High
**Enforcement**: Client, Server

**Rule**: Unit cost must be zero or positive.

**Validation Logic**:
```
IF unit_cost IS NOT NULL AND unit_cost < 0 THEN
  ERROR: "Unit cost cannot be negative."
END IF
```

**Error Message**: "Unit cost cannot be negative."

**Tested By**: TEST-SC-VAL-014

---

### VAL-SC-015: Remark Length Limit
**Priority**: Low
**Enforcement**: Client, Server

**Rule**: Remark field cannot exceed 500 characters.

**Validation Logic**:
```
IF remark IS NOT NULL AND LENGTH(remark) > 500 THEN
  ERROR: "Remark cannot exceed 500 characters."
END IF
```

**Error Message**: "Remark cannot exceed 500 characters. Current length: {length}."

**Tested By**: TEST-SC-VAL-015

---

### VAL-SC-016: Count Number Format
**Priority**: Medium
**Enforcement**: Server, Database

**Rule**: Count number must follow format: CNT-YYYY-NNNN (e.g., CNT-2024-0001).

**Validation Logic**:
```
IF count_no IS NOT NULL THEN
  IF count_no !~ '^CNT-\d{4}-\d{4}$' THEN
    ERROR: "Invalid count number format."
  END IF
END IF
```

**Error Message**: "Invalid count number format. Expected format: CNT-YYYY-NNNN (e.g., CNT-2024-0001)."

**Tested By**: TEST-SC-VAL-016

---

### VAL-SC-017: Detail Status Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Detail record status must be one of: 'pending', 'counted', 'skipped'.

**Validation Logic**:
```
IF status NOT IN ('pending', 'counted', 'skipped') THEN
  ERROR: "Invalid detail status."
END IF
```

**Error Message**: "Invalid detail status. Status must be pending, counted, or skipped."

**Tested By**: TEST-SC-VAL-017

---

### VAL-SC-018: Approval Required Fields
**Priority**: High
**Enforcement**: Server

**Rule**: When approved_by is set, approved_at must also be set.

**Validation Logic**:
```
IF approved_by IS NOT NULL AND approved_at IS NULL THEN
  ERROR: "Approval timestamp is required when approver is set."
ELSE IF approved_by IS NULL AND approved_at IS NOT NULL THEN
  ERROR: "Approver is required when approval timestamp is set."
END IF
```

**Error Messages**:
- "Approval timestamp is required when approver is set."
- "Approver is required when approval timestamp is set."

**Tested By**: TEST-SC-VAL-018

---

## Business Rule Validations

### VAL-SC-101: Minimum Product Count
**Priority**: High
**Enforcement**: Client, Server

**Rule**: A spot check must include at least 1 product.

**Validation Logic**:
```
product_count = COUNT(SELECT id FROM tb_count_stock_detail
                      WHERE count_stock_id = {id} AND deleted_at IS NULL)

IF product_count < 1 THEN
  ERROR: "Spot check must include at least 1 product."
END IF
```

**Error Message**: "Spot check must include at least 1 product. Please add products before proceeding."

**Business Rule Reference**: BR-SC-002

**Tested By**: TEST-SC-VAL-101

---

### VAL-SC-102: Maximum Product Count
**Priority**: High
**Enforcement**: Client, Server

**Rule**: A spot check cannot exceed 50 products.

**Validation Logic**:
```
product_count = COUNT(SELECT id FROM tb_count_stock_detail
                      WHERE count_stock_id = {id} AND deleted_at IS NULL)

IF product_count > 50 THEN
  ERROR: "Spot check cannot exceed 50 products."
END IF
```

**Error Message**: "Spot check cannot exceed 50 products. Current count: {product_count}. Please remove {excess} product(s)."

**Business Rule Reference**: BR-SC-002

**Tested By**: TEST-SC-VAL-102

---

### VAL-SC-103: Unique Products Per Spot Check
**Priority**: High
**Enforcement**: Server, Database

**Rule**: Each product can only appear once in a spot check.

**Validation Logic**:
```
duplicate_count = COUNT(SELECT product_id
                        FROM tb_count_stock_detail
                        WHERE count_stock_id = {id} AND deleted_at IS NULL
                        GROUP BY product_id
                        HAVING COUNT(*) > 1)

IF duplicate_count > 0 THEN
  ERROR: "Duplicate products detected in spot check."
END IF
```

**Error Message**: "Product '{product_name}' is already included in this spot check. Each product can only appear once."

**Business Rule Reference**: BR-SC-003

**Tested By**: TEST-SC-VAL-103

---

### VAL-SC-104: Status Transition - Pending to In Progress
**Priority**: High
**Enforcement**: Server

**Rule**: Spot check can transition from 'pending' to 'in_progress' only.

**Validation Logic**:
```
IF current_status = 'pending' THEN
  IF new_status NOT IN ('in_progress', 'cancelled') THEN
    ERROR: "Invalid status transition from pending."
  END IF
END IF
```

**Error Message**: "Invalid status transition. Pending spot checks can only be set to in_progress or cancelled."

**Business Rule Reference**: BR-SC-006

**Tested By**: TEST-SC-VAL-104

---

### VAL-SC-105: Status Transition - In Progress to Completed
**Priority**: High
**Enforcement**: Server

**Rule**: Spot check can transition from 'in_progress' to 'completed' only when all items are counted.

**Validation Logic**:
```
IF current_status = 'in_progress' AND new_status = 'completed' THEN
  pending_count = COUNT(SELECT id FROM tb_count_stock_detail
                        WHERE count_stock_id = {id}
                        AND status = 'pending'
                        AND deleted_at IS NULL)

  IF pending_count > 0 THEN
    ERROR: "Cannot complete spot check with pending items."
  END IF
END IF
```

**Error Message**: "Cannot complete spot check. {pending_count} item(s) still pending. Please count all items or mark them as skipped."

**Business Rule Reference**: BR-SC-007

**Tested By**: TEST-SC-VAL-105

---

### VAL-SC-106: Cannot Modify Completed Spot Check
**Priority**: Critical
**Enforcement**: Server

**Rule**: Completed spot checks cannot be modified (except for soft delete).

**Validation Logic**:
```
IF current_status = 'completed' THEN
  IF operation != 'soft_delete' THEN
    ERROR: "Cannot modify completed spot check."
  END IF
END IF
```

**Error Message**: "Cannot modify completed spot check '{count_no}'. Completed spot checks are locked for data integrity."

**Business Rule Reference**: BR-SC-008

**Tested By**: TEST-SC-VAL-106

---

### VAL-SC-107: Cannot Modify Cancelled Spot Check
**Priority**: High
**Enforcement**: Server

**Rule**: Cancelled spot checks cannot be modified (except for soft delete).

**Validation Logic**:
```
IF current_status = 'cancelled' THEN
  IF operation != 'soft_delete' THEN
    ERROR: "Cannot modify cancelled spot check."
  END IF
END IF
```

**Error Message**: "Cannot modify cancelled spot check '{count_no}'. Cancelled spot checks cannot be reopened."

**Business Rule Reference**: BR-SC-009

**Tested By**: TEST-SC-VAL-107

---

### VAL-SC-108: High Variance Threshold
**Priority**: High
**Enforcement**: Server

**Rule**: Items with >5% variance OR variance value >$100 require supervisor approval.

**Validation Logic**:
```
FOR EACH detail IN spot_check_details:
  IF (ABS(detail.variance_pct) > 5) OR (ABS(detail.variance_value) > 100) THEN
    detail.requires_approval = true
    IF spot_check.status = 'completed' AND detail.approved_by IS NULL THEN
      ERROR: "High variance items require supervisor approval."
    END IF
  END IF
END FOR
```

**Error Message**: "Product '{product_name}' has high variance ({variance_pct}% / ${variance_value}). Supervisor approval required before completion."

**Business Rule Reference**: BR-SC-020

**Tested By**: TEST-SC-VAL-108

---

### VAL-SC-109: Location Accessibility
**Priority**: High
**Enforcement**: Server

**Rule**: User must have access to the location to create/modify spot checks.

**Validation Logic**:
```
IF NOT user_has_location_access(user_id, location_id) THEN
  ERROR: "User does not have access to this location."
END IF
```

**Error Message**: "You do not have access to location '{location_name}'. Please contact your manager to request access."

**Business Rule Reference**: BR-SC-015

**Tested By**: TEST-SC-VAL-109

---

### VAL-SC-110: Cannot Add Products After In Progress
**Priority**: Medium
**Enforcement**: Server

**Rule**: Products cannot be added or removed once spot check is in_progress.

**Validation Logic**:
```
IF current_status = 'in_progress' THEN
  IF operation IN ('add_product', 'remove_product') THEN
    ERROR: "Cannot modify product list after counting has started."
  END IF
END IF
```

**Error Message**: "Cannot add or remove products after counting has started. Product list is locked once spot check is in progress."

**Business Rule Reference**: BR-SC-011

**Tested By**: TEST-SC-VAL-110

---

### VAL-SC-111: Approval Authority
**Priority**: Critical
**Enforcement**: Server

**Rule**: Only users with role 'supervisor' or 'manager' can approve high variance items.

**Validation Logic**:
```
IF operation = 'approve_variance' THEN
  IF user_role NOT IN ('supervisor', 'manager') THEN
    ERROR: "Insufficient permissions to approve high variance items."
  END IF
END IF
```

**Error Message**: "Only supervisors and managers can approve high variance items. Current role: {user_role}."

**Business Rule Reference**: BR-SC-021

**Tested By**: TEST-SC-VAL-111

---

### VAL-SC-112: ITS Integration Required
**Priority**: High
**Enforcement**: Server

**Rule**: Expected quantities must be fetched from ITS when starting spot check.

**Validation Logic**:
```
IF status = 'in_progress' THEN
  FOR EACH detail IN details:
    IF detail.expected_qty IS NULL AND ITS_available() THEN
      ERROR: "Expected quantities not retrieved from ITS."
    END IF
  END FOR
END IF
```

**Error Message**: "Failed to retrieve expected quantities from Inventory Transaction System. Please try again or contact support."

**Business Rule Reference**: BR-SC-023

**Tested By**: TEST-SC-VAL-112

---

## Cross-Field Validations

### VAL-SC-201: Count Date Cannot Exceed Current Date
**Priority**: High
**Enforcement**: Client, Server

**Rule**: Count date cannot be more than 1 day in the future.

**Validation Logic**:
```
IF count_date > (CURRENT_DATE + INTERVAL '1 day') THEN
  ERROR: "Count date cannot be more than 1 day in the future."
END IF
```

**Error Message**: "Count date cannot be more than 1 day in the future. Selected date: {count_date}, maximum allowed: {max_date}."

**Tested By**: TEST-SC-VAL-201

---

### VAL-SC-202: Approval Date After Count Date
**Priority**: Medium
**Enforcement**: Server

**Rule**: Approval timestamp must be equal to or after the count date.

**Validation Logic**:
```
IF approved_at IS NOT NULL AND count_date IS NOT NULL THEN
  IF DATE(approved_at) < count_date THEN
    ERROR: "Approval date cannot be before count date."
  END IF
END IF
```

**Error Message**: "Approval date ({approved_at}) cannot be before count date ({count_date})."

**Tested By**: TEST-SC-VAL-202

---

### VAL-SC-203: Cannot Count Before Pending
**Priority**: High
**Enforcement**: Server

**Rule**: Detail items cannot have status 'counted' when parent status is 'pending'.

**Validation Logic**:
```
IF parent_status = 'pending' THEN
  counted_items = COUNT(SELECT id FROM tb_count_stock_detail
                        WHERE count_stock_id = {id}
                        AND status = 'counted'
                        AND deleted_at IS NULL)

  IF counted_items > 0 THEN
    ERROR: "Cannot have counted items when spot check is pending."
  END IF
END IF
```

**Error Message**: "Items cannot be counted before starting the spot check. Please set status to 'in_progress' first."

**Tested By**: TEST-SC-VAL-203

---

### VAL-SC-204: Counted Timestamp Consistency
**Priority**: Medium
**Enforcement**: Server

**Rule**: counted_at timestamp must be set when status is 'counted'.

**Validation Logic**:
```
IF status = 'counted' AND counted_at IS NULL THEN
  ERROR: "Counted timestamp is required for counted items."
ELSE IF status != 'counted' AND counted_at IS NOT NULL THEN
  ERROR: "Counted timestamp should only be set for counted items."
END IF
```

**Error Messages**:
- "Counted timestamp is required for counted items."
- "Counted timestamp should only be set for counted items."

**Tested By**: TEST-SC-VAL-204

---

### VAL-SC-205: Total Items Consistency
**Priority**: Medium
**Enforcement**: Server

**Rule**: info.total_items must match actual count of detail records.

**Validation Logic**:
```
actual_count = COUNT(SELECT id FROM tb_count_stock_detail
                     WHERE count_stock_id = {id} AND deleted_at IS NULL)

IF info->>'total_items' IS NOT NULL THEN
  stored_count = CAST(info->>'total_items' AS INTEGER)
  IF stored_count != actual_count THEN
    ERROR: "Total items count mismatch."
  END IF
END IF
```

**Error Message**: "Total items count mismatch. Expected {actual_count}, got {stored_count}."

**Tested By**: TEST-SC-VAL-205

---

## Security Validations

### VAL-SC-301: User Authentication Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: All spot check operations require authenticated user.

**Validation Logic**:
```
IF user_session IS NULL OR user_session.expired THEN
  ERROR: "Authentication required."
END IF
```

**Error Message**: "Authentication required. Please log in to continue."

**Tested By**: TEST-SC-VAL-301

---

### VAL-SC-302: Role-Based Access Control
**Priority**: Critical
**Enforcement**: Server

**Rule**: User must have appropriate role to perform actions.

**Validation Logic**:
```
action_role_matrix = {
  'create': ['storekeeper', 'coordinator', 'supervisor', 'manager'],
  'update': ['storekeeper', 'coordinator', 'supervisor', 'manager'],
  'delete': ['supervisor', 'manager'],
  'approve': ['supervisor', 'manager'],
  'complete': ['coordinator', 'supervisor', 'manager']
}

IF user_role NOT IN action_role_matrix[action] THEN
  ERROR: "Insufficient permissions for this action."
END IF
```

**Error Message**: "Insufficient permissions to {action} spot checks. Required role: {required_roles}. Your role: {user_role}."

**Tested By**: TEST-SC-VAL-302

---

### VAL-SC-303: Location-Based Permissions
**Priority**: High
**Enforcement**: Server

**Rule**: User can only view/modify spot checks for locations they have access to.

**Validation Logic**:
```
user_locations = get_user_locations(user_id)

IF spot_check.location_id NOT IN user_locations THEN
  ERROR: "Access denied to location."
END IF
```

**Error Message**: "Access denied. You do not have permissions for location '{location_name}'."

**Tested By**: TEST-SC-VAL-303

---

### VAL-SC-304: Audit Trail Required
**Priority**: Critical
**Enforcement**: Server, Database

**Rule**: All modifications must be logged with user, timestamp, and action.

**Validation Logic**:
```
IF operation IN ('create', 'update', 'delete', 'complete') THEN
  IF NOT audit_log_created THEN
    ERROR: "Audit logging failed."
  END IF
END IF
```

**Error Message**: "System error: Audit logging failed. Operation aborted for data integrity."

**Tested By**: TEST-SC-VAL-304

---

## Error Messages

### Format Standards
All error messages follow this structure:
- **Field-Level**: "{Field name} {constraint}. {Additional context}."
- **Business Rule**: "Cannot {action} because {reason}. {Suggested action}."
- **Security**: "{Access type} denied. {Required permission}. {Current permission}."

### Error Message Categories

#### Validation Errors (400 Bad Request)
```json
{
  "error": "Validation Error",
  "code": "VAL-SC-XXX",
  "message": "Human-readable error message",
  "field": "field_name",
  "value": "submitted_value",
  "constraint": "validation_rule"
}
```

#### Business Rule Errors (422 Unprocessable Entity)
```json
{
  "error": "Business Rule Violation",
  "code": "VAL-SC-1XX",
  "message": "Human-readable error message",
  "rule": "business_rule_reference",
  "current_state": "current_value",
  "required_state": "required_value"
}
```

#### Security Errors (403 Forbidden)
```json
{
  "error": "Access Denied",
  "code": "VAL-SC-3XX",
  "message": "Human-readable error message",
  "required_permission": "permission_name",
  "user_role": "current_role"
}
```

---

## Test Scenarios

### TEST-SC-VAL-001: Count Type Validation
**Validates**: VAL-SC-001

**Test Cases**:
1. ✅ Create spot check with count_stock_type = 'spot' → Success
2. ❌ Create spot check with count_stock_type = 'physical' → Error
3. ❌ Create spot check with count_stock_type = NULL → Error
4. ❌ Update existing spot check to count_stock_type = 'physical' → Error

**Expected Results**:
- Case 1: Record created successfully
- Cases 2-4: Error "Invalid count type. This record must be a spot check."

---

### TEST-SC-VAL-002: Location Validation
**Validates**: VAL-SC-002

**Test Cases**:
1. ✅ Create spot check with valid, active location → Success
2. ❌ Create spot check with location_id = NULL → Error
3. ❌ Create spot check with non-existent location_id → Error
4. ❌ Create spot check with inactive location (deleted_at IS NOT NULL) → Error

**Expected Results**:
- Case 1: Record created successfully
- Case 2: Error "Location is required to create a spot check."
- Cases 3-4: Error "Invalid location. Please select an active location."

---

### TEST-SC-VAL-003: Count Date Required
**Validates**: VAL-SC-003

**Test Cases**:
1. ✅ Create spot check with valid count_date → Success
2. ❌ Create spot check with count_date = NULL → Error
3. ❌ Create spot check with count_date = 'invalid' → Error

**Expected Results**:
- Case 1: Record created successfully
- Case 2: Error "Count date is required."
- Case 3: Error "Invalid date format. Please use YYYY-MM-DD."

---

### TEST-SC-VAL-004: Count Date Range
**Validates**: VAL-SC-004

**Test Cases**:
1. ✅ Create spot check with count_date = today → Success
2. ✅ Create spot check with count_date = tomorrow → Success
3. ✅ Create spot check with count_date = 20 days ago → Success
4. ❌ Create spot check with count_date = 40 days ago → Error
5. ❌ Create spot check with count_date = 5 days in future → Error

**Expected Results**:
- Cases 1-3: Record created successfully
- Case 4: Error "Count date cannot be more than 30 days in the past."
- Case 5: Error "Count date cannot be more than 1 day in the future."

---

### TEST-SC-VAL-101: Minimum Product Count
**Validates**: VAL-SC-101

**Test Cases**:
1. ✅ Create spot check → Add 1 product → Set to in_progress → Success
2. ✅ Create spot check → Add 5 products → Set to in_progress → Success
3. ❌ Create spot check → Add 0 products → Set to in_progress → Error

**Expected Results**:
- Cases 1-2: Status transition successful
- Case 3: Error "Spot check must include at least 1 product. Please add products before proceeding."

---

### TEST-SC-VAL-102: Maximum Product Count
**Validates**: VAL-SC-102

**Test Cases**:
1. ✅ Create spot check → Add 50 products → Success
2. ❌ Create spot check → Add 51 products → Error
3. ✅ Create spot check → Add 45 products → Add 5 more → Success (total 50)
4. ❌ Create spot check → Add 48 products → Add 5 more → Error (would exceed 50)

**Expected Results**:
- Cases 1, 3: Products added successfully
- Cases 2, 4: Error "Spot check cannot exceed 50 products. Current count: {count}. Please remove {excess} product(s)."

---

### TEST-SC-VAL-103: Unique Products
**Validates**: VAL-SC-103

**Test Cases**:
1. ✅ Add Product A to spot check → Success
2. ✅ Add Product B to spot check → Success (different product)
3. ❌ Add Product A to spot check again → Error (duplicate)

**Expected Results**:
- Cases 1-2: Products added successfully
- Case 3: Error "Product 'Product A' is already included in this spot check. Each product can only appear once."

---

### TEST-SC-VAL-104: Status Transition - Pending
**Validates**: VAL-SC-104

**Test Cases**:
1. ✅ Pending → In Progress → Success
2. ✅ Pending → Cancelled → Success
3. ❌ Pending → Completed → Error
4. ❌ Pending → (invalid status) → Error

**Expected Results**:
- Cases 1-2: Status transition successful
- Cases 3-4: Error "Invalid status transition. Pending spot checks can only be set to in_progress or cancelled."

---

### TEST-SC-VAL-105: Completion Requires All Counted
**Validates**: VAL-SC-105

**Test Cases**:
1. ✅ In Progress → All items counted → Complete → Success
2. ✅ In Progress → Some items counted, rest skipped → Complete → Success
3. ❌ In Progress → Some items pending → Complete → Error
4. ❌ In Progress → No items counted → Complete → Error

**Expected Results**:
- Cases 1-2: Completion successful
- Cases 3-4: Error "Cannot complete spot check. {count} item(s) still pending. Please count all items or mark them as skipped."

---

### TEST-SC-VAL-106: Cannot Modify Completed
**Validates**: VAL-SC-106

**Test Cases**:
1. ❌ Update completed spot check count_date → Error
2. ❌ Add product to completed spot check → Error
3. ❌ Modify quantities in completed spot check → Error
4. ✅ Soft delete completed spot check → Success

**Expected Results**:
- Cases 1-3: Error "Cannot modify completed spot check 'CNT-2024-XXXX'. Completed spot checks are locked for data integrity."
- Case 4: Soft delete successful

---

### TEST-SC-VAL-108: High Variance Approval
**Validates**: VAL-SC-108

**Test Cases**:
1. ✅ Item variance 3%, $50 → No approval needed → Complete → Success
2. ❌ Item variance 8%, $50 → No approval → Complete → Error (>5% threshold)
3. ❌ Item variance 3%, $150 → No approval → Complete → Error (>$100 threshold)
4. ✅ Item variance 8%, $50 → Supervisor approves → Complete → Success
5. ✅ Item variance 3%, $150 → Supervisor approves → Complete → Success

**Expected Results**:
- Cases 1, 4, 5: Completion successful
- Cases 2-3: Error "Product '{name}' has high variance ({variance}). Supervisor approval required before completion."

---

### TEST-SC-VAL-109: Location Access
**Validates**: VAL-SC-109

**Test Cases**:
1. ✅ User with location access → Create spot check → Success
2. ❌ User without location access → Create spot check → Error
3. ❌ User without location access → View spot check → Error
4. ✅ User granted location access → View/create spot check → Success

**Expected Results**:
- Cases 1, 4: Operation successful
- Cases 2-3: Error "You do not have access to location '{name}'. Please contact your manager to request access."

---

### TEST-SC-VAL-110: Cannot Modify Product List After In Progress
**Validates**: VAL-SC-110

**Test Cases**:
1. ✅ Pending status → Add/remove products → Success
2. ❌ In Progress status → Add product → Error
3. ❌ In Progress status → Remove product → Error
4. ✅ In Progress status → Update quantities → Success (allowed)

**Expected Results**:
- Cases 1, 4: Operation successful
- Cases 2-3: Error "Cannot add or remove products after counting has started. Product list is locked once spot check is in progress."

---

### TEST-SC-VAL-111: Approval Authority
**Validates**: VAL-SC-111

**Test Cases**:
1. ✅ Supervisor role → Approve high variance → Success
2. ✅ Manager role → Approve high variance → Success
3. ❌ Coordinator role → Approve high variance → Error
4. ❌ Storekeeper role → Approve high variance → Error

**Expected Results**:
- Cases 1-2: Approval successful
- Cases 3-4: Error "Only supervisors and managers can approve high variance items. Current role: {role}."

---

### TEST-SC-VAL-302: Role-Based Access
**Validates**: VAL-SC-302

**Test Cases**:
1. ✅ Storekeeper → Create spot check → Success
2. ✅ Coordinator → Complete spot check → Success
3. ❌ Storekeeper → Complete spot check → Error
4. ❌ Coordinator → Delete spot check → Error
5. ✅ Manager → Delete spot check → Success

**Expected Results**:
- Cases 1, 2, 5: Operation successful
- Cases 3-4: Error "Insufficient permissions to {action} spot checks. Required role: {required}. Your role: {current}."

---

## Validation Matrix

| Validation ID | Priority | Client | Server | Database | Related BR | Test ID |
|---------------|----------|--------|--------|----------|------------|---------|
| VAL-SC-001 | Critical | ✅ | ✅ | ✅ | BR-SC-004 | TEST-SC-VAL-001 |
| VAL-SC-002 | Critical | ✅ | ✅ | ✅ | BR-SC-001 | TEST-SC-VAL-002 |
| VAL-SC-003 | High | ✅ | ✅ | - | BR-SC-001 | TEST-SC-VAL-003 |
| VAL-SC-004 | Medium | ✅ | ✅ | - | BR-SC-012 | TEST-SC-VAL-004 |
| VAL-SC-005 | Critical | ✅ | ✅ | ✅ | BR-SC-006 | TEST-SC-VAL-005 |
| VAL-SC-006 | Critical | - | ✅ | ✅ | - | TEST-SC-VAL-006 |
| VAL-SC-007 | Critical | ✅ | ✅ | ✅ | BR-SC-002 | TEST-SC-VAL-007 |
| VAL-SC-008 | Critical | ✅ | ✅ | ✅ | BR-SC-002 | TEST-SC-VAL-008 |
| VAL-SC-009 | High | ✅ | ✅ | ✅ | BR-SC-018 | TEST-SC-VAL-009 |
| VAL-SC-010 | High | ✅ | ✅ | - | BR-SC-019 | TEST-SC-VAL-010 |
| VAL-SC-011 | High | - | ✅ | ✅ | BR-SC-018 | TEST-SC-VAL-011 |
| VAL-SC-012 | High | - | ✅ | ✅ | BR-SC-018 | TEST-SC-VAL-012 |
| VAL-SC-013 | High | - | ✅ | - | BR-SC-018 | TEST-SC-VAL-013 |
| VAL-SC-014 | High | ✅ | ✅ | - | BR-SC-022 | TEST-SC-VAL-014 |
| VAL-SC-015 | Low | ✅ | ✅ | - | - | TEST-SC-VAL-015 |
| VAL-SC-016 | Medium | - | ✅ | ✅ | BR-SC-013 | TEST-SC-VAL-016 |
| VAL-SC-017 | Critical | ✅ | ✅ | ✅ | BR-SC-010 | TEST-SC-VAL-017 |
| VAL-SC-018 | High | - | ✅ | - | BR-SC-021 | TEST-SC-VAL-018 |
| VAL-SC-101 | High | ✅ | ✅ | - | BR-SC-002 | TEST-SC-VAL-101 |
| VAL-SC-102 | High | ✅ | ✅ | - | BR-SC-002 | TEST-SC-VAL-102 |
| VAL-SC-103 | High | - | ✅ | ✅ | BR-SC-003 | TEST-SC-VAL-103 |
| VAL-SC-104 | High | - | ✅ | - | BR-SC-006 | TEST-SC-VAL-104 |
| VAL-SC-105 | High | - | ✅ | - | BR-SC-007 | TEST-SC-VAL-105 |
| VAL-SC-106 | Critical | - | ✅ | - | BR-SC-008 | TEST-SC-VAL-106 |
| VAL-SC-107 | High | - | ✅ | - | BR-SC-009 | TEST-SC-VAL-107 |
| VAL-SC-108 | High | - | ✅ | - | BR-SC-020 | TEST-SC-VAL-108 |
| VAL-SC-109 | High | - | ✅ | - | BR-SC-015 | TEST-SC-VAL-109 |
| VAL-SC-110 | Medium | - | ✅ | - | BR-SC-011 | TEST-SC-VAL-110 |
| VAL-SC-111 | Critical | - | ✅ | - | BR-SC-021 | TEST-SC-VAL-111 |
| VAL-SC-112 | High | - | ✅ | - | BR-SC-023 | TEST-SC-VAL-112 |
| VAL-SC-201 | High | ✅ | ✅ | - | BR-SC-012 | TEST-SC-VAL-201 |
| VAL-SC-202 | Medium | - | ✅ | - | BR-SC-021 | TEST-SC-VAL-202 |
| VAL-SC-203 | High | - | ✅ | - | BR-SC-006 | TEST-SC-VAL-203 |
| VAL-SC-204 | Medium | - | ✅ | - | BR-SC-019 | TEST-SC-VAL-204 |
| VAL-SC-205 | Medium | - | ✅ | - | BR-SC-002 | TEST-SC-VAL-205 |
| VAL-SC-301 | Critical | - | ✅ | - | BR-SC-024 | TEST-SC-VAL-301 |
| VAL-SC-302 | Critical | - | ✅ | - | BR-SC-014 | TEST-SC-VAL-302 |
| VAL-SC-303 | High | - | ✅ | - | BR-SC-015 | TEST-SC-VAL-303 |
| VAL-SC-304 | Critical | - | ✅ | ✅ | BR-SC-017 | TEST-SC-VAL-304 |

---

## Implementation Notes

### Client-Side Validation (React Hook Form + Zod)
```typescript
// Example Zod schema for spot check creation
const spotCheckSchema = z.object({
  count_stock_type: z.literal('spot'),
  location_id: z.string().uuid(),
  count_date: z.date()
    .min(subDays(new Date(), 30))
    .max(addDays(new Date(), 1)),
  products: z.array(z.string().uuid())
    .min(1, "At least 1 product required")
    .max(50, "Maximum 50 products allowed")
});
```

### Server-Side Validation (Server Actions)
```typescript
// Example server action validation
async function validateSpotCheck(data: SpotCheckInput) {
  // Field-level validations
  if (data.count_stock_type !== 'spot') {
    throw new ValidationError('VAL-SC-001');
  }

  // Business rule validations
  const productCount = data.products.length;
  if (productCount < 1) {
    throw new BusinessRuleError('VAL-SC-101');
  }
  if (productCount > 50) {
    throw new BusinessRuleError('VAL-SC-102');
  }

  // Security validations
  if (!hasLocationAccess(user.id, data.location_id)) {
    throw new SecurityError('VAL-SC-303');
  }
}
```

### Database Validation (Constraints + Triggers)
```sql
-- Example constraint: count_stock_type must be 'spot'
ALTER TABLE tb_count_stock
ADD CONSTRAINT chk_spot_check_type
CHECK (count_stock_type = 'spot');

-- Example trigger: validate variance calculation
CREATE TRIGGER trg_validate_variance
BEFORE INSERT OR UPDATE ON tb_count_stock_detail
FOR EACH ROW
EXECUTE FUNCTION validate_variance_calculation();
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-11 | System | Initial validation documentation for Spot Check sub-module |

---

## References

1. **Business Requirements**: BR-spot-check.md
2. **Use Cases**: UC-spot-check.md
3. **Technical Specification**: TS-spot-check.md
4. **Data Definition**: DD-spot-check.md
5. **Flow Diagrams**: FD-spot-check.md
6. **Database Schema**: schema.prisma (tb_count_stock, tb_count_stock_detail)
7. **WCAG 2.1 AA Standards**: https://www.w3.org/WAI/WCAG21/quickref/
8. **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

**Document Control**:
- **Classification**: Internal Use
- **Status**: Draft
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
