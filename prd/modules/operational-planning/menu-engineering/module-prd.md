# Menu Engineering Sub-Module - Technical PRD

## Document Information

| **Attribute**     | **Value**                         |
|-------------------|-----------------------------------|
| **Document Type** | Sub-Module Product Requirements   |
| **Version**       | 1.0.0                            |
| **Date**          | January 2025                     |
| **Status**        | Production Ready                 |
| **Owner**         | Revenue Optimization Team        |
| **Parent Module** | [Operational Planning](../module-prd.md) |

---

## Executive Summary

The Menu Engineering Sub-Module provides data-driven menu optimization through comprehensive performance analysis, profitability assessment, and strategic menu design. This module enables restaurants to maximize revenue and profitability by analyzing menu item performance, optimizing menu mix, and implementing evidence-based menu strategies.

### Key Objectives

1. **Menu Performance Analysis**: Comprehensive analysis of menu item sales, profitability, and popularity
2. **Strategic Menu Design**: Data-driven menu layout and item positioning optimization
3. **Profitability Optimization**: Identify and promote high-margin items while addressing underperformers
4. **Competitive Intelligence**: Market positioning and competitive analysis capabilities
5. **Dynamic Pricing**: Price optimization based on demand patterns and cost fluctuations
6. **Guest Psychology**: Apply menu psychology principles to influence purchasing decisions

---

## Business Requirements

### Functional Requirements

#### ME-001: Menu Performance Analysis
**Priority**: Critical  
**Complexity**: High

**User Story**: As a restaurant manager, I want comprehensive menu performance analysis to understand which items drive profitability, so that I can make data-driven decisions about menu optimization and pricing strategies.

**Acceptance Criteria**:
- ✅ Menu mix analysis with popularity and profitability metrics
- ✅ Classic menu engineering categorization (Stars, Plowhorses, Puzzles, Dogs)
- ✅ Sales trend analysis with seasonal patterns identification
- ✅ Customer preference analysis with demographic segmentation
- ✅ Contribution margin analysis by item and category
- ✅ Menu item lifecycle tracking from introduction to retirement

**Technical Implementation**:
```typescript
interface MenuAnalysis {
  id: string;
  menuId: string;
  analysisDate: Date;
  analysisPeriod: AnalysisPeriod;
  location: Location;
  
  // Performance Metrics
  totalSales: Money;
  totalItems: number;
  averageTicket: Money;
  menuMixAnalysis: MenuMixItem[];
  
  // Category Distribution
  stars: MenuMixItem[]; // High profit, high popularity
  plowhorses: MenuMixItem[]; // Low profit, high popularity
  puzzles: MenuMixItem[]; // High profit, low popularity
  dogs: MenuMixItem[]; // Low profit, low popularity
  
  // Overall Performance
  profitabilityScore: number; // 0-100
  popularityScore: number; // 0-100
  menuEfficiencyRating: MenuEfficiencyRating;
  
  // Recommendations
  recommendations: MenuRecommendation[];
  quickWins: QuickWin[];
  
  // Comparisons
  previousPeriodComparison?: PerformanceComparison;
  benchmarkComparison?: BenchmarkComparison;
  
  generatedBy: User;
  generatedAt: Date;
}

interface MenuMixItem {
  menuItemId: string;
  itemName: string;
  category: ItemCategory;
  recipe: Recipe;
  
  // Sales Performance
  unitsSold: number;
  salesRevenue: Money;
  salesMixPercentage: Percentage;
  averageSalesPerDay: number;
  
  // Profitability
  foodCost: Money;
  contributionMargin: Money;
  contributionMarginPercentage: Percentage;
  grossProfit: Money;
  profitPerUnit: Money;
  
  // Popularity
  popularityRank: number;
  popularityScore: number; // 0-100
  popularityCategory: PopularityCategory;
  
  // Classification
  menuEngineeringCategory: MenuCategory;
  priorityAction: PriorityAction;
  
  // Trends
  salesTrend: TrendDirection;
  profitabilityTrend: TrendDirection;
  seasonalityFactor: number;
  
  // Customer Insights
  customerSegments: CustomerSegmentPerformance[];
  daypartPerformance: DaypartPerformance[];
  
  lastUpdated: Date;
}

interface MenuRecommendation {
  id: string;
  type: RecommendationType;
  menuItemId: string;
  itemName: string;
  currentCategory: MenuCategory;
  priority: Priority;
  
  // Recommendation Details
  action: RecommendedAction;
  reasoning: string;
  expectedImpact: ExpectedImpact;
  implementationComplexity: ComplexityLevel;
  estimatedCost: Money;
  
  // Success Metrics
  successMetrics: SuccessMetric[];
  timeframe: Timeframe;
  
  // Implementation Steps
  implementationSteps: ImplementationStep[];
  
  status: RecommendationStatus;
  createdAt: Date;
}

type MenuCategory = 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
type PopularityCategory = 'HIGH' | 'MEDIUM' | 'LOW';
type PriorityAction = 'PROMOTE' | 'REDESIGN' | 'REPOSITION' | 'REMOVE' | 'MAINTAIN';
type TrendDirection = 'INCREASING' | 'STABLE' | 'DECLINING';
type MenuEfficiencyRating = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

type RecommendationType = 
  | 'PROMOTE_STAR'
  | 'FIX_PLOWHORSE'
  | 'MARKET_PUZZLE'
  | 'REMOVE_DOG'
  | 'PRICE_ADJUSTMENT'
  | 'MENU_POSITIONING'
  | 'INGREDIENT_SUBSTITUTION';

type RecommendedAction = 
  | 'INCREASE_PRICE'
  | 'DECREASE_PRICE'
  | 'IMPROVE_DESCRIPTION'
  | 'REPOSITION_ON_MENU'
  | 'ADD_UPSELLS'
  | 'REDUCE_PORTION_SIZE'
  | 'ENHANCE_PRESENTATION'
  | 'REMOVE_FROM_MENU'
  | 'ADD_TO_SPECIALS'
  | 'BUNDLE_WITH_OTHER_ITEMS';

class MenuEngineeringService {
  async analyzeMenuPerformance(
    menuId: string,
    analysisConfig: AnalysisConfig
  ): Promise<MenuAnalysis> {
    // Get sales data for the analysis period
    const salesData = await this.getSalesData(menuId, analysisConfig.period, analysisConfig.location);
    
    // Calculate menu mix metrics
    const menuMixItems = await Promise.all(
      salesData.map(async (item) => {
        const recipe = await this.getRecipeDetails(item.recipeId);
        const popularityScore = this.calculatePopularityScore(item, salesData);
        const profitabilityScore = this.calculateProfitabilityScore(item);
        
        return {
          menuItemId: item.id,
          itemName: item.name,
          category: item.category,
          recipe,
          unitsSold: item.unitsSold,
          salesRevenue: item.revenue,
          salesMixPercentage: (item.unitsSold / salesData.totalUnits) * 100,
          averageSalesPerDay: item.unitsSold / analysisConfig.period.days,
          foodCost: recipe.costPerPortion * item.unitsSold,
          contributionMargin: item.revenue - (recipe.costPerPortion * item.unitsSold),
          contributionMarginPercentage: ((item.revenue - (recipe.costPerPortion * item.unitsSold)) / item.revenue) * 100,
          popularityScore,
          profitabilityScore,
          menuEngineeringCategory: this.categorizeMenuItem(popularityScore, profitabilityScore),
          salesTrend: await this.calculateTrend(item.id, analysisConfig.period),
          customerSegments: await this.getCustomerSegmentData(item.id),
          lastUpdated: new Date()
        };
      })
    );
    
    // Categorize items
    const stars = menuMixItems.filter(item => item.menuEngineeringCategory === 'STAR');
    const plowhorses = menuMixItems.filter(item => item.menuEngineeringCategory === 'PLOWHORSE');
    const puzzles = menuMixItems.filter(item => item.menuEngineeringCategory === 'PUZZLE');
    const dogs = menuMixItems.filter(item => item.menuEngineeringCategory === 'DOG');
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(menuMixItems);
    
    return {
      id: generateId(),
      menuId,
      analysisDate: new Date(),
      analysisPeriod: analysisConfig.period,
      location: analysisConfig.location,
      totalSales: salesData.reduce((sum, item) => sum + item.revenue, 0),
      totalItems: salesData.length,
      averageTicket: salesData.totalRevenue / salesData.totalTransactions,
      menuMixAnalysis: menuMixItems,
      stars,
      plowhorses,
      puzzles,
      dogs,
      profitabilityScore: this.calculateOverallProfitabilityScore(menuMixItems),
      popularityScore: this.calculateOverallPopularityScore(menuMixItems),
      menuEfficiencyRating: this.determineEfficiencyRating(stars, plowhorses, puzzles, dogs),
      recommendations,
      quickWins: this.identifyQuickWins(recommendations),
      generatedBy: this.getCurrentUser(),
      generatedAt: new Date()
    };
  }
  
  private categorizeMenuItem(popularityScore: number, profitabilityScore: number): MenuCategory {
    const popularityThreshold = 50; // Above average popularity
    const profitabilityThreshold = 50; // Above average profitability
    
    if (popularityScore >= popularityThreshold && profitabilityScore >= profitabilityThreshold) {
      return 'STAR';
    } else if (popularityScore >= popularityThreshold && profitabilityScore < profitabilityThreshold) {
      return 'PLOWHORSE';
    } else if (popularityScore < popularityThreshold && profitabilityScore >= profitabilityThreshold) {
      return 'PUZZLE';
    } else {
      return 'DOG';
    }
  }
}
```

