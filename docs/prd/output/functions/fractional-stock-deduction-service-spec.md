# Fractional Stock Deduction Service Functional Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview
The Fractional Stock Deduction Service is a specialized inventory management component designed to handle complex stock calculations when fractional products are sold through Point of Sale (POS) systems. This service supports scenarios such as selling pizza slices from whole pizzas, cake portions from whole cakes, and other fractional product sales while maintaining accurate inventory levels and cost tracking.

## Component Architecture

### Primary Components
- **FractionalStockDeductionService**: Main service class handling transaction processing
- **Transaction Processing Engine**: Manages individual POS transaction calculations
- **Batch Processing System**: Handles multiple transactions in sequence
- **Simulation Engine**: Provides feasibility checking without committing changes
- **Variance Analysis Module**: Calculates theoretical vs actual consumption differences

### Design Patterns
- **Service Layer Pattern**: Encapsulates business logic in dedicated service class
- **Strategy Pattern**: Different calculation strategies for various fractional sales types
- **Factory Pattern**: Creates appropriate calculation instances based on product type
- **Transaction Pattern**: Ensures atomic operations for batch processing

## Core Functionality

### Function 1: Process Transaction
- **Purpose**: Processes a single POS transaction and calculates all required stock deductions
- **Inputs**: 
  - `POSTransaction`: Transaction details (ID, item code, quantity, price, location)
  - `RecipeMapping`: Maps POS items to recipe variants
  - `Recipe`: Base recipe with yield variants
  - `Map<string, number>`: Current inventory levels by item ID
- **Processing**: 
  1. Validates recipe variant exists
  2. Calculates base recipe quantity needed using conversion rate
  3. Applies variant-specific wastage rates
  4. Processes each ingredient deduction with wastage calculations
  5. Updates inventory levels
  6. Tracks costs and inventory impacts
- **Outputs**: 
  - `StockDeductionResult`: Complete transaction processing results including success status, errors, deductions, costs, and inventory impacts

### Function 2: Process Batch Transactions
- **Purpose**: Handles multiple POS transactions in chronological order with cumulative inventory tracking
- **Inputs**:
  - `POSTransaction[]`: Array of transactions to process
  - `Map<string, RecipeMapping>`: POS item to recipe mappings
  - `Map<string, Recipe>`: Recipe definitions
  - `Map<string, number>`: Initial inventory levels
- **Processing**:
  1. Sorts transactions by timestamp
  2. Processes each transaction sequentially
  3. Updates working inventory after each transaction
  4. Accumulates totals and statistics
- **Outputs**:
  - Array of individual transaction results
  - Final inventory state
  - Batch summary with totals and statistics

### Function 3: Simulate Deduction
- **Purpose**: Performs feasibility analysis without committing inventory changes
- **Inputs**: Same as Process Transaction but inventory is cloned
- **Processing**:
  1. Clones current inventory to avoid mutations
  2. Runs full transaction processing on cloned data
  3. Analyzes results for feasibility
- **Outputs**:
  - Feasibility boolean
  - List of potential issues
  - Estimated costs
  - Required ingredient details with shortfall analysis

### Function 4: Calculate Variance Report
- **Purpose**: Analyzes theoretical vs actual consumption patterns over a period
- **Inputs**:
  - `StockDeductionResult[]`: Historical transaction results
  - Date range for analysis period
- **Processing**:
  1. Aggregates consumption data by ingredient
  2. Calculates theoretical usage based on recipes
  3. Compares with actual deductions including wastage
  4. Computes variance percentages
- **Outputs**:
  - Period summary with total theoretical vs actual consumption
  - Per-ingredient variance analysis
  - Overall wastage percentage

## Data Models

### Core Interfaces

```typescript
interface POSTransaction {
  id: string
  posItemCode: string
  quantitySold: number
  salePrice: number
  timestamp: Date
  location: string
  cashier: string
}

interface StockDeductionResult {
  transactionId: string
  success: boolean
  errors: string[]
  deductions: RecipeDeduction[]
  totalCost: number
  totalWastage: number
  inventoryImpacts: InventoryImpact[]
}

interface RecipeDeduction {
  recipeId: string
  recipeName: string
  variantId: string
  variantName: string
  quantityProduced: number    // Theoretical base recipe usage
  quantityConsumed: number    // Actual usage including wastage
  conversionRate: number
  unitCost: number
  totalCost: number
  ingredientDeductions: IngredientDeduction[]
}

interface IngredientDeduction {
  ingredientId: string
  ingredientName: string
  type: 'product' | 'recipe'
  quantityRequired: number     // Recipe requirement
  quantityDeducted: number     // Actual deduction including wastage
  unit: string
  costPerUnit: number
  totalCost: number
  wastageRate: number
  wastageQuantity: number
  availableStock: number
  stockAfterDeduction: number
  stockShortfall?: number     // Only present if insufficient stock
}

interface InventoryImpact {
  itemId: string
  itemName: string
  type: 'product' | 'recipe'
  previousStock: number
  quantityDeducted: number
  newStock: number
  unit: string
  location: string
  timestamp: Date
  reason: string
  reference: string
}
```

