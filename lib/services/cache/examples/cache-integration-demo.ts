/**
 * Cache Integration Demo
 * 
 * Demonstrates how to integrate and use the comprehensive caching layer
 * for calculation services in a real application scenario.
 */

import { getCalculationCacheService } from '../calculation-cache-service';
import { Money } from '@/lib/types';

/**
 * Demo: Financial calculations with caching
 */
export async function demoFinancialCalculations() {
  console.log('🧮 Financial Calculations Demo');
  console.log('================================');

  const cacheService = getCalculationCacheService();
  const financial = cacheService.financial;

  // Demo: Tax calculation
  console.log('\n1. Tax Calculation');
  const subtotal: Money = { amount: 100, currencyCode: 'USD' };
  const startTime = Date.now();

  const taxResult = await financial.calculateTax({
    subtotal,
    taxRate: 8.5,
    taxIncluded: false
  });

  const duration = Date.now() - startTime;
  console.log(`   Result: ${taxResult.value.totalAmount.amount} ${taxResult.value.totalAmount.currencyCode}`);
  console.log(`   Duration: ${duration}ms (first call - computed)`);

  // Second call should be cached
  const startTime2 = Date.now();
  const cachedTaxResult = await financial.calculateTax({
    subtotal,
    taxRate: 8.5,
    taxIncluded: false
  });
  const duration2 = Date.now() - startTime2;
  console.log(`   Duration: ${duration2}ms (second call - cached)`);

  // Demo: Currency conversion
  console.log('\n2. Currency Conversion');
  const conversionResult = await financial.convertCurrency({
    amount: { amount: 100, currencyCode: 'USD' },
    toCurrency: 'EUR',
    exchangeRate: 0.85
  });
  console.log(`   Converted: ${conversionResult.value.convertedAmount.amount} ${conversionResult.value.convertedAmount.currencyCode}`);

  // Demo: Line item calculation (complex calculation)
  console.log('\n3. Line Item Total');
  const lineItemResult = await financial.calculateLineItemTotal({
    quantity: 5,
    unitPrice: { amount: 20, currencyCode: 'USD' },
    taxRate: 8.5,
    discountRate: 10,
    taxIncluded: false
  });
  console.log(`   Line Total: ${lineItemResult.value.totalAmount.amount} ${lineItemResult.value.totalAmount.currencyCode}`);
  console.log(`   Breakdown: Subtotal ${lineItemResult.value.subtotal.amount}, Discount ${lineItemResult.value.discountAmount.amount}, Tax ${lineItemResult.value.taxAmount.amount}`);
}

/**
 * Demo: Inventory calculations with caching
 */
