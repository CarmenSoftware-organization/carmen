# Shared Methods Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.1 | 2025-12-03 | Documentation Team | Added Module Integration section with Credit Note references |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## Overview

This directory contains documentation for application-wide shared methods and services that are used across multiple modules in the Carmen ERP system. These shared methods provide centralized, consistent functionality to ensure data integrity and business rule compliance throughout the application.

## Purpose

Shared methods serve as:
- **Single Source of Truth**: Centralized implementation of critical business logic
- **Consistency**: Same calculations and rules applied across all modules
- **Maintainability**: Updates in one location affect entire application
- **Integration Guide**: Clear documentation for developers

## Available Shared Methods

| Method | Purpose | Service Location | Documentation |
|--------|---------|------------------|---------------|
| [Inventory Valuation](./inventory-valuation/SM-inventory-valuation.md) | Calculate inventory costs using FIFO or Periodic Average | `/lib/services/db/inventory-valuation-service.ts` | [View](./inventory-valuation/) |
| [Inventory Operations](./inventory-operations/SM-inventory-operations.md) | Standardized inventory operations: balance tracking, transaction recording, state management | `/lib/services/db/inventory-*-service.ts` | [View](./inventory-operations/) |

## Module Integration

The following modules integrate with shared methods:

| Module | Location | Services Used | Integration Example |
|--------|----------|---------------|---------------------|
| [Credit Note (CN)](../procurement/credit-note/) | `/app/(main)/procurement/credit-note` | Inventory Valuation (FIFO costing), Transaction Recording, Audit Trail, State Management, Atomic Transaction | [credit-note-integration.md](./inventory-valuation/examples/credit-note-integration.md) |
| GRN (Goods Receive Note) | `/app/(main)/procurement/grn` | Inventory Valuation, Transaction Recording, Location Management | See SM-inventory-operations.md |
| Inventory Adjustment | `/app/(main)/inventory-management` | Balance Service, Transaction Recording, Audit Trail | See SM-inventory-operations.md |

## When to Use Shared Methods

Use shared methods when:
- ✅ Multiple modules need the same calculation or business logic
- ✅ Consistency is critical (e.g., financial calculations, inventory costing)
- ✅ The logic implements accounting or regulatory requirements
- ✅ Changes need to cascade across the entire application

Do NOT create shared methods for:
- ❌ Module-specific business logic
- ❌ Simple data transformations
- ❌ UI-only logic that doesn't affect data integrity

## Integration Pattern

### 1. Import the Service
```typescript
import { InventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
```

### 2. Initialize and Use
```typescript
const valuationService = new InventoryValuationService()
const result = await valuationService.calculateInventoryValuation(
  itemId,
  quantity,
  date
)
```

### 3. Handle Results
```typescript
// Use the standardized result structure
console.log(`Cost per unit: ${result.unitCost}`)
console.log(`Total value: ${result.totalValue}`)
```

## Documentation Structure

Each shared method includes:
- **SM-{method-name}.md** - Main documentation with purpose, scope, and overview
- **SM-{detail}.md** - Detailed specifications for complex features
- **api-reference.md** - Technical API documentation
- **examples/** - Integration examples for different modules

## Contributing

When creating a new shared method:

1. **Create documentation first** - Define purpose and scope
2. **Follow naming conventions** - Use SM-{method-name}.md format
3. **Provide examples** - Show integration in different contexts
4. **Update this README** - Add to the table above
5. **Write tests** - Comprehensive test coverage required
6. **Code review** - Architecture team approval needed

## Related Documentation

- [Service Architecture](/lib/services/README.md)
- [Development Patterns](/docs/CLAUDE.md)
- [Type System](/lib/types/)
- [Testing Standards](/__tests__/README.md)

## Support

For questions or clarifications:
- Review the specific shared method documentation
- Check integration examples
- Consult the service implementation code
- Contact the architecture team

---

**Last Updated**: 2025-12-03
**Maintained By**: Architecture Team
