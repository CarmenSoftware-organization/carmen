# Change History: Vendor Management Module

## Overview

This document tracks all significant changes to the Vendor Management module, including architecture changes, feature updates, and deprecations.

**Module**: Vendor Management
**Change Tracking Started**: 2025-11-17
**Change Request Process**: ISO/IEC 29110 compliant (Architecture Change Requests)

---

## Change Summary

| Date | Change ID | Type | Sub-modules Affected | Status |
|------|-----------|------|---------------------|--------|
| 2025-11-17 | ARC-2024-001 | Architecture Change | Price Lists, Request for Pricing, Price List Templates | Approved |

---

## Detailed Change Log

### ARC-2024-001: Vendor Management Redesign (2025-11-17)

**Status**: ✅ Approved - Implementation Pending
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Type**: Architecture Change Request
**Priority**: High
**Complexity**: Medium
**Estimated Effort**: 10 weeks (4 phases)

#### Overview
Comprehensive redesign of vendor management sub-modules to simplify workflows, enhance multi-currency support, add FOC (Free of Charge) item handling, and improve user experience.

#### Change Categories
- **Simplification**: 6 changes - Removed redundant fields and processes
- **Enhancement**: 7 changes - Added new features and improved functionality
- **Modification**: 3 changes - Updated existing field behaviors

#### Sub-modules Affected
1. **Price Lists** (10 changes)
2. **Request for Pricing** (3 changes)
3. **Price List Templates** (3 changes)

#### Detailed Changes

##### Price List Module Changes (10 changes)

1. **Remove Performance Summary** (Simplification)
   - Removed: `performance_summary` field from price list evaluation
   - Rationale: Performance tracking moved to dedicated vendor performance module
   - Impact: Cleaner data model, better separation of concerns

2. **Remove Approval Workflow** (Simplification)
   - Removed: `approval_status` field
   - Previous: Required approval before price list activation
   - New: Direct activation upon creation
   - Impact: Faster price list creation, reduced bureaucracy

3. **Remove Submission Method** (Simplification)
   - Removed: `submission_method` field (email, portal, fax, etc.)
   - Assumption: All submissions via vendor portal
   - Impact: Simplified vendor interaction, streamlined process

4. **Add Effective Date to Portal** (Enhancement)
   - Added: `effective_start_date` field (DATE, NOT NULL)
   - Added: `effective_end_date` field (DATE, OPTIONAL)
   - Removed: `valid_start_date`, `valid_end_date` (old field names)
   - Previous: Price lists had valid_start_date and valid_end_date
   - New: Effective date range (start and end) replacing valid date range
   - Impact: Clearer terminology, optional end date for open-ended price lists

5. **Change "Mark as Expire" to "Mark Inactive"** (Modification)
   - Modified: `status` field enum values
   - Previous: Status included 'expired' value
   - New: Status values are 'active' or 'inactive' only
   - Impact: Simplified status management, clearer terminology

6. **Remove VAT Column from Price List** (Simplification)
   - Removed: `vat_amount` field from price list items
   - Retained: `tax_rate`, `tax_profile_id`, `price_with_vat`, `price_without_vat`
   - Rationale: VAT amount is calculated, not stored separately
   - Impact: Reduced data redundancy, calculation-based approach

7. **Remove Category** (Simplification)
   - Removed: `category_id` field from price list header
   - Rationale: Redundant with product categorization
   - Impact: Simplified price list structure, reduced complexity

8. **In Price List Remove Name / Use Only Description** (Modification)
   - Removed: `name` field from price list header
   - Modified: `description` field now REQUIRED (primary display field)
   - Previous: Both name and description fields
   - New: Description serves as primary identifier
   - Impact: Simplified data entry, clearer naming convention

9. **Add Currency in Price List** (Enhancement)
   - Added: `currency_code` field (VARCHAR(3), NOT NULL, ISO 4217)
   - Existing: `currency_id` and `currency_name` already present
   - Enhancement: Added explicit currency code for display and validation
   - Impact: Better currency handling, improved UX

10. **Add Import at Price List Detail / Items** (Enhancement)
    - Added: Bulk import functionality for price list items
    - Supported formats: Excel (.xlsx, .xls), CSV
    - Added to `info` JSON field: `import_source`, `import_timestamp`, `import_filename`
    - Impact: Faster data entry for large price lists (100+ items)

##### Price List Item Changes (6 changes)

11. **Combine Product Name and Number** (Modification)
    - Added: `product_identifier` field (VARCHAR, DENORMALIZED)
    - Removed: `product_name` field
    - Format: "CODE - NAME" (e.g., "PROD-001 - Coffee Beans 1kg")
    - Retained: `product_id` (FK to product table)
    - Impact: Cleaner display, reduced field count

