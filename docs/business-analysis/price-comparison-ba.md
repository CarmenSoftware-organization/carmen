# Price Comparison Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### 1.1 Purpose
This document outlines the business logic and requirements for the Price Comparison module within the Carmen F&B Management System. It serves as a comprehensive guide for comparing vendor prices, analyzing cost trends, and making data-driven procurement decisions.

### 1.2 Scope
The documentation covers the entire Price Comparison module, including:
- Multi-vendor Price Comparison
- Cost Normalization
- Historical Price Analysis
- Vendor Performance Scoring
- Decision Support System
- Integration with Vendor Price Lists
- Reporting and Analytics

### 1.3 Audience
- Procurement Team
- Category Managers
- Purchasing Officers
- Finance Department
- System Administrators
- Auditors

### 1.4 Version History
| Version | Date       | Author | Changes Made |
|---------|------------|---------|--------------|
| 1.0     | 2024-03-20 | System  | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Enable data-driven vendor selection
- Standardize price comparison methodology
- Optimize procurement costs
- Track price trends and variations
- Support strategic sourcing decisions
- Ensure procurement compliance
- Maximize cost savings opportunities

### 2.2 Module Overview
The Price Comparison module manages the following key functions:
- Price Normalization
- Cost Analysis
- Vendor Scoring
- Trend Analysis
- Decision Support
- Reporting Dashboard
- Integration with Procurement

### 2.3 Key Stakeholders
- Procurement Managers
- Category Managers
- Purchasing Officers
- Finance Team
- System Administrators
- Auditors

## 3. Business Rules

### 3.1 Price Normalization Rules (PC_NRM)
- **PC_NRM_001**: All prices must be converted to base currency using current exchange rates
- **PC_NRM_002**: Units of measure must be standardized for comparison
- **PC_NRM_003**: Landed costs must be calculated including freight, duties, and taxes
- **PC_NRM_004**: Payment terms impact must be quantified using current interest rates
- **PC_NRM_005**: Quantity break pricing must be normalized to standard order quantities
- **PC_NRM_006**: All costs must be calculated to price per base unit
- **PC_NRM_007**: Packaging variations must be normalized to standard units
- **PC_NRM_008**: Lead time costs must be quantified using inventory carrying costs
- **PC_NRM_009**: MOQ impact must be calculated based on average monthly demand
- **PC_NRM_010**: Early payment discounts must be factored into normalized price

### 3.2 Historical Analysis Rules (PC_HST)
- **PC_HST_001**: Maintain rolling 12-month price history for each vendor-product
- **PC_HST_002**: Calculate month-over-month price variance percentage
- **PC_HST_003**: Track price trend direction (increasing/decreasing/stable)
- **PC_HST_004**: Identify seasonal price patterns
- **PC_HST_005**: Calculate price volatility metrics
- **PC_HST_006**: Compare against relevant market indices
- **PC_HST_007**: Generate price forecasts based on historical trends
- **PC_HST_008**: Track contract vs. spot price variations
- **PC_HST_009**: Monitor price correlation with commodity indices
- **PC_HST_010**: Calculate average price stability score

### 3.3 Vendor Performance Rules (PC_VPF)
- **PC_VPF_001**: Track quality metrics (defect rate, returns)
- **PC_VPF_002**: Monitor delivery performance (on-time delivery rate)
- **PC_VPF_003**: Calculate order fill rate
- **PC_VPF_004**: Track documentation accuracy
- **PC_VPF_005**: Monitor response time to queries
- **PC_VPF_006**: Track price competitiveness ranking
- **PC_VPF_007**: Calculate vendor reliability score
- **PC_VPF_008**: Monitor payment term compliance
- **PC_VPF_009**: Track contract compliance
- **PC_VPF_010**: Calculate overall vendor rating

### 3.4 Total Cost Calculation Rules (PC_TCC)
- **PC_TCC_001**: Base price in vendor currency
- **PC_TCC_002**: Currency conversion costs
- **PC_TCC_003**: Freight and shipping costs
- **PC_TCC_004**: Import duties and taxes
- **PC_TCC_005**: Inventory carrying costs
- **PC_TCC_006**: Payment term costs/benefits
- **PC_TCC_007**: Quality-related costs
- **PC_TCC_008**: Administrative costs
- **PC_TCC_009**: Minimum order quantity impact
- **PC_TCC_010**: Lead time impact costs

