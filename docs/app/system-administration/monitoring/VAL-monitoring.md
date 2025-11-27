# Monitoring - Validation Rules (VAL)

**Module**: System Administration - Monitoring
**Version**: 1.0
**Last Updated**: 2025-01-16
**Status**: Active Development

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Validation Strategy

### 1.1 Three-Layer Validation
1. **Client-Side**: Immediate user feedback using Zod + React Hook Form
2. **Server-Side**: Same Zod schemas in server actions for security
3. **Database**: SQL constraints and check constraints for data integrity

### 1.2 Validation Principles
- **User-Friendly Messages**: Clear, actionable error messages
- **Type Safety**: Leverage TypeScript for compile-time checks
- **Business Logic**: Encode business rules in validation schemas
- **Performance**: Efficient validation with minimal overhead
- **Reusability**: Share schemas between client and server

---

## 2. Common Validation Schemas

### 2.1 Base Types

```typescript
// lib/types/monitoring-validation.ts
import { z } from 'zod';

// Time range validation
export const timeRangeSchema = z.enum([
  '1h', '6h', '12h', '24h', '7d', '30d', '90d', 'custom'
], {
  errorMap: () => ({ message: 'Invalid time range' })
});

// Severity level validation
export const severitySchema = z.enum([
  'debug', 'info', 'warning', 'error', 'fatal', 'critical'
], {
  errorMap: () => ({ message: 'Invalid severity level' })
});

// Service status validation
export const serviceStatusSchema = z.enum([
  'healthy', 'degraded', 'down', 'unknown'
], {
  errorMap: () => ({ message: 'Invalid service status' })
});

// Email validation (supports multiple emails)
export const emailListSchema = z.string()
  .transform(val => val.split(',').map(e => e.trim()))
  .pipe(z.array(z.string().email({ message: 'Invalid email address' })))
  .transform(emails => emails.join(', '));

// Positive integer validation
export const positiveIntSchema = z.number()
  .int({ message: 'Must be an integer' })
  .positive({ message: 'Must be a positive number' });

// Non-negative decimal validation
export const nonNegativeDecimalSchema = z.number()
  .nonnegative({ message: 'Must be a non-negative number' });

// ISO 8601 date string validation
export const isoDateSchema = z.string()
  .datetime({ message: 'Invalid ISO 8601 date format' });

// URL validation (with protocols)
export const urlSchema = z.string()
  .url({ message: 'Invalid URL format' })
  .refine(url => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, { message: 'URL must use HTTP or HTTPS protocol' });
```

---

## 3. Service Health Validation

### 3.1 Service Health Configuration

```typescript
export const serviceHealthSchema = z.object({
  id: z.string().min(1, 'Service ID is required').max(50),
  name: z.string().min(1, 'Service name is required').max(100),
  description: z.string().max(500).optional(),
  serviceType: z.enum([
    'database', 'cache', 'email', 'storage', 'api', 'other'
  ], {
    errorMap: () => ({ message: 'Invalid service type' })
  }),
  status: serviceStatusSchema,
  healthCheckUrl: urlSchema.optional(),
  checkInterval: z.number()
    .int({ message: 'Check interval must be an integer' })
    .min(60, 'Minimum check interval is 60 seconds')
    .max(3600, 'Maximum check interval is 3600 seconds (1 hour)'),
  timeout: z.number()
    .int({ message: 'Timeout must be an integer' })
    .min(5, 'Minimum timeout is 5 seconds')
    .max(300, 'Maximum timeout is 300 seconds'),
  retryCount: z.number()
    .int({ message: 'Retry count must be an integer' })
    .min(0, 'Minimum retry count is 0')
    .max(5, 'Maximum retry count is 5'),
  metrics: z.record(z.any()).optional()
}).refine(data => {
  // Timeout must be less than check interval
  return data.timeout < data.checkInterval;
}, {
  message: 'Timeout must be less than check interval',
  path: ['timeout']
});
```

### 3.2 Health Check Execution

```typescript
export const healthCheckExecutionSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  manual: z.boolean().default(false)
});
```

