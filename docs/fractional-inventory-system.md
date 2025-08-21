# Fractional Inventory Management System

## Overview

The Fractional Inventory Management System is a comprehensive solution designed specifically for hospitality businesses that need to track and manage items that can be sold in portions or fractions. This system is particularly valuable for restaurants, cafes, and catering businesses that deal with items like pizzas, cakes, bulk containers, and other divisible products.

## Key Features

### 1. Multi-State Inventory Tracking
- **RAW**: Original whole items in their initial state
- **PREPARED**: Items that have been prepared/processed but not portioned
- **PORTIONED**: Items divided into sellable portions
- **PARTIAL**: Partially consumed items with remaining portions
- **COMBINED**: Multiple portions combined back into bulk items
- **WASTE**: Items marked as waste due to quality degradation or other reasons

### 2. Advanced Conversion Operations
- **Splitting**: Convert whole items into multiple portions
- **Combining**: Merge multiple portions back into whole units
- **State Transitions**: Automated and manual state changes
- **Quality Tracking**: Monitor quality degradation throughout the lifecycle
- **Waste Management**: Track and minimize waste at every conversion stage

### 3. Smart Alerts and Recommendations
- **Portion Availability Warnings**: Alerts when portion levels are low
- **Quality Degradation Alerts**: Notifications for declining quality
- **Optimal Conversion Timing**: Recommendations for best conversion windows
- **Waste Reduction Suggestions**: AI-powered waste minimization advice
- **Demand-Based Recommendations**: Conversion suggestions based on predicted demand

### 4. Real-Time Visual Tracking
- **Portion Utilization Charts**: Visual representation of portion usage
- **Multi-State Dashboard**: Overview of items in different states
- **Conversion Flow Visualization**: Track item transformations
- **Quality Indicators**: Real-time quality status for each item
- **Availability Tracking**: Live updates on portion availability

## System Architecture

### Core Components

#### 1. Data Models (`/lib/types/fractional-inventory.ts`)
- **FractionalItem**: Configuration for items that support fractional sales
- **FractionalStock**: Current state and quantities of inventory items
- **ConversionRecord**: Detailed history of all conversion operations
- **InventoryAlert**: Smart alerts and recommendations
- **ConversionRule**: Automated conversion rules and triggers

#### 2. Business Logic Services

##### FractionalInventoryService (`/lib/services/fractional-inventory-service.ts`)
Core business logic for inventory operations:
```typescript
// Split operations
await fractionalInventoryService.splitItem(stockId, quantity, portionSizeId, performedBy, reason)

// Combine operations
await fractionalInventoryService.combinePortions(stockId, portions, performedBy, reason)

// Prepare raw items
await fractionalInventoryService.prepareItems(stockId, quantity, performedBy, notes)

// Quality management
await fractionalInventoryService.updateQualityGrade(stockId, performedBy, notes)

// Get comprehensive metrics
const metrics = await fractionalInventoryService.calculateInventoryMetrics(locationId)
```

##### FractionalInventoryOperations (`/lib/services/fractional-inventory-operations.ts`)
Advanced operations and optimization:
```typescript
// Optimized splitting with waste minimization
await fractionalInventoryOperations.optimizedSplitOperation(stockId, targetPortions, context)

// Smart combining with quality consideration
await fractionalInventoryOperations.smartCombineOperation(stockIds, targetWholeUnits, context)

// Batch operations for efficiency
await fractionalInventoryOperations.batchSplitOperation(operations, context)

// Cross-location transfers and combining
await fractionalInventoryOperations.crossLocationCombine(sourceLocations, targetLocation, units, context)
```

##### FractionalAlertsEngine (`/lib/services/fractional-alerts-engine.ts`)
AI-powered alerts and recommendations:
```typescript
// Process alerts for all stocks
const alerts = await fractionalAlertsEngine.processAlertsForStocks(stocks, items, metrics)

// Generate conversion recommendations
const recommendations = await fractionalAlertsEngine.generateConversionRecommendations(stocks, items)

// Predictive analytics
const demandPattern = fractionalAlertsEngine.getDemandPattern(itemId)
const qualityPrediction = fractionalAlertsEngine.getQualityPrediction(stockId)
```

#### 3. User Interface Components

##### Dashboard (`/app/(main)/inventory-management/fractional-inventory/components/fractional-inventory-dashboard.tsx`)
- Real-time inventory overview with visual portion tracking
- Quality indicators and time-to-expiry warnings
- Quick action buttons for split/combine operations
- Alert summaries and recommendations

