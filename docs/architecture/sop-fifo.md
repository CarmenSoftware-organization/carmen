## Standard Operating Procedures: FIFO Inventory Management

### I. Purpose

This document provides the official operational rules for all staff involved in handling, transacting, and managing physical inventory. Adherence to these rules is mandatory to ensure the accuracy of our inventory system, prevent financial discrepancies, and maintain a clear audit trail. This SOP is the operational counterpart to the system's "FIFO Inventory Calculation Business Logic".

### II. Core Principles

1.  **The System is the Source of Truth:** All inventory movements **must** be recorded in the system. If it's not in the system, it didn't happen.
2.  **Timeliness is Critical:** Transactions must be posted in the system as close to the time of the physical movement as possible. Delays in posting can lead to incorrect stock levels and costing.
3.  **Get it Right the First Time:** Modifying a posted transaction is a complex, system-intensive process. Every effort must be made to ensure accuracy at the time of initial data entry.
4.  **Open Periods are for Corrections Only:** An open accounting period allows for the correction of legitimate errors. It is not for managing transactions that should have been posted in a prior, now-closed period.

### III. Receiving Goods (GRN)

* **Rule 1: Verify Before Posting.** All quantities, prices, and product details on a Goods Received Note (GRN) must be physically verified against the supplier's delivery note and the physical goods **before** the GRN is posted in the system.
* **Rule 2: Account for All Costs.** All associated landed costs (freight, duties, etc.) must be known and included at the time of the GRN posting to ensure the initial cost layer is accurate. Do not post a GRN with estimated costs.
* **Rule 3: Post on Day of Receipt.** GRNs must be posted on the same business day that the physical goods are received and accepted into the facility.

### IV. Issuing & Transferring Goods

* **Rule 1: Transactions Precede Movement.** An approved stock requisition or transfer must be posted in the system **before** the physical goods are removed from the storeroom. The resulting picklist or transfer note from the system is the authorization for the storeroom staff to release the items.
* **Rule 2: Accuracy is Non-Negotiable.** The product and quantity issued must exactly match the system transaction. Any discrepancies must be resolved before the goods are moved.

### V. Modifying Posted Transactions

* **Rule 1: Modification is the Last Resort.** Modifying a posted transaction triggers a complex recalculation that can impact the cost of every subsequent sale in the period. This function is reserved for correcting genuine data entry errors only.
* **Rule 2: Understand the "Propagation Lock".** You **cannot** modify a receipt (GRN) if any of the items from that specific receipt have been transferred to another location. This is a system lock to prevent data corruption. If a cost correction is needed, a separate "Cost Adjustment" must be made at the destination location.
* **Rule 3: Report, Don't Just Edit.** All modifications require a comment or note in the system explaining the reason for the change, for audit purposes.

### VI. Conducting Physical Inventory Counts (Stock Takes)

This is the most critical operational process and must be followed precisely.

* **Step 1: Prepare the Area.** Before starting, ensure the counting area is organized and that no pending receipts or issues are waiting to be processed.
* **Step 2: Initiate the Snapshot.** A manager or team lead initiates the "Stock Take" in the system. This action records the `Book_Qty_At_Snapshot`. **This is the official start time of the count.**
* **Step 3: Begin Counting Immediately.** The physical counting of items must begin **immediately** after the snapshot is taken. The goal is to minimize the time gap between the system snapshot and the physical count.
* **Step 4: Handle "Live" Movements (If Unavoidable).** In a 24/7 operation, movements may occur during the count.
    * The counting team **must** ignore any items being moved *out* of the area after the snapshot time. These items were part of the snapshot and will be correctly recorded by their own issue transaction.
    * The counting team **must** ignore any items being moved *into* the area after the snapshot time. These items were not part of the snapshot and will be correctly recorded by their own receiving transaction.
* **Step 5: Finalize and Enter Data.** The final physical count numbers are entered into the system. The number entered must reflect the physical stock that was on the shelf **at the moment of the snapshot.**
* **Step 6: Review and Post.** A manager must review the system-generated variance report. Once approved, the adjustment is posted. This concludes the count.

**Golden Rule of Stock Takes:** The physical count is a measurement of a single moment in time. That moment is defined by the system snapshot, not by when you start or finish counting.

### VII. Closing the Accounting Period

* **Rule 1: All Adjustments First.** The period cannot be closed until all physical count adjustments for that period have been fully posted.
* **Rule 2: All Recalculations Complete.** The system will prevent period closing if any background recalculation jobs (triggered by modifications) are still pending.
* **Rule 3: Closing is Final.** Once a period is closed, it is locked forever. No transactions can be dated within it. Any required financial corrections must be made via journal entry in the current open period. This is a finance/accounting responsibility.

