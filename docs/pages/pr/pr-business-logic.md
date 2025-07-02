# Purchase Request: Business Logic

This document outlines the business logic, rules, and constraints for the Purchase Request (PR) module.

## 1. PR Creation and Submission

*   A user can create a new PR, which will initially be in "Draft" status.
*   When a PR is created, it must have a requestor, a request date, and at least one item.
*   The user can save a PR as a draft at any time, and it will not enter the approval workflow.
*   To submit a PR for approval, the user must explicitly click the "Submit" button.
*   Upon submission, the PR status changes to "Submitted", and it enters the first stage of the approval workflow.

## 2. PR Workflow and Status

*   The PR workflow follows a series of stages, each requiring approval from a specific user role.
*   The workflow stages are: Requester -> Department Head -> Finance -> Purchasing -> Final Approval.
*   At each stage, the approver can:
    *   **Approve**: The PR moves to the next stage in the workflow.
    *   **Reject**: The PR is rejected and sent back to the requester for revision.
    *   **Send Back**: The PR is sent back to the previous stage for review.
*   The PR status changes based on the workflow actions:
    *   **Draft**: The PR has been created but not yet submitted.
    *   **Submitted**: The PR has been submitted for approval.
    *   **In Progress**: The PR is currently in the approval workflow.
    *   **Approved**: The PR has been fully approved.
    *   **Rejected**: The PR has been rejected.

## 3. Item Management

*   Each PR must contain at least one item.
*   Each item has its own status (Pending, Approved, Rejected, Review).
*   The status of an item can be updated individually or in bulk.
*   When an item is added to a PR, it must have a product name, quantity, and unit of measure.
*   The price of an item can be automatically populated from the product catalog or manually entered.

### 3.1. Item-Level Workflow

*   **Department Manager**:
    *   Can **Approve**, **Reject**, or set to **Review** any item with a status of `Pending` or `Review`.
*   **Purchasing Staff**:
    *   Can **Approve**, **Reject**, or set to **Review** any item with a status of `Approved` or `Review`.
*   **Requester**:
    *   Can set an item to **Review** if its status is `Pending`.

## 4. Budget and Financials

*   Each PR is associated with a budget.
*   The system checks the available budget before allowing a PR to be submitted.
*   If the PR amount exceeds the available budget, the user will be warned, but may still be able to submit the PR with proper justification.
*   The PR total is calculated based on the sum of all item totals, including taxes and discounts.

## 5. Role-Based Access Control (RBAC)

*   The actions a user can perform on a PR are determined by their role.
*   **Requester**: Can create, edit, and submit PRs. Can only view their own PRs.
*   **Approver**: Can approve, reject, or send back PRs that are assigned to them.
*   **Purchasing**: Can view all PRs and manage the purchasing process for approved PRs.
*   **Admin**: Can view and manage all PRs.