export async function demoInventoryCalculations() {
  console.log('\n📦 Inventory Calculations Demo');
  console.log('==============================');

  const cacheService = getCalculationCacheService();
  const inventory = cacheService.inventory;

  // Demo: Stock valuation
  console.log('\n1. Stock Valuation');
  const valuationResult = await inventory.calculateStockValuation({
    itemId: 'laptop-001',
    quantityOnHand: 50,
    costingMethod: 'WEIGHTED_AVERAGE',
    averageCost: { amount: 800, currencyCode: 'USD' }
  });
  console.log(`   Item: ${valuationResult.value.itemId}`);
  console.log(`   Quantity: ${valuationResult.value.quantityOnHand} units`);
  console.log(`   Unit Cost: ${valuationResult.value.unitCost.amount} ${valuationResult.value.unitCost.currencyCode}`);
  console.log(`   Total Value: ${valuationResult.value.totalValue.amount} ${valuationResult.value.totalValue.currencyCode}`);

  // Demo: Available quantity calculation
  console.log('\n2. Available Quantity');
  const availableResult = await inventory.calculateAvailableQuantity({
    quantityOnHand: 100,
    quantityReserved: 25,
    quantityOnOrder: 50,
    includeOnOrder: true
  });
  console.log(`   On Hand: ${availableResult.value.quantityOnHand}`);
  console.log(`   Reserved: ${availableResult.value.quantityReserved}`);
  console.log(`   Available: ${availableResult.value.quantityAvailable}`);
  console.log(`   On Order: ${availableResult.value.quantityOnOrder}`);
  console.log(`   Total Projected: ${availableResult.value.totalProjected}`);

  // Demo: Reorder point calculation
  console.log('\n3. Reorder Point');
  const reorderResult = await inventory.calculateReorderPoint({
    averageMonthlyUsage: 120,
    leadTimeDays: 14,
    safetyStockDays: 7,
    seasonalityFactor: 1.2
  });
  console.log(`   Reorder Point: ${reorderResult.value.reorderPoint} units`);
  console.log(`   Safety Stock: ${reorderResult.value.safetyStock} units`);
  console.log(`   Lead Time Stock: ${reorderResult.value.leadTimeStock} units`);
  console.log(`   Recommended Order Qty: ${reorderResult.value.recommendedOrderQuantity} units`);

  // Demo: ABC Analysis
  console.log('\n4. ABC Analysis');
  const abcResult = await inventory.performABCAnalysis({
    items: [
      { itemId: 'laptop-001', annualValue: { amount: 50000, currencyCode: 'USD' }, annualUsage: 60 },
      { itemId: 'mouse-002', annualValue: { amount: 1000, currencyCode: 'USD' }, annualUsage: 200 },
      { itemId: 'keyboard-003', annualValue: { amount: 5000, currencyCode: 'USD' }, annualUsage: 100 },
      { itemId: 'monitor-004', annualValue: { amount: 15000, currencyCode: 'USD' }, annualUsage: 40 }
    ],
    currencyCode: 'USD'
  });
  
  abcResult.value.forEach(item => {
    console.log(`   ${item.itemId}: Class ${item.classification}, Value ${item.annualValue.amount}, Usage ${item.annualUsage}, Rank ${item.rank}`);
  });
}

/**
 * Demo: Vendor metrics with caching
 */
export async function demoVendorMetrics() {
  console.log('\n🤝 Vendor Metrics Demo');
  console.log('======================');

  const cacheService = getCalculationCacheService();
  const vendor = cacheService.vendor;

  // Demo: Vendor performance calculation
  console.log('\n1. Vendor Performance');
  const performanceResult = await vendor.calculateVendorPerformance({
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
        itemsRejected: 1,
        daysLate: 0,
        defectRate: 10
      },
      {
        orderId: 'po-002',
        orderDate: new Date('2024-02-01'),
        expectedDeliveryDate: new Date('2024-02-10'),
        actualDeliveryDate: new Date('2024-02-12'),
        orderValue: { amount: 3000, currencyCode: 'USD' },
        isDelivered: true,
        qualityScore: 4.0,
        isOnTime: false,
        itemsOrdered: 8,
        itemsReceived: 8,
        itemsAccepted: 8,
        itemsRejected: 0,
        daysLate: 2,
        defectRate: 0
      }
    ],
    timeframeDays: 90
  });

  console.log(`   Vendor: ${performanceResult.value.vendorId}`);
  console.log(`   Period: ${performanceResult.value.calculationPeriod.orderCount} orders`);
  console.log(`   On-time Delivery: ${performanceResult.value.deliveryMetrics.onTimeDeliveryRate}%`);
  console.log(`   Quality Rating: ${performanceResult.value.qualityMetrics.qualityRating}/5`);
  console.log(`   Overall Rating: ${performanceResult.value.overallRating}/5`);
  console.log(`   Risk Score: ${performanceResult.value.riskScore}/100`);
  console.log(`   Recommendations: ${performanceResult.value.recommendations.join(', ')}`);

  // Demo: Risk assessment
  console.log('\n2. Vendor Risk Assessment');
  const riskResult = await vendor.assessVendorRisk({
    vendorId: 'supplier-abc',
    financialData: {
      creditRating: 'A-',
      annualRevenue: { amount: 2000000, currencyCode: 'USD' },
      debtToEquityRatio: 0.4,
      profitMargin: 12
    },
    performanceHistory: {
      averageDeliveryTime: 8.5,
      qualityRating: 4.2,
      orderFulfillmentRate: 96
    },
    riskFactors: {
      geopoliticalRisk: 'low',
      supplierDependency: 'medium',
      financialStability: 'high'
    }
  });

  console.log(`   Overall Risk Score: ${riskResult.value.overallRiskScore}/100`);
  console.log(`   Risk Category: ${riskResult.value.riskCategory}`);
  console.log(`   Financial Risk: ${riskResult.value.riskFactors.financial.score} (${riskResult.value.riskFactors.financial.impact})`);
  console.log(`   Operational Risk: ${riskResult.value.riskFactors.operational.score} (${riskResult.value.riskFactors.operational.impact})`);
  console.log(`   Next Review: ${riskResult.value.nextReviewDate.toDateString()}`);
}

