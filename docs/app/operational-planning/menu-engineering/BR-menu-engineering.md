# Menu Engineering - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Operational Planning > Menu Engineering
- **Version**: 1.0
- **Last Updated**: 2024-01-15

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial business requirements document created |


## 1. Overview

### 1.1 Purpose
The Menu Engineering module provides comprehensive tools for analyzing menu performance, optimizing menu items, and implementing strategic pricing decisions based on data-driven insights. It enables restaurant managers and food service operators to maximize profitability by identifying high-performing items (Stars), improving underperforming items (Puzzles and Dogs), and managing popular workhorses efficiently.

### 1.2 Scope
This document defines business requirements for:
- Menu item performance analysis using Menu Engineering Matrix
- Profitability metrics and contribution margin calculations
- Menu mix analysis and sales volume tracking
- Strategic pricing recommendations and optimization
- Menu item lifecycle management (introduction, growth, maturity, decline)
- Competitor pricing analysis and market positioning
- Menu categorization and organization
- Sales performance tracking and forecasting
- Menu optimization recommendations
- Visual dashboards and reporting tools

### 1.3 Key Business Objectives
- **Profitability Maximization**: Identify and promote high-margin, high-volume items
- **Strategic Decision Making**: Data-driven menu composition and pricing decisions
- **Cost Optimization**: Balance food costs with customer demand and profitability
- **Customer Satisfaction**: Maintain popular items while introducing profitable innovations
- **Operational Efficiency**: Streamline menu offerings to reduce complexity
- **Competitive Positioning**: Monitor market trends and adjust pricing strategically
- **Inventory Management**: Align menu with ingredient availability and costs
- **Performance Tracking**: Real-time visibility into menu item performance metrics

---

## 2. Functional Requirements

### FR-MENG-001: Menu Item Registration and Classification
**Priority**: Critical
**Description**: System shall provide comprehensive menu item registration and classification capabilities.

**Requirements**:
- Register menu items with complete details
- Link menu items to recipes for cost calculations
- Assign menu items to menu categories (Appetizers, Mains, Desserts, Beverages)
- Define menu item status (active, seasonal, discontinued)
- Set item availability by location/venue
- Configure item visibility (dine-in, takeout, delivery)
- Support item variations (size, spice level, toppings)
- Enable item grouping (combos, meal deals)
- Track item seasonality and availability windows
- Maintain item descriptions for different channels (POS, online, print)

**Business Rules**:
- Menu item name must be unique within category
- Active menu items must have linked recipes with costs
- Seasonal items require start and end dates
- Item status changes tracked in audit log
- Price changes require approval for published items

### FR-MENG-002: Menu Engineering Matrix Analysis
**Priority**: Critical
**Description**: System shall implement the Menu Engineering Matrix (Kasavana-Smith) for strategic menu analysis.

**Requirements**:
- Calculate menu mix percentage per item
- Calculate contribution margin per item
- Classify items into four quadrants:
  - **Stars**: High Profitability + High Popularity
  - **Plowhorses**: Low Profitability + High Popularity
  - **Puzzles**: High Profitability + Low Popularity
  - **Dogs**: Low Profitability + Low Popularity
- Display visual matrix with items plotted
- Support custom threshold configuration
- Generate classification reports
- Track item movement across quadrants over time
- Provide strategic recommendations per quadrant
- Support filtering by date range, location, category

**Classification Criteria**:
- **Profitability**: Above/Below Average Contribution Margin
- **Popularity**: Above/Below 70% of Expected Menu Mix

**Business Rules**:
- Menu mix % = (Item Sales Count / Total Sales Count) × 100
- Average contribution margin calculated across all items
- Expected menu mix = 100% / Number of Menu Items
- Items classified based on comparison to averages
- Matrix recalculated daily with previous day's sales data

### FR-MENG-003: Contribution Margin Analysis
**Priority**: Critical
**Description**: System shall calculate and analyze contribution margins for all menu items.

**Requirements**:
- Calculate contribution margin per item
- Calculate contribution margin percentage
- Track contribution margin by category
- Calculate weighted contribution margin
- Display contribution margin trends over time
- Compare contribution margins across locations
- Identify top and bottom contributors
- Generate contribution margin reports
- Support what-if scenario analysis for price changes
- Alert on negative or low contribution margins

**Calculation Formulas**:
```
Contribution Margin = Selling Price - Food Cost
Contribution Margin % = (Contribution Margin / Selling Price) × 100
Weighted Contribution Margin = Contribution Margin × Menu Mix %
Total Contribution = Sum of (Contribution Margin × Quantity Sold)
```

**Business Rules**:
- Contribution margin must be positive for active items
- Warning threshold: Contribution margin < 20% of selling price
- Critical threshold: Contribution margin < 10% of selling price
- Historical trends tracked for 12 months minimum
- Contribution margin recalculated when recipe costs change

### FR-MENG-004: Menu Mix Analysis
**Priority**: Critical
**Description**: System shall provide comprehensive menu mix analysis and forecasting.

**Requirements**:
- Calculate actual menu mix percentage per item
- Calculate expected menu mix (baseline)
- Calculate menu mix variance (actual vs. expected)
- Track menu mix trends over time
- Support menu mix forecasting based on historical data
- Analyze menu mix by day part (breakfast, lunch, dinner)
- Analyze menu mix by day of week
- Analyze menu mix by season
- Compare menu mix across locations
- Identify menu mix outliers and anomalies
- Generate menu mix distribution charts

**Menu Mix Metrics**:
- **Actual Menu Mix %**: (Item Units Sold / Total Units Sold) × 100
- **Expected Menu Mix %**: 100% / Number of Active Menu Items
- **Menu Mix Variance**: Actual Menu Mix % - Expected Menu Mix %
- **Popularity Index**: Actual Menu Mix % / Expected Menu Mix %

**Business Rules**:
- Popularity index > 1.0 indicates high popularity
- Popularity index < 0.7 indicates low popularity (may qualify as "Dog")
- Menu mix calculated separately for each category
- Seasonal items excluded from baseline menu mix calculation
- Date range configurable (default: last 30 days)

### FR-MENG-005: Pricing Strategy and Optimization
**Priority**: Critical
**Description**: System shall support strategic pricing decisions and optimization recommendations.

**Requirements**:
- Calculate optimal pricing based on target contribution margin
- Provide price elasticity analysis
- Support psychological pricing strategies (charm pricing)
- Analyze competitor pricing and market positioning
- Recommend price adjustments for underperforming items
- Calculate break-even pricing
- Support bundle pricing strategies
- Implement dynamic pricing rules (happy hour, seasonal)
- Track price change impact on sales volume
- Generate pricing scenario comparisons

**Pricing Formulas**:
```
Optimal Price = Food Cost / (1 - Target Contribution Margin %)
Break-Even Price = Food Cost × (1 + Minimum Acceptable Margin %)
Psychological Price = Optimal Price adjusted to .95 or .99 ending
Price Elasticity = (% Change in Quantity) / (% Change in Price)
```

