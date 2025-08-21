export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  category: 'vendor-selection' | 'pricing' | 'approval' | 'currency' | 'fractional-sales' | 'quality-control' | 'inventory-management' | 'food-safety' | 'waste-management';
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
}

export interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'not_equals';
  value: any;
  logicalOperator?: 'AND' | 'OR' | null;
}

export interface RuleAction {
  id: string;
  type: 'assignVendor' | 'setPrice' | 'flagForReview' | 'applyDiscount' | 'convertCurrency' | 'blockSale' | 'requireApproval' | 'scheduleWasteCheck' | 'triggerReorder' | 'adjustPrice' | 'markExpired' | 'quarantineItem' | 'notifyManager' | 'updateInventory' | 'logCompliance' | 'sendAlert';
  parameters: Record<string, any>;
}

export interface ConditionTemplate {
  id: string;
  name: string;
  field: string;
  dataType: 'string' | 'number' | 'boolean' | 'currency' | 'date';
  operators: string[];
  possibleValues?: any[];
  description: string;
  min?: number;
  max?: number;
}

export interface ActionTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: ActionParameter[];
}

export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface RuleAnalytics {
  overview: {
    totalRules: number;
    activeRules: number;
    inactiveRules: number;
    totalTriggers: number;
    successfulTriggers: number;
    failedTriggers: number;
    overallSuccessRate: number;
    averageProcessingTime: number;
    lastUpdated: string;
  };
  rulePerformance: RulePerformance[];
  categoryBreakdown: Record<string, CategoryPerformance>;
  timeSeriesData: {
    daily: DailyMetric[];
    hourly: HourlyMetric[];
  };
  errorAnalysis: {
    commonErrors: ErrorMetric[];
    resolutionSuggestions: ErrorSuggestion[];
  };
}

export interface RulePerformance {
  ruleId: string;
  ruleName: string;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageProcessingTime: number;
  costSavings: number;
  timesSaved: number;
  lastTriggered: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  weeklyTriggers: number[];
  monthlyTriggers: number[];
}

export interface CategoryPerformance {
  ruleCount: number;
  triggerCount: number;
  successRate: number;
  costSavings: number;
}

export interface DailyMetric {
  date: string;
  triggers: number;
  successes: number;
  failures: number;
  processingTime: number;
}

export interface HourlyMetric {
  hour: number;
  triggers: number;
  avgProcessingTime: number;
}

export interface ErrorMetric {
  errorType: string;
  count: number;
  percentage: number;
  description: string;
}

export interface ErrorSuggestion {
  errorType: string;
  suggestion: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  testData: any;
  expectedResults: any;
}

export interface RuleTestResult {
  scenarioId: string;
  passed: boolean;
  triggeredRules: string[];
  actualResults: any;
  expectedResults: any;
  errors?: string[];
  processingTime: number;
}

// Fractional Sales Business Rules

export interface FractionalSalesRule extends BusinessRule {
  category: 'fractional-sales';
  fractionalType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom';
  foodSafetyLevel: 'high' | 'medium' | 'low';
  complianceRequirements: string[];
  qualityStandards: QualityStandard[];
}

export interface QualityStandard {
  id: string;
  standardName: string;
  measurementType: 'time' | 'temperature' | 'appearance' | 'weight' | 'size' | 'freshness';
  minimumValue?: number;
  maximumValue?: number;
  unit: string;
  toleranceLevel: number;
  criticalControl: boolean;
  monitoringFrequency: 'continuous' | 'hourly' | 'shift' | 'daily';
}

export interface FoodSafetyRule extends BusinessRule {
  category: 'food-safety';
  hazardType: 'biological' | 'chemical' | 'physical' | 'cross-contamination';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  haccp_point: string;
  monitoringRequired: boolean;
  corrective_actions: string[];
}

export interface InventoryThresholdRule extends BusinessRule {
  category: 'inventory-management';
  itemType: 'whole-item' | 'fractional-item' | 'component';
  thresholdType: 'minimum-level' | 'reorder-point' | 'maximum-level' | 'expiration-warning';
  calculationMethod: 'static' | 'dynamic-demand' | 'seasonal' | 'predictive';
  forecastingPeriod?: number; // days
  demandVariability?: number;
  leadTimeBuffer?: number; // days
}

export interface WasteManagementRule extends BusinessRule {
  category: 'waste-management';
  wasteCategory: 'food-prep' | 'service-waste' | 'expired-items' | 'damaged-items' | 'overproduction';
  minimizationStrategy: string;
  costImpactThreshold: number;
  trackingRequired: boolean;
  reportingFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  violationType: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  location: string;
  timestamp: Date;
  detectedBy: 'system' | 'manual' | 'audit';
  status: 'open' | 'acknowledged' | 'corrective-action' | 'resolved' | 'verified';
  assignedTo?: string;
  correctiveActions: CorrectiveAction[];
  businessImpact: 'safety-risk' | 'financial-loss' | 'reputation-risk' | 'operational-inefficiency';
  estimatedCost?: number;
}

export interface CorrectiveAction {
  id: string;
  action: string;
  responsible: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  evidenceRequired: boolean;
  verificationMethod: string;
}

export interface RuleAuditTrail {
  id: string;
  ruleId: string;
  action: 'created' | 'modified' | 'activated' | 'deactivated' | 'deleted';
  changes: Record<string, { from: any; to: any }>;
  reason: string;
  performedBy: string;
  timestamp: Date;
  approvedBy?: string;
  businessJustification: string;
  impactAssessment: string;
}