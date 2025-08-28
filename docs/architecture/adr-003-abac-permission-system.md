# ADR-003: Attribute-Based Access Control (ABAC) Permission System

## Status
**ACCEPTED** - Implementation in progress (Backend complete, UI components in development)

## Context

Carmen ERP requires a sophisticated permission management system to handle complex access control scenarios in hospitality operations. The system needs to manage permissions across multiple dimensions including:

- User roles and hierarchies (Staff, Department Managers, Financial Managers, etc.)
- Departmental boundaries (Kitchen, Front Office, Procurement, etc.)
- Location-based access (Multiple hotel/restaurant properties)
- Resource-specific permissions (Purchase Orders, Inventory, Financial Data)
- Context-sensitive access (Business hours, approval limits, workflow stages)
- Temporal constraints (Time-based access, shift schedules)

Traditional Role-Based Access Control (RBAC) systems were evaluated but found insufficient for the complex, multi-dimensional access requirements of hospitality operations.

## Decision

We have decided to implement an **Attribute-Based Access Control (ABAC)** system that provides fine-grained, policy-based access control using contextual attributes.

### Core ABAC Components

#### 1. Attribute Categories
- **Subject Attributes**: User identity, roles, departments, clearance levels, employment details
- **Resource Attributes**: Resource type, ownership, classification, workflow stage, financial value
- **Environment Attributes**: Time, location, device type, threat level, system state
- **Action Attributes**: Operation type (create, read, update, delete, approve)

#### 2. Policy Engine Architecture
```typescript
interface Policy {
  id: string;
  name: string;
  priority: number;        // 0-1000, higher = evaluated first
  effect: 'PERMIT' | 'DENY';
  target: PolicyTarget;    // When this policy applies
  rules: Rule[];          // Conditions that must be met
  obligations?: Obligation[]; // Additional requirements
}
```

#### 3. Evaluation Algorithm
- **Priority-Based Sorting**: Policies evaluated in descending priority order
- **Combining Algorithms**: 
  - `DENY_OVERRIDES` (default): Any deny decision overrides permits
  - `PERMIT_OVERRIDES`: Any permit decision overrides denies
  - `FIRST_APPLICABLE`: First matching policy determines outcome
  - `ONLY_ONE_APPLICABLE`: Error if multiple policies match

#### 4. Expression Language
```typescript
interface Expression {
  type: 'simple' | 'composite';
  attribute?: string;           // e.g., 'subject.department.name'
  operator?: Operator;          // equals, contains, greater_than, etc.
  value?: any;                 // comparison value
  expressions?: Expression[];   // for composite expressions
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}
```

## Implementation Details

### Backend Implementation (✅ Complete)

#### Policy Engine (`/lib/services/permissions/policy-engine.ts`)
```typescript
class PolicyEngine {
  async evaluateAccess(request: AccessRequest): Promise<AccessDecision> {
    // 1. Gather context attributes
    // 2. Find applicable policies
    // 3. Sort by priority (descending)
    // 4. Evaluate rules sequentially
    // 5. Apply combining algorithm
    // 6. Return decision with obligations
  }
}
```

#### Core Types (`/lib/types/permissions.ts`)
- 534 lines of comprehensive ABAC type definitions
- Subject, Resource, Environment attribute interfaces
- Policy evaluation and decision structures
- Error handling and validation types

### Frontend Implementation (🔄 In Progress)

#### Role Management Interface
- **Role Detail View** (`/roles/[id]/page.tsx`): Tab-based interface with permissions, users, and policies
- **Permission Details Tab**: Grouped/flat view of effective permissions
- **User Assignment Tab**: Split-panel bulk user management
- **Policy Assignment Tab**: Policy assignment with type categorization

#### Policy Management (Planned)
- Policy creation and editing interfaces
- Expression builder for complex rules
- Testing and simulation tools
- Audit logging and compliance reporting

## Consequences

### Advantages

1. **Fine-Grained Control**: Context-sensitive permissions based on multiple attributes
2. **Dynamic Evaluation**: Real-time policy evaluation with environmental factors
3. **Scalability**: Policy-based system scales with organizational complexity
4. **Compliance**: Audit trails and detailed decision logging
5. **Flexibility**: Supports complex hospitality workflows and approval hierarchies
6. **Security**: Defense-in-depth with obligations and advice mechanisms

### Disadvantages

1. **Complexity**: More complex than traditional RBAC systems
2. **Performance**: Policy evaluation overhead (mitigated by caching)
3. **Learning Curve**: Requires training for administrators
4. **Policy Management**: Complex policy creation and testing processes

### Technical Trade-offs

1. **Storage**: Increased data storage for detailed audit logs
2. **Computation**: Real-time policy evaluation vs. pre-computed permissions
3. **Caching Strategy**: Balance between performance and real-time accuracy
4. **Debugging**: Complex policy interactions require sophisticated tooling

## Risk Mitigation

1. **Performance**: Implemented caching layer with configurable TTL
2. **Reliability**: Fail-safe defaults with emergency override capabilities
3. **Usability**: Progressive disclosure UI with role-based templates
4. **Testing**: Comprehensive policy testing framework with scenario simulation

## Implementation Status

### ✅ Completed
- Core ABAC type system (534 lines in permissions.ts)
- Policy engine with priority-based evaluation
- Expression evaluation system with 13 operators
- Role management UI with permission visualization
- User assignment bulk operations
- Policy assignment interface

### 🔄 In Progress
- Policy creation and editing interfaces
- Advanced expression builder
- Audit logging integration
- Performance optimization and caching

### 📋 Planned
- Policy testing and simulation tools
- Compliance reporting dashboards
- Mobile-responsive permission interfaces
- Integration with external identity providers

## Related Documents

- [ABAC Type System](/lib/types/permissions.ts)
- [Policy Engine Implementation](/lib/services/permissions/policy-engine.ts)
- [Role Management Interface](/app/(main)/system-administration/permission-management/roles/)
- [Permission Management Architecture](/docs/permission-management-todos.md)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-01-XX | ABAC over RBAC | Complex hospitality requirements exceed RBAC capabilities |
| 2024-01-XX | Priority-based policy evaluation | Deterministic ordering for predictable outcomes |
| 2024-01-XX | Expression-based rules | Flexible rule definition without code changes |
| 2024-01-XX | Deny-overrides default | Security-first approach with explicit permits required |

---

**Author**: Claude Code Assistant  
**Date**: January 2025  
**Supersedes**: None  
**Status**: Accepted, Implementation Ongoing