**Business Rules**:
- Target contribution margin: 60-75% for most food items
- Beverage contribution margin target: 75-85%
- Price changes limited to maximum 15% increase per change
- Price decreases require justification and approval
- Minimum 14-day evaluation period after price changes
- Historical pricing tracked for trend analysis

### FR-MENG-006: Menu Item Performance Tracking
**Priority**: High
**Description**: System shall track comprehensive performance metrics for all menu items.

**Requirements**:
- Track total units sold per item
- Track total revenue per item
- Track total cost per item
- Calculate velocity (items sold per day)
- Calculate revenue per available seat hour (RevPASH)
- Track item order frequency
- Monitor item return/complaint rates
- Track preparation time impact on kitchen flow
- Analyze peak demand periods per item
- Generate performance scorecards per item
- Compare performance across time periods

**Performance Metrics**:
- **Velocity**: Units Sold / Number of Days
- **RevPASH**: Revenue / (Seats × Hours Open)
- **Turn Rate**: Times Item Sold / Times Item Ordered
- **Waste Rate**: Units Wasted / Units Produced
- **Contribution per Minute**: Contribution Margin / Prep Time

**Business Rules**:
- Performance data aggregated daily
- Historical data retained for 24 months
- Performance alerts triggered by configurable thresholds
- Comparison periods: Week-over-week, Month-over-month, Year-over-year
- Outlier detection for abnormal performance patterns

### FR-MENG-007: Strategic Recommendations Engine
**Priority**: High
**Description**: System shall provide automated strategic recommendations based on menu analysis.

**Recommendations by Quadrant**:

**Stars (High Profit, High Popularity)**:
- Maintain current price and quality
- Promote prominently on menu
- Consider premium variations
- Monitor for competition imitation
- Use as loss leader alternative
- Highlight in marketing materials

**Plowhorses (Low Profit, High Popularity)**:
- Increase price gradually (test price elasticity)
- Reduce portion size while maintaining perceived value
- Find lower-cost ingredient substitutions
- Bundle with higher-margin items
- Consider premium version at higher price
- Monitor competitive pressure

**Puzzles (High Profit, Low Popularity)**:
- Relocate to prominent menu position
- Improve menu description and photography
- Offer sampling or promotions
- Reposition or rebrand item
- Bundle with popular items (Stars/Plowhorses)
- Enhance presentation and plating
- Consider limited-time offer to create urgency

**Dogs (Low Profit, Low Popularity)**:
- Remove from menu (immediate action)
- Replace with Star or Puzzle item
- Conduct exit analysis (customer feedback)
- Liquidate remaining inventory
- Evaluate category gaps after removal

**Business Rules**:
- Recommendations updated weekly
- Priority ranking based on financial impact
- Implementation tracking for recommendation effectiveness
- Recommendations require management review before implementation
- A/B testing supported for major menu changes

### FR-MENG-008: Menu Composition and Balance
**Priority**: High
**Description**: System shall analyze and recommend optimal menu composition and balance.

**Requirements**:
- Analyze category distribution (appetizers, mains, desserts)
- Calculate optimal menu size based on operational capacity
- Identify menu complexity index
- Analyze price point distribution
- Recommend menu structure (number of items per category)
- Assess menu variety vs. operational efficiency
- Identify redundant or overlapping items
- Calculate kitchen capacity utilization per item
- Analyze ingredient overlap for inventory efficiency
- Generate menu balance scorecards

**Menu Composition Metrics**:
- **Menu Size Index**: Total Active Items / Optimal Items (benchmark: 1.0)
- **Complexity Score**: Weighted average of prep complexity across items
- **Price Point Spread**: Range and distribution of menu prices
- **Category Balance**: % of items per category vs. ideal distribution
- **Ingredient Overlap**: Shared ingredients across items (higher = more efficient)

**Business Rules**:
- Optimal menu size: 7-12 items per category (research-based)
- Maximum 60 total menu items for full-service restaurant
- Each category should have mix of price points (low, medium, high)
- Minimum 30% ingredient overlap for inventory efficiency
- Menu complexity score should not exceed operational capacity rating

### FR-MENG-009: Competitor Analysis and Market Positioning
**Priority**: Medium
**Description**: System shall support competitor pricing tracking and market positioning analysis.

**Requirements**:
- Add and manage competitor profiles
- Track competitor menu items and prices
- Record competitor item descriptions
- Compare pricing vs. competitors (item-by-item)
- Calculate price positioning index
- Track competitor menu changes over time
- Identify pricing opportunities (underpriced items)
- Identify pricing risks (overpriced items)
- Generate competitive analysis reports
- Support multi-location competitor tracking

**Competitor Analysis Metrics**:
- **Price Index**: Our Price / Average Competitor Price
- **Premium/Discount %**: (Our Price - Avg Competitor Price) / Avg Competitor Price × 100
- **Market Position**: Premium (>15% higher), Competitive (±15%), Value (<15% lower)

**Business Rules**:
- Minimum 3 competitors tracked per location for meaningful analysis
- Competitor data updated monthly minimum
- Price comparisons for similar items (category matching)
- Market position displayed with visual indicators
- Alerts when competitors change pricing significantly (>10%)

### FR-MENG-010: Menu Item Lifecycle Management
**Priority**: Medium
**Description**: System shall manage menu item lifecycle from introduction to discontinuation.

**Lifecycle Stages**:
1. **Introduction**: New item launch, trial period, initial promotion
2. **Growth**: Increasing sales, expanding availability, customer adoption
3. **Maturity**: Stable sales, established customer base, routine operations
4. **Decline**: Decreasing sales, customer fatigue, consideration for removal
5. **Discontinuation**: Item removed, replacement planned, customer notification

**Requirements**:
- Assign lifecycle stage to each menu item
- Track stage duration and transitions
- Set stage-specific KPIs and targets
- Automate stage transition recommendations
- Generate lifecycle reports and analytics
- Support planned seasonal introductions/removals
- Track customer feedback by lifecycle stage
- Calculate ROI for new item introductions
- Plan replacement items for declining products

**Stage Transition Rules**:
- Introduction → Growth: Sales exceed target after 30 days
- Growth → Maturity: Sales plateau (variance < 10% for 60 days)
- Maturity → Decline: Sales decrease > 20% over 90 days
- Decline → Discontinuation: Sales < 50% of peak for 60 days

### FR-MENG-011: Sales Forecasting and Demand Planning
**Priority**: Medium
**Description**: System shall provide sales forecasting and demand planning capabilities.

**Requirements**:
- Forecast item-level sales based on historical data
- Support multiple forecasting methods (moving average, exponential smoothing)
- Account for seasonality in forecasts
- Account for trends (growth/decline)
- Account for promotional impacts
- Generate short-term forecasts (daily, weekly)
- Generate long-term forecasts (monthly, quarterly)
- Calculate forecast accuracy metrics
- Adjust forecasts based on actual performance
- Integrate forecasts with inventory planning

**Forecasting Metrics**:
- **MAPE (Mean Absolute Percentage Error)**: Average forecast accuracy
- **Forecast Bias**: Tendency to over/under forecast
- **Tracking Signal**: Cumulative forecast error monitoring

**Business Rules**:
- Minimum 90 days historical data required for forecasting
- Forecast accuracy target: MAPE < 20%
- Forecasts updated weekly with actual sales data
- Seasonal adjustments applied automatically
- Promotional periods excluded from baseline forecast calculations

### FR-MENG-012: Menu Performance Dashboards
**Priority**: High
**Description**: System shall provide visual dashboards for menu performance monitoring.

**Dashboard Components**:
- **Executive Summary**: Top-level metrics and KPIs
- **Menu Engineering Matrix**: Visual quadrant chart with item placement
- **Contribution Margin Analysis**: Bar charts and trend lines
- **Sales Performance**: Line charts showing volume and revenue trends
- **Category Performance**: Pie charts showing category distribution
- **Item Rankings**: Top/bottom performers by various metrics
- **Alerts and Notifications**: Actionable insights requiring attention
- **Trend Indicators**: Up/down arrows showing performance direction

**Requirements**:
- Real-time or near-real-time data updates
- Drill-down capability from summary to detail
- Customizable date ranges and filters
- Export dashboard data to PDF/Excel
- Share dashboards via email or link
- Mobile-responsive design for tablet access
- Configurable alert thresholds
- Comparison views (period-over-period)

### FR-MENG-013: Report Generation and Export
**Priority**: Medium
**Description**: System shall generate comprehensive menu engineering reports.

**Report Types**:
1. **Menu Engineering Matrix Report**: Item classifications and recommendations
2. **Contribution Margin Report**: Profitability analysis by item and category
3. **Menu Mix Report**: Sales distribution and popularity metrics
4. **Price Analysis Report**: Pricing strategy and optimization opportunities
5. **Competitor Analysis Report**: Market positioning and pricing comparison
6. **Performance Scorecard**: Comprehensive metrics per item
7. **Lifecycle Report**: Item lifecycle stages and transitions
8. **Forecast Accuracy Report**: Forecasting performance evaluation
9. **Menu Optimization Report**: Strategic recommendations summary
10. **Custom Reports**: User-defined metrics and filters

**Requirements**:
- Generate reports on-demand or scheduled
- Export to PDF, Excel, CSV formats
- Support email delivery
- Include visualizations (charts, graphs)
- Support multi-location reporting
- Include executive summaries
- Provide drill-down details
- Archive reports for historical reference

### FR-MENG-014: Menu Optimization Experiments (A/B Testing)
**Priority**: Low
**Description**: System shall support menu optimization experiments and A/B testing.

**Requirements**:
- Create experiment definitions (test variants)
- Define experiment parameters (duration, locations, metrics)
- Randomly assign customers to test groups (A/B)
- Track performance metrics by test group
- Calculate statistical significance
- Generate experiment reports
- Recommend winning variant
- Roll out winning variant automatically (optional)
- Archive experiment results

**Experiment Types**:
- **Price Testing**: Test different price points
- **Description Testing**: Test menu item descriptions
- **Positioning Testing**: Test menu placement (page, section)
- **Bundle Testing**: Test different combo configurations
- **Promotion Testing**: Test different promotional strategies

**Business Rules**:
- Minimum 14-day experiment duration
- Minimum 100 transactions per variant for statistical validity
- Statistical significance threshold: 95% confidence level
- Maximum 2 concurrent experiments per location
- Experiments paused if negative impact detected (>10% revenue loss)

### FR-MENG-015: Integration with Recipe Management
**Priority**: Critical
**Description**: System shall integrate seamlessly with Recipe Management module for cost data.

**Requirements**:
- Link menu items to recipes (one-to-one or one-to-many)
- Pull recipe costs for contribution margin calculations
- Update menu item costs when recipe costs change
- Support recipe variants for menu item variations
- Display recipe details within menu item view
- Alert when recipe costs impact profitability targets
- Track recipe version changes affecting menu items
- Support composite items (multiple recipes per menu item)

**Data Flow**:
- Recipe cost updates → Menu item cost updates → Contribution margin recalculation
- Menu item sales → Recipe production requirements → Inventory planning
- Recipe availability → Menu item availability (out of stock handling)

---

## 3. Business Rules

### BR-MENG-001: Menu Item Classification Rules
**Rule**: Menu items must be classified into Menu Engineering Matrix quadrants based on standardized criteria.

**Classification Logic**:
```
Popularity Threshold = 0.7 × Expected Menu Mix %
Expected Menu Mix % = 100% / Number of Active Items
Profitability Threshold = Average Contribution Margin across all items

IF Contribution Margin >= Average CM AND Menu Mix % >= Popularity Threshold:
  Classification = "Star"
ELSE IF Contribution Margin < Average CM AND Menu Mix % >= Popularity Threshold:
  Classification = "Plowhorse"
ELSE IF Contribution Margin >= Average CM AND Menu Mix % < Popularity Threshold:
  Classification = "Puzzle"
ELSE:
  Classification = "Dog"
```

**Rationale**: Standardized classification ensures consistent strategic recommendations.

**Validation**: Run classification algorithm nightly with previous day's sales data.

### BR-MENG-002: Contribution Margin Thresholds
**Rule**: Contribution margins must meet minimum thresholds for menu item viability.

**Thresholds**:
- **Critical Minimum**: 30% contribution margin (below = immediate review required)
- **Warning Level**: 40% contribution margin (below = monitoring required)
- **Target Level**: 60-75% contribution margin (optimal range)
- **Beverage Target**: 75-85% contribution margin

**Validation**: Check contribution margins daily; generate alerts for items below thresholds.

**Actions**:
- Below 30%: Flag for immediate price increase or removal
- 30-40%: Monitor closely, plan corrective action within 30 days
- Above 75%: Consider competitive pricing pressure, may be opportunity to increase volume

### BR-MENG-003: Menu Size Optimization
**Rule**: Menu size should align with operational capacity and customer choice architecture.

**Optimal Menu Sizes** (research-based):
- **Appetizers**: 6-10 items
- **Main Courses**: 8-14 items
- **Desserts**: 4-8 items
- **Beverages**: 10-20 items (depending on bar vs. restaurant)
- **Total Menu**: 40-60 items (full-service restaurant)

**Rationale**:
- Too few items = limited customer choice, lost sales opportunities
- Too many items = complexity, higher costs, decision paralysis

**Validation**: Calculate menu size index monthly; recommend additions/removals to reach optimal range.

### BR-MENG-004: Price Change Approval Workflow
**Rule**: Significant price changes require approval based on magnitude and risk.

**Approval Requirements**:
- **< 5% increase**: Manager approval
- **5-10% increase**: Director approval
- **> 10% increase**: Executive approval + impact analysis
- **Any decrease**: Director approval + justification

**Rationale**: Price changes impact customer perception, sales volume, and profitability.

**Validation**: Enforce approval workflow in system; track price change history.

### BR-MENG-005: Dog Item Removal Policy
**Rule**: Items classified as "Dogs" for 60+ days should be removed from menu.

**Removal Criteria**:
- Classified as "Dog" for at least 60 consecutive days
- Contribution margin < average for 90+ days
- Menu mix < 50% of expected mix for 90+ days
- No pending promotional activities

**Exceptions**:
- Signature items (brand identity)
- Dietary necessity items (vegetarian, gluten-free)
- Seasonal items within season
- Recently introduced items (< 90 days)

**Process**:
1. Identify Dog items meeting criteria
2. Notify management with removal recommendation
3. Plan replacement item (Star or Puzzle promotion)
4. Execute removal and communicate to customers

### BR-MENG-006: Star Item Promotion Requirements
**Rule**: Star items should receive prominent menu placement and marketing support.

**Requirements**:
- Position in top 1/3 of menu page
- Include high-quality image
- Use descriptive, appetizing language
- Highlight in promotional materials
- Train staff to recommend
- Consider cross-selling opportunities

**Rationale**: Stars drive profitability and customer satisfaction; maximize their exposure.

**Validation**: Review menu layout quarterly; ensure Star items have premium placement.

### BR-MENG-007: Puzzle Item Intervention Timeline
**Rule**: Puzzle items must show improvement within 90 days or be removed.

**Intervention Steps**:
1. **Day 0-30**: Implement promotion strategy (repositioning, description update, staff training)
2. **Day 30-60**: Monitor sales performance; adjust strategy if needed
3. **Day 60-90**: Evaluate results; decide to retain or remove
4. **Day 90+**: If no improvement (sales increase < 20%), remove from menu

**Success Criteria**:
- Menu mix increases to > 70% of expected mix, OR
- Sales volume increases > 20% from baseline, OR
- Item moves from Puzzle to Star quadrant

**Validation**: Track Puzzle items monthly; enforce intervention timeline.

### BR-MENG-008: Plowhorse Pricing Strategy
**Rule**: Plowhorse items should undergo price optimization within 60 days of classification.

**Optimization Strategies**:
1. **Test Price Increase**: Increase price by 5-10% and monitor volume impact
2. **Reduce Cost**: Substitute lower-cost ingredients or reduce portion size
3. **Bundle Strategy**: Pair with higher-margin items (appetizer + main combo)
4. **Premium Version**: Offer upgraded version at 25-30% higher price

**Target Outcome**: Move item from Plowhorse to Star quadrant or increase contribution margin by minimum 10 percentage points.

**Validation**: Review Plowhorse items monthly; track price optimization initiatives.

### BR-MENG-009: Seasonal Item Management
**Rule**: Seasonal items must have defined availability windows and transition plans.

**Requirements**:
- Start date and end date defined at item creation
- Promotional plan for introduction (first 2 weeks)
- Exit strategy for end of season (last 2 weeks)
- Replacement item identified (if permanent menu slot)
- Inventory liquidation plan for season end

**Lifecycle**:
- **2 weeks before**: Promote upcoming seasonal item
- **Launch**: Feature prominently, staff training, sampling
- **During season**: Monitor performance, adjust as needed
- **2 weeks before end**: Final promotional push, "limited time" messaging
- **End of season**: Remove from menu, liquidate inventory

**Validation**: Automated alerts for seasonal transition dates; track seasonal performance year-over-year.

### BR-MENG-010: New Item Introduction Requirements
**Rule**: New menu items must complete introduction evaluation period before becoming permanent.

**Introduction Period**: 60-90 days

**Evaluation Criteria**:
- **Sales Volume**: Must reach > 70% of expected menu mix
- **Customer Feedback**: Average rating ≥ 4.0/5.0
- **Profitability**: Contribution margin ≥ target for category
- **Operational Impact**: Kitchen prep time within standards, no excessive waste

**Decision Rules**:
- **Pass all criteria**: Promote to permanent menu
- **Fail 1-2 criteria**: Extend evaluation 30 days with corrective actions
- **Fail 3+ criteria**: Remove from menu and replace

**Validation**: Automated evaluation reports at 30, 60, and 90 days; management review required for permanent status.

### BR-MENG-011: Menu Mix Monitoring and Alerts
**Rule**: Significant deviations in menu mix trigger automated alerts for investigation.

**Alert Thresholds**:
- **Critical**: Item menu mix drops > 50% from 30-day average
- **Warning**: Item menu mix drops > 30% from 30-day average
- **Info**: Item menu mix changes > 20% from 30-day average

**Investigation Actions**:
- Verify data accuracy (POS system issues, data errors)
- Check ingredient availability (out of stock)
- Review customer feedback (quality issues, complaints)
- Assess competitive changes (new competitor offerings)
- Evaluate recent menu changes (new items cannibalizing sales)

**Validation**: Automated daily monitoring; alerts sent to management dashboard.

### BR-MENG-012: Contribution Margin Recalculation Triggers
**Rule**: Contribution margins must be recalculated automatically when underlying costs change.

**Recalculation Triggers**:
- Recipe cost update (ingredient prices, wastage changes)
- Recipe formulation change (new ingredients, quantities)
- Portion size change
- Menu item price change
- Labor cost percentage change (indirect)

**Recalculation Frequency**:
- **Real-time**: When recipe costs updated in Recipe Management module
- **Batch**: Nightly recalculation for all items (catch any missed updates)
- **On-demand**: When user requests updated calculations

**Validation**: Audit log for all recalculations; track cost variance history.

---

## 4. Data Model

