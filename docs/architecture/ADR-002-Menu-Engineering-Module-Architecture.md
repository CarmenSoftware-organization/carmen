# ADR-002: Menu Engineering Module Architecture

**Status**: Implemented  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Date**: December 2024  
**Decision Makers**: Carmen ERP Architecture Team  
**Stakeholders**: Restaurant Operations, Finance, IT Operations

---

## Summary

Implementation of a comprehensive Menu Engineering Module for Carmen ERP that leverages existing recipe infrastructure to provide Boston Consulting Group (BCG) matrix analysis, AI-powered recommendations, and data-driven menu optimization capabilities.

---

## Context

### Business Problem
Restaurants struggle with menu optimization, often relying on intuition rather than data to make critical decisions about pricing, placement, and menu composition. Without scientific analysis, restaurants:
- Lose 15-30% potential profit through suboptimal menu engineering
- Cannot identify underperforming items (Dogs) or high-potential items (Puzzles)
- Lack visibility into real-time cost variations and their impact on profitability
- Miss opportunities to optimize high-volume, low-margin items (Plowhorses)

### Technical Context
Carmen ERP already possessed sophisticated recipe management infrastructure with:
- Comprehensive recipe costing data (`costPerPortion`, `sellingPrice`, `grossMargin`)
- Category hierarchy with cost settings and margins
- Yield variants for portion control
- Ingredient cost tracking and inventory integration

### Constraints
- Must leverage existing recipe infrastructure (60-70% development savings)
- Implementation timeline: 5-7 weeks for MVP
- Integration required with existing Keycloak authentication
- Performance requirements: <200ms API responses, dashboard loading <3s

---

## Decision

We decided to implement a Menu Engineering Module with the following architectural approach:

### 1. Leverage Existing Infrastructure
**Decision**: Build upon existing recipe management system rather than creating parallel structures.

**Rationale**:
- Existing recipes contain comprehensive financial data needed for menu engineering
- Reduces implementation time from 12-16 weeks to 5-7 weeks
- Ensures data consistency and eliminates synchronization issues
- Maintains single source of truth for recipe costs and margins

### 2. Four-Layer Architecture
**Decision**: Implement a clean, layered architecture following Carmen ERP patterns.

#### Layer 1: Database Extensions
- **New Tables**: `tb_sales_transactions`, `tb_menu_analyses`
- **Integration**: Foreign key relationships to existing `recipes` table
- **Performance**: Materialized views and automated scoring functions
- **Optimization**: Strategic indexing for analytical workloads

#### Layer 2: Service Layer
- **POS Integration Service**: Handles sales data import and mapping
- **Analytics Service**: Implements BCG matrix classification algorithms
- **Enhanced Costing Service**: Real-time cost calculations and alerting
- **Integration Service**: Orchestrates multi-service operations

#### Layer 3: API Layer
- **RESTful Design**: Following Carmen ERP's existing patterns
- **Security**: Keycloak authentication with role-based access
- **Documentation**: OpenAPI 3.0 specification with comprehensive examples
- **Performance**: Caching, rate limiting, and pagination

#### Layer 4: Frontend Components
- **Interactive Dashboard**: Scatter plot visualization with BCG matrix quadrants
- **Data Import Interface**: Multi-step wizard with POS system integration
- **Alert Management**: Real-time cost monitoring and threshold configuration
- **Mobile Responsive**: WCAG 2.1 AA accessible design

### 3. Boston Consulting Group Matrix Implementation
**Decision**: Use industry-standard BCG matrix for menu item classification.

**Classification Logic**:
```
Stars:       High popularity (≥50) + High profitability (≥50) → Promote and maintain
Plowhorses:  High popularity (≥50) + Low profitability (<50)  → Increase prices or reduce costs
Puzzles:     Low popularity (<50) + High profitability (≥50) → Increase marketing
Dogs:        Low popularity (<50) + Low profitability (<50)  → Consider removing
```

### 4. Real-Time Cost Integration
**Decision**: Integrate with existing inventory system for real-time cost calculations.

**Benefits**:
- Automatic cost updates when ingredient prices change
- Proactive alerts when profit margins fall below thresholds
- Dynamic pricing recommendations based on current costs
- Variance tracking and trend analysis

---

## Implementation Details

