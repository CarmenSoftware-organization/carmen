### **Introduction**

Purpose of the module

### 

### **Screen Layout**

#### **Store Requisition Listing Interface**

**Action Buttons:**

* **New Request Button:** Initiate a new requisition entry.  
  * Only available 'Request' in View options is selected  
  * Create from Standard Requisition  
  * Create Manually (Start With a Blank Form )  
* **Print Button:** Print details of the requisition.

**Functional Component:**

* **View Dropdown:** Filter to display different sets of requisitions.  
* **Search Field:** Find specific requisitions in the list.  
* **Process Status Filters:** Quick filters for requisitions based on their processing stage (e.g., 'In Process', 'Complete').

Note: Need better filter  
**Fields:**

* **Date:** When the requisition was made or recorded.  
* **Ref \#:** Reference number for the requisition.  
* **Request To:** The store code to which the request is made.

Note: Add Current/From location, need to define origin of the inventory

* **Store Name:** Descriptive name of the store.  
* **Description:** Brief details or purpose of the requisition.  
* **Status:** Current status of the requisition, such as 'In Process', 'Complete', 'Reject', 'Void'  
* **Process Status:** A visual progress bar indicating the requisition's workflow stage.

### **Footer** 

**Pagination:** with first page last page  got to page options  

**Request From:** Location filter options 

### **Screen Layout**

### **Store Requisition \- Detail View**

#### **Action Button**

* **Create Button:** Add new comments or attachments related to the requisition.  
  * Available in request view only  
* Edit Button: Allow modify the content of the requisition  
  * Available in request view only  
* **Void Button:** Cancel or void the requisition.  
* **Print Button:** Print details of the requisition.  
* **Back Button:** Return to the main requisition listing.

#### **Header Fields:**

* **Ref \#**: Displays the reference number for the item requisition.  
* **Movement Type:** Specifies the nature of the requisition, such as 'Issue' or 'Transfer'  
  * If 'Issue' the Location to can only from select type direct cost  
  * if 'Transfer' the Location to can only from select type inventory/ default system  
* **Description**: Intended for a brief description of the requisition. It appears to be in a non-English script, possibly indicating an issue with data display or input.  
* **Date**: Shows the date of the requisition creation or request, which is populated as "15/12/2023".  
* **Requested From**: Intended for where the requisition is being requested from. The example shows "M01 : Main Store".  
* **Job Code**: Placeholder for a job code related to the requisition. It is unpopulated in this example, shown as "N/A : Not Available".  
* **Process**: A field presumably meant for describing the process status or type, but it is unpopulated here.  
* **Status**: Indicates the current status of the requisition, which is "In Process" in this example.

Note: Add "Cost may varied, as long as the period is still open " on Display and Printed form  
Note:

#### **Item Details**

* **Store Name: T**ransaction destination locations  
* **Item Description:** Details of the specific items requested.  
* **Unit:** Measurement unit for the requested items.  
* **Qty Req. (Quantity Required):** The quantity of the item requested.  
* **Apprv. (Approved Quantity):** The quantity approved for issue. in Issue list view

Ntoe: Qty Allocated is shown

* **Cost/Unit:** The cost per unit of the item.  
* **Total:** The total cost for the requested quantity.  
* **Request Date:** The date when the expect issue to be made.

#### **Expanded View**

#### **Inventory Information**

* **Issued On Hand** \- The current quantity of the item available in stock.  
* **On Order** \- The quantity of the item currently ordered from suppliers.  
* **Last Price** \- The last recorded price per unit.  
* **Last Vendor** \- The last vendor from which the item was purchased or added to inventory.

#### **Item Information**

* **Category**: Broad classification of the item, such as "Food", "Beverage", or "Supplies", which aids in organizing inventory.  
  * **Sub Category**: More specific classification within the main category, helping further refine inventory sorting and reporting.  
  * **Item Group**: Groups similar items under a common label for better inventory management and analysis.  
  * **Bar Code**: The barcode associated with the item, used for scanning and quick identification in inventory management systems.  
  * **Comment:** A field for notes or additional information.

**Stock Movement**:

