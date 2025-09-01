-- =============================================================================
-- MIGRATION: Add Menu Engineering Tables
-- Version: 001
-- Phase: 13.1 - Menu Engineering Module Database Extensions
-- Description: Add sales_transactions and menu_analyses tables for menu engineering
-- =============================================================================

-- Create new enums for menu engineering
CREATE TYPE enum_menu_classification AS ENUM (
    'STAR',         -- High popularity, high profitability
    'PLOWHORSES',   -- High popularity, low profitability  
    'PUZZLE',       -- Low popularity, high profitability
    'DOG'           -- Low popularity, low profitability
);

CREATE TYPE enum_analysis_period AS ENUM (
    'daily',
    'weekly', 
    'monthly',
    'quarterly',
    'yearly',
    'custom'
);

-- =============================================================================
-- TABLE 1: Sales Transactions
-- =============================================================================

CREATE TABLE tb_sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipe reference (will link to future recipe table)
    recipe_id UUID NOT NULL,
    recipe_name VARCHAR(255),
    recipe_code VARCHAR(50),
    
    -- Sale details
    sale_date TIMESTAMPTZ NOT NULL,
    quantity_sold DECIMAL(20,5) NOT NULL,
    revenue DECIMAL(20,5) NOT NULL,
    discounts DECIMAL(20,5) DEFAULT 0,
    net_revenue DECIMAL(20,5) NOT NULL,
    
    -- Location and operational context
    location_id UUID,
    location_name VARCHAR(255),
    department_id UUID,
    department_name VARCHAR(255),
    
    -- POS transaction details
    pos_transaction_id VARCHAR(100) NOT NULL,
    pos_transaction_no VARCHAR(50),
    shift_id VARCHAR(50),
    shift_name VARCHAR(100),
    
    -- Staff and customer context
    served_by_id UUID,
    served_by_name VARCHAR(255),
    customer_id UUID,
    customer_type VARCHAR(50),
    
    -- Business context
    day_of_week INTEGER,
    meal_period VARCHAR(50),
    weather_condition VARCHAR(50),
    special_event VARCHAR(100),
    
    -- Financial breakdown
    base_price DECIMAL(20,5),
    tax_amount DECIMAL(20,5) DEFAULT 0,
    service_charge DECIMAL(20,5) DEFAULT 0,
    
    -- Menu engineering calculated fields
    calculated_food_cost DECIMAL(20,5),
    gross_profit DECIMAL(20,5),
    profit_margin DECIMAL(8,4),
    
    -- Integration fields
    note VARCHAR(500),
    info JSON,
    dimension JSON,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by_id UUID
);

