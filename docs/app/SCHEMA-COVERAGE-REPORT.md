# Schema Coverage Report for Remaining DD Documents

**Generated**: 2025-11-15
**Source**: `/Users/peak/Documents/GitHub/carmen/docs/app/data-struc/schema.prisma`

---

## INV-006: Periodic Average Costing

**Status**: ⚠️ **NO TABLES EXIST IN SCHEMA.PRISMA**

### Required Tables (from checklist):
- ❌ `costing_periods` - NOT FOUND
- ❌ `average_costs` - NOT FOUND
- ❌ `cost_calculations` - NOT FOUND
- ❌ `period_close` - NOT FOUND
- ❌ `revaluation` - NOT FOUND

**Action**: DD document will be created with table definitions. Tables need to be added to schema.prisma.

---

## Phase 4: Vendor Management

### VENDOR-001: Vendor Directory

**Status**: ✅ **PARTIAL - 3/5 tables exist**

#### Existing Tables:
- ✅ `tb_vendor` (lines 1859-1895)
- ✅ `tb_vendor_contact` (lines 1921-1942)
- ✅ `tb_vendor_address` (lines 1897-1919)
- ✅ `tb_vendor_business_type` (lines 2664-2685)

#### Missing Tables:
- ❌ `vendor_certifications` - NOT FOUND
- ❌ `vendor_documents` - NOT FOUND
- ❌ `vendor_ratings` - NOT FOUND

**Action**: DD document will reference existing schema tables and define missing tables.

---

### VENDOR-002: Price Lists

**Status**: ✅ **COMPLETE - All tables exist**

#### Existing Tables:
- ✅ `tb_pricelist` (line 2255)
- ✅ `tb_pricelist_detail` (line 2296)

**Note**: Additional tables may be needed for:
- ⚠️ Validity period tracking (may use existing fields)
- ⚠️ Tiered pricing structure (may use JSONB fields)

**Action**: DD document will primarily reference existing schema tables.

---

### VENDOR-003: Pricelist Templates

**Status**: ✅ **COMPLETE - All tables exist**

#### Existing Tables:
- ✅ `tb_pricelist_template` (line 2122)
- ✅ `tb_pricelist_template_detail` (line 2164)

**Action**: DD document will reference existing schema tables.

---

### VENDOR-004: Requests for Pricing (RFP)

**Status**: ✅ **PARTIAL - 2/5 tables exist**

#### Existing Tables:
- ✅ `tb_request_for_pricing` (line 2196)
- ✅ `tb_request_for_pricing_detail` (line 2222)

#### Missing Tables:
- ❌ `rfp_vendor_responses` - NOT FOUND
- ❌ `rfp_comparison` - NOT FOUND
- ❌ `rfp_awards` - NOT FOUND

**Note**: Vendor responses may be stored in JSONB fields of existing tables.

**Action**: DD document will reference existing schema tables and define missing tables if needed.

---

### VENDOR-005: Vendor Portal

**Status**: ⚠️ **NO TABLES FOUND**

#### Missing Tables:
- ❌ Portal-specific tables - NOT FOUND

**Note**: Vendor Portal may rely on:
- User authentication tables
- Vendor access control
- Portal configuration

**Action**: Review BR/UC/TS documents to determine required tables. Portal functionality may use existing vendor tables with additional access control.

---

## Summary

| Document | Tables Exist | Tables Missing | Coverage |
|----------|-------------|----------------|----------|
| INV-006: Periodic Average Costing | 0 | 5 | 0% |
| VENDOR-001: Vendor Directory | 4 | 3 | 57% |
| VENDOR-002: Price Lists | 2 | 0 | 100% |
| VENDOR-003: Pricelist Templates | 2 | 0 | 100% |
| VENDOR-004: Requests for Pricing | 2 | 3 | 40% |
| VENDOR-005: Vendor Portal | 0 | TBD | 0% |

**Overall**: 10 tables exist, ~11 tables need definition in DD documents

---

## Next Steps

1. ✅ Create DD documents using existing schema tables where available
2. ⚠️ Highlight missing tables in each DD document
3. ⚠️ Define missing tables in TEXT FORMAT in DD documents
4. ❌ **DO NOT modify schema.prisma** (per user instruction)

---

**Note**: This report identifies which tables exist in schema.prisma vs. what the DD documents require. Missing tables will be defined in the DD documents as TEXT FORMAT specifications.