---

#### ME-002: Strategic Menu Design and Layout
**Priority**: High  
**Complexity**: Medium

**User Story**: As a menu designer, I want strategic menu layout recommendations based on performance data and psychological principles, so that I can optimize menu design to influence customer choices and maximize profitability.

**Acceptance Criteria**:
- ✅ Menu layout optimization based on visual scanning patterns
- ✅ Item positioning recommendations using menu psychology
- ✅ Price anchoring and decoy effect implementation
- ✅ Category flow and grouping optimization
- ✅ Visual design recommendations for highlighting profitable items
- ✅ A/B testing capabilities for menu design variations

**Menu Design System**:
```typescript
interface MenuDesign {
  id: string;
  menuId: string;
  designName: string;
  version: number;
  
  // Layout Configuration
  layout: MenuLayout;
  sections: MenuSection[];
  
  // Design Principles Applied
  psychologyPrinciples: MenuPsychologyPrinciple[];
  visualHierarchy: VisualHierarchy;
  
  // Performance Optimization
  itemPositioning: ItemPositioning[];
  priceAnchoringStrategy: PriceAnchoringStrategy;
  decoyItems: DecoyItem[];
  
  // A/B Testing
  testVariations: MenuVariation[];
  performanceMetrics: MenuDesignPerformance;
  
  // Implementation
  implementationGuide: ImplementationGuide;
  designAssets: DesignAsset[];
  
  status: DesignStatus;
  createdBy: User;
  createdAt: Date;
}

interface MenuLayout {
  type: MenuLayoutType;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  pageCount: number;
  columnCount: number;
  
  // Visual Zones
  primaryZone: VisualZone; // Most attention
  secondaryZone: VisualZone; // Second most attention
  deadZones: VisualZone[]; // Areas with low attention
  
  // Reading Pattern
  readingPattern: ReadingPattern;
  eyeMovementPath: EyeMovementPath[];
}

interface MenuSection {
  id: string;
  name: string;
  position: SectionPosition;
  items: MenuSectionItem[];
  
  // Design Properties
  visualWeight: VisualWeight;
  typography: TypographyStyle;
  spacing: SpacingConfiguration;
  
  // Performance
  conversionRate: Percentage;
  averageItemsPerOrder: number;
  sectionPopularity: PopularityScore;
}

interface ItemPositioning {
  menuItemId: string;
  currentPosition: MenuPosition;
  recommendedPosition: MenuPosition;
  positioningReason: PositioningReason;
  expectedImpact: PositionImpact;
  
  // Visual Treatment
  visualTreatment: VisualTreatment;
  calloutStrategy: CalloutStrategy;
}

interface PriceAnchoringStrategy {
  anchorItems: AnchorItem[];
  strategy: AnchoringStrategy;
  expectedEffect: AnchoringEffect;
}

interface AnchorItem {
  menuItemId: string;
  anchorType: AnchorType;
  anchorPosition: MenuPosition;
  pricePoint: Money;
  purpose: AnchorPurpose;
}

type MenuLayoutType = 
  | 'SINGLE_PANEL'
  | 'TRI_FOLD'
  | 'BOOK_STYLE'
  | 'SINGLE_PAGE'
  | 'DIGITAL_BOARD'
  | 'TABLE_TENT';

type PositioningReason = 
  | 'HIGH_PROFITABILITY'
  | 'STAR_ITEM'
  | 'SIGNATURE_DISH'
  | 'UPSELL_OPPORTUNITY'
  | 'DEAD_ZONE_REVIVAL'
  | 'COMPETITIVE_ADVANTAGE';

type AnchorType = 'HIGH_PRICE' | 'MID_PRICE' | 'LOW_PRICE';
type AnchorPurpose = 'MAKE_OTHER_ITEMS_SEEM_REASONABLE' | 'PREMIUM_POSITIONING' | 'VALUE_POSITIONING';

class MenuDesignService {
  async createOptimizedMenuDesign(
    menuId: string,
    analysisData: MenuAnalysis,
    designPreferences: DesignPreferences
  ): Promise<MenuDesign> {
    // Analyze current menu performance
    const currentPerformance = await this.analyzeCurrentMenuDesign(menuId);
    
    // Apply menu psychology principles
    const psychologyStrategy = this.developPsychologyStrategy(analysisData);
    
    // Optimize item positioning
    const itemPositioning = this.optimizeItemPositioning(analysisData.menuMixAnalysis);
    
    // Design price anchoring strategy
    const priceAnchoring = this.designPriceAnchoringStrategy(analysisData.menuMixAnalysis);
    
    // Create layout recommendations
    const layout = await this.optimizeMenuLayout(
      analysisData,
      designPreferences,
      itemPositioning
    );
    
    return {
      id: generateId(),
      menuId,
      designName: `Optimized Design ${new Date().getFullYear()}`,
      version: 1,
      layout,
      sections: await this.createOptimizedSections(analysisData, layout),
      psychologyPrinciples: psychologyStrategy.principles,
      visualHierarchy: psychologyStrategy.visualHierarchy,
      itemPositioning,
      priceAnchoringStrategy: priceAnchoring,
      decoyItems: this.identifyDecoyItems(analysisData.menuMixAnalysis),
      testVariations: await this.generateTestVariations(analysisData),
      performanceMetrics: currentPerformance,
      implementationGuide: this.createImplementationGuide(),
      status: 'DRAFT',
      createdBy: this.getCurrentUser(),
      createdAt: new Date()
    };
  }
  
  async performMenuDesignABTest(
    originalDesignId: string,
    testDesignId: string,
    testDuration: number // days
  ): Promise<ABTestResults> {
    const testConfig: ABTestConfig = {
      originalDesignId,
      testDesignId,
      splitRatio: 50, // 50/50 split
      duration: testDuration,
      metrics: [
        'AVERAGE_ORDER_VALUE',
        'ITEMS_PER_ORDER',
        'PROFIT_MARGIN',
        'STAR_ITEM_SELECTION_RATE',
        'CUSTOMER_SATISFACTION'
      ]
    };
    
    return this.executeABTest(testConfig);
  }
}
```

