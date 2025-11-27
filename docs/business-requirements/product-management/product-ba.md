# Product Management Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Product Management module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand product management processes, workflows, and business rules.

### Scope
The documentation covers the entire Product Management module, including:
- Product Master Data Management
- Category Management
- Unit Management
- Product Pricing
- Environmental Impact Tracking
- Product Variants Management

### Audience
- Product Managers
- Category Managers
- Finance Department
- Procurement Team
- System Administrators
- Auditors

### Version History
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2024-01-19 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Maintain comprehensive product master data
- Manage product categorization and hierarchies
- Control product pricing and costs
- Track environmental impact metrics
- Support multi-unit conversions
- Enable efficient product search and filtering
- Integrate with inventory and procurement systems

### Module Overview
The Product Management module consists of several key components:
1. Product Master Management
2. Category Hierarchy Management
3. Unit Conversion System
4. Pricing Management
5. Environmental Impact Tracking
6. Product Variants Management
7. Integration Management

### Key Stakeholders
- Product Managers
- Category Managers
- Finance Team
- Procurement Team
- Warehouse Managers
- Environmental Officers
- System Administrators

## 3. Business Rules

### Product Master (PRD_MST)
- **PRD_MST_001**: All products must have a unique product code
- **PRD_MST_002**: Products must be assigned to valid categories
- **PRD_MST_003**: Primary inventory unit is mandatory
- **PRD_MST_004**: Product status must be tracked (active/inactive)
- **PRD_MST_005**: Price/quantity deviation limits
- **PRD_MST_006**: Environmental impact data must be maintained
- **PRD_MST_007**: Support Attribute 


### Category Management (PRD_CAT)
- **PRD_CAT_001**: Three-level category hierarchy (Main/Sub/Group)
- **PRD_CAT_002**: Categories must have unique codes
- **PRD_CAT_004**: Price/quantity deviation limits by Category/Sub/Item Group 
- **PRD_CAT_005**: Category status tracking required

### Unit Management (PRD_UNT)
- **PRD_UNT_001**: Support multiple unit types (Inventory/Order/Recipe)
- **PRD_UNT_002**: Unit conversion factors must be defined
- **PRD_UNT_003**: Default units must be specified
- **PRD_UNT_004**: Unit validation for transactions

### Product Pricing (PRD_PRC)
- **PRD_PRC_001**: Base price in specified currency
- **PRD_PRC_002**: Support for multiple price levels
- **PRD_PRC_003**: Price deviation limits enforcement
- **PRD_PRC_004**: Cost tracking and history
- **PRD_PRC_005**: Margin calculations and controls