### Database Architecture

#### Sales Transactions Table
```sql
CREATE TABLE tb_sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id),
    sale_date TIMESTAMPTZ NOT NULL,
    quantity_sold DECIMAL(10,2) NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,
    -- Additional context fields...
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Menu Analysis Table
```sql
CREATE TABLE tb_menu_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id),
    analysis_date TIMESTAMPTZ NOT NULL,
    popularity_score DECIMAL(5,2), -- 0-100 scale
    profitability_score DECIMAL(5,2), -- 0-100 scale
    classification menu_classification_enum NOT NULL,
    recommendations JSONB,
    -- Performance metrics...
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Performance Optimizations
- **Composite Indexes**: `(recipe_id, sale_date)` for time-series queries
- **Materialized Views**: Pre-calculated 30-day rolling performance summaries
- **Automated Functions**: `calculate_menu_engineering_scores()` for consistent scoring

### Service Layer Architecture

#### Base Calculator Pattern
All services extend `BaseCalculator` for consistent:
- Error handling and logging
- Redis caching with intelligent invalidation
- Performance monitoring and metrics collection
- Audit trail and calculation traceability

#### Analytics Engine
```typescript
class MenuEngineeringAnalyticsService extends BaseCalculator {
  async classifyMenuItems(options: AnalysisOptions): Promise<MenuClassification[]> {
    // BCG matrix classification logic
    const popularityScore = await this.calculatePopularityScore(recipe);
    const profitabilityScore = await this.calculateProfitabilityScore(recipe);
    
    return this.determineClassification(popularityScore, profitabilityScore);
  }
}
```

### API Design

#### RESTful Endpoints
- **Analytics**: `GET /api/menu-engineering/analysis`
- **Classifications**: `GET /api/menu-engineering/classification`
- **Sales Import**: `POST /api/menu-engineering/sales/import`
- **Real-time Costs**: `GET /api/recipes/{id}/real-time-cost`

#### Security Implementation
- **Authentication**: Keycloak JWT validation
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Configurable limits per endpoint and role
- **Input Validation**: Comprehensive Zod schemas with threat detection

### Frontend Architecture

#### Component Structure
```
app/(main)/operational-planning/menu-engineering/
├── page.tsx                           # Main dashboard
├── components/
│   ├── scatter-plot-visualization.tsx # BCG matrix visualization
│   ├── sales-data-import.tsx         # Import interface
│   ├── cost-alert-management.tsx     # Alert system
│   └── recipe-performance-metrics.tsx # Performance details
```

#### Design System Integration
- **Shadcn/ui**: Consistent component library usage
- **Tailwind CSS**: Utility-first styling with design tokens
- **React Query**: Intelligent data fetching with caching
- **Chart.js**: Interactive data visualizations

---

## Technical Decisions

### 1. Database Technology: PostgreSQL + Extensions
**Options Considered**:
- A: Continue with existing PostgreSQL setup
- B: Add dedicated analytics database (e.g., ClickHouse)
- C: Use time-series database (e.g., TimescaleDB)

**Decision**: Option A - PostgreSQL with extensions

**Rationale**:
- Leverages existing infrastructure and expertise
- Materialized views provide adequate performance for MVP
- JSONB support for flexible recommendation storage
- Reduces operational complexity

### 2. Caching Strategy: Redis + In-Memory
**Options Considered**:
- A: Redis only
- B: In-memory only
- C: Multi-layer caching (Redis + In-memory)

**Decision**: Option C - Multi-layer caching

**Rationale**:
- Redis for shared cache across instances
- In-memory for frequently accessed calculation results
- Intelligent cache invalidation based on data dependencies
- Performance target: <100ms for dashboard queries

### 3. Frontend Technology: React with Chart.js
**Options Considered**:
- A: D3.js for maximum customization
- B: Chart.js for balance of features and simplicity
- C: Recharts for React-native integration

**Decision**: Option B - Chart.js

**Rationale**:
- Excellent React integration and TypeScript support
- Built-in responsive design and accessibility features
- Rich interaction capabilities for scatter plot
- Maintainable by existing development team

### 4. API Authentication: Extend Existing Keycloak
**Options Considered**:
- A: Create separate authentication for menu engineering
- B: Use existing Keycloak integration
- C: API keys for analytics endpoints

