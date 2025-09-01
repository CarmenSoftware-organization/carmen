# Calculation Cache Services

A comprehensive caching layer for calculation services with Redis primary storage and in-memory fallback, designed to significantly improve performance for expensive computations.

## Features

- **Dual-layer Caching**: Redis primary with in-memory fallback for maximum reliability
- **Intelligent Cache Invalidation**: Dependency-based invalidation with batch processing
- **Cache Warming**: Preload frequently accessed calculations for optimal performance
- **TTL Management**: Different TTL strategies for different calculation types
- **Performance Monitoring**: Real-time metrics and health monitoring
- **Transparent Integration**: Drop-in replacement for existing calculation services

## Architecture

```
┌─────────────────────────────────────┐
│     CalculationCacheService         │
│  (Central cache orchestrator)       │
└─────────┬───────────────────────────┘
          │
    ┌─────▼──────┐
    │ Enhanced   │
    │ Cache      │ ◄──── Redis Provider (Primary)
    │ Layer      │
    └─────┬──────┘ ◄──── Memory Cache (Fallback)
          │
    ┌─────▼──────┐
    │ Cached     │
    │ Services   │
    │ • Financial│
    │ • Inventory│
    │ • Vendor   │
    └────────────┘
```

## Quick Start

### Installation

First, install the required Redis dependency:

```bash
npm install ioredis
```

### Environment Configuration

Set up your Redis connection in `.env`:

```env
# Redis Configuration
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_if_needed
REDIS_DB=0
```

### Basic Usage

```typescript
import { getCalculationCacheService } from '@/lib/services/cache';

// Get the global cache service instance
const cacheService = getCalculationCacheService();

// Use cached calculations (transparent to your existing code)
const financialCalcs = cacheService.financial;
const inventoryCalcs = cacheService.inventory;
const vendorMetrics = cacheService.vendor;

// Example: Cached tax calculation
const taxResult = await financialCalcs.calculateTax({
  subtotal: { amount: 100, currencyCode: 'USD' },
  taxRate: 10,
  taxIncluded: false
});

// Example: Cached stock valuation
const stockResult = await inventoryCalcs.calculateStockValuation({
  itemId: 'item-123',
  quantityOnHand: 500,
  costingMethod: 'FIFO'
});

// Example: Cached vendor performance
const vendorResult = await vendorMetrics.calculateVendorPerformance({
  vendorId: 'vendor-456',
  orders: [...orderData],
  timeframeDays: 365
});
```

## Configuration

### Custom Configuration

```typescript
import { createCalculationCacheService } from '@/lib/services/cache';

const cacheService = createCalculationCacheService({
  redis: {
    enabled: true,
    host: 'redis.example.com',
    port: 6379,
    password: 'secure-password',
    fallbackToMemory: true
  },
  memory: {
    maxMemoryMB: 200,
    maxEntries: 10000
  },
  ttl: {
    financial: 300,    // 5 minutes
    inventory: 900,    // 15 minutes
    vendor: 1800,      // 30 minutes
    default: 600       // 10 minutes
  },
  warming: {
    enabled: true,
    onStartup: true,
    scheduleIntervalHours: 12
  },
  monitoring: {
    enabled: true,
    metricsInterval: 300000, // 5 minutes
    logLevel: 'detailed'
  }
});
```

### TTL Configuration

Different calculation types have different TTL (time-to-live) settings based on how frequently the underlying data changes:

- **Financial**: 5 minutes (tax rates, currency rates change frequently)
- **Inventory**: 15 minutes (stock levels change moderately)
- **Vendor**: 30 minutes (performance metrics are relatively stable)

## Cache Invalidation

### Manual Invalidation

```typescript
// Invalidate financial caches when tax rates change
await cacheService.invalidateCaches({
  financial: {
    reason: 'Tax rates updated',
    userId: 'admin-123'
  }
});

// Invalidate inventory caches for specific items
await cacheService.invalidateCaches({
  inventory: {
    reason: 'Stock levels updated',
    itemIds: ['item-1', 'item-2', 'item-3'],
    userId: 'warehouse-manager'
  }
});

// Invalidate vendor caches for specific vendors
await cacheService.invalidateCaches({
  vendor: {
    reason: 'Performance review completed',
    vendorIds: ['vendor-1'],
    userId: 'procurement-manager'
  }
});
```

### Automatic Invalidation

The cache system automatically invalidates entries based on dependencies:

```typescript
// Example: When a purchase order is updated
const dependencies = [
  { type: 'entity', identifier: 'purchase_order:12345' },
  { type: 'entity', identifier: 'vendor:vendor-123' },
  { type: 'field', identifier: 'vendor_performance' }
];

// All calculations that depend on these entities will be invalidated
```