### MenuItemPerformance Entity
```typescript
interface MenuItemPerformance {
  // Identification
  id: string                          // Unique identifier
  menuItemId: string                  // FK to MenuItem
  menuItemName: string                // Menu item name
  recipeId?: string                   // FK to Recipe (if applicable)
  categoryId: string                  // FK to MenuCategory
  categoryName: string                // Category name (Appetizers, Mains, etc.)

  // Status and Classification
  status: MenuItemStatus              // active | seasonal | discontinued
  classification: MenuEngineeringClass // Star | Plowhorse | Puzzle | Dog
  lifecycleStage: LifecycleStage      // introduction | growth | maturity | decline | discontinued

  // Period Information
  periodStart: string                 // Analysis period start date (ISO 8601)
  periodEnd: string                   // Analysis period end date (ISO 8601)
  periodDays: number                  // Number of days in analysis period

  // Sales Volume Metrics
  unitsSold: number                   // Total units sold in period
  totalRevenue: number                // Total revenue in period
  totalCost: number                   // Total food cost in period
  velocity: number                    // Units per day (unitsSold / periodDays)

  // Menu Mix Metrics
  actualMenuMixPercent: number        // (unitsSold / totalUnitsSold) × 100
  expectedMenuMixPercent: number      // 100 / activeItemsCount
  menuMixVariance: number             // actualMenuMixPercent - expectedMenuMixPercent
  popularityIndex: number             // actualMenuMixPercent / expectedMenuMixPercent

  // Profitability Metrics
  sellingPrice: number                // Current selling price per unit
  foodCost: number                    // Food cost per unit (from recipe)
  contributionMargin: number          // sellingPrice - foodCost
  contributionMarginPercent: number   // (contributionMargin / sellingPrice) × 100
  weightedContributionMargin: number  // contributionMargin × menuMixPercent
  totalContribution: number           // contributionMargin × unitsSold

  // Comparison Metrics
  avgContributionMargin: number       // Average CM across all items in period
  profitabilityVsAverage: number      // contributionMargin - avgContributionMargin
  popularityThreshold: number         // 0.7 × expectedMenuMixPercent
  isHighProfitability: boolean        // contributionMargin >= avgContributionMargin
  isHighPopularity: boolean           // actualMenuMixPercent >= popularityThreshold

  // Trend Metrics
  previousPeriodUnitsSold?: number    // Units sold in previous comparable period
  salesGrowthPercent?: number         // % change vs. previous period
  trendDirection: TrendDirection      // up | down | stable

  // Strategic Metrics
  revenuePASH?: number                // Revenue per available seat hour
  orderFrequency?: number             // Times ordered / Times on order
  returnRate?: number                 // Returns or complaints / unitsSold
  preparationComplexity?: number      // Scale 1-10 (from recipe)
  contributionPerMinute?: number      // contributionMargin / prepTime

  // Competitor Comparison
  competitorAvgPrice?: number         // Average competitor price for similar item
  priceIndex?: number                 // sellingPrice / competitorAvgPrice
  marketPosition?: MarketPosition     // premium | competitive | value

  // Audit Trail
  calculatedAt: string                // Timestamp of calculation (ISO 8601)
  calculatedBy: string                // User or system ID
  lastUpdated: string                 // Last update timestamp
}
```

### MenuEngineeringRecommendation Entity
```typescript
interface MenuEngineeringRecommendation {
  // Identification
  id: string                          // Unique identifier
  menuItemId: string                  // FK to MenuItem
  performanceId: string               // FK to MenuItemPerformance

  // Recommendation Details
  classification: MenuEngineeringClass // Current classification
  recommendationType: RecommendationType // pricing | positioning | promotion | removal | maintain
  priority: RecommendationPriority    // critical | high | medium | low

  // Recommendation Content
  title: string                       // Brief recommendation title
  description: string                 // Detailed recommendation description
  expectedImpact: ImpactLevel         // high | medium | low
  estimatedRevenueImpact?: number     // Expected $ impact if implemented
  estimatedMarginImpact?: number      // Expected margin % impact if implemented

  // Implementation
  implementationSteps: string[]       // Step-by-step actions
  estimatedEffort: EffortLevel        // low | medium | high
  requiredResources: string[]         // Required resources (staff, budget, time)
  timeline: string                    // Expected implementation timeline

  // Status Tracking
  status: RecommendationStatus        // pending | approved | in_progress | completed | rejected
  approvedBy?: string                 // User ID who approved
  approvedAt?: string                 // Approval timestamp
  implementedAt?: string              // Implementation timestamp

  // Results Tracking
  actualRevenueImpact?: number        // Actual $ impact post-implementation
  actualMarginImpact?: number         // Actual margin % impact post-implementation
  success: boolean                    // Was recommendation successful?
  notes?: string                      // Implementation notes and learnings

  // Audit Trail
  createdAt: string                   // Creation timestamp (ISO 8601)
  createdBy: string                   // System or user ID
  updatedAt: string                   // Last update timestamp
}
```

### MenuCategory Entity
```typescript
interface MenuCategory {
  // Identification
  id: string                          // Unique identifier
  name: string                        // Category name (Appetizers, Mains, etc.)
  description: string                 // Category description

  // Display Properties
  displayOrder: number                // Sort order for menu display
  icon?: string                       // Category icon (optional)
  color?: string                      // Category color for UI (optional)

  // Category Targets
  targetItemCount: number             // Target number of items in category
  minItemCount: number                // Minimum items required
  maxItemCount: number                // Maximum items recommended

  // Profitability Targets
  targetContributionMarginPercent: number // Target CM% for category
  minContributionMarginPercent: number    // Minimum acceptable CM%

  // Status
  isActive: boolean                   // Category active/inactive

  // Audit Trail
  createdAt: string                   // Creation timestamp (ISO 8601)
  createdBy: string                   // Created by user ID
  updatedAt: string                   // Last update timestamp
  updatedBy: string                   // Updated by user ID
}
```

### CompetitorItem Entity
```typescript
interface CompetitorItem {
  // Identification
  id: string                          // Unique identifier
  competitorId: string                // FK to Competitor
  competitorName: string              // Competitor name
  itemName: string                    // Competitor's item name

  // Comparison Mapping
  ourMenuItemId?: string              // FK to our MenuItem (if comparable)
  categoryId: string                  // Category for comparison

  // Pricing Information
  price: number                       // Competitor's price
  portionSize?: string                // Portion description (e.g., "12 oz", "large")
  pricePerStandardUnit?: number       // Normalized price (e.g., per 100g)

  // Additional Details
  description?: string                // Item description
  imageUrl?: string                   // Item image URL (if available)
  source: string                      // Data source (visit, website, menu, etc.)

  // Tracking
  firstSeenAt: string                 // When first observed (ISO 8601)
  lastVerifiedAt: string              // Last verification date (ISO 8601)
  isActive: boolean                   // Still on competitor's menu

  // Audit Trail
  createdAt: string                   // Creation timestamp (ISO 8601)
  createdBy: string                   // Created by user ID
  updatedAt: string                   // Last update timestamp
}
```

### Competitor Entity
```typescript
interface Competitor {
  // Identification
  id: string                          // Unique identifier
  name: string                        // Competitor name

  // Location Information
  address: string                     // Physical address
  city: string                        // City
  state: string                       // State/Province
  country: string                     // Country
  latitude?: number                   // GPS latitude
  longitude?: number                  // GPS longitude

  // Competitor Details
  type: RestaurantType                // fine_dining | casual | fast_casual | quick_service
  cuisine: string                     // Cuisine type (similar to our CuisineType)
  priceRange: PriceRange              // $ | $$ | $$$ | $$$$

  // Comparison Relevance
  isDirectCompetitor: boolean         // Direct vs. indirect competitor
  relevanceScore: number              // 1-10 scale for tracking priority

  // Contact Information
  website?: string                    // Website URL
  phone?: string                      // Phone number

  // Status
  isActive: boolean                   // Still operating and relevant

  // Audit Trail
  createdAt: string                   // Creation timestamp (ISO 8601)
  createdBy: string                   // Created by user ID
  updatedAt: string                   // Last update timestamp
  updatedBy: string                   // Updated by user ID
}
```

