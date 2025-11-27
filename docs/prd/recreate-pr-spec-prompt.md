## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
You are a Product Specialist. Your task is to create a Feature Specification and Functional Requirements document for the Purchase Requisition (PR) module in the Carmen ERP system.

The document should be based on the existing code in the `app/(main)/procurement/purchase-requests/` directory.

The document should be structured with the following sections:

**1. Feature Spec**
    *   1.1. Introduction
    *   1.2. Problem Statement
    *   1.3. Goals and Objectives
    *   1.4. Scope
    *   1.5. User Personas
    *   1.6. User Stories
    *   1.7. Assumptions and Constraints

**2. Functional Requirements**
    *   2.1. PR Creation
    *   2.2. PR Approval Workflow
    *   2.3. PR Viewing and Listing
    *   2.4. PR Detail View
    *   2.5. PR Conversion to Purchase Order (PO)
    *   2.6. Notifications
    *   2.7. Roles and Permissions
    *   2.8. Types and Interfaces

The "Functional Requirements" section should only include features that are already implemented in the code. You should review the code in the `app/(main)/procurement/purchase-requests/` directory to identify the implemented features.

The "Types and Interfaces" section should include the `PurchaseRequest`, `PurchaseRequestItem`, `Comment`, and other relevant interfaces and enums from the code.

Your final output should be a single markdown file named `purchase-requisition-spec.md`.