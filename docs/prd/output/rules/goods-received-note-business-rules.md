# Goods Received Note Business Rules

**Document Type**: Business Rules Documentation  
**Module**: Goods Received Note (GRN) Management  
**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Active  

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document defines business rules for managing goods received notes within the Carmen ERP system, ensuring accurate receipt documentation, inventory updates, quality control, and financial integration for hospitality operations.

**Business Context**: Goods Received Notes are critical documents that confirm receipt of goods, trigger inventory updates, enable payment processing, and provide audit trails for procurement activities while ensuring quality standards are maintained.

## Core Business Rules

### Rule 1: GRN Creation Requirements

**Description**: Establishes mandatory requirements for creating valid goods received notes with proper documentation and verification.

**Trigger**: Goods receipt, delivery confirmation, or manual GRN creation

**Business Logic**: 
- GRNs must reference valid purchase orders or have emergency receipt authorization
- Physical receipt verification required before GRN creation
- Receiving staff identification mandatory for accountability
- Date and time stamps automated for audit trail accuracy

**Validation Rules**:
- Purchase order reference required for all non-emergency receipts
- Delivery date cannot be future-dated beyond current system date
- Receiving staff must have active user status and receiving authorization
- GRN numbers follow sequential numbering with no gaps allowed

**Exception Handling**: 
- Emergency receipts require manager approval within 4 hours
- Missing purchase order references trigger emergency receipt workflow
- System dating errors require supervisor override and manual correction

### Rule 2: Quantity Verification and Variance Management

**Description**: Manages quantity verification processes and handles variances between ordered and received quantities.

**Trigger**: Quantity entry, variance detection, or receipt completion

**Business Logic**: 
- Received quantities verified against purchase order specifications
- Quantity variances documented with reason codes and supporting evidence
- Over-receipts require authorization if exceeding order quantity by >5%
- Under-receipts automatically flag for follow-up and supplier communication

**Validation Rules**:
- Quantity variances >10% require supervisor approval
- Over-receipts cannot exceed 110% of ordered quantity without director approval
- Partial receipts must specify delivery completion status and expected balance
- Rejected quantities documented with quality inspection reports

**Exception Handling**: 
- Significant over-receipts may require return authorization or storage arrangements
- Partial deliveries trigger automatic follow-up scheduling
- Quality-based rejections initiate vendor quality notification processes

### Rule 3: Quality Inspection and Acceptance

**Description**: Ensures received goods meet quality specifications through systematic inspection and acceptance procedures.

**Trigger**: Goods receipt, quality inspection scheduling, or acceptance decision points

**Business Logic**: 
- Quality inspection required based on product risk classification and vendor history
- Inspection criteria based on product specifications and regulatory requirements
- Acceptance/rejection decisions documented with supporting evidence
- Failed inspections trigger supplier corrective action and potential credit claims

**Validation Rules**:
- High-risk products require 100% inspection before acceptance
- Medium-risk products require random sampling inspection (minimum 10%)
- Low-risk products require visual inspection for obvious damage or defects
- Inspection results documented within 4 hours of receipt

**Exception Handling**: 
- Quality failures require immediate segregation and vendor notification
- Inspection delays may require temporary acceptance with conditional approval
- Critical quality issues trigger immediate supplier escalation and stop-ship orders

## Inventory Integration Rules

### Rule 4: Automatic Inventory Updates

**Description**: Ensures accurate and timely inventory updates upon goods receipt confirmation with proper cost and location tracking.

**Trigger**: GRN approval, inventory posting, or system integration events

**Business Logic**: 
- Inventory quantities updated automatically upon GRN approval
- Cost information integrated from purchase orders and delivery receipts
- Location assignments based on product type and storage requirements
- Lot tracking information captured for traceability requirements

**Validation Rules**:
- Inventory updates completed within 15 minutes of GRN approval
- Cost variances from purchase order >5% require financial approval
- Location assignments verified against storage capacity and requirements
- Lot numbers captured for all products requiring traceability