## Integration Points

### POS System Integration
- **Input**: Real-time POS transaction data via REST API or message queue
- **Mapping Service**: Utilizes Recipe Mapping Service to translate POS items to recipes
- **Inventory Service**: Updates inventory levels through Inventory Management API

### Recipe Management System
- **Recipe Retrieval**: Fetches recipe definitions and yield variants
- **Conversion Rates**: Uses recipe variant conversion rates for calculations
- **Ingredient Lists**: Accesses detailed ingredient requirements with wastage rates

### Inventory Management System
- **Stock Level Queries**: Retrieves current inventory levels by location
- **Stock Updates**: Posts inventory deductions and adjustments
- **Movement Tracking**: Creates stock movement records for audit trail

### Reporting System
- **Consumption Analytics**: Provides data for consumption pattern analysis
- **Cost Tracking**: Feeds actual cost data to financial reporting
- **Variance Reports**: Enables analysis of operational efficiency

## Performance Requirements

### Response Time Targets
- **Single Transaction**: < 500ms processing time
- **Batch Processing**: < 50ms per transaction for batches up to 1000 transactions
- **Simulation**: < 200ms for feasibility checks
- **Variance Reports**: < 2 seconds for 30-day periods

### Throughput Requirements
- **Concurrent Transactions**: Support 100+ simultaneous transaction processing
- **Daily Volume**: Handle 50,000+ transactions per day
- **Peak Load**: Process 500 transactions per minute during peak hours

### Memory Optimization
- **Inventory Caching**: Cache frequently accessed inventory data
- **Recipe Caching**: Store recipe definitions in memory with TTL
- **Batch Processing**: Stream processing for large batches to minimize memory usage

## Error Handling

### Exception Scenarios

#### Recipe Not Found
- **Trigger**: POS item has no corresponding recipe mapping
- **Response**: Return failure result with descriptive error
- **Recovery**: Log unmapped item for manual review

#### Insufficient Inventory
- **Trigger**: Required ingredients below available stock
- **Response**: Calculate partial deduction and log shortfall
- **Recovery**: Continue processing but flag for inventory replenishment

#### Variant Mismatch
- **Trigger**: Recipe variant referenced in mapping doesn't exist
- **Response**: Fail transaction with validation error
- **Recovery**: Use default variant if available, otherwise reject

#### Calculation Overflow
- **Trigger**: Extremely large quantities causing numeric overflow
- **Response**: Fail transaction with overflow error
- **Recovery**: Apply quantity limits and retry if within bounds

### Error Recovery Strategies

#### Graceful Degradation
- Continue batch processing even if individual transactions fail
- Return partial results with clear indication of failures
- Maintain data consistency by not partially updating inventory

#### Retry Logic
- Implement exponential backoff for transient failures
- Retry inventory updates up to 3 times with increasing delays
- Log persistent failures for manual intervention

#### Data Validation
- Validate all input data before processing
- Check conversion rates and wastage percentages for reasonable ranges
- Verify recipe ingredient quantities are positive values

## Security Considerations

### Data Protection
- **Sensitive Data**: Cost information and inventory levels require authorized access
- **Audit Trail**: Log all stock deductions with user and timestamp information
- **Data Integrity**: Validate all calculations to prevent manipulation

### Access Control
- **Service Authentication**: Require valid API keys for service access
- **User Authorization**: Verify user permissions for location-specific operations
- **Rate Limiting**: Implement request throttling to prevent abuse

### Compliance Requirements
- **Financial Accuracy**: Ensure cost calculations meet accounting standards
- **Inventory Compliance**: Maintain detailed records for regulatory requirements
- **Data Retention**: Store transaction records per business retention policies

## Monitoring and Analytics

### Key Performance Indicators
- **Success Rate**: Percentage of successfully processed transactions
- **Average Processing Time**: Mean time for transaction processing
- **Inventory Accuracy**: Comparison between calculated and physical stock
- **Wastage Variance**: Difference between expected and actual wastage rates

### Alerting Thresholds
- **High Failure Rate**: > 5% transaction failures in 1-hour period
- **Processing Delays**: Average processing time > 1 second
- **Stock Shortfalls**: > 10 inventory items below minimum levels
- **Wastage Anomalies**: Wastage rates > 150% of historical averages

### Operational Dashboards
- **Real-time Processing**: Current transaction volume and success rates
- **Inventory Status**: Stock levels and deduction patterns by location
- **Cost Analysis**: Running totals of ingredient costs and wastage
- **Error Summary**: Recent failures and resolution status