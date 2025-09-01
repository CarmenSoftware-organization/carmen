# Database Reliability System

A comprehensive database reliability layer for the Carmen ERP system, built on top of Prisma ORM with advanced failure protection, monitoring, and recovery capabilities.

## Features

- **Circuit Breaker Pattern**: Automatic failure detection and recovery
- **Connection Pool Monitoring**: Real-time pool health and metrics
- **Comprehensive Timeouts**: Operation-specific timeout management
- **Health Monitoring**: Continuous health checks with alerting
- **Load Testing**: Built-in performance and load testing utilities
- **Graceful Degradation**: Maintains service during partial failures

## Quick Start

```typescript
import { reliablePrisma } from '@/lib/db/prisma'

// Use the reliable client for all database operations
const users = await reliablePrisma.query(
  async (client) => client.user.findMany(),
  { operationName: 'get-users', tableName: 'user' }
)
```

## Architecture Overview

### Core Components

```
lib/db/
├── prisma.ts              # Enhanced Prisma client with reliability wrapper
├── circuit-breaker.ts     # Circuit breaker implementation
├── connection-monitor.ts   # Connection pool monitoring and health checks  
├── timeout-handler.ts     # Comprehensive timeout management
├── health-endpoint.ts     # HTTP health check endpoints
├── test-scenarios.ts      # Testing utilities and scenarios
└── test-connection.ts     # Enhanced connection testing
```

### API Endpoints

```
/api/health              # Comprehensive health status
/api/health/metrics      # Prometheus-format metrics
/api/health/live         # Kubernetes liveness probe
/api/health/ready        # Kubernetes readiness probe
```

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Connection Pool Configuration
DB_CONNECTION_LIMIT=10                    # Maximum connections
DB_POOL_TIMEOUT=10                        # Pool timeout (seconds)

# Reliability Features
DB_CIRCUIT_BREAKER=true                   # Enable circuit breaker
DB_MONITORING=true                        # Enable monitoring
DB_TIMEOUTS=true                          # Enable timeouts

# Circuit Breaker Configuration
DB_CB_FAILURE_THRESHOLD=5                 # Failures before opening
DB_CB_TIMEOUT=60000                       # Recovery timeout (ms)

# Monitoring Configuration
DB_HEALTH_CHECK_INTERVAL=30000            # Health check interval (ms)
DB_ALERT_WEBHOOK_URL=                     # Alert webhook URL

# Alert Thresholds
DB_ALERT_HEALTH_SCORE_THRESHOLD=70        # Health score threshold
DB_ALERT_POOL_UTILIZATION_THRESHOLD=80    # Pool utilization threshold
DB_ALERT_QUERY_TIME_THRESHOLD=1000        # Query time threshold (ms)
DB_ALERT_ERROR_RATE_THRESHOLD=5           # Error rate threshold (%)
```

## Usage Guide

### 1. Basic Database Operations

```typescript
import { reliablePrisma } from '@/lib/db/prisma'

// Simple query with reliability features
const result = await reliablePrisma.query(
  async (client) => client.user.findUnique({
    where: { id: userId }
  }),
  {
    operationName: 'get-user-by-id',
    tableName: 'user',
    timeout: 5000,
    useCircuitBreaker: true
  }
)

// Transaction with reliability features
const result = await reliablePrisma.transaction(
  async (tx) => {
    const user = await tx.user.create({ data: userData })
    const profile = await tx.profile.create({ 
      data: { ...profileData, userId: user.id }
    })
    return { user, profile }
  },
  {
    operationName: 'create-user-with-profile',
    timeout: 10000
  }
)
```

### 2. Health Monitoring

```typescript
import { reliablePrisma, getDatabaseMonitor } from '@/lib/db/prisma'

// Check health status
const isHealthy = await reliablePrisma.healthCheck()

// Get detailed metrics
const metrics = reliablePrisma.getMetrics()

// Access monitoring system
const monitor = getDatabaseMonitor()
if (monitor) {
  const healthStatus = await monitor.getHealthStatus()
  console.log('Database status:', healthStatus.status)
}
```

### 3. Circuit Breaker Management

```typescript
import { databaseCircuitBreaker, CircuitState } from '@/lib/db/prisma'

// Check circuit breaker status
const metrics = databaseCircuitBreaker.getMetrics()
console.log('Circuit state:', metrics.state)

// Manual circuit breaker control (for testing)
databaseCircuitBreaker.forceState(CircuitState.OPEN)
databaseCircuitBreaker.reset()
```

### 4. Timeout Configuration

```typescript
import { TimeoutUtils } from '@/lib/db/prisma'

// Use predefined timeout configurations
const result = await reliablePrisma.query(
  queryFn,
  TimeoutUtils.complexQuery('user-analytics', 'users')
)

// Batch operations with automatic timeout scaling
const batchResult = await reliablePrisma.query(
  batchQueryFn,
  TimeoutUtils.batchOperation('batchInsert', 1000, 'orders')
)
```

## Testing and Validation

### Running Tests

```bash
# Basic connection test
npx tsx lib/db/test-connection.ts