---

## 4. Performance Monitoring Validation

### 4.1 Performance Metric

```typescript
export const performanceMetricSchema = z.object({
  time: z.date(),
  metricName: z.string().min(1).max(100),
  endpoint: z.string().max(500).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
    .optional(),
  statusCode: z.number()
    .int({ message: 'Status code must be an integer' })
    .min(100, 'Invalid HTTP status code')
    .max(599, 'Invalid HTTP status code')
    .optional(),
  p50: nonNegativeDecimalSchema.optional(),
  p95: nonNegativeDecimalSchema.optional(),
  p99: nonNegativeDecimalSchema.optional(),
  mean: nonNegativeDecimalSchema.optional(),
  min: nonNegativeDecimalSchema.optional(),
  max: nonNegativeDecimalSchema.optional(),
  requestCount: z.number()
    .int({ message: 'Request count must be an integer' })
    .nonnegative({ message: 'Request count must be non-negative' }),
  errorCount: z.number()
    .int({ message: 'Error count must be an integer' })
    .nonnegative({ message: 'Error count must be non-negative' }),
  errorRate: z.number()
    .min(0, 'Error rate must be between 0 and 100')
    .max(100, 'Error rate must be between 0 and 100')
    .optional(),
  tags: z.record(z.string()).optional()
}).refine(data => {
  // p95 should be >= p50
  if (data.p50 !== undefined && data.p95 !== undefined) {
    return data.p95 >= data.p50;
  }
  return true;
}, {
  message: 'P95 must be greater than or equal to P50',
  path: ['p95']
}).refine(data => {
  // p99 should be >= p95
  if (data.p95 !== undefined && data.p99 !== undefined) {
    return data.p99 >= data.p95;
  }
  return true;
}, {
  message: 'P99 must be greater than or equal to P95',
  path: ['p99']
}).refine(data => {
  // Error count should not exceed request count
  return data.errorCount <= data.requestCount;
}, {
  message: 'Error count cannot exceed request count',
  path: ['errorCount']
});
```

### 4.2 Performance Query Filters

```typescript
export const performanceQuerySchema = z.object({
  endpoint: z.string().max(500).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  timeRange: timeRangeSchema,
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  minResponseTime: nonNegativeDecimalSchema.optional(),
  maxResponseTime: nonNegativeDecimalSchema.optional(),
  minErrorRate: z.number().min(0).max(100).optional(),
  maxErrorRate: z.number().min(0).max(100).optional()
}).refine(data => {
  // Custom time range requires start and end times
  if (data.timeRange === 'custom') {
    return data.startTime !== undefined && data.endTime !== undefined;
  }
  return true;
}, {
  message: 'Custom time range requires start and end times',
  path: ['timeRange']
}).refine(data => {
  // Start time must be before end time
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: 'Start time must be before end time',
  path: ['endTime']
});
```

---

## 5. Error Tracking Validation

### 5.1 Error Log

```typescript
export const errorLogSchema = z.object({
  id: z.string().min(1).max(50),
  errorHash: z.string().length(64, 'Error hash must be 64 characters (MD5)'),
  message: z.string().min(1, 'Error message is required'),
  errorType: z.string().min(1).max(100),
  severity: severitySchema,
  stackTrace: z.string().optional(),
  filePath: z.string().max(500).optional(),
  lineNumber: positiveIntSchema.optional(),
  functionName: z.string().max(200).optional(),
  userId: z.string().max(50).optional(),
  sessionId: z.string().max(100).optional(),
  requestId: z.string().max(100).optional(),
  endpoint: z.string().max(500).optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  statusCode: z.number().int().min(100).max(599).optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip({ message: 'Invalid IP address' }).optional(),
  environment: z.enum(['development', 'staging', 'production']).default('production'),
  context: z.record(z.any()).optional(),
  breadcrumbs: z.array(z.object({
    timestamp: z.date(),
    category: z.string(),
    message: z.string(),
    level: severitySchema,
    data: z.record(z.any()).optional()
  })).optional()
});
```

