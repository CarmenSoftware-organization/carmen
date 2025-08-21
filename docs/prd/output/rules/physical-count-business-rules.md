# Physical Count Business Rules

**Document Type**: Business Rules Documentation  
**Module**: Physical Count and Cycle Count Management  
**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Active  

## Overview

This document defines business rules for managing physical inventory counts within the Carmen ERP system, including cycle counting, annual counts, count accuracy requirements, and variance management for hospitality operations.

## Core Business Rules

### Rule 1: Count Scheduling and Planning

**Description**: Establishes systematic scheduling for physical counts based on inventory value, movement velocity, and regulatory requirements.

**Trigger**: Count scheduling cycles, inventory risk assessment, or regulatory compliance requirements

**Business Logic**: 
- High-value items (>$1,000) counted monthly through cycle count program
- Fast-moving items counted quarterly to maintain accuracy
- Slow-moving items counted semi-annually with special attention to obsolescence
- Annual wall-to-wall count conducted during low-activity periods

**Validation Rules**:
- ABC analysis determines count frequency: A-items monthly, B-items quarterly, C-items semi-annually
- Count scheduling avoids peak operational periods and delivery dates
- Minimum 48-hour notice required for scheduled counts
- Count team assignments based on experience and product knowledge

**Exception Handling**: 
- Operational conflicts may require count rescheduling with management approval
- Urgent count needs override standard scheduling with proper justification
- Staff unavailability requires alternative counter assignment

### Rule 2: Count Execution Standards

**Description**: Establishes procedures and standards for accurate and efficient physical count execution.

**Trigger**: Count initiation, count execution, or quality verification requirements

**Business Logic**: 
- Two-person counting teams for high-value items and accuracy verification
- Count sheets include item descriptions, units of measure, and location details
- Blind count method used to prevent bias from system quantities
- Count timing coordinated to minimize operational disruption

**Validation Rules**:
- Counter identification recorded for accountability and quality tracking
- Count documentation complete with date, time, and signature
- Recount required when initial counts differ by >5% or >$50
- Count cutoff procedures ensure inventory movement control during counting

**Exception Handling**: 
- Counter disagreements resolved through third-party recount
- Missing items investigated immediately during count process
- Count interruptions require restart with fresh count sheets

### Rule 3: Count Accuracy and Verification

**Description**: Ensures count accuracy through verification procedures and statistical validation methods.

**Trigger**: Count completion, accuracy verification, or variance analysis

**Business Logic**: 
- Statistical sampling used to verify count accuracy for large inventories
- High-value items receive 100% verification through supervisor recount
- Count accuracy targets: ±2% for quantities, ±1% for values
- Accuracy performance tracked by counter for training and development

**Validation Rules**:
- Verification sample size minimum 10% of total items or statistical significance
- Supervisor verification required for items >$500 value
- Accuracy measurements exclude items with known issues or special circumstances
- Counter performance ratings based on rolling 90-day accuracy history

**Exception Handling**: 
- Accuracy failures require immediate recount and investigation
- Repeated accuracy issues trigger additional training requirements
- System accuracy problems may require process review and improvement

## Variance Management

### Rule 4: Variance Investigation Requirements

**Description**: Establishes systematic investigation procedures for inventory count variances to identify root causes and prevent recurrence.

**Trigger**: Variance identification, investigation initiation, or resolution requirements

**Business Logic**: 
- Variances >$100 or >5% require formal investigation with documented findings
- Investigation includes review of recent transactions, movements, and system data
- Root cause analysis identifies system, process, or human factors
- Corrective action plans developed and implemented based on findings

**Validation Rules**:
- Investigation initiated within 24 hours of variance identification
- Investigation documentation includes evidence review and conclusion
- Root cause categories tracked for pattern identification
- Corrective actions implemented within 30 days with effectiveness verification

**Exception Handling**: 
- Complex investigations may require extended timeframes with management approval
- Inconclusive investigations documented with additional monitoring requirements
- System-related variances may require technical support involvement

### Rule 5: Adjustment Authorization and Processing

**Description**: Manages the authorization and processing of inventory adjustments resulting from physical count variances.

**Trigger**: Variance resolution, adjustment recommendation, or approval workflow

**Business Logic**: 
- Adjustment authorization levels based on variance amount and type
- Small variances (<$25) auto-approved after investigation
- Significant adjustments require management approval with business justification
- Batch processing of annual count adjustments with comprehensive review

**Validation Rules**:
- Authorization levels: Supervisor ($100), Manager ($500), Director ($2,000), CFO (unlimited)
- Adjustment documentation includes count evidence and investigation results
- Cost impact analysis completed before adjustment processing
- Financial statement impact assessed for material adjustments

**Exception Handling**: 
- Authorization delays may require temporary adjustment holds
- Disputed adjustments escalated for senior management review
- System processing errors require manual adjustment with audit trail

### Rule 6: Systematic Error Identification

**Description**: Identifies and addresses systematic errors in inventory management through count variance analysis.

**Trigger**: Pattern analysis, trend identification, or systematic review requirements

**Business Logic**: 
- Variance patterns analyzed monthly for systematic error identification
- Common error types tracked: transaction errors, system issues, process failures
- Error prevention measures implemented based on analysis results
- System improvements prioritized based on error frequency and impact

