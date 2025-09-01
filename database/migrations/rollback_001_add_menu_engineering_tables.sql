-- =============================================================================
-- ROLLBACK MIGRATION: Remove Menu Engineering Tables
-- Version: 001
-- Phase: 13.1 - Menu Engineering Module Database Extensions Rollback
-- Description: Rollback migration to remove sales_transactions and menu_analyses tables
-- =============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS tr_update_sales_transaction_calculated_fields ON tb_sales_transactions;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_sales_transaction_calculated_fields();

-- Drop custom function
DROP FUNCTION IF EXISTS calculate_menu_engineering_scores(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ);

-- Drop materialized views and views
DROP MATERIALIZED VIEW IF EXISTS mv_menu_performance_summary;
DROP VIEW IF EXISTS v_menu_trending;

-- Drop indexes explicitly (they should be dropped with tables, but being explicit)
DROP INDEX IF EXISTS idx_sales_transactions_revenue_date;
DROP INDEX IF EXISTS idx_sales_transactions_profit_date;
DROP INDEX IF EXISTS idx_sales_transactions_customer_type;
DROP INDEX IF EXISTS idx_menu_analyses_scores;
DROP INDEX IF EXISTS idx_sales_transactions_recent;
DROP INDEX IF EXISTS idx_menu_analyses_recent;

-- Drop tables (this will automatically drop associated indexes and constraints)
DROP TABLE IF EXISTS tb_menu_analyses;
DROP TABLE IF EXISTS tb_sales_transactions;

-- Drop custom enums
DROP TYPE IF EXISTS enum_analysis_period;
DROP TYPE IF EXISTS enum_menu_classification;

-- Note: We don't drop the location table reference as it's part of the core schema