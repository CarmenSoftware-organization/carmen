# Buffet Management Sub-Module - Technical PRD

## Document Information

| **Attribute**     | **Value**                         |
|-------------------|-----------------------------------|
| **Document Type** | Sub-Module Product Requirements   |
| **Version**       | 1.0.0                            |
| **Date**          | January 2025                     |
| **Status**        | Production Ready                 |
| **Owner**         | Buffet Operations Team           |
| **Parent Module** | [Operational Planning](../module-prd.md) |

---

## Executive Summary

The Buffet Management Sub-Module provides comprehensive buffet operation planning, execution, and optimization capabilities. This module enables efficient buffet service through demand forecasting, production planning, real-time monitoring, waste management, and cost optimization while maintaining food quality and safety standards.

### Key Objectives

1. **Operational Efficiency**: Optimize buffet operations through data-driven planning and real-time management
2. **Waste Reduction**: Minimize food waste through accurate demand forecasting and intelligent replenishment
3. **Cost Management**: Control food costs while maintaining quality and variety
4. **Food Safety**: Ensure HACCP compliance and food safety throughout buffet service
5. **Guest Satisfaction**: Maintain optimal food availability and quality for guest experience
6. **Staff Optimization**: Efficient staff allocation and workflow management

---

## Business Requirements

### Functional Requirements

#### BM-001: Buffet Planning and Setup
**Priority**: Critical  
**Complexity**: High

**User Story**: As a buffet manager, I want to plan buffet operations including menu selection, capacity planning, and resource allocation, so that I can deliver efficient buffet service that meets guest demand while controlling costs.

**Acceptance Criteria**:
- ✅ Comprehensive buffet event planning with capacity management
- ✅ Menu selection based on guest preferences and cost constraints
- ✅ Station layout optimization with equipment requirements
- ✅ Staff scheduling and skill requirement matching
- ✅ Production timeline generation with critical path analysis
- ✅ Cost budgeting and profitability analysis

**Technical Implementation**:
```typescript
interface BuffetPlan {
  id: string;
  name: string;
  eventType: EventType;
  date: Date;
  serviceTime: TimeRange;
  location: Location;
  
  // Capacity Planning
  expectedGuests: number;
  guestCountBreakdown: GuestCountBreakdown;
  peakServiceHours: TimeRange[];
  turnoverRate: number;
  serviceCapacity: ServiceCapacity;
  
  // Menu Configuration
  menuTheme: MenuTheme;
  stations: BuffetStation[];
  menuItems: BuffetMenuItem[];
  dietaryOptions: DietaryOption[];
  
  // Resource Planning
  staffRequirements: StaffRequirement[];
  equipmentNeeds: EquipmentRequirement[];
  setupTimeline: SetupActivity[];
  
  // Cost Management
  budgetConstraints: BudgetConstraint[];
  targetCostPerGuest: Money;
  projectedTotalCost: Money;
  profitabilityAnalysis: ProfitabilityAnalysis;
  
  // Quality Standards
  foodSafetyRequirements: FoodSafetyRequirement[];
  qualityStandards: QualityStandard[];
  
  status: BuffetPlanStatus;
  createdBy: User;
  createdAt: Date;
  approvedBy?: User;
  approvedAt?: Date;
}

interface BuffetStation {
  id: string;
  stationNumber: number;
  name: string;
  type: StationType;
  location: StationLocation;
  
  // Capacity
  servingCapacity: number; // guests per hour
  displayCapacity: number; // portions visible
  storageCapacity: number; // portions in backup
  
  // Equipment
  equipment: Equipment[];
  specialEquipment: SpecialEquipment[];
  utilities: UtilityRequirement[];
  
  // Staffing
  staffing: StationStaffing;
  skillRequirements: SkillRequirement[];
  
  // Menu Items
  menuItems: BuffetMenuItem[];
  itemRotation: ItemRotationSchedule;
  
  // Operations
  serviceHours: TimeRange;
  replenishmentSchedule: ReplenishmentSchedule[];
  cleaningSchedule: CleaningSchedule[];
}

interface BuffetMenuItem {
  id: string;
  recipe: Recipe;
  station: BuffetStation;
  
  // Quantity Planning
  plannedQuantity: number;
  minimumLevel: number;
  maximumLevel: number;
  replenishmentThreshold: number;
  productionBatches: ProductionBatch[];
  
  // Service Parameters
  servingSize: number;
  servingUnit: string;
  servingsPerBatch: number;
  holdingTime: number; // minutes
  refreshInterval: number; // minutes
  
  // Quality Control
  temperatureRange: TemperatureRange;
  qualityChecks: QualityCheck[];
  servicingTools: ServingTool[];
  
  // Cost Analysis
  costPerServing: Money;
  totalItemCost: Money;
  wastageProjection: Percentage;
  
  // Popularity Prediction
  expectedPopularity: PopularityScore;
  demandForecast: DemandForecast;
  
  lastUpdated: Date;
}

type EventType = 
  | 'BREAKFAST_BUFFET'
  | 'LUNCH_BUFFET'
  | 'DINNER_BUFFET'
  | 'BRUNCH_BUFFET'
  | 'SPECIAL_EVENT'
  | 'CONFERENCE_CATERING'
  | 'WEDDING_RECEPTION';

type StationType = 
  | 'HOT_ENTREES'
  | 'COLD_DISHES'
  | 'SALAD_BAR'
  | 'DESSERT_STATION'
  | 'BEVERAGE_STATION'
  | 'GRILL_STATION'
  | 'CARVING_STATION'
  | 'PASTA_STATION'
  | 'SOUP_STATION'
  | 'BREAD_STATION';

type BuffetPlanStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_EXECUTION' | 'COMPLETED' | 'CANCELLED';

class BuffetPlanningService {
  async createBuffetPlan(
    planRequest: BuffetPlanRequest
  ): Promise<BuffetPlan> {
    // Forecast guest demand
    const demandForecast = await this.forecastDemand(
      planRequest.eventType,
      planRequest.expectedGuests,
      planRequest.date
    );
    
    // Optimize station layout
    const stationLayout = await this.optimizeStationLayout(
      planRequest.venue,
      planRequest.expectedGuests,
      planRequest.menuPreferences
    );
    
    // Generate menu recommendations
    const menuRecommendations = await this.recommendMenuItems(
      planRequest.eventType,
      demandForecast,
      planRequest.budgetConstraints
    );
    
    // Calculate resource requirements
    const resourceRequirements = await this.calculateResourceRequirements(
      stationLayout,
      menuRecommendations,
      demandForecast
    );
    
    // Create production timeline
    const productionTimeline = await this.generateProductionTimeline(
      menuRecommendations,
      planRequest.serviceTime
    );
    
    return {
      id: generateId(),
      name: planRequest.name,
      eventType: planRequest.eventType,
      date: planRequest.date,
      serviceTime: planRequest.serviceTime,
      location: planRequest.location,
      expectedGuests: demandForecast.totalGuests,
      guestCountBreakdown: demandForecast.breakdown,
      stations: stationLayout.stations,
      menuItems: menuRecommendations,
      staffRequirements: resourceRequirements.staffing,
      equipmentNeeds: resourceRequirements.equipment,
      setupTimeline: productionTimeline.setupActivities,
      targetCostPerGuest: planRequest.targetCostPerGuest,
      projectedTotalCost: this.calculateTotalCost(menuRecommendations, resourceRequirements),
      status: 'DRAFT',
      createdBy: this.getCurrentUser(),
      createdAt: new Date()
    };
  }
  
  async optimizeBuffetLayout(
    venue: Venue,
    expectedGuests: number,
    serviceTime: TimeRange
  ): Promise<BuffetLayoutOptimization> {
    // Consider guest flow patterns
    const guestFlowAnalysis = await this.analyzeGuestFlow(venue, expectedGuests);
    
    // Optimize station positioning
    const stationPositioning = this.optimizeStationPositioning(
      guestFlowAnalysis,
      venue.layout
    );
    
    // Calculate optimal capacity distribution
    const capacityDistribution = this.calculateCapacityDistribution(
      expectedGuests,
      serviceTime,
      stationPositioning
    );
    
    return {
      layout: stationPositioning,
      capacityDistribution,
      guestFlowOptimization: guestFlowAnalysis,
      efficiency: this.calculateLayoutEfficiency(stationPositioning)
    };
  }
}
```