### 5.2 Error Search Filters

```typescript
export const errorSearchSchema = z.object({
  searchQuery: z.string().max(500).optional(),
  severity: z.array(severitySchema).optional(),
  errorType: z.array(z.string()).optional(),
  status: z.array(z.enum(['new', 'acknowledged', 'in-progress', 'resolved', 'ignored'])).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  userId: z.string().max(50).optional(),
  endpoint: z.string().max(500).optional(),
  module: z.string().max(100).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  page: positiveIntSchema.default(1),
  pageSize: z.number()
    .int({ message: 'Page size must be an integer' })
    .min(10, 'Minimum page size is 10')
    .max(100, 'Maximum page size is 100')
    .default(50)
}).refine(data => {
  // Date range validation
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom < data.dateTo;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['dateTo']
});
```

### 5.3 Error Assignment

```typescript
export const errorAssignmentSchema = z.object({
  errorId: z.string().min(1, 'Error ID is required'),
  assignedTo: z.string().min(1, 'Assignee user ID is required'),
  note: z.string().max(1000).optional()
});
```

### 5.4 Error Resolution

```typescript
export const errorResolutionSchema = z.object({
  errorId: z.string().min(1, 'Error ID is required'),
  resolution: z.string().min(10, 'Resolution description must be at least 10 characters').max(2000),
  fixImplemented: z.enum([
    'code-change', 'config-update', 'data-fix', 'third-party-fix', 'other'
  ]),
  deploymentVersion: z.string().max(50).optional(),
  deploymentDate: z.date().optional()
}).refine(data => {
  // Deployment date should not be in the future
  if (data.deploymentDate) {
    return data.deploymentDate <= new Date();
  }
  return true;
}, {
  message: 'Deployment date cannot be in the future',
  path: ['deploymentDate']
});
```

---

## 6. Audit Trail Validation

### 6.1 Audit Event

```typescript
export const auditEventSchema = z.object({
  eventId: z.string().min(1).max(50),
  userId: z.string().min(1, 'User ID is required').max(50),
  userEmail: z.string().email({ message: 'Invalid user email' }),
  userRole: z.string().min(1).max(50),
  actionType: z.enum([
    'create', 'read', 'update', 'delete', 'execute', 'export',
    'login', 'logout', 'access-denied'
  ]),
  resourceType: z.string().min(1, 'Resource type is required').max(100),
  resourceId: z.string().max(100).optional(),
  resourceName: z.string().max(255).optional(),
  description: z.string().min(1, 'Description is required'),
  beforeData: z.record(z.any()).optional(),
  afterData: z.record(z.any()).optional(),
  changes: z.record(z.object({
    old: z.any(),
    new: z.any()
  })).optional(),
  outcome: z.enum(['success', 'failure'], {
    errorMap: () => ({ message: 'Outcome must be success or failure' })
  }),
  failureReason: z.string().max(1000).optional(),
  ipAddress: z.string().ip({ message: 'Invalid IP address' }),
  userAgent: z.string().optional(),
  sessionId: z.string().max(100).optional(),
  requestId: z.string().max(100).optional(),
  module: z.string().max(100).optional(),
  severity: severitySchema.default('info'),
  metadata: z.record(z.any()).optional()
}).refine(data => {
  // Failure outcome requires failure reason
  if (data.outcome === 'failure') {
    return data.failureReason !== undefined && data.failureReason.length > 0;
  }
  return true;
}, {
  message: 'Failure reason is required when outcome is failure',
  path: ['failureReason']
});
```

### 6.2 Audit Search Filters

