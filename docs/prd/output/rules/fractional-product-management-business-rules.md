# Fractional Product Management Business Rules

**Document Type**: Business Rules Documentation  
**Module**: Fractional Product Management (Pizza Slices, Cake Portions)  
**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Active  

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document defines business rules for managing fractional products in the Carmen ERP system, specifically focusing on pizza slices, cake portions, and other divisible food items. These rules ensure food safety compliance, quality standards, operational efficiency, and revenue optimization while supporting hospitality business objectives.

**Business Context**: Modern hospitality operations require flexible product offerings including individual portions of larger items. This capability enables businesses to serve customers with varying portion needs while maximizing revenue from prepared items and minimizing waste.

## Core Business Rules

### Rule 1: Product Fractional Capability Definition

**Description**: Determines which products can be sold in fractional portions and establishes the foundation for fractional inventory management.

**Trigger**: Product creation, product modification, or system configuration changes

**Business Logic**: 
- Only specific product categories support fractional sales (Pizza, Cake, Pie, Casserole, etc.)
- Products must have defined portion configurations before fractional sales can be activated
- Each fractional product must specify minimum and maximum portion sizes
- Products with fractional capability require additional tracking and quality controls

**Validation Rules**:
- Product category must be in approved fractional categories list
- Minimum portions per whole item: 2
- Maximum portions per whole item: 16
- Base unit of measure must be "Each" or "Whole"
- Shelf life must be defined for quality tracking

**Exception Handling**: 
- Products without proper categorization cannot enable fractional sales
- System blocks fractional activation if required fields are missing
- Manager override required for exceptions to standard portion limits

### Rule 2: Portion Size Standardization

**Description**: Establishes consistent portion sizes across the organization to ensure customer satisfaction and cost control.

**Trigger**: Product setup, portion configuration, or quality control reviews

**Business Logic**: 
- Standard portion sizes must be defined per product type
- Pizza slices: 8 slices per 14" pizza, 6 slices per 12" pizza, 4 slices per personal pizza
- Cake portions: Weight-based portioning with tolerance ranges (90-110g standard slice)
- Portion consistency must maintain 85-115% of standard size
- Visual presentation standards apply to all fractional portions

**Validation Rules**:
- Portion weight variance cannot exceed ±10g for cakes
- Pizza slice angle variance cannot exceed ±15 degrees
- All portions must meet minimum presentation score of 7/10
- Cutting tools must be appropriate for product type

**Exception Handling**: 
- Portions outside tolerance ranges require quality review
- Customer requests for non-standard portions require approval
- Presentation scores below threshold trigger automatic price adjustments

### Rule 3: Multi-Yield Recipe Integration

**Description**: Manages recipes that produce multiple fractional products simultaneously to optimize production efficiency.

**Trigger**: Recipe execution, production planning, or ingredient allocation

**Business Logic**: 
- Multi-yield recipes automatically calculate portion distributions
- Ingredient costs are allocated proportionally across all output portions
- Production timing must account for cutting and portioning time
- Quality standards apply to each individual portion produced

**Validation Rules**:
- Total portion count must equal expected yield
- Individual portion costs must equal allocated recipe costs
- Production time includes cutting/portioning in scheduling
- All output portions tracked in inventory immediately upon completion

**Exception Handling**: 
- Yield variations beyond 5% trigger production review
- Equipment failures during portioning require waste documentation
- Quality failures in portions affect entire batch evaluation

## Quality Control Rules

### Rule 4: Fractional Item Quality Standards

**Description**: Maintains consistent quality standards for all fractional products to ensure customer satisfaction and brand reputation.

**Trigger**: Product cutting, quality inspection, or customer feedback

**Business Logic**: 
- Visual quality assessment required for all fractional items
- Temperature requirements maintained throughout fractional item lifecycle
- Freshness tracking from original item preparation through final sale
- Quality degradation monitoring with automated price adjustments

**Validation Rules**:
- Pizza slices must maintain 140°F minimum serving temperature
- Refrigerated cake portions must stay at 35-41°F storage temperature
- Visual quality scores must achieve minimum 7/10 rating
- Freshness indicators monitored continuously with defined thresholds

**Exception Handling**: 
- Items below quality thresholds receive automatic markdowns
- Temperature violations trigger immediate corrective actions
- Customer complaints initiate quality investigation protocols