---

#### BM-002: Demand Forecasting and Production Planning
**Priority**: Critical  
**Complexity**: High

**User Story**: As a production manager, I want accurate demand forecasting and automated production planning, so that I can optimize food production quantities and minimize waste while ensuring adequate supply.

**Acceptance Criteria**:
- ✅ Demand forecasting based on historical data and event characteristics
- ✅ Item-level consumption prediction with confidence intervals
- ✅ Production batch optimization with timing considerations
- ✅ Ingredient requirement calculation with procurement integration
- ✅ Production schedule generation with resource constraints
- ✅ Contingency planning for demand variations

**Demand Forecasting Engine**:
```typescript
interface DemandForecast {
  buffetPlanId: string;
  forecastDate: Date;
  eventCharacteristics: EventCharacteristics;
  
  // Overall Demand
  totalGuestForecast: GuestForecast;
  peakDemandPeriods: PeakDemandPeriod[];
  demandDistribution: HourlyDemandDistribution[];
  
  // Item-Level Forecasts
  itemForecasts: ItemDemandForecast[];
  
  // Confidence & Accuracy
  forecastConfidence: ConfidenceLevel;
  forecastAccuracy: ForecastAccuracy;
  uncertaintyFactors: UncertaintyFactor[];
  
  // Contingency Planning
  scenarioPlanning: DemandScenario[];
  contingencyTriggers: ContingencyTrigger[];
  
  generatedAt: Date;
  generatedBy: ForecastingModel;
}

interface ItemDemandForecast {
  menuItemId: string;
  itemName: string;
  category: ItemCategory;
  
  // Demand Prediction
  baselineDemand: number;
  adjustedDemand: number;
  demandRange: DemandRange;
  consumptionRate: ConsumptionRate;
  
  // Factors Influencing Demand
  popularityScore: PopularityScore;
  seasonalityFactor: SeasonalityFactor;
  eventTypeFactor: EventTypeFactor;
  competingItemsImpact: CompetingItemsImpact;
  
  // Production Requirements
  recommendedProductionQuantity: number;
  productionBatches: ProductionBatchRecommendation[];
  safetyStock: number;
  
  // Quality Considerations
  holdingTimeConstraint: number; // minutes
  qualityDegradationRate: QualityDegradationRate;
  optimalRefreshSchedule: RefreshSchedule[];
  
  confidenceLevel: ConfidenceLevel;
  lastUpdated: Date;
}

interface ProductionPlan {
  id: string;
  buffetPlanId: string;
  demandForecastId: string;
  planDate: Date;
  
  // Production Schedule
  productionSchedule: ProductionScheduleItem[];
  criticalPath: CriticalPathAnalysis;
  resourceAllocation: ResourceAllocation;
  
  // Batch Planning
  productionBatches: ProductionBatch[];
  batchOptimization: BatchOptimization;
  
  // Quality Management
  qualityControlPoints: QualityControlPoint[];
  hacccpCompliance: HACCPCompliance;
  
  // Cost Analysis
  totalProductionCost: Money;
  costPerGuest: Money;
  materialCosts: MaterialCost[];
  laborCosts: LaborCost[];
  
  // Risk Management
  riskAssessment: ProductionRiskAssessment;
  contingencyPlans: ContingencyPlan[];
  
  status: ProductionPlanStatus;
  createdBy: User;
  createdAt: Date;
}

interface ProductionBatch {
  id: string;
  recipeId: string;
  batchNumber: string;
  plannedQuantity: number;
  
  // Timing
  startTime: Date;
  prepDuration: number; // minutes
  cookDuration: number; // minutes
  finishTime: Date;
  serviceReadyTime: Date;
  
  // Resources
  assignedStaff: StaffAssignment[];
  requiredEquipment: EquipmentAssignment[];
  ingredients: IngredientRequirement[];
  
  // Quality
  temperatureRequirements: TemperatureRequirement;
  qualityChecks: BatchQualityCheck[];
  holdingInstructions: HoldingInstruction[];
  
  // Tracking
  actualQuantity?: number;
  actualStartTime?: Date;
  actualFinishTime?: Date;
  qualityScore?: QualityScore;
  
  status: BatchStatus;
}

type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type ProductionPlanStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
type BatchStatus = 'PLANNED' | 'IN_PREP' | 'COOKING' | 'READY' | 'SERVED' | 'DISPOSED';

class DemandForecastingService {
  async generateDemandForecast(
    buffetPlan: BuffetPlan,
    historicalData: HistoricalBuffetData[]
  ): Promise<DemandForecast> {
    // Analyze historical patterns
    const historicalAnalysis = await this.analyzeHistoricalPatterns(
      historicalData,
      buffetPlan.eventType,
      buffetPlan.date
    );
    
    // Apply machine learning forecasting
    const mlForecast = await this.applyMLForecasting(
      buffetPlan,
      historicalAnalysis
    );
    
    // Adjust for event-specific factors
    const adjustedForecast = this.adjustForEventFactors(
      mlForecast,
      buffetPlan.eventCharacteristics
    );
    
    // Generate item-level forecasts
    const itemForecasts = await Promise.all(
      buffetPlan.menuItems.map(item => 
        this.forecastItemDemand(item, adjustedForecast, historicalAnalysis)
      )
    );
    
    // Calculate confidence levels
    const confidence = this.calculateForecastConfidence(
      adjustedForecast,
      historicalAnalysis.variance
    );
    
    return {
      buffetPlanId: buffetPlan.id,
      forecastDate: new Date(),
      eventCharacteristics: buffetPlan.eventCharacteristics,
      totalGuestForecast: adjustedForecast.guestForecast,
      peakDemandPeriods: adjustedForecast.peakPeriods,
      demandDistribution: adjustedForecast.hourlyDistribution,
      itemForecasts,
      forecastConfidence: confidence.overall,
      forecastAccuracy: await this.calculateHistoricalAccuracy(),
      scenarioPlanning: this.generateScenarioPlanning(adjustedForecast),
      generatedAt: new Date(),
      generatedBy: 'ML_FORECASTING_v2.1'
    };
  }
  
  async createProductionPlan(
    buffetPlan: BuffetPlan,
    demandForecast: DemandForecast
  ): Promise<ProductionPlan> {
    // Optimize production batches
    const batchOptimization = await this.optimizeProductionBatches(
      demandForecast.itemForecasts,
      buffetPlan.serviceTime
    );
    
    // Schedule production activities
    const productionSchedule = await this.scheduleProduction(
      batchOptimization.batches,
      buffetPlan.resourceConstraints
    );
    
    // Perform critical path analysis
    const criticalPath = this.analyzeCriticalPath(productionSchedule);
    
    // Allocate resources
    const resourceAllocation = await this.allocateResources(
      productionSchedule,
      buffetPlan.resourceAvailability
    );
    
    return {
      id: generateId(),
      buffetPlanId: buffetPlan.id,
      demandForecastId: demandForecast.id,
      planDate: new Date(),
      productionSchedule,
      criticalPath,
      resourceAllocation,
      productionBatches: batchOptimization.batches,
      batchOptimization,
      totalProductionCost: this.calculateProductionCost(batchOptimization),
      costPerGuest: this.calculateCostPerGuest(batchOptimization, demandForecast),
      riskAssessment: await this.assessProductionRisks(productionSchedule),
      contingencyPlans: this.generateContingencyPlans(criticalPath),
      status: 'PLANNED',
      createdBy: this.getCurrentUser(),
      createdAt: new Date()
    };
  }
}
```