### 3.5 UI Rules
- **PRD_021**: Product list must display key information (code, name, category, unit, status)
- **PRD_022**: Item grid must support inline editing for base prices and conversion rates
- **PRD_023**: Cost and price information must update in real-time as values are modified
- **PRD_024**: Status changes must be reflected immediately in the UI
- **PRD_025**: Validation errors must be displayed clearly next to relevant fields
- **PRD_026**: Required fields must be visually marked with asterisk (*)
- **PRD_027**: Currency fields must display appropriate currency symbols
- **PRD_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **PRD_029**: Action buttons must be disabled based on user permissions
- **PRD_030**: Print preview must match final product document format
- **PRD_031**: All monetary amounts must be displayed with 2 decimal places
- **PRD_032**: All quantities must be displayed with 3 decimal places
- **PRD_033**: Conversion rates must be displayed with 5 decimal places
- **PRD_034**: All numeric values must be right-aligned
- **PRD_035**: All numeric values must use system's regional numeric format
- **PRD_036**: Date inputs must enforce regional format validation
- **PRD_037**: Date/time values must be stored as timestamptz in UTC
- **PRD_038**: Time zone conversions must respect daylight saving rules
- **PRD_039**: Calendar controls must indicate working days and holidays
- **PRD_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **PRD_041**: Base unit conversion = Round(Quantity × Conversion Rate, 3)
- **PRD_042**: Alternate unit conversion = Round(Base Quantity / Conversion Rate, 3)
- **PRD_043**: Standard cost calculation = Round(Average of last N purchases, 5)
- **PRD_044**: Moving average cost = Round((Previous Stock × Previous Cost + New Stock × New Cost) / Total Stock, 5)
- **PRD_045**: FIFO cost tracking must maintain individual lot costs to 5 decimals
- **PRD_046**: Base price calculation = Round(Cost × (1 + Markup Rate), 2)
- **PRD_047**: Price list calculations = Round(Base Price × Price List Factor, 2)
- **PRD_048**: Discount calculation = Round(Price × Discount Rate, 2)
- **PRD_049**: Net price calculation = Round(Price - Round(Discount, 2), 2)
- **PRD_050**: Tax calculation = Round(Net Price × Tax Rate, 2)
- **PRD_051**: All intermediate calculations must be rounded before use in subsequent calculations
- **PRD_052**: Final rounding must use half-up (banker's) rounding method
- **PRD_053**: Unit conversions must be rounded to 3 decimals before use
- **PRD_054**: Cost calculations must maintain 5 decimal precision before final rounding
- **PRD_055**: Price calculations must be rounded to 2 decimals
- **PRD_056**: Each step in multi-step calculations must round intermediate results
- **PRD_057**: Running totals must be rounded before adding each new value
- **PRD_058**: Percentage calculations must round result before applying to base amount
- **PRD_059**: Cross-currency calculations must round after each currency conversion
- **PRD_060**: Tax-inclusive price breakdowns must round each component

### 3.7 Unit Conversion Rules
- **PRD_061**: Base unit conversion rules:
  - **PRD_061.1**: All conversions must be relative to the base unit
  - **PRD_061.2**: Base unit conversion rate must always be 1.00000
  - **PRD_061.3**: Conversion rates must be positive non-zero values
  - **PRD_061.4**: Conversion rates must be stored with 5 decimal precision
  - **PRD_061.5**: Bi-directional conversions must be reciprocal values

- **PRD_062**: Conversion calculations:
  - **PRD_062.1**: To base unit = Round(Quantity × Conversion Rate, 3)
  - **PRD_062.2**: From base unit = Round(Base Quantity / Conversion Rate, 3)
  - **PRD_062.3**: Between alternate units = Round(Round(Qty × From Rate, 3) / To Rate, 3)
  - **PRD_062.4**: Cost conversions must use base unit quantities
  - **PRD_062.5**: Price conversions must use selling unit quantities

- **PRD_063**: Validation rules:
  - **PRD_063.1**: Conversion rates must be validated for circular references
  - **PRD_063.3**: Historical transactions must maintain original conversion rates
  - **PRD_063.4**: Future dated conversion rate changes must be supported
  - **PRD_063.5**: Conversion rate changes must be logged

- **PRD_064**: Cost implications:
  - **PRD_064.1**: Unit cost must be stored in base unit
  - **PRD_064.2**: Converted unit costs must be rounded to 5 decimals
  - **PRD_064.3**: Cost variances due to rounding must be tracked
  - **PRD_064.4**: Standard costs must be in base unit
  - **PRD_064.5**: Average costs must be calculated in base unit

- **PRD_065**: Price implications:
  - **PRD_065.1**: Selling prices can be defined per unit
  - **PRD_065.2**: Price conversions must be rounded to 2 decimals
  - **PRD_065.3**: Price lists must specify applicable unit
  - **PRD_065.4**: Discounts must be applied after unit conversion
  - **PRD_065.5**: Tax calculations must use converted prices

### 3.8 Price List Rules
- **PRD_066**: Price List Structure:
  - **PRD_066.1**: Each price list must have a unique identifier and currency
  - **PRD_066.2**: Price lists can be date-effective with start and end dates
  - **PRD_066.3**: Multiple active price lists per product must be supported
  - **PRD_066.4**: Price lists can be customer/customer group specific
  - **PRD_066.5**: Default price list must be designated per currency

- **PRD_067**: Price Calculation Methods:
  - **PRD_067.1**: Factor based: Round(Base Price × Price List Factor, 2)
  - **PRD_067.2**: Fixed amount: Direct price entry rounded to 2 decimals
  - **PRD_067.3**: Markup based: Round(Cost × (1 + Markup Rate), 2)
  - **PRD_067.4**: Margin based: Round(Cost / (1 - Margin Rate), 2)
  - **PRD_067.5**: Competition based: Manual price entry with reference

- **PRD_068**: Price List Hierarchy:
  - **PRD_068.1**: Customer-specific prices override group prices
  - **PRD_068.2**: Group prices override default price list
  - **PRD_068.3**: Date-effective prices override standard prices
  - **PRD_068.4**: Special promotion prices override regular prices
  - **PRD_068.5**: Manual override prices must be logged

- **PRD_069**: Multi-Currency Rules:
  - **PRD_069.1**: Each price list must have a base currency
  - **PRD_069.2**: Exchange rates must be date-effective
  - **PRD_069.3**: Cross-currency calculations must be rounded to 2 decimals
  - **PRD_069.4**: Exchange rate changes must trigger price recalculation
  - **PRD_069.5**: Historical prices must maintain original exchange rates

- **PRD_070**: Validation Rules:
  - **PRD_070.1**: Minimum price must not be below cost
  - **PRD_070.2**: Maximum price deviation limits must be enforced
  - **PRD_070.3**: Price changes must be within allowed percentage
  - **PRD_070.4**: Effective dates must not overlap for same price list
  - **PRD_070.5**: Price list currency must match customer currency

- **PRD_071**: Price List Updates:
  - **PRD_071.1**: Mass updates must be supported with preview
  - **PRD_071.2**: Updates can be scheduled for future dates
  - **PRD_071.3**: Price change history must be maintained
  - **PRD_071.4**: Approval required for changes above threshold
  - **PRD_071.5**: Notifications must be sent for price changes

- **PRD_072**: Special Pricing Rules:
  - **PRD_072.1**: Quantity break pricing must be supported
  - **PRD_072.2**: Promotional pricing must have date range
  - **PRD_072.3**: Bundle pricing must be calculated from components
  - **PRD_072.4**: Contract pricing must override standard price lists
  - **PRD_072.5**: Special order pricing must be flagged

- **PRD_073**: Rounding Rules:
  - **PRD_073.1**: All calculated prices must be rounded to 2 decimals
  - **PRD_073.2**: Intermediate calculations must be rounded before use
  - **PRD_073.3**: Factor calculations must use 4 decimal precision
  - **PRD_073.4**: Markup/margin calculations must use 4 decimal precision
  - **PRD_073.5**: Final prices must use half-up rounding method

## 4. Data Definitions

### Product Entity