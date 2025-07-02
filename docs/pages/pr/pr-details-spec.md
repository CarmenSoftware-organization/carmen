# Purchase Request Details Page: UI/UX Specification

This document outlines the UI/UX design and functional requirements for the Purchase Request (PR) Details page and its associated components.

## 1. PR Details Page (`PRDetailPage.tsx`)

### 1.1. Overview

The PR Details page provides a comprehensive view of a single purchase request. It serves as a central hub for all information and actions related to that PR.

### 1.2. Layout

The page is structured into four main sections:
1.  **Header**: Contains the PR title, status, and primary actions.
2.  **Main Content**: Displays the core details of the PR, including editable fields.
3.  **Tabs**: Organizes detailed information into logical sections.
4.  **Transaction Summary**: Shows a summary of the financial totals.
5.  **Floating Workflow Actions**: Provides quick access to workflow actions.

### 1.3. Header

*   **Back Button**: A chevron icon button that navigates the user back to the PR list.
*   **PR Title**: The title of the PR (e.g., "Purchase Request Details" or the PR reference number).
*   **Status Badge**: A badge indicating the current status of the PR (e.g., "Draft", "In Progress", "Approved").
*   **Action Buttons**:
    *   **Edit/Save/Cancel**: Context-aware buttons for managing the edit state of the form.
    *   **Print**: Opens a print-friendly view of the PR.
    *   **Export**: Exports the PR details in a standard format (e.g., PDF, CSV).
    *   **Share**: Allows the user to share the PR with other users.

### 1.4. Main Content

*   **PR Details**: A two-column layout displaying the main details of the PR.
    *   **Left Column**: Contains the primary PR information (Ref Number, Date, PR Type, Requestor, Department, Description).
    *   **Right Column**: Displays status information (Current Stage, Workflow Status, Document Status, Created Date, Estimated Cost).
*   **Edit Mode**: When in "edit" mode, input fields become editable, and "Save" and "Cancel" buttons are displayed.

### 1.5. Tabs

*   **Items**: Displays a list of items included in the PR.
*   **Budgets**: Shows budget information related to the PR.
*   **Workflow**: Visualizes the approval workflow and its current stage.
*   **Attachments**: Allows users to view and manage attachments.
*   **Activity**: Provides a log of all activities related to the PR.

### 1.6. Transaction Summary

*   A card containing a summary of the transaction totals, including subtotal, tax, and total amount.

### 1.7. Floating Workflow Actions

*   A set of floating buttons in the bottom-right corner of the screen for quick access to workflow actions (Approve, Reject, Send Back).

## 2. Items Tab (`ItemsTab.tsx`)

### 2.1. Overview

The Items tab displays a list of all items in the purchase request. It provides tools for managing and interacting with these items.

### 2.2. Layout

*   **Header**: Contains the tab title, status summary, and controls for searching, filtering, and managing the item list.
*   **Bulk Actions**: A section that appears when one or more items are selected, providing bulk action buttons.
*   **Items List**: The main content area, displaying a list of `EnhancedOrderCard` components.

### 2.3. Header Controls

*   **Search**: A search input to filter the item list.
*   **Filter**: A button to open advanced filtering options.
*   **Show/Hide Details**: Toggles the expanded state of all item cards.
*   **Enter/Exit Edit Mode**: Toggles the edit mode for all item cards.
*   **Add Item**: Opens the `ItemDetailsEditForm` in "add" mode to create a new item.

### 2.4. Bulk Actions

*   **Approve**: Approves all selected items.
*   **Reject**: Rejects all selected items.
*   **Review**: Sets all selected items to "Review" status.
*   **Split**: Allows splitting the selected items into a new PR.

## 3. Enhanced Order Card (`enhanced-order-card.tsx`)

### 3.1. Overview

The `EnhancedOrderCard` component displays a single item in the PR list. It provides a compact and informative summary of the item, with the ability to expand for more details.

### 3.2. Layout

*   **Main Content**: Displays the primary item information (location, product name, status, SKU, request date, vendor).
*   **Action Buttons**:
    *   **Details**: Opens the `ItemDetailsEditForm` in "view" mode.
    *   **Expand/Collapse**: A chevron icon button to toggle the visibility of the additional details panel.
*   **Additional Details**: An expandable section containing more detailed information about the item (inventory details, pricing, history).

## 4. Item Details Edit Form (`item-details-edit-form.tsx`)

### 4.1. Overview

The `ItemDetailsEditForm` is a dialog component used for creating, viewing, and editing a single PR item.

### 4.2. Layout

*   **Header**: Contains the form title and an "Edit" button (in "view" mode) or "Save" and "Cancel" buttons (in "edit" mode).
*   **Form Fields**: The form is divided into several sections:
    *   **Basic Information**: Item name, description, location, etc.
    *   **Quantity and Delivery**: Quantity requested, approved, delivery date, etc.
    *   **Pricing**: Item price, currency, tax, etc.
    *   **Vendor and Additional Information**: Vendor details, pricelist number, etc.
*   **Action Buttons**:
    *   **On Hand**: Opens a dialog with inventory breakdown by location.
    *   **On Order**: Opens a dialog with pending purchase orders for the item.
