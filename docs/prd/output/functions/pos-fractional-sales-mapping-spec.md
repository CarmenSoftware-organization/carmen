# POS Fractional Sales Mapping Functional Specification

## Overview
The POS Fractional Sales Mapping system provides comprehensive integration between Point of Sale systems and the Carmen ERP's fractional sales management. This component enables seamless mapping of POS items to recipe variants, supporting complex scenarios where multiple POS items (pizza slice, half pizza, whole pizza) map to different yield variants of the same base recipe.

## Component Architecture

### Core Components
- **Fractional Mapping Engine**: Central service managing POS-to-recipe relationships
- **Mapping Validation Service**: Ensures consistency between POS items and recipe variants
- **Auto-Mapping Generator**: Creates suggested mappings for unmapped items
- **Synchronization Controller**: Handles bidirectional sync with POS systems
- **Mapping Analytics Service**: Provides insights and statistics on mapping effectiveness

### Design Architecture
- **Repository Pattern**: Centralized data access for mapping configurations
- **Factory Pattern**: Creates appropriate mapping objects based on fractional sales types
- **Strategy Pattern**: Different mapping strategies for various POS system types
- **Observer Pattern**: Notifies dependent systems when mappings change

## Core Functionality

### Function 1: Fractional Mapping Management
- **Purpose**: Manages complex relationships between POS items and recipe variants for fractional sales
- **Inputs**:
  - POS item definitions with codes and descriptions
  - Base recipes with yield variants
  - Mapping configuration parameters
- **Processing**:
  1. Groups POS items by base recipe for fractional items
  2. Validates conversion rate consistency across variants
  3. Creates mapping relationships with proper hierarchy
  4. Establishes parent-child relationships for variant mappings
  5. Applies fractional sales type templates
- **Outputs**:
  - Complete mapping structure with variant relationships
  - Validation results and consistency checks
  - Suggested mappings for unmapped variants

### Function 2: Mapping Group Analysis
- **Purpose**: Analyzes and organizes mappings by base recipe for comprehensive fractional sales management
- **Inputs**:
  - Array of existing recipe mappings
  - Array of available recipes with variants
- **Processing**:
  1. Filters recipes that support fractional sales
  2. Groups mappings by base recipe ID
  3. Identifies mapped and unmapped variants
  4. Calculates mapping completeness statistics
  5. Detects inconsistencies in conversion rates
- **Outputs**:
  - `FractionalMappingGroup[]`: Organized mapping groups
  - Completeness metrics and gap analysis
  - Inconsistency reports requiring attention

### Function 3: Automatic Mapping Suggestions
- **Purpose**: Generates intelligent mapping suggestions for unmapped recipe variants
- **Inputs**:
  - Base recipe with yield variants
  - Existing POS item codes and naming patterns
  - Fractional sales type configuration
- **Processing**:
  1. Analyzes existing POS naming conventions
  2. Generates suggested POS item codes following patterns
  3. Creates complete mapping structures
  4. Applies appropriate conversion rates from recipe variants
  5. Sets default categories and status values
- **Outputs**:
  - Suggested mapping configurations
  - Generated POS item codes
  - Complete mapping templates ready for activation

### Function 4: Mapping Consistency Validation
- **Purpose**: Ensures data consistency between recipe variants and POS mappings
- **Inputs**:
  - Recipe with yield variants
  - Associated POS mappings
- **Processing**:
  1. Validates conversion rate matching between recipe and mapping
  2. Checks for missing or orphaned variant mappings
  3. Verifies pricing consistency where applicable
  4. Ensures proper fractional sales type configuration
- **Outputs**:
  - Validation results with pass/fail status
  - Detailed error descriptions for failures
  - Suggested corrections for inconsistencies

### Function 5: Inventory Impact Calculation
- **Purpose**: Calculates real-time inventory impact when POS sales occur
- **Inputs**:
  - POS mapping configuration
  - Quantity sold through POS
  - Base recipe with ingredients
- **Processing**:
  1. Applies conversion rate to determine base recipe consumption
  2. Calculates ingredient usage with wastage factors
  3. Computes total costs including overhead
  4. Determines inventory deduction requirements
