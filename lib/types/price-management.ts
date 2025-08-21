// Core Price Management Types

export interface PriceAssignmentContext {
  prItemId: string;
  productId: string;
  categoryId: string;
  quantity: number;
  requestedDate: Date;
  location: string;
  department: string;
  budgetLimit?: number;
  urgencyLevel?: 'low' | 'normal' | 'high' | 'urgent';
  availableVendors: VendorPriceOption[];
}

export interface VendorPriceOption {
  vendorId: string;
  vendorName: string;
  price: number;
  currency: string;
  normalizedPrice: number;
  minQuantity: number;
  availability: 'available' | 'limited' | 'unavailable';
  leadTime: number;
  rating: number;
  isPreferred: boolean;
}

export interface PriceAssignmentResult {
  prItemId: string;
  selectedVendor: {
    id: string;
    name: string;
    rating: number;
    isPreferred: boolean;
  };
  assignedPrice: number;
  currency: string;
  normalizedPrice: number;
  assignmentReason: string;
  confidence: number;
  alternatives: Array<{
    vendorId: string;
    vendorName: string;
    price: number;
    currency: string;
    normalizedPrice: number;
    minQuantity: number;
    availability: string;
    leadTime: number;
    rating: number;
    isPreferred: boolean;
  }>;
  ruleApplied?: string;
  assignmentDate: Date;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'between' | 'notEquals' | 'greaterThanOrEqual' | 'lessThanOrEqual';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'assignVendor' | 'setPrice' | 'flagForReview' | 'applyDiscount' | 'filterVendors' | 'boostScore';
  parameters: Record<string, any>;
}

export interface PriceAssignmentHistory {
  id: string;
  prItemId: string;
  timestamp: Date;
  eventType: 'initial_assignment' | 'manual_override' | 'reassignment' | 'validation';
  vendorId: string;
  vendorName: string;
  price: number;
  currency: string;
  reason: string;
  performedBy: string;
  userRole: string;
  ruleId?: string;
  confidenceScore?: number;
  previousVendorId?: string;
  previousPrice?: number;
  overrideReason?: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    requestId: string;
  };
}

export interface PriceOverride {
  reason: string;
  newVendorId: string;
  newPrice: number;
  currency: string;
  overriddenBy: string;
  overrideDate: Date;
}

// Vendor Selection Types

export interface VendorSelectionCriteria {
  priceWeight: number;
  qualityWeight: number;
  reliabilityWeight: number;
  availabilityWeight: number;
  preferenceWeight: number;
}

export interface VendorSelectionResult {
  selectedVendor: VendorPriceOption;
  selectionScore: number;
  selectionReason: string;
  alternativeVendors: Array<{
    vendor: VendorPriceOption;
    score: number;
    reason: string;
  }>;
  appliedRules: string[];
  selectionCriteria: VendorSelectionCriteria;
  selectionTimestamp: Date;
}

// Assignment Reasoning Types

export interface AssignmentReasoning {
  primaryReason: string;
  confidenceScore: ConfidenceScore;
  reasoningFactors: ReasoningFactor[];
  riskAssessment: any;
  alternativeAnalysis: any;
  recommendationStrength: 'strong' | 'moderate' | 'weak';
  generatedAt: Date;
}

export interface ConfidenceScore {
  overall: number;
  breakdown: {
    price: number;
    vendor: number;
    availability: number;
    quality: number;
    context: number;
  };
  factors: any;
  category: string;
}

export interface ReasoningFactor {
  category: 'price' | 'quality' | 'availability' | 'relationship' | 'quantity';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  details: string;
}

// Alternative Options Types

export interface AlternativeOption {
  vendor: VendorPriceOption;
  score: number;
  comparison: VendorComparison;
  recommendation: any;
  switchingCost: any;
  riskAssessment: any;
  opportunityAnalysis: any;
}

