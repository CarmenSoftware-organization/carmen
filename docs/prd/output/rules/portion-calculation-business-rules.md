# Portion Calculation Business Rules

**Document Type**: Business Rules Documentation  
**Module**: Portion Calculation and Sizing Management  
**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Active  

## Overview

This document defines business rules for calculating, sizing, and converting portions within the Carmen ERP system. These rules ensure accurate portion calculations, consistent sizing standards, cost allocation precision, and optimal yield management for fractional food items.

**Business Context**: Accurate portion calculation is critical for cost control, pricing accuracy, inventory management, and customer satisfaction. These rules provide the mathematical foundation for fractional sales operations while maintaining profitability and food safety standards.

## Core Business Rules

### Rule 1: Base Portion Calculation Standards

**Description**: Establishes mathematical foundations for calculating portions from whole items with standardized formulas and conversion factors.

**Trigger**: Product configuration, recipe setup, or portion size modifications

**Business Logic**: 
- All portion calculations use standardized mathematical formulas
- Base conversion factors established per product category
- Rounding rules applied consistently across all calculations
- Waste factors incorporated into all portion calculations

**Validation Rules**:
- Portion calculations must result in whole number portions ≥2 and ≤16
- Total calculated portions cannot exceed 102% of theoretical maximum
- Minimum portion size must meet regulatory requirements
- Conversion factors validated against physical testing

**Exception Handling**: 
- Calculations resulting in fractional portions require rounding protocols
- Waste factors exceeding 15% trigger management review
- Custom portion requests require recalculation approval

### Rule 2: Pizza Portion Calculation Rules

**Description**: Defines specific calculation methods for pizza portioning based on diameter, crust thickness, and customer preferences.

**Trigger**: Pizza preparation, customer ordering, or portion customization requests

**Business Logic**: 
- Standard pizza portioning: 8 slices for 14" pizza, 6 slices for 12" pizza, 4 slices for personal pizza
- Slice angle calculation: 360° ÷ number of slices with ±5° tolerance
- Deep dish pizzas use weight-based calculation (200g ± 20g per slice)
- Specialty pizzas may have custom portioning based on toppings and preparation method

**Validation Rules**:
- Slice angles must be within ±5° of calculated standard
- Slice size consistency maintained within 15% variance
- Minimum slice size: 45° for standard pizzas, 90g for deep dish
- Maximum slice size: 180° for sharing portions

**Exception Handling**: 
- Customer requests for non-standard portioning require approval
- Irregular pizza shapes require manual calculation override
- Excessive slice variation triggers quality investigation

### Rule 3: Cake Portion Calculation Rules

**Description**: Establishes weight and dimension-based calculation methods for cake portions with consideration for decoration and structural integrity.

**Trigger**: Cake cutting, portion planning, or custom cake orders

**Business Logic**: 
- Standard cake portions calculated by weight (100g ± 10g per slice)
- Round cake portioning uses radial cuts with equal angles
- Sheet cakes use grid-based cutting for uniform rectangles
- Decorated cakes account for decoration weight in calculations

**Validation Rules**:
- Portion weight variance cannot exceed ±10g from target
- Minimum cake portion: 75g for individual service
- Maximum cake portion: 150g for sharing size
- Decoration elements distributed proportionally across portions

**Exception Handling**: 
- Custom decoration requests may alter standard portion calculations
- Structural integrity concerns override standard portioning
- Special occasion cakes may have modified portion standards

### Rule 4: Multi-Layer Item Calculations

**Description**: Manages portion calculations for items with multiple layers or components requiring proportional distribution.

**Trigger**: Multi-component item preparation, layered product cutting, or composite item portioning

**Business Logic**: 
- Each layer calculated independently then combined proportionally
- Component ratios maintained across all portions
- Garnish and topping distribution calculated separately
- Total portion value equals sum of all component portions

**Validation Rules**:
- Component ratios maintained within ±5% variance per portion
- Total component weights equal original item weight minus waste
- Garnish distribution even across all portions
- Structural integrity maintained in multi-layer portions

