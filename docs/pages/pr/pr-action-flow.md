# Purchase Request: Action Flow

This document outlines the user and system action flows for the Purchase Request (PR) module.

## 1. Create a New Purchase Request

1.  **User Action**: Clicks the "New PR" button from the PR list page.
2.  **System Action**: Navigates the user to the PR Details page in "add" mode.
3.  **User Action**: Fills in the required PR details (requestor, date, items, etc.).
4.  **User Action**: Clicks the "Save Draft" button.
5.  **System Action**: Saves the PR with a "Draft" status.
6.  **User Action**: Clicks the "Submit" button.
7.  **System Action**:
    *   Validates the PR details.
    *   Changes the PR status to "Submitted".
    *   Initiates the approval workflow.
    *   Notifies the first approver in the workflow.

## 2. Approve a Purchase Request

1.  **User Action**: An approver opens a PR that is pending their approval.
2.  **User Action**: Clicks the "Approve" button.
3.  **System Action**:
    *   Updates the PR status to reflect the approval.
    *   Moves the PR to the next stage in the workflow.
    *   Notifies the next approver.
    *   If this is the final approval, changes the PR status to "Approved" and notifies the purchasing team.

## 3. Reject a Purchase Request

1.  **User Action**: An approver opens a PR that is pending their approval.
2.  **User Action**: Clicks the "Reject" button.
3.  **System Action**:
    *   Prompts the approver to provide a reason for rejection.
    *   Changes the PR status to "Rejected".
    *   Sends the PR back to the requester for revision.
    *   Notifies the requester of the rejection.

## 4. Edit a Purchase Request

1.  **User Action**: A requester opens one of their own PRs that is in "Draft" or "Rejected" status.
2.  **User Action**: Clicks the "Edit" button.
3.  **System Action**: Enables the form fields for editing.
4.  **User Action**: Modifies the PR details.
5.  **User Action**: Clicks the "Save" button.
6.  **System Action**: Saves the changes to the PR.

## 5. Add an Item to a Purchase Request

1.  **User Action**: From the PR Details page, clicks the "Add Item" button in the Items tab.
2.  **System Action**: Opens the `ItemDetailsEditForm` dialog in "add" mode.
3.  **User Action**: Fills in the item details.
4.  **User Action**: Clicks the "Save" button.
5.  **System Action**:
    *   Adds the new item to the PR.
    *   Updates the PR total.
    *   Closes the dialog.