/**
 * Demo: Cache management operations
 */
export async function demoCacheManagement() {
  console.log('\n⚡ Cache Management Demo');
  console.log('========================');

  const cacheService = getCalculationCacheService();

  // Demo: Cache metrics
  console.log('\n1. Cache Metrics');
  const metrics = await cacheService.getMetrics();
  console.log(`   Redis Connected: ${metrics.redis.connected}`);
  console.log(`   Redis Hit Rate: ${metrics.redis.hitRate}%`);
  console.log(`   Memory Hit Rate: ${metrics.memory.hitRate}%`);
  console.log(`   Overall Hit Rate: ${metrics.combined.overallHitRate}%`);
  console.log(`   Total Cache Entries: ${metrics.memory.totalEntries}`);
  console.log(`   Total Invalidations: ${metrics.invalidation.totalInvalidations}`);

  // Demo: Health status
  console.log('\n2. Health Status');
  const health = await cacheService.getHealthStatus();
  console.log(`   Status: ${health.status}`);
  console.log(`   Redis Connected: ${health.redis.connected}`);
  console.log(`   Memory Usage: ${(health.memory.usage / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Entry Count: ${health.memory.entryCount}`);
  console.log(`   Hit Rate: ${health.performance.hitRate}%`);
  console.log(`   Avg Response Time: ${health.performance.averageResponseTime}ms`);

  // Demo: Cache invalidation
  console.log('\n3. Cache Invalidation');
  const invalidationResult = await cacheService.invalidateCaches({
    financial: {
      reason: 'Demo: Tax rates updated',
      userId: 'demo-user'
    },
    inventory: {
      reason: 'Demo: Stock levels refreshed',
      itemIds: ['laptop-001', 'mouse-002'],
      userId: 'demo-user'
    }
  });
  console.log(`   Total Invalidated: ${invalidationResult.totalInvalidated} entries`);
  console.log(`   Financial: ${invalidationResult.results.financial || 0} entries`);
  console.log(`   Inventory: ${invalidationResult.results.inventory || 0} entries`);

  // Demo: Cache warming
  console.log('\n4. Cache Warming');
  console.log('   Starting cache warming...');
  const startWarmingTime = Date.now();
  
  const warmingResult = await cacheService.warmAllCaches({
    financial: {
      commonCurrencies: ['USD', 'EUR'],
      taxRates: [0, 8.5, 10],
      discountRates: [5, 10, 15]
    },
    inventory: {
      topItemIds: ['laptop-001', 'mouse-002'],
      commonQuantities: [10, 50, 100],
      usageRates: [10, 25, 50],
      leadTimes: [7, 14]
    },
    vendor: {
      topVendorIds: ['supplier-abc'],
      analysisTimeframes: [30, 90]
    }
  });

  const warmingDuration = Date.now() - startWarmingTime;
  console.log(`   Warming completed in ${warmingDuration}ms`);
  console.log(`   Financial: ${warmingResult.financial.warmed} warmed, ${warmingResult.financial.failed} failed`);
  console.log(`   Inventory: ${warmingResult.inventory.warmed} warmed, ${warmingResult.inventory.failed} failed`);
  console.log(`   Vendor: ${warmingResult.vendor.warmed} warmed, ${warmingResult.vendor.failed} failed`);
  console.log(`   Total: ${warmingResult.totalWarmed} warmed, ${warmingResult.totalFailed} failed`);
}