-- Add foreign key constraint for location
ALTER TABLE tb_sales_transactions 
ADD CONSTRAINT fk_sales_transactions_location 
FOREIGN KEY (location_id) REFERENCES tb_location(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Performance indexes for sales_transactions
CREATE INDEX idx_sales_transactions_recipe_date ON tb_sales_transactions (recipe_id, sale_date);
CREATE INDEX idx_sales_transactions_sale_date ON tb_sales_transactions (sale_date);
CREATE INDEX idx_sales_transactions_location_date ON tb_sales_transactions (location_id, sale_date);
CREATE INDEX idx_sales_transactions_pos_txn_id ON tb_sales_transactions (pos_transaction_id);
CREATE INDEX idx_sales_transactions_shift_date ON tb_sales_transactions (shift_id, sale_date);
CREATE INDEX idx_sales_transactions_meal_period ON tb_sales_transactions (meal_period, sale_date);
CREATE INDEX idx_sales_transactions_day_of_week ON tb_sales_transactions (day_of_week);

-- =============================================================================
-- TABLE 2: Menu Analyses
-- =============================================================================

CREATE TABLE tb_menu_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipe reference (will link to future recipe table)
    recipe_id UUID NOT NULL,
    recipe_name VARCHAR(255),
    recipe_code VARCHAR(50),
    
    -- Analysis period
    analysis_date TIMESTAMPTZ NOT NULL,
    period_type enum_analysis_period DEFAULT 'daily',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Location context
    location_id UUID,
    location_name VARCHAR(255),
    department_id UUID,
    department_name VARCHAR(255),
    
    -- Sales performance metrics
    total_quantity_sold DECIMAL(20,5) NOT NULL,
    total_revenue DECIMAL(20,5) NOT NULL,
    total_discounts DECIMAL(20,5) DEFAULT 0,
    net_revenue DECIMAL(20,5) NOT NULL,
    average_selling_price DECIMAL(20,5) NOT NULL,
    
    -- Cost and profitability metrics
    current_food_cost DECIMAL(20,5) NOT NULL,
    total_food_cost DECIMAL(20,5) NOT NULL,
    gross_profit_per_unit DECIMAL(20,5) NOT NULL,
    total_gross_profit DECIMAL(20,5) NOT NULL,
    profit_margin_percentage DECIMAL(8,4) NOT NULL,
    
    -- Menu engineering scores and classification
    popularity_score DECIMAL(8,4) NOT NULL,
    profitability_score DECIMAL(8,4) NOT NULL,
    popularity_rank INTEGER,
    profitability_rank INTEGER,
    classification enum_menu_classification NOT NULL,
    
    -- Trend analysis
    quantity_trend VARCHAR(20),
    revenue_trend VARCHAR(20),
    profit_trend VARCHAR(20),
    
    -- Comparative metrics
    market_share_percentage DECIMAL(8,4),
    contribution_margin DECIMAL(20,5),
    velocity DECIMAL(8,4),
    
    -- Statistical analysis
    sales_variance DECIMAL(20,5),
    sales_coefficient_variation DECIMAL(8,4),
    peak_sales_day VARCHAR(20),
    peak_sales_amount DECIMAL(20,5),
    
    -- AI-generated insights and recommendations
    recommendations JSON,
    
    -- Quality and operational metrics
    customer_satisfaction_score DECIMAL(3,2),
    return_rate_percentage DECIMAL(8,4),
    preparation_time_avg DECIMAL(8,2),
    ingredient_waste_percentage DECIMAL(8,4),
    
    -- Integration fields
    analysis_version VARCHAR(10) DEFAULT '1.0',
    analysis_algorithm VARCHAR(50),
    confidence_level DECIMAL(3,2),
    data_completeness_score DECIMAL(3,2),
    
    note VARCHAR(500),
    info JSON,
    dimension JSON,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by_id UUID
);

-- Add foreign key constraint for location
ALTER TABLE tb_menu_analyses 
ADD CONSTRAINT fk_menu_analyses_location 
FOREIGN KEY (location_id) REFERENCES tb_location(id) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Performance indexes for menu_analyses
CREATE INDEX idx_menu_analyses_recipe_date ON tb_menu_analyses (recipe_id, analysis_date);
CREATE INDEX idx_menu_analyses_classification ON tb_menu_analyses (classification);
CREATE INDEX idx_menu_analyses_period_range ON tb_menu_analyses (period_start, period_end);
CREATE INDEX idx_menu_analyses_location_date ON tb_menu_analyses (location_id, analysis_date);
CREATE INDEX idx_menu_analyses_period_type ON tb_menu_analyses (period_type, analysis_date);
CREATE INDEX idx_menu_analyses_popularity ON tb_menu_analyses (popularity_score);
CREATE INDEX idx_menu_analyses_profitability ON tb_menu_analyses (profitability_score);
CREATE INDEX idx_menu_analyses_ranks ON tb_menu_analyses (popularity_rank, profitability_rank);

-- Unique constraint to prevent duplicate analyses
ALTER TABLE tb_menu_analyses 
ADD CONSTRAINT uq_menu_analyses_unique_analysis 
UNIQUE (recipe_id, period_start, period_end, location_id, period_type);

-- =============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================================================

-- High-performance view for real-time menu performance dashboard
CREATE MATERIALIZED VIEW mv_menu_performance_summary AS
SELECT 
    recipe_id,
    recipe_name,
    location_id,
    location_name,
    classification,
    popularity_score,
    profitability_score,
    total_quantity_sold,
    net_revenue,
    profit_margin_percentage,
    analysis_date,
    period_type
FROM tb_menu_analyses 
WHERE analysis_date >= CURRENT_DATE - INTERVAL '30 days'
  AND period_type = 'daily';

CREATE UNIQUE INDEX idx_mv_menu_performance_summary 
ON mv_menu_performance_summary (recipe_id, location_id, analysis_date);

-- View for trending analysis
CREATE VIEW v_menu_trending AS
SELECT 
    recipe_id,
    recipe_name,
    location_id,
    classification,
    quantity_trend,
    revenue_trend, 
    profit_trend,
    LAG(popularity_score) OVER (
        PARTITION BY recipe_id, location_id 
        ORDER BY analysis_date
    ) as prev_popularity,
    LAG(profitability_score) OVER (
        PARTITION BY recipe_id, location_id 
        ORDER BY analysis_date
    ) as prev_profitability,
    analysis_date
FROM tb_menu_analyses
WHERE period_type = 'daily'
ORDER BY analysis_date DESC;

-- =============================================================================
-- FUNCTIONS FOR AUTOMATIC CALCULATIONS
-- =============================================================================

-- Function to calculate menu engineering scores
CREATE OR REPLACE FUNCTION calculate_menu_engineering_scores(
    p_recipe_id UUID,
    p_location_id UUID DEFAULT NULL,
    p_period_start TIMESTAMPTZ DEFAULT NULL,
    p_period_end TIMESTAMPTZ DEFAULT NULL
) RETURNS TABLE(
    popularity_score DECIMAL(8,4),
    profitability_score DECIMAL(8,4),
    classification enum_menu_classification
) AS $$
DECLARE
    total_location_sales DECIMAL(20,5);
    recipe_sales DECIMAL(20,5);
    avg_profit_margin DECIMAL(8,4);
    recipe_profit_margin DECIMAL(8,4);
    pop_score DECIMAL(8,4);
    prof_score DECIMAL(8,4);
    menu_class enum_menu_classification;
BEGIN
    -- Set default period if not provided (last 30 days)
    IF p_period_start IS NULL THEN
        p_period_start := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF p_period_end IS NULL THEN
        p_period_end := CURRENT_DATE;
    END IF;
    
    -- Calculate total location sales for the period
    SELECT COALESCE(SUM(net_revenue), 0)
    INTO total_location_sales
    FROM tb_sales_transactions
    WHERE (p_location_id IS NULL OR location_id = p_location_id)
      AND sale_date BETWEEN p_period_start AND p_period_end;
    
    -- Calculate recipe sales for the period
    SELECT COALESCE(SUM(net_revenue), 0)
    INTO recipe_sales
    FROM tb_sales_transactions
    WHERE recipe_id = p_recipe_id
      AND (p_location_id IS NULL OR location_id = p_location_id)
      AND sale_date BETWEEN p_period_start AND p_period_end;
    
    -- Calculate popularity score (market share percentage)
    IF total_location_sales > 0 THEN
        pop_score := (recipe_sales / total_location_sales) * 100;
    ELSE
        pop_score := 0;
    END IF;
    
    -- Calculate average profit margin for location
    SELECT COALESCE(AVG(profit_margin), 0)
    INTO avg_profit_margin
    FROM tb_sales_transactions
    WHERE (p_location_id IS NULL OR location_id = p_location_id)
      AND sale_date BETWEEN p_period_start AND p_period_end
      AND profit_margin IS NOT NULL;
    
    -- Calculate recipe profit margin
    SELECT COALESCE(AVG(profit_margin), 0)
    INTO recipe_profit_margin
    FROM tb_sales_transactions
    WHERE recipe_id = p_recipe_id
      AND (p_location_id IS NULL OR location_id = p_location_id)
      AND sale_date BETWEEN p_period_start AND p_period_end
      AND profit_margin IS NOT NULL;
    
    -- Calculate profitability score (relative to average)
    IF avg_profit_margin > 0 THEN
        prof_score := (recipe_profit_margin / avg_profit_margin) * 50; -- Normalized to ~50 scale
    ELSE
        prof_score := 0;
    END IF;
    
    -- Determine classification based on scores
    -- Using median split approach (scores above/below 50th percentile)
    IF pop_score >= 50 AND prof_score >= 50 THEN
        menu_class := 'STAR';
    ELSIF pop_score >= 50 AND prof_score < 50 THEN
        menu_class := 'PLOWHORSES';
    ELSIF pop_score < 50 AND prof_score >= 50 THEN
        menu_class := 'PUZZLE';
    ELSE
        menu_class := 'DOG';
    END IF;
    
    RETURN QUERY SELECT pop_score, prof_score, menu_class;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger function to update net_revenue when sales transaction is inserted/updated