---

#### BM-003: Real-time Buffet Monitoring
**Priority**: High  
**Complexity**: Medium

**User Story**: As a buffet supervisor, I want real-time monitoring of buffet stations and inventory levels, so that I can ensure optimal food availability and make timely replenishment decisions.

**Acceptance Criteria**:
- ✅ Real-time monitoring of buffet station levels and temperatures
- ✅ Automated alerts for low stock and quality issues
- ✅ Guest flow tracking and queue management
- ✅ Staff performance monitoring and task management
- ✅ Food safety compliance monitoring and alerts
- ✅ Mobile interface for on-the-floor management

**Real-time Monitoring System**:
```typescript
interface BuffetMonitoringSystem {
  buffetPlanId: string;
  stations: StationMonitor[];
  alerts: Alert[];
  performance: BuffetPerformance;
  guestFlow: GuestFlowMonitoring;
  lastUpdated: Date;
}

interface StationMonitor {
  stationId: string;
  stationName: string;
  type: StationType;
  
  // Inventory Monitoring
  inventoryLevels: InventoryLevel[];
  replenishmentAlerts: ReplenishmentAlert[];
  stockoutRisk: StockoutRisk;
  
  // Quality Monitoring
  temperatureReadings: TemperatureReading[];
  qualityAlerts: QualityAlert[];
  foodSafetyStatus: FoodSafetyStatus;
  
  // Service Monitoring
  serviceRate: ServiceRate;
  guestWaitTime: WaitTime;
  staffEfficiency: StaffEfficiency;
  
  // Equipment Status
  equipmentStatus: EquipmentStatus[];
  maintenanceAlerts: MaintenanceAlert[];
  
  status: StationStatus;
  lastUpdated: Date;
}

interface InventoryLevel {
  menuItemId: string;
  itemName: string;
  currentLevel: number;
  minimumLevel: number;
  maximumLevel: number;
  currentPercentage: Percentage;
  
  // Consumption Tracking
  consumptionRate: ConsumptionRate;
  projectedStockoutTime: Date;
  replenishmentRecommendation: ReplenishmentRecommendation;
  
  // Quality Tracking
  qualityScore: QualityScore;
  remainingHoldTime: number; // minutes
  nextQualityCheck: Date;
  
  lastUpdated: Date;
}

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  stationId?: string;
  menuItemId?: string;
  
  message: string;
  description: string;
  recommendedAction: string;
  
  triggeredAt: Date;
  acknowledgedBy?: User;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  status: AlertStatus;
}

interface GuestFlowMonitoring {
  totalGuests: number;
  currentGuests: number;
  guestArrivalRate: number; // per minute
  averageServiceTime: number; // minutes
  
  // Station-wise Flow
  stationFlow: StationFlow[];
  
  // Queue Management
  queues: QueueStatus[];
  averageWaitTime: WaitTime;
  
  // Satisfaction Indicators
  guestSatisfactionScore: SatisfactionScore;
  complaintRate: ComplaintRate;
  
  lastUpdated: Date;
}

type AlertType = 
  | 'LOW_INVENTORY'
  | 'STOCKOUT'
  | 'TEMPERATURE_VIOLATION'
  | 'QUALITY_ISSUE'
  | 'EQUIPMENT_FAILURE'
  | 'STAFF_SHORTAGE'
  | 'GUEST_COMPLAINT'
  | 'FOOD_SAFETY_VIOLATION';

type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
type StationStatus = 'ACTIVE' | 'RESTOCKING' | 'MAINTENANCE' | 'CLOSED';

class BuffetMonitoringService {
  async startBuffetMonitoring(buffetPlanId: string): Promise<BuffetMonitoringSystem> {
    const buffetPlan = await this.getBuffetPlan(buffetPlanId);
    
    // Initialize monitoring for each station
    const stationMonitors = await Promise.all(
      buffetPlan.stations.map(station => 
        this.initializeStationMonitoring(station)
      )
    );
    
    // Start real-time data collection
    await this.startRealTimeDataCollection(stationMonitors);
    
    // Initialize alert system
    const alertSystem = await this.initializeAlertSystem(buffetPlan);
    
    return {
      buffetPlanId,
      stations: stationMonitors,
      alerts: [],
      performance: await this.initializePerformanceTracking(buffetPlan),
      guestFlow: await this.initializeGuestFlowTracking(),
      lastUpdated: new Date()
    };
  }
  
  async updateStationInventory(
    stationId: string,
    inventoryUpdates: InventoryUpdate[]
  ): Promise<StationInventoryUpdate> {
    // Update inventory levels
    const updatedLevels = await this.processInventoryUpdates(stationId, inventoryUpdates);
    
    // Check for alert conditions
    const alertsTriggered = await this.checkAlertConditions(updatedLevels);
    
    // Generate replenishment recommendations
    const replenishmentRecommendations = await this.generateReplenishmentRecommendations(
      updatedLevels
    );
    
    // Update consumption forecasts
    await this.updateConsumptionForecasts(stationId, updatedLevels);
    
    return {
      stationId,
      updatedLevels,
      alertsTriggered,
      replenishmentRecommendations,
      timestamp: new Date()
    };
  }
  
  async processAlert(
    alertId: string,
    action: AlertAction,
    userId: string
  ): Promise<AlertProcessingResult> {
    const alert = await this.getAlert(alertId);
    
    switch (action.type) {
      case 'ACKNOWLEDGE':
        return this.acknowledgeAlert(alert, userId);
        
      case 'RESOLVE':
        return this.resolveAlert(alert, action.resolution, userId);
        
      case 'ESCALATE':
        return this.escalateAlert(alert, action.escalationLevel, userId);
        
      case 'DISMISS':
        return this.dismissAlert(alert, action.reason, userId);
        
      default:
        throw new Error(`Unsupported alert action: ${action.type}`);
    }
  }
  
  async generateBuffetStatusReport(): Promise<BuffetStatusReport> {
    return {
      overallStatus: await this.calculateOverallStatus(),
      stationSummary: await this.generateStationSummary(),
      alertsSummary: await this.generateAlertsSummary(),
      performanceMetrics: await this.generatePerformanceMetrics(),
      guestExperience: await this.generateGuestExperienceMetrics(),
      costAnalysis: await this.generateRealTimeCostAnalysis(),
      recommendations: await this.generateOptimizationRecommendations(),
      generatedAt: new Date()
    };
  }
}
```

---

#### BM-004: Waste Management and Cost Optimization
**Priority**: High  
**Complexity**: Medium