# Full reliability test suite
npx tsx lib/db/test-connection.ts --reliability

# Health endpoint tests
npx tsx lib/db/test-connection.ts --health

# All tests
npx tsx lib/db/test-connection.ts --all
```

### Test Scenarios

The system includes comprehensive test scenarios:

- **Circuit Breaker Tests**: Normal operation, failure threshold, blocking, recovery
- **Timeout Tests**: Within limits, exceeds limits, transaction timeouts, batch scaling
- **Monitoring Tests**: Health checks, metrics collection, endpoint functionality
- **Performance Tests**: Circuit breaker overhead, reliable client performance
- **Recovery Tests**: Automatic recovery, graceful degradation

### Load Testing

```typescript
import { DatabaseLoadTester } from '@/lib/db/test-scenarios'

const loadTester = new DatabaseLoadTester(prisma)

const results = await loadTester.runLoadTest({
  concurrentConnections: 10,
  operationsPerConnection: 100,
  operationType: 'mixed'
})

console.log('Load test results:', results)
```

## Health Monitoring and Alerting

### Health Check Endpoints

#### GET /api/health
Comprehensive health status with detailed metrics:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600000,
  "database": {
    "connected": true,
    "connectionPool": {
      "total": 10,
      "active": 3,
      "idle": 7,
      "utilization": 30
    },
    "performance": {
      "averageQueryTime": 45,
      "slowQueries": 2,
      "successfulQueries": 1250,
      "failedQueries": 5,
      "errorRate": 0.4
    },
    "reliability": {
      "circuitBreaker": {
        "state": "CLOSED",
        "failures": 0,
        "successes": 1250,
        "requests": 1255
      },
      "activeOperations": 2,
      "timeouts": 0
    }
  },
  "checks": {
    "connectivity": true,
    "queryPerformance": true,
    "poolHealth": true,
    "circuitBreakerState": true
  },
  "alerts": []
}
```

#### GET /api/health/metrics
Prometheus-format metrics for monitoring systems:

```
db_connections_total 10
db_connections_active 3
db_connections_idle 7
db_pool_utilization_percent 30
db_query_duration_avg_ms 45
db_health_score 95
db_circuit_breaker_state{value="CLOSED"} 1
```

#### GET /api/health/live
Kubernetes liveness probe:

```json
{
  "alive": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/health/ready
Kubernetes readiness probe:

```json
{
  "ready": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Alert Configuration

Configure webhook alerts for critical issues:

```bash
DB_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Alerts are triggered for:
- Circuit breaker state changes
- High connection pool utilization (>80%)
- Slow query performance (>1000ms avg)
- High error rates (>5%)
- Low health scores (<70)

## Advanced Configuration

### Circuit Breaker Tuning

```typescript
import { DatabaseCircuitBreaker } from '@/lib/db/circuit-breaker'

const customCircuitBreaker = new DatabaseCircuitBreaker({
  failureThreshold: 3,        // Open after 3 failures
  successThreshold: 2,        // Close after 2 successes
  timeout: 30000,             // 30 second timeout
  monitorWindow: 60000,       // 1 minute monitoring window
  retry: {
    attempts: 5,
    initialDelay: 500,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
})
```

### Custom Timeout Configuration

```typescript
import { DatabaseTimeoutHandler } from '@/lib/db/timeout-handler'

const customTimeoutHandler = new DatabaseTimeoutHandler({
  query: 15000,              // 15 second query timeout
  transaction: 30000,        // 30 second transaction timeout
  batchInsert: 60000,        // 1 minute batch insert timeout
  healthCheck: 3000,         // 3 second health check timeout
  // ... other timeouts
})
```

### Custom Monitoring Configuration

```typescript
import { DatabaseConnectionMonitor } from '@/lib/db/connection-monitor'

const customMonitor = new DatabaseConnectionMonitor(prisma, {
  enabled: true,
  webhookUrl: process.env.CUSTOM_WEBHOOK_URL,
  thresholds: {
    healthScore: 80,           // Higher health score requirement
    poolUtilization: 70,       // Lower utilization threshold
    queryTime: 500,            # Stricter query time requirement
    errorRate: 2,              # Lower error rate tolerance
    connectionTimeouts: 1      # Zero tolerance for timeouts
  }
})

monitor.startMonitoring(15000) // Check every 15 seconds
```

## Monitoring and Observability

### Metrics Collection

The system automatically collects and exposes metrics:

**Connection Metrics:**
- `db_connections_total`: Total connection pool size
- `db_connections_active`: Active connections in use
- `db_connections_idle`: Idle connections available
- `db_pool_utilization_percent`: Pool utilization percentage

**Performance Metrics:**
- `db_query_duration_avg_ms`: Average query duration
- `db_queries_slow_total`: Count of slow queries
- `db_queries_successful_total`: Successful query count
- `db_queries_failed_total`: Failed query count
- `db_health_score`: Overall health score (0-100)

**Reliability Metrics:**
- `db_circuit_breaker_state`: Current circuit breaker state
- `db_circuit_breaker_failures`: Circuit breaker failure count
- `db_operations_active`: Currently active operations
- `db_timeouts_total`: Total timeout occurrences

### Integration with Monitoring Systems

#### Prometheus + Grafana
```yaml
# prometheus.yml
- job_name: 'carmen-database'
  static_configs:
    - targets: ['localhost:3000']
  metrics_path: '/api/health/metrics'
  scrape_interval: 15s
```

#### Kubernetes Health Checks
```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Error Handling and Recovery

### Error Types

The system defines specific error types for different failure scenarios:

```typescript
import { 
  DatabaseCircuitBreakerError,
  DatabaseRetryError,
  DatabaseTimeoutError 
} from '@/lib/db/circuit-breaker'

try {
  await reliablePrisma.query(queryFn)
} catch (error) {
  if (error instanceof DatabaseCircuitBreakerError) {
    // Circuit breaker is blocking requests
    console.log('Circuit breaker state:', error.state)
  } else if (error instanceof DatabaseTimeoutError) {
    // Operation timed out
    console.log('Operation timed out')
  } else if (error instanceof DatabaseRetryError) {
    // All retry attempts failed
    console.log('Retry attempts exhausted:', error.attempts)
  }
}
```

### Recovery Strategies

1. **Automatic Recovery**: Circuit breaker automatically attempts recovery
2. **Graceful Degradation**: System continues operating with reduced functionality
3. **Retry Logic**: Operations are automatically retried with exponential backoff
4. **Connection Pool Management**: Automatic connection recycling and cleanup

## Performance Considerations

### Overhead Analysis

The reliability layer adds minimal overhead:

- **Circuit Breaker**: ~5-10ms per operation
- **Timeout Handler**: ~1-2ms per operation
- **Monitoring**: ~2-5ms per operation (when enabled)
- **Total Overhead**: Typically <20ms per operation

### Optimization Tips

1. **Disable features in development**: Set `DB_*=false` for faster development
2. **Tune timeout values**: Adjust based on your query complexity
3. **Configure connection pool**: Match to your server capacity
4. **Monitor metrics**: Use health endpoints to identify bottlenecks

## Troubleshooting

### Common Issues

#### Circuit Breaker Stuck Open
```typescript
// Check circuit breaker status
const metrics = databaseCircuitBreaker.getMetrics()
console.log('State:', metrics.state, 'Failures:', metrics.failures)

// Force reset if needed
databaseCircuitBreaker.reset()
```

#### High Connection Pool Utilization
```typescript
// Check current utilization
const monitor = getDatabaseMonitor()
const metrics = monitor?.getMetrics()
console.log('Pool utilization:', metrics?.poolUtilization)

// Increase connection limit in environment
// DB_CONNECTION_LIMIT=20
```

#### Slow Query Performance
```typescript
// Monitor query times
const metrics = reliablePrisma.getMetrics()
console.log('Average query time:', metrics.connectionPool?.avgQueryTime)

// Use query-specific timeouts
await reliablePrisma.query(complexQueryFn, {
  timeout: 30000, // 30 second timeout for complex query
  operationName: 'complex-analytics'
})
```

### Debug Logging

Enable detailed logging in development:

```bash
DB_CONNECTION_LIMIT=5        # Lower limit to test pool exhaustion
DB_CB_FAILURE_THRESHOLD=2    # Lower threshold to test circuit breaker
DB_HEALTH_CHECK_INTERVAL=5000 # More frequent health checks
```

## Migration Guide

### From Basic Prisma

1. **Replace imports**:
```typescript
// Before
import prisma from '@/lib/db/prisma'

// After
import { reliablePrisma } from '@/lib/db/prisma'
```

2. **Wrap operations**:
```typescript
// Before
const users = await prisma.user.findMany()

// After
const users = await reliablePrisma.query(
  async (client) => client.user.findMany()
)
```

3. **Update environment variables** (add reliability settings)

4. **Update health checks** (use new endpoints)

### Backward Compatibility

The raw Prisma client is still available:

```typescript
import { prisma } from '@/lib/db/prisma'
// or
const rawClient = reliablePrisma.raw
```

## Best Practices

1. **Use Descriptive Operation Names**: Help with monitoring and debugging
2. **Set Appropriate Timeouts**: Match to your query complexity
3. **Monitor Health Endpoints**: Set up alerts for production
4. **Test Failure Scenarios**: Use the test suite regularly
5. **Configure for Environment**: Different settings for dev/staging/prod
6. **Plan for Recovery**: Design your application to handle database failures gracefully

## Support and Contributing

For issues and feature requests, please check the existing documentation and test your changes with the comprehensive test suite.

### Running All Tests
```bash
npx tsx lib/db/test-connection.ts --all
```

This ensures all reliability features are working correctly before deployment.