### Rule 5: Shelf Life and Expiration Management

**Description**: Manages time-based quality degradation for fractional items to ensure food safety and optimize inventory turnover.

**Trigger**: Item preparation completion, cutting operations, or time-based system checks

**Business Logic**: 
- Fractional items inherit base item shelf life with cutting adjustments
- Hot-held pizza slices: Maximum 4 hours display time
- Refrigerated cake slices: Maximum 72 hours from cutting
- Quality degradation curves applied for pricing optimization

**Validation Rules**:
- No fractional sales beyond defined shelf life limits
- Display time tracking accurate to 15-minute intervals
- Automatic removal from sale when expiration approached
- Waste documentation required for expired items

**Exception Handling**: 
- Emergency extensions require food safety manager approval
- Equipment failures affecting monitoring trigger manual tracking
- Quality degradation faster than expected requires investigation

## Food Safety and Compliance Rules

### Rule 6: HACCP Critical Control Points

**Description**: Ensures all fractional food operations comply with Hazard Analysis Critical Control Points (HACCP) requirements.

**Trigger**: Temperature monitoring, time tracking, or sanitation protocol execution

**Business Logic**: 
- Critical control points monitored continuously for fractional items
- Temperature logs maintained for hot and cold held items
- Cross-contamination prevention protocols enforced
- Staff certification requirements for fractional item handling

**Validation Rules**:
- Hot foods maintained at 140°F or above
- Cold foods maintained at 41°F or below
- Cutting tools sanitized between different allergen categories
- Staff certifications current and verified

**Exception Handling**: 
- Critical limit violations trigger immediate corrective actions
- Monitoring equipment failures activate backup protocols
- Non-compliance incidents require documented investigation

### Rule 7: Allergen Management for Fractional Items

**Description**: Manages allergen information and cross-contamination prevention in fractional food operations.

**Trigger**: Product cutting, tool usage, or allergen detection

**Business Logic**: 
- Allergen information transfers from whole items to fractional portions
- Cutting tools and surfaces managed by allergen categories
- Cross-contamination risks assessed before fractional operations
- Allergen labeling required on all fractional item displays

**Validation Rules**:
- Tool sanitization verified between allergen categories
- Allergen information accurately displayed
- Cross-contamination risks documented and controlled
- Staff training on allergen protocols current

**Exception Handling**: 
- Potential cross-contamination blocks fractional operations
- Allergen incidents trigger immediate response protocols
- Missing allergen information prevents product sales

## Inventory Management Rules

### Rule 8: Fractional Stock Tracking

**Description**: Maintains accurate inventory records for both whole items and fractional portions throughout the supply chain.

**Trigger**: Stock receipt, conversion operations, sales transactions, or periodic reconciliation

**Business Logic**: 
- Real-time tracking of whole items and available fractional portions
- Conversion operations automatically update inventory levels
- Reserved portions tracked separately from available inventory
- Waste tracking integrated with inventory adjustments

**Validation Rules**:
- Total fractional portions cannot exceed whole item capacity
- Conversion efficiency tracked and monitored
- Physical counts reconciled with system records
- Waste percentages monitored against established thresholds

**Exception Handling**: 
- Inventory discrepancies trigger investigation protocols
- System calculation errors require manual verification
- Unusual waste patterns prompt operational review

### Rule 9: Automated Conversion Recommendations

**Description**: Provides intelligent recommendations for converting whole items to fractional portions based on demand patterns and inventory levels.

**Trigger**: Inventory level monitoring, demand forecasting, or time-based analysis

**Business Logic**: 
- Historical demand patterns analyze optimal conversion timing
- Current inventory levels compared against reorder points
- Peak period demands factored into conversion decisions
- Waste minimization balanced against availability requirements

**Validation Rules**:
- Conversion recommendations based on minimum 30-day demand history
- Current inventory must exceed safety stock before conversion
- Conversion capacity available before recommendations generated
- Expected waste factored into conversion calculations

**Exception Handling**: 
- Insufficient demand history requires manual override
- Capacity constraints prevent automated conversions
- Unusual demand patterns trigger manual review

## Pricing and Revenue Rules

### Rule 10: Dynamic Pricing for Fractional Items

**Description**: Implements intelligent pricing strategies for fractional items to optimize revenue while maintaining competitive positioning.