```typescript
export const auditSearchSchema = z.object({
  searchQuery: z.string().max(500).optional(),
  userId: z.string().max(50).optional(),
  userEmail: z.string().email().optional(),
  actionType: z.array(z.enum([
    'create', 'read', 'update', 'delete', 'execute', 'export',
    'login', 'logout', 'access-denied'
  ])).optional(),
  resourceType: z.array(z.string()).optional(),
  resourceId: z.string().max(100).optional(),
  outcome: z.enum(['success', 'failure']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  module: z.string().max(100).optional(),
  severity: z.array(severitySchema).optional(),
  ipAddress: z.string().ip().optional(),
  sessionId: z.string().max(100).optional(),
  page: positiveIntSchema.default(1),
  pageSize: z.number().int().min(10).max(100).default(50)
}).refine(data => {
  // Date range validation
  if (data.dateFrom && data.dateTo) {
    const daysDiff = (data.dateTo.getTime() - data.dateFrom.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 365; // Max 1 year range
  }
  return true;
}, {
  message: 'Date range cannot exceed 1 year',
  path: ['dateTo']
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom < data.dateTo;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['dateTo']
});
```

---

## 7. Alert Management Validation

### 7.1 Alert Rule Configuration

```typescript
const comparisonOperatorSchema = z.enum([
  'gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'contains', 'not-contains'
]);

export const alertConditionSchema = z.object({
  metric: z.string().min(1, 'Metric is required').max(100),
  operator: comparisonOperatorSchema,
  threshold: z.number({ required_error: 'Threshold is required' }),
  duration: z.number()
    .int({ message: 'Duration must be an integer' })
    .min(1, 'Minimum duration is 1 minute')
    .max(1440, 'Maximum duration is 1440 minutes (24 hours)'),
  evaluationInterval: z.number()
    .int({ message: 'Evaluation interval must be an integer' })
    .min(60, 'Minimum evaluation interval is 60 seconds')
    .max(3600, 'Maximum evaluation interval is 3600 seconds (1 hour)')
    .default(60)
});

export const alertNotificationSchema = z.object({
  channels: z.array(z.enum([
    'email', 'slack', 'sms', 'webhook', 'pagerduty', 'in-app'
  ])).min(1, 'At least one notification channel is required'),
  recipients: emailListSchema.optional(),
  slackChannel: z.string().regex(/^#[a-z0-9-_]+$/, 'Invalid Slack channel format').optional(),
  webhookUrl: urlSchema.optional(),
  template: z.string().max(50).optional()
}).refine(data => {
  // Email channel requires recipients
  if (data.channels.includes('email')) {
    return data.recipients !== undefined && data.recipients.length > 0;
  }
  return true;
}, {
  message: 'Email channel requires at least one recipient',
  path: ['recipients']
}).refine(data => {
  // Slack channel requires slack channel name
  if (data.channels.includes('slack')) {
    return data.slackChannel !== undefined;
  }
  return true;
}, {
  message: 'Slack channel requires channel name',
  path: ['slackChannel']
}).refine(data => {
  // Webhook channel requires webhook URL
  if (data.channels.includes('webhook')) {
    return data.webhookUrl !== undefined;
  }
  return true;
}, {
  message: 'Webhook channel requires webhook URL',
  path: ['webhookUrl']
});

export const alertRuleSchema = z.object({
  id: z.string().min(1).max(50).optional(), // Optional for creation
  name: z.string().min(1, 'Alert rule name is required').max(200),
  description: z.string().max(1000).optional(),
  severity: severitySchema,
  status: z.enum(['enabled', 'disabled', 'testing']).default('enabled'),
  condition: alertConditionSchema,
  scope: z.record(z.any()).optional(),
  notifications: alertNotificationSchema,
  autoResolve: z.boolean().default(true),
  suppressDuration: z.number()
    .int({ message: 'Suppress duration must be an integer' })
    .min(60, 'Minimum suppress duration is 60 seconds')
    .max(3600, 'Maximum suppress duration is 3600 seconds')
    .default(300),
  maxAlertsPerHour: z.number()
    .int({ message: 'Max alerts per hour must be an integer' })
    .min(1, 'Minimum is 1 alert per hour')
    .max(100, 'Maximum is 100 alerts per hour')
    .default(10),
  escalationPolicyId: z.string().max(50).optional(),
  escalationDelay: z.number()
    .int({ message: 'Escalation delay must be an integer' })
    .min(5, 'Minimum escalation delay is 5 minutes')
    .max(180, 'Maximum escalation delay is 180 minutes')
    .optional(),
  tags: z.record(z.string()).optional()
}).refine(data => {
  // Escalation policy requires escalation delay
  if (data.escalationPolicyId) {
    return data.escalationDelay !== undefined && data.escalationDelay > 0;
  }
  return true;
}, {
  message: 'Escalation policy requires escalation delay',
  path: ['escalationDelay']
});
```