### MenuOptimizationExperiment Entity
```typescript
interface MenuOptimizationExperiment {
  // Identification
  id: string                          // Unique identifier
  name: string                        // Experiment name
  description: string                 // Experiment description

  // Experiment Configuration
  experimentType: ExperimentType      // price | description | positioning | bundle | promotion
  menuItemId: string                  // FK to MenuItem being tested

  // Test Variants
  controlVariant: ExperimentVariant   // Control (current state)
  testVariants: ExperimentVariant[]   // Test variants (1-3 variants)

  // Experiment Period
  startDate: string                   // Start date (ISO 8601)
  endDate: string                     // End date (ISO 8601)
  duration: number                    // Duration in days

  // Experiment Scope
  locationIds: string[]               // FK to Locations (where experiment runs)
  customerSegment?: string            // Target customer segment (optional)

  // Success Metrics
  primaryMetric: ExperimentMetric     // Primary success metric (e.g., revenue)
  secondaryMetrics: ExperimentMetric[] // Additional metrics to track
  minimumSampleSize: number           // Required transactions per variant

  // Results
  status: ExperimentStatus            // draft | running | completed | cancelled
  winningVariantId?: string           // ID of winning variant (if concluded)
  statisticalSignificance?: number    // P-value or confidence level

  // Rollout
  rolloutStatus: RolloutStatus        // pending | in_progress | completed
  rolloutDate?: string                // Date winning variant rolled out

  // Audit Trail
  createdAt: string                   // Creation timestamp (ISO 8601)
  createdBy: string                   // Created by user ID
  updatedAt: string                   // Last update timestamp
}
```

### ExperimentVariant Entity
```typescript
interface ExperimentVariant {
  id: string                          // Variant identifier
  name: string                        // Variant name (e.g., "Control", "Test A")
  isControl: boolean                  // Is this the control variant?

  // Variant Configuration
  price?: number                      // Price (if testing pricing)
  description?: string                // Description (if testing description)
  menuPosition?: string               // Position (if testing positioning)
  bundleConfiguration?: string        // Bundle details (if testing bundles)

  // Performance Metrics
  transactionCount: number            // Number of transactions
  unitsSold: number                   // Total units sold
  totalRevenue: number                // Total revenue
  avgContributionMargin: number       // Average contribution margin
  conversionRate?: number             // % of views that convert to purchases

  // Statistical Metrics
  mean: number                        // Mean of primary metric
  standardDeviation: number           // Standard deviation
  confidenceInterval: number[]        // 95% confidence interval [lower, upper]
}
```

### Enumerations

```typescript
enum MenuItemStatus {
  ACTIVE = 'active',
  SEASONAL = 'seasonal',
  DISCONTINUED = 'discontinued'
}

enum MenuEngineeringClass {
  STAR = 'Star',              // High Profit, High Popularity
  PLOWHORSE = 'Plowhorse',    // Low Profit, High Popularity
  PUZZLE = 'Puzzle',          // High Profit, Low Popularity
  DOG = 'Dog'                 // Low Profit, Low Popularity
}

enum LifecycleStage {
  INTRODUCTION = 'introduction',
  GROWTH = 'growth',
  MATURITY = 'maturity',
  DECLINE = 'decline',
  DISCONTINUED = 'discontinued'
}

enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

enum MarketPosition {
  PREMIUM = 'premium',      // >15% above competitor average
  COMPETITIVE = 'competitive', // Within ±15% of competitor average
  VALUE = 'value'           // >15% below competitor average
}

enum RecommendationType {
  PRICING = 'pricing',
  POSITIONING = 'positioning',
  PROMOTION = 'promotion',
  REMOVAL = 'removal',
  MAINTAIN = 'maintain',
  BUNDLE = 'bundle',
  REFORMULATION = 'reformulation'
}

enum RecommendationPriority {
  CRITICAL = 'critical',    // Immediate action required
  HIGH = 'high',            // Action within 7 days
  MEDIUM = 'medium',        // Action within 30 days
  LOW = 'low'               // Monitor and plan
}

enum ImpactLevel {
  HIGH = 'high',            // >$1000/month or >5% margin improvement
  MEDIUM = 'medium',        // $500-$1000/month or 2-5% margin improvement
  LOW = 'low'               // <$500/month or <2% margin improvement
}

enum EffortLevel {
  LOW = 'low',              // <1 day implementation
  MEDIUM = 'medium',        // 1-5 days implementation
  HIGH = 'high'             // >5 days implementation
}

enum RecommendationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

enum ExperimentType {
  PRICE = 'price',
  DESCRIPTION = 'description',
  POSITIONING = 'positioning',
  BUNDLE = 'bundle',
  PROMOTION = 'promotion'
}

enum ExperimentStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum RolloutStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

enum RestaurantType {
  FINE_DINING = 'fine_dining',
  CASUAL = 'casual',
  FAST_CASUAL = 'fast_casual',
  QUICK_SERVICE = 'quick_service'
}

enum PriceRange {
  ONE = '$',      // Budget
  TWO = '$$',     // Moderate
  THREE = '$$$',  // Upscale
  FOUR = '$$$$'   // Premium
}
```

---

## 5. Integration Points

### 5.1 Recipe Management Integration
**Direction**: Bidirectional
**Type**: Pull/Push

**Integration Requirements**:
- Pull recipe costs for contribution margin calculations
- Pull recipe details (prep time, complexity) for operational analysis
- Receive notifications when recipe costs change
- Update menu item costs automatically when recipe costs update
- Link menu items to recipes (one-to-one or one-to-many)
- Support recipe variants for menu item variations

**Data Flow**:
- **Inbound**: Recipe cost updates → Menu item cost updates → Contribution margin recalculation → Classification updates
- **Outbound**: Menu item sales data → Recipe demand forecasting
- **Inbound**: Recipe availability (out of stock) → Menu item availability updates

### 5.2 Inventory Management Integration
**Direction**: Bidirectional
**Type**: Pull/Push

**Integration Requirements**:
- Pull ingredient costs for recipe cost calculations
- Pull ingredient availability for menu item availability
- Receive inventory level alerts affecting menu items
- Support demand planning based on menu forecasts
- Track ingredient usage by menu item sales

**Data Flow**:
- **Inbound**: Ingredient cost changes → Recipe cost updates → Menu item cost updates
- **Outbound**: Sales forecasts → Inventory planning requirements
- **Inbound**: Ingredient out-of-stock → Menu item availability status

### 5.3 POS (Point of Sale) Integration
**Direction**: Bidirectional
**Type**: Pull/Push (Real-time)

