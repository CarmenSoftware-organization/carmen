# Purchase Order Business Rules

**Document Type**: Business Rules Documentation  
**Module**: Purchase Order Management  
**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Active  

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document defines business rules for managing purchase orders within the Carmen ERP system, ensuring proper procurement processes, budget compliance, approval workflows, and supplier management for hospitality operations.

**Business Context**: Purchase orders are critical procurement documents that formalize purchasing commitments, control spending, maintain supplier relationships, and ensure proper financial controls throughout the organization.

## Core Business Rules

### Rule 1: Purchase Order Creation Requirements

**Description**: Establishes mandatory requirements for creating valid purchase orders with proper authorization and documentation.

**Trigger**: Purchase order initiation, purchase request conversion, or direct order creation

**Business Logic**: 
- Purchase orders must originate from approved purchase requests or emergency procurement
- All line items require valid product codes and vendor catalog references
- Delivery locations must be active and approved for receiving
- Budget availability verified before order confirmation

**Validation Rules**:
- Minimum order value: $25 (below threshold requires manager approval)
- Maximum single line item quantity: 9,999 units
- Vendor must have active status and approved credit terms
- Delivery date must be at least 2 business days from order date (except rush orders)

**Exception Handling**: 
- Emergency orders bypass normal approval workflow but require post-approval within 24 hours
- Invalid product codes trigger automatic product catalog lookup and suggestion
- Budget overrides require finance manager approval with justification

### Rule 2: Vendor Selection and Validation

**Description**: Ensures purchase orders are placed with approved vendors meeting quality, financial, and compliance standards.

**Trigger**: Vendor selection, vendor status changes, or compliance assessment updates

**Business Logic**: 
- Only approved vendors eligible for purchase order placement
- Vendor performance ratings influence order placement recommendations
- Payment terms automatically applied based on vendor agreements
- Special handling requirements documented for specific vendors

**Validation Rules**:
- Vendor approval status verified within 24 hours of last update
- Performance rating minimum threshold: 3.0/5.0 for standard orders
- Payment terms must match vendor agreement (NET 30, 2/10 NET 30, etc.)
- Insurance and licensing requirements current for regulated products

**Exception Handling**: 
- Vendor approval expiration triggers immediate review and renewal process
- Low performance ratings require manager approval for order placement
- Payment term mismatches require vendor agreement verification

### Rule 3: Budget Control and Spend Authorization

**Description**: Enforces budget controls and spending authorization limits across all purchase orders to maintain financial discipline.

**Trigger**: Order value calculation, budget period changes, or authorization level updates

**Business Logic**: 
- Purchase order values counted against department and project budgets
- Authorization levels determine approval requirements based on order value
- Budget overruns require documented justification and higher-level approval
- Year-end budget management includes accelerated or deferred spending controls

**Validation Rules**:
- Department budget variance cannot exceed +10% without CEO approval
- Individual order authority: Staff ($500), Supervisor ($2,000), Manager ($10,000), Director ($50,000)
- Capital expenditure orders require separate approval workflow regardless of value
- Emergency orders limited to $1,000 per incident without pre-approval

**Exception Handling**: 
- Budget unavailability blocks order creation until budget adjustment or reallocation
- Authority limit exceedance triggers automatic escalation to next approval level
- Emergency spending requires documented emergency justification

## Approval Workflows

### Rule 4: Multi-Level Approval Process

**Description**: Implements structured approval workflows based on order value, product category, and risk factors.

**Trigger**: Order submission, approval status changes, or workflow escalation events

**Business Logic**: 
- Approval levels determined by order total value and product risk classification
- Sequential approval required for orders exceeding individual authority limits
- Time limits on approval responses prevent workflow stagnation
- Automatic escalation when approval timelines exceeded

**Validation Rules**:
- Standard orders: 48-hour approval timeline for each level
- Rush orders: 4-hour approval timeline with premium justification
- Capital expenditures: 72-hour approval timeline with business case
- High-risk products: Additional compliance approval required