### 7.2 Alert Acknowledgment

```typescript
export const alertAcknowledgmentSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  note: z.string().max(1000).optional()
});
```

---

## 8. Dashboard & Widget Validation

### 8.1 Dashboard Configuration

```typescript
export const dashboardSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  name: z.string().min(1, 'Dashboard name is required').max(200),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['private', 'team', 'organization', 'public']).default('private'),
  teamId: z.string().max(50).optional(),
  layout: z.array(z.object({
    i: z.string(), // Widget ID
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().min(1).max(12),
    h: z.number().int().min(1).max(12)
  })).default([]),
  variables: z.record(z.object({
    name: z.string().min(1),
    type: z.enum(['text', 'dropdown', 'date']),
    label: z.string(),
    options: z.array(z.string()).optional(),
    default: z.string().optional()
  })).optional(),
  autoRefresh: z.boolean().default(true),
  refreshInterval: z.number()
    .int({ message: 'Refresh interval must be an integer' })
    .min(10, 'Minimum refresh interval is 10 seconds')
    .max(300, 'Maximum refresh interval is 300 seconds')
    .default(30),
  defaultTimeRange: timeRangeSchema.default('24h'),
  theme: z.enum(['light', 'dark']).default('light'),
  tags: z.array(z.string()).default([]),
  isTemplate: z.boolean().default(false)
}).refine(data => {
  // Team visibility requires team ID
  if (data.visibility === 'team') {
    return data.teamId !== undefined && data.teamId.length > 0;
  }
  return true;
}, {
  message: 'Team visibility requires team ID',
  path: ['teamId']
}).refine(data => {
  // Maximum 20 widgets per dashboard
  return data.layout.length <= 20;
}, {
  message: 'Maximum 20 widgets per dashboard',
  path: ['layout']
});
```

### 8.2 Widget Configuration

```typescript
export const widgetSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  dashboardId: z.string().min(1, 'Dashboard ID is required').max(50),
  title: z.string().min(1, 'Widget title is required').max(200),
  widgetType: z.enum([
    'time-series', 'counter', 'gauge', 'table', 'pie-chart',
    'bar-chart', 'heatmap', 'alert-list', 'custom-query'
  ]),
  position: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().min(1).max(12),
    h: z.number().int().min(1).max(12)
  }),
  dataSource: z.string().min(1, 'Data source is required').max(100),
  metricName: z.string().max(100).optional(),
  query: z.string().max(5000).optional(),
  aggregation: z.enum(['sum', 'avg', 'min', 'max', 'count', 'p50', 'p95', 'p99']).optional(),
  timeRange: timeRangeSchema.optional(),
  filters: z.record(z.any()).optional(),
  visualization: z.object({
    chartType: z.enum(['line', 'area', 'bar', 'scatter', 'pie']).optional(),
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')).optional(),
    showLegend: z.boolean().default(true),
    legendPosition: z.enum(['top', 'bottom', 'left', 'right']).default('bottom'),
    yAxisScale: z.enum(['linear', 'logarithmic']).default('linear'),
    showGrid: z.boolean().default(true)
  }).default({}),
  refreshInterval: z.number().int().min(10).max(300).optional()
}).refine(data => {
  // Custom query widget requires query
  if (data.widgetType === 'custom-query') {
    return data.query !== undefined && data.query.length > 0;
  }
  return true;
}, {
  message: 'Custom query widget requires query',
  path: ['query']
}).refine(data => {
  // Non-custom widgets require metric name
  if (data.widgetType !== 'custom-query' && data.widgetType !== 'alert-list') {
    return data.metricName !== undefined && data.metricName.length > 0;
  }
  return true;
}, {
  message: 'Widget requires metric name',
  path: ['metricName']
});
```