* **Commit Date**: This is the date on which the stock movement was finalized or recorded in the system.  
* **Location**: Indicates the specific store or inventory location where the stock movement occurred, helping track where inventory adjustments are made.  
* **Item Description**: Provides detailed information about the item, including an SKU number and a description. This typically includes the item name and packaging details, which in this scenario is "Thai Milk Tea (12 pack)".  
* **Inventory Unit**: Specifies the unit of measurement for the inventory, such as bags, boxes, liters, etc. This helps in quantifying the stock movements accurately.  
* **Stock In**: Represents the quantity of the item that was added to the inventory. A zero in this field indicates that no new stock was added during this transaction.  
* **Stock Out**: Shows the quantity of the item that was deducted from the inventory, which is critical for tracking reductions in stock due to returns, or adjustments.  
* **Amount**: Reflects the total monetary value affected by this stock movement. This could represent the cost associated with the stock deducted or added, which is essential for financial tracking and analysis.  
* **Reference**: Contains a reference code or number that links this stock movement to related documents, such as a credit note, purchase order, or sales order. This is crucial for audit trails and reconciling financial records.

![][image1]

### **SR In Edit mode**

#### **Action Buttons(Header)**

* **Commit:** Submit the request for approval  
* **Save:** Save the request content to systems  
* **Back:** Return to request view mode

#### **Action Buttons (Item Detail)**

* **Create:** To add a new comment or attachment to the record.  
* **Print:** To print the details of the comments, attachments, and activities.

### **Header Information**

1. **Ref \#** \- A unique identifier or reference number for the store requisition.  
2. **Date** \- The date when the requisition was created or logged.  
3. **Movement Type** \- Indicates the type of inventory transaction; typically refers to items being 'Issued' or 'Transfer'.  
4. **Description** \- Additional details or notes about the requisition.  
5. **Requested From** \- The department or location requesting the items.  
6. **Job Code** \- A code associated with a specific job or project, if applicable.  
7. **Main Store** \- The primary store or location handling the requisition.  
8. **Process** \- Indicates the current status in the process workflow.

\*\* Note add "Default System to Available for selections"

### **Item Request Details \- Item Edit Mode**

### **Action Buttons**

* **Edit, Delete** \- Options to modify or remove the item from the requisition.  
* **Create** \- Button to finalize or add new entries.

#### **Detail Titles**

1. **Change All Request Date** \- Allows setting or changing the requested date for all items simultaneously.  
2. **Store Name** \- Indicates the specific store or department within the organization.

**Item Description**:

* **Item Code : Item Name : Additional Identifier** \- Each item is listed with its code, name, and any additional identifier or description.  
  * **Unit** \- The unit of measure for the item.  
  * **Qty Req.** \- Quantity requested.  
  * **Qty Allocated**  
  * **Request Date** \- The date when the item is required.

### **Inventory Information**

* **Issued On Hand** \- The current quantity of the item available in stock.  
* **On Order** \- The quantity of the item currently ordered from suppliers.  
* **Last Price** \- The last recorded price per unit.  
* **Last Vendor** \- The last vendor from which the item was purchased or added to inventory.

#### **Item Information**

* **Category**  
* **Sub Category**  
* **Item Group**  
* **Bar Code** \- Classifications and identifiers for inventory management.  
* **Comment:** Remarks on the current items

**Stock Movement**:

* **Commit Date**: This is the date on which the stock movement was finalized or recorded in the system.  
* **Location**: Indicates the specific store or inventory location where the stock movement occurred, helping track where inventory adjustments are made.  
* **Item Description**: Provides detailed information about the item, including an SKU number and a description. This typically includes the item name and packaging details.  
* **Inventory Unit**: Specifies the unit of measurement for the inventory, such as bags, boxes, litres, etc. This helps in quantifying the stock movements accurately.  
* **Stock In**: Represents the quantity of the item that was added to the inventory. A zero in this field indicates that no new stock was added during this transaction.  
* **Stock Out**: Shows the quantity of the item that was deducted from the inventory, which is critical for tracking reductions in stock due to returns, or adjustments.  
* **Amount**: Reflects the total monetary value affected by this stock movement. This could represent the cost associated with the stock deducted or added, which is essential for financial tracking and analysis.  
* **Reference**: Contains a reference code or number that links this stock movement to related documents, such as a credit note, purchase order, or sales order. This is crucial for audit trails and reconciling financial records.

**Workflow Buttons**  
Action cover the entire request or by selected items

* **Split & Reject**: This might be a specialised action that both splits a request into parts and rejects it. If it is indeed "Split & Reject," it would suggest functionality for separating a request into components and then rejecting it, perhaps to handle different parts of the request separately.

\*\* Note: Where is this allow

* **Approve**: This button is likely used to give a positive acknowledgment to the process in question, effectively moving it forward in a workflow.  
* **Reject**: Conversely, this button is for declining or turning down the process or request being reviewed.  
* **Send Back**: This option typically sends the request back to the previous step or to the requester for further information or corrections.

Additional Note:

