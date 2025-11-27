# Vendor Price List Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### 1.1 Purpose
This document outlines the business logic and requirements for the Vendor Price List module within the Carmen F&B Management System. It serves as a comprehensive guide for managing vendor pricing, procurement costs, and supplier agreements.

### 1.2 Scope
The documentation covers the entire Vendor Price List module, including:
- Vendor Price List Management
- Cost Calculation Methods
- Multi-Currency Support
- Vendor Agreement Pricing
- Contract Pricing
- Price Updates and Maintenance
- Approval Workflows
- Integration with Procurement Modules

### 1.3 Audience
- Procurement Team
- Finance Department
- Category Managers
- Purchasing Officers
- Vendors/Suppliers
- System Administrators
- Auditors

### 1.4 Version History
| Version | Date       | Author | Changes Made |
|---------|------------|---------|--------------|
| 1.0     | 2024-03-20 | System  | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Maintain accurate vendor pricing records
- Support multiple supplier agreements
- Enable efficient cost updates and maintenance
- Ensure procurement compliance and control
- Support multi-currency operations
- Track cost changes and approvals
- Enable contract pricing management
- Optimize procurement costs

### 2.2 Module Overview
The Vendor Price List module manages the following key functions:
- Vendor Price List Creation and Management
- Cost Comparison and Analysis
- Vendor Agreement Management
- Currency Management
- Contract Pricing
- Price Change Workflow
- Cost History Tracking
- Integration with Purchase Orders and Goods Receipt

### 2.3 Key Stakeholders
- Procurement Managers
- Finance Team
- Category Managers
- Purchasing Officers
- Vendors/Suppliers
- System Administrators
- Auditors

## 3. Business Rules

### 3.1 Price List Creation Rules (VPL_CRT)
- **VPL_CRT_001**: Each vendor price list must have a unique identifier
- **VPL_CRT_002**: Price lists must specify vendor's currency
- **VPL_CRT_003**: Effective dates are mandatory
- **VPL_CRT_004**: Price list type must be specified (Regular/Contract/Spot)
- **VPL_CRT_005**: Vendor and payment terms must be validated

### 3.2 Cost Calculation Rules (VPL_CAL)
- **VPL_CAL_001**: Support multiple units of measure
- **VPL_CAL_002**: Base cost must be in vendor's currency
- **VPL_CAL_003**: Support tiered quantity pricing
- **VPL_CAL_004**: Include landed cost calculations
- **VPL_CAL_005**: Support tax-inclusive and exclusive pricing

### 3.3 Currency Rules (VPL_CUR)
- **VPL_CUR_001**: Exchange rates must be date-effective
- **VPL_CUR_002**: Support vendor's base currency
- **VPL_CUR_003**: Base currency costs must be maintained
- **VPL_CUR_004**: Exchange rate changes trigger recalculation
- **VPL_CUR_005**: Historical rates must be maintained

### 3.4 Vendor Agreement Rules (VPL_VND)
- **VPL_VND_001**: Support vendor-specific terms
- **VPL_VND_002**: Enable minimum order quantities
- **VPL_VND_003**: Define lead time requirements
- **VPL_VND_004**: Validate payment terms
- **VPL_VND_005**: Track agreement history

### 3.5 UI Rules
- **VPL_021**: Price list grid must display key information (vendor, currency, validity)
- **VPL_022**: Item grid must support inline cost editing
- **VPL_023**: Cost changes must update in real-time
- **VPL_024**: Status changes must be reflected immediately
- **VPL_025**: Validation errors must be displayed clearly
- **VPL_026**: Required fields must be marked with asterisk (*)
- **VPL_027**: Currency fields must show appropriate symbols
- **VPL_028**: Dates must use regional format with UTC offset
- **VPL_029**: Actions must respect user permissions
- **VPL_030**: Print preview must match final format
- **VPL_031**: All costs must display 2 decimal places
- **VPL_032**: Quantity breaks must display 3 decimal places
- **VPL_033**: Exchange rates must show 5 decimal places
- **VPL_034**: All numeric values must be right-aligned
- **VPL_035**: Use regional numeric format

### 3.6 System Calculations Rules
- **VPL_041**: Base cost = Round(Unit Cost in Vendor Currency, 2)
- **VPL_042**: Quantity break cost = Round(Base Cost × Break Factor, 2)
- **VPL_043**: Currency conversion = Round(Cost × Exchange Rate, 2)
- **VPL_044**: Landed cost = Round(Base Cost + Round(Sum of Extra Costs, 2), 2)
- **VPL_045**: Tax inclusive cost = Round(Cost × (1 + Tax Rate), 2)
- **VPL_046**: All calculations must round intermediates
- **VPL_047**: Use half-up rounding method
- **VPL_048**: Quantity breaks use 3 decimal precision
- **VPL_049**: Exchange rates use 5 decimal precision
- **VPL_050**: Final costs use 2 decimal places

### 3.7 Price Update Rules
- **VPL_UPD_001**: Cost updates require vendor documentation
- **VPL_UPD_002**: Changes above threshold need approval
- **VPL_UPD_003**: Track all cost changes
- **VPL_UPD_004**: Support future dated changes
- **VPL_UPD_005**: Notify affected departments

### 3.8 Validation Rules
- **VPL_VAL_001**: Costs must be above minimum threshold
- **VPL_VAL_002**: Enforce maximum cost deviation
- **VPL_VAL_003**: Check date overlaps
- **VPL_VAL_004**: Validate currency matches
- **VPL_VAL_005**: Verify vendor agreements