---

#### ME-003: Pricing Strategy and Optimization
**Priority**: High  
**Complexity**: Medium

**User Story**: As a pricing manager, I want data-driven pricing recommendations based on demand elasticity and competitive analysis, so that I can optimize prices to maximize revenue while maintaining competitive positioning.

**Acceptance Criteria**:
- ✅ Price elasticity analysis for demand sensitivity assessment
- ✅ Competitive pricing analysis with market positioning
- ✅ Dynamic pricing recommendations based on demand patterns
- ✅ Psychological pricing strategies (charm pricing, price bundling)
- ✅ A/B testing for price optimization
- ✅ Revenue impact modeling for pricing changes

**Pricing Analysis Engine**:
```typescript
interface PricingAnalysis {
  id: string;
  menuItemId: string;
  analysisDate: Date;
  analysisPeriod: DateRange;
  
  // Current Pricing
  currentPrice: Money;
  currentMargin: Percentage;
  currentVolume: number;
  currentRevenue: Money;
  
  // Market Analysis
  competitorAnalysis: CompetitorPriceAnalysis;
  marketPosition: MarketPosition;
  priceRank: PriceRank;
  
  // Demand Analysis
  priceElasticity: PriceElasticity;
  demandCurve: DemandPoint[];
  elasticityCoefficient: number;
  
  // Optimization Recommendations
  priceRecommendations: PriceRecommendation[];
  revenueProjections: RevenueProjection[];
  
  // Psychological Pricing
  psychologicalPricingOpportunities: PsychologicalPricingStrategy[];
  
  // Bundle Opportunities
  bundleOpportunities: BundleOpportunity[];
  
  createdBy: User;
  createdAt: Date;
}

interface PriceRecommendation {
  recommendationType: PriceRecommendationType;
  recommendedPrice: Money;
  priceChange: Money;
  priceChangePercentage: Percentage;
  
  // Impact Projections
  projectedVolumeChange: Percentage;
  projectedRevenueChange: Money;
  projectedMarginChange: Percentage;
  
  // Risk Assessment
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  
  // Implementation
  implementationStrategy: ImplementationStrategy;
  rollbackPlan: RollbackPlan;
  
  // Monitoring
  kpiMetrics: KPIMetric[];
  successCriteria: SuccessCriterion[];
}

interface CompetitorPriceAnalysis {
  competitors: CompetitorPrice[];
  marketAveragePrice: Money;
  priceRange: PriceRange;
  competitivePosition: CompetitivePosition;
  priceGap: Money;
  
  // Market Intelligence
  pricingTrends: PricingTrend[];
  marketShare: MarketShareData;
}

interface PriceElasticity {
  coefficient: number; // Negative for normal goods
  classification: ElasticityClassification;
  sensitivity: DemandSensitivity;
  
  // Historical Data
  historicalPricePoints: HistoricalPricePoint[];
  demandResponse: DemandResponse[];
  
  // Elasticity by Segment
  segmentElasticity: SegmentElasticity[];
}

type PriceRecommendationType = 
  | 'INCREASE_FOR_PROFITABILITY'
  | 'DECREASE_FOR_VOLUME'
  | 'MATCH_COMPETITOR'
  | 'PREMIUM_POSITIONING'
  | 'VALUE_POSITIONING'
  | 'CHARM_PRICING'
  | 'BUNDLE_PRICING';

type ElasticityClassification = 
  | 'PERFECTLY_ELASTIC'    // E = ∞
  | 'HIGHLY_ELASTIC'       // E > -1
  | 'UNITARY_ELASTIC'      // E = -1
  | 'INELASTIC'            // -1 < E < 0
  | 'PERFECTLY_INELASTIC'; // E = 0

type CompetitivePosition = 'PREMIUM' | 'COMPETITIVE' | 'VALUE' | 'DISCOUNT';

class PricingOptimizationService {
  async analyzePricingOpportunities(
    menuItemId: string,
    analysisConfig: PricingAnalysisConfig
  ): Promise<PricingAnalysis> {
    // Get historical sales and pricing data
    const historicalData = await this.getHistoricalPricingData(menuItemId, analysisConfig.period);
    
    // Calculate price elasticity
    const elasticity = await this.calculatePriceElasticity(historicalData);
    
    // Analyze competitor pricing
    const competitorAnalysis = await this.analyzeCompetitorPricing(menuItemId);
    
    // Generate pricing recommendations
    const recommendations = await this.generatePricingRecommendations(
      menuItemId,
      elasticity,
      competitorAnalysis
    );
    
    // Project revenue impact
    const revenueProjections = this.projectRevenueImpact(recommendations, elasticity);
    
    return {
      id: generateId(),
      menuItemId,
      analysisDate: new Date(),
      analysisPeriod: analysisConfig.period,
      currentPrice: historicalData.currentPrice,
      currentMargin: historicalData.currentMargin,
      currentVolume: historicalData.currentVolume,
      currentRevenue: historicalData.currentRevenue,
      competitorAnalysis,
      marketPosition: this.determineMarketPosition(historicalData.currentPrice, competitorAnalysis),
      priceElasticity: elasticity,
      demandCurve: this.generateDemandCurve(elasticity),
      elasticityCoefficient: elasticity.coefficient,
      priceRecommendations: recommendations,
      revenueProjections,
      psychologicalPricingOpportunities: this.identifyPsychologicalPricingOpportunities(historicalData),
      bundleOpportunities: await this.identifyBundleOpportunities(menuItemId),
      createdBy: this.getCurrentUser(),
      createdAt: new Date()
    };
  }
  
  async executePartnershipPricing(priceTestConfig: PriceTestConfig): Promise<PriceTestResults> {
    // Implement gradual price testing
    return this.runPriceTest(priceTestConfig);
  }
  
  private calculatePriceElasticity(historicalData: HistoricalPricingData): PriceElasticity {
    // Calculate price elasticity using historical price and demand data
    const elasticityCoefficient = this.calculateElasticityCoefficient(
      historicalData.pricePoints,
      historicalData.demandPoints
    );
    
    return {
      coefficient: elasticityCoefficient,
      classification: this.classifyElasticity(elasticityCoefficient),
      sensitivity: this.determineDemandSensitivity(elasticityCoefficient),
      historicalPricePoints: historicalData.pricePoints,
      demandResponse: historicalData.demandPoints,
      segmentElasticity: this.calculateSegmentElasticity(historicalData)
    };
  }
}
```

