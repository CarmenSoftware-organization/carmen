# Carmen Project - Development Memory

## Purchase Request Management

### PR Detail Item Expandable Panel Enhancement

**Implementation Document**: [PR Detail Item Expandable Panel Implementation](./docs/pages/pr/pr-detail-item-expandable-panel-implementation.md)

**Status**: Implementation Ready  
**Components**: ItemsTab.tsx expandable panel sections  
**Key Features**: 
- Role-based section visibility (Requestor/Approver/Purchaser)
- Business dimensions editing (Job Number, Events, Projects, Market Segments)
- Enhanced inventory information with location-based stock
- Vendor comparison functionality
- Quantity unit conversion display
- Universal edit button for all roles

**Last Updated**: January 2025

#### Technical Requirements
- Fix malformed JSX structure in ItemsTab.tsx
- Implement role-based expandable panel sections
- Add enhanced inventory information display
- Integrate vendor comparison functionality
- Ensure proper RBAC field-level permissions
- Hide vendor and price information from Requestor role completely

#### Related Documentation
- [Purchase Request RBAC](./docs/pages/pr/pr-rbac.md)
- [Purchase Request Business Logic](./docs/pages/pr/pr-business-logic.md)
- [Field Permissions Utility](./lib/utils/field-permissions.ts)

#### Role-Based Visibility Rules
**Requestor (Staff) Role:**
- Cannot see vendor names or pricelist numbers in any view
- Cannot see pricing information (unit prices, totals, etc.)
- Cannot access vendor comparison functionality
- Can only see delivery information and basic item details

**Approver Roles (Department Manager, Financial Manager):**
- Can view all vendor and pricing information
- Cannot edit vendor or pricing fields
- Can approve quantities and add comments

**Purchaser Role (Purchasing Staff):**
- Full access to vendor and pricing information
- Can edit vendor fields and pricelist numbers
- Has access to vendor comparison functionality
- Can modify all pricing-related fields

---

## Project Structure

### Key Components
- Purchase Request Management Module
- Inventory Management System
- User Management and RBAC
- Vendor Management System

### Development Guidelines
- Maintain role-based access control
- Follow existing UI/UX patterns
- Ensure responsive design
- Implement proper error handling
- Document all changes 

## Development Mode Guidelines

### When to Run Dev Mode
- When making local component modifications
- Before submitting pull requests for testing
- When debugging specific feature implementations
- To verify role-based access control configurations
- To test new UI/UX interactions