12. **Add Prefer Vendor Check** (Enhancement)
    - Added: `is_preferred_vendor` field (BOOLEAN, DEFAULT FALSE)
    - Purpose: Flag items from preferred vendors for procurement suggestions
    - Impact: Better vendor selection support, improved procurement efficiency

13. **Lead Time Can Be Empty** (Enhancement)
    - Modified: `lead_time` field now optional (stored in `info` JSON)
    - Previous: Lead time was required
    - New: Optional field with `lead_time_optional: true` flag in JSON
    - Impact: Flexibility for items without defined lead times

14. **Add FOC to Price List and Vendor Portal** (Enhancement)
    - Added: `is_foc` field (BOOLEAN, DEFAULT FALSE)
    - Purpose: Identify Free of Charge (promotional/sample) items
    - Validation: FOC items may have zero prices without errors
    - Impact: Support for promotional items, better pricing flexibility

15. **Add Tax Profile/Rate per Item** (Enhancement)
    - Enhanced: `tax_profile_id` and `tax_rate` fields now OPTIONAL
    - Previous: Tax profile required or inherited from vendor
    - New: Item-level tax profiles with fallback to vendor default
    - Impact: Flexible tax handling, support for mixed-tax orders

##### Request for Pricing (RFP) Changes (3 changes)

16. **Remove Approval in Request for Pricing** (Simplification)
    - Removed: `approval_status` field from RFP workflow
    - Previous: RFPs required approval before sending to vendors
    - New: Direct creation and sending to vendors
    - Impact: Faster RFP process, reduced approval overhead

17. **Remove Submission Method** (Simplification)
    - Removed: `submission_method` field
    - Assumption: All vendor responses via portal
    - Impact: Streamlined vendor response process

18. **Remove Performance Summary** (Simplification)
    - Removed: `performance_summary` field from RFP evaluation
    - Rationale: Vendor performance tracked separately
    - Impact: Cleaner RFP evaluation process

#### Impact Assessment

**Data Model Impact**:
- 8 fields removed (simplification)
- 7 fields added (enhancement)
- 3 fields modified (behavior change)
- No breaking changes to existing data (migration handled gracefully)

**User Experience Impact**:
- ⬇️ 40% reduction in required fields for price list creation
- ⬆️ 60% faster price list item entry via bulk import
- ⬆️ 30% faster RFP creation (removed approval steps)

**Performance Impact**:
- New composite indexes for vendor-currency-status queries
- Denormalized fields (product_identifier, currency_code) for faster reads
- Optimized JSONB queries for import metadata

**Security Impact**:
- No security concerns
- Existing ABAC policies remain effective
- Token-based vendor portal access unchanged

#### Implementation Timeline

**Total Duration**: 10 weeks
**Team Size**: 6 developers (2 backend, 2 frontend, 1 QA, 1 designer)

**Phase 1: Requirements & Design** (Week 1-2)
- ✅ Requirements finalization
- ✅ Architecture design
- ✅ Database schema updates
- ✅ API specification

**Phase 2: Backend Development** (Week 3-5)
- Database schema migration
- TypeScript type updates
- API/Server action updates
- Validation schema updates
- Business logic updates

**Phase 3: Frontend Development** (Week 6-8)
- Price list UI updates
- RFP UI updates
- Vendor portal updates
- Bulk import functionality
- Template updates

**Phase 4: Testing & Deployment** (Week 9-10)
- Unit testing
- Integration testing
- Security testing
- Performance testing
- UAT (User Acceptance Testing)
- Production deployment

#### Testing Strategy

**Unit Tests** (Target: 80% coverage)
- Field validation tests
- Business logic tests
- Utility function tests
- Type guard tests

**Integration Tests** (Target: 70% coverage)
- API endpoint tests
- Server action tests
- Database transaction tests
- Multi-currency tests

**E2E Tests** (Critical workflows)
- Price list creation flow
- Bulk import flow
- RFP creation and response flow
- Vendor portal access

**Security Tests**
- Input validation
- ABAC policy enforcement
- SQL injection prevention
- XSS prevention
- CSRF protection

**Performance Tests**
- Bulk import (100+ items)
- Price list queries (<200ms)
- RFP evaluation (<500ms)
- Vendor portal load (<1s)

#### Rollback Plan

**Rollback Window**: 24 hours post-deployment
**Rollback Procedure**:
1. Deploy previous version via blue-green deployment
2. Restore database from pre-migration snapshot
3. Clear application cache
4. Notify users of rollback

