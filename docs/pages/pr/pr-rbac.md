# Purchase Request: Role-Based Access Control (RBAC)

This document outlines the Role-Based Access Control (RBAC) for the Purchase Request (PR) module, categorizing permissions based on user roles and workflow stages.

## 1. Roles

- **Requester**: Can create, edit, and submit PRs. Can view their own PRs.
- **Approver**: Can approve, reject, or send back PRs for revision. Can view PRs pending their approval.
- **Purchasing**: Can process approved PRs, create purchase orders, and manage vendors. Can allocate vendor, change price, discount, quantity, unit, and override tax and discount. Can view all PRs.
- **Admin**: Has full access to all PRs and can perform any action.

## 2. Role-Based Permissions

These permissions are directly tied to a user's assigned role, regardless of the PR's current workflow status.

### 2.1. Action-Level Permissions

| Action | Requester | Approver | Purchasing | Admin |
| --- | --- | --- | --- | --- |
| Create PR | ✅ | ❌ | ❌ | ✅ |
| Edit PR | ✅ (own, before submission) | ❌ | ❌ | ✅ |
| Delete PR | ✅ (own, before submission) | ❌ | ❌ | ✅ |
| Submit PR | ✅ (own) | ❌ | ❌ | ✅ |
| View All PRs | ❌ | ❌ | ✅ | ✅ |
| View Own PRs | ✅ | ✅ (pending approval) | ✅ | ✅ |

### 2.2. PR Header Field-Level Permissions

| Field | Requester | Approver | Purchasing | Admin |
| --- | --- | --- | --- | --- |
| Reference Number | ✅ | ❌ | ❌ | ✅ |
| Date | ✅ | ❌ | ❌ | ✅ |
| Type | ✅ | ❌ | ❌ | ✅ |
| Requestor | ✅ | ❌ | ❌ | ✅ |
| Department | ✅ | ❌ | ❌ | ✅ |
| Description | ✅ | ❌ | ❌ | ✅ |

### 2.3. PR Item Field-Level Permissions

These permissions apply to individual fields within PR items.

| Field | Requester | Approver | Purchasing | Admin |
| --- | --- | --- | --- | --- |
| Location | ✅ | ❌ | ❌ | ✅ |
| Product | ✅ | ❌ | ❌ | ✅ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| Request Qty | ✅ | ❌ | ❌ | ✅ |
| Request Unit | ✅ | ❌ | ❌ | ✅ |
| Required Date | ✅ | ❌ | ❌ | ✅ |
| Approved Qty | ❌ | ✅ | ✅ | ✅ |
| Vendor | ❌ | ❌ | ✅ | ✅ |
| Price | ❌ | ❌ | ✅ | ✅ |
| Order Unit | ❌ | ❌ | ✅ | ✅ |
| Discount | ❌ | ❌ | ✅ | ✅ |
| Tax | ❌ | ❌ | ✅ | ✅ |
| Override Discount | ❌ | ❌ | ✅ | ✅ |
| Override Tax | ❌ | ❌ | ✅ | ✅ |

## 3. Workflow-Based Permissions

These permissions are dependent on the PR's current workflow stage and apply to actions that move the PR through its lifecycle.

### 3.1. PR Item Action-Level Permissions

| Action | Role | Item Status | Allowed |
| --- | --- | --- | --- |
| **Approve PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Reject PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Send Back PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Edit Item** | Requester | `Pending` | ✅ |
| | Requester | `Rejected` | ✅ |
| | Approver | `Pending` | ❌ |
| | Purchasing | `Approved` | ✅ |
| | Admin | Any | ✅ |
| **Delete Item** | Requester | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Approve Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Reject Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Send Back Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |