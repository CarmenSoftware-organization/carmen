# Menu Engineering Module - Database Schema Design Documentation

## Overview

This document outlines the database schema extensions designed for Phase 13.1 of the Carmen ERP Menu Engineering Module. The schema introduces two core tables that enable comprehensive menu performance analysis and optimization.

## Architecture Philosophy

### Integration Strategy

The schema is designed to seamlessly integrate with Carmen ERP's existing infrastructure:

- **Product Integration**: Leverages existing product tables with `is_used_in_recipe` flags
- **Location Integration**: Direct foreign key relationships with `tb_location` 
- **Inventory Integration**: Ready to connect with recipe costing data when available
- **Audit Trail**: Follows Carmen ERP's established audit field patterns (`created_at`, `updated_at`, etc.)
- **Multi-tenancy**: Supports department/location isolation through location_id fields

### Performance-First Design

- **Denormalized Fields**: Strategic denormalization (recipe_name, location_name) for query performance
- **Comprehensive Indexing**: 15+ carefully designed indexes for analytical workloads
- **Materialized Views**: Pre-calculated summaries for dashboard performance
- **Partitioning Ready**: Date-based partitioning capabilities built into design

## Schema Components

### 1. Sales Transactions Table (`tb_sales_transactions`)

**Purpose**: Captures detailed POS sales data linked to recipes for menu performance analysis.

#### Key Design Decisions:

**Data Granularity**: 
- Individual transaction level for maximum analytical flexibility
- Supports aggregation to any time period or business dimension

**Contextual Richness**:
- Business context: meal period, day of week, weather, special events
- Operational context: shift, staff, customer type
- Financial breakdown: base price, taxes, service charges, discounts

**Menu Engineering Fields**:
- Real-time cost calculation: `calculated_food_cost` at time of sale
- Profit metrics: `gross_profit`, `profit_margin` automatically calculated via triggers
- Performance tracking: quantity sold, revenue, discounts

**Integration Points**:
```sql
-- Future recipe table integration (commented in schema)
-- tb_recipe relationship will be added when recipe table exists
recipe_id UUID NOT NULL -- Ready for foreign key constraint

-- Current location integration  
FOREIGN KEY (location_id) REFERENCES tb_location(id)
```

#### Performance Optimizations:

- **Primary Indexes**: recipe_id + sale_date for time-series queries
- **Analytical Indexes**: meal_period, day_of_week, customer_type for segmentation
- **Partial Indexes**: Recent data (90 days) for operational dashboards
- **Trigger Optimization**: Automatic calculation of derived fields

### 2. Menu Analysis Table (`tb_menu_analyses`)

**Purpose**: Stores pre-calculated menu performance snapshots for efficient reporting and trend analysis.

#### Key Design Decisions:

**Analytical Granularity**:
- Supports multiple analysis periods: daily, weekly, monthly, quarterly, yearly, custom
- Unique constraints prevent duplicate analyses
- Version tracking for algorithm improvements

**Menu Engineering Metrics**:
- **Boston Consulting Matrix**: STAR, PLOWHORSES, PUZZLE, DOG classification
- **Dual Scoring**: Popularity (0-100) and Profitability (0-100) scores
- **Trend Analysis**: quantity, revenue, and profit trend indicators
- **Market Position**: market share, velocity, contribution margin

**AI/ML Integration**:
```json
// recommendations JSON structure
{
  "actionItems": [
    {
      "priority": "high|medium|low",
      "action": "increase_promotion|reduce_cost|remove_item",
      "reason": "analytical justification",
      "expected_impact": "quantified prediction"
    }
  ],
  "insights": ["pattern insights"],
  "competitorAnalysis": {
    "similarItems": ["competitor dishes"],
    "pricingGap": 5.50,
    "recommendation": "pricing strategy"
  },
  "seasonalPattern": {
    "peakSeason": "season identifier",
    "seasonalityIndex": 1.25
  }
}
```

**Statistical Foundation**:
- Variance analysis: `sales_variance`, `sales_coefficient_variation`
- Peak performance tracking: `peak_sales_day`, `peak_sales_amount`
- Quality metrics: customer satisfaction, return rate, preparation time

#### Performance Optimizations:

- **Composite Indexes**: recipe_id + analysis_date for time-based queries
- **Classification Index**: Fast filtering by menu engineering category
- **Score Indexes**: Separate indexes for popularity and profitability ranking
- **Period Range Index**: Efficient period-based queries with `(period_start, period_end)`

### 3. Supporting Infrastructure

#### Custom Enums:

```sql
enum_menu_classification: 'STAR', 'PLOWHORSES', 'PUZZLE', 'DOG'
enum_analysis_period: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'
```

#### Materialized Views:

- **`mv_menu_performance_summary`**: Real-time dashboard data (30-day rolling)
- **`v_menu_trending`**: Trend analysis with LAG functions for period-over-period comparison

#### Automated Functions:

- **`calculate_menu_engineering_scores()`**: Automated popularity and profitability scoring
- **Trigger Functions**: Automatic calculation of derived fields on insert/update

## Integration with Existing Carmen ERP Schema

### Current Integration Points:

1. **Location Integration**: 
   ```sql
   FOREIGN KEY (location_id) REFERENCES tb_location(id)
   ```

2. **Audit Pattern Compliance**:
   ```sql
   created_at TIMESTAMPTZ DEFAULT NOW(),
   created_by_id UUID,
   updated_at TIMESTAMPTZ DEFAULT NOW(), 
   updated_by_id UUID
   ```

3. **Carmen ERP JSON Patterns**:
   ```sql
   info JSON,      -- Standard Carmen ERP info field
   dimension JSON  -- Standard Carmen ERP dimension field
   ```

### Future Integration Points:

**Recipe Table Integration** (when recipe infrastructure is complete):
```sql
-- Will be added to both tables:
ALTER TABLE tb_sales_transactions 
ADD CONSTRAINT fk_sales_transactions_recipe
FOREIGN KEY (recipe_id) REFERENCES tb_recipe(id);

ALTER TABLE tb_menu_analyses
ADD CONSTRAINT fk_menu_analyses_recipe  
FOREIGN KEY (recipe_id) REFERENCES tb_recipe(id);
```

**Product Integration** (leveraging existing product ecosystem):
- Products marked with `is_used_in_recipe = true` will be recipe components
- Recipe costing will integrate with existing `tb_product` pricing data
- Unit conversions will use existing `tb_unit` and `tb_unit_conversion` infrastructure

### Data Flow Architecture:

```
POS System → tb_sales_transactions → tb_menu_analyses → Dashboard/Reports
     ↓              ↓                        ↓
  Real-time    Historical Data         Analytics
  Updates      Aggregation             Insights
```

## Performance Characteristics

### Query Performance Targets:

- **Dashboard Queries**: < 100ms (via materialized views)
- **Analytical Queries**: < 2 seconds for 90-day periods
- **Trending Analysis**: < 5 seconds for yearly comparisons
- **Classification Queries**: < 500ms for location-based filtering

### Storage Estimates:

**tb_sales_transactions**:
- ~1MB per 1000 transactions
- Estimated 50,000 transactions/month for medium restaurant
- ~50MB/month, ~600MB/year per location

**tb_menu_analyses**: 
- ~5KB per recipe per analysis period
- 100 recipes × daily analysis = ~500KB/day
- ~15MB/month, ~180MB/year per location

### Scalability Considerations:

1. **Partitioning Strategy**: 
   - Sales transactions: Monthly partitioning by `sale_date`
   - Menu analyses: Quarterly partitioning by `analysis_date`

2. **Archival Strategy**:
   - Detailed transactions: Retain 2 years, then aggregate
   - Analysis snapshots: Retain indefinitely (small storage footprint)

3. **Multi-location Support**:
   - Indexes include `location_id` for tenant isolation
   - Queries can be filtered by location for performance

## Data Quality & Validation

### Constraints & Validations:

1. **Business Rule Constraints**:
   ```sql
   CHECK (quantity_sold > 0)
   CHECK (revenue >= 0)  
   CHECK (net_revenue = revenue - COALESCE(discounts, 0))
   CHECK (day_of_week BETWEEN 1 AND 7)
   CHECK (popularity_score BETWEEN 0 AND 100)
   CHECK (profitability_score BETWEEN 0 AND 100)
   ```

2. **Unique Constraints**:
   ```sql
   UNIQUE (recipe_id, period_start, period_end, location_id, period_type)
   ```

3. **Referential Integrity**:
   - Foreign key constraints to `tb_location`
   - Ready for recipe foreign key when table exists

### Data Quality Functions:

- Automatic `net_revenue` calculation via triggers
- Automatic `day_of_week` derivation from `sale_date`
- Profit margin calculations with null handling
- Data completeness scoring in analysis table

## Security & Access Control

### ABAC Integration:

The schema is designed to integrate with Carmen ERP's ABAC (Attribute-Based Access Control) system:

```json
// Example ABAC policy for menu engineering data
{
  "resource_type": "menu_engineering_data",
  "actions": ["view", "analyze", "export"],
  "conditions": {
    "user.department": "kitchen|management",
    "resource.location_id": "user.assigned_locations",
    "time_constraint": "business_hours"
  }
}
```

### Multi-tenancy Security:

- All queries should include `location_id` filtering based on user permissions
- Row-level security can be implemented via PostgreSQL RLS policies
- Sensitive financial data access controlled by role-based permissions

## Migration Strategy

### Phase 1: Core Tables (Current)
- Deploy `tb_sales_transactions` and `tb_menu_analyses` tables
- Create basic indexes and constraints
- Implement materialized views

### Phase 2: Recipe Integration
- Add foreign key constraints when recipe table exists
- Implement recipe costing integration
- Add recipe-specific business logic

### Phase 3: Advanced Analytics
- Implement ML-based recommendation engine
- Add predictive analytics fields
- Enhance reporting capabilities

### Rollback Strategy:

Complete rollback migration provided (`rollback_001_add_menu_engineering_tables.sql`):
- Removes all tables, indexes, views, and functions
- Preserves core Carmen ERP infrastructure
- Safe rollback with no data dependencies

## Monitoring & Maintenance

### Performance Monitoring:

1. **Query Performance**:
   ```sql
   -- Monitor slow queries
   SELECT * FROM pg_stat_statements 
   WHERE query LIKE '%tb_sales_transactions%' 
   ORDER BY mean_time DESC;
   ```

2. **Index Usage**:
   ```sql
   -- Monitor index efficiency
   SELECT * FROM pg_stat_user_indexes 
   WHERE relname IN ('tb_sales_transactions', 'tb_menu_analyses');
   ```

3. **Materialized View Freshness**:
   ```sql
   -- Schedule daily refresh of materialized views
   REFRESH MATERIALIZED VIEW mv_menu_performance_summary;
   ```

### Maintenance Tasks:

1. **Daily**:
   - Refresh materialized view `mv_menu_performance_summary`
   - Validate data completeness for previous day

2. **Weekly**:
   - Generate weekly menu analysis snapshots
   - Review and optimize slow queries

3. **Monthly**:
   - Analyze table statistics and update query planner
   - Partition management (if implemented)
   - Archive old transaction data (>2 years)

## Future Enhancements

### Planned Extensions:

1. **Customer Analytics Integration**:
   - Link with customer loyalty data
   - Customer preference analysis
   - Personalized menu recommendations

2. **Inventory Integration**:
   - Real-time ingredient cost updates
   - Waste tracking and profitability impact
   - Supply chain optimization insights

3. **Predictive Analytics**:
   - Demand forecasting by menu item
   - Seasonal pattern prediction
   - Price elasticity modeling

4. **External Data Integration**:
   - Weather impact analysis
   - Competitor pricing intelligence
   - Social media sentiment correlation

## Conclusion

This schema design provides a robust foundation for comprehensive menu engineering analysis within the Carmen ERP ecosystem. The design balances performance, flexibility, and integration requirements while maintaining consistency with Carmen ERP's architectural patterns.

The implementation supports immediate analytical needs while providing extensibility for advanced features as the menu engineering module evolves.