---

## 9. Integration Health Validation

### 9.1 Integration Configuration

```typescript
export const integrationHealthSchema = z.object({
  id: z.string().min(1).max(50).optional(),
  name: z.string().min(1, 'Integration name is required').max(100),
  integrationType: z.enum([
    'payment-gateway', 'email-service', 'cloud-storage',
    'auth-provider', 'analytics', 'erp-system', 'sms-service', 'webhook'
  ]),
  endpointUrl: urlSchema.optional(),
  apiVersion: z.string().max(20).optional(),
  webhookUrl: urlSchema.optional(),
  webhookSecret: z.string().min(16, 'Webhook secret must be at least 16 characters').max(255).optional(),
  authentication: z.object({
    type: z.enum(['api-key', 'oauth2', 'basic-auth', 'bearer-token']),
    apiKey: z.string().max(255).optional(),
    clientId: z.string().max(255).optional(),
    clientSecret: z.string().max(255).optional(),
    username: z.string().max(255).optional(),
    password: z.string().max(255).optional(),
    token: z.string().max(1000).optional()
  }).optional(),
  settings: z.record(z.any()).optional(),
  isActive: z.boolean().default(true)
}).refine(data => {
  // Webhook integration requires webhook URL
  if (data.integrationType === 'webhook') {
    return data.webhookUrl !== undefined;
  }
  return true;
}, {
  message: 'Webhook integration requires webhook URL',
  path: ['webhookUrl']
}).refine(data => {
  // Authentication validation based on type
  if (data.authentication) {
    switch (data.authentication.type) {
      case 'api-key':
        return data.authentication.apiKey !== undefined;
      case 'oauth2':
        return data.authentication.clientId !== undefined &&
               data.authentication.clientSecret !== undefined;
      case 'basic-auth':
        return data.authentication.username !== undefined &&
               data.authentication.password !== undefined;
      case 'bearer-token':
        return data.authentication.token !== undefined;
    }
  }
  return true;
}, {
  message: 'Invalid authentication configuration for selected type',
  path: ['authentication']
});
```

### 9.2 Integration Test

```typescript
export const integrationTestSchema = z.object({
  integrationId: z.string().min(1, 'Integration ID is required')
});
```

---

## 10. User Activity Validation

### 10.1 User Activity Event

```typescript
export const userActivitySchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(50),
  sessionId: z.string().min(1, 'Session ID is required').max(100),
  activityType: z.enum(['page-view', 'action', 'feature-use']),
  module: z.string().max(100).optional(),
  feature: z.string().max(100).optional(),
  pageUrl: z.string().max(500).optional(),
  action: z.string().max(100).optional(),
  duration: positiveIntSchema.optional(),
  metadata: z.record(z.any()).optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  browser: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
  ipAddress: z.string().ip({ message: 'Invalid IP address' }).optional()
}).refine(data => {
  // Page view requires page URL
  if (data.activityType === 'page-view') {
    return data.pageUrl !== undefined && data.pageUrl.length > 0;
  }
  return true;
}, {
  message: 'Page view activity requires page URL',
  path: ['pageUrl']
}).refine(data => {
  // Action requires action name
  if (data.activityType === 'action') {
    return data.action !== undefined && data.action.length > 0;
  }
  return true;
}, {
  message: 'Action activity requires action name',
  path: ['action']
}).refine(data => {
  // Feature use requires module and feature
  if (data.activityType === 'feature-use') {
    return data.module !== undefined && data.feature !== undefined;
  }
  return true;
}, {
  message: 'Feature use requires module and feature',
  path: ['feature']
});
```

### 10.2 User Activity Query

```typescript
export const userActivityQuerySchema = z.object({
  userId: z.string().max(50).optional(),
  activityType: z.array(z.enum(['page-view', 'action', 'feature-use'])).optional(),
  module: z.string().max(100).optional(),
  feature: z.string().max(100).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  page: positiveIntSchema.default(1),
  pageSize: z.number().int().min(10).max(100).default(50)
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom < data.dateTo;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['dateTo']
});
```

