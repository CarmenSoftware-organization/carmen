# Purchase Request Creation Screen Specification

**Module**: Procurement  
**Function**: Purchase Request Creation  
**Screen**: New Purchase Request Form  
**Version**: 1.0  
**Date**: January 22, 2025  
**Status**: Based on Actual Source Code Analysis

## Implementation Overview

- **Purpose**: Interactive form interface for creating new purchase requests with dynamic item management, vendor selection, and approval routing
- **File Locations**: `app/(main)/procurement/purchase-requests/new-pr/page.tsx`, form components
- **User Types**: All users can create PRs with role-based field visibility and approval routing
- **Current Status**: Full form functionality operational with validation, item management, and workflow integration

## Visual Reference

![Purchase Request Creation Screen](../procurement-purchase-requests-new-pr.png)

## Layout & Navigation

### Header Section
- **Navigation Breadcrumb**: Shows "Procurement > Purchase Requests > New PR" path
- **Page Title**: "Create Purchase Request" with form progress indicator
- **Action Buttons**: Save as Draft, Submit for Approval, Cancel with confirmation dialogs
- **Help System**: Context-sensitive help tooltips and field guidance

### Form Structure
- **Multi-Section Layout**: Organized into logical sections for better user experience
- **Progressive Disclosure**: Advanced options revealed as needed to avoid overwhelming users
- **Responsive Design**: Form adapts to different screen sizes while maintaining usability
- **Fixed Action Bar**: Save/Submit buttons remain accessible during scrolling

### Section Organization
- **Request Information**: Basic PR details and metadata
- **Items Section**: Dynamic line items with add/remove functionality
- **Vendor Information**: Vendor selection and contact details
- **Approval Routing**: Workflow path and approval requirements
- **Comments and Attachments**: Supporting documentation and notes

## Form Elements

### Request Information Section
- **PR Description**: Multi-line text field for detailed request purpose with character count
- **Department Selection**: Dropdown populated with user's accessible departments
- **Requestor Information**: Auto-populated from user context with override capability
- **Priority Level**: Radio buttons or dropdown for High, Medium, Low with descriptions
- **Required Date**: Date picker with validation for realistic lead times
- **Budget Reference**: Optional field linking to specific budget codes or projects

### Items Management Section
- **Dynamic Item Rows**: Add/remove functionality for multiple line items
- **Item Search**: Type-ahead search integrated with product catalog and vendor listings
- **Quantity Fields**: Numeric inputs with unit of measure selection
- **Price Information**: Estimated unit price with total calculations
- **Item Description**: Rich text fields for detailed specifications
- **Category Assignment**: Auto-categorization with manual override options

### Item Row Features
- **Product Lookup**: Search functionality connecting to master product database
- **Vendor Suggestions**: Recommended vendors based on item category and purchase history
- **Price Estimation**: Historical pricing data and current market rates
- **Specification Fields**: Custom fields based on item category (technical specs, dimensions, etc.)
- **Delivery Requirements**: Special handling, delivery location, and timing requirements

### Vendor Selection
- **Preferred Vendors**: List of approved vendors with performance ratings
- **Vendor Search**: Type-ahead search with vendor details and contact information
- **New Vendor Option**: Request for vendor onboarding integrated into PR workflow
- **Multiple Vendors**: Support for split orders across different suppliers
- **Vendor Comparison**: Side-by-side comparison of pricing and terms

### Approval Routing Section
- **Automatic Routing**: System-determined approval path based on amount and department
- **Manual Override**: Option to specify different approvers for exceptional cases
- **Expedite Requests**: Special handling flags for urgent requirements
- **Budget Impact**: Display of budget utilization and approval requirements
- **Escalation Rules**: Automatic escalation paths for delayed approvals

## User Interactions

### Form Validation
- **Real-Time Validation**: Field-level validation with immediate feedback
- **Cross-Field Dependencies**: Validation rules that consider multiple field combinations
- **Business Rule Validation**: Integration with business logic for spending limits and policies
- **Error Prevention**: Proactive guidance to prevent common data entry errors
- **Required Field Indicators**: Clear visual indicators for mandatory fields

### Dynamic Interactions
- **Auto-Save**: Periodic automatic saving to prevent data loss
- **Draft Management**: Ability to save incomplete forms and return later
- **Field Dependencies**: Form fields that change options based on other selections
- **Calculations**: Automatic totaling and tax calculations where applicable
- **Template System**: Pre-populated forms based on common request types

### Item Management
- **Add/Remove Items**: Intuitive interface for managing line items
- **Copy Item Rows**: Duplicate similar items to speed data entry
- **Bulk Import**: Excel or CSV import for large item lists
- **Item Templates**: Saved item configurations for frequently requested products
- **Drag-and-Drop Reordering**: Rearrange item order within the request