**Exception Handling**: 
- Approval timeline expiration triggers automatic escalation to next level
- Approver unavailability transfers approval authority to designated alternate
- Rejection requires documented reason and suggested alternatives

### Rule 5: Amendment and Change Control

**Description**: Manages changes to approved purchase orders with appropriate re-approval requirements and audit trails.

**Trigger**: Order modification requests, vendor-initiated changes, or delivery adjustments

**Business Logic**: 
- Order amendments require re-approval if value increases exceed 10% or $500
- Delivery date changes beyond agreed terms require vendor confirmation
- Product substitutions require quality and pricing verification
- All changes documented with timestamp and user identification

**Validation Rules**:
- Amendment approval required for quantity increases >15% or amount increases >$500
- Delivery date extensions cannot exceed 30 days without special approval
- Product substitutions must maintain equivalent specifications and functionality
- Change documentation completed within 2 hours of approval

**Exception Handling**: 
- Vendor-initiated changes require customer acceptance within 24 hours
- Quality specification changes trigger automatic quality assurance review
- Price increases above 5% require re-negotiation or order cancellation

## Financial Controls

### Rule 6: Pricing and Cost Management

**Description**: Ensures competitive pricing, cost control, and proper financial treatment of purchase orders.

**Trigger**: Price validation, cost analysis, or financial reporting requirements

**Business Logic**: 
- Competitive pricing verified through vendor comparison or market analysis
- Cost center allocation accurate and complete for all line items
- Currency conversions applied at current exchange rates for international orders
- Total cost includes shipping, handling, taxes, and fees for budget impact

**Validation Rules**:
- Price variance from last purchase >±20% triggers investigation
- Cost center assignments verified against organizational chart
- Exchange rate fluctuations >5% require pricing reconfirmation
- Total delivered cost calculated within 1% accuracy

**Exception Handling**: 
- Significant price increases require vendor justification or alternative sourcing
- Cost center assignment errors require correction before order finalization
- Exchange rate volatility may require price protection or hedging

### Rule 7: Tax and Compliance Management

**Description**: Manages tax obligations, regulatory compliance, and legal requirements for all purchase orders.

**Trigger**: Tax calculation, compliance verification, or regulatory reporting requirements

**Business Logic**: 
- Sales tax calculated based on delivery location and product taxability
- Regulatory compliance verified for controlled or regulated products
- Documentation requirements met for audit and regulatory purposes
- International orders include customs and duty considerations

**Validation Rules**:
- Tax calculations accurate within local jurisdiction requirements
- Compliance documentation complete before order placement
- Regulated product orders include required permits and certifications
- International orders include proper customs classification codes

**Exception Handling**: 
- Tax calculation errors require immediate correction and vendor notification
- Compliance documentation deficiencies block order placement until resolved
- Regulatory changes may require order modification or cancellation

## Quality and Receiving Controls

### Rule 8: Quality Specifications and Standards

**Description**: Ensures all purchased items meet quality specifications and operational requirements.

**Trigger**: Product specification validation, quality requirement updates, or vendor quality assessments

**Business Logic**: 
- Quality specifications documented and communicated to vendors
- Inspection requirements defined based on product risk and criticality
- Vendor quality certifications verified and current
- Quality non-conformance procedures established and followed

**Validation Rules**:
- Quality specifications complete and measurable for all products
- Inspection procedures appropriate for product type and risk level
- Vendor certifications current and verified within 90 days
- Quality standards aligned with operational requirements and customer expectations

**Exception Handling**: 
- Missing quality specifications require product specification development
- Vendor quality issues trigger supplier corrective action requests
- Quality non-conformance may require product rejection or vendor penalties

### Rule 9: Delivery and Receiving Requirements

**Description**: Manages delivery scheduling, receiving procedures, and inventory integration for purchase orders.