---

## 11. Cross-Field Validation Functions

### 11.1 Time Range Validation

```typescript
export function validateTimeRange(
  startTime: Date,
  endTime: Date,
  maxRangeDays: number = 365
): { valid: boolean; error?: string } {
  if (startTime >= endTime) {
    return { valid: false, error: 'Start time must be before end time' };
  }

  const daysDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > maxRangeDays) {
    return { valid: false, error: `Time range cannot exceed ${maxRangeDays} days` };
  }

  const now = new Date();
  if (endTime > now) {
    return { valid: false, error: 'End time cannot be in the future' };
  }

  return { valid: true };
}
```

### 11.2 Threshold Validation

```typescript
export function validateThreshold(
  metricType: string,
  threshold: number
): { valid: boolean; error?: string } {
  const thresholdRules: Record<string, { min: number; max: number; unit: string }> = {
    'response_time': { min: 0, max: 60000, unit: 'ms' },
    'error_rate': { min: 0, max: 100, unit: '%' },
    'cpu_usage': { min: 0, max: 100, unit: '%' },
    'memory_usage': { min: 0, max: 100, unit: '%' },
    'disk_usage': { min: 0, max: 100, unit: '%' }
  };

  const rule = thresholdRules[metricType];
  if (!rule) {
    return { valid: true }; // No specific rule, accept any positive number
  }

  if (threshold < rule.min || threshold > rule.max) {
    return {
      valid: false,
      error: `Threshold for ${metricType} must be between ${rule.min} and ${rule.max} ${rule.unit}`
    };
  }

  return { valid: true };
}
```

### 11.3 Alert Rule Complexity Validation

```typescript
export function validateAlertRuleComplexity(
  conditions: any[],
  maxConditions: number = 5
): { valid: boolean; error?: string } {
  if (conditions.length > maxConditions) {
    return {
      valid: false,
      error: `Alert rule cannot have more than ${maxConditions} conditions`
    };
  }

  // Check for circular dependencies in compound conditions
  const metricsSeen = new Set<string>();
  for (const condition of conditions) {
    if (metricsSeen.has(condition.metric)) {
      return {
        valid: false,
        error: `Duplicate metric in conditions: ${condition.metric}`
      };
    }
    metricsSeen.add(condition.metric);
  }

  return { valid: true };
}
```

---

## 12. Async Validators

### 12.1 Alert Rule Name Uniqueness

```typescript
export async function validateAlertRuleNameUnique(
  name: string,
  excludeId?: string
): Promise<{ valid: boolean; error?: string }> {
  // Check database for existing alert rule with same name
  const existing = await prisma.alertRule.findFirst({
    where: {
      name,
      ...(excludeId && { id: { not: excludeId } })
    }
  });

  if (existing) {
    return {
      valid: false,
      error: 'An alert rule with this name already exists'
    };
  }

  return { valid: true };
}
```

### 12.2 Dashboard Name Uniqueness

```typescript
export async function validateDashboardNameUnique(
  name: string,
  ownerId: string,
  excludeId?: string
): Promise<{ valid: boolean; error?: string }> {
  const existing = await prisma.dashboard.findFirst({
    where: {
      name,
      ownerId,
      ...(excludeId && { id: { not: excludeId } })
    }
  });

  if (existing) {
    return {
      valid: false,
      error: 'You already have a dashboard with this name'
    };
  }

  return { valid: true };
}
```

### 12.3 Integration Endpoint Reachability

```typescript
export async function validateIntegrationEndpoint(
  url: string,
  timeout: number = 5000
): Promise<{ valid: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        valid: false,
        error: `Endpoint returned status ${response.status}`
      };
    }

    return { valid: true };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { valid: false, error: 'Request timed out' };
    }
    return { valid: false, error: `Cannot reach endpoint: ${error.message}` };
  }
}
```