- **Outputs**:
  - Detailed inventory impact breakdown
  - Cost analysis per ingredient
  - Total consumption and cost summary

## Data Models

### Core Mapping Structures

```typescript
interface RecipeMapping {
  id: string
  posItemCode: string          // POS system item identifier
  posDescription: string       // POS display description
  recipeCode: string          // Base recipe identifier
  recipeName: string          // Recipe display name
  posUnit: string            // Unit as known in POS (e.g., "slice", "each")
  recipeUnit: string         // Base recipe unit (e.g., "whole pizza")
  conversionRate: number     // Portion of base recipe (0.125 for 1/8 slice)
  
  // Enhanced fractional sales support
  recipeVariantId?: string   // Maps to RecipeYieldVariant.id
  variantName?: string       // Display name (e.g., "Pizza Slice", "Half Cake")
  baseRecipeId?: string      // Base recipe when multiple POS items map to same recipe
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  
  // Administrative fields
  category: string
  status: StatusType         // 'mapped' | 'unmapped' | 'inactive' | 'error'
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
  createdAt: Date
  updatedAt: Date
}

interface FractionalMappingGroup {
  baseRecipeId: string                    // Base recipe identifier
  recipeName: string                      // Recipe display name
  fractionalSalesType: string            // Type of fractional sales pattern
  variants: {                            // Array of variant-mapping pairs
    recipeVariant: RecipeYieldVariant    // Recipe variant definition
    posMapping: RecipeMapping            // Corresponding POS mapping
  }[]
  totalMappings: number                  // Count of active mappings
  unmappedVariants: RecipeYieldVariant[] // Variants without POS mappings
}

interface MappingValidationResult {
  valid: boolean              // Overall validation status
  errors: string[]           // Array of error descriptions
  warnings: string[]         // Non-critical issues
  suggestions: string[]      // Recommended improvements
}

interface InventoryImpact {
  recipeId: string           // Base recipe affected
  recipeName: string         // Recipe display name
  variantName: string        // Specific variant sold
  quantityConsumed: number   // Base recipe quantity consumed
  ingredients: {             // Per-ingredient impact
    id: string
    name: string
    quantityUsed: number
    unit: string
    cost: number
  }[]
}
```

### Mapping Configuration Templates

```typescript
interface FractionalSalesTemplate {
  type: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  mappingPattern: {
    posCodeTemplate: string    // Template for generating POS codes
    descriptionTemplate: string // Template for descriptions
    categoryMapping: string    // Default category assignment
  }
  defaultMappings: {
    variantType: string       // e.g., "slice", "half", "whole"
    posCodeSuffix: string     // e.g., "-SL", "-HF", "-WH"
    priority: number          // Display order priority
  }[]
}
```

## Integration Points

### POS System Integration
- **Bidirectional Sync**: Two-way synchronization of item codes and descriptions
- **Real-time Updates**: Immediate propagation of price and availability changes
- **Transaction Processing**: Real-time processing of sales transactions
- **Error Handling**: Robust handling of POS system connectivity issues

### Recipe Management System
- **Variant Monitoring**: Automatic detection of new recipe variants
- **Cost Updates**: Synchronization of recipe cost changes to POS pricing
- **Availability Sync**: Real-time inventory availability updates to POS
- **Menu Management**: Integration with menu planning and seasonal changes

### Inventory Management System
- **Stock Deduction**: Real-time inventory deduction based on sales
- **Wastage Tracking**: Monitoring of variant-specific wastage patterns
- **Reorder Triggers**: Automatic reorder point calculations based on sales velocity
- **Location Management**: Multi-location inventory tracking and mapping

### Financial System Integration
- **Revenue Recognition**: Proper allocation of revenue by recipe variant
- **Cost Accounting**: Accurate cost assignment for profit analysis
- **Tax Management**: Appropriate tax calculation for different product types
- **Reporting Integration**: Financial reporting with fractional sales breakdown

## Performance Requirements

### Response Time Targets
- **Mapping Lookup**: < 50ms for individual mapping retrieval
- **Group Analysis**: < 200ms for complete fractional mapping group analysis
- **Validation Checks**: < 100ms for mapping consistency validation
- **Impact Calculation**: < 150ms for inventory impact calculations