### VIII. Sequence Diagram of Operational Process

This diagram illustrates the flow of actions for all major inventory processes.

```mermaid
sequenceDiagram
    participant Supplier
    participant Manager
    participant InventorySystem as Inventory System
    participant StoreroomStaff as Storeroom Staff
    participant Department as Department (e.g., Bar)
    participant CountingTeam as Counting Team

    %% --- Section: Receiving Goods (GRN) ---
    rect rgb(245, 250, 255)
        note over Supplier, StoreroomStaff: Process: Receiving Goods (GRN)
        Supplier->>StoreroomStaff: 1. Delivers Goods with Note
        StoreroomStaff->>StoreroomStaff: 2. Physically Verifies Goods
        StoreroomStaff->>InventorySystem: 3. Posts GRN with Landed Costs
        activate InventorySystem
        InventorySystem->>InventorySystem: 4. Creates FIFO Cost Layer(s)
        InventorySystem-->>StoreroomStaff: 5. Confirms Receipt
        deactivate InventorySystem
    end

    %% --- Section: Issuing & Transferring Goods ---
    rect rgb(250, 255, 245)
        note over Department, StoreroomStaff: Process: Issuing & Transferring Goods
        Department->>InventorySystem: 1. Creates Stock Requisition
        activate InventorySystem
        InventorySystem->>Manager: 2. Sends for Approval
        Manager->>InventorySystem: 3. Approves Requisition
        InventorySystem->>InventorySystem: 4. Posts Transaction & Updates FIFO
        InventorySystem-->>StoreroomStaff: 5. Generates Picklist
        deactivate InventorySystem
        StoreroomStaff->>StoreroomStaff: 6. Picks Items per Picklist
        StoreroomStaff->>Department: 7. Delivers Goods
        Department->>Department: 8. Confirms Receipt
    end

    %% --- Section: Physical Inventory Count (Stock Take) ---
    rect rgb(255, 250, 240)
        note over Manager, CountingTeam: Process: Physical Inventory Count
        Manager->>Manager: 1. Ensures Area is Prepared
        Manager->>InventorySystem: 2. Initiates Stock Take
        activate InventorySystem
        InventorySystem->>InventorySystem: 3. Records Book_Qty_At_Snapshot
        InventorySystem-->>CountingTeam: 4. Snapshot Complete - Begin Count
        deactivate InventorySystem
        CountingTeam->>CountingTeam: 5. Physically Counts Inventory
        note right of CountingTeam: Ignore movements<br/>after snapshot time
        CountingTeam->>InventorySystem: 6. Enters Physical Count
        activate InventorySystem
        InventorySystem->>InventorySystem: 7. Calculates Variance
        InventorySystem-->>Manager: 8. Generates Variance Report
        deactivate InventorySystem
        Manager->>Manager: 9. Reviews Variance
        Manager->>InventorySystem: 10. Approves & Posts Adjustment
        activate InventorySystem
        InventorySystem->>InventorySystem: 11. Updates Inventory & FIFO
        deactivate InventorySystem
    end

    %% --- Section: Modifying Posted Transaction ---
    rect rgb(255, 245, 245)
        note over Manager, InventorySystem: Process: Modifying Posted Transaction (If Required)
        Manager->>InventorySystem: 1. Requests Modification
        activate InventorySystem
        InventorySystem->>InventorySystem: 2. Checks Propagation Lock
        alt No Items Transferred
            InventorySystem->>Manager: 3a. Allows Modification
            Manager->>InventorySystem: 4a. Enters Correction & Reason
            InventorySystem->>InventorySystem: 5a. Triggers FIFO Recalculation
            InventorySystem-->>Manager: 6a. Confirms Update
        else Items Already Transferred
            InventorySystem-->>Manager: 3b. Denies - Requires Cost Adjustment
        end
        deactivate InventorySystem
    end

    %% --- Section: Period Closing ---
    rect rgb(248, 245, 255)
        note over Manager, InventorySystem: Process: Closing Accounting Period
        Manager->>InventorySystem: 1. Initiates Period Close
        activate InventorySystem
        InventorySystem->>InventorySystem: 2. Checks All Adjustments Posted
        InventorySystem->>InventorySystem: 3. Checks Recalculations Complete
        alt All Clear
            InventorySystem->>InventorySystem: 4a. Locks Period
            InventorySystem-->>Manager: 5a. Period Closed Successfully
        else Pending Items
            InventorySystem-->>Manager: 4b. Cannot Close - Shows Pending Items
        end
        deactivate InventorySystem
    end
    