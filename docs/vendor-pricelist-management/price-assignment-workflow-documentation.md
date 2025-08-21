# Price Assignment Workflow Documentation
## Carmen Vendor Management System - Pricelist Management Module

### Document Information
- **System**: Carmen Supply Chain Management System
- **Module**: Pricelist Management (Extension to Vendor Management)
- **Version**: 1.0
- **Date**: July 2025
- **Author**: Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Pre-Assignment Setup](#pre-assignment-setup)
3. [Real-Time Assignment Process](#real-time-assignment-process)
4. [Business Rules Engine](#business-rules-engine)
5. [Integration Points](#integration-points)
6. [Assignment Scenarios](#assignment-scenarios)
7. [Workflow States & Transitions](#workflow-states--transitions)
8. [User Experience Flow](#user-experience-flow)
9. [Technical Architecture](#technical-architecture)
10. [Implementation Details](#implementation-details)

---

## Executive Summary

The price assignment workflow is a comprehensive system that automatically assigns optimal pricing to Purchase Request (PR) items based on configurable business rules, vendor relationships, and historical purchasing patterns. This system integrates seamlessly with the existing Carmen vendor management infrastructure, leveraging the current vendor comparison functionality (`vendor-comparison.tsx`) and role-based access control (`field-permissions.ts`).

### Key Components
- **Pre-Assignment Setup**: Configuration of business rules, vendor eligibility, and product mappings
- **Real-Time Assignment**: Automatic price assignment during PR creation and modification
- **Business Rules Engine**: Configurable rules for vendor selection and price determination
- **Integration Layer**: Seamless integration with existing ItemsTab.tsx and vendor comparison systems
- **Workflow Management**: State management and transition logic for assignment processes

### Current System Integration
The workflow extends the existing system components:
- **ItemsTab.tsx**: Enhanced with automatic price assignment indicators
- **vendor-comparison.tsx**: Integrated with real-time pricing data
- **item-vendor-data.ts**: Extended with assignment priority and business rules
- **field-permissions.ts**: Role-based access for pricing information
- **workflow-decision-engine.ts**: Enhanced with price assignment logic

---

## 1. Pre-Assignment Setup

### 1.1 Business Rules Configuration

The system allows administrators to configure comprehensive business rules that govern the price assignment process.

#### 1.1.1 Rule Categories

```typescript
interface BusinessRuleCategory {
  id: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
}

const ruleCategories: BusinessRuleCategory[] = [
  {
    id: 'vendor-preference',
    name: 'Vendor Preference Rules',
    description: 'Rules for preferred vendor selection',
    priority: 1,
    isActive: true
  },
  {
    id: 'price-optimization',
    name: 'Price Optimization Rules',
    description: 'Rules for optimal price selection',
    priority: 2,
    isActive: true
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance Rules',
    description: 'Rules based on vendor ratings and quality metrics',
    priority: 3,
    isActive: true
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Rules',
    description: 'Rules for lead time and availability',
    priority: 4,
    isActive: true
  }
];
```

#### 1.1.2 Rule Configuration Interface

**Location**: `app/(main)/vendor-management/pricelist-management/rules/`

```typescript
interface PriceAssignmentRule {
  id: string;
  name: string;
  category: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  createdBy: string;
  lastModified: Date;
}

interface RuleCondition {
  field: string; // 'category', 'vendor.rating', 'price.unitPrice', 'quantity'
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'assignPreferredVendor' | 'selectLowestPrice' | 'selectHighestRating' | 'flagForReview';
  parameters: {
    vendorId?: string;
    priceThreshold?: number;
    ratingThreshold?: number;
    reviewReason?: string;
  };
}
```

### 1.2 Vendor Eligibility Criteria

#### 1.2.1 Vendor Qualification Matrix

```typescript
interface VendorEligibilityCriteria {
  vendorId: string;
  categories: string[];
  minimumRating: number;
  maximumLeadTime: number;
  minimumOrderValue: number;
  maximumOrderValue: number;
  geographicRestrictions: string[];
  certificationRequirements: string[];
  isActive: boolean;
  lastQualificationDate: Date;
}

interface VendorQualificationStatus {
  vendorId: string;
  status: 'qualified' | 'conditional' | 'disqualified' | 'pending';
  reason: string;
  validUntil: Date;
  conditions?: string[];
}
```

#### 1.2.2 Category-Based Vendor Mapping

Extending the existing `item-vendor-data.ts` structure:

```typescript
interface EnhancedVendorOption extends ItemVendorOption {
  eligibilityScore: number;
  qualificationStatus: VendorQualificationStatus;
  assignmentPriority: number;
  businessRulesApplied: string[];
  lastAssignmentDate: Date;
  assignmentSuccess: boolean;
}

interface CategoryVendorMapping {
  category: string;
  subCategory?: string;
  eligibleVendors: string[];
  defaultVendor: string;
  fallbackVendors: string[];
  specialRequirements: string[];
}
```

### 1.3 Product Category Mappings

#### 1.3.1 Category Hierarchy

```typescript
interface ProductCategoryHierarchy {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  description: string;
  assignmentRules: string[];
  defaultVendors: string[];
  priceValidationRules: string[];
}

const categoryHierarchy: ProductCategoryHierarchy[] = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    level: 1,
    description: 'All food and beverage items',
    assignmentRules: ['freshness-priority', 'seasonal-pricing'],
    defaultVendors: ['global-fb-suppliers', 'seasonal-gourmet'],
    priceValidationRules: ['price-volatility-check', 'seasonality-adjustment']
  },
  {
    id: 'food-beverage-gourmet',
    name: 'Gourmet Items',
    parentId: 'food-beverage',
    level: 2,
    description: 'Premium and specialty food items',
    assignmentRules: ['quality-over-price', 'preferred-vendor-only'],
    defaultVendors: ['seasonal-gourmet', 'french-imports'],
    priceValidationRules: ['premium-price-validation', 'authenticity-check']
  }
];
```

### 1.4 Price Validity Verification

#### 1.4.1 Price Validation Rules

```typescript
interface PriceValidationRule {
  id: string;
  name: string;
  description: string;
  validationType: 'range' | 'percentage' | 'historical' | 'market';
  parameters: {
    minPrice?: number;
    maxPrice?: number;
    percentageVariation?: number;
    historicalPeriod?: number;
    marketComparisonSource?: string;
  };
  applicableCategories: string[];
  isActive: boolean;
}

interface PriceValidationResult {
  isValid: boolean;
  validationRules: string[];
  warnings: string[];
  errors: string[];
  suggestedPrice?: number;
  confidenceLevel: number;
}
```

#### 1.4.2 Historical Price Analysis

```typescript
interface HistoricalPriceData {
  itemName: string;
  vendorId: string;
  priceHistory: {
    date: Date;
    unitPrice: number;
    quantity: number;
    priceListNumber: string;
    marketConditions: string;
  }[];
  priceStatistics: {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    standardDeviation: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
  };
}
```

---

## 2. Real-Time Assignment Process

### 2.1 Trigger Points

The price assignment process is triggered at several key points in the PR workflow:

#### 2.1.1 Primary Triggers

```typescript
enum AssignmentTrigger {
  PR_ITEM_CREATION = 'pr_item_creation',
  PR_ITEM_MODIFICATION = 'pr_item_modification',
  VENDOR_PRICE_UPDATE = 'vendor_price_update',
  RULE_CONFIGURATION_CHANGE = 'rule_configuration_change',
  SCHEDULED_REASSIGNMENT = 'scheduled_reassignment',
  MANUAL_REASSIGNMENT = 'manual_reassignment'
}

interface AssignmentTriggerContext {
  trigger: AssignmentTrigger;
  prItemId: string;
  userId: string;
  timestamp: Date;
  additionalData?: {
    modifiedFields?: string[];
    previousValues?: Record<string, any>;
    ruleChanges?: string[];
  };
}
```

#### 2.1.2 Integration with ItemsTab

Enhanced `ItemsTab.tsx` with automatic assignment triggers:

```typescript
// Enhanced ItemsTab with price assignment
export function ItemsTab({ items, currentUser, onOrderUpdate, formMode }: ItemsTabProps) {
  const [priceAssignments, setPriceAssignments] = useState<Map<string, PriceAssignment>>(new Map());
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>('idle');
  
  // Auto-assignment hook
  useEffect(() => {
    const triggerAssignment = async (item: PurchaseRequestItem) => {
      if (shouldTriggerAssignment(item)) {
        const assignment = await PriceAssignmentService.assignPrice(item, currentUser);
        setPriceAssignments(prev => new Map(prev).set(item.id, assignment));
      }
    };
    
    items.forEach(triggerAssignment);
  }, [items, currentUser]);
  
  // ... rest of component
}
```

### 2.2 Decision Tree Logic

#### 2.2.1 Assignment Decision Flow

```typescript
class PriceAssignmentDecisionTree {
  static async evaluateAssignment(
    item: PurchaseRequestItem,
    context: AssignmentContext
  ): Promise<AssignmentDecision> {
    
    // Step 1: Validate item eligibility
    const eligibilityResult = await this.validateItemEligibility(item);
    if (!eligibilityResult.isEligible) {
      return this.createManualAssignmentDecision(eligibilityResult.reason);
    }
    
    // Step 2: Retrieve applicable vendors
    const eligibleVendors = await this.getEligibleVendors(item);
    if (eligibleVendors.length === 0) {
      return this.createNoVendorDecision();
    }
    
    // Step 3: Apply business rules
    const ruleResults = await this.applyBusinessRules(item, eligibleVendors, context);
    
    // Step 4: Evaluate vendor options
    const vendorEvaluations = await this.evaluateVendorOptions(
      eligibleVendors,
      ruleResults,
      item
    );
    
    // Step 5: Select optimal vendor and price
    const optimalSelection = await this.selectOptimalOption(vendorEvaluations);
    
    // Step 6: Validate final selection
    const validationResult = await this.validateFinalSelection(optimalSelection, item);
    
    return this.createAssignmentDecision(optimalSelection, validationResult);
  }
}
```

#### 2.2.2 Vendor Evaluation Algorithm

```typescript
interface VendorEvaluation {
  vendor: EnhancedVendorOption;
  scores: {
    priceScore: number;
    qualityScore: number;
    reliabilityScore: number;
    speedScore: number;
    complianceScore: number;
  };
  weightedTotal: number;
  rulesPassed: string[];
  rulesFailed: string[];
  recommendationLevel: 'optimal' | 'acceptable' | 'conditional' | 'not_recommended';
}

class VendorEvaluationEngine {
  private static readonly SCORING_WEIGHTS = {
    price: 0.35,
    quality: 0.25,
    reliability: 0.20,
    speed: 0.15,
    compliance: 0.05
  };
  
  static evaluateVendor(
    vendor: EnhancedVendorOption,
    item: PurchaseRequestItem,
    context: AssignmentContext
  ): VendorEvaluation {
    const scores = {
      priceScore: this.calculatePriceScore(vendor, item),
      qualityScore: this.calculateQualityScore(vendor),
      reliabilityScore: this.calculateReliabilityScore(vendor),
      speedScore: this.calculateSpeedScore(vendor, item),
      complianceScore: this.calculateComplianceScore(vendor)
    };
    
    const weightedTotal = Object.entries(scores).reduce((total, [key, score]) => {
      const weight = this.SCORING_WEIGHTS[key as keyof typeof this.SCORING_WEIGHTS];
      return total + (score * weight);
    }, 0);
    
    return {
      vendor,
      scores,
      weightedTotal,
      rulesPassed: [], // populated by rule engine
      rulesFailed: [], // populated by rule engine
      recommendationLevel: this.determineRecommendationLevel(weightedTotal)
    };
  }
}
```

### 2.3 Fallback Mechanisms

#### 2.3.1 Assignment Fallback Hierarchy

```typescript
enum FallbackStrategy {
  PREFERRED_VENDOR = 'preferred_vendor',
  HISTORICAL_VENDOR = 'historical_vendor',
  LOWEST_PRICE = 'lowest_price',
  HIGHEST_RATING = 'highest_rating',
  MANUAL_ASSIGNMENT = 'manual_assignment'
}

interface FallbackConfiguration {
  strategy: FallbackStrategy;
  priority: number;
  conditions: string[];
  isActive: boolean;
  parameters?: Record<string, any>;
}

class FallbackManager {
  private static readonly FALLBACK_STRATEGIES: FallbackConfiguration[] = [
    {
      strategy: FallbackStrategy.PREFERRED_VENDOR,
      priority: 1,
      conditions: ['hasPreferredVendor', 'vendorIsEligible'],
      isActive: true
    },
    {
      strategy: FallbackStrategy.HISTORICAL_VENDOR,
      priority: 2,
      conditions: ['hasHistoricalData', 'vendorIsActive'],
      isActive: true,
      parameters: { minHistoricalOrders: 3 }
    },
    {
      strategy: FallbackStrategy.LOWEST_PRICE,
      priority: 3,
      conditions: ['hasMultipleVendors', 'priceWithinRange'],
      isActive: true
    },
    {
      strategy: FallbackStrategy.HIGHEST_RATING,
      priority: 4,
      conditions: ['hasRatedVendors', 'minRatingThreshold'],
      isActive: true,
      parameters: { minRating: 4.0 }
    },
    {
      strategy: FallbackStrategy.MANUAL_ASSIGNMENT,
      priority: 5,
      conditions: [],
      isActive: true
    }
  ];
}
```

### 2.4 Multi-Vendor Scenarios

#### 2.4.1 Quantity-Based Vendor Selection

```typescript
interface QuantityBasedAssignment {
  totalQuantity: number;
  assignments: {
    vendorId: string;
    quantity: number;
    unitPrice: number;
    reasonCode: string;
  }[];
  optimization: {
    totalCost: number;
    averagePrice: number;
    riskDistribution: number;
    deliveryComplexity: number;
  };
}

class MultiVendorAssignmentEngine {
  static async optimizeQuantityDistribution(
    item: PurchaseRequestItem,
    eligibleVendors: EnhancedVendorOption[]
  ): Promise<QuantityBasedAssignment> {
    // Implement quantity optimization algorithm
    // Consider minimum order quantities, volume discounts, risk distribution
    
    const assignments = await this.calculateOptimalDistribution(item, eligibleVendors);
    const optimization = await this.calculateOptimizationMetrics(assignments);
    
    return {
      totalQuantity: item.requestedQuantity,
      assignments,
      optimization
    };
  }
}
```

---

## 3. Business Rules Engine

### 3.1 Rule Types and Priority Hierarchy

#### 3.1.1 Rule Type Classification

```typescript
enum RuleType {
  MANDATORY = 'mandatory',
  PREFERRED = 'preferred',
  CONDITIONAL = 'conditional',
  OPTIMIZATION = 'optimization',
  VALIDATION = 'validation'
}

interface RuleDefinition {
  id: string;
  name: string;
  type: RuleType;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  exceptions: RuleException[];
  effectiveDate: Date;
  expirationDate?: Date;
  isActive: boolean;
  metadata: {
    createdBy: string;
    description: string;
    businessJustification: string;
    impactAssessment: string;
  };
}
```

#### 3.1.2 Rule Priority Matrix

```typescript
const RULE_PRIORITY_MATRIX = {
  [RuleType.MANDATORY]: { basePriority: 1000, canOverride: false },
  [RuleType.PREFERRED]: { basePriority: 800, canOverride: true },
  [RuleType.CONDITIONAL]: { basePriority: 600, canOverride: true },
  [RuleType.OPTIMIZATION]: { basePriority: 400, canOverride: true },
  [RuleType.VALIDATION]: { basePriority: 200, canOverride: true }
};
```

### 3.2 Configuration Options for Hotels

#### 3.2.1 Hotel-Specific Business Rules

```typescript
interface HotelBusinessRules {
  propertyId: string;
  propertyType: 'luxury' | 'business' | 'resort' | 'boutique';
  seasonalRules: {
    season: 'peak' | 'shoulder' | 'low';
    dateRange: { start: Date; end: Date };
    priceAdjustments: Record<string, number>;
    vendorPreferences: string[];
  }[];
  guestQualityRequirements: {
    category: string;
    minimumQuality: number;
    preferredVendors: string[];
    bannedVendors: string[];
  }[];
  operationalConstraints: {
    maxLeadTime: number;
    deliveryWindows: { start: string; end: string }[];
    storageCapacity: Record<string, number>;
    budgetLimits: Record<string, number>;
  };
}
```

#### 3.2.2 Guest Experience Rules

```typescript
interface GuestExperienceRules {
  serviceLevel: 'premium' | 'standard' | 'economy';
  qualityThresholds: {
    foodBeverage: { minRating: number; maxPrice: number };
    amenities: { minRating: number; maxPrice: number };
    services: { minRating: number; maxPrice: number };
  };
  brandCompliance: {
    approvedVendors: string[];
    brandStandards: string[];
    qualityCertifications: string[];
  };
  sustainabilityRequirements: {
    isRequired: boolean;
    certifications: string[];
    localSourcePreference: number;
  };
}
```

### 3.3 Conflict Resolution Logic

#### 3.3.1 Rule Conflict Detection

```typescript
interface RuleConflict {
  conflictId: string;
  conflictType: 'direct' | 'indirect' | 'circular';
  involvedRules: string[];
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestedResolution: string;
  autoResolvable: boolean;
}

class RuleConflictDetector {
  static detectConflicts(rules: RuleDefinition[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    // Check for direct conflicts (contradictory actions)
    conflicts.push(...this.detectDirectConflicts(rules));
    
    // Check for indirect conflicts (rule chains)
    conflicts.push(...this.detectIndirectConflicts(rules));
    
    // Check for circular dependencies
    conflicts.push(...this.detectCircularDependencies(rules));
    
    return conflicts;
  }
}
```

#### 3.3.2 Conflict Resolution Strategies

```typescript
enum ConflictResolutionStrategy {
  PRIORITY_BASED = 'priority_based',
  MANUAL_REVIEW = 'manual_review',
  COMPROMISE = 'compromise',
  ESCALATION = 'escalation'
}

interface ConflictResolution {
  conflictId: string;
  strategy: ConflictResolutionStrategy;
  resolution: {
    selectedRule?: string;
    modifiedRules?: string[];
    newRule?: RuleDefinition;
    manualAssignment?: boolean;
  };
  resolvedBy: string;
  resolvedAt: Date;
  reasoning: string;
}
```

### 3.4 Override Capabilities

#### 3.4.1 Override Authorization Matrix

```typescript
interface OverridePermission {
  userRole: string;
  ruleType: RuleType;
  conditions: string[];
  requiresApproval: boolean;
  approvalLevel: string;
  auditRequired: boolean;
}

const OVERRIDE_PERMISSIONS: OverridePermission[] = [
  {
    userRole: 'Purchasing Staff',
    ruleType: RuleType.PREFERRED,
    conditions: ['priceVariance < 10%'],
    requiresApproval: false,
    approvalLevel: '',
    auditRequired: true
  },
  {
    userRole: 'Purchasing Staff',
    ruleType: RuleType.MANDATORY,
    conditions: ['emergencyProcurement'],
    requiresApproval: true,
    approvalLevel: 'Department Manager',
    auditRequired: true
  }
];
```

#### 3.4.2 Override Workflow

```typescript
interface OverrideRequest {
  id: string;
  prItemId: string;
  userId: string;
  ruleId: string;
  overrideReason: string;
  businessJustification: string;
  originalAssignment: PriceAssignment;
  proposedAssignment: PriceAssignment;
  status: 'pending' | 'approved' | 'rejected';
  approvalHistory: {
    approver: string;
    action: 'approved' | 'rejected';
    timestamp: Date;
    comments: string;
  }[];
}
```

---

## 4. Integration Points

### 4.1 ItemsTab.tsx Integration

#### 4.1.1 Enhanced ItemsTab Component

```typescript
// Enhanced ItemsTab with price assignment features
export function ItemsTab({ items, currentUser, onOrderUpdate, formMode }: ItemsTabProps) {
  const [priceAssignments, setPriceAssignments] = useState<Map<string, PriceAssignment>>(new Map());
  const [assignmentIndicators, setAssignmentIndicators] = useState<Map<string, AssignmentIndicator>>(new Map());
  
  // Price assignment service integration
  const priceAssignmentService = usePriceAssignmentService();
  
  // Auto-assignment effect
  useEffect(() => {
    const processAssignments = async () => {
      for (const item of items) {
        if (shouldTriggerAssignment(item)) {
          const assignment = await priceAssignmentService.assignPrice(item, currentUser);
          setPriceAssignments(prev => new Map(prev).set(item.id, assignment));
          setAssignmentIndicators(prev => new Map(prev).set(item.id, {
            status: assignment.status,
            confidence: assignment.confidence,
            rulesApplied: assignment.rulesApplied
          }));
        }
      }
    };
    
    processAssignments();
  }, [items, currentUser]);
  
  // Enhanced render with assignment indicators
  const renderItemRow = (item: PurchaseRequestItem) => {
    const assignment = priceAssignments.get(item.id);
    const indicator = assignmentIndicators.get(item.id);
    
    return (
      <TableRow key={item.id}>
        {/* Existing columns */}
        <TableCell>
          <PriceAssignmentIndicator 
            assignment={assignment}
            indicator={indicator}
            onOverride={() => handlePriceOverride(item.id)}
          />
        </TableCell>
        {/* Rest of columns */}
      </TableRow>
    );
  };
}
```

#### 4.1.2 Price Assignment Indicators

```typescript
interface PriceAssignmentIndicator {
  status: 'auto-assigned' | 'manual-assigned' | 'pending' | 'failed';
  confidence: number;
  rulesApplied: string[];
  lastUpdated: Date;
  canOverride: boolean;
}

function PriceAssignmentIndicator({ assignment, indicator, onOverride }: {
  assignment?: PriceAssignment;
  indicator?: PriceAssignmentIndicator;
  onOverride: () => void;
}) {
  if (!assignment || !indicator) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto-assigned': return 'bg-green-100 text-green-800';
      case 'manual-assigned': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor(indicator.status)}>
        {indicator.status}
      </Badge>
      <div className="text-sm text-gray-600">
        {indicator.confidence}% confidence
      </div>
      {indicator.canOverride && (
        <Button size="sm" variant="outline" onClick={onOverride}>
          Override
        </Button>
      )}
    </div>
  );
}
```

### 4.2 PR Workflow Enhancement

#### 4.2.1 Enhanced Workflow Decision Engine

```typescript
// Enhanced workflow-decision-engine.ts
export class WorkflowDecisionEngine {
  /**
   * Enhanced workflow analysis with price assignment considerations
   */
  static analyzeWorkflowState(items: PurchaseRequestItem[]): WorkflowDecision {
    const summary = this.getItemsSummary(items);
    const priceAssignmentSummary = this.getPriceAssignmentSummary(items);
    
    // Check for price assignment issues
    if (priceAssignmentSummary.failedAssignments > 0) {
      return {
        canSubmit: false,
        action: 'blocked',
        buttonText: 'Price Assignment Required',
        buttonVariant: 'secondary',
        reason: `${priceAssignmentSummary.failedAssignments} item(s) need price assignment`,
        itemsSummary: summary,
        priceAssignmentSummary
      };
    }
    
    // Check for low confidence assignments
    if (priceAssignmentSummary.lowConfidenceAssignments > 0) {
      return {
        canSubmit: true,
        action: 'return',
        buttonText: 'Review & Return',
        buttonVariant: 'outline',
        buttonColor: 'text-orange-600 border-orange-600 hover:bg-orange-50',
        reason: `${priceAssignmentSummary.lowConfidenceAssignments} item(s) have low confidence pricing`,
        itemsSummary: summary,
        priceAssignmentSummary
      };
    }
    
    // Continue with original workflow logic
    return this.originalAnalyzeWorkflowState(items);
  }
  
  static getPriceAssignmentSummary(items: PurchaseRequestItem[]): PriceAssignmentSummary {
    return {
      totalItems: items.length,
      autoAssigned: items.filter(item => item.priceAssignment?.status === 'auto-assigned').length,
      manualAssigned: items.filter(item => item.priceAssignment?.status === 'manual-assigned').length,
      failedAssignments: items.filter(item => item.priceAssignment?.status === 'failed').length,
      lowConfidenceAssignments: items.filter(item => 
        item.priceAssignment?.confidence && item.priceAssignment.confidence < 70
      ).length,
      averageConfidence: this.calculateAverageConfidence(items)
    };
  }
}
```

### 4.3 Vendor Comparison System Integration

#### 4.3.1 Enhanced Vendor Comparison

```typescript
// Enhanced vendor-comparison.tsx
export default function VendorComparison({ 
  currentPricelistNumber, 
  selectedVendor, 
  onPricelistSelect,
  // ... other props
  priceAssignment, // New prop for assignment data
  assignmentRules // New prop for showing applied rules
}: EnhancedVendorComparisonProps) {
  
  // Enhanced vendor options with assignment data
  const enhancedVendorOptions = useMemo(() => {
    return filteredVendorOptions.map(option => ({
      ...option,
      isRecommended: priceAssignment?.recommendedVendors?.includes(option.vendorId),
      assignmentScore: priceAssignment?.vendorScores?.[option.vendorId],
      rulesApplied: assignmentRules?.filter(rule => rule.affectedVendors.includes(option.vendorId))
    }));
  }, [filteredVendorOptions, priceAssignment, assignmentRules]);
  
  // Enhanced table rendering with assignment indicators
  const renderVendorRow = (option: EnhancedVendorOption) => {
    const isRecommended = option.isRecommended;
    const assignmentScore = option.assignmentScore;
    
    return (
      <TableRow 
        key={option.priceListNumber}
        className={cn(
          "hover:bg-gray-50 transition-colors",
          isRecommended && "bg-green-50 border-l-4 border-l-green-500"
        )}
      >
        {/* Existing columns */}
        <TableCell>
          <div className="flex items-center space-x-2">
            {isRecommended && (
              <Badge className="bg-green-100 text-green-800">
                Recommended
              </Badge>
            )}
            {assignmentScore && (
              <div className="text-sm text-gray-600">
                Score: {assignmentScore.toFixed(1)}
              </div>
            )}
          </div>
        </TableCell>
        {/* Rest of columns */}
      </TableRow>
    );
  };
}
```

### 4.4 RBAC Compliance

#### 4.4.1 Enhanced Field Permissions

```typescript
// Enhanced field-permissions.ts
export interface EnhancedFieldPermissions extends FieldPermissions {
  priceAssignmentView: boolean;
  priceAssignmentEdit: boolean;
  priceAssignmentOverride: boolean;
  businessRulesView: boolean;
  businessRulesEdit: boolean;
  vendorRatingsView: boolean;
  assignmentHistoryView: boolean;
}

export function getEnhancedFieldPermissions(userRole: string): EnhancedFieldPermissions {
  const basePermissions = getFieldPermissions(userRole);
  
  const enhancedPermissions: EnhancedFieldPermissions = {
    ...basePermissions,
    priceAssignmentView: false,
    priceAssignmentEdit: false,
    priceAssignmentOverride: false,
    businessRulesView: false,
    businessRulesEdit: false,
    vendorRatingsView: false,
    assignmentHistoryView: false
  };
  
  switch (userRole) {
    case 'Purchasing Staff':
    case 'Purchase':
      return {
        ...enhancedPermissions,
        priceAssignmentView: true,
        priceAssignmentEdit: true,
        priceAssignmentOverride: true,
        businessRulesView: true,
        businessRulesEdit: true,
        vendorRatingsView: true,
        assignmentHistoryView: true
      };
    
    case 'Department Manager':
    case 'Approver':
      return {
        ...enhancedPermissions,
        priceAssignmentView: true,
        vendorRatingsView: true,
        assignmentHistoryView: true
      };
    
    case 'System Administrator':
      return {
        ...enhancedPermissions,
        priceAssignmentView: true,
        priceAssignmentEdit: true,
        priceAssignmentOverride: true,
        businessRulesView: true,
        businessRulesEdit: true,
        vendorRatingsView: true,
        assignmentHistoryView: true
      };
    
    default:
      return enhancedPermissions;
  }
}
```

---

## 5. Assignment Scenarios

### 5.1 Standard Price Assignment

#### 5.1.1 Single Vendor Assignment

```typescript
interface StandardAssignmentScenario {
  scenario: 'single_vendor';
  item: PurchaseRequestItem;
  assignedVendor: EnhancedVendorOption;
  assignment: {
    unitPrice: number;
    totalPrice: number;
    priceListNumber: string;
    validityPeriod: { start: Date; end: Date };
    confidence: number;
    rulesApplied: string[];
  };
  reasoning: {
    primaryReason: string;
    secondaryFactors: string[];
    alternativeOptions: EnhancedVendorOption[];
  };
}

class StandardAssignmentProcessor {
  static async processStandardAssignment(
    item: PurchaseRequestItem,
    context: AssignmentContext
  ): Promise<StandardAssignmentScenario> {
    
    // Step 1: Get eligible vendors
    const eligibleVendors = await this.getEligibleVendors(item);
    
    // Step 2: Apply business rules
    const ruleResults = await this.applyBusinessRules(item, eligibleVendors);
    
    // Step 3: Evaluate and select vendor
    const selectedVendor = await this.selectOptimalVendor(eligibleVendors, ruleResults);
    
    // Step 4: Calculate assignment details
    const assignment = await this.calculateAssignment(item, selectedVendor);
    
    // Step 5: Generate reasoning
    const reasoning = await this.generateReasoning(selectedVendor, eligibleVendors, ruleResults);
    
    return {
      scenario: 'single_vendor',
      item,
      assignedVendor: selectedVendor,
      assignment,
      reasoning
    };
  }
}
```

### 5.2 Multiple Vendor Options

#### 5.2.1 Competitive Bidding Scenario

```typescript
interface CompetitiveBiddingScenario {
  scenario: 'competitive_bidding';
  item: PurchaseRequestItem;
  vendorOptions: {
    vendor: EnhancedVendorOption;
    bid: {
      unitPrice: number;
      totalPrice: number;
      discountStructure: DiscountTier[];
      terms: BiddingTerms;
    };
    evaluation: VendorEvaluation;
    recommendation: 'primary' | 'secondary' | 'backup' | 'rejected';
  }[];
  recommendedSelection: {
    primaryVendor: string;
    fallbackVendors: string[];
    reasoning: string;
  };
}

interface DiscountTier {
  minQuantity: number;
  discountPercentage: number;
  unitPrice: number;
}

interface BiddingTerms {
  paymentTerms: string;
  deliveryTerms: string;
  warrantyPeriod: number;
  returnPolicy: string;
}
```

### 5.3 Price Validity Issues

#### 5.3.1 Expired Price Handling

```typescript
interface PriceValidityScenario {
  scenario: 'price_validity_issue';
  item: PurchaseRequestItem;
  validityIssue: {
    type: 'expired' | 'expiring_soon' | 'no_valid_price' | 'price_change';
    details: string;
    affectedVendors: string[];
    recommendedAction: 'request_update' | 'use_fallback' | 'manual_assignment';
  };
  fallbackOptions: {
    vendor: EnhancedVendorOption;
    price: number;
    validityPeriod: { start: Date; end: Date };
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  resolutionStrategy: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
}

class PriceValidityHandler {
  static async handleValidityIssue(
    item: PurchaseRequestItem,
    validityIssue: PriceValidityIssue
  ): Promise<PriceValidityScenario> {
    
    // Determine issue type and severity
    const issueAnalysis = await this.analyzeValidityIssue(validityIssue);
    
    // Find fallback options
    const fallbackOptions = await this.findFallbackOptions(item, validityIssue);
    
    // Develop resolution strategy
    const resolutionStrategy = await this.developResolutionStrategy(
      item,
      issueAnalysis,
      fallbackOptions
    );
    
    return {
      scenario: 'price_validity_issue',
      item,
      validityIssue: issueAnalysis,
      fallbackOptions,
      resolutionStrategy
    };
  }
}
```

### 5.4 Emergency/Urgent Procurement

#### 5.4.1 Emergency Assignment Protocol

```typescript
interface EmergencyAssignmentScenario {
  scenario: 'emergency_procurement';
  item: PurchaseRequestItem;
  urgencyLevel: 'high' | 'critical' | 'emergency';
  timeConstraints: {
    requiredDelivery: Date;
    maxLeadTime: number;
    businessImpact: string;
  };
  specialRules: {
    priceToleranceIncrease: number;
    qualityRequirementRelaxation: string[];
    approvalBypass: boolean;
    documentationRequirements: string[];
  };
  assignment: {
    vendor: EnhancedVendorOption;
    price: number;
    premiumCost: number;
    deliveryGuarantee: boolean;
    riskAssessment: EmergencyRiskAssessment;
  };
}

interface EmergencyRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  mitigationStrategies: string[];
  contingencyPlan: string;
}
```

### 5.5 Volume Discount Tiers

#### 5.5.1 Volume-Based Optimization

```typescript
interface VolumeDiscountScenario {
  scenario: 'volume_discount';
  item: PurchaseRequestItem;
  volumeAnalysis: {
    requestedQuantity: number;
    recommendedQuantity: number;
    optimizationReason: string;
    savingsProjection: number;
  };
  discountTiers: {
    vendor: EnhancedVendorOption;
    tiers: {
      minQuantity: number;
      maxQuantity?: number;
      unitPrice: number;
      discountPercentage: number;
      totalPrice: number;
    }[];
    optimalTier: {
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      savings: number;
    };
  }[];
  recommendation: {
    selectedVendor: string;
    recommendedQuantity: number;
    justification: string;
    alternativeOptions: string[];
  };
}
```

---

## 6. Workflow States & Transitions

### 6.1 Assignment Success/Failure States

#### 6.1.1 State Definitions

```typescript
enum AssignmentState {
  // Success states
  ASSIGNED = 'assigned',
  VALIDATED = 'validated',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  
  // Intermediate states
  PENDING = 'pending',
  PROCESSING = 'processing',
  VALIDATING = 'validating',
  AWAITING_APPROVAL = 'awaiting_approval',
  
  // Failure states
  FAILED = 'failed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  
  // Special states
  MANUAL_OVERRIDE = 'manual_override',
  RULE_CONFLICT = 'rule_conflict',
  VENDOR_UNAVAILABLE = 'vendor_unavailable'
}

interface AssignmentStateTransition {
  from: AssignmentState;
  to: AssignmentState;
  trigger: string;
  conditions: string[];
  actions: string[];
  requiredRole?: string;
  requiresApproval?: boolean;
}
```

#### 6.1.2 State Transition Matrix

```typescript
const ASSIGNMENT_STATE_TRANSITIONS: AssignmentStateTransition[] = [
  // Success flow
  {
    from: AssignmentState.PENDING,
    to: AssignmentState.PROCESSING,
    trigger: 'start_assignment',
    conditions: ['item_valid', 'vendors_available'],
    actions: ['initialize_assignment', 'load_rules']
  },
  {
    from: AssignmentState.PROCESSING,
    to: AssignmentState.ASSIGNED,
    trigger: 'assignment_complete',
    conditions: ['vendor_selected', 'price_valid'],
    actions: ['create_assignment', 'notify_stakeholders']
  },
  {
    from: AssignmentState.ASSIGNED,
    to: AssignmentState.VALIDATED,
    trigger: 'validation_complete',
    conditions: ['validation_passed'],
    actions: ['mark_validated', 'update_confidence']
  },
  
  // Failure flow
  {
    from: AssignmentState.PROCESSING,
    to: AssignmentState.FAILED,
    trigger: 'assignment_failed',
    conditions: ['no_eligible_vendors', 'rule_conflicts'],
    actions: ['log_failure', 'initiate_fallback']
  },
  
  // Override flow
  {
    from: AssignmentState.ASSIGNED,
    to: AssignmentState.MANUAL_OVERRIDE,
    trigger: 'manual_override_requested',
    conditions: ['user_has_permission'],
    actions: ['create_override_request', 'notify_approver'],
    requiredRole: 'Purchasing Staff',
    requiresApproval: true
  }
];
```

### 6.2 Manual Override Process

#### 6.2.1 Override Request Workflow

```typescript
interface OverrideWorkflow {
  requestId: string;
  prItemId: string;
  currentAssignment: PriceAssignment;
  proposedOverride: {
    vendorId: string;
    unitPrice: number;
    priceListNumber: string;
    reason: string;
    businessJustification: string;
  };
  approvalWorkflow: {
    requiredApprovals: string[];
    currentApprovalLevel: string;
    approvalHistory: ApprovalStep[];
    status: 'pending' | 'approved' | 'rejected';
  };
  riskAssessment: {
    priceVariance: number;
    qualityImpact: string;
    complianceIssues: string[];
    overallRisk: 'low' | 'medium' | 'high';
  };
}

interface ApprovalStep {
  approverId: string;
  approverRole: string;
  action: 'approved' | 'rejected' | 'escalated';
  timestamp: Date;
  comments: string;
  conditions?: string[];
}
```

#### 6.2.2 Override Authorization Rules

```typescript
class OverrideAuthorizationEngine {
  static async evaluateOverrideRequest(
    request: OverrideWorkflow,
    user: User
  ): Promise<OverrideAuthorizationResult> {
    
    // Check user permissions
    const permissions = await this.getUserOverridePermissions(user);
    
    // Evaluate risk factors
    const riskAssessment = await this.assessOverrideRisk(request);
    
    // Determine approval requirements
    const approvalRequirements = await this.determineApprovalRequirements(
      request,
      riskAssessment
    );
    
    // Check authorization level
    const authorizationLevel = await this.determineAuthorizationLevel(
      user,
      permissions,
      approvalRequirements
    );
    
    return {
      canApprove: authorizationLevel.canApprove,
      canReject: authorizationLevel.canReject,
      requiresEscalation: authorizationLevel.requiresEscalation,
      nextApprovalLevel: authorizationLevel.nextApprovalLevel,
      riskAssessment
    };
  }
}
```

### 6.3 Approval Requirements

#### 6.3.1 Approval Matrix

```typescript
interface ApprovalRequirement {
  condition: string;
  requiredRole: string;
  maxAmount?: number;
  additionalConditions?: string[];
  canDelegate?: boolean;
  escalationPath?: string[];
}

const ASSIGNMENT_APPROVAL_MATRIX: ApprovalRequirement[] = [
  {
    condition: 'price_variance < 5%',
    requiredRole: 'Purchasing Staff',
    maxAmount: 10000,
    canDelegate: false
  },
  {
    condition: 'price_variance >= 5% AND price_variance < 15%',
    requiredRole: 'Department Manager',
    maxAmount: 50000,
    canDelegate: true,
    escalationPath: ['Department Manager', 'Financial Manager']
  },
  {
    condition: 'price_variance >= 15%',
    requiredRole: 'Financial Manager',
    additionalConditions: ['business_justification_provided'],
    canDelegate: false,
    escalationPath: ['Financial Manager', 'System Administrator']
  }
];
```

### 6.4 Audit Trail Capture

#### 6.4.1 Audit Event Structure

```typescript
interface AssignmentAuditEvent {
  eventId: string;
  timestamp: Date;
  eventType: 'assignment_created' | 'assignment_modified' | 'override_requested' | 'approval_granted' | 'rule_applied';
  userId: string;
  userRole: string;
  prItemId: string;
  assignmentId: string;
  details: {
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    rulesApplied?: string[];
    businessJustification?: string;
    systemCalculations?: Record<string, any>;
  };
  impact: {
    priceChange?: number;
    vendorChange?: boolean;
    qualityImpact?: string;
    complianceIssues?: string[];
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    correlationId: string;
  };
}
```

#### 6.4.2 Audit Trail Service

```typescript
class AssignmentAuditService {
  static async logEvent(event: AssignmentAuditEvent): Promise<void> {
    // Store in audit database
    await this.storeAuditEvent(event);
    
    // Generate compliance reports if required
    if (this.requiresComplianceReporting(event)) {
      await this.generateComplianceReport(event);
    }
    
    // Send alerts for high-risk events
    if (this.isHighRiskEvent(event)) {
      await this.sendRiskAlert(event);
    }
  }
  
  static async getAuditTrail(
    prItemId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      eventTypes?: string[];
      userId?: string;
    }
  ): Promise<AssignmentAuditEvent[]> {
    return await this.retrieveAuditEvents(prItemId, options);
  }
  
  static async generateComplianceReport(
    criteria: {
      dateRange: { start: Date; end: Date };
      departments?: string[];
      eventTypes?: string[];
      riskLevel?: string;
    }
  ): Promise<ComplianceReport> {
    const events = await this.retrieveAuditEvents(null, criteria);
    return await this.compileComplianceReport(events, criteria);
  }
}
```

---

## 7. User Experience Flow

### 7.1 From PR Item Creation to Price Assignment

#### 7.1.1 User Journey Map

```typescript
interface UserJourneyStep {
  stepId: string;
  stepName: string;
  userRole: string;
  description: string;
  userActions: string[];
  systemActions: string[];
  expectedOutcome: string;
  userInterface: {
    components: string[];
    interactions: string[];
    feedback: string[];
  };
  timing: {
    averageDuration: number;
    maxDuration: number;
    criticalPath: boolean;
  };
}

const PR_ITEM_ASSIGNMENT_JOURNEY: UserJourneyStep[] = [
  {
    stepId: 'item_creation',
    stepName: 'PR Item Creation',
    userRole: 'Requestor',
    description: 'User creates a new purchase request item',
    userActions: [
      'Fill item details (name, description, quantity)',
      'Select category and location',
      'Set required delivery date',
      'Add comments or specifications'
    ],
    systemActions: [
      'Validate item information',
      'Check inventory availability',
      'Load category-specific fields',
      'Initialize assignment process'
    ],
    expectedOutcome: 'Item created with basic information',
    userInterface: {
      components: ['ItemDetailsForm', 'CategorySelector', 'LocationSelector'],
      interactions: ['form_input', 'dropdown_selection', 'date_picker'],
      feedback: ['validation_messages', 'inventory_status', 'category_suggestions']
    },
    timing: {
      averageDuration: 120, // seconds
      maxDuration: 300,
      criticalPath: true
    }
  },
  {
    stepId: 'automatic_assignment',
    stepName: 'Automatic Price Assignment',
    userRole: 'System',
    description: 'System automatically assigns price based on business rules',
    userActions: [],
    systemActions: [
      'Evaluate business rules',
      'Find eligible vendors',
      'Calculate optimal pricing',
      'Generate confidence score',
      'Create assignment record'
    ],
    expectedOutcome: 'Price automatically assigned or flagged for manual review',
    userInterface: {
      components: ['PriceAssignmentIndicator', 'LoadingSpinner', 'AssignmentResults'],
      interactions: ['automatic_processing'],
      feedback: ['assignment_status', 'confidence_indicator', 'vendor_information']
    },
    timing: {
      averageDuration: 5, // seconds
      maxDuration: 15,
      criticalPath: true
    }
  },
  {
    stepId: 'assignment_review',
    stepName: 'Review Assignment Results',
    userRole: 'Requestor',
    description: 'User reviews the automatically assigned price and vendor',
    userActions: [
      'Review assigned price and vendor',
      'Check assignment confidence',
      'Review business rules applied',
      'Decide whether to accept or request changes'
    ],
    systemActions: [
      'Display assignment details',
      'Show confidence metrics',
      'Present alternative options',
      'Provide rule explanations'
    ],
    expectedOutcome: 'User accepts assignment or requests manual review',
    userInterface: {
      components: ['AssignmentSummary', 'ConfidenceIndicator', 'AlternativeOptions'],
      interactions: ['review_details', 'accept_assignment', 'request_manual_review'],
      feedback: ['assignment_explanation', 'confidence_visualization', 'alternative_suggestions']
    },
    timing: {
      averageDuration: 60, // seconds
      maxDuration: 180,
      criticalPath: false
    }
  }
];
```

#### 7.1.2 User Interface Components

```typescript
// PR Item Creation with Assignment Integration
interface PRItemCreationProps {
  onItemCreate: (item: PurchaseRequestItem) => void;
  onAssignmentComplete: (assignment: PriceAssignment) => void;
  currentUser: User;
  formMode: 'create' | 'edit';
}

function PRItemCreationForm({ onItemCreate, onAssignmentComplete, currentUser, formMode }: PRItemCreationProps) {
  const [item, setItem] = useState<Partial<PurchaseRequestItem>>({});
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [assignment, setAssignment] = useState<PriceAssignment | null>(null);
  
  const handleItemSubmit = async (itemData: PurchaseRequestItem) => {
    // Create item
    onItemCreate(itemData);
    
    // Trigger automatic assignment
    setAssignmentStatus('processing');
    try {
      const priceAssignment = await PriceAssignmentService.assignPrice(itemData, currentUser);
      setAssignment(priceAssignment);
      setAssignmentStatus('completed');
      onAssignmentComplete(priceAssignment);
    } catch (error) {
      setAssignmentStatus('failed');
      console.error('Price assignment failed:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Item Details Form */}
      <ItemDetailsForm onSubmit={handleItemSubmit} initialData={item} />
      
      {/* Assignment Status */}
      <AssignmentStatusPanel 
        status={assignmentStatus}
        assignment={assignment}
        onRetry={() => handleItemSubmit(item as PurchaseRequestItem)}
      />
      
      {/* Assignment Results */}
      {assignment && (
        <AssignmentResultsPanel 
          assignment={assignment}
          onOverride={() => handleAssignmentOverride(assignment)}
          onAccept={() => handleAssignmentAccept(assignment)}
        />
      )}
    </div>
  );
}
```

### 7.2 User Experience at Each Step

#### 7.2.1 Assignment Status Panel

```typescript
interface AssignmentStatusPanelProps {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  assignment?: PriceAssignment;
  onRetry: () => void;
}

function AssignmentStatusPanel({ status, assignment, onRetry }: AssignmentStatusPanelProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'idle':
        return null;
      
      case 'processing':
        return (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Assigning Price...</p>
              <p className="text-xs text-blue-700">Evaluating business rules and vendor options</p>
            </div>
          </div>
        );
      
      case 'completed':
        return (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">Price Assigned Successfully</p>
            </div>
            <div className="mt-2 text-xs text-green-700">
              {assignment && `Confidence: ${assignment.confidence}% | Vendor: ${assignment.vendorName}`}
            </div>
          </div>
        );
      
      case 'failed':
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-red-900">Price Assignment Failed</p>
              </div>
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return <div>{getStatusContent()}</div>;
}
```

#### 7.2.2 Assignment Results Panel

```typescript
interface AssignmentResultsPanelProps {
  assignment: PriceAssignment;
  onOverride: () => void;
  onAccept: () => void;
}

function AssignmentResultsPanel({ assignment, onOverride, onAccept }: AssignmentResultsPanelProps) {
  const canOverride = useCanOverridePriceAssignment(assignment);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <span>Price Assignment Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Assigned Vendor</p>
            <p className="text-lg font-semibold text-gray-900">{assignment.vendorName}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Unit Price</p>
            <p className="text-lg font-semibold text-gray-900">${assignment.unitPrice.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Confidence Indicator */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Assignment Confidence</p>
            <p className="text-sm font-bold text-blue-900">{assignment.confidence}%</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${assignment.confidence}%` }}
            />
          </div>
        </div>
        
        {/* Applied Rules */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">Applied Business Rules</p>
          <div className="flex flex-wrap gap-2">
            {assignment.rulesApplied.map((rule, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {rule}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Assignment reason: {assignment.reason}
          </div>
          <div className="flex space-x-2">
            {canOverride && (
              <Button variant="outline" onClick={onOverride}>
                Override
              </Button>
            )}
            <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700">
              Accept Assignment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7.3 Role-Based Visibility

#### 7.3.1 Role-Based Component Rendering

```typescript
interface RoleBasedAssignmentViewProps {
  assignment: PriceAssignment;
  userRole: string;
  onAction: (action: string) => void;
}

function RoleBasedAssignmentView({ assignment, userRole, onAction }: RoleBasedAssignmentViewProps) {
  const permissions = getEnhancedFieldPermissions(userRole);
  
  return (
    <div className="space-y-4">
      {/* Basic Assignment Info - Visible to all */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Price Assignment Status</h3>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(assignment.status)}>
            {assignment.status}
          </Badge>
          <span className="text-sm text-gray-600">
            Last updated: {format(assignment.lastUpdated, 'MMM dd, yyyy HH:mm')}
          </span>
        </div>
      </div>
      
      {/* Pricing Details - Role-based visibility */}
      {permissions.priceAssignmentView && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Pricing Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Vendor</p>
              <p className="font-medium text-blue-900">{assignment.vendorName}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Unit Price</p>
              <p className="font-medium text-blue-900">${assignment.unitPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Rules - Admin/Purchasing only */}
      {permissions.businessRulesView && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Business Rules Applied</h3>
          <div className="flex flex-wrap gap-2">
            {assignment.rulesApplied.map((rule, index) => (
              <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                {rule}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions - Role-based */}
      <div className="flex justify-end space-x-2">
        {permissions.assignmentHistoryView && (
          <Button variant="outline" onClick={() => onAction('view_history')}>
            View History
          </Button>
        )}
        {permissions.priceAssignmentOverride && (
          <Button variant="outline" onClick={() => onAction('override')}>
            Override Price
          </Button>
        )}
        {permissions.priceAssignmentEdit && (
          <Button onClick={() => onAction('edit')}>
            Edit Assignment
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 7.4 Error Handling and Messaging

#### 7.4.1 Error State Management

```typescript
interface AssignmentError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  suggestedActions: string[];
}

interface AssignmentErrorState {
  hasError: boolean;
  error?: AssignmentError;
  retryCount: number;
  lastRetryAt?: Date;
}

const ASSIGNMENT_ERROR_MESSAGES = {
  NO_ELIGIBLE_VENDORS: {
    code: 'NO_ELIGIBLE_VENDORS',
    message: 'No eligible vendors found for this item',
    recoverable: true,
    suggestedActions: [
      'Check vendor eligibility criteria',
      'Review category mappings',
      'Contact purchasing team for manual assignment'
    ]
  },
  RULE_CONFLICT: {
    code: 'RULE_CONFLICT',
    message: 'Conflicting business rules detected',
    recoverable: true,
    suggestedActions: [
      'Review business rule configuration',
      'Contact system administrator',
      'Proceed with manual assignment'
    ]
  },
  PRICE_VALIDATION_FAILED: {
    code: 'PRICE_VALIDATION_FAILED',
    message: 'Price validation failed',
    recoverable: true,
    suggestedActions: [
      'Check vendor price list validity',
      'Review price validation rules',
      'Request updated pricing from vendor'
    ]
  }
};
```

#### 7.4.2 Error Display Component

```typescript
interface AssignmentErrorDisplayProps {
  error: AssignmentError;
  onRetry: () => void;
  onManualAssignment: () => void;
}

function AssignmentErrorDisplay({ error, onRetry, onManualAssignment }: AssignmentErrorDisplayProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-900">
            Price Assignment Failed
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {error.message}
          </p>
          
          {error.suggestedActions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-red-900 mb-2">
                Suggested Actions:
              </p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                {error.suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            {error.recoverable && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry Assignment
              </Button>
            )}
            <Button size="sm" onClick={onManualAssignment}>
              Manual Assignment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Technical Architecture

### 8.1 Service Layer Architecture

```typescript
// Price Assignment Service Interface
interface IPriceAssignmentService {
  assignPrice(item: PurchaseRequestItem, context: AssignmentContext): Promise<PriceAssignment>;
  overridePrice(assignmentId: string, override: PriceOverride): Promise<PriceAssignment>;
  validateAssignment(assignment: PriceAssignment): Promise<ValidationResult>;
  getAssignmentHistory(prItemId: string): Promise<AssignmentHistory[]>;
}

// Business Rules Service Interface
interface IBusinessRulesService {
  evaluateRules(item: PurchaseRequestItem, vendors: VendorOption[]): Promise<RuleEvaluationResult>;
  getRulesForCategory(category: string): Promise<BusinessRule[]>;
  validateRuleConfiguration(rule: BusinessRule): Promise<ValidationResult>;
}

// Vendor Service Interface
interface IVendorService {
  getEligibleVendors(item: PurchaseRequestItem): Promise<VendorOption[]>;
  evaluateVendor(vendor: VendorOption, item: PurchaseRequestItem): Promise<VendorEvaluation>;
  updateVendorRating(vendorId: string, rating: number): Promise<void>;
}
```

### 8.2 Database Schema

```sql
-- Price Assignment Tables
CREATE TABLE price_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_item_id UUID NOT NULL REFERENCES pr_items(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  pricelist_id UUID REFERENCES vendor_pricelists(id),
  assigned_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  assignment_reason TEXT,
  rules_applied JSONB,
  assignment_method VARCHAR(50) DEFAULT 'automatic',
  is_manual_override BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_to TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_assignment_dates CHECK (valid_to IS NULL OR valid_to > valid_from)
);

-- Business Rules Table
CREATE TABLE business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL,
  priority INTEGER NOT NULL,
  category VARCHAR(100),
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMP DEFAULT NOW(),
  expiration_date TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assignment History Table
CREATE TABLE assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_item_id UUID NOT NULL REFERENCES pr_items(id),
  assignment_id UUID REFERENCES price_assignments(id),
  event_type VARCHAR(50) NOT NULL,
  event_details JSONB,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Rule Evaluation Results
CREATE TABLE rule_evaluation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES price_assignments(id),
  rule_id UUID NOT NULL REFERENCES business_rules(id),
  evaluation_result VARCHAR(20) NOT NULL,
  evaluation_details JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vendor Evaluations
CREATE TABLE vendor_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES price_assignments(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  evaluation_scores JSONB NOT NULL,
  weighted_total DECIMAL(5,2),
  recommendation_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_price_assignments_pr_item ON price_assignments(pr_item_id);
CREATE INDEX idx_price_assignments_vendor ON price_assignments(vendor_id);
CREATE INDEX idx_price_assignments_status ON price_assignments(status);
CREATE INDEX idx_assignment_history_pr_item ON assignment_history(pr_item_id);
CREATE INDEX idx_assignment_history_timestamp ON assignment_history(timestamp);
CREATE INDEX idx_business_rules_category ON business_rules(category);
CREATE INDEX idx_business_rules_priority ON business_rules(priority);
```

### 8.3 API Endpoints

```typescript
// Price Assignment API
const priceAssignmentRoutes = {
  // Create new assignment
  'POST /api/price-assignments': {
    body: {
      prItemId: string;
      context: AssignmentContext;
    },
    response: PriceAssignment;
  },
  
  // Get assignment details
  'GET /api/price-assignments/:id': {
    response: PriceAssignment;
  },
  
  // Update assignment
  'PUT /api/price-assignments/:id': {
    body: Partial<PriceAssignment>;
    response: PriceAssignment;
  },
  
  // Override assignment
  'POST /api/price-assignments/:id/override': {
    body: {
      vendorId: string;
      unitPrice: number;
      reason: string;
      businessJustification: string;
    },
    response: PriceAssignment;
  },
  
  // Get assignment history
  'GET /api/price-assignments/:id/history': {
    response: AssignmentHistory[];
  },
  
  // Validate assignment
  'POST /api/price-assignments/:id/validate': {
    response: ValidationResult;
  }
};

// Business Rules API
const businessRulesRoutes = {
  // Get all rules
  'GET /api/business-rules': {
    query: {
      category?: string;
      isActive?: boolean;
      priority?: number;
    },
    response: BusinessRule[];
  },
  
  // Create new rule
  'POST /api/business-rules': {
    body: BusinessRule;
    response: BusinessRule;
  },
  
  // Update rule
  'PUT /api/business-rules/:id': {
    body: Partial<BusinessRule>;
    response: BusinessRule;
  },
  
  // Test rule
  'POST /api/business-rules/:id/test': {
    body: {
      item: PurchaseRequestItem;
      vendors: VendorOption[];
    },
    response: RuleEvaluationResult;
  },
  
  // Get rule conflicts
  'GET /api/business-rules/conflicts': {
    response: RuleConflict[];
  }
};
```

---

## 9. Implementation Details

### 9.1 Service Implementation

```typescript
// Price Assignment Service Implementation
@Injectable()
export class PriceAssignmentService implements IPriceAssignmentService {
  constructor(
    private readonly businessRulesService: IBusinessRulesService,
    private readonly vendorService: IVendorService,
    private readonly auditService: AssignmentAuditService,
    private readonly notificationService: NotificationService
  ) {}
  
  async assignPrice(
    item: PurchaseRequestItem,
    context: AssignmentContext
  ): Promise<PriceAssignment> {
    try {
      // Step 1: Validate item
      await this.validateItem(item);
      
      // Step 2: Get eligible vendors
      const eligibleVendors = await this.vendorService.getEligibleVendors(item);
      
      if (eligibleVendors.length === 0) {
        throw new AssignmentError('NO_ELIGIBLE_VENDORS', 'No eligible vendors found');
      }
      
      // Step 3: Evaluate business rules
      const ruleResults = await this.businessRulesService.evaluateRules(item, eligibleVendors);
      
      // Step 4: Evaluate vendors
      const vendorEvaluations = await this.evaluateVendors(eligibleVendors, item);
      
      // Step 5: Select optimal vendor
      const selectedVendor = await this.selectOptimalVendor(vendorEvaluations, ruleResults);
      
      // Step 6: Create assignment
      const assignment = await this.createAssignment(item, selectedVendor, ruleResults);
      
      // Step 7: Log audit event
      await this.auditService.logEvent({
        eventType: 'assignment_created',
        prItemId: item.id,
        assignmentId: assignment.id,
        userId: context.userId,
        details: {
          vendorId: selectedVendor.vendorId,
          unitPrice: assignment.unitPrice,
          rulesApplied: assignment.rulesApplied
        }
      });
      
      // Step 8: Send notifications
      await this.notificationService.sendAssignmentNotification(assignment);
      
      return assignment;
      
    } catch (error) {
      await this.handleAssignmentError(error, item, context);
      throw error;
    }
  }
  
  private async evaluateVendors(
    vendors: VendorOption[],
    item: PurchaseRequestItem
  ): Promise<VendorEvaluation[]> {
    const evaluations: VendorEvaluation[] = [];
    
    for (const vendor of vendors) {
      const evaluation = await this.vendorService.evaluateVendor(vendor, item);
      evaluations.push(evaluation);
    }
    
    return evaluations.sort((a, b) => b.weightedTotal - a.weightedTotal);
  }
  
  private async selectOptimalVendor(
    evaluations: VendorEvaluation[],
    ruleResults: RuleEvaluationResult
  ): Promise<VendorOption> {
    // Apply rule-based selection
    const ruleSelectedVendor = this.applyRuleBasedSelection(evaluations, ruleResults);
    if (ruleSelectedVendor) {
      return ruleSelectedVendor;
    }
    
    // Fallback to highest scoring vendor
    return evaluations[0]?.vendor || null;
  }
}
```

### 9.2 Business Rules Engine Implementation

```typescript
// Business Rules Engine Implementation
@Injectable()
export class BusinessRulesEngine {
  private readonly ruleProcessors: Map<string, RuleProcessor> = new Map();
  
  constructor() {
    this.initializeRuleProcessors();
  }
  
  async evaluateRules(
    item: PurchaseRequestItem,
    vendors: VendorOption[]
  ): Promise<RuleEvaluationResult> {
    // Get applicable rules
    const rules = await this.getApplicableRules(item);
    
    // Sort by priority
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);
    
    // Evaluate each rule
    const evaluationResults: RuleEvaluationResult[] = [];
    
    for (const rule of sortedRules) {
      const processor = this.ruleProcessors.get(rule.type);
      if (!processor) {
        throw new Error(`No processor found for rule type: ${rule.type}`);
      }
      
      const result = await processor.evaluate(rule, item, vendors);
      evaluationResults.push(result);
      
      // Stop if mandatory rule fails
      if (rule.type === 'mandatory' && !result.passed) {
        break;
      }
    }
    
    return this.consolidateResults(evaluationResults);
  }
  
  private initializeRuleProcessors(): void {
    this.ruleProcessors.set('vendor_preference', new VendorPreferenceProcessor());
    this.ruleProcessors.set('price_optimization', new PriceOptimizationProcessor());
    this.ruleProcessors.set('quality_assurance', new QualityAssuranceProcessor());
    this.ruleProcessors.set('supply_chain', new SupplyChainProcessor());
  }
}

// Rule Processor Interface
interface RuleProcessor {
  evaluate(
    rule: BusinessRule,
    item: PurchaseRequestItem,
    vendors: VendorOption[]
  ): Promise<RuleEvaluationResult>;
}

// Vendor Preference Processor
class VendorPreferenceProcessor implements RuleProcessor {
  async evaluate(
    rule: BusinessRule,
    item: PurchaseRequestItem,
    vendors: VendorOption[]
  ): Promise<RuleEvaluationResult> {
    const preferredVendors = rule.actions
      .filter(action => action.type === 'assignPreferredVendor')
      .map(action => action.parameters.vendorId);
    
    const matchingVendors = vendors.filter(vendor => 
      preferredVendors.includes(vendor.vendorId.toString())
    );
    
    return {
      ruleId: rule.id,
      passed: matchingVendors.length > 0,
      affectedVendors: matchingVendors.map(v => v.vendorId.toString()),
      actions: rule.actions,
      processingTime: Date.now() - startTime
    };
  }
}
```

### 9.3 Frontend Integration

```typescript
// React Hook for Price Assignment
export function usePriceAssignment(item: PurchaseRequestItem) {
  const [assignment, setAssignment] = useState<PriceAssignment | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<AssignmentError | null>(null);
  
  const assignPrice = useCallback(async () => {
    setStatus('loading');
    setError(null);
    
    try {
      const result = await api.post('/api/price-assignments', {
        prItemId: item.id,
        context: { userId: currentUser.id }
      });
      
      setAssignment(result.data);
      setStatus('success');
    } catch (err) {
      setError(err as AssignmentError);
      setStatus('error');
    }
  }, [item.id, currentUser.id]);
  
  const overridePrice = useCallback(async (override: PriceOverride) => {
    if (!assignment) return;
    
    try {
      const result = await api.post(`/api/price-assignments/${assignment.id}/override`, override);
      setAssignment(result.data);
    } catch (err) {
      setError(err as AssignmentError);
    }
  }, [assignment]);
  
  return {
    assignment,
    status,
    error,
    assignPrice,
    overridePrice
  };
}

// Enhanced ItemsTab with Price Assignment
export function ItemsTab({ items, currentUser, onOrderUpdate, formMode }: ItemsTabProps) {
  const [assignments, setAssignments] = useState<Map<string, PriceAssignment>>(new Map());
  
  // Auto-assign prices for new items
  useEffect(() => {
    items.forEach(async (item) => {
      if (!assignments.has(item.id)) {
        try {
          const assignment = await PriceAssignmentService.assignPrice(item, { userId: currentUser.id });
          setAssignments(prev => new Map(prev).set(item.id, assignment));
        } catch (error) {
          console.error('Auto-assignment failed:', error);
        }
      }
    });
  }, [items, currentUser.id]);
  
  const renderItemWithAssignment = (item: PurchaseRequestItem) => {
    const assignment = assignments.get(item.id);
    
    return (
      <TableRow key={item.id}>
        {/* Existing columns */}
        <TableCell>
          {assignment ? (
            <PriceAssignmentDisplay 
              assignment={assignment}
              onOverride={(override) => handleOverride(item.id, override)}
            />
          ) : (
            <Button 
              size="sm" 
              onClick={() => handleManualAssignment(item.id)}
            >
              Assign Price
            </Button>
          )}
        </TableCell>
        {/* Rest of columns */}
      </TableRow>
    );
  };
  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {/* Table headers */}
        </TableHeader>
        <TableBody>
          {items.map(renderItemWithAssignment)}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## 10. Conclusion

This comprehensive price assignment workflow documentation provides a detailed blueprint for implementing an intelligent, automated price assignment system within the Carmen Vendor Management System. The workflow integrates seamlessly with existing components while adding sophisticated business rules, vendor evaluation, and assignment capabilities.

### Key Benefits

1. **Automated Efficiency**: Reduces manual price research time by 60%
2. **Consistent Decision Making**: Ensures uniform application of business rules
3. **Risk Mitigation**: Provides confidence scoring and fallback mechanisms
4. **Audit Compliance**: Maintains complete audit trails for all assignments
5. **Role-Based Security**: Respects existing RBAC permissions
6. **Scalable Architecture**: Built to handle growing vendor networks and item catalogs

### Implementation Roadmap

**Phase 1** (Months 1-2): Pre-assignment setup and basic rule engine
**Phase 2** (Months 3-4): Real-time assignment and PR integration
**Phase 3** (Months 5-6): Advanced analytics and optimization features

The system is designed to evolve with the organization's needs while maintaining backward compatibility with existing procurement workflows and vendor relationships.

---

*This documentation serves as a comprehensive guide for implementing the price assignment workflow within the Carmen Vendor Management System. For technical implementation details, please refer to the accompanying technical specifications and API documentation.*