**User Story**: As a cost controller, I want comprehensive waste tracking and cost optimization tools, so that I can minimize food waste, control costs, and improve profitability while maintaining service quality.

**Acceptance Criteria**:
- ✅ Real-time waste tracking by item and station
- ✅ Waste root cause analysis and prevention strategies
- ✅ Cost impact analysis of waste and optimization opportunities
- ✅ Automated recommendations for quantity adjustments
- ✅ Sustainability reporting and environmental impact tracking
- ✅ Integration with procurement for inventory optimization

**Waste Management System**:
```typescript
interface WasteManagementSystem {
  buffetPlanId: string;
  wasteTracking: WasteTracking;
  costAnalysis: WasteCostAnalysis;
  optimization: WasteOptimization;
  sustainability: SustainabilityMetrics;
  preventionStrategies: PreventionStrategy[];
  lastUpdated: Date;
}

interface WasteTracking {
  totalWaste: WasteMetric;
  wasteByCategory: CategoryWaste[];
  wasteByStation: StationWaste[];
  wasteByItem: ItemWaste[];
  wasteTrends: WasteTrend[];
  wasteReasons: WasteReason[];
}

interface ItemWaste {
  menuItemId: string;
  itemName: string;
  category: ItemCategory;
  
  // Waste Quantities
  producedQuantity: number;
  servedQuantity: number;
  wastedQuantity: number;
  wastePercentage: Percentage;
  
  // Waste Analysis
  wasteType: WasteType;
  wasteReason: WasteReasonCode;
  wasteStage: WasteStage;
  
  // Cost Impact
  wasteValue: Money;
  opportunityCost: Money;
  
  // Time Analysis
  wasteOccurredAt: Date;
  holdingTimeExceeded: boolean;
  qualityDegradation: QualityDegradation;
  
  // Prevention Opportunities
  preventionOpportunities: PreventionOpportunity[];
  
  recordedBy: User;
  recordedAt: Date;
}

interface WasteCostAnalysis {
  totalWasteCost: Money;
  wasteAsPercentageOfRevenue: Percentage;
  wasteAsPercentageOfFoodCost: Percentage;
  
  // Cost Breakdown
  ingredientWasteCost: Money;
  laborWasteCost: Money;
  opportunityCost: Money;
  disposalCost: Money;
  
  // Impact Analysis
  profitImpact: Money;
  costPerGuestImpact: Money;
  marginImpact: Percentage;
  
  // Trends
  costTrends: CostTrend[];
  benchmark: WasteBenchmark;
  
  calculatedAt: Date;
}

interface WasteOptimization {
  currentWasteLevel: Percentage;
  targetWasteLevel: Percentage;
  improvementPotential: Percentage;
  
  // Optimization Recommendations
  quantityAdjustments: QuantityAdjustment[];
  productionOptimizations: ProductionOptimization[];
  serviceOptimizations: ServiceOptimization[];
  
  // ROI Analysis
  optimizationROI: ROIAnalysis;
  implementationCost: Money;
  projectedSavings: Money;
  
  generatedAt: Date;
}

interface PreventionStrategy {
  id: string;
  strategyType: PreventionStrategyType;
  targetWasteType: WasteType;
  
  description: string;
  implementationSteps: ImplementationStep[];
  
  // Impact Projections
  projectedWasteReduction: Percentage;
  projectedCostSaving: Money;
  implementationCost: Money;
  paybackPeriod: number; // months
  
  // Success Metrics
  kpiMetrics: KPIMetric[];
  successCriteria: SuccessCriterion[];
  
  status: StrategyStatus;
  implementedAt?: Date;
  results?: StrategyResults;
}

type WasteType = 
  | 'OVERPRODUCTION'
  | 'QUALITY_DETERIORATION'
  | 'TEMPERATURE_ABUSE'
  | 'CROSS_CONTAMINATION'
  | 'HOLDING_TIME_EXCEEDED'
  | 'GUEST_PLATE_WASTE'
  | 'PREPARATION_WASTE'
  | 'SPOILAGE';

type WasteStage = 
  | 'PREPARATION'
  | 'COOKING'
  | 'HOLDING'
  | 'SERVICE'
  | 'CLEANUP';

type PreventionStrategyType = 
  | 'DEMAND_FORECASTING'
  | 'PRODUCTION_OPTIMIZATION'
  | 'PORTION_CONTROL'
  | 'QUALITY_MANAGEMENT'
  | 'SERVICE_OPTIMIZATION'
  | 'STAFF_TRAINING';

class WasteManagementService {
  async recordWaste(
    wasteRecord: WasteRecord
  ): Promise<WasteRecordingResult> {
    // Validate and process waste record
    const processedRecord = await this.processWasteRecord(wasteRecord);
    
    // Analyze waste patterns
    const wasteAnalysis = await this.analyzeWastePatterns(processedRecord);
    
    // Update cost calculations
    const costImpact = await this.calculateWasteCostImpact(processedRecord);
    
    // Generate prevention recommendations
    const preventionRecommendations = await this.generatePreventionRecommendations(
      wasteAnalysis
    );
    
    // Update forecasting models
    await this.updateForecastingModels(processedRecord);
    
    return {
      recordId: processedRecord.id,
      costImpact,
      wasteAnalysis,
      preventionRecommendations,
      alertsTriggered: await this.checkWasteAlerts(processedRecord),
      recordedAt: new Date()
    };
  }
  
  async generateWasteOptimizationPlan(
    buffetPlanId: string,
    optimizationGoals: OptimizationGoals
  ): Promise<WasteOptimizationPlan> {
    const historicalWasteData = await this.getHistoricalWasteData(buffetPlanId);
    const currentPerformance = await this.calculateCurrentWastePerformance(buffetPlanId);
    
    // Identify optimization opportunities
    const opportunities = await this.identifyOptimizationOpportunities(
      historicalWasteData,
      currentPerformance,
      optimizationGoals
    );
    
    // Prioritize by ROI
    const prioritizedOpportunities = this.prioritizeByROI(opportunities);
    
    // Create implementation plan
    const implementationPlan = await this.createImplementationPlan(
      prioritizedOpportunities
    );
    
    return {
      buffetPlanId,
      currentWasteLevel: currentPerformance.wastePercentage,
      targetWasteLevel: optimizationGoals.targetWastePercentage,
      optimizationOpportunities: prioritizedOpportunities,
      implementationPlan,
      projectedSavings: this.calculateProjectedSavings(prioritizedOpportunities),
      roi: this.calculateOptimizationROI(prioritizedOpportunities),
      createdAt: new Date()
    };
  }
  
  async trackSustainabilityMetrics(
    buffetPlanId: string
  ): Promise<SustainabilityMetrics> {
    const wasteData = await this.getWasteData(buffetPlanId);
    
    return {
      carbonFootprint: await this.calculateCarbonFootprint(wasteData),
      waterFootprint: await this.calculateWaterFootprint(wasteData),
      wasteToLandfill: this.calculateWasteToLandfill(wasteData),
      recyclingRate: this.calculateRecyclingRate(wasteData),
      compostingRate: this.calculateCompostingRate(wasteData),
      sustainabilityScore: await this.calculateSustainabilityScore(wasteData),
      certificationCompliance: await this.checkCertificationCompliance(wasteData),
      improvementRecommendations: await this.generateSustainabilityRecommendations(wasteData),
      lastUpdated: new Date()
    };
  }
}
```

---

#### BM-005: Quality Control and Food Safety
**Priority**: Critical  
**Complexity**: Medium