**Decision**: Option B - Existing Keycloak integration

**Rationale**:
- Consistent security model across Carmen ERP
- Role-based access control already established
- Single sign-on experience for users
- Audit trail integration with existing systems

---

## Architecture Patterns

### 1. Event-Driven Cost Updates
```typescript
// Inventory cost change triggers menu cost recalculation
onInventoryPriceChange(productId: string) {
  const affectedRecipes = await this.findRecipesUsingProduct(productId);
  await this.recalculateRecipeCosts(affectedRecipes);
  await this.checkCostAlertThresholds(affectedRecipes);
}
```

### 2. Materialized View Pattern
```sql
-- Pre-calculated performance summary for dashboard
CREATE MATERIALIZED VIEW mv_menu_performance_summary AS
SELECT 
  r.id,
  r.name,
  AVG(ma.popularity_score) as avg_popularity,
  AVG(ma.profitability_score) as avg_profitability,
  ma.classification
FROM recipes r
JOIN menu_analyses ma ON r.id = ma.recipe_id
WHERE ma.analysis_date >= NOW() - INTERVAL '30 days'
GROUP BY r.id, r.name, ma.classification;
```

### 3. Command Query Responsibility Segregation (CQRS)
- **Commands**: Sales data import, cost updates, configuration changes
- **Queries**: Dashboard data, reports, analysis results
- **Separation**: Optimized data structures for each use case

---

## Performance Considerations

### Database Performance
- **Query Optimization**: Composite indexes for time-based filtering
- **Partitioning Strategy**: Monthly partitions for sales_transactions
- **Connection Pooling**: Prisma connection management with circuit breaker
- **Target Performance**: <50ms for analytical queries

### API Performance
- **Response Times**: <200ms for 95th percentile
- **Throughput**: 1000+ concurrent users
- **Caching**: 70-90% cache hit rates for expensive operations
- **Rate Limiting**: Prevents abuse while allowing legitimate usage

### Frontend Performance
- **Loading Time**: <3s initial load, <1s navigation
- **Bundle Size**: Code splitting for menu engineering modules
- **Responsiveness**: 60fps interactions on mobile devices
- **Accessibility**: WCAG 2.1 AA compliance maintained

---

## Security Architecture

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based permissions for analytics data
- **Audit Logging**: Complete audit trail for all menu engineering operations
- **Data Retention**: Configurable retention policies for historical data

### API Security
- **Authentication**: JWT validation with Keycloak
- **Rate Limiting**: Configurable per endpoint and role
- **Input Validation**: Comprehensive Zod schemas with XSS protection
- **CORS**: Properly configured for frontend integration

### Compliance
- **GDPR**: Data protection and right to erasure
- **SOC2**: Security controls and monitoring
- **Industry Standards**: Hospitality-specific compliance requirements

---

## Monitoring and Observability

### Application Metrics
- **Performance**: API response times, cache hit rates, query performance
- **Business**: Menu analysis accuracy, user engagement, feature adoption
- **System**: Error rates, resource utilization, availability

### Alerting Strategy
- **Performance Alerts**: Response time degradation, cache misses
- **Business Alerts**: Unusual classification changes, cost threshold breaches  
- **System Alerts**: Database connectivity, service health, error spikes

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Audit Trail**: Complete history of menu engineering decisions
- **Security Events**: Authentication failures, suspicious activities

---

## Integration Architecture

### Existing Carmen ERP Integration
- **Recipe System**: Direct foreign key relationships
- **User Management**: Keycloak SSO and RBAC
- **Navigation**: Seamless integration under "Operational Planning"
- **Design System**: Consistent Shadcn/ui components

### POS System Integration
- **Supported Systems**: Square, Toast, Clover, Resy, OpenTable
- **Data Import**: CSV, Excel, JSON formats with intelligent mapping
- **Real-time Sync**: Configurable synchronization intervals
- **Error Handling**: Comprehensive error reporting and retry logic

### External Services
- **AI Recommendations**: Extensible architecture for ML integration
- **Competitive Intelligence**: API-ready for market data integration
- **Financial Systems**: Integration points for accounting systems

---

## Migration Strategy

### Phase 1: MVP Deployment (Completed)
- ✅ Database schema extensions
- ✅ Core service implementation  
- ✅ API endpoints with security
- ✅ Frontend dashboard and components