**Exception Handling**: 
- Inventory update failures require immediate system verification and manual correction
- Cost variance disputes may require vendor invoice verification
- Storage capacity issues may require alternative location assignments

### Rule 5: Batch and Expiration Date Management

**Description**: Manages batch numbers, expiration dates, and shelf-life tracking for received goods.

**Trigger**: Batch information entry, expiration date recording, or shelf-life calculations

**Business Logic**: 
- Batch numbers recorded for all products requiring lot traceability
- Expiration dates captured and verified for perishable products
- First-in-first-out (FIFO) inventory rotation automatically implemented
- Shelf-life warnings generated for products approaching expiration

**Validation Rules**:
- Batch numbers required for all food products and regulated items
- Expiration dates must be future-dated and reasonable for product type
- Shelf-life calculations accurate based on receipt date and product specifications
- FIFO rotation maintained automatically in inventory management system

**Exception Handling**: 
- Missing batch information requires supplier communication and documentation
- Short-dated products may require immediate use prioritization or disposal
- Shelf-life calculation errors require product specification verification

## Financial Integration Rules

### Rule 6: Invoice Matching and Payment Authorization

**Description**: Facilitates three-way matching between purchase orders, goods received notes, and vendor invoices for payment authorization.

**Trigger**: Invoice receipt, matching process execution, or payment approval workflows

**Business Logic**: 
- Three-way matching required for all payments exceeding $100
- Quantity and price variances identified and resolved before payment authorization
- Partial receipts enable partial payment authorization
- Payment holds applied for unresolved discrepancies

**Validation Rules**:
- Matching tolerances: Quantity ±5%, Price ±2%, Total amount ±3%
- Invoice dates must be within 30 days of GRN date
- Payment authorization required within 5 business days of successful matching
- Discrepancy resolution documented with supporting evidence

**Exception Handling**: 
- Matching failures require investigation and resolution before payment
- Invoice discrepancies may require vendor communication and adjustment
- Payment delays beyond terms may incur vendor penalties or relationship issues

### Rule 7: Cost Allocation and Accounting

**Description**: Ensures proper cost allocation and accounting treatment for received goods across departments and projects.

**Trigger**: Cost allocation entry, accounting period processing, or financial reporting requirements

**Business Logic**: 
- Costs allocated based on predetermined department and project codes
- Freight and handling costs distributed proportionally across received items
- Currency conversions applied at receipt date exchange rates
- Tax treatments applied according to local regulations and product classifications

**Validation Rules**:
- Cost center codes validated against current organizational structure
- Freight allocation calculations accurate within 1% of total costs
- Currency conversion rates verified against authorized financial data sources
- Tax calculations comply with local tax regulations and exemption certificates

**Exception Handling**: 
- Invalid cost center codes require correction and re-allocation
- Currency volatility may require exchange rate verification and adjustment
- Tax calculation errors require immediate correction and regulatory compliance verification

## Compliance and Documentation

### Rule 8: Regulatory Compliance Documentation

**Description**: Ensures all required regulatory documentation is collected and maintained for compliance with food safety, customs, and industry regulations.

**Trigger**: Regulatory documentation requirements, compliance verification, or audit preparation

**Business Logic**: 
- Required certificates and documents collected based on product type and origin
- Food safety documentation verified and maintained for audit trails
- Import/export documentation complete for international shipments
- Compliance status tracked and reported for regulatory authorities

**Validation Rules**:
- Food safety certificates required for all food products within 30 days of issuance
- Import documentation complete within 48 hours of international receipts
- Regulatory compliance verified before goods released to inventory
- Documentation retention periods follow regulatory requirements (minimum 3 years)

**Exception Handling**: 
- Missing documentation may require goods quarantine until compliance resolved
- Expired certificates require supplier communication and replacement documentation
- Compliance failures may require regulatory notification and corrective actions

### Rule 9: Audit Trail and Record Keeping

**Description**: Maintains comprehensive audit trails and record keeping for all goods receipt activities.