**Exception Handling**: 
- Component separation during cutting requires reassembly protocols
- Uneven layer distribution requires equalization procedures
- Missing components trigger portion adjustment calculations

## Cost Allocation Rules

### Rule 5: Proportional Cost Distribution

**Description**: Allocates ingredient and preparation costs proportionally across all calculated portions based on weight and value distribution.

**Trigger**: Cost calculation updates, ingredient price changes, or portion size modifications

**Business Logic**: 
- Ingredient costs distributed based on portion weight ratios
- Labor costs allocated proportionally across all portions
- Overhead costs applied uniformly per portion
- Waste costs factored into individual portion calculations

**Validation Rules**:
- Total portion costs must equal original item cost plus waste allowance
- Individual portion costs calculated to 4 decimal places for accuracy
- Labor cost allocation based on documented time standards
- Overhead allocation follows established company guidelines

**Exception Handling**: 
- Ingredient cost volatility requires frequent recalculation
- Labor efficiency variations affect portion cost accuracy
- Waste factors exceeding standards trigger cost review

### Rule 6: Premium Portion Adjustments

**Description**: Adjusts calculations for premium portions containing higher-value ingredients or special preparation requirements.

**Trigger**: Premium ingredient usage, special preparation requirements, or custom portion requests

**Business Logic**: 
- Premium ingredients allocated based on actual distribution in portions
- Special preparation costs assigned to specific portions receiving treatment
- Custom portion requests incur additional calculation and handling costs
- Premium portion pricing reflects enhanced value proposition

**Validation Rules**:
- Premium ingredient distribution tracked accurately across portions
- Special preparation costs documented and justified
- Custom portion charges reflect actual additional costs
- Premium portion margins maintained above minimum thresholds

**Exception Handling**: 
- Premium ingredient shortages require substitution calculations
- Special preparation failures affect premium portion availability
- Custom portion complexity may require pricing adjustments

## Conversion and Scaling Rules

### Rule 7: Recipe Scaling for Portion Production

**Description**: Scales recipe quantities to produce optimal numbers of portions based on demand forecasting and inventory management.

**Trigger**: Production planning, demand forecasting updates, or inventory level changes

**Business Logic**: 
- Recipe scaling maintains ingredient proportions precisely
- Scaling factors calculated to minimize waste and optimize yield
- Production quantities rounded to practical preparation amounts
- Conversion efficiency monitored and optimized continuously

**Validation Rules**:
- Scaling factors maintain recipe integrity within acceptable tolerances
- Scaled quantities result in whole number practical portions
- Ingredient availability confirmed before scaling confirmation
- Waste projections included in scaling calculations

**Exception Handling**: 
- Ingredient availability constraints require recipe modification
- Equipment capacity limitations affect scaling possibilities
- Quality issues with scaled recipes trigger review protocols

### Rule 8: Yield Optimization Calculations

**Description**: Optimizes portion calculations to maximize yield while maintaining quality standards and customer satisfaction.

**Trigger**: Yield analysis, waste reports, or profitability reviews

**Business Logic**: 
- Portion sizing optimized for maximum yield within quality constraints
- Waste minimization balanced against portion quality requirements
- Revenue per portion optimized through intelligent sizing
- Customer satisfaction metrics integrated into optimization algorithms

**Validation Rules**:
- Optimized portions maintain minimum quality standards
- Waste reduction does not compromise food safety requirements
- Revenue optimization maintains competitive pricing position
- Customer satisfaction scores remain above acceptable thresholds

**Exception Handling**: 
- Quality degradation from optimization requires adjustment
- Customer complaints about portion changes trigger review
- Revenue optimization conflicts require management resolution

## Quality and Consistency Rules

### Rule 9: Portion Consistency Standards

**Description**: Maintains consistent portion sizes and quality across all production periods and staff members.

**Trigger**: Quality audits, consistency monitoring, or staff performance reviews

**Business Logic**: 
- Statistical process control applied to portion consistency monitoring
- Variation limits established and monitored continuously
- Staff training effectiveness measured through portion consistency
- Equipment calibration affects portion calculation accuracy

