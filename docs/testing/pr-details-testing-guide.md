# Purchase Request Details: Testing Guide

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document provides a comprehensive guide for testing the Purchase Request (PR) Details feature. It covers functional, UI/UX, and role-based access control (RBAC) testing.

## 1. Prerequisites

*   The application should be running locally.
*   The database should be seeded with the necessary test data, including users with different roles (Requester, Approver, Purchasing, Admin), products, and vendors.
*   The Playwright test environment should be set up (`npm install --save-dev @playwright/test` and `npx playwright install`).

## 2. Test Scenarios

### 2.1. Functional Testing

#### 2.1.1. PR Creation

1.  **Objective**: Verify that a user can create a new PR.
2.  **Steps**:
    1.  Log in as a Requester.
    2.  Navigate to the PR list page and click "New PR".
    3.  Fill in all required fields.
    4.  Add at least one item to the PR.
    5.  Click "Save Draft".
    6.  **Expected Result**: The PR is saved with a "Draft" status.
    7.  Click "Submit".
    8.  **Expected Result**: The PR status changes to "Submitted", and it enters the approval workflow.

#### 2.1.2. PR Editing

1.  **Objective**: Verify that a user can edit a PR.
2.  **Steps**:
    1.  Log in as a Requester.
    2.  Open a PR in "Draft" or "Rejected" status.
    3.  Click the "Edit" button.
    4.  Modify the PR details (e.g., change the description, add a new item).
    5.  Click "Save".
    6.  **Expected Result**: The changes are saved successfully.

#### 2.1.3. Item Management

1.  **Objective**: Verify that a user can manage items in a PR.
2.  **Steps**:
    1.  Open a PR and navigate to the "Items" tab.
    2.  **Add Item**: Click "Add Item", fill in the details, and save. Verify the item is added to the list.
    3.  **Edit Item**: Click "Details" on an item, then "Edit". Modify the item details and save. Verify the changes are reflected.
    4.  **Delete Item**: (If applicable) Delete an item and verify it is removed from the list.
    5.  **Bulk Actions**: Select multiple items and perform bulk actions (Approve, Reject). Verify the status of the selected items is updated.

### 2.2. UI/UX Testing

1.  **Objective**: Ensure the UI is intuitive, responsive, and visually consistent.
2.  **Test Cases**:
    *   **Responsiveness**: Verify the layout adapts correctly to different screen sizes (desktop, tablet, mobile).
    *   **Tab Navigation**: Click on each tab and verify that the correct content is displayed.
    *   **Dialogs**: Verify that all dialogs (Add Item, Item Details, etc.) open and close correctly.
    *   **Buttons and Controls**: Test all buttons, dropdowns, and other controls to ensure they are functional and provide clear feedback.
    *   **Expand/Collapse**: Verify that the expand/collapse functionality on the item cards works as expected.
    *   **Visual Consistency**: Check for consistent styling, fonts, and colors throughout the feature.

### 2.3. Role-Based Access Control (RBAC) Testing

1.  **Objective**: Verify that users can only perform actions they are authorized for.
2.  **Test Cases**:
    *   Log in with each role (Requester, Approver, Purchasing, Admin) and verify the permissions outlined in the `pr-rbac.md` document.
    *   **Requester**: Verify they can create and edit their own PRs but cannot approve them.
    *   **Approver**: Verify they can approve or reject PRs assigned to them but cannot create new PRs.
    *   **Purchasing**: Verify they can view all PRs but cannot create or approve them.
    *   **Admin**: Verify they have full access to all functionality.

### 2.4. Workflow Testing

1.  **Objective**: Verify the end-to-end approval workflow.
2.  **Steps**:
    1.  Create and submit a new PR as a Requester.
    2.  Log in as the first Approver and approve the PR.
    3.  Log in as the next Approver and send the PR back.
    4.  Log in as the previous Approver and verify the PR is back in their queue.
    5.  Approve the PR again.
    6.  Log in as the final Approver and reject the PR.
    7.  Log in as the Requester and verify the PR is in "Rejected" status.

## 3. Test Execution

### 3.1. Automated Testing

*   Run the Playwright test suite using the following command:
    ```bash
    npx playwright test
    ```
*   Review the test report to identify any failures.

### 3.2. Manual Testing

*   Follow the test scenarios outlined in this document to manually test the feature.
*   Pay close attention to the UI/UX and RBAC test cases, as these are often difficult to fully automate.
*   Document any bugs or issues found with clear steps to reproduce.