### 3.9 Contract Pricing Rules
- **VPL_CON_001**: Support volume-based contracts
- **VPL_CON_002**: Enable period-based pricing
- **VPL_CON_003**: Handle rebate agreements
- **VPL_CON_004**: Support multi-year contracts
- **VPL_CON_005**: Allow cost protection periods

### 3.10 Vendor Price Comparison Rules
- **VPL_CMP_001**: The system must enable side-by-side comparison of vendor prices for identical or similar products. This comparison should normalize all costs to a common unit of measure and currency, incorporating exchange rates, landed costs, and quantity break pricing. The comparison must also factor in vendor-specific terms such as payment terms, lead times, and minimum order quantities to calculate the true cost of procurement.

- **VPL_CMP_002**: Price comparison analysis must include historical pricing trends and future price projections. The system should maintain a rolling 12-month price history for each vendor-product combination, calculate price volatility metrics, and highlight significant price variations. This historical data should be used to generate cost-saving opportunities and identify vendors with stable pricing patterns. The analysis should also consider seasonal price variations and market indices for commodity-based products.

- **VPL_CMP_003**: The comparison engine must support weighted scoring of vendors based on multiple criteria beyond just price. This includes vendor performance metrics (quality, on-time delivery, order fill rate), financial terms (payment terms, early payment discounts), and operational factors (lead times, minimum order quantities). The system should calculate a total cost of ownership (TCO) score that combines all these factors, enabling procurement officers to make informed decisions based on both quantitative and qualitative criteria.

## 4. Data Definitions

### 4.1 Vendor Price List Header
\`\`\`typescript
interface VendorPriceList {
  id: string
  code: string
  vendorId: string
  vendorName: string
  type: VendorPriceListType
  status: PriceListStatus
  baseCurrency: string
  startDate: Date
  endDate?: Date
  paymentTerms: string
  minimumOrderValue?: number
  leadTime: number
  contractNumber?: string
  isContract: boolean
  taxInclusive: boolean
  approvalRequired: boolean
  approvalThreshold: number
  termsAndConditions: string
  attachments: Attachment[]
  createdBy: string
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
  approvedBy?: string
  approvedDate?: Date
}
\`\`\`

### 4.2 Vendor Price List Detail
\`\`\`typescript
interface VendorPriceListDetail {
  id: string
  priceListId: string
  productId: string
  vendorSKU: string
  vendorProductName: string
  unitId: string
  baseUnitCost: number
  currency: string
  minimumOrderQty: number
  leadTime: number
  startDate: Date
  endDate?: Date
  quantityBreaks: QuantityBreak[]
  lastPurchaseCost: number
  taxRate: number
  isManualOverride: boolean
  status: PriceDetailStatus
}

interface QuantityBreak {
  minimumQuantity: number
  maximumQuantity?: number
  unitCost: number
  currency: string
}
\`\`\`

### 4.3 Price List Types
\`\`\`typescript
enum VendorPriceListType {
  Regular = "Regular",
  Contract = "Contract",
  Spot = "Spot",
  Tender = "Tender"
}

enum PriceListStatus {
  Draft = "Draft",
  Active = "Active",
  Inactive = "Inactive",
  Expired = "Expired"
}
\`\`\`

## 5. Logic Implementation

### 5.1 Price List Management
1. Creation and Maintenance
   - Vendor Price List Setup
   - Agreement Terms
   - Currency Configuration
   - Quantity Break Setup
   - Status Management

2. Cost Calculations
   - Base Cost Determination
   - Quantity Break Application
   - Currency Conversion
   - Landed Cost Calculation
   - Tax Handling

### 5.2 Update Processing
1. Mass Update Handling
   - Validation Rules
   - Documentation Requirements
   - Approval Workflow
   - History Tracking
   - Department Notification

2. Special Cases
   - Contract Pricing
   - Spot Pricing
   - Override Handling
   - Currency Updates
   - Market Changes

## 6. Validation and Testing

### 6.1 Test Scenarios
1. Price List Creation
   - Basic Setup
   - Currency Configuration
   - Vendor Terms
   - Quantity Breaks
   - Date Validation

2. Cost Calculations
   - Base Costs
   - Quantity Breaks
   - Currency Conversion
   - Landed Costs
   - Tax Calculations

3. Updates and Changes
   - Cost Updates
   - Approval Process
   - History Tracking
   - Contract Changes
   - Currency Changes

### 6.2 Error Handling
- Invalid Cost Calculations
- Currency Mismatches
- Date Overlap Errors
- Vendor Agreement Issues
- Approval Process Errors

## 7. Maintenance and Governance

### 7.1 Module Ownership
- Primary Owner: Procurement Department
- Technical Owner: IT Department
- Process Owner: Finance Department

### 7.2 Review Process
- Daily cost monitoring
- Weekly vendor review
- Monthly cost analysis
- Quarterly contract review

### 7.3 Change Management
- Cost change workflow
- Version control
- Vendor communication
- Training requirements
- Documentation updates

## 8. Appendices

### 8.1 Glossary
- **Base Cost**: Vendor's unit cost
- **Landed Cost**: Total cost including freight and duties
- **MOQ**: Minimum Order Quantity
- **FOB**: Free On Board

### 8.2 References
- Procurement Policy Manual
- Vendor Management Guidelines
- Financial Processing Rules
- System Technical Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
| Category Manager | | | | 