## Cache Warming

### Startup Warming

```typescript
// Automatically warm cache on service startup
const results = await cacheService.warmAllCaches({
  financial: {
    commonCurrencies: ['USD', 'EUR', 'GBP'],
    taxRates: [0, 5, 10, 15, 20],
    discountRates: [5, 10, 15, 20, 25]
  },
  inventory: {
    topItemIds: ['item-1', 'item-2', 'item-3'],
    commonQuantities: [10, 50, 100, 500],
    usageRates: [10, 25, 50, 100],
    leadTimes: [7, 14, 30]
  },
  vendor: {
    topVendorIds: ['vendor-1', 'vendor-2'],
    analysisTimeframes: [30, 90, 180, 365]
  }
});

console.log(`Cache warming completed: ${results.totalWarmed} warmed, ${results.totalFailed} failed`);
```

### Manual Warming

```typescript
// Warm specific service caches
await cacheService.financial.warmFinancialCache();
await cacheService.inventory.warmInventoryCache(['top-item-1', 'top-item-2']);
await cacheService.vendor.warmVendorCache(['key-vendor-1']);
```

## Monitoring and Health

### Health Checks

```typescript
const health = await cacheService.getHealthStatus();

console.log('Cache Health:', {
  status: health.status, // 'healthy' | 'degraded' | 'error'
  redis: {
    connected: health.redis.connected,
    errorCount: health.redis.errorCount
  },
  performance: {
    hitRate: health.performance.hitRate,
    averageResponseTime: health.performance.averageResponseTime
  }
});
```

### Performance Metrics

```typescript
const metrics = await cacheService.getMetrics();

console.log('Cache Metrics:', {
  redis: {
    hitRate: metrics.redis.hitRate,
    memoryUsage: metrics.redis.memoryUsage,
    keyCount: metrics.redis.keyCount
  },
  memory: {
    hitRate: metrics.memory.hitRate,
    totalEntries: metrics.memory.totalEntries,
    memoryUsage: metrics.memory.memoryUsage
  },
  combined: {
    overallHitRate: metrics.combined.overallHitRate,
    totalHits: metrics.combined.totalHits,
    totalMisses: metrics.combined.totalMisses
  },
  invalidation: {
    totalInvalidations: metrics.invalidation.totalInvalidations,
    keysInvalidated: metrics.invalidation.keysInvalidated
  }
});
```

## Integration Examples

### Financial Calculations

```typescript
// Tax calculation with automatic caching
const taxResult = await cacheService.financial.calculateTax({
  subtotal: { amount: 1000, currencyCode: 'USD' },
  taxRate: 8.5,
  taxIncluded: false
});

// Currency conversion with cache invalidation on rate changes
const conversionResult = await cacheService.financial.convertCurrency({
  amount: { amount: 100, currencyCode: 'USD' },
  toCurrency: 'EUR',
  exchangeRate: 0.85
});

// Line item calculation (combines tax and discount calculations)
const lineItemResult = await cacheService.financial.calculateLineItemTotal({
  quantity: 5,
  unitPrice: { amount: 25, currencyCode: 'USD' },
  taxRate: 10,
  discountRate: 5
});
```

### Inventory Calculations

```typescript
// Stock valuation with dependency tracking
const valuationResult = await cacheService.inventory.calculateStockValuation({
  itemId: 'laptop-001',
  quantityOnHand: 150,
  costingMethod: 'WEIGHTED_AVERAGE',
  averageCost: { amount: 800, currencyCode: 'USD' }
});

// Reorder point calculation
const reorderResult = await cacheService.inventory.calculateReorderPoint({
  averageMonthlyUsage: 50,
  leadTimeDays: 14,
  safetyStockDays: 7,
  seasonalityFactor: 1.2
});

// ABC analysis for multiple items
const abcResult = await cacheService.inventory.performABCAnalysis({
  items: [
    { itemId: 'item-1', annualValue: { amount: 10000, currencyCode: 'USD' }, annualUsage: 100 },
    { itemId: 'item-2', annualValue: { amount: 5000, currencyCode: 'USD' }, annualUsage: 200 }
  ],
  currencyCode: 'USD'
});
```

### Vendor Metrics

