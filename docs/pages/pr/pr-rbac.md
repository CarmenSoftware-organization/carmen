# Purchase Request: Role-Based Access Control (RBAC)

This document outlines the Role-Based Access Control (RBAC) for the Purchase Request (PR) module. The permissions are defined based on user roles.

## 1. Roles

*   **Requester**: A user who can create and submit purchase requests.
*   **Approver**: A user who is responsible for approving or rejecting purchase requests.
*   **Purchasing**: A user who is responsible for processing approved purchase requests.
*   **Admin**: A user with full access to the system.

## 2. Permissions Matrix

| Action | Requester | Approver | Purchasing | Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Create PR** | Yes | No | No | Yes |
| **View Own PRs** | Yes | N/A | N/A | Yes |
| **View All PRs** | No | No | Yes | Yes |
| **Edit PR (Draft)** | Yes | No | No | Yes |
| **Edit PR (Submitted)** | No | No | No | Yes |
| **Edit PR (Rejected)** | Yes | No | No | Yes |
| **Submit PR** | Yes | No | No | Yes |
| **Approve PR** | No | Yes | No | Yes |
| **Reject PR** | No | Yes | No | Yes |
| **Send Back PR** | No | Yes | No | Yes |
| **Add Item to PR** | Yes | No | No | Yes |
| **Edit Item in PR** | Yes | No | No | Yes |
| **Delete Item from PR** | Yes | No | No | Yes |
| **View PR Budget** | Yes | Yes | Yes | Yes |
| **View PR Workflow** | Yes | Yes | Yes | Yes |
| **View PR Attachments** | Yes | Yes | Yes | Yes |
| **View PR Activity Log** | Yes | Yes | Yes | Yes |

## 3. Field-Level Permissions

In addition to the action-level permissions, there are also field-level permissions that restrict which fields a user can edit based on their role and the current status of the PR.

*   **Requester**: Can edit most fields when the PR is in "Draft" or "Rejected" status.
*   **Approver**: Can only edit specific fields, such as the "Approved Quantity" of an item.
*   **Purchasing**: Can edit fields related to the purchasing process, such as the vendor and price.

These field-level permissions are enforced by the `canEditField` utility function.

## 4. Item-Level Action Permissions

| Action | Role | Item Status | Allowed |
| :--- | :--- | :--- | :--- |
| Approve | Department Manager | `Pending`, `Review` | Yes |
| Reject | Department Manager | `Pending`, `Review` | Yes |
| Review | Department Manager | `Pending`, `Review` | Yes |
| Approve | Purchasing Staff | `Approved`, `Review` | Yes |
| Reject | Purchasing Staff | `Approved`, `Review` | Yes |
| Review | Purchasing Staff | `Approved`, `Review` | Yes |
| Review | Requester | `Pending` | Yes |
