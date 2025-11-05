# Flow Diagrams: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-02-11
- **Owner**: Procurement Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System Documentation | Initial version |

---

## Overview

This document provides visual flow diagrams for all major workflows in the Purchase Request Templates module. Diagrams illustrate user interactions, system processes, decision points, and data flows.

**Related Documents**:
- [Business Requirements](./BR-purchase-request-templates.md)
- [Use Cases](./UC-purchase-request-templates.md)
- [Technical Specification](./TS-purchase-request-templates.md)

---

## 1. Template Creation Workflow

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ User clicks         │
│ "New Template"      │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Display template    │
│ creation form       │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User enters:        │
│ - Description       │
│ - Department        │
│ - Request Type      │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User clicks         │
│ "Create"            │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Validate input      │
│ (client-side)       │
└────┬────────────────┘
     │
     ├─── Invalid ───► Display errors ───┐
     │                                    │
     │                                    ▼
     │                            ┌──────────────┐
     │                            │ User corrects│
     │                            │ errors       │
     │                            └──────┬───────┘
     │                                   │
     │◄──────────────────────────────────┘
     │
     ▼ Valid
┌─────────────────────┐
│ Call server action: │
│ createTemplate()    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Generate template   │
│ number (TPL-YYYY-   │
│ NNN)                │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Insert template     │
│ record to database  │
└────┬────────────────┘
     │
     ├─── Success ────┐
     │                 │
     │                 ▼
     │         ┌──────────────────┐
     │         │ Log activity     │
     │         │ (template_created│
     │         │ )                │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Navigate to      │
     │         │ template detail  │
     │         │ page (edit mode) │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Display success  │
     │         │ message          │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │   END    │
     │         └──────────┘
     │
     └─── Failure ───┐
                     │
                     ▼
              ┌──────────────┐
              │ Display error│
              │ message      │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────┐
              │   END    │
              └──────────┘
```

---

## 2. Add Item to Template Workflow

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ User in edit mode   │
│ clicks "Add Item"   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Display item form   │
│ dialog (empty)      │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User enters basic   │
│ info:               │
│ - Item code         │
│ - Description       │
│ - UOM               │
│ - Quantity          │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User enters pricing:│
│ - Currency          │
│ - Unit price        │
│ - Discount %        │
│ - Tax %             │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ System calculates   │
│ amounts in real-time│
│ (useEffect watch)   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User enters         │
│ financial coding:   │
│ - Budget code       │
│ - Account code      │
│ - Department        │
│ - Tax code          │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User reviews        │
│ calculated amounts  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User clicks "Add"   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Validate all fields │
│ (Zod schema)        │
└────┬────────────────┘
     │
     ├─── Invalid ───► Display errors ───┐
     │                                    │
     │                                    ▼
     │                            ┌──────────────┐
     │                            │ User corrects│
     │                            └──────┬───────┘
     │                                   │
     │◄──────────────────────────────────┘
     │
     ▼ Valid
┌─────────────────────┐
│ Check duplicate     │
│ item code           │
└────┬────────────────┘
     │
     ├─── Duplicate ──► Display error ────► END
     │
     ▼ Unique
┌─────────────────────┐
│ Call server action: │
│ addTemplateItem()   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Insert item record  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Recalculate         │
│ template estimated  │
│ total               │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Update template     │
│ record              │
└────┬────────────────┘
     │
     ├─── Success ────┐
     │                 │
     │                 ▼
     │         ┌──────────────────┐
     │         │ Log activity     │
     │         │ (item_added)     │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Close dialog     │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Refresh items    │
     │         │ list display     │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Display success  │
     │         │ message          │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │   END    │
     │         └──────────┘
     │
     └─── Failure ───┐
                     │
                     ▼
              ┌──────────────┐
              │ Display error│
              │ Keep dialog  │
              │ open         │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────┐
              │   END    │
              └──────────┘
```

---

## 3. Set Default Template Workflow

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ User clicks "Set as │
│ Default" button     │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Check current       │
│ default for dept    │
└────┬────────────────┘
     │
     ├─── None ────┐
     │             │
     │             ▼
     │    ┌────────────────────┐
     │    │ Proceed to set     │
     │    │ default directly   │
     │    └────────┬───────────┘
     │             │
     │             │
     ▼             │
┌──────────────────┐ │
│ Display          │ │
│ confirmation:    │ │
│ "Replace TPL-X   │ │
│ as default?"     │ │
└────┬─────────────┘ │
     │               │
     ▼               │
┌──────────────────┐ │
│ User confirms    │ │
└────┬─────────────┘ │
     │               │
     ├─── Cancel ───►│END
     │               │
     ▼ Confirm       │
┌──────────────────┐ │
│ Call server      │ │
│ action:          │ │
│ setDefaultTemp() │ │
└────┬─────────────┘ │
     │               │
     │◄──────────────┘
     │
     ▼