```typescript
// Vendor performance calculation
const performanceResult = await cacheService.vendor.calculateVendorPerformance({
  vendorId: 'supplier-abc',
  orders: [
    {
      orderId: 'po-001',
      orderDate: new Date('2024-01-15'),
      expectedDeliveryDate: new Date('2024-01-25'),
      actualDeliveryDate: new Date('2024-01-24'),
      orderValue: { amount: 5000, currencyCode: 'USD' },
      isDelivered: true,
      qualityScore: 4.5,
      isOnTime: true,
      itemsOrdered: 10,
      itemsReceived: 10,
      itemsAccepted: 9,
      itemsRejected: 1
    }
  ],
  timeframeDays: 365
});

// Vendor risk assessment
const riskResult = await cacheService.vendor.assessVendorRisk({
  vendorId: 'supplier-abc',
  financialData: {
    creditRating: 'A',
    annualRevenue: { amount: 1000000, currencyCode: 'USD' },
    debtToEquityRatio: 0.3
  },
  riskFactors: {
    geopoliticalRisk: 'low',
    supplierDependency: 'medium'
  }
});
```

## Error Handling

The cache system is designed to be resilient:

```typescript
try {
  const result = await cacheService.financial.calculateTax(input);
  // Use result
} catch (error) {
  // Cache failures fall back to direct computation
  // Your application continues to work even if cache is down
  console.error('Calculation failed:', error);
}
```

## Best Practices

### 1. Use Appropriate TTL Values

```typescript
// Short TTL for frequently changing data
financial: 300,  // 5 minutes

// Medium TTL for moderately stable data
inventory: 900,  // 15 minutes

// Long TTL for stable data
vendor: 1800,    // 30 minutes
```

### 2. Implement Cache Invalidation Triggers

```typescript
// In your data update handlers
async function updateTaxRates(newRates) {
  // Update database
  await saveTaxRates(newRates);
  
  // Invalidate related caches
  await cacheService.invalidateCaches({
    financial: {
      reason: 'Tax rates updated',
      userId: getCurrentUser().id
    }
  });
}
```

### 3. Monitor Cache Performance

```typescript
// Regular health monitoring
setInterval(async () => {
  const health = await cacheService.getHealthStatus();
  
  if (health.status === 'error') {
    // Alert administrators
    console.error('Cache service error:', health);
  } else if (health.status === 'degraded') {
    // Log warning
    console.warn('Cache service degraded:', health.performance);
  }
}, 300000); // Check every 5 minutes
```

### 4. Graceful Shutdown

```typescript
// In your application shutdown handler
process.on('SIGTERM', async () => {
  await cacheService.shutdown();
  // Continue with other shutdown tasks
});
```

## Testing

The cache services include comprehensive test coverage:

```bash
# Run cache tests
npm test -- lib/services/cache

# Run specific test files
npm test -- lib/services/cache/__tests__/enhanced-cache-layer.test.ts
npm test -- lib/services/cache/__tests__/calculation-cache-service.test.ts
npm test -- lib/services/cache/__tests__/redis-cache-provider.test.ts
```

## Performance Impact

Expected performance improvements with caching:

- **Cache Hit**: ~1-5ms response time (vs 50-200ms for complex calculations)
- **Memory Usage**: ~50-100MB for typical workloads
- **Redis Usage**: ~10-50MB depending on cache size and data complexity
- **Hit Rate**: 70-90% for typical calculation patterns

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**
   - Check Redis server status
   - Verify connection credentials
   - System falls back to memory-only caching

2. **High Memory Usage**
   - Adjust `maxMemoryMB` configuration
   - Reduce TTL values
   - Increase cleanup intervals

3. **Low Hit Rates**
   - Review cache warming strategy
   - Check invalidation frequency
   - Adjust TTL values

4. **Performance Degradation**
   - Monitor Redis server performance
   - Check network latency to Redis
   - Consider Redis clustering for high load

### Debug Logging

Enable detailed logging in development:

```typescript
const cacheService = createCalculationCacheService({
  monitoring: {
    enabled: true,
    logLevel: 'detailed'
  }
});
```

## Migration Guide

### From Direct Service Usage

**Before:**
```typescript
import { FinancialCalculations } from '@/lib/services/calculations/financial-calculations';

const financialCalcs = new FinancialCalculations();
const result = await financialCalcs.calculateTax(input);
```

**After:**
```typescript
import { getCalculationCacheService } from '@/lib/services/cache';

const cacheService = getCalculationCacheService();
const result = await cacheService.financial.calculateTax(input);
```

### Gradual Migration

You can migrate gradually by using cached services only for specific calculations:

```typescript
// Use cached version for expensive operations
const taxResult = await cacheService.financial.calculateTax(input);

// Continue using direct service for simple operations
const directCalc = new FinancialCalculations();
const simpleResult = await directCalc.addMoney([amount1, amount2]);
```