---

## 13. Business Logic Validators

### 13.1 Alert Suppression Logic

```typescript
export function validateAlertSuppression(
  lastTriggered: Date,
  suppressDuration: number
): boolean {
  const suppressUntil = new Date(lastTriggered.getTime() + suppressDuration * 1000);
  return new Date() < suppressUntil;
}
```

### 13.2 Data Retention Policy Compliance

```typescript
export function validateDataRetention(
  dataType: string,
  retentionDays: number
): { valid: boolean; error?: string } {
  const retentionPolicies: Record<string, { min: number; max: number }> = {
    'performance_metric': { min: 7, max: 365 },
    'error_log': { min: 30, max: 365 },
    'audit_event': { min: 365, max: 2555 }, // 1 year to 7 years
    'user_activity': { min: 30, max: 365 },
    'health_check': { min: 7, max: 90 },
    'integration_event': { min: 7, max: 90 }
  };

  const policy = retentionPolicies[dataType];
  if (!policy) {
    return { valid: false, error: `Unknown data type: ${dataType}` };
  }

  if (retentionDays < policy.min || retentionDays > policy.max) {
    return {
      valid: false,
      error: `Retention period for ${dataType} must be between ${policy.min} and ${policy.max} days`
    };
  }

  return { valid: true };
}
```

### 13.3 Metric Aggregation Validation

```typescript
export function validateMetricAggregation(
  metricType: string,
  aggregation: string
): { valid: boolean; error?: string } {
  const validAggregations: Record<string, string[]> = {
    'counter': ['sum', 'count', 'avg'],
    'gauge': ['avg', 'min', 'max', 'p50', 'p95', 'p99'],
    'histogram': ['avg', 'min', 'max', 'p50', 'p95', 'p99', 'count'],
    'summary': ['avg', 'min', 'max', 'p50', 'p95', 'p99']
  };

  const valid = validAggregations[metricType];
  if (!valid) {
    return { valid: false, error: `Unknown metric type: ${metricType}` };
  }

  if (!valid.includes(aggregation)) {
    return {
      valid: false,
      error: `Aggregation '${aggregation}' not supported for ${metricType}. Valid options: ${valid.join(', ')}`
    };
  }

  return { valid: true };
}
```

---

## 14. Error Messages

### 14.1 User-Friendly Error Messages

```typescript
export const ERROR_MESSAGES = {
  // General
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',

  // Service Health
  INVALID_CHECK_INTERVAL: 'Check interval must be between 60 and 3600 seconds',
  TIMEOUT_TOO_LONG: 'Timeout must be less than check interval',

  // Performance
  INVALID_PERCENTILE: 'P95 must be >= P50, and P99 must be >= P95',
  ERROR_COUNT_EXCEEDS_TOTAL: 'Error count cannot exceed total request count',

  // Alerts
  ALERT_NAME_EXISTS: 'An alert rule with this name already exists',
  MISSING_NOTIFICATION_CONFIG: 'Email channel requires at least one recipient',
  ESCALATION_DELAY_REQUIRED: 'Escalation policy requires escalation delay',

  // Dashboards
  DASHBOARD_NAME_EXISTS: 'You already have a dashboard with this name',
  TOO_MANY_WIDGETS: 'Maximum 20 widgets per dashboard',
  CUSTOM_QUERY_REQUIRED: 'Custom query widget requires query',

  // Integrations
  WEBHOOK_URL_REQUIRED: 'Webhook integration requires webhook URL',
  INVALID_AUTH_CONFIG: 'Invalid authentication configuration for selected type',
  ENDPOINT_UNREACHABLE: 'Cannot reach integration endpoint',

  // Audit
  FAILURE_REASON_REQUIRED: 'Failure reason is required when outcome is failure',
  DATE_RANGE_TOO_LARGE: 'Date range cannot exceed 1 year',

  // Data Retention
  RETENTION_OUT_OF_RANGE: 'Retention period out of allowed range for this data type'
} as const;
```

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active Development
- **Next Review**: Q2 2025