**Trigger**: Record creation, audit requirements, or retention policy enforcement

**Business Logic**: 
- Complete audit trail maintained from receipt through payment and beyond
- User activity logged with timestamps and system identification
- Document imaging and electronic storage for space efficiency and accessibility
- Record retention follows legal and business requirements

**Validation Rules**:
- Audit trail completeness verified through regular internal audits
- User activity logging accurate and secure from unauthorized modification
- Document imaging quality suitable for legal and business purposes
- Retention periods enforced automatically with authorized disposal procedures

**Exception Handling**: 
- Audit trail gaps require investigation and documentation of corrective actions
- User activity discrepancies may indicate security issues requiring immediate attention
- Document quality issues may require re-imaging or original document retention

## Vendor Performance Management

### Rule 10: Delivery Performance Tracking

**Description**: Tracks and evaluates vendor delivery performance for continuous improvement and vendor management.

**Trigger**: Delivery completion, performance assessment periods, or vendor evaluation requirements

**Business Logic**: 
- Delivery performance metrics tracked automatically from GRN data
- Performance trends analyzed for vendor development opportunities
- Poor performance triggers vendor communication and improvement plans
- Exceptional performance recognized through vendor appreciation programs

**Validation Rules**:
- Performance metrics include on-time delivery, quantity accuracy, and quality compliance
- Performance data based on minimum 30 days of delivery history
- Vendor performance reviews conducted quarterly with documented outcomes
- Performance improvement plans include specific goals and measurement criteria

**Exception Handling**: 
- Performance data discrepancies require verification and correction
- Vendor disputes regarding performance resolved through documented evidence
- Critical performance failures may require immediate vendor status changes

### Rule 11: Quality Performance Assessment

**Description**: Assesses vendor quality performance based on inspection results and customer satisfaction metrics.

**Trigger**: Quality inspection completion, customer feedback, or quality assessment periods

**Business Logic**: 
- Quality performance metrics derived from inspection results and customer feedback
- Quality trends analyzed for supplier development and sourcing decisions
- Quality issues trigger corrective action requests and supplier improvement plans
- Quality excellence recognized through supplier awards and preferred status

**Validation Rules**:
- Quality metrics include defect rates, compliance scores, and customer satisfaction ratings
- Quality assessments based on statistically significant sample sizes
- Corrective action requests include specific requirements and timelines
- Quality improvements tracked and verified through follow-up assessments

**Exception Handling**: 
- Quality performance disputes resolved through independent verification
- Critical quality issues may require immediate supplier suspension
- Quality improvement failures may result in supplier termination

## Performance Monitoring

### Key Performance Indicators

1. **Receipt Accuracy**: GRN accuracy rate ≥98% for quantity and quality verification
2. **Processing Efficiency**: GRN processing completed within 4 hours of receipt ≥95% of time
3. **Inventory Integration**: Inventory updates completed within 15 minutes ≥99% of time
4. **Invoice Matching**: Three-way matching success rate ≥95% within standard tolerances
5. **Compliance Achievement**: Regulatory compliance documentation complete ≥100% of time
6. **Vendor Performance**: Average vendor delivery and quality performance ≥4.0/5.0

### Monitoring and Reporting

- **Real-time**: GRN processing status, inventory updates, quality inspections
- **Daily**: Receipt volumes, processing efficiency, compliance status
- **Weekly**: Vendor performance analysis, cost variance reports, quality trends
- **Monthly**: Comprehensive performance review, process optimization, vendor scorecards

### Corrective Action Requirements

- **Immediate (≤1 hour)**: Quality failures, compliance violations, inventory discrepancies
- **Short-term (≤4 hours)**: Processing delays, matching failures, documentation issues
- **Medium-term (≤24 hours)**: Vendor performance concerns, system integration problems
- **Long-term (≤1 week)**: Process improvements, policy updates, vendor relationship management

This goods received note business rules framework ensures accurate receipt documentation, proper inventory management, regulatory compliance, and effective vendor performance management while supporting financial controls and operational efficiency.