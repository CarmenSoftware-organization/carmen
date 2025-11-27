# Use Cases Documentation

This directory contains use case documentation for all modules of the Carmen ERP system.

## Purpose

Use cases document the interactions between actors (users, systems) and the system to achieve specific goals. They bridge the gap between business requirements and technical implementation by describing HOW users and systems interact with the application.

## Use Case Types

### User Use Cases (UC-XXX-001 to UC-XXX-099)
Human-system interactions where users directly interact with the system:
- Create, Read, Update, Delete operations
- Search and filter operations
- Approval workflows
- Report generation
- Data export/import

### System Use Cases (UC-XXX-101 to UC-XXX-199)
Automated system processes and scheduled jobs:
- Scheduled batch processes
- Event-driven processes
- Data synchronization
- Automated notifications
- Background calculations

### Integration Use Cases (UC-XXX-201 to UC-XXX-299)
Interactions with external systems:
- REST API integrations
- SOAP web services
- Message queue consumers/producers
- File transfer operations
- Database synchronization

### Background Job Use Cases (UC-XXX-301 to UC-XXX-399)
Asynchronous processes and queue-based tasks:
- Email processing
- Report generation
- Data cleanup
- Archive operations
- Long-running processes

## Use Case Structure

Each use case document includes:

1. **Actors**: Who or what interacts with the system
2. **Use Case Diagram**: Visual representation of interactions
3. **Detailed Use Cases**: For each interaction:
   - Description and priority
   - Preconditions and postconditions
   - Main flow (happy path)
   - Alternative flows
   - Exception flows
   - Business rules
   - Related requirements

## Module Coverage

Use case documentation is organized by module:

```
use-cases/
├── procurement/
│   ├── UC-purchase-requests.md
│   ├── UC-purchase-orders.md
│   ├── UC-goods-received-note.md
│   └── UC-credit-notes.md
├── inventory-management/
│   ├── UC-stock-movement.md
│   ├── UC-physical-count.md
│   └── UC-inventory-adjustment.md
├── vendor-management/
│   └── UC-vendor-management.md
└── ...
```

## How to Use

### For Business Analysts
- Use cases clarify business requirements
- Identify gaps in requirements
- Validate user workflows
- Support user story creation

### For Developers
- Understand expected system behavior
- Identify integration points
- Design API contracts
- Plan error handling

### For Testers
- Create test scenarios
- Identify edge cases
- Validate acceptance criteria
- Develop test data

### For Product Owners
- Validate feature completeness
- Prioritize development
- Communicate with stakeholders
- Support training material creation

## Creating Use Cases

1. **Start with the template**: Copy `/docs/templates/UC-template.md`
2. **Identify actors**: List all users and systems involved
3. **List use cases**: Enumerate all interactions
4. **Document flows**: Detail main, alternative, and exception flows
5. **Link requirements**: Connect to BR and FR documents
6. **Review with stakeholders**: Validate with users and business
7. **Keep updated**: Maintain as system evolves

## Use Case Naming Convention

- **File Name**: `UC-{sub-module-name}.md`
- **Use Case ID**: `UC-{MODULE-CODE}-{NUMBER}`
  - User: 001-099
  - System: 101-199
  - Integration: 201-299
  - Background: 301-399

**Examples**:
- `UC-PR-001`: Create Purchase Request (user)
- `UC-PR-101`: Auto-generate PR from template (system)
- `UC-PR-201`: Send PR to vendor portal (integration)
- `UC-PR-301`: Send PR approval reminders (background)

## Relationship to Other Documentation

```
Business Requirements (BR)
         ↓
    Use Cases (UC) ← Describes HOW requirements are met
         ↓
Technical Specifications (TS)
         ↓
    Test Cases (TC)
```

- **BR → UC**: Requirements define WHAT, use cases show HOW
- **UC → TS**: Use cases inform technical design
- **UC → TC**: Use cases become test scenarios

## Best Practices

### DO
✅ Write from actor's perspective
✅ Use clear, simple language
✅ Include all alternative and exception flows
✅ Link to related requirements
✅ Keep use cases atomic and focused
✅ Update when system changes
✅ Include system-to-system interactions

### DON'T
❌ Include implementation details
❌ Mix multiple use cases in one
❌ Skip exception handling
❌ Forget about system use cases
❌ Leave orphaned use cases
❌ Ignore edge cases

## Examples

### Good Use Case Example
```
UC-PR-001: Create Purchase Request

Main Flow:
1. User clicks "New Purchase Request" button
2. System displays PR form with default values
3. User fills in required fields (department, delivery date)
4. User adds items to request
5. System validates budget availability
6. User clicks "Submit"
7. System creates PR and routes for approval
8. System displays success message
9. Use case ends
```

### System Use Case Example
```
UC-INV-101: Daily Stock Level Reconciliation

Trigger: Scheduled daily at 2:00 AM

Main Flow:
1. System locks inventory tables
2. System calculates expected stock levels
3. System compares with actual stock levels
4. For each discrepancy:
   - System creates adjustment record
   - System logs variance details
5. System generates reconciliation report
6. System sends report to inventory managers
7. System releases locks
8. Process completes
```

## Metrics

Track use case documentation coverage:
- Total modules: {count}
- Modules with use cases: {count}
- Total use cases documented: {count}
- Use cases by type:
  - User: {count}
  - System: {count}
  - Integration: {count}
  - Background: {count}

## Support

For questions about use case documentation:
- **Business Analysis**: Business Analysis Team
- **Technical Questions**: Development Team
- **Process Questions**: Product Management

---

**Status**: Active
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-01-30
**Owner**: Documentation Team