### 3.5 Scoring and Ranking Rules (PC_SCR)
- **PC_SCR_001**: Price competitiveness (40% weight)
- **PC_SCR_002**: Quality performance (20% weight)
- **PC_SCR_003**: Delivery reliability (15% weight)
- **PC_SCR_004**: Financial terms (10% weight)
- **PC_SCR_005**: Service level (5% weight)
- **PC_SCR_006**: Technical capability (5% weight)
- **PC_SCR_007**: Innovation capability (3% weight)
- **PC_SCR_008**: Sustainability compliance (2% weight)
- **PC_SCR_009**: Calculate weighted average score
- **PC_SCR_010**: Generate vendor ranking

### 3.6 UI Rules (PC_UI)
- **PC_UI_001**: Display side-by-side vendor comparison
- **PC_UI_002**: Show price trends in graphical format
- **PC_UI_003**: Highlight best value options
- **PC_UI_004**: Display scoring breakdown
- **PC_UI_005**: Show cost component analysis
- **PC_UI_006**: Enable custom weight adjustment
- **PC_UI_007**: Support multiple comparison views
- **PC_UI_008**: Display alerts for significant variations
- **PC_UI_009**: Enable drill-down capabilities
- **PC_UI_010**: Support export to various formats

### 3.7 Analysis Rules (PC_ANL)
- **PC_ANL_001**: Generate cost-saving opportunities
- **PC_ANL_002**: Identify price anomalies
- **PC_ANL_003**: Calculate potential savings
- **PC_ANL_004**: Compare against budget targets
- **PC_ANL_005**: Analyze price seasonality
- **PC_ANL_006**: Generate market intelligence
- **PC_ANL_007**: Identify consolidation opportunities
- **PC_ANL_008**: Calculate cost avoidance
- **PC_ANL_009**: Generate spend analytics
- **PC_ANL_010**: Provide recommendation engine

## 4. Data Definitions

### 4.1 Price Comparison Header
\`\`\`typescript
interface PriceComparison {
  id: string
  productId: string
  productName: string
  baseUnitId: string
  baseCurrency: string
  comparisonDate: Date
  requestedQuantity: number
  deliveryLocation: string
  comparisonPeriod: DateRange
  status: ComparisonStatus
  createdBy: string
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
}

interface VendorComparison {
  id: string
  comparisonId: string
  vendorId: string
  vendorName: string
  basePrice: number
  currency: string
  normalizedPrice: number
  landedCost: number
  leadTime: number
  moq: number
  paymentTerms: string
  qualityScore: number
  deliveryScore: number
  totalScore: number
  rank: number
  priceHistory: PriceHistory[]
  quantityBreaks: QuantityBreak[]
}

interface PriceHistory {
  date: Date
  price: number
  currency: string
  normalizedPrice: number
  priceVariance: number
}

enum ComparisonStatus {
  Draft = "Draft",
  Active = "Active",
  Archived = "Archived"
}
\`\`\`

## 5. Logic Implementation

### 5.1 Comparison Process
1. Data Collection
   - Gather vendor prices
   - Collect performance metrics
   - Import historical data
   - Validate data completeness

2. Analysis Process
   - Normalize prices
   - Calculate total costs
   - Generate vendor scores
   - Rank vendors
   - Identify savings opportunities

### 5.2 Calculation Methods
1. Price Normalization
   - Currency conversion
   - Unit standardization
   - Cost component addition
   - Term impact calculation

2. Scoring System
   - Weight application
   - Score normalization
   - Rank calculation
   - Trend analysis

## 6. Validation and Testing

### 6.1 Test Scenarios
1. Price Comparison
   - Multiple vendor comparison
   - Currency conversion
   - Unit conversion
   - Cost calculation

2. Analysis Features
   - Trend analysis
   - Score calculation
   - Ranking system
   - Recommendation engine

### 6.2 Error Handling
- Data validation errors
- Calculation errors
- Currency mismatches
- Unit conversion errors
- Missing data handling

## 7. Maintenance and Governance

### 7.1 Module Ownership
- Primary Owner: Procurement Department
- Technical Owner: IT Department
- Process Owner: Finance Department

### 7.2 Review Process
- Daily comparison monitoring
- Weekly trend analysis
- Monthly performance review
- Quarterly strategy alignment

### 7.3 Change Management
- Weight adjustment process
- Scoring criteria updates
- Algorithm refinement
- Training requirements

## 8. Appendices

### 8.1 Glossary
- **Normalized Price**: Price adjusted for comparison
- **Landed Cost**: Total cost including all charges
- **TCO**: Total Cost of Ownership
- **MOQ**: Minimum Order Quantity

### 8.2 References
- Procurement Policy Manual
- Vendor Evaluation Guidelines
- Financial Processing Rules
- System Technical Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
| Category Manager | | | | 