**User Story**: As a food safety manager, I want comprehensive quality control and HACCP compliance monitoring, so that I can ensure food safety standards are maintained throughout buffet operations.

**Acceptance Criteria**:
- ✅ Automated temperature monitoring and alerts
- ✅ HACCP critical control point tracking
- ✅ Quality inspection scheduling and documentation
- ✅ Food safety incident management
- ✅ Regulatory compliance reporting
- ✅ Staff training and certification tracking

**Quality Control System**:
```typescript
interface QualityControlSystem {
  buffetPlanId: string;
  haccpCompliance: HACCPCompliance;
  qualityChecks: QualityCheck[];
  temperatureMonitoring: TemperatureMonitoring;
  foodSafetyIncidents: FoodSafetyIncident[];
  complianceReports: ComplianceReport[];
  lastUpdated: Date;
}

interface HACCPCompliance {
  plan: HACCPPlan;
  criticalControlPoints: CriticalControlPoint[];
  monitoringRecords: MonitoringRecord[];
  correctiveActions: CorrectiveAction[];
  verification: VerificationRecord[];
  complianceStatus: ComplianceStatus;
}

interface CriticalControlPoint {
  id: string;
  ccpNumber: number;
  processStep: string;
  hazard: FoodSafetyHazard;
  criticalLimits: CriticalLimit[];
  monitoringProcedure: MonitoringProcedure;
  correctiveAction: CorrectiveActionPlan;
  
  // Current Status
  currentValue: number;
  status: CCPStatus;
  lastMonitored: Date;
  monitoredBy: User;
  
  // Alerts
  alertThresholds: AlertThreshold[];
  activeAlerts: QualityAlert[];
}

interface QualityCheck {
  id: string;
  type: QualityCheckType;
  scheduleType: ScheduleType;
  frequency: CheckFrequency;
  
  // Scope
  stationId?: string;
  menuItemId?: string;
  equipmentId?: string;
  
  // Check Parameters
  checkParameters: QualityParameter[];
  passingCriteria: PassingCriterion[];
  
  // Execution
  scheduledTime: Date;
  actualTime?: Date;
  checkedBy?: User;
  results?: QualityCheckResult[];
  
  // Outcomes
  status: QualityCheckStatus;
  passed: boolean;
  issues: QualityIssue[];
  correctiveActions: CorrectiveAction[];
}

interface TemperatureMonitoring {
  monitoringPoints: TemperatureMonitoringPoint[];
  temperatureLog: TemperatureReading[];
  alerts: TemperatureAlert[];
  complianceStatus: TemperatureComplianceStatus;
}

interface TemperatureMonitoringPoint {
  id: string;
  location: MonitoringLocation;
  type: TemperatureType;
  
  // Requirements
  minimumTemperature?: number;
  maximumTemperature?: number;
  targetRange: TemperatureRange;
  
  // Monitoring Configuration
  monitoringInterval: number; // minutes
  alertThresholds: TemperatureAlertThreshold[];
  
  // Current Status
  currentTemperature: number;
  status: TemperatureStatus;
  lastReading: Date;
  
  // Equipment
  sensorId: string;
  calibrationDate: Date;
  nextCalibrationDue: Date;
}

type QualityCheckType = 
  | 'TEMPERATURE_CHECK'
  | 'VISUAL_INSPECTION'
  | 'TASTE_TEST'
  | 'PRESENTATION_CHECK'
  | 'CLEANLINESS_INSPECTION'
  | 'EQUIPMENT_CHECK'
  | 'HACCP_VERIFICATION';

type CCPStatus = 'IN_CONTROL' | 'OUT_OF_CONTROL' | 'WARNING' | 'NOT_MONITORED';
type TemperatureStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_ERROR';
type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING' | 'UNDER_REVIEW';

class QualityControlService {
  async initializeQualityControl(
    buffetPlan: BuffetPlan
  ): Promise<QualityControlSystem> {
    // Create HACCP plan for buffet
    const haccpPlan = await this.createHACCPPlan(buffetPlan);
    
    // Set up critical control points
    const ccps = await this.setupCriticalControlPoints(buffetPlan, haccpPlan);
    
    // Configure temperature monitoring
    const temperatureMonitoring = await this.configureTemperatureMonitoring(buffetPlan);
    
    // Schedule quality checks
    const qualityChecks = await this.scheduleQualityChecks(buffetPlan);
    
    return {
      buffetPlanId: buffetPlan.id,
      haccpCompliance: {
        plan: haccpPlan,
        criticalControlPoints: ccps,
        monitoringRecords: [],
        correctiveActions: [],
        verification: [],
        complianceStatus: 'COMPLIANT'
      },
      qualityChecks,
      temperatureMonitoring,
      foodSafetyIncidents: [],
      complianceReports: [],
      lastUpdated: new Date()
    };
  }
  
  async performQualityCheck(
    qualityCheckId: string,
    checkResults: QualityCheckInput[]
  ): Promise<QualityCheckResult> {
    const qualityCheck = await this.getQualityCheck(qualityCheckId);
    
    // Process check results
    const processedResults = await this.processQualityCheckResults(
      qualityCheck,
      checkResults
    );
    
    // Determine pass/fail status
    const overallResult = this.evaluateQualityCheckResults(
      processedResults,
      qualityCheck.passingCriteria
    );
    
    // Handle failures
    if (!overallResult.passed) {
      const correctiveActions = await this.initiateCorrectiveActions(
        qualityCheck,
        processedResults.failures
      );
      
      await this.notifyQualityFailure(qualityCheck, correctiveActions);
    }
    
    // Update monitoring records
    await this.updateMonitoringRecords(qualityCheck, processedResults);
    
    return {
      qualityCheckId,
      passed: overallResult.passed,
      results: processedResults,
      issues: overallResult.issues,
      correctiveActions: overallResult.correctiveActions,
      completedAt: new Date()
    };
  }
  
  async handleFoodSafetyIncident(
    incident: FoodSafetyIncidentReport
  ): Promise<IncidentResponse> {
    // Assess incident severity
    const severityAssessment = await this.assessIncidentSeverity(incident);
    
    // Implement immediate response
    const immediateActions = await this.implementImmediateResponse(
      incident,
      severityAssessment
    );
    
    // Investigate root cause
    const rootCauseAnalysis = await this.conductRootCauseAnalysis(incident);
    
    // Develop corrective and preventive actions
    const capaPlans = await this.developCAPAPlans(rootCauseAnalysis);
    
    // Create incident record
    const incidentRecord = await this.createIncidentRecord(
      incident,
      severityAssessment,
      immediateActions,
      rootCauseAnalysis,
      capaPlans
    );
    
    // Notify relevant stakeholders
    await this.notifyStakeholders(incidentRecord);
    
    return {
      incidentId: incidentRecord.id,
      severity: severityAssessment.level,
      immediateActions,
      investigationRequired: severityAssessment.requiresInvestigation,
      regulatoryNotificationRequired: severityAssessment.requiresRegulatoryNotification,
      estimatedResolutionTime: capaPlans.estimatedImplementationTime,
      responseInitiatedAt: new Date()
    };
  }
  
  async generateComplianceReport(
    period: DateRange,
    reportType: ComplianceReportType
  ): Promise<ComplianceReport> {
    const complianceData = await this.gatherComplianceData(period);
    
    return {
      period,
      reportType,
      overallComplianceScore: this.calculateOverallCompliance(complianceData),
      haccpCompliance: this.analyzeHACCPCompliance(complianceData),
      temperatureCompliance: this.analyzeTemperatureCompliance(complianceData),
      qualityCheckCompliance: this.analyzeQualityCheckCompliance(complianceData),
      incidents: this.summarizeIncidents(complianceData),
      correctiveActions: this.summarizeCorrectiveActions(complianceData),
      improvements: this.identifyImprovementOpportunities(complianceData),
      generatedAt: new Date()
    };
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Demand Forecasting**: <10 seconds for comprehensive demand analysis
- **Production Planning**: <15 seconds for optimized production schedules
- **Real-time Monitoring**: <2 seconds for inventory level updates
- **Alert Processing**: <1 second for critical alert generation
- **Quality Check Recording**: <3 seconds for quality check completion

#### Scalability Requirements
- **Concurrent Buffets**: Support 50+ simultaneous buffet operations
- **Menu Items**: Handle 500+ menu items per buffet
- **Monitoring Points**: Support 1,000+ temperature/quality monitoring points
- **Historical Data**: Process 3+ years of buffet operational data

#### Reliability Requirements
- **System Uptime**: 99.9% availability during buffet service hours
- **Data Accuracy**: 99.5% accuracy in demand forecasting
- **Alert Reliability**: 100% critical alert delivery within SLA
- **Temperature Monitoring**: 99.8% temperature reading accuracy

---

## Technical Architecture

### Database Schema

```sql
-- Buffet plans table
CREATE TABLE buffet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    event_type event_type NOT NULL,
    event_date DATE NOT NULL,
    service_start_time TIME NOT NULL,
    service_end_time TIME NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Capacity Planning
    expected_guests INTEGER NOT NULL,
    peak_service_start TIME,
    peak_service_end TIME,
    turnover_rate DECIMAL(5,2) DEFAULT 1.0,
    service_capacity INTEGER,
    
    -- Cost Management
    target_cost_per_guest DECIMAL(15,4),
    projected_total_cost DECIMAL(15,4),
    actual_total_cost DECIMAL(15,4),
    
    -- Planning Data (JSON)
    guest_breakdown JSONB,
    resource_requirements JSONB,
    setup_timeline JSONB,
    budget_constraints JSONB,
    
    status buffet_plan_status DEFAULT 'DRAFT',
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_buffet_plan_date (event_date),
    INDEX idx_buffet_plan_location (location_id),
    INDEX idx_buffet_plan_status (status),
    INDEX idx_buffet_plan_type (event_type)
);