### File Attachments
- **Document Upload**: Support for specifications, quotes, and supporting documentation
- **File Type Validation**: Restrictions on file types and sizes for security
- **Preview Capability**: In-browser preview of common document types
- **Version Control**: Ability to replace attachments with updated versions
- **Mobile Camera Integration**: Direct photo capture from mobile devices

## Role-Based Functionality

### Staff User Experience
- **Simplified Interface**: Streamlined form focusing on essential fields
- **Department Restrictions**: Limited to creating PRs for their assigned department
- **Approval Preview**: Shows expected approval route before submission
- **Budget Visibility**: Can see departmental budget status and available funds
- **Template Access**: Pre-configured templates for common departmental requests

### Department Manager Experience
- **Enhanced Controls**: Additional fields for budget codes and project assignments
- **Team Requests**: Can create PRs on behalf of team members
- **Approval Authority**: Can self-approve PRs within spending limits
- **Budget Management**: Real-time budget tracking and impact assessment
- **Workflow Override**: Can expedite approvals or modify routing for department PRs

### Financial Manager Experience
- **Financial Focus**: Enhanced budget tracking and cost center assignment
- **Multi-Department**: Can create PRs for any department within scope
- **Advanced Approval**: Access to high-level approval workflows and exceptions
- **Cost Analysis**: Integration with cost accounting and financial planning systems
- **Vendor Financial**: Access to vendor financial performance and risk assessment

### Purchasing Staff Experience
- **Complete Functionality**: Access to all form features and advanced options
- **Vendor Management**: Direct access to vendor onboarding and management functions
- **Procurement Analytics**: Integration with purchasing analytics and performance metrics
- **Workflow Administration**: Can modify approval routes and process exceptions
- **Supplier Integration**: Direct communication with suppliers through the interface

### Counter Staff Experience
- **Inventory Integration**: Real-time inventory levels displayed for catalog items
- **Stock Alerts**: Automatic notifications for low stock items in request
- **Receiving Coordination**: Integration with goods receipt and delivery scheduling
- **Location-Specific**: Tailored interface for specific warehouse or storage locations
- **Count Integration**: Links between PR items and physical inventory counts

### Chef Experience
- **Recipe Integration**: Items can be selected from recipe ingredients and specifications
- **Menu Planning**: Integration with menu cycles and production planning
- **Nutritional Information**: Display of nutritional data and allergen information
- **Seasonal Considerations**: Recommendations based on seasonal availability and pricing
- **Cost per Portion**: Automatic calculation of cost impact on menu items

## Business Rules & Validation

### Data Validation Rules
- **Mandatory Fields**: PR description, department, at least one item, required date
- **Numeric Validation**: Quantities must be positive numbers, prices in valid currency format
- **Date Logic**: Required dates must be future dates with reasonable lead time
- **Budget Limits**: Real-time validation against department budget allocations
- **Duplicate Prevention**: System checks for similar recent requests to prevent duplication

### Approval Logic
- **Threshold-Based Routing**: Automatic routing based on total PR value and department policies
- **Hierarchical Approval**: PRs route through appropriate management levels
- **Emergency Procedures**: Special handling for urgent operational requirements
- **Holiday/Absence Handling**: Automatic delegation when regular approvers unavailable
- **Audit Trail**: Complete logging of all validation decisions and approvals

### Item Validation
- **Catalog Compliance**: Items must exist in approved catalog or be flagged for review
- **Vendor Compatibility**: System validates vendor capability to supply requested items
- **Specification Completeness**: Required technical specifications based on item category
- **Quantity Reasonableness**: Validation of quantities against historical usage patterns
- **Price Validation**: Alerts for prices significantly different from historical averages

## Current Limitations

### Implementation Status
- **Template System**: Basic template functionality implemented, advanced templates in development
- **Supplier Integration**: Direct supplier communication features partially implemented
- **Mobile Interface**: Form optimized for desktop, mobile experience improvements planned
- **Bulk Import**: CSV import functionality in testing phase, full deployment pending

### Integration Points
- **ERP Systems**: Integration with external accounting and inventory systems in progress
- **Vendor Portals**: Direct vendor system integration for real-time pricing and availability
- **Document Management**: Enhanced document workflow and approval tracking planned
- **Business Intelligence**: Advanced analytics and reporting capabilities being developed

### Performance Optimization
- **Large Forms**: Performance tuning needed for PRs with many line items
- **Auto-Save**: Optimization of automatic save frequency and data transmission
- **Real-Time Validation**: Balancing validation thoroughness with response time
- **Concurrent Editing**: Multi-user collaboration features for complex PRs planned

---

*This specification represents the current Purchase Request creation interface and will be updated as workflow enhancements and integration improvements are implemented.*