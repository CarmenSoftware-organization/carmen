# Module Name: Purchase Request

## Actionable Features

### Create Purchase Request: [Link to /procurement/purchase-requests/new-pr?mode=blank]

**Description:** This feature allows users to create a new purchase requisition for goods and services.

**Functions:**
*   **Fill PR Form:** Users can fill out the PR form with details such as Requisition Title, PR Type, Department, Required Date, and a description.
*   **Add Items:** Users can add multiple items to the PR, specifying the item name, description, quantity, and unit price.
*   **Save as Draft:** Users can save the PR as a draft to be completed later.
*   **Submit for Approval:** Users can submit the PR for approval, which initiates the workflow process.
*   **Create from Template:** Users can create a new PR from a predefined template to save time.

### View Purchase Request List: [Link to /procurement/purchase-requests]

**Description:** This feature provides a comprehensive view of all purchase requisitions, allowing users to track their status and perform various actions.

**Tabs/Sections:**
*   **Table View:** Displays PRs in a sortable and filterable table.
*   **Card View:** Displays PRs in a more visual card format.

**Functions:**
*   **Search:** Users can search for specific PRs using a global search bar.
*   **Quick Filters:** Users can apply quick filters to view "My Pending" or "All Documents".
*   **Advanced Filters:** Users can build complex filters based on various fields.
*   **View PR Details:** Users can navigate to the detail page of a specific PR.
*   **Export:** Users can export the list of PRs.

### View Purchase Request Details: [Link to /procurement/purchase-requests/[id]]

**Description:** This feature provides a detailed view of a single purchase requisition, including its items, workflow history, and comments.

**Tabs/Sections:**
*   **Items Tab:** Displays the list of items in the PR.
*   **Workflow Tab:** Displays the approval history of the PR.
*   **Comments & Attachments Sidebar:** Allows users to view and add comments and attachments.
*   **Activity Log Sidebar:** Displays a log of all activities related to the PR.

**Functions:**
*   **Workflow Actions:** Users can perform workflow actions such as "Approve", "Reject", "Send Back", "Edit", "Delete", and "Submit" based on their roles and permissions.
*   **Add Comment:** Users can add comments to the PR.
*   **Add Attachment:** Users can attach files to the PR.

### Edit Item Details

**Description:** This feature allows users to edit the details of a specific item within a purchase requisition.

**Functions:**
*   **Role-Based Field Permissions:** The form enforces field-level permissions based on the user's role. For example, a "Requestor" can edit the quantity requested, while a "Purchasing Staff" can edit the vendor and price.
*   **Item Approval Actions:** Approvers can approve, reject, or return individual items within a PR.
*   **View Inventory Breakdown Modal:** Users can view a modal displaying inventory breakdown by location, including Quantity On Hand, Units, Par Level, Reorder Point, Min Stock, and Max Stock.
*   **Compare Vendors Modal:** Users can open a modal to compare prices from different vendors for an item.
*   **View Pending Purchase Orders Modal:** Users can view a modal displaying pending purchase orders for an item, including PO #, Vendor, Delivery Date, Remaining Qty, Inventory Units, and Location, along with the total on order.

### Vendor Comparison Dialogue

**Description:** This dialogue allows users to compare different vendors for a specific item and select the best option.

**Information Displayed:**
*   Vendor Name
*   Preferred Status
*   Rating
*   Pricelist Name and Number
*   Unit Price and Currency
*   Minimum Quantity
*   Order Unit
*   Valid Period
*   Notes
*   Purchase History (Last Vendor, Last Purchase Date, Last Price)

**Functions:**
*   **Select Vendor:** Purchasing staff can select a vendor and pricelist for the item.
*   **Add New Vendor:** Users can add a new vendor option.

## Navigation and Interfaces

**Main Navigation Link:** [Procurement -> Purchase Requests](/procurement/purchase-requests)

**Key Interfaces/Objects:**
*   **`PurchaseRequest` Object:** The primary data structure for a purchase requisition, containing all the information related to the request.
*   **`PurchaseRequestItem` Object:** Represents a single item within a purchase requisition. It includes the following properties:
    *   `id`: Unique identifier for the item.
    *   `status`: The current status of the item (e.g., Pending, Approved, Rejected).
    *   `location`: The location where the item is needed.
    *   `name`: The name of the item.
    *   `description`: A description of the item.
    *   `unit`: The unit of measurement for the item (e.g., Kg, Bag).
    *   `quantityRequested`: The quantity of the item requested.
    *   `quantityApproved`: The quantity of the item approved.
    *   `deliveryDate`: The required delivery date for the item.
    *   `deliveryPoint`: The specific point of delivery for the item.
    *   `currency`: The currency for the item's price.
    *   `price`: The price of the item.
    *   `foc`: Free of charge quantity.
    *   `netAmount`: The net amount of the item.
    *   `adjustments`: An object containing boolean flags for discount and tax.
    *   `taxIncluded`: A boolean flag to indicate if tax is included in the price.
    *   `discountRate`: The discount rate for the item.
    *   `discountAmount`: The discount amount for the item.
    *   `taxRate`: The tax rate for the item.
    *   `taxAmount`: The tax amount for the item.
    *   `totalAmount`: The total amount for the item.
    *   `vendor`: The vendor for the item.
    *   `pricelistNumber`: The pricelist number for the item.
    *   `comment`: A comment specific to the item.
    *   `inventoryInfo`: An object containing inventory-related information for the item:
        *   `onHand`: The quantity of the item on hand.
        *   `onOrdered`: The quantity of the item on order.
        *   `reorderLevel`: The reorder level for the item.
        *   `restockLevel`: The restock level for the item.
        *   `averageMonthlyUsage`: The average monthly usage of the item.
        *   `lastPrice`: The last price of the item.
        *   `lastOrderDate`: The last order date of the item.
        *   `lastVendor`: The last vendor of the item.
        *   `inventoryUnit`: The inventory unit of the item.
*   **`Comment` Object:** Represents a comment made on a purchase requisition.

**Enums/Status Fields:**
*   **`PRType`:** `General Purchase`, `Capex`
*   **`DocumentStatus`:** `Draft`, `Submitted`, `In Progress`, `Completed`, `Rejected`
*   **`WorkflowStatus`:** `pending`
*   **`WorkflowStage`:** `requester`, `departmentHeadApproval`, `financeApproval`, `purchasingReview`, `generalManagerApproval`, `completed`, `rejected`
*   **`PurchaseRequestItemStatus`:** `Pending`, `Approved`, `Rejected`, `Review`

## Potential Enhancements/Future Considerations (Optional)

*   **Budget Checking:** Integrate with the budget module to check for budget availability before approving a PR.
*   **Reporting and Analytics:** Provide reports on PR cycle time, approval rates, and spending by department.