-- Buffet stations table
CREATE TABLE buffet_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_plan_id UUID REFERENCES buffet_plans(id) ON DELETE CASCADE,
    station_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type station_type NOT NULL,
    
    -- Capacity
    serving_capacity INTEGER NOT NULL, -- guests per hour
    display_capacity INTEGER NOT NULL, -- portions visible
    storage_capacity INTEGER, -- portions in backup
    
    -- Location and Setup
    station_location JSONB, -- x, y coordinates, dimensions
    equipment_requirements JSONB,
    utility_requirements JSONB,
    
    -- Staffing
    staff_requirements JSONB,
    skill_requirements JSONB,
    
    -- Service Configuration
    service_start_time TIME,
    service_end_time TIME,
    
    status station_status DEFAULT 'PLANNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(buffet_plan_id, station_number),
    INDEX idx_buffet_station_plan (buffet_plan_id),
    INDEX idx_buffet_station_type (type)
);

-- Buffet menu items table
CREATE TABLE buffet_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_plan_id UUID REFERENCES buffet_plans(id) ON DELETE CASCADE,
    station_id UUID REFERENCES buffet_stations(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) NOT NULL,
    
    -- Quantity Planning
    planned_quantity DECIMAL(12,4) NOT NULL,
    minimum_level DECIMAL(12,4) NOT NULL,
    maximum_level DECIMAL(12,4) NOT NULL,
    replenishment_threshold DECIMAL(12,4) NOT NULL,
    
    -- Service Parameters
    serving_size DECIMAL(10,4) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    servings_per_batch INTEGER NOT NULL,
    holding_time INTEGER NOT NULL, -- minutes
    refresh_interval INTEGER, -- minutes
    
    -- Quality Control
    temperature_min DECIMAL(5,2), -- celsius
    temperature_max DECIMAL(5,2), -- celsius
    quality_check_interval INTEGER, -- minutes
    
    -- Cost Analysis
    cost_per_serving DECIMAL(15,6) NOT NULL,
    total_item_cost DECIMAL(15,4) NOT NULL,
    projected_wastage_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Demand Forecasting
    expected_popularity INTEGER, -- 0-100 score
    demand_forecast JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_buffet_item_plan (buffet_plan_id),
    INDEX idx_buffet_item_station (station_id),
    INDEX idx_buffet_item_recipe (recipe_id)
);

-- Production batches table
CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_menu_item_id UUID REFERENCES buffet_menu_items(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    recipe_id UUID REFERENCES recipes(id) NOT NULL,
    
    -- Planning
    planned_quantity DECIMAL(12,4) NOT NULL,
    planned_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_finish_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_ready_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Execution
    actual_quantity DECIMAL(12,4),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_finish_time TIMESTAMP WITH TIME ZONE,
    
    -- Resource Assignment
    assigned_staff JSONB,
    required_equipment JSONB,
    ingredients JSONB,
    
    -- Quality Control
    temperature_requirements JSONB,
    quality_checks JSONB,
    holding_instructions TEXT,
    quality_score INTEGER, -- 0-100
    
    status batch_status DEFAULT 'PLANNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_production_batch_item (buffet_menu_item_id),
    INDEX idx_production_batch_recipe (recipe_id),
    INDEX idx_production_batch_status (status),
    INDEX idx_production_batch_start (planned_start_time)
);

-- Buffet monitoring table
CREATE TABLE buffet_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES buffet_stations(id) NOT NULL,
    menu_item_id UUID REFERENCES buffet_menu_items(id) NOT NULL,
    
    -- Inventory Levels
    current_level DECIMAL(12,4) NOT NULL,
    current_percentage DECIMAL(5,2) NOT NULL,
    consumption_rate DECIMAL(10,4), -- units per hour
    projected_stockout_time TIMESTAMP WITH TIME ZONE,
    
    -- Quality Metrics
    temperature DECIMAL(5,2),
    quality_score INTEGER, -- 0-100
    remaining_hold_time INTEGER, -- minutes
    next_quality_check TIMESTAMP WITH TIME ZONE,
    
    -- Service Metrics
    service_rate DECIMAL(10,4), -- servings per hour
    guest_wait_time DECIMAL(8,2), -- seconds
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    
    INDEX idx_monitoring_station (station_id),
    INDEX idx_monitoring_item (menu_item_id),
    INDEX idx_monitoring_time (recorded_at)
);