* Missing: Filtering by 'Status' could be particularly useful to track requests at different stages of the process (e.g., "In Process," "Complete," "Partial," "Rejected")

#### **Footer Section**

#### **Comment Section**

* **\#:** A numerical identifier for each comment made.  
* **Date:** When the comment was added.  
* **By:** Who made the comment.  
* **Comment:** The content of the comment itself.

#### **Attachment Section**

* **\#:** A numerical identifier for each attached file.  
* **File Name:** The name of the attached file.  
* **Description:** A brief description of the file.  
* **Public:** Indicates whether the file is public within the system or private.  
* **Date:** The date the file was attached.  
* **By:** The person who attached the file.

#### **Activity Log Section**

* **Date:** When the activity took place.  
* **By:** Who performed the activity.  
* **Action:** The type of activity, such as 'Create', 'Update', 'Delete', etc.  
* **Log:** Details about the activity, possibly including additional notes or system-generated messages.

### **UC-68: Create and Manage Store Requisition**

* **UC ID and Name:** UC-68: Create and Manage Store Requisition  
* **Primary Actor:** Requester (Staff Member)  
* **Trigger:** The need to request new supplies or services is identified.  
* **Description:** Enables the Requester to create a store requisition, which can be saved as a draft to be completed or edited later, or submitted immediately for approval.  
* **Preconditions:**  
  * The Requester has access to the requisition system.  
  * The Requester is trained on how to use the requisition system.  
* **Postconditions:**  
  * If saved as a draft, the requisition can be accessed and edited later.  
  * If submitted, the requisition is forwarded to the appropriate manager for approval.

#### **Main Success Scenario:**

1. **Initiate Requisition**: The Requester logs into the requisition system and selects the option to create a new requisition.  
2. **Enter Requisition Details**: The Requester enters all necessary details for the requisition, including item descriptions, quantities, and any preferred vendor information.  
3. **Decision Point**: The Requester decides whether to save the requisition as a draft or submit it for approval.  
   * **3a. Save as Draft**:  
     * The Requester selects the option to save the requisition as a draft.  
     * The system saves the entered details and allows the requisition to be edited later.  
     * The Requester exits the system or continues with other tasks.  
     * Use case ends.  
   * **3b. Submit for Approval**:  
     * The Requester selects the option to submit the requisition for approval.  
     * The system validates that all necessary fields are filled out.  
     * The system forwards the requisition to the designated approver.  
     * The Requester receives a confirmation that the requisition has been submitted.  
     * Use case ends.

#### **Extensions:**

* **2a. Missing or Incorrect Details**:  
  * **2a1**: During submission, the system checks for missing or incorrect details.  
  * **2a2**: The Requester is alerted to provide the missing information or correct any inaccuracies.  
  * **2a3**: The Requester updates the form and proceeds to Decision Point (Step 3).  
* **3b1. Submission Validation Failure**:  
  * **3b1.1**: If the submission validation fails due to incomplete details, the Requester is notified of the specific errors.  
  * **3b1.2**: The Requester returns to the requisition form to make necessary corrections.  
  * **3b1.3**: The Requester resubmits the requisition.

#### **Special Requirements:**

* **Usability**: The requisition system must be user-friendly, providing clear options for saving drafts and submitting for approval.  
* **Access Control**: Proper access control should be implemented to ensure that saved drafts are only editable by the original Requester or authorized personnel.

### **UC-64: Approve Requisition Requests**

* **UC ID and Name:** UC-64: Approve Requisition Requests  
* **Primary Actor:** Store Manager  
* **Trigger:** A requisition request is submitted by staff.  
* **Description:** The Store Manager reviews and approves requisition requests based on inventory levels, budget considerations, and operational needs.  
* **Preconditions:** Requisition requests are properly submitted with all necessary details.  
* **Postconditions:** Approved requisitions are forwarded to procurement for processing.  
* **Main Success Scenario:**  
  1. The Store Manager receives a requisition request from store staff.  
  2. The Manager reviews the request, checking inventory levels and budget alignment.  
  3. If appropriate, the Manager approves the requisition.  
  4. The approved requisition is sent to the procurement department.  
  5. The Store Manager updates the requisition log to reflect the approval status.  
  6. Use case ends.

### **UC-65: Deny Requisition Requests**