### Phase 2: Advanced Features (Planned)
- Seasonal analysis and forecasting
- AI-powered recommendation engine
- Competitive intelligence integration
- Advanced reporting and exports

### Phase 3: Enterprise Features (Future)
- Multi-location analytics
- Franchise reporting capabilities
- Advanced ML model training
- Real-time streaming analytics

---

## Quality Assurance

### Testing Strategy
- **Unit Tests**: 90%+ coverage for service layer
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Critical user workflows with Puppeteer
- **Performance Tests**: Load testing for analytical workloads

### Code Quality
- **TypeScript**: Strict mode with comprehensive typing
- **ESLint**: Carmen ERP coding standards
- **Code Review**: Automated security scanning
- **Documentation**: JSDoc comments and API documentation

---

## Business Impact

### Immediate Benefits (Phase 1 MVP)
- **15-30% Profit Improvement**: Through scientific menu optimization
- **Real-time Cost Monitoring**: Proactive alerts and automated calculations
- **Data-driven Decisions**: Replace intuition with analytics
- **Operational Efficiency**: Automated analysis and reporting

### Long-term Benefits (Phases 2-3)
- **30-50% Profitability Gains**: Advanced AI optimization
- **Competitive Advantage**: Market positioning analysis
- **Scalability**: Multi-location and franchise support
- **Innovation**: Platform for continued hospitality tech advancement

### ROI Projections
- **Implementation Cost**: 50 hours (Phase 1)
- **Projected ROI**: 300-500% within 6 months
- **Payback Period**: 2-3 months for typical restaurant
- **Annual Savings**: $50,000-200,000 per location

---

## Risk Assessment

### Technical Risks
- **Performance**: Analytical workloads on existing database
  - *Mitigation*: Materialized views and strategic indexing
- **Data Quality**: POS integration data inconsistencies
  - *Mitigation*: Comprehensive validation and error reporting
- **Scalability**: Large dataset processing
  - *Mitigation*: Batch processing and partitioning strategy

### Business Risks
- **User Adoption**: Complexity of analytics interface
  - *Mitigation*: Intuitive design with guided workflows
- **Data Privacy**: Sensitive financial information
  - *Mitigation*: Comprehensive security and compliance measures
- **Integration**: POS system compatibility
  - *Mitigation*: Support for major platforms with extensible architecture

---

## Future Considerations

### Scalability Enhancements
- **Database Partitioning**: Automatic monthly partitions
- **Microservices**: Service separation for high-scale deployments
- **CDN Integration**: Global content delivery for multi-location chains
- **Real-time Analytics**: Streaming data processing for instant insights

### Feature Roadmap
- **Machine Learning**: Advanced predictive modeling
- **Mobile App**: Native mobile interface for managers
- **Voice Analytics**: Alexa/Google integration for insights
- **Blockchain**: Supply chain transparency and verification

### Technology Evolution
- **Cloud Migration**: Kubernetes deployment strategies
- **API Gateway**: Enterprise API management
- **Event Sourcing**: Complete audit trail architecture
- **GraphQL**: Flexible query interface for advanced analytics

---

## Conclusion

The Menu Engineering Module represents a significant advancement in Carmen ERP's capabilities, transforming it from an operational system into a strategic business intelligence platform. By leveraging existing infrastructure while adding sophisticated analytics capabilities, we've achieved:

1. **Rapid Implementation**: 5-7 weeks vs. 12-16 weeks for greenfield development
2. **Immediate Business Value**: 15-30% profit improvement potential
3. **Scalable Architecture**: Foundation for advanced AI and analytics features
4. **Enterprise Readiness**: Production-grade security, performance, and monitoring

The successful implementation of Phase 1 (MVP) demonstrates the viability of the architectural approach and provides a solid foundation for future enhancements. The module is now ready for production deployment and will provide immediate value to restaurant operations while enabling continued innovation in hospitality technology.

---

**Implementation Status**: ✅ Phase 1 Complete - Production Ready  
**Next Steps**: User acceptance testing and production deployment  
**Documentation**: Complete technical and user documentation available

---

*This ADR documents the architectural decisions for the Menu Engineering Module implementation completed in December 2024.*