-- Waste tracking table
CREATE TABLE waste_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_plan_id UUID REFERENCES buffet_plans(id) NOT NULL,
    station_id UUID REFERENCES buffet_stations(id),
    menu_item_id UUID REFERENCES buffet_menu_items(id) NOT NULL,
    
    -- Waste Details
    wasted_quantity DECIMAL(12,4) NOT NULL,
    waste_unit VARCHAR(50) NOT NULL,
    waste_type waste_type NOT NULL,
    waste_reason waste_reason_code NOT NULL,
    waste_stage waste_stage NOT NULL,
    
    -- Cost Impact
    waste_value DECIMAL(15,4) NOT NULL,
    opportunity_cost DECIMAL(15,4),
    
    -- Analysis
    produced_quantity DECIMAL(12,4),
    served_quantity DECIMAL(12,4),
    waste_percentage DECIMAL(5,2),
    
    -- Quality Information
    holding_time_exceeded BOOLEAN DEFAULT FALSE,
    temperature_abuse BOOLEAN DEFAULT FALSE,
    quality_degradation JSONB,
    
    -- Prevention
    prevention_opportunities JSONB,
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id) NOT NULL,
    
    INDEX idx_waste_plan (buffet_plan_id),
    INDEX idx_waste_station (station_id),
    INDEX idx_waste_item (menu_item_id),
    INDEX idx_waste_type (waste_type),
    INDEX idx_waste_date (recorded_at)
);

-- Quality checks table
CREATE TABLE quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_plan_id UUID REFERENCES buffet_plans(id) NOT NULL,
    station_id UUID REFERENCES buffet_stations(id),
    menu_item_id UUID REFERENCES buffet_menu_items(id),
    equipment_id UUID,
    
    check_type quality_check_type NOT NULL,
    schedule_type schedule_type NOT NULL,
    frequency check_frequency NOT NULL,
    
    -- Scheduling
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE,
    
    -- Execution
    checked_by UUID REFERENCES users(id),
    check_parameters JSONB NOT NULL,
    results JSONB,
    
    -- Outcomes
    passed BOOLEAN,
    issues JSONB,
    corrective_actions JSONB,
    
    status quality_check_status DEFAULT 'SCHEDULED',
    
    INDEX idx_quality_check_plan (buffet_plan_id),
    INDEX idx_quality_check_station (station_id),
    INDEX idx_quality_check_type (check_type),
    INDEX idx_quality_check_time (scheduled_time),
    INDEX idx_quality_check_status (status)
);

-- Alerts table
CREATE TABLE buffet_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buffet_plan_id UUID REFERENCES buffet_plans(id) NOT NULL,
    station_id UUID REFERENCES buffet_stations(id),
    menu_item_id UUID REFERENCES buffet_menu_items(id),
    
    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    
    message VARCHAR(500) NOT NULL,
    description TEXT,
    recommended_action TEXT,
    
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    status alert_status DEFAULT 'ACTIVE',
    
    INDEX idx_alert_plan (buffet_plan_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_alert_severity (severity),
    INDEX idx_alert_status (status),
    INDEX idx_alert_time (triggered_at)
);

-- Custom enums
CREATE TYPE event_type AS ENUM (
    'BREAKFAST_BUFFET', 'LUNCH_BUFFET', 'DINNER_BUFFET', 'BRUNCH_BUFFET',
    'SPECIAL_EVENT', 'CONFERENCE_CATERING', 'WEDDING_RECEPTION'
);

CREATE TYPE buffet_plan_status AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_EXECUTION', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE station_type AS ENUM (
    'HOT_ENTREES', 'COLD_DISHES', 'SALAD_BAR', 'DESSERT_STATION', 'BEVERAGE_STATION',
    'GRILL_STATION', 'CARVING_STATION', 'PASTA_STATION', 'SOUP_STATION', 'BREAD_STATION'
);

CREATE TYPE station_status AS ENUM (
    'PLANNED', 'SETUP', 'ACTIVE', 'RESTOCKING', 'MAINTENANCE', 'CLOSED'
);

CREATE TYPE batch_status AS ENUM (
    'PLANNED', 'IN_PREP', 'COOKING', 'READY', 'SERVED', 'DISPOSED'
);

CREATE TYPE waste_type AS ENUM (
    'OVERPRODUCTION', 'QUALITY_DETERIORATION', 'TEMPERATURE_ABUSE', 'CROSS_CONTAMINATION',
    'HOLDING_TIME_EXCEEDED', 'GUEST_PLATE_WASTE', 'PREPARATION_WASTE', 'SPOILAGE'
);

CREATE TYPE waste_reason_code AS ENUM (
    'OVERESTIMATED_DEMAND', 'QUALITY_STANDARDS', 'TEMPERATURE_VIOLATION', 'CONTAMINATION',
    'TIME_LIMIT_EXCEEDED', 'PRESENTATION_ISSUE', 'GUEST_PREFERENCE', 'EQUIPMENT_FAILURE'
);

CREATE TYPE waste_stage AS ENUM (
    'PREPARATION', 'COOKING', 'HOLDING', 'SERVICE', 'CLEANUP'
);

CREATE TYPE quality_check_type AS ENUM (
    'TEMPERATURE_CHECK', 'VISUAL_INSPECTION', 'TASTE_TEST', 'PRESENTATION_CHECK',
    'CLEANLINESS_INSPECTION', 'EQUIPMENT_CHECK', 'HACCP_VERIFICATION'
);

CREATE TYPE schedule_type AS ENUM (
    'FIXED_SCHEDULE', 'INTERVAL_BASED', 'EVENT_TRIGGERED', 'RANDOM_SAMPLING'
);

CREATE TYPE check_frequency AS ENUM (
    'EVERY_15_MINUTES', 'EVERY_30_MINUTES', 'HOURLY', 'EVERY_2_HOURS', 'DAILY', 'AS_NEEDED'
);

CREATE TYPE quality_check_status AS ENUM (
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'
);

CREATE TYPE alert_type AS ENUM (
    'LOW_INVENTORY', 'STOCKOUT', 'TEMPERATURE_VIOLATION', 'QUALITY_ISSUE',
    'EQUIPMENT_FAILURE', 'STAFF_SHORTAGE', 'GUEST_COMPLAINT', 'FOOD_SAFETY_VIOLATION'
);

CREATE TYPE alert_severity AS ENUM (
    'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
);

CREATE TYPE alert_status AS ENUM (
    'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'
);
```

---

### API Endpoints

#### Buffet Planning
```typescript
// Create buffet plan
POST /api/operational-planning/buffet-management/plans
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Sunday Brunch Buffet",
  "eventType": "BRUNCH_BUFFET",
  "date": "2025-02-15",
  "serviceTime": {
    "start": "10:00:00",
    "end": "14:00:00"
  },
  "locationId": "loc-001",
  "expectedGuests": 180,
  "targetCostPerGuest": 12.50,
  "menuTheme": "International Cuisine",
  "stations": [
    {
      "name": "Hot Entrees",
      "type": "HOT_ENTREES",
      "servingCapacity": 120,
      "displayCapacity": 30,
      "location": {"x": 10, "y": 5, "width": 4, "height": 2}
    }
  ],
  "menuItems": [
    {
      "recipeId": "recipe-eggs-benedict",
      "stationAssignment": 1,
      "plannedQuantity": 45,
      "minimumLevel": 8,
      "replenishmentThreshold": 12
    }
  ]
}

Response: 201 Created
{
  "id": "buffet-001",
  "status": "DRAFT",
  "demandForecast": {
    "totalGuests": 180,
    "peakHours": ["11:30-12:30", "12:30-13:30"],
    "confidence": "HIGH"
  },
  "costAnalysis": {
    "projectedTotalCost": 2250.00,
    "costPerGuest": 12.50,
    "marginAnalysis": "Within budget"
  },
  "productionPlan": {
    "totalBatches": 15,
    "earliestStartTime": "08:00:00",
    "criticalPath": "Eggs Benedict preparation"
  }
}
```

#### Real-time Monitoring
```typescript
// Update station inventory
PUT /api/operational-planning/buffet-management/stations/{stationId}/inventory
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "updates": [
    {
      "menuItemId": "item-001",
      "currentLevel": 8,
      "temperature": 65.5,
      "qualityScore": 92,
      "observations": "Good presentation, no quality issues"
    }
  ],
  "updatedBy": "user-supervisor-001",
  "timestamp": "2025-02-15T11:45:00Z"
}