**Integration Requirements**:
- Receive real-time sales transaction data
- Pull menu item sales by unit, revenue, time
- Push menu item price changes to POS
- Push menu item availability status (86'd items)
- Support menu item modifiers and variations
- Track sales by day part, day of week, season

**Data Flow**:
- **Inbound**: Sales transactions → Performance calculations → Menu Engineering Matrix updates
- **Outbound**: Price changes → POS menu updates
- **Outbound**: Item availability changes → POS item status updates
- **Inbound**: Customer feedback → Item performance tracking

### 5.4 Reporting & Analytics Integration
**Direction**: Outbound
**Type**: Push

**Integration Requirements**:
- Export menu performance data to BI tools
- Support custom report definitions
- Provide API access to performance metrics
- Schedule automated report generation
- Support data visualization tools

**Data Flow**:
- **Outbound**: Menu performance data → BI dashboards
- **Outbound**: Contribution margin data → Financial reports
- **Outbound**: Sales trends → Forecasting models

### 5.5 Customer Feedback Integration
**Direction**: Inbound
**Type**: Pull

**Integration Requirements**:
- Pull customer ratings and reviews by menu item
- Pull complaint/return data from POS
- Aggregate feedback scores per menu item
- Track feedback trends over time
- Correlate feedback with sales performance

**Data Flow**:
- **Inbound**: Customer ratings → Item performance scores
- **Inbound**: Complaint data → Quality alerts
- **Inbound**: Review sentiment → Item lifecycle decisions

### 5.6 Menu Design/Printing Integration
**Direction**: Outbound
**Type**: Push

**Integration Requirements**:
- Export menu item data for menu design
- Support menu layout optimization recommendations
- Provide item positioning suggestions
- Export category organization
- Support multi-channel menus (print, digital, mobile)

**Data Flow**:
- **Outbound**: Star items → Prominent menu placement recommendations
- **Outbound**: Item classifications → Menu layout suggestions
- **Outbound**: Updated prices/descriptions → Menu reprinting queue

### 5.7 Marketing & Promotions Integration
**Direction**: Outbound
**Type**: Push

**Integration Requirements**:
- Identify high-performing items for promotion
- Suggest underperforming items needing marketing support
- Provide performance data for campaign planning
- Track promotional impact on sales

**Data Flow**:
- **Outbound**: Star items → Featured item promotions
- **Outbound**: Puzzle items → Promotional campaign targets
- **Inbound**: Promotional periods → Performance analysis (exclude from baseline)

### 5.8 User Management Integration
**Direction**: Inbound
**Type**: Authentication & Authorization

**Integration Requirements**:
- User authentication for menu engineering access
- Role-based permissions for menu analysis
- Approval workflows for pricing changes
- Audit trail for all menu engineering actions

**Permissions**:
- `menu_engineering.view`: View menu performance data
- `menu_engineering.analyze`: Run analyses and view recommendations
- `menu_engineering.approve`: Approve pricing and menu changes
- `menu_engineering.configure`: Configure thresholds and settings
- `menu_engineering.experiment`: Create and manage A/B tests

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### Response Time
- Dashboard load: < 2 seconds with 1000 menu items
- Menu Engineering Matrix calculation: < 3 seconds for 500 items
- Report generation: < 5 seconds for standard reports
- Data refresh: Real-time or < 5 minutes for batch updates
- Forecast generation: < 10 seconds for 90-day forecast

#### Throughput
- Support 50 concurrent users analyzing menu data
- Process 100,000 sales transactions per day
- Handle 10 simultaneous report generations

#### Scalability
- Support 10,000+ menu items across locations
- Handle 50 million+ sales transactions annually
- Scale horizontally for increased load

### 6.2 Usability Requirements

#### User Interface
- Intuitive dashboard design with drill-down capability
- Visual indicators for classifications (color-coded quadrants)
- Interactive charts and graphs
- Mobile-responsive design for tablet access
- Configurable filters and date ranges
- Keyboard shortcuts for power users

#### Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatible
- High contrast mode available
- Alt text for all visualizations
- Keyboard navigation support

#### Learning Curve
- New users productive within 1 hour
- Context-sensitive help available
- Tooltips for complex metrics
- Training videos for key workflows

### 6.3 Security Requirements

#### Authentication
- Secure user authentication required
- Session timeout after inactivity
- Multi-factor authentication support

#### Authorization
- Role-based access control (RBAC)
- Granular permissions per operation
- Approval workflows for critical changes
- Audit logging for sensitive actions

#### Data Protection
- Encryption in transit (HTTPS/TLS)
- Encryption at rest for competitive data
- Regular security audits
- Compliance with data protection regulations

### 6.4 Reliability Requirements

#### Availability
- System uptime: 99.5% (excluding planned maintenance)
- Graceful degradation if external systems unavailable
- Cached data for offline analysis capability

#### Data Integrity
- Calculation accuracy: 100% (no rounding errors)
- Referential integrity maintained
- Regular data integrity checks
- Automated reconciliation with source systems

#### Error Handling
- User-friendly error messages
- Automatic error logging
- Retry mechanisms for transient failures
- Fallback to cached data if real-time unavailable

#### Backup & Recovery
- Daily automated backups
- Point-in-time recovery capability
- Backup retention: 90 days
- Disaster recovery plan: RTO 4 hours, RPO 1 hour

### 6.5 Maintainability Requirements

#### Code Quality
- Clean, well-documented code
- Consistent coding standards
- Automated code quality checks

#### Testing
- Unit test coverage: ≥ 85% (critical for calculation accuracy)
- Integration test coverage: ≥ 75%
- Automated regression testing
- Performance testing for large datasets

#### Monitoring
- Performance monitoring (dashboard load times)
- Calculation accuracy monitoring
- Data synchronization monitoring
- Alert on calculation errors or data anomalies

#### Documentation
- Technical documentation for developers
- User manuals with calculation explanations
- API documentation (if applicable)
- Change logs and release notes

---

## 7. Success Criteria

### 7.1 Functional Success Criteria

1. **Accurate Classification**: Menu items correctly classified into Matrix quadrants with 100% accuracy based on defined criteria
2. **Real-time Performance**: Performance metrics updated within 5 minutes of sales data availability
3. **Actionable Recommendations**: 90% of recommendations rated as actionable and valuable by management
4. **Dashboard Usability**: Users can find key insights within 3 clicks from homepage
5. **Forecast Accuracy**: Sales forecasts achieve MAPE < 20% for 30-day predictions
6. **Cost Accuracy**: Contribution margin calculations match manual calculations within 0.5% margin of error

### 7.2 User Adoption Criteria

1. **User Training**: 95% of target users complete training within first 2 weeks
2. **Active Usage**: 80% of managers access menu engineering dashboard weekly
3. **User Satisfaction**: ≥ 4.2/5.0 average rating in user surveys
4. **Support Tickets**: < 3 support tickets per 100 users per month after initial launch
5. **Feature Usage**: 70% of users actively use recommendations feature monthly

### 7.3 Business Impact Criteria

1. **Profitability Improvement**: 8-12% improvement in weighted average contribution margin within 12 months
2. **Menu Optimization**: 25% reduction in "Dog" items within 6 months
3. **Star Item Performance**: 15% increase in sales of "Star" items through strategic promotion
4. **Pricing Optimization**: 5-7% improvement in overall revenue through data-driven pricing adjustments
5. **Operational Efficiency**: 20% reduction in menu complexity (items removed without sales impact)
6. **Faster Decision Making**: 50% reduction in time to make menu optimization decisions
7. **Menu Innovation**: 30% faster new item evaluation through structured introduction process

### 7.4 Technical Success Criteria

1. **System Performance**: All operations meet or exceed performance requirements 95% of the time
2. **Calculation Accuracy**: Zero calculation errors in contribution margin or menu mix calculations
3. **Integration Success**: 99.9% successful data synchronization with POS and Recipe Management
4. **System Availability**: 99.5% uptime achieved
5. **Data Quality**: < 0.5% error rate in data imports from source systems

---

## 8. Assumptions and Dependencies

### 8.1 Assumptions

1. **Sales Data Availability**: POS system captures complete and accurate sales transaction data including item-level details
2. **Recipe Costing Accuracy**: Recipe Management module provides accurate, up-to-date food costs
3. **User Competency**: Users understand basic menu engineering concepts (or will complete training)
4. **Management Support**: Leadership committed to implementing data-driven menu decisions
5. **Data History**: Minimum 90 days of historical sales data available for initial analysis
6. **Stable Menu**: Menu changes not more frequent than monthly for meaningful trend analysis
7. **Standard Operating Hours**: Consistent operating hours and days for accurate day-part analysis

### 8.2 Dependencies

#### Internal Dependencies
1. **Recipe Management Module**: Must be fully implemented with accurate recipe costs
2. **Recipe Categories**: Required for category-level analysis
3. **POS System**: Real-time sales data integration required
4. **Inventory Management**: Ingredient costs required for recipe costing
5. **User Management**: Authentication and authorization system
6. **Reporting Infrastructure**: BI tools or reporting engine

#### External Dependencies
1. **Database**: PostgreSQL 14+ for data persistence
2. **Cloud Infrastructure**: AWS, Azure, or GCP for hosting
3. **POS Vendor API**: API access for sales data integration
4. **Analytics Tools**: Charting libraries for visualizations (e.g., Chart.js, D3.js)
5. **Reporting Tools**: Optional BI tool integration (Tableau, Power BI)

#### Data Dependencies
1. **Historical Sales Data**: Minimum 90 days for initial analysis
2. **Recipe Cost Data**: Accurate and current costs for all menu items
3. **Competitor Data**: Optional but valuable for market positioning analysis
4. **Customer Feedback Data**: Optional but enhances item performance analysis

---

## 9. Risks and Mitigation Strategies

### 9.1 Technical Risks

#### Risk: Calculation Performance with Large Datasets
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Implement caching for frequently accessed calculations
- Use materialized views for pre-aggregated metrics
- Optimize database queries with proper indexing
- Implement batch processing for non-real-time calculations
- Use asynchronous processing for complex reports

#### Risk: Data Synchronization Delays
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Implement retry logic with exponential backoff
- Cache last-known-good data for offline access
- Display data freshness timestamps
- Alert on synchronization failures
- Provide manual refresh capability

#### Risk: Integration Complexity with Multiple Systems
**Probability**: High
**Impact**: High
**Mitigation**:
- Use standardized integration patterns (REST APIs)
- Implement comprehensive error handling
- Create integration monitoring dashboard
- Maintain fallback mechanisms
- Document all integration points thoroughly

### 9.2 Business Risks

#### Risk: Resistance to Data-Driven Menu Decisions
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Involve chefs and managers in pilot program
- Demonstrate ROI with pilot results
- Provide training on menu engineering principles
- Allow override capability with justification requirement
- Collect and share success stories

#### Risk: Inaccurate Sales Data from POS
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Implement data validation rules
- Reconcile with financial reports regularly
- Provide data quality dashboards
- Alert on data anomalies
- Train POS users on accurate data entry

#### Risk: Over-Reliance on Historical Data
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Incorporate external factors (seasonality, events)
- Allow manual adjustments to forecasts
- Monitor forecast accuracy continuously
- Adjust models based on performance
- Consider market trends and competitor actions

### 9.3 Operational Risks

#### Risk: Frequent Menu Changes Disrupting Analysis
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Establish menu change freeze periods (e.g., quarterly updates)
- Track item history to maintain continuity
- Provide before/after comparison reports
- Implement change management process
- Require minimum evaluation periods for new items

#### Risk: Lack of Competitor Data
**Probability**: High
**Impact**: Low
**Mitigation**:
- Competitor analysis optional, not required
- Provide competitor data entry tools
- Suggest periodic competitor surveys
- Leverage public sources (websites, online menus)
- Focus on internal performance first

#### Risk: Misinterpretation of Recommendations
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Provide clear explanations for each recommendation
- Include success probability and risk level
- Offer scenario analysis (what-if modeling)
- Require approval for critical changes
- Provide training on interpreting results

---

## 10. Glossary

**Contribution Margin**: The difference between a menu item's selling price and its food cost, representing the amount available to cover labor, overhead, and profit.

**Contribution Margin Percentage**: Contribution margin expressed as a percentage of selling price.

**Dog**: Menu Engineering classification for items with low profitability and low popularity (candidates for removal).

**Expected Menu Mix**: The theoretical sales percentage if all menu items sold equally (100% / Number of Items).

**Food Cost Percentage**: The ratio of food cost to selling price (inverse of contribution margin percentage).

**Menu Engineering Matrix**: Strategic analysis tool classifying menu items into four quadrants (Star, Plowhorse, Puzzle, Dog) based on profitability and popularity.

**Menu Mix**: The distribution of sales across menu items, expressed as percentage of total sales.

**Menu Mix Variance**: The difference between actual and expected menu mix percentage.

**Plowhorse**: Menu Engineering classification for items with low profitability but high popularity (candidates for price increases or cost reduction).

**Popularity Index**: Ratio of actual menu mix to expected menu mix (values >1.0 indicate above-average popularity).

**Puzzle**: Menu Engineering classification for items with high profitability but low popularity (candidates for promotion and repositioning).

**RevPASH (Revenue Per Available Seat Hour)**: Metric measuring revenue generation efficiency relative to seating capacity and operating hours.

**Star**: Menu Engineering classification for items with high profitability and high popularity (maintain and promote).

**Velocity**: Average units sold per day for a menu item.

**Weighted Contribution Margin**: Contribution margin multiplied by menu mix percentage, representing actual profit contribution.

---