##### Conversion Operations Modal (`/app/(main)/inventory-management/fractional-inventory/components/conversion-operations-modal.tsx`)
- Interactive conversion planning with real-time preview
- Impact analysis showing efficiency, waste, and cost implications
- Risk assessment and recommendations
- Validation and error handling

##### Conversion Tracking Panel (`/app/(main)/inventory-management/fractional-inventory/components/conversion-tracking-panel.tsx`)
- Complete audit trail of all conversion operations
- Timeline view with detailed operation history
- Analytics dashboard with efficiency metrics
- Export capabilities for compliance reporting

## Usage Examples

### Basic Splitting Operation
```typescript
// Split 3 whole pizzas into 8-slice portions
const conversionResult = await fractionalInventoryService.splitItem(
  'pizza-stock-123',
  3,                    // 3 whole pizzas
  'slice-8',           // Into 8-slice portions
  'chef@restaurant.com',
  'Lunch rush preparation'
)

// Result: 3 whole pizzas → ~23 slices (allowing for 5% waste)
console.log(`Created ${conversionResult.afterTotalPortions} portions`)
console.log(`Waste generated: ${conversionResult.wasteGenerated}`)
console.log(`Conversion efficiency: ${conversionResult.conversionEfficiency * 100}%`)
```

### Smart Combining with Quality Consideration
```typescript
// Combine leftover portions from multiple stocks
const combineResult = await fractionalInventoryOperations.smartCombineOperation(
  ['stock-1', 'stock-2', 'stock-3'], // Multiple stock IDs
  2,                                  // Target: 2 whole units
  {
    performedBy: 'manager@restaurant.com',
    reason: 'End of day consolidation',
    notes: 'Combining fair quality portions'
  }
)

console.log(`Success: ${combineResult.success}`)
console.log(`Efficiency: ${combineResult.optimization.efficiencyScore}`)
console.log(`Quality impact: ${combineResult.optimization.qualityImpact}`)
```

### Automated Alert Processing
```typescript
// Process all active stocks for alerts
const alerts = await fractionalAlertsEngine.processAlertsForStocks(
  activeStocks,
  fractionalItems,
  currentMetrics
)

// Handle critical alerts
const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL')
for (const alert of criticalAlerts) {
  console.log(`CRITICAL: ${alert.title}`)
  console.log(`Action required: ${alert.recommendedActions[0].description}`)
  
  // Auto-execute critical conversions if configured
  if (alert.type === 'PORTION_LOW' && autoConversionEnabled) {
    await executeRecommendedConversion(alert.recommendedActions[0])
  }
}
```

## Configuration and Customization

### Item Configuration
```typescript
const fractionalItem: FractionalItem = {
  id: 'pizza-margherita-large',
  itemCode: 'PIZZA-MAR-L',
  itemName: 'Margherita Pizza (Large)',
  category: 'Food',
  baseUnit: 'Whole Pizza',
  
  // Fractional settings
  supportsFractional: true,
  allowPartialSales: true,
  trackPortions: true,
  
  // Available portion sizes
  availablePortions: [
    { id: 'slice-8', name: 'Slice', portionsPerWhole: 8, isActive: true },
    { id: 'half-2', name: 'Half', portionsPerWhole: 2, isActive: true },
    { id: 'quarter-4', name: 'Quarter', portionsPerWhole: 4, isActive: true }
  ],
  defaultPortionId: 'slice-8',
  
  // Quality and time constraints
  shelfLifeHours: 4,        // 4 hours shelf life after preparation
  maxQualityHours: 2,       // 2 hours at maximum quality
  temperatureRequired: 65,   // Storage temperature in Celsius
  
  // Conversion settings
  allowAutoConversion: true,
  wastePercentage: 5,       // Expected 5% waste during conversion
  
  // Costing
  baseCostPerUnit: 250,     // 250 baht per whole pizza
  conversionCostPerUnit: 10 // 10 baht conversion cost
}
```

### Alert Rule Configuration
```typescript
// Custom alert rule for peak hour conversion
fractionalAlertsEngine.addCustomAlertRule({
  id: 'peak-hour-conversion',
  name: 'Peak Hour Conversion Opportunity',
  type: 'CONVERSION_RECOMMENDED',
  severity: 'MEDIUM',
  condition: (stock, item, metrics) => {
    const currentHour = new Date().getHours()
    const isPeakHour = (currentHour >= 11 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21)
    return isPeakHour && stock.wholeUnitsAvailable >= 2 && stock.totalPortionsAvailable < 10
  },
  message: (stock, item) => 
    `Peak hour detected. Consider converting ${Math.min(stock.wholeUnitsAvailable, 3)} whole ${item.itemName} to portions`,
  actions: (stock, item) => [
    {
      action: 'CONVERT',
      priority: 1,
      description: 'Convert for peak demand',
      estimatedImpact: 'Reduce wait times during busy periods'
    }
  ],
  priority: 7,
  isActive: true
})
```