---

#### ME-004: Menu Item Lifecycle Management
**Priority**: Medium  
**Complexity**: Medium

**User Story**: As a menu manager, I want to track menu item lifecycle from introduction to retirement, so that I can optimize menu refresh cycles and identify the best times for menu changes.

**Acceptance Criteria**:
- ✅ Menu item lifecycle stage tracking and analysis
- ✅ Performance trending and lifecycle predictions
- ✅ Automatic alerts for items requiring attention
- ✅ Menu refresh planning with seasonal considerations
- ✅ New item introduction impact analysis
- ✅ Retirement planning with alternative recommendations

**Lifecycle Management System**:
```typescript
interface MenuItemLifecycle {
  menuItemId: string;
  itemName: string;
  
  // Lifecycle Information
  currentStage: LifecycleStage;
  stageHistory: LifecycleStageHistory[];
  
  // Introduction Phase
  launchDate: Date;
  introductionPeriod: DateRange;
  launchStrategy: LaunchStrategy;
  introductionMetrics: IntroductionMetrics;
  
  // Growth Phase
  growthMetrics: GrowthMetrics;
  peakPerformancePeriod?: DateRange;
  
  // Maturity Phase
  maturityMetrics: MaturityMetrics;
  stabilityIndicators: StabilityIndicator[];
  
  // Decline Phase
  declineIndicators: DeclineIndicator[];
  declineMetrics?: DeclineMetrics;
  
  // Performance Trends
  salesTrend: TrendData;
  profitabilityTrend: TrendData;
  customerSatisfactionTrend: TrendData;
  
  // Predictions
  stageTransitionPredictions: StageTransitionPrediction[];
  retirementPrediction?: RetirementPrediction;
  
  // Actions
  recommendedActions: LifecycleAction[];
  implementedActions: ImplementedAction[];
  
  lastUpdated: Date;
}

interface LifecycleStageHistory {
  stage: LifecycleStage;
  startDate: Date;
  endDate?: Date;
  duration: number; // days
  keyMetrics: StageMetrics;
  stageOutcome: StageOutcome;
}

interface LaunchStrategy {
  promotionType: PromotionType;
  pricingStrategy: LaunchPricingStrategy;
  marketingChannels: MarketingChannel[];
  targetAudience: TargetAudience;
  launchGoals: LaunchGoal[];
}

interface IntroductionMetrics {
  timeToPositiveCashFlow: number; // days
  customerAdoptionRate: Percentage;
  repeatOrderRate: Percentage;
  initialMargin: Percentage;
  marketReception: MarketReception;
}

type LifecycleStage = 
  | 'DEVELOPMENT'
  | 'INTRODUCTION'
  | 'GROWTH'
  | 'MATURITY'
  | 'DECLINE'
  | 'RETIREMENT'
  | 'REVIVAL';

type PromotionType = 
  | 'FEATURED_ITEM'
  | 'LIMITED_TIME'
  | 'SEASONAL_SPECIAL'
  | 'SIGNATURE_LAUNCH'
  | 'SOFT_LAUNCH'
  | 'GRAND_LAUNCH';

type LaunchPricingStrategy = 
  | 'PENETRATION_PRICING'
  | 'SKIMMING_PRICING'
  | 'COMPETITIVE_PRICING'
  | 'VALUE_PRICING';

class MenuLifecycleService {
  async trackItemLifecycle(menuItemId: string): Promise<MenuItemLifecycle> {
    const historicalData = await this.getItemHistoricalData(menuItemId);
    const currentStage = this.determineLifecycleStage(historicalData);
    
    return {
      menuItemId,
      itemName: historicalData.itemName,
      currentStage,
      stageHistory: this.buildStageHistory(historicalData),
      launchDate: historicalData.launchDate,
      introductionMetrics: this.calculateIntroductionMetrics(historicalData),
      salesTrend: this.calculateSalesTrend(historicalData),
      profitabilityTrend: this.calculateProfitabilityTrend(historicalData),
      stageTransitionPredictions: await this.predictStageTransitions(historicalData),
      recommendedActions: await this.generateLifecycleActions(currentStage, historicalData),
      lastUpdated: new Date()
    };
  }
  
  async generateMenuRefreshPlan(
    menuId: string,
    refreshStrategy: RefreshStrategy
  ): Promise<MenuRefreshPlan> {
    const allItems = await this.getAllMenuItems(menuId);
    const lifecycleAnalyses = await Promise.all(
      allItems.map(item => this.trackItemLifecycle(item.id))
    );
    
    // Identify items for each action
    const itemsToRetire = lifecycleAnalyses.filter(item => 
      item.currentStage === 'DECLINE' || 
      item.recommendedActions.some(action => action.type === 'RETIRE_ITEM')
    );
    
    const itemsToRevive = lifecycleAnalyses.filter(item =>
      item.recommendedActions.some(action => action.type === 'REVIVE_ITEM')
    );
    
    const newItemOpportunities = await this.identifyNewItemOpportunities(
      lifecycleAnalyses,
      refreshStrategy
    );
    
    return {
      menuId,
      refreshStrategy,
      plannedRefreshDate: refreshStrategy.targetDate,
      itemsToRetire,
      itemsToRevive,
      newItemOpportunities,
      refreshTimeline: this.createRefreshTimeline(refreshStrategy),
      impactAnalysis: this.analyzeRefreshImpact(itemsToRetire, newItemOpportunities),
      createdAt: new Date()
    };
  }
}
```