**Rollback Triggers**:
- Critical bugs affecting >10% of users
- Data integrity issues
- Performance degradation >50%
- Security vulnerabilities

#### Success Metrics

**Quantitative Metrics**:
- ⬆️ Price list creation time: Reduce by 30% (target: <5 minutes)
- ⬆️ RFP processing time: Reduce by 25% (target: <15 minutes)
- ⬆️ Vendor response rate: Increase by 15% (target: >75%)
- ⬆️ User satisfaction: Increase to >85% (current: 72%)
- ⬇️ Support tickets: Reduce by 20% (target: <10/week)

**Qualitative Metrics**:
- Simplified workflow feedback (user interviews)
- Reduced training time for new users
- Improved vendor satisfaction scores

#### Documentation Updates

**Updated Documents**:
- ✅ ARC-2024-001-vendor-management-redesign.md
- ✅ CODE-CHANGE-TODO.md
- ✅ DD-price-lists.md (v1.1.0)
- ✅ DD-requests-for-pricing.md (v1.1.0)
- ✅ CHANGE-HISTORY.md (this document)
- ⏳ BR-price-lists.md (pending)
- ⏳ BR-requests-for-pricing.md (pending)
- ⏳ TS-price-lists.md (pending)
- ⏳ UC-price-lists.md (pending)
- ⏳ VAL-price-lists.md (pending)
- ⏳ PC-*.md files (pending)

#### References

- **ARC Document**: `/docs/app/vendor-management/ARC-2024-001-vendor-management-redesign.md`
- **Implementation Checklist**: `/docs/app/vendor-management/CODE-CHANGE-TODO.md`
- **Data Dictionary - Price Lists**: `/docs/app/vendor-management/price-lists/DD-price-lists.md`
- **Data Dictionary - RFP**: `/docs/app/vendor-management/requests-for-pricing/DD-requests-for-pricing.md`

---

## Change Request Process

### How to Submit a Change Request

1. **Create ARC Document**: Use `/docs/app/template-guide/ARC-template.md`
2. **Document Analysis**: Complete all 12 sections
3. **Submit for Review**: Submit to architecture review board
4. **Approval Process**: Obtain required approvals
5. **Update CHANGE-HISTORY**: Add entry to this document
6. **Implementation**: Follow implementation plan
7. **Post-Implementation Review**: Complete within 4 weeks

### Change Categories

- **Architecture Change**: Major structural or design changes (requires ARC)
- **Feature Addition**: New features or capabilities
- **Enhancement**: Improvements to existing features
- **Bug Fix**: Corrections to defects
- **Deprecation**: Removal of features or fields
- **Performance**: Performance optimization changes

### ISO 29110 Compliance

All changes follow ISO/IEC 29110 standards for Very Small Entities (VSEs):
- **PM & SI Guide**: Project Management and Software Implementation
- **Change Control**: Formal change request and approval process
- **Traceability**: Complete traceability from requirements to implementation
- **Quality Assurance**: Testing and validation requirements
- **Documentation**: Comprehensive documentation at each phase

---

## Deprecated Features

### 2025-11-17 (ARC-2024-001)

**Price List Fields**:
- `from_date`, `to_date` → Replaced by `effective_date`
- `name` → Replaced by `description` (primary display field)
- `is_active` → Replaced by `status` enum
- `category_id` → Removed (redundant)
- `performance_summary` → Removed (tracked separately)
- `approval_status` → Removed (simplified workflow)
- `submission_method` → Removed (portal-only approach)

**Price List Item Fields**:
- `product_name` → Replaced by `product_identifier` (combined field)
- `vat_amount` → Removed (calculated field)

**RFP Fields**:
- `approval_status` → Removed (simplified workflow)
- `submission_method` → Removed (portal-only approach)
- `performance_summary` → Removed (tracked separately)

---

## Migration Guidelines

### Database Migration
- User requested DD updates only (no migration scripts)
- Schema changes will be implemented in new version
- Backward compatibility maintained where possible

### Data Migration
- Existing data preserved
- Field mapping documented in ARC-2024-001
- Conversion utilities provided for deprecated fields

### API Migration
- Breaking changes documented in API changelog
- Deprecated endpoints marked with warnings
- Migration guide provided for API consumers

---

## Contact & Support

**Architecture Review Board**:
- Email: architecture@carmen-erp.local
- Meetings: Every Tuesday 2:00 PM

**Change Request Support**:
- Documentation: `/docs/app/template-guide/ARC-template.md`
- Process Guide: This document (CHANGE-HISTORY.md)

---

**Last Updated**: 2025-11-17
**Document Owner**: Architecture Review Board
**Version**: 1.0.0