* **UC ID and Name:** UC-65: Deny Requisition Requests  
* **Primary Actor:** Store Manager  
* **Trigger:** A requisition request does not meet the required criteria for approval.  
* **Description:** The Store Manager denies requisition requests that are unnecessary, exceed budget limitations, or do not align with inventory strategy.  
* **Preconditions:** The requisition request is reviewed and found lacking based on specified criteria.  
* **Postconditions:** Denied requests are archived with notes explaining the decision.  
* **Main Success Scenario:**  
  1. The Store Manager reviews a requisition request and identifies issues (e.g., budget, inventory surplus).  
  2. The Manager decides to deny the request.  
  3. The Manager communicates the decision to the requesting party, providing reasons and possible alternatives.  
  4. The requisition request is updated in the system as denied.  
  5. Documentation is archived for future reference.  
  6. Use case ends.

### **UC-66: Modify Requisition Requests**

* **UC ID and Name:** UC-66: Modify Requisition Requests  
* **Primary Actor:** Store Manager  
* **Trigger:** A requisition request requires modification to meet approval criteria.  
* **Description:** The Store Manager modifies requisition requests to align with inventory needs, budget constraints, or other operational requirements.  
* **Preconditions:** The original requisition is not suitable for approval in its current form.  
* **Postconditions:** The modified requisition meets the necessary criteria and is ready for reevaluation.  
* **Main Success Scenario:**  
  1. The Store Manager reviews the requisition and identifies needed modifications.  
  2. The Manager contacts the requester to discuss the necessary changes.  
  3. Modifications are made to the requisition request.  
  4. The Manager reevaluates the modified requisition.  
  5. If now appropriate, the requisition is approved and processed.  
  6. Use case ends.

### **UC-67: Monitor Requisition Processing**

* **UC ID and Name:** UC-67: Monitor Requisition Processing  
* **Primary Actor:** Store Manager  
* **Trigger:** Requisition requests are processed by the procurement department.  
* **Description:** The Store Manager monitors the processing of approved requisitions to ensure timely fulfillment and resolve any issues that arise during procurement.  
* **Preconditions:** Requisitions have been approved and forwarded to procurement.  
* **Postconditions:** Requisitions are successfully processed and fulfilled.  
* **Main Success Scenario:**  
  1. The Store Manager tracks the status of approved requisitions.  
  2. The Manager liaises with the procurement department to address any delays or problems.  
  3. The Manager updates inventory management systems upon receipt of goods.  
  4. Any discrepancies or issues during processing are resolved.  
  5. Use case ends.

### **UC-69: Approve Requisition and Record Stock as Issued**

* **UC ID and Name:** UC-69: Approve Requisition and Record Stock as Issued  
* **Primary Actor:** Store Manager  
* **Trigger:** A requisition is submitted for approval.  
* **Description:** The Store Manager reviews and approves requisitions, and upon approval, the system automatically records the associated stock as issued, updating inventory levels accordingly.  
* **Preconditions:**  
  * Requisitions have been created by staff and submitted for approval.  
  * The Store Manager has access to the requisition approval system.  
* **Postconditions:**  
  * The requisition is approved.  
  * Inventory levels are updated to reflect the issued stock.  
  * Records are maintained for tracking and auditing purposes.

#### **Main Success Scenario:**

1. **Review Requisition**: The Store Manager logs into the system and reviews a requisition submitted for approval. This includes verifying the items, quantities, and justifications provided.  
2. **Approve Requisition**: If the requisition meets all necessary criteria and is justified, the Store Manager approves the requisition.  
3. **System Updates Inventory**: Upon approval, the system automatically updates inventory records to show the specified items as issued. The stock levels are adjusted to reflect the new status.  
4. **Record Issue Details**: The system records the details of the issued stock, including the date of issue, the items, and the quantities.  
5. **Notify Requester**: The system sends a notification to the requester confirming that the requisition has been approved and the stock has been issued.  
6. **Use case ends**.

#### **Extensions:**

* **2a. Requisition Denied**:  
  * **2a1**: If the Store Manager finds the requisition unjustified or incorrect, it is denied.  
  * **2a2**: The system notifies the requester of the denial, including reasons and possible steps for resubmission or modification.  
  * **2a3**: Use case ends.  
* **3a. Inventory Error**:  
  * **3a1**: If there is an error in updating inventory (e.g., system error, insufficient stock levels), the Store Manager is alerted.  
  * **3a2**: The Store Manager investigates the discrepancy and takes appropriate action (e.g., checks further stock, adjusts the requisition).  
  * **3a3**: Once resolved, the inventory update is attempted again.

#### **Special Requirements:**

* **Real-time Inventory Tracking**: The inventory system must be capable of real-time tracking to ensure accurate updates.  
* **Audit Trail**: The system should maintain a complete audit trail of all actions taken, including approvals, denials, and inventory updates, for compliance and auditing purposes.

[image1]: <data:image/png;base64,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>