---

#### ME-005: Competitive Analysis and Benchmarking
**Priority**: Medium  
**Complexity**: Low

**User Story**: As a competitive analyst, I want to benchmark our menu against competitors to identify market opportunities and threats, so that I can make informed strategic decisions about menu positioning and pricing.

**Acceptance Criteria**:
- ✅ Competitor menu analysis with pricing comparisons
- ✅ Market gap identification and opportunity analysis
- ✅ Competitive positioning assessment
- ✅ Trend analysis across competitor menus
- ✅ Benchmarking reports with actionable insights
- ✅ Automated competitor monitoring and alerts

**Competitive Analysis System**:
```typescript
interface CompetitiveAnalysis {
  id: string;
  analysisDate: Date;
  competitorSet: Competitor[];
  marketSegment: MarketSegment;
  
  // Menu Comparison
  menuComparison: MenuComparison;
  categoryComparison: CategoryComparison[];
  
  // Pricing Analysis
  pricingComparison: PricingComparison;
  pricePositioning: PricePositioning;
  
  // Market Analysis
  marketGaps: MarketGap[];
  opportunities: MarketOpportunity[];
  threats: CompetitiveThreat[];
  
  // Trend Analysis
  industryTrends: IndustryTrend[];
  competitorTrends: CompetitorTrend[];
  
  // Recommendations
  strategicRecommendations: StrategicRecommendation[];
  tacticalActions: TacticalAction[];
  
  generatedBy: User;
  generatedAt: Date;
}

interface Competitor {
  id: string;
  name: string;
  type: CompetitorType;
  marketPosition: MarketPosition;
  priceSegment: PriceSegment;
  cuisine: string[];
  location: CompetitorLocation;
  
  // Menu Information
  menuItems: CompetitorMenuItem[];
  menuCategories: string[];
  averagePrice: Money;
  priceRange: PriceRange;
  
  // Performance Indicators
  marketShare?: Percentage;
  customerRating?: Rating;
  reviewCount?: number;
  
  lastUpdated: Date;
}

interface MenuComparison {
  totalItems: ItemCountComparison;
  categories: CategoryCountComparison[];
  cuisineTypes: CuisineComparison[];
  
  // Uniqueness Analysis
  uniqueItems: number;
  commonItems: number;
  differentiationScore: number; // 0-100
  
  // Innovation Analysis
  innovativeItems: InnovativeItem[];
  traditionaItems: TraditionalItem[];
}

interface MarketGap {
  gapType: GapType;
  description: string;
  category: string;
  pricePoint: Money;
  targetAudience: TargetAudience;
  
  // Opportunity Assessment
  marketSize: MarketSize;
  competitiveIntensity: CompetitiveIntensity;
  barrierToEntry: BarrierToEntry;
  
  // Implementation
  implementationComplexity: ComplexityLevel;
  estimatedROI: ROIEstimate;
  timeToMarket: number; // weeks
}

type CompetitorType = 'DIRECT' | 'INDIRECT' | 'SUBSTITUTE';
type GapType = 'CATEGORY_GAP' | 'PRICE_GAP' | 'CUISINE_GAP' | 'DIETARY_GAP' | 'CONVENIENCE_GAP';
type CompetitiveIntensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

class CompetitiveAnalysisService {
  async performCompetitiveAnalysis(
    menuId: string,
    competitorIds: string[],
    analysisScope: AnalysisScope
  ): Promise<CompetitiveAnalysis> {
    const ourMenu = await this.getMenuData(menuId);
    const competitors = await Promise.all(
      competitorIds.map(id => this.getCompetitorData(id))
    );
    
    // Perform menu comparison
    const menuComparison = this.compareMenus(ourMenu, competitors);
    
    // Analyze pricing
    const pricingComparison = this.analyzePricing(ourMenu, competitors);
    
    // Identify market gaps and opportunities
    const marketGaps = this.identifyMarketGaps(ourMenu, competitors);
    const opportunities = this.identifyOpportunities(marketGaps, analysisScope);
    
    // Analyze trends
    const industryTrends = await this.analyzeIndustryTrends(competitors);
    
    // Generate strategic recommendations
    const recommendations = this.generateStrategicRecommendations(
      menuComparison,
      pricingComparison,
      opportunities
    );
    
    return {
      id: generateId(),
      analysisDate: new Date(),
      competitorSet: competitors,
      marketSegment: analysisScope.marketSegment,
      menuComparison,
      categoryComparison: this.compareCategoriesByCompetitor(ourMenu, competitors),
      pricingComparison,
      pricePositioning: this.analyzePricePositioning(ourMenu, competitors),
      marketGaps,
      opportunities,
      threats: this.identifyThreats(competitors, ourMenu),
      industryTrends,
      competitorTrends: this.analyzeCompetitorTrends(competitors),
      strategicRecommendations: recommendations,
      tacticalActions: this.generateTacticalActions(recommendations),
      generatedBy: this.getCurrentUser(),
      generatedAt: new Date()
    };
  }
}
```

