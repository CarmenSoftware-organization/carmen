# Price Management Database Schema

This directory contains the database schema and migration files for the Price Management system within the Carmen Supply Chain Management application.

## Overview

The Price Management system extends the existing Carmen database with comprehensive pricing capabilities including:

- **Vendor Pricelist Management**: Configuration and collection of vendor pricing information
- **Multi-Currency Support**: Price storage and conversion across multiple currencies
- **Automated Price Assignment**: Business rules engine for intelligent price assignment to Purchase Requests
- **Price Validity Management**: Lifecycle management of price validity periods
- **Audit Trail**: Complete history tracking of all price-related operations
- **Analytics**: Performance metrics and vendor engagement tracking

## Database Tables

### Core Tables

#### `vendor_pricelist_settings`
Extends existing vendor system with pricelist collection configuration.
- **Purpose**: Store vendor-specific pricelist collection preferences
- **Key Fields**: `vendor_id`, `collection_frequency`, `preferred_delivery_method`, `auto_assignment_enabled`
- **Relationships**: References `vendors(id)`

#### `pricelist_collection_sessions`
Manages secure vendor portal access for price submissions.
- **Purpose**: Track vendor portal sessions and access tokens
- **Key Fields**: `vendor_id`, `session_token`, `expires_at`, `status`
- **Security**: Time-limited tokens with automatic expiration

#### `multicurrency_price_items`
Stores price items with multi-currency support and automatic USD normalization.
- **Purpose**: Central storage for all vendor pricing with currency conversion
- **Key Fields**: `unit_price`, `currency`, `normalized_price_usd`, `valid_from`, `valid_to`
- **Features**: Automatic USD normalization, bulk pricing support, validity periods

#### `price_assignment_rules`
Configurable business rules for automated price assignment.
- **Purpose**: Define intelligent price assignment logic
- **Key Fields**: `name`, `priority`, `conditions` (JSONB), `actions` (JSONB)
- **Features**: Priority-based execution, flexible condition matching

#### `price_assignments`
Tracks price assignments to PR items with complete audit trail.
- **Purpose**: Record all price assignments with reasoning and confidence scores
- **Key Fields**: `pr_item_id`, `vendor_id`, `assigned_price`, `confidence_score`, `assignment_reason`
- **Features**: Manual override tracking, rule attribution

### Supporting Tables

#### `currency_exchange_rates`
Currency exchange rates for multi-currency price conversions.
- **Purpose**: Store and manage currency conversion rates
- **Key Fields**: `from_currency`, `to_currency`, `rate`, `rate_date`
- **Features**: Historical rate tracking, multiple rate sources

#### `price_assignment_history`
Complete audit trail of all price assignment changes.
- **Purpose**: Maintain immutable history of price assignment operations
- **Key Fields**: `action`, `old_price`, `new_price`, `performed_by`, `performed_at`
- **Features**: Automatic trigger-based logging

#### `pricelist_submissions`
Tracks vendor price submissions and processing status.
- **Purpose**: Monitor vendor submission workflow and validation
- **Key Fields**: `submission_method`, `validation_status`, `items_count`, `processed_items_count`
- **Features**: File upload tracking, validation error storage

#### `price_validity_tracking`
Manages price validity periods and renewal notifications.
- **Purpose**: Track price lifecycle and automate renewal notifications
- **Key Fields**: `status`, `valid_from`, `valid_to`, `renewal_notification_sent`
- **Features**: Automated expiry detection, notification tracking

### Analytics Tables

#### `business_rule_performance`
Performance metrics for business rule effectiveness.
- **Purpose**: Track rule execution statistics and success rates
- **Key Fields**: `executions_count`, `successful_executions`, `average_confidence_score`
- **Features**: Daily aggregation, performance trending

#### `vendor_portal_analytics`
Analytics and usage tracking for vendor portal interactions.
- **Purpose**: Monitor vendor engagement and portal usage patterns
- **Key Fields**: `event_type`, `event_data`, `ip_address`, `user_agent`
- **Features**: Event-based tracking, security monitoring

## Database Views

### `active_price_assignments`
Combines price assignments with vendor and rule details for easy querying.

### `vendor_collection_status`
Provides overview of vendor pricelist collection status and participation.

### `price_validity_status`
Shows current validity status of all price items with expiry warnings.

## Functions and Triggers

### Automatic Timestamp Updates
- `update_updated_at_column()`: Automatically updates `updated_at` timestamps
- Applied to all tables with `updated_at` columns

### Price Normalization
- `update_normalized_price()`: Automatically converts prices to USD using current exchange rates
- Triggered on insert/update of `multicurrency_price_items`

### Audit Trail
- `create_price_assignment_history()`: Automatically creates audit trail entries
- Triggered on all operations on `price_assignments` table

## Indexes

All tables include comprehensive indexing for optimal query performance:

- **Primary Keys**: UUID-based primary keys on all tables
- **Foreign Keys**: Indexed foreign key relationships
- **Query Optimization**: Indexes on frequently queried columns
- **Date Ranges**: Specialized indexes for date range queries
- **Status Fields**: Indexes on status and state columns

## Migration Files

### `001_create_price_management_tables.sql`
Initial migration to create all Price Management tables, indexes, functions, and triggers.

**Features:**
- Safe migration with existence checks
- Comprehensive error handling
- Initial data seeding
- Rollback script included

## Data Relationships

```
vendors (existing)
├── vendor_pricelist_settings (1:1)
├── pricelist_collection_sessions (1:many)
└── vendor_portal_analytics (1:many)

vendor_pricelists (existing)
└── multicurrency_price_items (1:many)
    └── price_validity_tracking (1:1)

pr_items (existing)
└── price_assignments (1:many)
    ├── price_assignment_history (1:many)
    └── business_rule_performance (many:1)

price_assignment_rules
├── price_assignments (1:many)
└── business_rule_performance (1:many)
```

## Security Considerations

### Data Protection
- **Encryption**: Sensitive price data should be encrypted at rest
- **Access Control**: Role-based access to pricing information
- **Audit Trail**: Complete logging of all price-related operations
- **Token Security**: Time-limited vendor portal access tokens

### Data Integrity
- **Constraints**: Comprehensive check constraints on all tables
- **Foreign Keys**: Referential integrity enforcement
- **Triggers**: Automatic data validation and normalization
- **Transactions**: ACID compliance for all operations

## Performance Optimization

### Indexing Strategy
- **Composite Indexes**: Multi-column indexes for complex queries
- **Partial Indexes**: Conditional indexes for filtered queries
- **Covering Indexes**: Include columns to avoid table lookups

### Query Optimization
- **Views**: Pre-optimized views for common query patterns
- **Materialized Views**: Consider for heavy analytical queries
- **Partitioning**: Consider date-based partitioning for large tables

## Maintenance

### Regular Tasks
- **Exchange Rate Updates**: Daily currency rate updates
- **Price Validity Checks**: Automated expiry detection
- **Performance Monitoring**: Rule effectiveness analysis
- **Data Cleanup**: Archive old audit trail entries

### Monitoring
- **Table Sizes**: Monitor growth of audit and analytics tables
- **Index Usage**: Analyze index effectiveness
- **Query Performance**: Monitor slow query log
- **Constraint Violations**: Track data quality issues

## Usage Examples

### Common Queries

```sql
-- Get active price assignments for a PR
SELECT * FROM active_price_assignments 
WHERE pr_item_id = 'pr-item-uuid';

-- Find expiring prices
SELECT * FROM price_validity_status 
WHERE validity_status = 'expiring_soon';

-- Vendor collection status
SELECT * FROM vendor_collection_status 
WHERE collection_enabled = true;

-- Rule performance analysis
SELECT rule_id, AVG(average_confidence_score) as avg_confidence
FROM business_rule_performance 
GROUP BY rule_id;
```

### Data Insertion

```sql
-- Create vendor pricelist settings
INSERT INTO vendor_pricelist_settings (
    vendor_id, collection_frequency, preferred_delivery_method
) VALUES (
    'vendor-uuid', 'monthly', 'portal'
);

-- Add price item with automatic USD normalization
INSERT INTO multicurrency_price_items (
    pricelist_id, product_id, product_name, unit_price, currency, valid_from, valid_to
) VALUES (
    'pricelist-uuid', 'product-uuid', 'Product Name', 25.00, 'EUR', '2024-01-01', '2024-12-31'
);
```

## Support

For questions about the database schema or migration procedures, please refer to:
- Technical documentation in `/docs/`
- Database administrator
- Development team lead

## Version History

- **v1.0** (2024-01-16): Initial Price Management schema creation
  - Core tables for vendor pricelist management
  - Multi-currency support with automatic normalization
  - Business rules engine for price assignment
  - Comprehensive audit trail and analytics
  - Performance-optimized indexes and views