**Validation Rules**:
- Pattern analysis includes minimum 30 days of variance data
- Error categorization follows standardized taxonomy for consistency
- Prevention measures include specific goals and success metrics
- System improvements tracked from implementation through effectiveness verification

**Exception Handling**: 
- Complex patterns may require specialized analysis or external consultation
- System limitations may require workaround procedures until resolution
- Process changes require training and communication programs

## Technology Integration

### Rule 7: Mobile Count Technology

**Description**: Leverages mobile technology for efficient and accurate physical count execution and real-time data capture.

**Trigger**: Technology deployment, count execution, or system integration requirements

**Business Logic**: 
- Mobile devices enable real-time count data entry and validation
- Barcode scanning reduces data entry errors and improves efficiency
- Online validation provides immediate feedback on significant variances
- Offline capability ensures count continuation during network issues

**Validation Rules**:
- Mobile device battery life adequate for complete count session
- Barcode scanning accuracy >99.5% with manual entry backup
- Real-time validation rules configured to flag unusual counts
- Offline data synchronization completed within 1 hour of network restoration

**Exception Handling**: 
- Technology failures require immediate backup count procedures
- Scanning errors prompt manual verification and system correction
- Network issues activate offline mode with subsequent data synchronization

### Rule 8: Count Data Integration

**Description**: Ensures accurate and timely integration of count data with inventory management and financial systems.

**Trigger**: Count completion, data processing, or system synchronization requirements

**Business Logic**: 
- Count data integrated with inventory system within 4 hours of completion
- Financial impact calculations completed automatically with adjustment processing
- Audit trail maintained for all count data and system changes
- Exception reporting identifies integration issues for immediate resolution

**Validation Rules**:
- Data integration accuracy verified through systematic validation checks
- Financial calculations accurate within ±$1 or 0.1% of count values
- Audit trail completeness maintained at 100% with secure storage
- Exception resolution completed within 24 hours of identification

**Exception Handling**: 
- Integration failures trigger immediate technical support and manual backup
- Calculation errors require correction and reprocessing
- Audit trail issues may require system investigation and enhancement

## Quality Assurance

### Rule 9: Count Quality Control

**Description**: Implements quality control measures to ensure count accuracy and reliability.

**Trigger**: Quality assessment, performance monitoring, or improvement requirements

**Business Logic**: 
- Quality checkpoints embedded throughout count process
- Statistical quality control monitors count accuracy trends
- Continuous improvement initiatives based on quality metrics
- Best practice sharing across count teams and locations

**Validation Rules**:
- Quality checkpoints include pre-count preparation, execution monitoring, and post-count verification
- Statistical control limits established based on historical performance
- Improvement initiatives tracked from implementation through effectiveness measurement
- Best practice documentation updated annually with lessons learned

**Exception Handling**: 
- Quality control failures require immediate process review and correction
- Statistical trends outside control limits trigger investigation and adjustment
- Improvement initiative failures analyzed for alternative approaches

### Rule 10: Regulatory Compliance

**Description**: Ensures physical count procedures comply with accounting standards, regulatory requirements, and audit standards.

**Trigger**: Compliance assessment, regulatory updates, or audit requirements

**Business Logic**: 
- Count procedures designed to meet generally accepted accounting principles
- Documentation standards exceed minimum regulatory requirements
- External audit coordination ensures count procedures meet audit standards
- Regulatory changes incorporated into procedures within required timeframes

**Validation Rules**:
- Count procedures reviewed annually by qualified accounting personnel
- Documentation retention periods meet or exceed regulatory requirements
- Audit coordination completed 30 days before scheduled external audits
- Regulatory compliance verified through internal audit programs

**Exception Handling**: 
- Compliance failures require immediate correction and regulatory notification
- Audit issues addressed within specified timeframes with verified resolution
- Regulatory changes may require emergency procedure updates

## Performance Monitoring

### Key Performance Indicators

1. **Count Accuracy**: Count accuracy maintained at ±2% quantity variance and ±1% value variance
2. **Schedule Compliance**: Count schedules completed on time ≥95% of scheduled counts
3. **Variance Resolution**: Count variances investigated and resolved within standard timeframes ≥90% of time
4. **System Integration**: Count data integrated successfully within 4 hours ≥99% of counts
5. **Quality Standards**: Quality control checkpoints passed ≥98% of time

### Monitoring and Reporting

- **Real-time**: Count execution status, accuracy metrics, variance identification
- **Daily**: Count completion rates, variance volumes, investigation status
- **Weekly**: Accuracy trend analysis, systematic error identification, quality performance
- **Monthly**: Comprehensive performance review, improvement planning, procedure updates

### Corrective Action Requirements

- **Immediate (≤2 hours)**: Significant accuracy failures, system integration errors, compliance violations
- **Short-term (≤24 hours)**: Count schedule delays, variance investigation requirements, quality control failures
- **Medium-term (≤1 week)**: Systematic error correction, procedure improvements, training updates
- **Long-term (≤1 month)**: System enhancements, policy updates, process redesign

This physical count business rules framework ensures accurate inventory records, efficient count execution, systematic variance management, and regulatory compliance while supporting continuous improvement and operational excellence.