---

### Non-Functional Requirements

#### Performance Requirements
- **Menu Analysis**: <5 seconds for comprehensive menu performance analysis
- **Design Generation**: <3 seconds for menu design recommendations
- **Pricing Analysis**: <4 seconds for price elasticity calculations
- **Competitive Analysis**: <10 seconds for full competitive benchmarking
- **Report Generation**: <15 seconds for detailed analytics reports

#### Scalability Requirements
- **Menu Items**: Support analysis of 1,000+ menu items simultaneously
- **Historical Data**: Process 5+ years of sales and performance data
- **Concurrent Analysis**: Handle 50+ simultaneous menu analyses
- **Competitor Tracking**: Monitor 100+ competitors continuously

#### Security Requirements
- **Competitive Intelligence**: Secure storage of competitor data and analysis
- **Performance Data**: Encrypted storage of proprietary menu performance metrics
- **Pricing Strategy**: Protected access to pricing algorithms and strategies

---

## Technical Architecture

### Database Schema

```sql
-- Menu engineering analyses table
CREATE TABLE menu_engineering_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES menus(id) NOT NULL,
    analysis_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Performance Metrics
    total_sales DECIMAL(15,4) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    average_ticket DECIMAL(15,4) DEFAULT 0,
    profitability_score INTEGER, -- 0-100
    popularity_score INTEGER, -- 0-100
    menu_efficiency_rating menu_efficiency_rating,
    
    -- Category Counts
    star_count INTEGER DEFAULT 0,
    plowhorse_count INTEGER DEFAULT 0,
    puzzle_count INTEGER DEFAULT 0,
    dog_count INTEGER DEFAULT 0,
    
    -- Analysis Data (JSON)
    analysis_data JSONB,
    recommendations JSONB,
    quick_wins JSONB,
    
    generated_by UUID REFERENCES users(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_menu_engineering_menu (menu_id),
    INDEX idx_menu_engineering_date (analysis_date),
    INDEX idx_menu_engineering_location (location_id),
    INDEX idx_menu_engineering_efficiency (menu_efficiency_rating)
);

-- Menu mix analysis items table
CREATE TABLE menu_mix_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES menu_engineering_analyses(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    recipe_id UUID REFERENCES recipes(id),
    
    -- Sales Performance
    units_sold INTEGER NOT NULL,
    sales_revenue DECIMAL(15,4) NOT NULL,
    sales_mix_percentage DECIMAL(5,2) NOT NULL,
    average_sales_per_day DECIMAL(10,2),
    
    -- Profitability
    food_cost DECIMAL(15,4) NOT NULL,
    contribution_margin DECIMAL(15,4) NOT NULL,
    contribution_margin_percentage DECIMAL(5,2) NOT NULL,
    gross_profit DECIMAL(15,4) NOT NULL,
    profit_per_unit DECIMAL(15,4) NOT NULL,
    
    -- Popularity
    popularity_rank INTEGER,
    popularity_score INTEGER, -- 0-100
    popularity_category popularity_category,
    
    -- Classification
    menu_engineering_category menu_category NOT NULL,
    priority_action priority_action,
    
    -- Trends
    sales_trend trend_direction,
    profitability_trend trend_direction,
    seasonality_factor DECIMAL(5,2) DEFAULT 1.0,
    
    -- Additional Data (JSON)
    customer_segments JSONB,
    daypart_performance JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_menu_mix_analysis (analysis_id),
    INDEX idx_menu_mix_item (menu_item_id),
    INDEX idx_menu_mix_category (menu_engineering_category),
    INDEX idx_menu_mix_popularity (popularity_score),
    INDEX idx_menu_mix_profit (contribution_margin)
);

-- Menu recommendations table
CREATE TABLE menu_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES menu_engineering_analyses(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    
    recommendation_type recommendation_type NOT NULL,
    current_category menu_category NOT NULL,
    priority priority_level NOT NULL,
    
    -- Recommendation Details
    recommended_action recommended_action NOT NULL,
    reasoning TEXT NOT NULL,
    implementation_complexity complexity_level NOT NULL,
    estimated_cost DECIMAL(15,4) DEFAULT 0,
    
    -- Success Metrics (JSON)
    success_metrics JSONB,
    expected_impact JSONB,
    
    -- Implementation
    implementation_steps JSONB,
    timeframe INTEGER, -- days
    
    status recommendation_status DEFAULT 'PENDING',
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_recommendation_analysis (analysis_id),
    INDEX idx_recommendation_item (menu_item_id),
    INDEX idx_recommendation_type (recommendation_type),
    INDEX idx_recommendation_priority (priority),
    INDEX idx_recommendation_status (status)
);

-- Pricing analyses table
CREATE TABLE pricing_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    analysis_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Current State
    current_price DECIMAL(15,4) NOT NULL,
    current_margin DECIMAL(5,2) NOT NULL,
    current_volume INTEGER NOT NULL,
    current_revenue DECIMAL(15,4) NOT NULL,
    
    -- Elasticity Analysis
    price_elasticity_coefficient DECIMAL(8,6),
    elasticity_classification elasticity_classification,
    demand_sensitivity demand_sensitivity,
    
    -- Market Analysis
    competitor_avg_price DECIMAL(15,4),
    market_position market_position,
    price_rank INTEGER,
    competitive_price_gap DECIMAL(15,4),
    
    -- Analysis Data (JSON)
    demand_curve JSONB,
    competitor_analysis JSONB,
    price_recommendations JSONB,
    revenue_projections JSONB,
    psychological_pricing_opportunities JSONB,
    bundle_opportunities JSONB,
    
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_pricing_item (menu_item_id),
    INDEX idx_pricing_date (analysis_date),
    INDEX idx_pricing_elasticity (elasticity_classification),
    INDEX idx_pricing_position (market_position)
);

-- Menu item lifecycle tracking table
CREATE TABLE menu_item_lifecycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
    
    -- Lifecycle Information
    current_stage lifecycle_stage NOT NULL,
    launch_date DATE,
    
    -- Stage History (JSON)
    stage_history JSONB,
    
    -- Performance Data
    sales_trend JSONB,
    profitability_trend JSONB,
    customer_satisfaction_trend JSONB,
    
    -- Predictions
    stage_transition_predictions JSONB,
    retirement_prediction JSONB,
    
    -- Actions
    recommended_actions JSONB,
    implemented_actions JSONB,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(menu_item_id),
    INDEX idx_lifecycle_stage (current_stage),
    INDEX idx_lifecycle_launch (launch_date),
    INDEX idx_lifecycle_updated (last_updated)
);

-- Competitive analysis table
CREATE TABLE competitive_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES menus(id) NOT NULL,
    analysis_date DATE NOT NULL,
    market_segment VARCHAR(100),
    
    -- Competitor Information (JSON)
    competitor_data JSONB NOT NULL,
    
    -- Analysis Results
    menu_comparison JSONB,
    pricing_comparison JSONB,
    market_gaps JSONB,
    opportunities JSONB,
    threats JSONB,
    industry_trends JSONB,
    
    -- Recommendations
    strategic_recommendations JSONB,
    tactical_actions JSONB,
    
    generated_by UUID REFERENCES users(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_competitive_menu (menu_id),
    INDEX idx_competitive_date (analysis_date),
    INDEX idx_competitive_segment (market_segment)
);

-- Custom enums
CREATE TYPE menu_efficiency_rating AS ENUM (
    'EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'POOR'
);

CREATE TYPE popularity_category AS ENUM (
    'HIGH', 'MEDIUM', 'LOW'
);

CREATE TYPE menu_category AS ENUM (
    'STAR', 'PLOWHORSE', 'PUZZLE', 'DOG'
);

CREATE TYPE priority_action AS ENUM (
    'PROMOTE', 'REDESIGN', 'REPOSITION', 'REMOVE', 'MAINTAIN'
);

CREATE TYPE trend_direction AS ENUM (
    'INCREASING', 'STABLE', 'DECLINING'
);

CREATE TYPE recommendation_type AS ENUM (
    'PROMOTE_STAR', 'FIX_PLOWHORSE', 'MARKET_PUZZLE', 'REMOVE_DOG',
    'PRICE_ADJUSTMENT', 'MENU_POSITIONING', 'INGREDIENT_SUBSTITUTION'
);

CREATE TYPE recommended_action AS ENUM (
    'INCREASE_PRICE', 'DECREASE_PRICE', 'IMPROVE_DESCRIPTION', 'REPOSITION_ON_MENU',
    'ADD_UPSELLS', 'REDUCE_PORTION_SIZE', 'ENHANCE_PRESENTATION', 'REMOVE_FROM_MENU',
    'ADD_TO_SPECIALS', 'BUNDLE_WITH_OTHER_ITEMS'
);

CREATE TYPE recommendation_status AS ENUM (
    'PENDING', 'IN_PROGRESS', 'IMPLEMENTED', 'REJECTED', 'POSTPONED'
);

CREATE TYPE elasticity_classification AS ENUM (
    'PERFECTLY_ELASTIC', 'HIGHLY_ELASTIC', 'UNITARY_ELASTIC', 'INELASTIC', 'PERFECTLY_INELASTIC'
);

CREATE TYPE demand_sensitivity AS ENUM (
    'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'
);

CREATE TYPE lifecycle_stage AS ENUM (
    'DEVELOPMENT', 'INTRODUCTION', 'GROWTH', 'MATURITY', 'DECLINE', 'RETIREMENT', 'REVIVAL'
);
```

