# Carmen ERP Monitoring System

A comprehensive monitoring, observability, and alerting system for the Carmen ERP application. This system provides real-time insights into application performance, business metrics, system health, and user behavior.

## Features

### 🎯 Core Monitoring Capabilities

- **Application Performance Monitoring (APM)**
  - Core Web Vitals tracking (FCP, LCP, FID, CLS)
  - API response time monitoring
  - Database query performance tracking
  - User journey and workflow analysis

- **Error Tracking & Logging**
  - Comprehensive error capture and aggregation
  - Structured logging with context preservation
  - Performance correlation with errors
  - User session tracking

- **Business Metrics & Analytics**
  - User behavior tracking and analytics
  - Feature usage and adoption metrics
  - Workflow completion rates and bottlenecks
  - Business KPI monitoring

- **Infrastructure Monitoring**
  - System health checks (Database, Auth, Cache, External APIs)
  - Resource utilization monitoring (CPU, Memory, Disk)
  - Service dependency tracking
  - Real-time alerting and notifications

- **Alerting & Notifications**
  - Configurable alert rules with multiple severity levels
  - Multi-channel notifications (Email, Slack, Webhook)
  - Escalation policies and acknowledgment workflows
  - Alert silencing and suppression

## Quick Start

### 1. Installation

The monitoring system is already integrated into Carmen ERP. No additional packages needed.

### 2. Basic Setup

```typescript
import { initializeMonitoring } from '@/lib/monitoring'

// Initialize monitoring system
const monitoring = initializeMonitoring({
  userId: 'user-123',
  userEmail: 'user@carmen.com',
  userRole: 'admin',
  environment: 'production'
})
```

### 3. React Integration

```tsx
import { MonitoringProvider, useMonitoring } from '@/lib/monitoring'

// Wrap your app with monitoring provider
function App() {
  return (
    <MonitoringProvider 
      userId="user-123"
      userEmail="user@carmen.com"
      module="procurement"
    >
      <YourAppContent />
    </MonitoringProvider>
  )
}

// Use monitoring in components
function MyComponent() {
  const { trackUserInteraction, captureError, trackFeatureUsage } = useMonitoring()
  
  const handleClick = () => {
    trackUserInteraction('button_click', 'submit_button')
    trackFeatureUsage('purchase_order_creation')
  }
  
  return <button onClick={handleClick}>Submit</button>
}
```

### 4. API Route Monitoring

```typescript
import { withMonitoring } from '@/lib/monitoring'

export const POST = withMonitoring(
  async (request: NextRequest) => {
    // Your API logic here
    return NextResponse.json({ success: true })
  },
  {
    name: 'create_purchase_order',
    module: 'procurement',
    trackPerformance: true,
    trackBusinessMetrics: true
  }
)
```

## Configuration

### Environment Variables

```bash
# Basic Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0

# Error Tracking (Sentry)
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-public-sentry-dsn

# External Service URLs
KEYCLOAK_URL=http://localhost:8080
REDIS_URL=redis://localhost:6379
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com

# Alerting
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=alerts@carmen.com
SMTP_PASS=your-password
ALERT_EMAIL_FROM=alerts@carmen.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_WEBHOOK_URL=https://your-webhook-endpoint.com

# Analytics
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token
```

### Monitoring Configuration

```typescript
import { getMonitoringConfig } from '@/lib/monitoring'

const config = getMonitoringConfig()
// Automatically selects configuration based on NODE_ENV:
// - development: Full logging, no external services
// - staging: Reduced sampling, shorter retention
// - production: Optimized for performance, full features
```

## API Endpoints

### Health Check
```bash
# Basic health check (public)
GET /api/health

# Detailed health check (requires admin auth)
GET /api/health?detailed=true
```

### Metrics
```bash
# Basic metrics (public)
GET /api/metrics?type=basic

# Performance metrics (authenticated)
GET /api/metrics?type=performance&timeframe=3600000

# Business metrics (authenticated)
GET /api/metrics?type=business&timeframe=86400000

# Infrastructure metrics (admin only)
GET /api/metrics?type=infrastructure

# Alert metrics (admin only)
GET /api/metrics?type=alerts

# Prometheus format (for monitoring tools)
GET /api/metrics/prometheus
```

## Usage Examples

### Performance Monitoring

```typescript
import { performanceMonitor, measurePerformance } from '@/lib/monitoring'

// Track user journey
const journeyId = performanceMonitor.startJourney('purchase_order_creation', {
  userId: 'user-123',
  module: 'procurement'
})

// Add journey steps
performanceMonitor.addJourneyStep(journeyId, 'form_validation')
performanceMonitor.completeJourneyStep(journeyId, 'form_validation', 'completed')

// Complete journey
performanceMonitor.completeJourney(journeyId, 'completed')

// Measure function performance
const result = await measurePerformance('database_query', async () => {
  return await prisma.purchaseOrder.findMany()
}, { query: 'findMany', table: 'purchaseOrder' })
```

### Business Metrics

```typescript
import { businessMetricsTracker, trackUserJourney } from '@/lib/monitoring'

// Track feature usage
businessMetricsTracker.trackFeatureUsage('advanced_search', 'procurement', 'user-123')

// Track custom business event
businessMetricsTracker.trackEvent(
  'purchase_order_approved',
  'business',
  {
    orderId: 'PO-001',
    amount: 15000,
    vendor: 'Vendor ABC',
    approver: 'manager-456'
  },
  {
    userId: 'user-123',
    module: 'procurement'
  }
)

// Track complex user journey
const journey = trackUserJourney('vendor_onboarding', [
  'vendor_form',
  'document_upload',
  'verification',
  'approval'
], 'user-123')

journey.nextStep({ formData: { name: 'New Vendor' } })
journey.nextStep({ documents: ['license.pdf', 'certificate.pdf'] })
journey.complete()
```