Response: 200 OK
{
  "stationId": "station-001",
  "inventoryUpdates": [
    {
      "menuItemId": "item-001",
      "previousLevel": 12,
      "currentLevel": 8,
      "consumptionRate": 4.2,
      "projectedStockoutTime": "2025-02-15T12:15:00Z",
      "replenishmentRecommended": true,
      "alertsTriggered": [
        {
          "type": "LOW_INVENTORY",
          "severity": "MEDIUM",
          "message": "Inventory below replenishment threshold"
        }
      ]
    }
  ],
  "stationStatus": "ACTIVE",
  "nextRecommendedAction": {
    "action": "REPLENISH",
    "item": "Eggs Benedict",
    "quantity": 15,
    "urgency": "MEDIUM",
    "estimatedTime": "12 minutes"
  }
}
```

#### Waste Recording
```typescript
// Record waste
POST /api/operational-planning/buffet-management/waste-records
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "buffetPlanId": "buffet-001",
  "stationId": "station-001",
  "menuItemId": "item-001",
  "wastedQuantity": 3,
  "wasteUnit": "portions",
  "wasteType": "HOLDING_TIME_EXCEEDED",
  "wasteReason": "TIME_LIMIT_EXCEEDED",
  "wasteStage": "SERVICE",
  "producedQuantity": 15,
  "servedQuantity": 12,
  "notes": "Food held beyond 2-hour limit, quality compromised"
}

Response: 201 Created
{
  "wasteRecordId": "waste-001",
  "wasteValue": 18.75,
  "wastePercentage": 20.0,
  "costImpact": {
    "ingredientCost": 15.00,
    "laborCost": 3.75,
    "opportunityCost": 22.50
  },
  "preventionRecommendations": [
    {
      "strategy": "PRODUCTION_OPTIMIZATION",
      "description": "Reduce batch size during slower periods",
      "projectedSaving": 45.00
    }
  ],
  "alertsTriggered": [
    {
      "type": "WASTE_THRESHOLD_EXCEEDED",
      "threshold": 15.0,
      "actual": 20.0
    }
  ]
}
```

---

### User Interface Specifications

#### Buffet Operations Dashboard
```typescript
const BuffetOperationsDashboard: React.FC = () => {
  const [selectedBuffet, setSelectedBuffet] = useState<BuffetPlan>();
  const [monitoring, setMonitoring] = useState<BuffetMonitoringSystem>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  return (
    <div className="buffet-operations-dashboard">
      <div className="dashboard-header">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Buffet Operations</h1>
          <div className="header-actions">
            <Select value={selectedBuffet?.id} onValueChange={handleBuffetSelect}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select buffet operation" />
              </SelectTrigger>
              <SelectContent>
                {activeBuffets.map(buffet => (
                  <SelectItem key={buffet.id} value={buffet.id}>
                    {buffet.name} - {formatDate(buffet.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={() => setShowNewBuffetDialog(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Buffet Plan
            </Button>
          </div>
        </div>
        
        {selectedBuffet && (
          <div className="buffet-summary mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Expected Guests</span>
                <div className="text-2xl font-bold">{selectedBuffet.expectedGuests}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Service Time</span>
                <div className="text-lg font-medium">
                  {formatTime(selectedBuffet.serviceTime.start)} - {formatTime(selectedBuffet.serviceTime.end)}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Cost per Guest</span>
                <div className="text-2xl font-bold">{formatCurrency(selectedBuffet.costPerGuest)}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <div>
                  <Badge variant={getStatusVariant(selectedBuffet.status)}>
                    {selectedBuffet.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {alerts.length > 0 && (
        <div className="alert-bar mb-6">
          <AlertStrip
            alerts={alerts}
            onAlertClick={handleAlertClick}
            onDismissAlert={handleDismissAlert}
          />
        </div>
      )}
      
      <div className="dashboard-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ActivityIcon className="w-5 h-5 mr-2" />
                  Station Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationStatusGrid
                  stations={monitoring?.stations || []}
                  onStationClick={handleStationClick}
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleInventoryUpdate}>
                  <PackageIcon className="w-4 h-4 mr-2" />
                  Update Inventory
                </Button>
                <Button className="w-full" onClick={handleQualityCheck}>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Quality Check
                </Button>
                <Button className="w-full" onClick={handleWasteRecord}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Record Waste
                </Button>
                <Button className="w-full" onClick={handleReplenishment}>
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Replenish Items
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics
                  data={monitoring?.performance}
                  period="today"
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryLevelsChart
                data={monitoring?.stations.flatMap(s => s.inventoryLevels) || []}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Guest Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <GuestFlowChart
                data={monitoring?.guestFlow}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
```

---

### Integration Points

#### Production Integration
```typescript
interface ProductionIntegration {
  // Create production orders from buffet plans
  createProductionOrders(
    buffetPlan: BuffetPlan,
    productionBatches: ProductionBatch[]
  ): Promise<ProductionOrder[]>;
  
  // Update production status
  updateProductionStatus(
    batchId: string,
    status: BatchStatus,
    actualMetrics: ProductionMetrics
  ): Promise<void>;
  
  // Get production capacity
  getProductionCapacity(
    date: Date,
    timeRange: TimeRange
  ): Promise<ProductionCapacity>;
}
```

#### Inventory Integration
```typescript
interface InventoryIntegration {
  // Reserve ingredients for buffet production
  reserveIngredients(
    ingredientRequirements: IngredientRequirement[]
  ): Promise<ReservationResult>;
  
  // Update inventory consumption
  recordIngredientConsumption(
    consumptionRecords: ConsumptionRecord[]
  ): Promise<void>;
  
  // Check ingredient availability
  checkIngredientAvailability(
    requirements: IngredientRequirement[]
  ): Promise<AvailabilityStatus[]>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Buffet Performance Report**
   - Guest satisfaction and service metrics
   - Cost performance and profitability analysis
   - Operational efficiency indicators

2. **Waste Analysis Report**
   - Waste by category, station, and time period
   - Cost impact and prevention opportunities
   - Sustainability metrics and improvements

3. **Quality Compliance Report**
   - HACCP compliance status
   - Quality check performance
   - Food safety incident tracking

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered demand forecasting with external data sources
- IoT integration for automated inventory and temperature monitoring
- Computer vision for food quality assessment
- Mobile guest feedback integration
- Advanced sustainability tracking and reporting

#### Phase 3 Features (Q3 2025)
- Predictive analytics for waste prevention
- Automated replenishment with robotics integration
- Dynamic menu adjustment based on real-time demand
- Advanced guest behavior analytics
- Integration with renewable energy and waste management systems

---

## Conclusion

The Buffet Management Sub-Module provides comprehensive buffet operations management through intelligent planning, real-time monitoring, and optimization capabilities. The integration of demand forecasting, waste management, and quality control ensures efficient buffet operations while maintaining high standards for food safety and guest satisfaction.

The production-ready implementation delivers immediate value through optimized buffet operations and cost control, while the extensible architecture supports future enhancements and integration with emerging technologies in the hospitality industry.

---

*This document serves as the definitive technical specification for the Buffet Management Sub-Module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025