---

### API Endpoints

#### Menu Analysis
```typescript
// Perform comprehensive menu analysis
POST /api/operational-planning/menu-engineering/analyze
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "menuId": "menu-001",
  "locationId": "loc-001",
  "periodStart": "2024-12-01",
  "periodEnd": "2024-12-31",
  "includeRecommendations": true,
  "analysisOptions": {
    "customerSegmentation": true,
    "daypartAnalysis": true,
    "seasonalityAdjustment": true
  }
}

Response: 200 OK
{
  "analysisId": "analysis-001",
  "menuId": "menu-001",
  "analysisDate": "2025-01-15",
  "summary": {
    "totalItems": 48,
    "totalSales": 125400.00,
    "averageTicket": 28.50,
    "profitabilityScore": 72,
    "popularityScore": 68,
    "menuEfficiencyRating": "GOOD",
    "categoryDistribution": {
      "stars": 8,
      "plowhorses": 16,
      "puzzles": 12,
      "dogs": 12
    }
  },
  "menuMixAnalysis": [
    {
      "menuItemId": "item-001",
      "itemName": "Grilled Salmon",
      "category": "STAR",
      "unitsSold": 245,
      "salesRevenue": 5880.00,
      "salesMixPercentage": 12.5,
      "contributionMargin": 3240.00,
      "contributionMarginPercentage": 55.1,
      "popularityScore": 85,
      "priorityAction": "PROMOTE"
    }
  ],
  "recommendations": [
    {
      "type": "PROMOTE_STAR",
      "menuItemId": "item-001",
      "action": "REPOSITION_ON_MENU",
      "reasoning": "High-performing star item should be featured more prominently",
      "expectedImpact": {
        "revenueIncrease": "15%",
        "profitIncrease": "18%"
      },
      "priority": "HIGH",
      "implementationComplexity": "LOW"
    }
  ],
  "quickWins": [
    {
      "action": "Move star items to visual hotspots",
      "estimatedImpact": "8-12% revenue increase",
      "timeToImplement": "1 day",
      "cost": 0
    }
  ]
}
```

#### Pricing Analysis
```typescript
// Analyze pricing opportunities
POST /api/operational-planning/menu-engineering/pricing/analyze
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "menuItemId": "item-001",
  "analysisPeriod": {
    "start": "2024-06-01",
    "end": "2024-12-31"
  },
  "includeCompetitorData": true,
  "competitorIds": ["comp-001", "comp-002", "comp-003"]
}

Response: 200 OK
{
  "menuItemId": "item-001",
  "currentState": {
    "price": 24.00,
    "margin": 58.3,
    "volume": 245,
    "revenue": 5880.00
  },
  "priceElasticity": {
    "coefficient": -0.8,
    "classification": "INELASTIC",
    "sensitivity": "LOW"
  },
  "competitorAnalysis": {
    "averagePrice": 26.50,
    "priceRange": {
      "min": 22.00,
      "max": 32.00
    },
    "marketPosition": "COMPETITIVE",
    "priceGap": -2.50
  },
  "recommendations": [
    {
      "type": "INCREASE_FOR_PROFITABILITY",
      "recommendedPrice": 26.00,
      "priceChange": 2.00,
      "projectedVolumeChange": -5.2,
      "projectedRevenueChange": 312.50,
      "riskLevel": "LOW",
      "reasoning": "Low price elasticity indicates room for increase"
    }
  ],
  "psychologicalPricing": [
    {
      "strategy": "CHARM_PRICING",
      "recommendedPrice": 25.99,
      "expectedImpact": "3-5% demand increase"
    }
  ]
}
```