**Validation Rules**:
- Portion weight variance ≤±10% from target for 95% of portions
- Visual consistency scores ≥8/10 for all portions
- Staff consistency performance ≥90% adherence to standards
- Equipment calibration verified monthly or after service

**Exception Handling**: 
- Excessive portion variation triggers immediate staff retraining
- Equipment calibration issues require recalculation protocols
- Consistency failures prompt process improvement initiatives

### Rule 10: Quality-Based Portion Adjustments

**Description**: Adjusts portion calculations based on quality factors to maintain customer satisfaction and operational efficiency.

**Trigger**: Quality assessments, customer feedback, or product condition changes

**Business Logic**: 
- Lower quality items receive larger portions to maintain value perception
- Premium quality items justified with standard or smaller portions
- Freshness factors influence portion size recommendations
- Customer feedback integrated into quality-based adjustments

**Validation Rules**:
- Quality scoring system consistently applied across all items
- Portion adjustments proportional to quality variations
- Value perception maintained through quality-portion balance
- Customer feedback response time ≤24 hours for adjustments

**Exception Handling**: 
- Severe quality issues may require removal from sale rather than adjustment
- Customer dissatisfaction with adjustments requires management intervention
- Quality improvement eliminates need for portion compensation

## Technology Integration Rules

### Rule 11: Automated Calculation Systems

**Description**: Integrates portion calculations with POS systems, inventory management, and production planning tools.

**Trigger**: System updates, calculation formula changes, or integration modifications

**Business Logic**: 
- Calculations performed in real-time with system integration
- Automated updates cascade through all connected systems
- Backup calculation methods available for system failures
- Calculation accuracy verified through regular system audits

**Validation Rules**:
- System calculations verified against manual calculation samples
- Integration accuracy maintained at 99.9% or higher
- Backup systems activated within 30 seconds of primary failure
- Audit trails maintained for all automated calculations

**Exception Handling**: 
- System calculation errors trigger immediate manual override
- Integration failures require temporary manual processes
- Calculation discrepancies prompt system recalibration

### Rule 12: Data Accuracy and Validation

**Description**: Ensures accuracy and reliability of all data used in portion calculations through validation and verification processes.

**Trigger**: Data entry, system updates, or accuracy audits

**Business Logic**: 
- All calculation input data validated before processing
- Regular accuracy audits identify and correct data issues
- Multiple validation methods used for critical calculation parameters
- Data backup and recovery procedures protect calculation integrity

**Validation Rules**:
- Input data accuracy verified within 24 hours of entry
- Critical parameters double-checked using independent methods
- Data backup performed automatically every 4 hours
- Recovery procedures tested monthly for effectiveness

**Exception Handling**: 
- Data accuracy failures trigger immediate correction protocols
- Backup system activation requires validation of restored data
- Multiple validation failures prompt comprehensive data audit

## Performance Monitoring

### Key Performance Indicators

1. **Calculation Accuracy**: Portion calculations accurate within ±2% variance 99% of the time
2. **Consistency Achievement**: Portion consistency scores ≥95% adherence to standards
3. **Waste Optimization**: Calculation-driven waste reduction achieving ≤10% waste rates
4. **Cost Accuracy**: Cost allocation calculations accurate within ±1% variance
5. **System Reliability**: Automated calculation systems operational 99.5% of time
6. **Quality Maintenance**: Quality standards maintained despite portion optimization

### Monitoring and Reporting

- **Real-time**: System calculation accuracy, portion consistency monitoring
- **Daily**: Waste rates, cost allocation accuracy, quality score tracking
- **Weekly**: Calculation system performance, optimization effectiveness analysis
- **Monthly**: Comprehensive calculation audit, performance improvement planning

### Corrective Action Requirements

- **Immediate (≤15 minutes)**: System calculation failures, safety-related calculation errors
- **Short-term (≤1 hour)**: Portion consistency failures, cost allocation discrepancies
- **Medium-term (≤4 hours)**: Quality-based adjustment needs, system integration issues
- **Long-term (≤1 week)**: Calculation method improvements, system optimization updates

This portion calculation business rules framework ensures mathematical accuracy, operational consistency, and financial precision in all fractional food operations while supporting business objectives of profitability and customer satisfaction.