┌──────────────────────┐
│ BEGIN TRANSACTION    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Remove is_default    │
│ from previous        │
│ default template     │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Set is_default=true  │
│ on selected template │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Log activity for     │
│ both templates       │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ COMMIT TRANSACTION   │
└────┬─────────────────┘
     │
     ├─── Success ────┐
     │                 │
     │                 ▼
     │         ┌──────────────────┐
     │         │ Update UI with   │
     │         │ default indicator│
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────────────┐
     │         │ Display success  │
     │         │ message          │
     │         └────┬─────────────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │   END    │
     │         └──────────┘
     │
     └─── Failure ───┐
                     │
                     ▼
              ┌──────────────────┐
              │ ROLLBACK         │
              │ TRANSACTION      │
              └────┬─────────────┘
                   │
                   ▼
              ┌──────────────┐
              │ Display error│
              │ message      │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────┐
              │   END    │
              └──────────┘
```

---

## 4. Template to Purchase Request Conversion

```
┌──────────┐
│  START   │
│ (in PR   │
│  module) │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ User clicks "Use    │
│ Template" or        │
│ "Create from        │
│ Template"           │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Display template    │
│ selection modal     │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User selects        │
│ template            │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Optional: Select    │
│ vendor, delivery    │
│ date, apply current │
│ pricing             │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ User confirms       │
│ conversion          │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ PR module calls     │
│ template conversion │
│ service             │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Validate template   │
│ exists & is active  │
└────┬────────────────┘
     │
     ├─── Invalid ───► Error: "Template not │
     │                 active or not found" │
     │                          │           │
     │                          ▼           │
     │                        ┌──────────┐  │
     │                        │   END    │  │
     │                        └──────────┘  │
     │                                      │
     ▼ Valid                                │
┌─────────────────────┐                    │
│ Fetch template with │                    │
│ all items           │                    │
└────┬────────────────┘                    │
     │                                      │
     ▼                                      │
┌─────────────────────┐                    │
│ Apply current       │──── No ────┐       │
│ pricing?            │            │       │
└────┬────────────────┘            │       │
     │ Yes                         │       │
     ▼                             │       │
┌─────────────────────┐            │       │
│ For each item, call │            │       │
│ Vendor Management   │            │       │
│ for current price   │            │       │
└────┬────────────────┘            │       │
     │                             │       │
     ▼                             │       │
┌─────────────────────┐            │       │
│ Update item prices  │            │       │
│ if different        │            │       │
└────┬────────────────┘            │       │
     │                             │       │
     │◄────────────────────────────┘       │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Generate PR number  │                   │
│ (PR-YYYY-NNN)       │                   │
└────┬────────────────┘                   │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Create PR record    │                   │
│ with template data: │                   │
│ - Description       │                   │
│ - Department        │                   │
│ - Type              │                   │
│ - Status = Draft    │                   │
│ - Source template ID│                   │
└────┬────────────────┘                   │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Create PR line items│                   │
│ from template items │                   │
└────┬────────────────┘                   │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Increment template  │                   │
│ usage_count         │                   │
└────┬────────────────┘                   │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Update template     │                   │
│ last_used_date      │                   │
└────┬────────────────┘                   │
     │                                     │
     ▼                                     │
┌─────────────────────┐                   │
│ Log activity        │                   │
│ (template_converted │                   │
│ _to_pr)             │                   │
└────┬────────────────┘                   │
     │                                     │
     ├─── Success ────┐                   │
     │                 │                   │
     │                 ▼                   │
     │         ┌──────────────────┐        │
     │         │ Return PR data to│        │
     │         │ calling module   │        │
     │         └────┬─────────────┘        │
     │              │                      │
     │              ▼                      │
     │         ┌──────────────────┐        │
     │         │ PR module        │        │
     │         │ displays new PR  │        │
     │         │ in Draft status  │        │
     │         └────┬─────────────┘        │
     │              │                      │
     │              ▼                      │
     │         ┌──────────┐                │
     │         │   END    │                │
     │         └──────────┘                │
     │                                     │
     └─── Failure ───┐                     │
                     │                     │
                     ▼                     │
              ┌──────────────────┐         │
              │ Rollback all     │         │
              │ changes          │         │
              └────┬─────────────┘         │
                   │                       │
                   ▼                       │
              ┌──────────────┐             │
              │ Return error │             │
              │ to PR module │             │
              └──────┬───────┘             │
                     │                     │
                     ▼                     │
              ┌──────────────┐             │
              │ Display error│             │
              │ message      │             │
              └──────┬───────┘             │
                     │                     │
                     ▼                     │
              ┌──────────┐                 │
              │   END    │                 │
              └──────────┘                 │
                                           │
              ◄────────────────────────────┘
