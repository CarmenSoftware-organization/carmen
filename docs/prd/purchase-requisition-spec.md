# Purchase Requisition (PR) Module: Feature Specification and Functional Requirements

## 1. Feature Spec

### 1.1. Introduction

This document outlines the feature specification and functional requirements for the Purchase Requisition (PR) module within the Carmen ERP system. The PR module is a critical component of the procurement process, enabling users to request the purchase of goods and services required for their operations.

### 1.2. Problem Statement

Currently, the process of requesting purchases is manual, leading to inefficiencies, lack of transparency, and a higher risk of errors. There is no standardized system for tracking and managing purchase requests, making it difficult to control budgets and manage approvals.

### 1.3. Goals and Objectives

The primary goal of the PR module is to automate and streamline the purchase requisition process. The objectives are as follows:

*   **Standardize the PR process:** Provide a consistent and user-friendly interface for creating and submitting purchase requests.
*   **Improve transparency:** Enable users to track the status of their PRs throughout the approval workflow.
*   **Enhance control:** Implement a robust approval workflow to ensure that all purchases are properly authorized and within budget.
*   **Reduce errors:** Minimize manual data entry and the risk of human error.
*   **Increase efficiency:** Accelerate the procurement cycle by automating the PR and approval process.

### 1.4. Scope

This document covers the core functionality of the PR module, including:

*   Creating, editing, and submitting purchase requisitions.
*   Configuring and managing multi-level approval workflows.
*   Viewing and tracking the status of PRs.
*   Converting approved PRs into Purchase Orders (POs).
*   Sending notifications related to PR status changes.

### 1.5. User Personas

*   **Requestor:** A staff member who needs to request the purchase of goods or services.
*   **Approver:** A manager or department head responsible for approving purchase requests.
*   **Procurement Officer:** A member of the procurement team responsible for processing approved PRs and converting them into POs.
*   **System Administrator:** Responsible for configuring the PR module, including approval workflows and user permissions.

### 1.6. User Stories

*   As a Requestor, I want to easily create a new purchase requisition with all the necessary details, so that I can quickly request the items I need.
*   As a Requestor, I want to be able to track the status of my purchase requisitions, so that I know when to expect the requested items.
*   As an Approver, I want to receive notifications for pending purchase requisitions, so that I can review and approve them in a timely manner.
*   As an Approver, I want to be able to view all the details of a purchase requisition before approving or rejecting it, so that I can make an informed decision.
*   As a Procurement Officer, I want to be able to convert an approved purchase requisition into a purchase order, so that I can efficiently process the purchase.

### 1.7. Assumptions and Constraints

*   The PR module will be integrated with the existing User Management, Inventory, and Vendor Management modules.
*   The system will support a multi-level approval workflow based on user roles and departments.
*   The initial version will focus on the core functionality described in this document. Advanced features like budget checking and reporting will be considered for future releases.

## 2. Functional Requirements

### 2.1. PR Creation

*   **2.1.1.** Users with the appropriate permissions shall be able to create a new purchase requisition.
*   **2.1.2.** The PR form shall include the following fields:
    *   Requisition Title
    *   PR Type (e.g., General Purchase, Capex)
    *   Department
    *   Requestor Name (auto-populated)
    *   Request Date (auto-populated)
    *   Required Date
    *   Vendor (optional)
    *   Items (with fields for item name, description, quantity, unit price, and total)
    *   Notes/Justification
*   **2.1.3.** Users shall be able to add multiple items to a single purchase requisition.
*   **2.1.4.** The system shall automatically calculate the total price for each item and the total cost of the PR.
*   **2.1.5.** Users shall be able to save a PR as a draft and submit it for approval later.
*   **2.1.6.** Users shall be able to create a new PR from a predefined template (e.g., Office Supplies, IT Equipment).

### 2.2. PR Approval Workflow

*   **2.2.1.** The system shall support a configurable multi-level approval workflow based on user roles, departments, and PR value.
*   **2.2.2.** The workflow stages shall include:
    *   Requester
    *   Department Head Approval
    *   Finance Approval
    *   Purchasing Review
    *   General Manager Approval
    *   Completed
    *   Rejected