---

### User Interface Specifications

#### Menu Engineering Dashboard
```typescript
const MenuEngineeringDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<MenuAnalysis>();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('ALL');
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'chart'>('matrix');
  
  return (
    <div className="menu-engineering-dashboard">
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold">Menu Engineering Analysis</h1>
        <div className="analysis-controls">
          <DateRangePicker
            value={analysisDateRange}
            onChange={setAnalysisDateRange}
          />
          <LocationSelector
            value={selectedLocation}
            onChange={setSelectedLocation}
          />
          <Button onClick={handleRunAnalysis}>
            <BarChartIcon className="w-4 h-4 mr-2" />
            Analyze Menu
          </Button>
        </div>
      </div>
      
      <div className="dashboard-summary">
        <div className="summary-cards grid grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Stars"
            value={analysis?.stars?.length || 0}
            description="High profit, high popularity"
            color="green"
            trend={analysis?.categoryTrends?.stars}
          />
          <MetricCard
            title="Plowhorses"
            value={analysis?.plowhorses?.length || 0}
            description="Low profit, high popularity"
            color="blue"
            trend={analysis?.categoryTrends?.plowhorses}
          />
          <MetricCard
            title="Puzzles"
            value={analysis?.puzzles?.length || 0}
            description="High profit, low popularity"
            color="yellow"
            trend={analysis?.categoryTrends?.puzzles}
          />
          <MetricCard
            title="Dogs"
            value={analysis?.dogs?.length || 0}
            description="Low profit, low popularity"
            color="red"
            trend={analysis?.categoryTrends?.dogs}
          />
        </div>
        
        <div className="efficiency-summary">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-muted-foreground">Menu Efficiency</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {analysis?.menuEfficiencyRating || 'N/A'}
                </span>
                <Badge variant={getEfficiencyBadgeVariant(analysis?.menuEfficiencyRating)}>
                  {analysis?.profitabilityScore}/100
                </Badge>
              </div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <div className="text-2xl font-bold">
                {formatCurrency(analysis?.totalSales || 0)}
              </div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <span className="text-sm text-muted-foreground">Average Ticket</span>
              <div className="text-2xl font-bold">
                {formatCurrency(analysis?.averageTicket || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-controls">
        <div className="view-controls">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={setViewMode}
          >
            <ToggleGroupItem value="matrix">
              <GridIcon className="w-4 h-4" />
              Matrix View
            </ToggleGroupItem>
            <ToggleGroupItem value="list">
              <ListIcon className="w-4 h-4" />
              List View
            </ToggleGroupItem>
            <ToggleGroupItem value="chart">
              <BarChartIcon className="w-4 h-4" />
              Chart View
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="category-filters">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectItem value="ALL">All Items</SelectItem>
            <SelectItem value="STAR">Stars</SelectItem>
            <SelectItem value="PLOWHORSE">Plowhorses</SelectItem>
            <SelectItem value="PUZZLE">Puzzles</SelectItem>
            <SelectItem value="DOG">Dogs</SelectItem>
          </Select>
        </div>
      </div>
      
      <div className="dashboard-content">
        {viewMode === 'matrix' && (
          <MenuEngineeringMatrix
            data={analysis?.menuMixAnalysis || []}
            selectedCategory={selectedCategory}
            onItemSelect={handleItemSelect}
          />
        )}
        
        {viewMode === 'list' && (
          <MenuItemsList
            items={filteredMenuItems}
            onItemSelect={handleItemSelect}
          />
        )}
        
        {viewMode === 'chart' && (
          <MenuPerformanceCharts
            data={analysis?.menuMixAnalysis || []}
            selectedCategory={selectedCategory}
          />
        )}
      </div>
      
      <div className="dashboard-recommendations">
        <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickWinsList
                quickWins={analysis?.quickWins || []}
                onImplement={handleImplementQuickWin}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Strategic Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendationsList
                recommendations={analysis?.recommendations || []}
                onImplement={handleImplementRecommendation}
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

#### POS Integration
```typescript
interface POSIntegration {
  // Get sales data for menu analysis
  getSalesData(
    period: DateRange,
    locationId: string,
    menuId: string
  ): Promise<SalesData[]>;
  
  // Get customer transaction data
  getTransactionData(
    period: DateRange,
    locationId: string
  ): Promise<TransactionData[]>;
  
  // Update menu item positioning
  updateMenuDisplay(
    menuUpdates: MenuDisplayUpdate[]
  ): Promise<UpdateResult>;
}
```

#### Analytics Integration
```typescript
interface AnalyticsIntegration {
  // Track menu performance metrics
  trackMenuMetrics(
    analysisId: string,
    metrics: MenuMetric[]
  ): Promise<void>;
  
  // Generate performance reports
  generatePerformanceReport(
    reportConfig: ReportConfig
  ): Promise<PerformanceReport>;
}
```

---

### Reporting & Analytics

#### Standard Reports
1. **Menu Engineering Analysis Report**
   - Complete menu performance breakdown
   - Category-wise analysis and trends
   - Recommendation implementation status

2. **Pricing Optimization Report**
   - Price elasticity analysis
   - Competitive positioning assessment
   - Revenue impact projections

3. **Menu Lifecycle Report**
   - Item lifecycle stage tracking
   - Performance trending analysis
   - Refresh planning recommendations

---

### Future Enhancements

#### Phase 2 Features (Q2 2025)
- AI-powered menu optimization with machine learning
- Real-time pricing adjustments based on demand
- Advanced customer segmentation analysis
- Automated A/B testing for menu changes
- Integration with customer feedback systems

#### Phase 3 Features (Q3 2025)
- Predictive analytics for menu item success
- Computer vision for competitor menu analysis
- Dynamic menu generation based on performance data
- Advanced psychological pricing algorithms
- Integration with social media sentiment analysis

---

## Conclusion

The Menu Engineering Sub-Module provides comprehensive data-driven menu optimization capabilities that enable restaurants to maximize profitability through strategic menu design, pricing optimization, and performance analysis. The integration of psychological principles, competitive intelligence, and lifecycle management delivers significant value through improved revenue and customer satisfaction.

The production-ready implementation supports immediate deployment with advanced analytics capabilities, while the extensible architecture enables future enhancements and integration with emerging technologies in the hospitality industry.

---

*This document serves as the definitive technical specification for the Menu Engineering Sub-Module and will be updated as features evolve.*

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Review**: March 2025