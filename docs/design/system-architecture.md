# System Architecture Overview

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
```mermaid
graph TD
    A[Food Service Management System] --> B[Core Modules]
    A --> C[Operational Modules]
    A --> D[Planned Modules]
    
    B --> B1[Authentication]
    B --> B2[UI Framework]
    B --> B3[API Services]
    
    C --> C1[Recipe Management]
    C1 --> C1a[[Recipe CRUD]]
    C1 --> C1b[[Categories]]
    C1 --> C1c[[Cuisine Types]]
    
    C --> C2[Procurement]
    C2 --> C2a[[Purchase Requests]]
    C2 --> C2b[[Purchase Orders]]
    C2 --> C2c[[Vendor Management]]
    
    C --> C3[User Administration]
    C3 --> C3a[[RBAC]]
    C3 --> C3b[[Audit Logs]]
    
    D --> D1[Inventory Management]
    D1 --> D1a{{Stock Tracking}}
    D1 --> D1b{{Wastage Reporting}}
    
    D --> D2[Store Operations]
    D2 --> D2a{{Requisition Logic}}
    D2 --> D2b{{GRN Processing}}
    
    style B stroke:#2196F3,stroke-width:2px
    style C stroke:#4CAF50,stroke-width:2px
    style D stroke:#FF9800,stroke-width:2px,stroke-dasharray: 5 5
    
    classDef core fill:#e3f2fd,stroke:#2196F3
    classDef operational fill:#e8f5e9,stroke:#4CAF50
    classDef planned fill:#fff3e0,stroke:#FF9800,stroke-dasharray: 5 5
    
    class B core
    class C operational
    class D planned
```

## Diagram Legend
- **Solid Borders**: Implemented modules
- **Dashed Borders**: Planned/Partially implemented
- Colors:
  - Blue: Core infrastructure
  - Green: Operational features
  - Orange: Future development

## Implementation Details
1. **Recipe Management**  
   - Full CRUD operations implemented  
   - Category/Cuisine type management in `/app/(main)/operational-planning`
   
2. **Procurement Module Components**  
   **a. Purchase Requests (PR)**  
   - PR creation with multi-level approval workflows  
   - Template system (/docs/purchase-request-template-ba.md)  
   - Integration with inventory needs analysis  
   - Status: Complete (v1.4+)  

   **b. Purchase Orders (PO)**  
   - Automated PO generation from approved PRs  
   - Vendor communication interface  
   - PO tracking with delivery milestones  
   - Status: Complete (v1.6+)  

   **c. Vendor Management**  
   - Vendor database with performance metrics  
   - Contract management framework  
   - Integration with external rating systems  
   - Status: Partial implementation (v1.8-beta)  

   **Key Flows Documented In:**  
   - /docs/procurement-ba.md  
   - /docs/purchase-request-api-sp.md  
   - /docs/purchase-order-api-sp.md

3. **Inventory & Store Ops**  
   - Documented in `/docs/inventory-*.md`  
   - Placeholder components exist  
   - Core logic pending implementation

## Operational Workflow Diagram
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Submit Purchase Request
    Frontend->>API: POST /purchase-requests
    API->>Database: Create PR record
    API-->>Frontend: PR Created
    
    loop Approval Workflow
        Frontend->>API: GET /workflows/{pr_id}
        API->>Database: Query approval rules
        API-->>Frontend: Approval steps
        Frontend->>API: POST /approvals
        API->>Database: Update PR status
    end
    
    User->>Frontend: Convert to Purchase Order
    Frontend->>API: POST /purchase-orders
    API->>Database: Create PO record
    API->>External Vendor: Send PO via email
    API-->>Frontend: PO Created
    
    Note over Database: Audit logs stored<br/>for all transactions
```