```

---

## 5. Delete Template Workflow

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ User clicks "Delete"│
│ button              │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Check if template   │
│ is default          │
└────┬────────────────┘
     │
     ├─── Is Default ─► Error: "Remove      │
     │                  default status first"│
     │                          │             │
     │                          ▼             │
     │                        ┌──────────┐    │
     │                        │   END    │    │
     │                        └──────────┘    │
     │                                        │
     ▼ Not Default                            │
┌─────────────────────┐                      │
│ Display confirmation│                      │
│ dialog with:        │                      │
│ - Template number   │                      │
│ - Description       │                      │
│ - Item count        │                      │
│ - Warning message   │                      │
└────┬────────────────┘                      │
     │                                        │
     ▼                                        │
┌─────────────────────┐                      │
│ User confirms       │                      │
│ deletion            │                      │
└────┬────────────────┘                      │
     │                                        │
     ├─── Cancel ────►│END                   │
     │                                        │
     ▼ Confirm                                │
┌─────────────────────┐                      │
│ Check for active PR │                      │
│ references          │                      │
└────┬────────────────┘                      │
     │                                        │
     ├─── Has Refs ──► Error: "Cannot delete│
     │                  template. N active   │
     │                  PRs reference it"    │
     │                          │            │
     │                          ▼            │
     │                        ┌──────────┐   │
     │                        │   END    │   │
     │                        └──────────┘   │
     │                                       │
     ▼ No Refs                               │
┌─────────────────────┐                     │
│ Call server action: │                     │
│ deleteTemplate()    │                     │
└────┬────────────────┘                     │
     │                                       │
     ▼                                       │
┌─────────────────────┐                     │
│ BEGIN TRANSACTION   │                     │
└────┬────────────────┘                     │
     │                                       │
     ▼                                       │
┌─────────────────────┐                     │
│ Set template        │                     │
│ deleted_at = NOW()  │                     │
│ deleted_by = user_id│                     │
└────┬────────────────┘                     │
     │                                       │
     ▼                                       │
┌─────────────────────┐                     │
│ Soft delete all     │                     │
│ template items      │                     │
│ (cascade)           │                     │
└────┬────────────────┘                     │
     │                                       │
     ▼                                       │
┌─────────────────────┐                     │
│ Log activity        │                     │
│ (template_deleted)  │                     │
└────┬────────────────┘                     │
     │                                       │
     ▼                                       │
┌─────────────────────┐                     │
│ COMMIT TRANSACTION  │                     │
└────┬────────────────┘                     │
     │                                       │
     ├─── Success ────┐                     │
     │                 │                     │
     │                 ▼                     │
     │         ┌──────────────────┐          │
     │         │ Remove template  │          │
     │         │ from UI list     │          │
     │         └────┬─────────────┘          │
     │              │                        │
     │              ▼                        │
     │         ┌──────────────────┐          │
     │         │ Navigate to list │          │
     │         │ (if on detail    │          │
     │         │ page)            │          │
     │         └────┬─────────────┘          │
     │              │                        │
     │              ▼                        │
     │         ┌──────────────────┐          │
     │         │ Display success  │          │
     │         │ message          │          │
     │         └────┬─────────────┘          │
     │              │                        │
     │              ▼                        │
     │         ┌──────────┐                  │
     │         │   END    │                  │
     │         └──────────┘                  │
     │                                       │
     └─── Failure ───┐                       │
                     │                       │
                     ▼                       │
              ┌──────────────────┐           │
              │ ROLLBACK         │           │
              │ TRANSACTION      │           │
              └────┬─────────────┘           │
                   │                         │
                   ▼                         │
              ┌──────────────┐               │
              │ Display error│               │
              │ message      │               │
              └──────┬───────┘               │
                     │                       │
                     ▼                       │
              ┌──────────┐                   │
              │   END    │                   │
              └──────────┘                   │
                                             │
              ◄────────────────────────────┘
```

---

## 6. State Machine Diagram

### Template Lifecycle States

```
┌──────────┐
│  DRAFT   │◄─────────────────────┐
└────┬─────┘                       │
     │                             │
     │ Activate                    │ Deactivate
     │ (when ≥1 item exists)       │ (manual)
     │                             │
     ▼                             │
┌──────────┐                       │
│  ACTIVE  │───────────────────────┘
└────┬─────┘
     │
     │ Inactivate
     │ (manual or automated)
     │
     ▼
┌──────────┐
│ INACTIVE │
└────┬─────┘
     │
     │ Archive
     │ (after 6 months inactive)
     │
     ▼
┌──────────┐
│ ARCHIVED │
└────┬─────┘
     │
     │ Reactivate
     │ (requires approval)
     │
     ▼
┌──────────┐
│  ACTIVE  │
└──────────┘
```

### State Transition Rules
- DRAFT → ACTIVE: Requires at least 1 item
- ACTIVE → INACTIVE: Manual deactivation
- INACTIVE → ARCHIVED: Automated after 6 months
- ARCHIVED → ACTIVE: Requires manager approval
- ACTIVE ← → INACTIVE: Bidirectional manual transitions
- Cannot delete templates in ACTIVE status (must inactivate first)

---

## Appendix: Legend

### Diagram Symbols

**Boxes**:
- ┌──────┐ Standard process/action
- │      │
- └──────┘

**Decision Points**:
- ├─── Condition ───► Outcome branch

**Flow Direction**:
- │ Vertical flow (sequential)
- ► Horizontal flow (branching)

**Termination**:
- ┌──────────┐
- │   END    │ End of workflow
- └──────────┘

---

**Document End**