/**
 * Demo: Performance comparison
 */
export async function demoPerformanceComparison() {
  console.log('\n🚀 Performance Comparison Demo');
  console.log('===============================');

  const cacheService = getCalculationCacheService();

  // Test calculation parameters
  const testInputs = [
    { subtotal: { amount: 100, currencyCode: 'USD' }, taxRate: 8.5 },
    { subtotal: { amount: 250, currencyCode: 'EUR' }, taxRate: 20 },
    { subtotal: { amount: 500, currencyCode: 'USD' }, taxRate: 10 },
    { subtotal: { amount: 75, currencyCode: 'GBP' }, taxRate: 15 }
  ];

  console.log('\n1. Cold Cache Performance (First Calls)');
  const coldStartTime = Date.now();
  
  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i];
    const start = Date.now();
    await cacheService.financial.calculateTax({ ...input, taxIncluded: false });
    const duration = Date.now() - start;
    console.log(`   Test ${i + 1}: ${duration}ms`);
  }
  
  const coldTotalTime = Date.now() - coldStartTime;
  console.log(`   Total cold time: ${coldTotalTime}ms`);

  console.log('\n2. Warm Cache Performance (Cached Calls)');
  const warmStartTime = Date.now();
  
  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i];
    const start = Date.now();
    await cacheService.financial.calculateTax({ ...input, taxIncluded: false });
    const duration = Date.now() - start;
    console.log(`   Test ${i + 1}: ${duration}ms (cached)`);
  }
  
  const warmTotalTime = Date.now() - warmStartTime;
  console.log(`   Total warm time: ${warmTotalTime}ms`);

  const speedupRatio = coldTotalTime / warmTotalTime;
  console.log(`\n   💡 Performance Improvement: ${speedupRatio.toFixed(2)}x faster with cache`);
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  try {
    console.log('🎯 Calculation Cache Service Demo');
    console.log('==================================\n');
    
    console.log('This demo showcases the comprehensive caching layer for calculation services.');
    console.log('The system provides Redis primary storage with in-memory fallback for maximum performance.\n');

    // Run individual demos
    await demoFinancialCalculations();
    await demoInventoryCalculations();
    await demoVendorMetrics();
    await demoCacheManagement();
    await demoPerformanceComparison();

    // Final metrics
    const cacheService = getCalculationCacheService();
    const finalMetrics = await cacheService.getMetrics();
    
    console.log('\n📊 Final Cache Statistics');
    console.log('==========================');
    console.log(`Total Hits: ${finalMetrics.combined.totalHits}`);
    console.log(`Total Misses: ${finalMetrics.combined.totalMisses}`);
    console.log(`Overall Hit Rate: ${finalMetrics.combined.overallHitRate}%`);
    console.log(`Cache Entries: ${finalMetrics.memory.totalEntries}`);

    console.log('\n✅ Demo completed successfully!');
    console.log('\nThe caching system demonstrates:');
    console.log('• Transparent integration with existing calculation services');
    console.log('• Significant performance improvements through intelligent caching');
    console.log('• Robust error handling and fallback mechanisms');
    console.log('• Comprehensive monitoring and health checking');
    console.log('• Flexible cache invalidation and warming strategies');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
  }
}

// Export individual demos for testing
export {
  demoFinancialCalculations,
  demoInventoryCalculations,
  demoVendorMetrics,
  demoCacheManagement,
  demoPerformanceComparison
};

// Run demo if executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}