**Trigger**: Delivery scheduling, goods receipt, or inventory updates

**Business Logic**: 
- Delivery dates coordinated with receiving capacity and operational needs
- Receiving procedures appropriate for product type and handling requirements
- Inventory updates automatic upon goods receipt confirmation
- Delivery performance tracked for vendor evaluation

**Validation Rules**:
- Delivery windows accommodate receiving department capacity
- Receiving procedures documented and staff trained
- Inventory integration completed within 4 hours of receipt
- Delivery performance metrics maintained for vendor assessment

**Exception Handling**: 
- Delivery delays require immediate notification and rescheduling
- Receiving capacity constraints may require delivery deferrals
- Inventory integration failures trigger manual reconciliation procedures

## Vendor Relationship Management

### Rule 10: Vendor Performance Monitoring

**Description**: Tracks and evaluates vendor performance across quality, delivery, service, and cost metrics.

**Trigger**: Performance assessment periods, delivery completions, or quality evaluations

**Business Logic**: 
- Performance metrics collected automatically and through manual assessments
- Vendor scorecards updated monthly with comprehensive performance data
- Performance trends analyzed for vendor development and sourcing decisions
- Poor performance triggers vendor improvement plans or sourcing alternatives

**Validation Rules**:
- Performance data collection complete and accurate within 48 hours of events
- Vendor scorecards include quality, delivery, service, and cost metrics
- Performance trends based on minimum 90 days of historical data
- Vendor improvement plans include specific goals and timelines

**Exception Handling**: 
- Performance data discrepancies require investigation and correction
- Vendor performance disputes resolved through documented evidence review
- Critical performance failures may require immediate vendor status changes

### Rule 11: Payment Terms and Processing

**Description**: Manages payment terms, discount opportunities, and accounts payable integration for purchase orders.

**Trigger**: Invoice receipt, payment processing, or discount deadline approaches

**Business Logic**: 
- Payment terms enforced according to vendor agreements and company policy
- Early payment discounts captured when financially advantageous
- Payment approvals required for amounts exceeding authorization limits
- Accounts payable integration ensures accurate and timely payments

**Validation Rules**:
- Payment terms match purchase order and vendor agreement
- Early payment discount calculations accurate and verified
- Payment approvals obtained within required timeframes
- Accounts payable integration complete within 24 hours of invoice approval

**Exception Handling**: 
- Payment term disputes require vendor agreement verification and resolution
- Missed discount deadlines analyzed for process improvements
- Payment approval delays may affect vendor relationships and discount opportunities

## Performance Monitoring

### Key Performance Indicators

1. **Order Accuracy**: Purchase orders accurate and complete ≥98% of time
2. **Approval Efficiency**: Approval process completed within standard timelines ≥95% of time  
3. **Budget Compliance**: Purchase orders within approved budgets ≥99% of time
4. **Vendor Performance**: Average vendor performance score ≥4.0/5.0
5. **Cost Effectiveness**: Competitive pricing achieved on ≥90% of orders
6. **Process Efficiency**: Order-to-delivery cycle time optimization

### Monitoring and Reporting

- **Daily**: Order creation, approval status, delivery performance
- **Weekly**: Budget utilization, vendor performance, cost analysis
- **Monthly**: Comprehensive performance review, vendor scorecards, process optimization
- **Quarterly**: Strategic sourcing review, vendor relationship assessment, policy updates

### Corrective Action Requirements

- **Immediate (≤4 hours)**: Budget overruns, compliance violations, critical vendor issues
- **Short-term (≤24 hours)**: Approval delays, quality issues, delivery problems  
- **Medium-term (≤1 week)**: Vendor performance concerns, process improvements
- **Long-term (≤1 month)**: Strategic sourcing changes, policy updates, system enhancements

This purchase order business rules framework ensures disciplined procurement processes, effective vendor management, and optimal value delivery while maintaining financial controls and operational efficiency.