### Error Tracking

```typescript
import { errorTracker, logger } from '@/lib/monitoring'

// Capture errors with context
try {
  await processPayment(order)
} catch (error) {
  errorTracker.captureError(error, {
    orderId: order.id,
    userId: user.id,
    paymentMethod: 'credit_card',
    amount: order.total
  })
  
  logger.error('Payment processing failed', {
    orderId: order.id,
    error,
    context: { paymentMethod: 'credit_card' }
  })
}

// Capture custom messages
errorTracker.captureMessage('Unusual user behavior detected', 'warning', {
  userId: 'user-123',
  behavior: 'rapid_api_calls',
  count: 150
})
```

### Infrastructure Monitoring

```typescript
import { infrastructureMonitor, createSystemAlert } from '@/lib/monitoring'

// Get current system health
const health = await infrastructureMonitor.getHealthStatus()
console.log('System status:', health.overall)

// Create custom alert
if (cpuUsage > 90) {
  createSystemAlert('cpu_usage', cpuUsage, 80, 'critical')
}

// Register custom health check
infrastructureMonitor.registerHealthCheck('custom_service', async () => {
  try {
    await checkExternalService()
    return {
      name: 'custom_service',
      status: 'healthy',
      latency: 120,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      name: 'custom_service',
      status: 'unhealthy',
      latency: -1,
      timestamp: Date.now(),
      message: error.message
    }
  }
})
```

### Alerting

```typescript
import { alertManager, createAlert, acknowledgeAlert } from '@/lib/monitoring'

// Create alert
const alertId = createAlert(
  'High Error Rate',
  'API error rate exceeded 5% threshold',
  'warning',
  'api-monitor',
  'error_rate',
  8.5,
  5.0,
  { service: 'api', endpoint: '/api/orders' }
)

// Acknowledge alert
acknowledgeAlert(alertId, 'admin@carmen.com', 'Investigating issue')

// Create silence (suppress matching alerts)
alertManager.silenceAlerts(
  [{ name: 'service', value: 'api', isRegex: false }],
  3600000, // 1 hour
  'admin@carmen.com',
  'Maintenance window'
)
```

## Dashboard

Access the comprehensive monitoring dashboard at:
```
https://your-domain.com/system-administration/monitoring
```

Features:
- Real-time system health overview
- Performance metrics and trends
- Active alerts and alert history
- Business metrics and user analytics
- Infrastructure monitoring charts
- Log streaming and search

## Best Practices

### 1. Performance Monitoring
- Use journey tracking for complex user workflows
- Monitor API endpoints with `withMonitoring` wrapper
- Track Core Web Vitals for user experience insights
- Set up alerts for performance degradation

### 2. Error Handling
- Capture errors with relevant context
- Use structured logging with appropriate log levels
- Set up error rate alerts
- Regular error analysis and resolution

### 3. Business Metrics
- Track feature adoption and usage patterns
- Monitor workflow completion rates
- Set up KPI dashboards for stakeholders
- Use A/B testing metrics for feature decisions

### 4. Infrastructure
- Monitor all critical dependencies
- Set up health checks for external services
- Configure appropriate alert thresholds
- Plan for scaling and resource optimization

### 5. Alerting
- Configure escalation policies
- Use appropriate severity levels
- Set up notification channels
- Regular alert rule review and optimization

## Integration with External Services

### Sentry (Error Tracking)
```typescript
// Automatically configured via SENTRY_DSN environment variable
// Errors are sent to Sentry with full context and user information
```

### DataDog (APM)
```typescript
// Configure DD_API_KEY and DD_APP_KEY environment variables
// Metrics and logs are automatically sent to DataDog
```

### Slack Notifications
```typescript
// Configure SLACK_WEBHOOK_URL for alert notifications
// Alerts are formatted and sent to specified Slack channels
```

### Prometheus/Grafana
```bash
# Prometheus metrics endpoint
curl http://your-domain.com/api/metrics/prometheus

# Compatible with Grafana dashboards
```

## Troubleshooting

### Common Issues

1. **Missing Metrics Data**
   - Check if monitoring is enabled in configuration
   - Verify environment variables are set correctly
   - Check browser console for client-side errors

2. **Health Checks Failing**
   - Verify database connectivity
   - Check external service URLs and credentials
   - Review network connectivity and firewall rules

3. **Alerts Not Firing**
   - Verify alert rules configuration
   - Check notification channel settings
   - Review escalation policies

4. **Performance Issues**
   - Adjust sampling rates in production
   - Check buffer sizes and flush intervals
   - Monitor monitoring system resource usage

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Reset Monitoring Data

```typescript
// Clear all monitoring data (development only)
performanceMonitor.clearMetrics()
businessMetricsTracker.clearEvents()
errorTracker.clearBreadcrumbs()
```

## Contributing

When adding new monitoring features:

1. Follow the existing patterns and interfaces
2. Add appropriate TypeScript types
3. Include error handling and fallbacks
4. Add configuration options
5. Update documentation and examples
6. Test in multiple environments

## Support

For monitoring system issues:
1. Check the health endpoint: `/api/health?detailed=true`
2. Review application logs
3. Check external service status
4. Contact the development team with relevant context

## Performance Impact

The monitoring system is designed for minimal performance impact:
- Client-side: <1% CPU overhead, ~100KB additional bundle size
- Server-side: <2% CPU overhead, ~50MB additional memory
- Network: Configurable sampling rates, async data transmission
- Storage: Automatic cleanup and retention policies