## Performance and Scalability

### Optimization Features
1. **Batch Operations**: Process multiple conversions in a single transaction
2. **Predictive Caching**: Cache frequently accessed conversion patterns
3. **Parallel Processing**: Execute independent operations concurrently
4. **Smart Queuing**: Optimize conversion order for minimal waste
5. **Real-time Updates**: WebSocket integration for live dashboard updates

### Monitoring and Analytics
1. **Conversion Efficiency Tracking**: Monitor waste percentages and optimization opportunities
2. **Quality Degradation Analysis**: Identify patterns in quality decline
3. **Demand Prediction**: Machine learning-based demand forecasting
4. **Cost Analysis**: Track conversion costs and ROI
5. **Compliance Reporting**: Automated reports for food safety compliance

## Integration Points

### POS Integration
```typescript
// When a fractional sale is made
const saleResult = await processFractionalSale({
  stockId: 'pizza-stock-123',
  portionsRequested: 3,
  customerId: 'customer-456'
})

// Automatically updates available portions and reserves inventory
```

### Recipe Management Integration
```typescript
// Link fractional items to recipes for automated conversion planning
const recipeConversions = await planRecipeBasedConversions({
  recipeId: 'dinner-menu-friday',
  expectedCovers: 150,
  mealPeriod: 'dinner'
})
```

### Financial System Integration
```typescript
// Cost accounting for fractional inventory
const costAnalysis = await calculateFractionalCosts({
  period: 'monthly',
  includeWaste: true,
  includeConversionCosts: true
})
```

## Best Practices

### Operational Guidelines
1. **Regular Quality Checks**: Implement scheduled quality assessments
2. **Conversion Timing**: Convert during low-demand periods when possible
3. **Waste Monitoring**: Track waste patterns and adjust processes
4. **Staff Training**: Ensure proper understanding of conversion procedures
5. **Documentation**: Maintain detailed records for compliance and optimization

### Technical Best Practices
1. **Error Handling**: Implement comprehensive error handling and rollback mechanisms
2. **Data Validation**: Validate all inputs before processing conversions
3. **Audit Trails**: Maintain complete audit trails for all operations
4. **Performance Monitoring**: Monitor system performance and optimize bottlenecks
5. **Testing**: Implement comprehensive unit and integration tests

## Troubleshooting

### Common Issues and Solutions

**Conversion Efficiency Below Expected**
- Check preparation procedures for consistency
- Review staff training on portion cutting
- Analyze equipment calibration
- Consider adjusting waste percentage settings

**Quality Degradation Faster Than Expected**
- Verify storage temperature and conditions
- Review handling procedures
- Check expiration time settings
- Implement more frequent quality checks

**Alert Fatigue**
- Review alert thresholds and adjust sensitivity
- Consolidate similar alerts
- Implement alert prioritization
- Add snooze functionality for non-critical alerts

**Performance Issues**
- Enable database indexing on frequently queried fields
- Implement caching for read-heavy operations
- Use batch operations for bulk updates
- Consider database partitioning for large datasets

## Testing and Validation

### Unit Tests
Run the comprehensive test suite:
```bash
npm test lib/services/__tests__/fractional-inventory-service.test.ts
```

### Integration Tests
```bash
npm test app/(main)/inventory-management/fractional-inventory/__tests__/
```

### Performance Tests
```bash
npm run test:performance
```

## Security Considerations

1. **Access Control**: Implement role-based access for conversion operations
2. **Audit Logging**: Log all operations with user attribution
3. **Data Validation**: Validate all inputs to prevent injection attacks
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Encryption**: Encrypt sensitive data at rest and in transit

## Future Enhancements

### Planned Features
1. **Mobile App Integration**: Native mobile app for floor staff
2. **IoT Sensor Integration**: Automatic quality monitoring via sensors
3. **Machine Learning**: Advanced demand prediction and waste optimization
4. **Voice Commands**: Voice-activated conversion operations
5. **Blockchain Integration**: Immutable audit trails for compliance

### API Roadmap
1. **GraphQL API**: More flexible API for complex queries
2. **Webhook Support**: Real-time notifications for external systems
3. **Bulk Import/Export**: Enhanced data management capabilities
4. **Advanced Analytics**: Business intelligence dashboard
5. **Multi-tenant Support**: Support for franchise operations

This fractional inventory management system provides a comprehensive solution for hospitality businesses to efficiently manage portioned items, minimize waste, optimize conversions, and maintain high-quality standards throughout the entire inventory lifecycle.