**Trigger**: Demand analysis, time-based pricing reviews, or market condition changes

**Business Logic**: 
- Fractional item pricing reflects proportional value of whole items
- Time-based adjustments applied during slow periods
- Quality-based discounts applied automatically
- Premium pricing during peak demand periods

**Validation Rules**:
- Fractional prices maintain minimum margin requirements
- Pricing adjustments cannot exceed 30% of base price without approval
- Discount applications tracked and monitored
- Premium pricing requires market analysis justification

**Exception Handling**: 
- Below-cost pricing requires management approval
- System pricing errors trigger immediate correction
- Customer complaints about pricing prompt review

### Rule 11: Revenue Optimization

**Description**: Balances revenue maximization with waste minimization through intelligent pricing and promotion strategies.

**Trigger**: Sales analysis, inventory levels, or promotional campaign activation

**Business Logic**: 
- Revenue per unit tracked for whole vs fractional sales analysis
- Promotion timing optimized based on inventory levels and expiration dates
- Bundle pricing encourages fractional item combinations
- Loyalty program integration rewards frequent fractional item purchases

**Validation Rules**:
- Revenue tracking accurate and timely
- Promotional pricing maintains positive contribution margins
- Bundle configurations provide customer value and business benefit
- Loyalty program rules consistently applied

**Exception Handling**: 
- Revenue decline patterns trigger strategy review
- Promotional losses beyond budget require approval
- System errors in pricing calculations corrected immediately

## Operational Workflow Rules

### Rule 12: Production Planning Integration

**Description**: Integrates fractional item demand into overall production planning to ensure optimal resource utilization.

**Trigger**: Production scheduling, demand forecasting, or capacity planning

**Business Logic**: 
- Fractional item demand incorporated into production schedules
- Cutting and portioning time included in production planning
- Staff scheduling accounts for fractional item preparation requirements
- Equipment capacity allocated for fractional operations

**Validation Rules**:
- Production schedules account for all fractional item requirements
- Staff assignments include fractional operation skills
- Equipment availability confirmed before production scheduling
- Quality control time included in production estimates

**Exception Handling**: 
- Capacity shortfalls require production priority adjustments
- Equipment failures impact fractional operation scheduling
- Staff unavailability affects fractional item production

### Rule 13: Quality Control Integration

**Description**: Embeds quality control processes throughout fractional item operations to maintain consistent standards.

**Trigger**: Quality assessment scheduling, defect detection, or customer feedback

**Business Logic**: 
- Quality checkpoints integrated into fractional item workflows
- Continuous monitoring systems provide real-time quality data
- Quality metrics tracked and analyzed for improvement opportunities
- Staff performance monitoring includes quality achievement

**Validation Rules**:
- Quality checkpoints completed as scheduled
- Quality metrics meet established standards
- Quality improvement initiatives implemented systematically
- Staff quality training current and effective

**Exception Handling**: 
- Quality standard failures trigger immediate investigation
- Repeated quality issues prompt process improvements
- Customer quality complaints receive priority attention

## Performance Monitoring

### Key Performance Indicators

1. **Product Quality Score**: Average quality rating across all fractional items ≥8.0/10
2. **Waste Percentage**: Food waste from fractional operations ≤12% of total production
3. **Conversion Efficiency**: Actual portions vs expected portions ≥95%
4. **Food Safety Compliance**: Zero critical control point violations
5. **Customer Satisfaction**: Fractional item satisfaction score ≥4.2/5.0
6. **Revenue per Unit**: Fractional sales revenue optimization vs whole item sales

### Monitoring and Reporting

- **Daily**: Quality scores, waste tracking, food safety compliance
- **Weekly**: Conversion efficiency, customer feedback analysis
- **Monthly**: Revenue analysis, trend identification, process improvement planning
- **Quarterly**: Comprehensive performance review, system optimization

### Corrective Action Requirements

- **Immediate (≤30 minutes)**: Critical food safety violations, customer safety issues
- **Short-term (≤2 hours)**: Quality standard failures, significant waste events
- **Medium-term (≤24 hours)**: Process inefficiencies, staff training needs
- **Long-term (≤1 week)**: System improvements, policy updates

This business rules framework ensures that fractional product management operates safely, efficiently, and profitably while maintaining the highest standards of food quality and customer satisfaction.