*   **2.2.3.** When a PR is submitted, it shall be routed to the appropriate approver(s) based on the configured workflow.
*   **2.2.4.** Approvers shall be able to approve, reject, or send back a PR to a previous stage for revision.
*   **2.2.5.** If a PR is rejected or sent back, the approver must provide a reason.
*   **2.2.6.** The system shall record the complete history of all actions taken on a PR, including who performed the action and when, in an activity log.

### 2.3. PR Viewing and Listing

*   **2.3.1.** Users shall be able to view a list of all their purchase requisitions in both a table view and a card view.
*   **2.3.2.** The PR list shall display the current status of each PR (e.g., Draft, Pending Approval, Approved, Rejected, Closed).
*   **2.3.3.** Users with the appropriate permissions (e.g., department heads, procurement officers) shall be able to view all PRs for their department or the entire organization.
*   **2.3.4.** The PR list shall be searchable and filterable using a global search bar, quick filters (e.g., My Pending, All Documents), and an advanced filter builder.
*   **2.3.5.** The table view shall have sortable columns and the ability to toggle column visibility.
*   **2.3.6.** The card view shall have a hover effect and display vendor and product certifications.

### 2.4. PR Detail View

*   **2.4.1.** The PR detail view shall display all the information related to the purchase requisition.
*   **2.4.2.** The detail view shall have tabs for "Items" and "Workflow".
*   **2.4.3.** A sidebar shall be available with sections for "Comments & Attachments" and "Activity Log".
*   **2.4.4.** A floating action menu shall be displayed with workflow actions based on the user's role and the PR's status.
*   **2.4.5.** The available workflow actions shall include "Approve", "Reject", "Send Back", "Edit", "Delete", and "Submit".
*   **2.4.6.** When sending back a PR, the user shall be able to select a specific step to return to and add a comment.

### 2.5. PR Conversion to Purchase Order (PO)

*   **2.5.1.** Procurement Officers shall be able to convert an approved purchase requisition into a Purchase Order (PO).
*   **2.5.2.** When converting a PR to a PO, the system shall pre-populate the PO form with the information from the PR.
*   **2.5.3.** The system shall maintain a link between the PR and the corresponding PO for traceability.

### 2.6. Notifications

*   **2.6.1.** The system shall send email and in-app notifications to approvers when a new PR is submitted for their approval.
*   **2.6.2.** The system shall send email and in-app notifications to the requestor when their PR is approved, rejected, or if more information is requested.
*   **2.6.3.** The system shall send email and in-app notifications to the procurement team when a PR is fully approved.

### 2.7. Roles and Permissions

*   **2.7.1.** The system shall have the following roles with the specified permissions:
    *   **Requestor:** Create, edit, and view their own PRs.
    *   **Approver:** Approve, reject, or send back PRs assigned to them.
    *   **Procurement Officer:** View all PRs, convert approved PRs to POs.
    *   **System Administrator:** Configure the PR module, including approval workflows and user permissions.

### 2.8. Types and Interfaces

```typescript
interface PurchaseRequest {
  id: string;
  refNumber: string;
  date: Date;
  type: PRType;
  description: string;
  requestorId: string;
  requestor: {
    name: string;
    id: string;
    department: string;
  };
  status: DocumentStatus;
  workflowStatus: WorkflowStatus;
  currentWorkflowStage: WorkflowStage;
  location: string;
  department: string;
  jobCode: string;
  estimatedTotal: number;
  currency: string;
  baseCurrencyCode: string;
  vendor: string;
  vendorId: number;
  deliveryDate: Date;
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  items: PurchaseRequestItem[];
  comments: Comment[];
  activityLog: Activity[];
}

interface PurchaseRequestItem {
  id: string;
  // ... other item properties
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  content: string;
  timestamp: Date;
}

interface Activity {
  // ... activity properties
}

enum PRType {
  GeneralPurchase = "General Purchase",
  Capex = "Capex",
}

enum DocumentStatus {
  Draft = "Draft",
  Submitted = "Submitted",
  InProgress = "In Progress",
  Completed = "Completed",
  Rejected = "Rejected",
}

enum WorkflowStatus {
  pending = "pending",
  // ... other statuses
}

enum WorkflowStage {
  requester = "requester",
  departmentHeadApproval = "departmentHeadApproval",
  financeApproval = "financeApproval",
  purchasingReview = "purchasingReview",
  generalManagerApproval = "generalManagerApproval",
  completed = "completed",
  rejected = "rejected",
}
```