### Throughput Specifications
- **Concurrent Mappings**: Support 1,000+ concurrent mapping operations
- **Transaction Volume**: Process 10,000+ POS transactions per hour
- **Sync Operations**: Handle 500+ mapping synchronizations per minute
- **Batch Processing**: Process 5,000+ mapping updates in batch operations

### Data Management
- **Mapping Storage**: Efficient storage and retrieval of 50,000+ mappings
- **Cache Management**: Intelligent caching of frequently accessed mappings
- **Synchronization**: Real-time sync with POS systems under 5-second latency
- **Backup and Recovery**: Complete mapping data backup and restoration capabilities

## Error Handling

### Validation Error Scenarios

#### Missing Recipe Variant
- **Trigger**: POS mapping references non-existent recipe variant
- **Response**: Mark mapping as error status with descriptive message
- **Recovery**: Suggest available variants or create missing variant

#### Conversion Rate Mismatch
- **Trigger**: Mapping conversion rate doesn't match recipe variant rate
- **Response**: Flag inconsistency and prevent activation
- **Recovery**: Auto-correct to recipe variant rate or manual review

#### Duplicate POS Codes
- **Trigger**: Multiple mappings use same POS item code
- **Response**: Reject duplicate and maintain existing mapping
- **Recovery**: Generate alternative POS code following naming convention

#### Orphaned Mappings
- **Trigger**: Mapping exists but recipe or variant was deleted
- **Response**: Mark as inactive and log for cleanup
- **Recovery**: Archive orphaned mappings with historical reference

### System Integration Failures

#### POS System Connectivity
- **Detection**: Monitor POS system heartbeat and response times
- **Response**: Queue changes for retry when connection restored
- **Recovery**: Exponential backoff retry with manual intervention escalation

#### Recipe System Changes
- **Detection**: Monitor recipe modification events
- **Response**: Validate affected mappings and mark inconsistencies
- **Recovery**: Automatic correction where possible, manual review for complex cases

#### Inventory System Lag
- **Detection**: Monitor inventory update acknowledgment times
- **Response**: Continue processing but flag delayed updates
- **Recovery**: Reconciliation process to ensure inventory accuracy

## Security and Compliance

### Data Security
- **Access Control**: Role-based permissions for mapping management
- **Audit Trail**: Complete logging of all mapping changes with user attribution
- **Data Encryption**: Secure storage and transmission of sensitive mapping data
- **API Security**: Token-based authentication for all external integrations

### Business Compliance
- **Financial Accuracy**: Ensure mapping calculations meet accounting standards
- **Food Safety**: Proper categorization for allergen and dietary restriction tracking
- **Tax Compliance**: Accurate product categorization for tax calculation purposes
- **Regulatory Reporting**: Support for food service regulatory reporting requirements

### Operational Controls
- **Change Management**: Approval workflows for critical mapping changes
- **Testing Requirements**: Mandatory testing before activating new mappings
- **Rollback Capability**: Ability to quickly revert problematic mapping changes
- **Monitoring and Alerting**: Proactive monitoring of mapping performance and accuracy

## Quality Assurance

### Testing Framework
- **Unit Testing**: Comprehensive testing of all mapping calculations and validations
- **Integration Testing**: End-to-end testing with actual POS and recipe systems
- **Performance Testing**: Load testing with realistic transaction volumes
- **Regression Testing**: Automated testing to prevent mapping degradation

### Monitoring and Analytics
- **Mapping Effectiveness**: Track success rates of mapping operations
- **System Performance**: Monitor response times and throughput metrics
- **Business Impact**: Analyze sales patterns and inventory accuracy by mapping type
- **User Adoption**: Track usage patterns and user feedback on mapping tools

### Continuous Improvement
- **Feedback Integration**: Regular incorporation of user feedback and suggestions
- **Performance Optimization**: Ongoing optimization based on usage patterns
- **Feature Enhancement**: Regular updates to support new fractional sales patterns
- **Best Practice Development**: Documentation and sharing of mapping best practices