CREATE OR REPLACE FUNCTION update_sales_transaction_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate net_revenue
    NEW.net_revenue := NEW.revenue - COALESCE(NEW.discounts, 0);
    
    -- Calculate gross_profit if food_cost is available
    IF NEW.calculated_food_cost IS NOT NULL THEN
        NEW.gross_profit := NEW.net_revenue - (NEW.calculated_food_cost * NEW.quantity_sold);
        
        -- Calculate profit_margin
        IF NEW.net_revenue > 0 THEN
            NEW.profit_margin := (NEW.gross_profit / NEW.net_revenue) * 100;
        ELSE
            NEW.profit_margin := 0;
        END IF;
    END IF;
    
    -- Set day_of_week if not provided
    IF NEW.day_of_week IS NULL THEN
        NEW.day_of_week := EXTRACT(DOW FROM NEW.sale_date);
        IF NEW.day_of_week = 0 THEN
            NEW.day_of_week := 7; -- Convert Sunday from 0 to 7
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_sales_transaction_calculated_fields
    BEFORE INSERT OR UPDATE ON tb_sales_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_transaction_calculated_fields();

-- =============================================================================
-- INDEXES FOR ANALYTICS QUERIES
-- =============================================================================

-- Additional indexes for complex analytics queries
CREATE INDEX idx_sales_transactions_revenue_date ON tb_sales_transactions (sale_date, net_revenue);
CREATE INDEX idx_sales_transactions_profit_date ON tb_sales_transactions (sale_date, gross_profit);
CREATE INDEX idx_sales_transactions_customer_type ON tb_sales_transactions (customer_type, sale_date);
CREATE INDEX idx_menu_analyses_scores ON tb_menu_analyses (popularity_score, profitability_score);

-- Partial indexes for active/recent data
CREATE INDEX idx_sales_transactions_recent 
ON tb_sales_transactions (recipe_id, sale_date)
WHERE sale_date >= CURRENT_DATE - INTERVAL '90 days';

CREATE INDEX idx_menu_analyses_recent
ON tb_menu_analyses (recipe_id, analysis_date)  
WHERE analysis_date >= CURRENT_DATE - INTERVAL '90 days';

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE tb_sales_transactions IS 'Stores POS sales data linked to recipes for menu performance analysis';
COMMENT ON TABLE tb_menu_analyses IS 'Stores calculated menu performance snapshots for efficient reporting';

COMMENT ON COLUMN tb_sales_transactions.recipe_id IS 'Reference to recipe table (will be linked when recipe table exists)';
COMMENT ON COLUMN tb_sales_transactions.pos_transaction_id IS 'Unique identifier from POS system';
COMMENT ON COLUMN tb_sales_transactions.day_of_week IS '1=Monday to 7=Sunday';
COMMENT ON COLUMN tb_sales_transactions.profit_margin IS 'Percentage: (gross_profit / net_revenue) * 100';

COMMENT ON COLUMN tb_menu_analyses.classification IS 'Menu engineering classification: STAR, PLOWHORSES, PUZZLE, DOG';
COMMENT ON COLUMN tb_menu_analyses.popularity_score IS 'Popularity score 0-100 based on sales volume';
COMMENT ON COLUMN tb_menu_analyses.profitability_score IS 'Profitability score 0-100 based on profit margins';
COMMENT ON COLUMN tb_menu_analyses.recommendations IS 'JSON structure with AI-generated insights and action items';

-- Add comments for the materialized view
COMMENT ON MATERIALIZED VIEW mv_menu_performance_summary IS 'High-performance materialized view for real-time menu dashboard (refreshed daily)';