export interface VendorComparison {
  priceComparison: {
    alternativePrice: number;
    selectedPrice: number;
    currency: string;
    difference: number;
    percentageDifference: number;
    savings: number;
    totalOrderSavings: number;
  };
  qualityComparison: {
    alternativeRating: number;
    selectedRating: number;
    ratingDifference: number;
    qualityAdvantage: string;
  };
  deliveryComparison: {
    alternativeLeadTime: number;
    selectedLeadTime: number;
    leadTimeDifference: number;
    alternativeAvailability: string;
    selectedAvailability: string;
    deliveryAdvantage: string;
  };
  relationshipComparison: {
    alternativeIsPreferred: boolean;
    selectedIsPreferred: boolean;
    relationshipAdvantage: string;
  };
  overallMetrics: ComparisonMetrics;
  recommendationSummary: string;
}

export interface ComparisonMetrics {
  overallScore: number;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  relationshipScore: number;
  riskScore: number;
  recommendation: string;
}

// Audit Trail Types

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  eventType: AssignmentEvent['type'];
  prItemId: string;
  userId: string;
  userRole: string;
  action: string;
  details?: {
    vendorId?: string;
    price?: number;
    currency?: string;
    reason?: string;
    confidenceScore?: number;
    [key: string]: any;
  };
  beforeState?: {
    vendorId?: string;
    price?: number;
    currency?: string;
    [key: string]: any;
  };
  afterState?: {
    vendorId?: string;
    price?: number;
    currency?: string;
    [key: string]: any;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    requestId: string;
  };
}

export interface AssignmentEvent {
  type: 'assignment' | 'override' | 'reassignment' | 'validation';
  prItemId: string;
  userId?: string;
  userRole?: string;
  action: string;
  details: any;
  beforeState?: any;
  afterState?: any;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
  };
}

export interface AuditQuery {
  prItemId?: string;
  userId?: string;
  eventType?: AssignmentEvent['type'];
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  page: number;
  limit: number;
}

export interface AuditReport {
  reportId: string;
  generatedAt: Date;
  query: AuditQuery;
  summary: {
    totalEvents: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    eventTypeBreakdown: { [key: string]: number };
    userActivityBreakdown: { [key: string]: number };
    vendorActivityBreakdown: { [key: string]: number };
  };
  entries: AuditTrailEntry[];
  insights: string[];
  recommendations: string[];
}

// Fallback Types

export interface FallbackScenario {
  id: string;
  name: string;
  description: string;
  priority: number;
  strategy: {
    type: 'alternative_vendor' | 'manual_review' | 'price_escalation' | 'delayed_assignment' | 'emergency_procurement' | 'split_order';
    parameters: Record<string, any>;
  };
  triggerConditions: {
    failureTypes: string[];
    minVendorsAvailable?: number;
    urgencyLevel?: string;
    categoryRestrictions?: string[];
    quantityThreshold?: number;
  };
  expectedResolutionTime: string;
  successRate: number;
}

export interface AssignmentFailure {
  type: 'no_vendors_available' | 'budget_exceeded' | 'business_rules_conflict' | 'vendor_unavailable' | 'price_expired' | 'capacity_exceeded' | 'system_error' | 'multiple_constraints' | 'custom_requirements' | 'price_too_high' | 'stock_shortage' | 'delivery_delay' | 'partial_availability' | 'price_optimization';
  reason: string;
  context: PriceAssignmentContext;
  timestamp: Date;
  details?: any;
}

export interface FallbackResult {
  success: boolean;
  strategy: string;
  action: string;
  message: string;
  assignedVendor: VendorPriceOption | null;
  requiresManualIntervention: boolean;
  nextSteps: string[];
  estimatedResolutionTime: string;
  fallbackScenario: FallbackScenario;
  additionalInfo?: any;
}

// Additional utility types

export interface VendorInfo {
  id: string;
  name: string;
  rating: number;
  isPreferred: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}