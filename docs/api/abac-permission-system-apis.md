# Carmen ERP ABAC Permission System - API Specification

## Overview

This document provides a comprehensive API specification for the Carmen ERP Attribute-Based Access Control (ABAC) permission system. The APIs are organized into logical categories that support the complete ABAC lifecycle from permission evaluation to system administration.

## API Categories

1. [Permission Evaluation APIs](#permission-evaluation-apis)
2. [Policy Management APIs](#policy-management-apis) 
3. [Attribute Management APIs](#attribute-management-apis)
4. [User & Role Management APIs](#user--role-management-apis)
5. [Audit & Analytics APIs](#audit--analytics-apis)
6. [System Administration APIs](#system-administration-apis)

## General API Conventions

### Base URL
```
/api/v1/permissions
```

### Authentication
All APIs require JWT bearer token authentication:
```http
Authorization: Bearer <jwt_token>
```

### Content Types
- Request: `application/json`
- Response: `application/json`

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User does not have permission to perform this action",
    "details": {
      "userId": "user123",
      "resourceType": "purchase_order",
      "action": "approve"
    },
    "timestamp": "2025-01-28T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Permission Evaluation APIs

### 1. Check Single Permission

Evaluate if a user has permission to perform a specific action on a resource.

**Endpoint:** `POST /check`

**Request:**
```json
{
  "userId": "user123",
  "resourceType": "purchase_order",
  "resourceId": "po_456", // Optional
  "action": "approve",
  "context": {
    "department": "procurement",
    "location": "hotel_main",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "session_789",
    "requestId": "req_abc123",
    "additionalAttributes": {
      "urgency": "high",
      "amount": 5000
    }
  },
  "options": {
    "resolveAttributes": true,
    "enableCaching": true,
    "auditEnabled": true
  }
}
```

**Response:**
```json
{
  "allowed": true,
  "reason": "User has approval authority for purchase orders up to $10,000",
  "decision": {
    "effect": "permit",
    "reason": "Policy PO_APPROVAL_LIMIT matched",
    "evaluatedPolicies": [
      {
        "policyId": "policy_001",
        "effect": "permit",
        "matches": true,
        "evaluationTime": 15
      }
    ]
  },
  "executionTime": 45,
  "attributeResolutionTime": 12,
  "resolvedAttributes": {
    "subject": {
      "roleNames": ["procurement_manager"],
      "approvalLimit": 10000,
      "department": "procurement"
    },
    "resource": {
      "category": "purchase_order",
      "amount": 5000,
      "status": "pending_approval"
    },
    "environment": {
      "isBusinessHours": true,
      "riskScore": 0.2
    }
  },
  "matchedPolicies": ["policy_001"],
  "auditLogId": "audit_xyz789"
}
```

### 2. Bulk Permission Check

Check multiple permissions for a user in a single request.

**Endpoint:** `POST /check/bulk`

**Request:**
```json
{
  "userId": "user123",
  "permissions": [
    {
      "resourceType": "purchase_order",
      "resourceId": "po_456",
      "action": "approve"
    },
    {
      "resourceType": "purchase_request", 
      "action": "create"
    },
    {
      "resourceType": "vendor",
      "action": "update"
    }
  ],
  "context": {
    "department": "procurement",
    "location": "hotel_main"
  },
  "options": {
    "resolveAttributes": true,
    "enableCaching": true,
    "auditEnabled": false
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "resourceType": "purchase_order",
      "resourceId": "po_456", 
      "action": "approve",
      "allowed": true,
      "reason": "Policy PO_APPROVAL_LIMIT matched",
      "executionTime": 25
    },
    {
      "resourceType": "purchase_request",
      "action": "create", 
      "allowed": true,
      "reason": "Standard procurement role permissions",
      "executionTime": 18
    },
    {
      "resourceType": "vendor",
      "action": "update",
      "allowed": false,
      "reason": "Insufficient role permissions for vendor management",
      "executionTime": 12
    }
  ],
  "totalExecutionTime": 55,
  "attributeResolutionTime": 8
}
```

### 3. Get User Effective Permissions

Retrieve all effective permissions for a user based on current policies.

**Endpoint:** `GET /users/{userId}/permissions`

**Query Parameters:**
- `context[department]` (optional) - Department context
- `context[location]` (optional) - Location context
- `resourceType` (optional) - Filter by resource type
- `action` (optional) - Filter by action

**Response:**
```json
{
  "userId": "user123",
  "effectivePermissions": [
    {
      "id": "perm_001",
      "resourceType": "purchase_request",
      "action": "create",
      "effect": "permit",
      "source": "policy",
      "grantedAt": "2025-01-28T10:00:00Z",
      "grantedBy": "system",
      "conditions": {
        "maxAmount": 5000,
        "department": "procurement"
      }
    },
    {
      "id": "perm_002", 
      "resourceType": "purchase_order",
      "action": "approve",
      "effect": "permit",
      "source": "role",
      "grantedAt": "2025-01-28T10:00:00Z",
      "grantedBy": "admin_user",
      "conditions": {
        "maxAmount": 10000
      }
    }
  ],
  "context": {
    "department": "procurement",
    "location": "hotel_main",
    "timestamp": "2025-01-28T10:30:00Z"
  }
}
```

### 4. Permission Validation with Context

Validate permission with extensive context information for complex scenarios.

**Endpoint:** `POST /validate`

**Request:**
```json
{
  "userId": "user123",
  "resourceType": "purchase_order",
  "resourceId": "po_456",
  "action": "approve", 
  "subjectAttributes": {
    "roles": ["procurement_manager"],
    "department": "procurement",
    "approvalLimit": 10000,
    "clearanceLevel": "internal"
  },
  "resourceAttributes": {
    "totalValue": 8500,
    "priority": "high",
    "documentStatus": {
      "status": "pending_approval",
      "stage": "manager_review"
    },
    "requiresAudit": true
  },
  "environmentAttributes": {
    "currentTime": "2025-01-28T10:30:00Z",
    "isBusinessHours": true,
    "requestIP": "192.168.1.100",
    "deviceType": "desktop",
    "threatLevel": "low"
  },
  "options": {
    "detailed": true,
    "includeAdvice": true,
    "includeObligations": true
  }
}
```

**Response:**
```json
{
  "allowed": true,
  "decision": {
    "effect": "permit",
    "reason": "Manager approval within limits during business hours",
    "evaluatedPolicies": [
      {
        "policyId": "po_manager_approval",
        "effect": "permit",
        "matches": true,
        "ruleResults": {
          "amount_check": true,
          "business_hours": true,
          "role_check": true
        }
      }
    ]
  },
  "obligations": [
    {
      "id": "audit_requirement",
      "type": "audit",
      "description": "High-value approval requires audit log",
      "attributes": {
        "auditLevel": "detailed",
        "retentionPeriod": 2555 // 7 years in days
      }
    }
  ],
  "advice": [
    {
      "id": "two_factor_recommendation", 
      "type": "recommendation",
      "message": "Consider requiring two-factor authentication for high-value approvals"
    }
  ],
  "confidenceLevel": 95,
  "executionTime": 67
}
```

---

## Policy Management APIs

### 1. Create Policy

Create a new ABAC policy.

**Endpoint:** `POST /policies`

**Request:**
```json
{
  "name": "Purchase Order Manager Approval",
  "description": "Allows managers to approve purchase orders within their limit",
  "priority": 100,
  "effect": "permit",
  "enabled": true,
  "target": {
    "subjects": [
      {
        "attribute": "roles",
        "operator": "contains", 
        "value": "procurement_manager"
      }
    ],
    "resources": [
      {
        "attribute": "resourceType",
        "operator": "==",
        "value": "purchase_order"
      }
    ],
    "actions": ["approve"],
    "environment": [
      {
        "attribute": "isBusinessHours", 
        "operator": "==",
        "value": true
      }
    ]
  },
  "rules": [
    {
      "id": "amount_within_limit",
      "description": "Purchase amount within manager approval limit",
      "condition": {
        "type": "simple",
        "attribute": "resource.totalValue.amount",
        "operator": "<=", 
        "value": "subject.approvalLimit"
      }
    }
  ],
  "obligations": [
    {
      "id": "audit_high_value",
      "type": "audit",
      "attributes": {
        "condition": "resource.totalValue.amount > 5000",
        "auditLevel": "detailed"
      }
    }
  ],
  "category": "approval_workflows",
  "tags": ["procurement", "approval", "manager"],
  "effectiveFrom": "2025-01-28T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "policy_abc123",
  "name": "Purchase Order Manager Approval",
  "version": "1.0",
  "status": "active",
  "createdAt": "2025-01-28T10:30:00Z",
  "createdBy": "admin_user",
  "validationResults": {
    "valid": true,
    "warnings": [],
    "conflicts": []
  }
}
```

### 2. Get Policy

Retrieve a specific policy by ID.

**Endpoint:** `GET /policies/{policyId}`

**Response:**
```json
{
  "id": "policy_abc123",
  "name": "Purchase Order Manager Approval",
  "description": "Allows managers to approve purchase orders within their limit",
  "priority": 100,
  "effect": "permit",
  "enabled": true,
  "target": {
    "subjects": [
      {
        "attribute": "roles",
        "operator": "contains",
        "value": "procurement_manager"
      }
    ],
    "resources": [
      {
        "attribute": "resourceType", 
        "operator": "==",
        "value": "purchase_order"
      }
    ],
    "actions": ["approve"],
    "environment": [
      {
        "attribute": "isBusinessHours",
        "operator": "==", 
        "value": true
      }
    ]
  },
  "rules": [
    {
      "id": "amount_within_limit",
      "description": "Purchase amount within manager approval limit",
      "condition": {
        "type": "simple",
        "attribute": "resource.totalValue.amount",
        "operator": "<=",
        "value": "subject.approvalLimit"
      }
    }
  ],
  "version": "1.2",
  "createdBy": "admin_user",
  "createdAt": "2025-01-28T10:30:00Z",
  "updatedBy": "admin_user",
  "updatedAt": "2025-01-28T11:15:00Z",
  "tags": ["procurement", "approval", "manager"],
  "category": "approval_workflows",
  "effectiveFrom": "2025-01-28T00:00:00Z",
  "testScenarios": [
    {
      "id": "scenario_001",
      "name": "Manager approves within limit",
      "description": "Test manager approval for purchase order under limit",
      "expectedResult": "permit"
    }
  ]
}
```

### 3. List Policies

Retrieve a list of policies with filtering and pagination.

**Endpoint:** `GET /policies`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status (active, inactive, draft)
- `category` - Filter by category
- `priority_min` - Minimum priority
- `priority_max` - Maximum priority
- `effect` - Filter by effect (permit, deny)
- `tags` - Filter by tags (comma-separated)
- `search` - Search in name and description
- `sort` - Sort field (priority, name, createdAt, updatedAt)
- `order` - Sort order (asc, desc)

**Response:**
```json
{
  "policies": [
    {
      "id": "policy_abc123",
      "name": "Purchase Order Manager Approval", 
      "description": "Allows managers to approve purchase orders within their limit",
      "priority": 100,
      "effect": "permit",
      "enabled": true,
      "category": "approval_workflows",
      "tags": ["procurement", "approval", "manager"],
      "version": "1.2",
      "createdAt": "2025-01-28T10:30:00Z",
      "updatedAt": "2025-01-28T11:15:00Z",
      "createdBy": "admin_user"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "status": "active",
    "category": "approval_workflows"
  }
}
```

### 4. Update Policy

Update an existing policy.

**Endpoint:** `PUT /policies/{policyId}`

**Request:**
```json
{
  "name": "Purchase Order Manager Approval - Updated",
  "description": "Updated policy for manager approvals",
  "priority": 150,
  "enabled": true,
  "rules": [
    {
      "id": "amount_within_limit",
      "description": "Purchase amount within manager approval limit",
      "condition": {
        "type": "simple", 
        "attribute": "resource.totalValue.amount",
        "operator": "<=",
        "value": "subject.approvalLimit"
      }
    },
    {
      "id": "business_hours_check",
      "description": "Approval only during business hours",
      "condition": {
        "type": "simple",
        "attribute": "environment.isBusinessHours",
        "operator": "==",
        "value": true
      }
    }
  ],
  "versionNote": "Added business hours requirement"
}
```

**Response:**
```json
{
  "id": "policy_abc123",
  "name": "Purchase Order Manager Approval - Updated",
  "version": "1.3",
  "previousVersion": "1.2", 
  "status": "active",
  "updatedAt": "2025-01-28T12:00:00Z",
  "updatedBy": "admin_user",
  "validationResults": {
    "valid": true,
    "warnings": [
      "Priority increased - may affect policy evaluation order"
    ],
    "conflicts": []
  },
  "changesSummary": {
    "rulesAdded": 1,
    "rulesModified": 0,
    "rulesRemoved": 0,
    "priorityChanged": true
  }
}
```

### 5. Delete Policy

Delete a policy (soft delete with deactivation).

**Endpoint:** `DELETE /policies/{policyId}`

**Query Parameters:**
- `force` - Permanently delete (default: false)

**Response:**
```json
{
  "id": "policy_abc123",
  "status": "deleted",
  "deletedAt": "2025-01-28T12:15:00Z",
  "deletedBy": "admin_user",
  "affectedUsers": 0,
  "affectedRoles": 2
}
```

### 6. Test Policy

Test a policy against scenarios without activating it.

**Endpoint:** `POST /policies/{policyId}/test`

**Request:**
```json
{
  "scenarios": [
    {
      "name": "Manager approval within limit",
      "subjectAttributes": {
        "userId": "user123",
        "roles": ["procurement_manager"],
        "approvalLimit": 10000,
        "department": "procurement"
      },
      "resourceAttributes": {
        "resourceType": "purchase_order",
        "totalValue": { "amount": 7500, "currency": "USD" },
        "priority": "normal"
      },
      "environmentAttributes": {
        "isBusinessHours": true,
        "currentTime": "2025-01-28T14:00:00Z"
      },
      "action": "approve",
      "expectedResult": "permit"
    },
    {
      "name": "Manager approval over limit", 
      "subjectAttributes": {
        "userId": "user124",
        "roles": ["procurement_manager"],
        "approvalLimit": 5000,
        "department": "procurement"
      },
      "resourceAttributes": {
        "resourceType": "purchase_order",
        "totalValue": { "amount": 7500, "currency": "USD" }
      },
      "environmentAttributes": {
        "isBusinessHours": true
      },
      "action": "approve",
      "expectedResult": "deny"
    }
  ]
}
```

**Response:**
```json
{
  "policyId": "policy_abc123",
  "testResults": [
    {
      "scenarioName": "Manager approval within limit",
      "passed": true,
      "actualResult": "permit",
      "expectedResult": "permit",
      "executionTime": 23,
      "ruleResults": {
        "amount_within_limit": true,
        "business_hours_check": true
      }
    },
    {
      "scenarioName": "Manager approval over limit",
      "passed": true,
      "actualResult": "deny", 
      "expectedResult": "deny",
      "executionTime": 19,
      "ruleResults": {
        "amount_within_limit": false,
        "business_hours_check": true
      }
    }
  ],
  "summary": {
    "totalScenarios": 2,
    "passed": 2,
    "failed": 0,
    "passRate": 100
  }
}
```

### 7. Validate Policy

Validate policy syntax and logic without saving.

**Endpoint:** `POST /policies/validate`

**Request:**
```json
{
  "name": "Test Policy",
  "effect": "permit",
  "target": {
    "subjects": [
      {
        "attribute": "roles",
        "operator": "contains",
        "value": "test_role"
      }
    ]
  },
  "rules": [
    {
      "id": "test_rule",
      "condition": {
        "type": "simple",
        "attribute": "subject.department", 
        "operator": "==",
        "value": "test_dept"
      }
    }
  ]
}
```

**Response:**
```json
{
  "valid": true,
  "warnings": [],
  "errors": [],
  "conflicts": [],
  "suggestions": [
    "Consider adding environment conditions for better security"
  ],
  "complexity": {
    "score": 2.5,
    "level": "simple"
  }
}
```

---

## Attribute Management APIs

### 1. Resolve Subject Attributes

Resolve all attributes for a subject (user).

**Endpoint:** `GET /attributes/subjects/{userId}`

**Query Parameters:**
- `context[department]` - Department context
- `context[location]` - Location context
- `includeComputed` - Include computed attributes (default: true)

**Response:**
```json
{
  "subjectId": "user123",
  "attributes": {
    "userId": "user123",
    "username": "john.manager",
    "email": "john@hotel.com",
    "role": {
      "id": "role_001",
      "name": "procurement_manager", 
      "hierarchy": 3
    },
    "roles": [
      {
        "id": "role_001",
        "name": "procurement_manager",
        "hierarchy": 3
      },
      {
        "id": "role_002", 
        "name": "staff",
        "hierarchy": 1
      }
    ],
    "department": {
      "id": "dept_001",
      "name": "procurement",
      "code": "PROC"
    },
    "departments": [
      {
        "id": "dept_001",
        "name": "procurement",
        "code": "PROC"
      }
    ],
    "location": {
      "id": "loc_001",
      "name": "hotel_main",
      "type": "hotel"
    },
    "employeeType": "full-time",
    "seniority": 5.5,
    "clearanceLevel": "internal",
    "approvalLimit": {
      "amount": 10000,
      "currency": "USD"
    },
    "accountStatus": "active",
    "onDuty": true,
    "shiftTiming": {
      "start": "2025-01-28T08:00:00Z",
      "end": "2025-01-28T17:00:00Z"
    },
    "currentSession": {
      "sessionId": "session_789",
      "loginTime": "2025-01-28T08:30:00Z",
      "lastActivity": "2025-01-28T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "deviceType": "desktop"
    }
  },
  "computedAttributes": {
    "effectivePermissions": ["purchase_order:approve", "purchase_request:create"],
    "workflowStages": ["manager_review", "final_approval"],
    "riskProfile": "low"
  },
  "resolvedAt": "2025-01-28T10:30:00Z",
  "cacheHit": false
}
```

### 2. Resolve Resource Attributes

Resolve attributes for a specific resource.

**Endpoint:** `GET /attributes/resources/{resourceType}/{resourceId}`

**Response:**
```json
{
  "resourceId": "po_456",
  "resourceType": "purchase_order",
  "attributes": {
    "resourceName": "Office Supplies Purchase Order",
    "owner": "user123",
    "ownerDepartment": "procurement", 
    "dataClassification": "internal",
    "documentStatus": {
      "status": "pending_approval",
      "stage": "manager_review",
      "approvalLevel": 1
    },
    "priority": "normal",
    "totalValue": {
      "amount": 7500,
      "currency": "USD"
    },
    "budgetCategory": "operational_expenses",
    "costCenter": "proc_001",
    "createdAt": "2025-01-28T09:00:00Z",
    "updatedAt": "2025-01-28T10:00:00Z",
    "requiresAudit": true,
    "regulatoryFlags": [],
    "complianceRequirements": ["standard_procurement"]
  },
  "computedAttributes": {
    "riskScore": 0.3,
    "urgencyLevel": "medium",
    "approvalChain": ["manager", "director"]
  },
  "resolvedAt": "2025-01-28T10:30:00Z"
}
```

### 3. Resolve Environment Attributes  

Get current environment context attributes.

**Endpoint:** `GET /attributes/environment`

**Query Parameters:**
- `ipAddress` - Client IP address
- `userAgent` - Client user agent
- `sessionId` - Session identifier

**Response:**
```json
{
  "currentTime": "2025-01-28T10:30:00Z",
  "dayOfWeek": "tuesday",
  "isBusinessHours": true,
  "isHoliday": false,
  "timeZone": "America/New_York",
  "requestIP": "192.168.1.100",
  "requestLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 100
  },
  "isInternalNetwork": true,
  "facility": "hotel_main",
  "country": "US",
  "region": "northeast",
  "deviceType": "desktop",
  "userAgent": "Mozilla/5.0...",
  "sessionAge": 120,
  "systemLoad": "normal",
  "maintenanceMode": false,
  "emergencyMode": false,
  "systemVersion": "2.1.0",
  "threatLevel": "low",
  "auditMode": false,
  "requestSource": "ui",
  "batchOperation": false
}
```

### 4. Resolve Action Attributes

Get attributes for a specific action type.

**Endpoint:** `GET /attributes/actions/{action}`

**Response:**
```json
{
  "action": "approve",
  "attributes": {
    "actionType": "approve",
    "category": "workflow_action",
    "riskLevel": "medium",
    "requiresApproval": false,
    "auditRequired": true,
    "reversible": false,
    "impactLevel": "high",
    "requiredClearance": "internal",
    "timeConstraints": {
      "businessHoursOnly": true,
      "maxExecutionTime": 300
    },
    "prerequisites": ["valid_session", "authorized_role"],
    "sideEffects": ["status_change", "notification_trigger"]
  },
  "resolvedAt": "2025-01-28T10:30:00Z"
}
```

### 5. Bulk Attribute Resolution

Resolve multiple attribute types in a single request.

**Endpoint:** `POST /attributes/resolve`

**Request:**
```json
{
  "subjectId": "user123",
  "resourceType": "purchase_order",
  "resourceId": "po_456",
  "actionType": "approve",
  "environmentContext": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "session_789"
  },
  "options": {
    "includeComputed": true,
    "enableCaching": true
  }
}
```

**Response:**
```json
{
  "subject": {
    "subjectId": "user123",
    "attributes": {
      "roles": ["procurement_manager"],
      "department": "procurement",
      "approvalLimit": 10000
    }
  },
  "resource": {
    "resourceId": "po_456",
    "resourceType": "purchase_order", 
    "attributes": {
      "totalValue": 7500,
      "priority": "normal",
      "status": "pending_approval"
    }
  },
  "action": {
    "action": "approve",
    "attributes": {
      "riskLevel": "medium",
      "auditRequired": true
    }
  },
  "environment": {
    "attributes": {
      "isBusinessHours": true,
      "threatLevel": "low",
      "deviceType": "desktop"
    }
  },
  "resolutionTime": 45,
  "cacheHits": 2,
  "resolvedAt": "2025-01-28T10:30:00Z"
}
```

### 6. Cache Management

Invalidate attribute cache for specific entities.

**Endpoint:** `DELETE /attributes/cache`

**Request:**
```json
{
  "type": "subject", // subject, resource, environment, action, all
  "ids": ["user123", "user124"], // Optional: specific IDs to invalidate
  "reason": "Role update"
}
```

**Response:**
```json
{
  "invalidated": true,
  "type": "subject",
  "affectedIds": ["user123", "user124"],
  "cacheEntriesRemoved": 12,
  "timestamp": "2025-01-28T10:30:00Z"
}
```

---

## User & Role Management APIs

### 1. Get User Role Assignments

Retrieve all role assignments for a user.

**Endpoint:** `GET /users/{userId}/roles`

**Response:**
```json
{
  "userId": "user123",
  "roles": [
    {
      "roleId": "role_001",
      "roleName": "procurement_manager",
      "assignedAt": "2025-01-20T10:00:00Z",
      "assignedBy": "admin_user",
      "validFrom": "2025-01-20T00:00:00Z",
      "validUntil": null,
      "context": {
        "department": "procurement",
        "location": "hotel_main"
      },
      "source": "manual",
      "active": true
    },
    {
      "roleId": "role_002",
      "roleName": "staff",
      "assignedAt": "2025-01-15T10:00:00Z",
      "assignedBy": "hr_manager",
      "validFrom": "2025-01-15T00:00:00Z",
      "context": {
        "department": "all",
        "location": "all"
      },
      "source": "automatic",
      "active": true
    }
  ],
  "effectiveRoles": [
    {
      "roleId": "role_001",
      "roleName": "procurement_manager",
      "hierarchy": 3,
      "permissions": ["purchase_order:approve", "purchase_request:create"],
      "inheritedFrom": null
    },
    {
      "roleId": "role_002", 
      "roleName": "staff",
      "hierarchy": 1,
      "permissions": ["dashboard:view", "profile:update"],
      "inheritedFrom": null
    }
  ]
}
```

### 2. Assign Role to User

Assign a role to a user with context and validity period.

**Endpoint:** `POST /users/{userId}/roles`

**Request:**
```json
{
  "roleId": "role_003",
  "context": {
    "department": "finance",
    "location": "hotel_main"
  },
  "validFrom": "2025-01-28T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "reason": "Temporary finance role for project",
  "assignedBy": "admin_user"
}
```

**Response:**
```json
{
  "assignmentId": "assignment_123",
  "userId": "user123",
  "roleId": "role_003",
  "roleName": "financial_analyst",
  "assignedAt": "2025-01-28T10:30:00Z",
  "assignedBy": "admin_user",
  "status": "active",
  "effectiveImmediately": true
}
```

### 3. Remove Role from User

Remove a role assignment from a user.

**Endpoint:** `DELETE /users/{userId}/roles/{roleId}`

**Request:**
```json
{
  "reason": "Project completed",
  "effectiveDate": "2025-01-28T23:59:59Z"
}
```

**Response:**
```json
{
  "userId": "user123",
  "roleId": "role_003",
  "removedAt": "2025-01-28T10:30:00Z",
  "removedBy": "admin_user",
  "effectiveDate": "2025-01-28T23:59:59Z",
  "affectedPermissions": ["financial_report:view", "budget:update"]
}
```

### 4. Get Role Hierarchy

Retrieve the complete role hierarchy structure.

**Endpoint:** `GET /roles/hierarchy`

**Response:**
```json
{
  "hierarchy": [
    {
      "roleId": "role_admin",
      "roleName": "system_administrator",
      "level": 5,
      "parentRoles": [],
      "childRoles": ["role_manager"],
      "permissions": ["*:*"],
      "userCount": 2
    },
    {
      "roleId": "role_manager",
      "roleName": "department_manager", 
      "level": 4,
      "parentRoles": ["role_admin"],
      "childRoles": ["role_supervisor"],
      "permissions": ["department:*", "user:manage"],
      "userCount": 15
    },
    {
      "roleId": "role_supervisor",
      "roleName": "supervisor",
      "level": 3,
      "parentRoles": ["role_manager"],
      "childRoles": ["role_staff"],
      "permissions": ["workflow:approve", "report:view"],
      "userCount": 45
    },
    {
      "roleId": "role_staff",
      "roleName": "staff",
      "level": 1,
      "parentRoles": ["role_supervisor"],
      "childRoles": [],
      "permissions": ["profile:update", "dashboard:view"],
      "userCount": 200
    }
  ],
  "maxLevel": 5,
  "totalRoles": 4
}
```

### 5. Get Role Permissions

Get all permissions for a specific role including inherited permissions.

**Endpoint:** `GET /roles/{roleId}/permissions`

**Query Parameters:**
- `includeInherited` - Include inherited permissions (default: true)
- `context[department]` - Filter by department context
- `context[location]` - Filter by location context

**Response:**
```json
{
  "roleId": "role_001",
  "roleName": "procurement_manager",
  "permissions": {
    "direct": [
      {
        "permission": "purchase_order:approve",
        "grantedAt": "2025-01-20T10:00:00Z",
        "conditions": {
          "maxAmount": 10000,
          "department": "procurement"
        }
      },
      {
        "permission": "vendor:update",
        "grantedAt": "2025-01-20T10:00:00Z",
        "conditions": {
          "ownDepartmentOnly": true
        }
      }
    ],
    "inherited": [
      {
        "permission": "dashboard:view",
        "inheritedFrom": "role_staff",
        "inheritedAt": "2025-01-20T10:00:00Z"
      },
      {
        "permission": "profile:update", 
        "inheritedFrom": "role_staff",
        "inheritedAt": "2025-01-20T10:00:00Z"
      }
    ]
  },
  "effectivePermissions": [
    "purchase_order:approve",
    "vendor:update", 
    "dashboard:view",
    "profile:update"
  ],
  "context": {
    "department": "procurement",
    "location": "all"
  }
}
```

### 6. User Context Switching

Allow users to switch between different role/department contexts.

**Endpoint:** `POST /users/{userId}/context/switch`

**Request:**
```json
{
  "targetRole": "role_003",
  "targetDepartment": "finance",
  "targetLocation": "hotel_main",
  "sessionId": "session_789",
  "reason": "Working on finance project"
}
```

**Response:**
```json
{
  "userId": "user123",
  "newContext": {
    "activeRole": {
      "roleId": "role_003",
      "roleName": "financial_analyst"
    },
    "activeDepartment": {
      "departmentId": "dept_002",
      "departmentName": "finance"
    },
    "activeLocation": {
      "locationId": "loc_001",
      "locationName": "hotel_main"  
    }
  },
  "previousContext": {
    "activeRole": {
      "roleId": "role_001",
      "roleName": "procurement_manager"
    },
    "activeDepartment": {
      "departmentId": "dept_001", 
      "departmentName": "procurement"
    }
  },
  "effectivePermissions": ["financial_report:view", "budget:update"],
  "switchedAt": "2025-01-28T10:30:00Z",
  "validUntil": "2025-01-28T18:30:00Z"
}
```

---

## Audit & Analytics APIs

### 1. Get Permission Audit Logs

Retrieve audit logs for permission evaluations.

**Endpoint:** `GET /audit/permissions`

**Query Parameters:**
- `userId` - Filter by user
- `resourceType` - Filter by resource type
- `action` - Filter by action
- `decision` - Filter by decision (permit, deny)
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort field (timestamp, executionTime)
- `order` - Sort order (asc, desc)

**Response:**
```json
{
  "auditLogs": [
    {
      "id": "audit_001",
      "timestamp": "2025-01-28T10:30:00Z",
      "userId": "user123",
      "subjectId": "user123",
      "resourceType": "purchase_order",
      "resourceId": "po_456",
      "action": "approve",
      "decision": "permit",
      "reason": "Manager approval within limits",
      "executionTime": 45,
      "evaluatedPolicies": ["policy_001", "policy_002"],
      "matchedPolicies": ["policy_001"],
      "evaluationContext": {
        "department": "procurement",
        "location": "hotel_main",
        "requestIP": "192.168.1.100"
      },
      "obligations": [
        {
          "type": "audit",
          "description": "High-value transaction audit required"
        }
      ],
      "requestId": "req_abc123",
      "sessionId": "session_789"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63
  },
  "summary": {
    "totalPermits": 980,
    "totalDenies": 270,
    "permitRate": 78.4,
    "averageExecutionTime": 32.5
  }
}
```

### 2. Get User Access Analytics

Analyze user access patterns and behavior.

**Endpoint:** `GET /analytics/users/{userId}/access`

**Query Parameters:**
- `period` - Time period (day, week, month, quarter, year)
- `startDate` - Start date
- `endDate` - End date

**Response:**
```json
{
  "userId": "user123",
  "period": "week",
  "startDate": "2025-01-21T00:00:00Z",
  "endDate": "2025-01-28T00:00:00Z",
  "summary": {
    "totalRequests": 342,
    "successfulRequests": 298,
    "deniedRequests": 44,
    "successRate": 87.1,
    "averageExecutionTime": 28.5,
    "mostAccessedResources": [
      {
        "resourceType": "purchase_order",
        "count": 125,
        "percentage": 36.5
      },
      {
        "resourceType": "purchase_request", 
        "count": 89,
        "percentage": 26.0
      }
    ],
    "mostUsedActions": [
      {
        "action": "read",
        "count": 156,
        "percentage": 45.6
      },
      {
        "action": "approve",
        "count": 78,
        "percentage": 22.8
      }
    ]
  },
  "dailyActivity": [
    {
      "date": "2025-01-21",
      "requests": 45,
      "permits": 39,
      "denies": 6
    },
    {
      "date": "2025-01-22",
      "requests": 52,
      "permits": 48,
      "denies": 4
    }
  ],
  "riskIndicators": {
    "unusualActivityDetected": false,
    "offHoursAccess": 3,
    "failedAttempts": 44,
    "riskScore": 0.15
  }
}
```

### 3. Get Policy Usage Statistics

Analyze policy usage and effectiveness.

**Endpoint:** `GET /analytics/policies/usage`

**Query Parameters:**
- `period` - Time period
- `startDate` - Start date  
- `endDate` - End date
- `policyId` - Filter by specific policy

**Response:**
```json
{
  "period": "month",
  "startDate": "2025-01-01T00:00:00Z", 
  "endDate": "2025-01-31T23:59:59Z",
  "policyStatistics": [
    {
      "policyId": "policy_001",
      "policyName": "Purchase Order Manager Approval",
      "totalEvaluations": 1250,
      "timesMatched": 678,
      "timesPermitted": 612,
      "timesDenied": 66,
      "matchRate": 54.2,
      "permitRate": 90.3,
      "averageExecutionTime": 23.5,
      "effectiveness": "high",
      "conflicts": 0,
      "lastUsed": "2025-01-28T10:30:00Z"
    },
    {
      "policyId": "policy_002",
      "policyName": "Business Hours Only",
      "totalEvaluations": 2340,
      "timesMatched": 145,
      "timesPermitted": 0,
      "timesDenied": 145, 
      "matchRate": 6.2,
      "permitRate": 0.0,
      "averageExecutionTime": 8.2,
      "effectiveness": "high",
      "conflicts": 0,
      "lastUsed": "2025-01-28T02:15:00Z"
    }
  ],
  "summary": {
    "totalPolicies": 45,
    "activePolicies": 42,
    "unusedPolicies": 3,
    "averageEffectiveness": 85.7
  }
}
```

### 4. Generate Compliance Report

Generate compliance reports for auditing purposes.

**Endpoint:** `POST /analytics/compliance/reports`

**Request:**
```json
{
  "reportType": "access_control_compliance",
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  },
  "scope": {
    "departments": ["procurement", "finance"],
    "resourceTypes": ["purchase_order", "purchase_request"],
    "userGroups": ["managers", "supervisors"]
  },
  "complianceFramework": "SOX", // SOX, GDPR, HIPAA, etc.
  "includeDetails": true,
  "format": "json" // json, pdf, excel
}
```

**Response:**
```json
{
  "reportId": "report_001",
  "reportType": "access_control_compliance",
  "generatedAt": "2025-01-28T10:30:00Z",
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z"
  },
  "complianceScore": 94.5,
  "findings": {
    "compliant": 1890,
    "nonCompliant": 105,
    "requiresReview": 23
  },
  "keyMetrics": {
    "accessControlsCovered": 98.2,
    "auditTrailCompleteness": 99.8,
    "segregationOfDuties": 95.5,
    "approvalWorkflows": 97.1
  },
  "violations": [
    {
      "id": "violation_001",
      "type": "unauthorized_access",
      "severity": "medium",
      "description": "User accessed resource outside permitted hours",
      "userId": "user456", 
      "resourceType": "financial_report",
      "timestamp": "2025-01-15T22:30:00Z",
      "action": "view",
      "remediation": "Review after-hours access policies"
    }
  ],
  "recommendations": [
    "Implement stricter after-hours access controls",
    "Review approval limits for high-value transactions",
    "Enhance monitoring for privileged users"
  ],
  "downloadUrl": "/api/v1/permissions/reports/report_001/download",
  "expiresAt": "2025-02-28T10:30:00Z"
}
```

### 5. Get Performance Metrics

Retrieve system performance metrics for the permission system.

**Endpoint:** `GET /analytics/performance`

**Query Parameters:**
- `period` - Time period
- `granularity` - Data granularity (hour, day, week)

**Response:**
```json
{
  "period": "day",
  "date": "2025-01-28",
  "metrics": {
    "totalRequests": 5420,
    "averageResponseTime": 28.5,
    "medianResponseTime": 22.0,
    "p95ResponseTime": 85.0,
    "p99ResponseTime": 150.0,
    "cacheHitRate": 78.3,
    "attributeResolutionTime": 12.4,
    "policyEvaluationTime": 16.1,
    "errorRate": 0.08,
    "timeoutRate": 0.02
  },
  "hourlyBreakdown": [
    {
      "hour": "00:00",
      "requests": 45,
      "averageResponseTime": 25.2,
      "cacheHitRate": 85.1
    },
    {
      "hour": "09:00", 
      "requests": 425,
      "averageResponseTime": 32.1,
      "cacheHitRate": 72.5
    }
  ],
  "bottlenecks": [
    {
      "component": "attribute_resolver",
      "averageTime": 18.5,
      "impact": "medium",
      "recommendation": "Implement attribute caching"
    }
  ]
}
```

### 6. Security Analytics

Monitor security-related access patterns and threats.

**Endpoint:** `GET /analytics/security`

**Query Parameters:**
- `period` - Time period
- `threatLevel` - Minimum threat level to include

**Response:**
```json
{
  "period": "week",
  "startDate": "2025-01-21T00:00:00Z",
  "endDate": "2025-01-28T00:00:00Z",
  "securityMetrics": {
    "totalSecurityEvents": 23,
    "highRiskEvents": 3,
    "mediumRiskEvents": 12,
    "lowRiskEvents": 8,
    "blockedAttempts": 45,
    "suspiciousPatterns": 6
  },
  "threatIndicators": [
    {
      "type": "unusual_access_pattern",
      "severity": "medium",
      "description": "User accessing resources outside normal hours",
      "userId": "user789",
      "occurrences": 8,
      "firstSeen": "2025-01-25T22:15:00Z",
      "lastSeen": "2025-01-28T01:30:00Z",
      "riskScore": 0.6
    },
    {
      "type": "privilege_escalation_attempt",
      "severity": "high", 
      "description": "Multiple attempts to access restricted resources",
      "userId": "user456",
      "occurrences": 15,
      "firstSeen": "2025-01-27T14:30:00Z",
      "lastSeen": "2025-01-28T10:15:00Z",
      "riskScore": 0.85
    }
  ],
  "userRiskProfiles": [
    {
      "userId": "user789",
      "riskScore": 0.6,
      "factors": ["off_hours_access", "unusual_resource_pattern"],
      "recommendation": "Monitor closely, consider access restrictions"
    }
  ],
  "recommendations": [
    "Implement additional monitoring for high-risk users",
    "Review and tighten after-hours access policies",
    "Consider implementing additional authentication for sensitive resources"
  ]
}
```

---

## System Administration APIs

### 1. System Health Check

Check the overall health of the permission system.

**Endpoint:** `GET /admin/health`

**Response:**
```json
{
  "status": "healthy", // healthy, degraded, unhealthy
  "timestamp": "2025-01-28T10:30:00Z",
  "version": "2.1.0",
  "uptime": 2592000, // seconds
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 5.2,
      "lastCheck": "2025-01-28T10:30:00Z"
    },
    "policyEngine": {
      "status": "healthy", 
      "policiesLoaded": 42,
      "averageEvaluationTime": 28.5,
      "cacheStatus": "optimal"
    },
    "attributeResolver": {
      "status": "healthy",
      "cacheHitRate": 78.3,
      "averageResolutionTime": 12.4
    },
    "auditService": {
      "status": "healthy",
      "logBacklog": 0,
      "lastLogWrite": "2025-01-28T10:29:45Z"
    }
  },
  "metrics": {
    "requestsPerMinute": 92.5,
    "averageResponseTime": 28.5,
    "errorRate": 0.08,
    "cacheUtilization": 78.3
  },
  "warnings": [
    "Policy cache will expire in 2 minutes"
  ],
  "errors": []
}
```

### 2. System Configuration

Get or update system configuration.

**Endpoint:** `GET /admin/config`

**Response:**
```json
{
  "permissionSystem": {
    "defaultCombiningAlgorithm": "deny_overrides",
    "cacheEnabled": true,
    "cacheTTL": 300,
    "auditEnabled": true,
    "auditLevel": "decisions",
    "evaluationTimeout": 5000,
    "maxPolicyEvaluation": 100,
    "requireSecureConnection": true,
    "allowAnonymousAccess": false,
    "subscriptionRequired": false,
    "defaultSubscriptionLevel": "standard"
  },
  "database": {
    "connectionPool": {
      "min": 5,
      "max": 20,
      "idle": 10000
    },
    "queryTimeout": 30000
  },
  "logging": {
    "level": "info",
    "auditRetention": 2555, // 7 years in days
    "performanceLogging": true
  },
  "security": {
    "encryptionEnabled": true,
    "tokenExpiration": 3600,
    "maxFailedAttempts": 5,
    "lockoutDuration": 900
  }
}
```

**Update Configuration:**
**Endpoint:** `PUT /admin/config`

**Request:**
```json
{
  "permissionSystem": {
    "cacheTTL": 600,
    "auditLevel": "all"
  },
  "security": {
    "maxFailedAttempts": 3
  }
}
```

**Response:**
```json
{
  "updated": true,
  "changes": [
    {
      "field": "permissionSystem.cacheTTL", 
      "oldValue": 300,
      "newValue": 600
    },
    {
      "field": "permissionSystem.auditLevel",
      "oldValue": "decisions", 
      "newValue": "all"
    },
    {
      "field": "security.maxFailedAttempts",
      "oldValue": 5,
      "newValue": 3
    }
  ],
  "updatedAt": "2025-01-28T10:30:00Z",
  "updatedBy": "admin_user",
  "restartRequired": false
}
```

### 3. Cache Management

Manage system caches for optimal performance.

**Endpoint:** `GET /admin/cache`

**Response:**
```json
{
  "caches": {
    "policyCache": {
      "enabled": true,
      "ttl": 300,
      "entries": 42,
      "hitRate": 85.2,
      "lastRefresh": "2025-01-28T10:25:00Z",
      "nextRefresh": "2025-01-28T10:30:00Z",
      "size": "2.4MB"
    },
    "attributeCache": {
      "enabled": true,
      "ttl": 180,
      "entries": 1250,
      "hitRate": 78.3,
      "lastRefresh": "2025-01-28T10:28:00Z",
      "size": "5.8MB"
    },
    "userPermissionCache": {
      "enabled": true,
      "ttl": 120,
      "entries": 450,
      "hitRate": 92.1,
      "lastRefresh": "2025-01-28T10:29:00Z", 
      "size": "1.2MB"
    }
  },
  "totalCacheSize": "9.4MB",
  "overallHitRate": 85.2
}
```

**Clear Cache:**
**Endpoint:** `DELETE /admin/cache`

**Request:**
```json
{
  "cacheType": "all", // all, policy, attribute, userPermission
  "reason": "Policy update deployment"
}
```

**Response:**
```json
{
  "cleared": true,
  "cacheType": "all", 
  "entriesRemoved": 1742,
  "spaceFreed": "9.4MB",
  "clearedAt": "2025-01-28T10:30:00Z",
  "clearedBy": "admin_user",
  "reason": "Policy update deployment"
}
```

### 4. Bulk Operations

Perform bulk operations for data management.

**Endpoint:** `POST /admin/bulk/policies`

**Request:**
```json
{
  "operation": "import", // import, export, activate, deactivate, delete
  "policies": [
    {
      "name": "Bulk Policy 1",
      "effect": "permit",
      "priority": 100,
      "target": {
        "subjects": [
          {
            "attribute": "roles",
            "operator": "contains",
            "value": "manager"
          }
        ]
      },
      "rules": []
    }
  ],
  "options": {
    "skipValidation": false,
    "overwriteExisting": false,
    "createBackup": true
  }
}
```

**Response:**
```json
{
  "operationId": "bulk_op_001",
  "operation": "import",
  "status": "completed",
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0,
    "skipped": 0
  },
  "results": [
    {
      "index": 0,
      "policyName": "Bulk Policy 1",
      "status": "success",
      "policyId": "policy_new_001"
    }
  ],
  "errors": [],
  "warnings": [],
  "executionTime": 1250,
  "completedAt": "2025-01-28T10:30:00Z",
  "backupId": "backup_001"
}
```

### 5. System Statistics

Get comprehensive system statistics.

**Endpoint:** `GET /admin/stats`

**Response:**
```json
{
  "timestamp": "2025-01-28T10:30:00Z",
  "system": {
    "version": "2.1.0",
    "uptime": 2592000,
    "environment": "production"
  },
  "policies": {
    "total": 48,
    "active": 45,
    "inactive": 3,
    "averagePriority": 275,
    "mostRecentUpdate": "2025-01-28T09:15:00Z"
  },
  "users": {
    "total": 267,
    "active": 245,
    "withRoles": 245,
    "averageRolesPerUser": 2.3
  },
  "roles": {
    "total": 15,
    "system": 8,
    "custom": 7,
    "hierarchyLevels": 5
  },
  "permissions": {
    "evaluationsToday": 5420,
    "permitsToday": 4785,
    "deniesToday": 635,
    "averageEvaluationTime": 28.5,
    "cacheHitRate": 78.3
  },
  "audit": {
    "logsToday": 5420,
    "totalLogs": 2450000,
    "retentionDays": 2555,
    "storageUsed": "15.8GB"
  },
  "performance": {
    "averageResponseTime": 28.5,
    "peakResponseTime": 150.0,
    "errorRate": 0.08,
    "throughputPerMinute": 92.5
  }
}
```

### 6. Backup and Restore

Manage system backups and restoration.

**Create Backup:**
**Endpoint:** `POST /admin/backup`

**Request:**
```json
{
  "type": "full", // full, policies_only, config_only
  "description": "Pre-deployment backup",
  "includeAuditLogs": false,
  "compression": true
}
```

**Response:**
```json
{
  "backupId": "backup_20250128_103000",
  "type": "full",
  "status": "completed",
  "description": "Pre-deployment backup",
  "createdAt": "2025-01-28T10:30:00Z",
  "createdBy": "admin_user",
  "size": "45.2MB",
  "location": "/backups/backup_20250128_103000.zip",
  "checksumSHA256": "a1b2c3d4e5f6...",
  "expiresAt": "2025-04-28T10:30:00Z",
  "contents": {
    "policies": 45,
    "roles": 15,
    "userAssignments": 267,
    "configuration": true,
    "auditLogs": false
  }
}
```

**List Backups:**
**Endpoint:** `GET /admin/backups`

**Response:**
```json
{
  "backups": [
    {
      "backupId": "backup_20250128_103000",
      "type": "full",
      "description": "Pre-deployment backup",
      "createdAt": "2025-01-28T10:30:00Z",
      "size": "45.2MB",
      "status": "completed",
      "expiresAt": "2025-04-28T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

**Restore Backup:**
**Endpoint:** `POST /admin/backup/{backupId}/restore`

**Request:**
```json
{
  "restoreType": "selective", // full, selective
  "components": ["policies", "roles"], // if selective
  "options": {
    "preserveExisting": true,
    "createBackupBeforeRestore": true,
    "validateAfterRestore": true
  }
}
```

**Response:**
```json
{
  "restoreId": "restore_001",
  "backupId": "backup_20250128_103000", 
  "status": "completed",
  "startedAt": "2025-01-28T10:35:00Z",
  "completedAt": "2025-01-28T10:37:00Z",
  "restoredComponents": ["policies", "roles"],
  "summary": {
    "policiesRestored": 45,
    "rolesRestored": 15,
    "errors": 0,
    "warnings": 1
  },
  "preRestoreBackupId": "backup_pre_restore_001",
  "validationResults": {
    "valid": true,
    "issues": []
  }
}
```

---

## Rate Limiting

All APIs implement rate limiting to ensure system stability:

- **Standard APIs**: 1000 requests per hour per user
- **Bulk APIs**: 100 requests per hour per user  
- **Admin APIs**: 500 requests per hour per admin user
- **Analytics APIs**: 200 requests per hour per user

Rate limit headers included in all responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1706447400
```

## Authentication & Authorization

All APIs require:
1. **JWT Bearer Token** in Authorization header
2. **Appropriate permissions** for the requested operation
3. **Valid session** for user-context operations

Permission requirements for each API endpoint are enforced through the same ABAC system documented here.

## Monitoring & Observability

All APIs include:
- **Request ID tracking** for distributed tracing
- **Performance metrics** collection
- **Audit logging** for compliance
- **Error reporting** with context
- **Health check endpoints** for system monitoring

## Webhook Integration

The system supports webhooks for real-time notifications:
- **Permission decisions** (configurable)
- **Policy changes** (create, update, delete)
- **Security events** (failed attempts, threats)
- **System events** (health status changes)

Webhook configuration available through `/admin/webhooks` endpoints.

This comprehensive API specification provides complete coverage of the Carmen ERP ABAC permission system, enabling secure and efficient access control management across all system components.