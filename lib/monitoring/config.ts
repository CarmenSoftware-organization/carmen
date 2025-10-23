/**
 * Monitoring Configuration for Carmen ERP
 * Centralized configuration for all monitoring, observability, and analytics
 */

export interface MonitoringConfig {
  environment: 'development' | 'staging' | 'production'
  enabledServices: {
    performanceMonitoring: boolean
    errorTracking: boolean
    businessMetrics: boolean
    userAnalytics: boolean
    infrastructureMonitoring: boolean
    securityMonitoring: boolean
  }
  thresholds: {
    performance: {
      loadTime: number // ms
      firstContentfulPaint: number // ms
      largestContentfulPaint: number // ms
      firstInputDelay: number // ms
      cumulativeLayoutShift: number
      timeToInteractive: number // ms
    }
    errors: {
      errorRate: number // percentage
      criticalErrorThreshold: number // count per minute
      warningErrorThreshold: number // count per minute
    }
    api: {
      responseTime: number // ms
      errorRate: number // percentage
      throughput: number // requests per second
    }
    database: {
      queryTime: number // ms
      connectionPoolUsage: number // percentage
      slowQueryThreshold: number // ms
    }
  }
  alerts: {
    channels: ('email' | 'slack' | 'sms' | 'webhook')[]
    escalation: {
      levels: number
      timeouts: number[] // minutes for each level
    }
    recipients: {
      critical: string[]
      warning: string[]
      info: string[]
    }
  }
  sampling: {
    performanceTraces: number // percentage
    errorCapture: number // percentage
    userSessions: number // percentage
  }
  retention: {
    performanceData: number // days
    errorLogs: number // days
    businessMetrics: number // days
    auditLogs: number // days
  }
}

const baseConfig: Omit<MonitoringConfig, 'environment'> = {
  enabledServices: {
    performanceMonitoring: true,
    errorTracking: true,
    businessMetrics: true,
    userAnalytics: true,
    infrastructureMonitoring: true,
    securityMonitoring: true,
  },
  thresholds: {
    performance: {
      loadTime: 3000, // 3s
      firstContentfulPaint: 1500, // 1.5s
      largestContentfulPaint: 2500, // 2.5s
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1,
      timeToInteractive: 3500, // 3.5s
    },
    errors: {
      errorRate: 5, // 5%
      criticalErrorThreshold: 10, // 10 errors per minute
      warningErrorThreshold: 5, // 5 errors per minute
    },
    api: {
      responseTime: 500, // 500ms
      errorRate: 2, // 2%
      throughput: 100, // 100 rps
    },
    database: {
      queryTime: 200, // 200ms
      connectionPoolUsage: 80, // 80%
      slowQueryThreshold: 1000, // 1s
    },
  },
  alerts: {
    channels: ['email', 'slack'],
    escalation: {
      levels: 3,
      timeouts: [5, 15, 30], // 5min, 15min, 30min
    },
    recipients: {
      critical: ['admin@carmen.com', 'devops@carmen.com'],
      warning: ['dev-team@carmen.com'],
      info: ['monitoring@carmen.com'],
    },
  },
  sampling: {
    performanceTraces: 10, // 10%
    errorCapture: 100, // 100%
    userSessions: 5, // 5%
  },
  retention: {
    performanceData: 30, // 30 days
    errorLogs: 90, // 90 days
    businessMetrics: 365, // 1 year
    auditLogs: 2555, // 7 years (compliance)
  },
}

export const developmentConfig: MonitoringConfig = {
  ...baseConfig,
  environment: 'development',
  enabledServices: {
    ...baseConfig.enabledServices,
    infrastructureMonitoring: false,
    securityMonitoring: false,
  },
  sampling: {
    performanceTraces: 100, // 100% for dev
    errorCapture: 100,
    userSessions: 100,
  },
  alerts: {
    ...baseConfig.alerts,
    channels: ['email'], // Only email for dev
    recipients: {
      critical: ['dev@carmen.com'],
      warning: ['dev@carmen.com'],
      info: ['dev@carmen.com'],
    },
  },
}

export const stagingConfig: MonitoringConfig = {
  ...baseConfig,
  environment: 'staging',
  sampling: {
    performanceTraces: 50, // 50%
    errorCapture: 100,
    userSessions: 20, // 20%
  },
  retention: {
    ...baseConfig.retention,
    performanceData: 7, // 7 days for staging
    errorLogs: 30, // 30 days for staging
  },
}

export const productionConfig: MonitoringConfig = {
  ...baseConfig,
  environment: 'production',
  thresholds: {
    ...baseConfig.thresholds,
    performance: {
      ...baseConfig.thresholds.performance,
      loadTime: 2000, // Stricter for production
      firstContentfulPaint: 1000,
      largestContentfulPaint: 2000,
    },
    errors: {
      ...baseConfig.thresholds.errors,
      errorRate: 1, // 1% for production
      criticalErrorThreshold: 5, // 5 errors per minute
      warningErrorThreshold: 3, // 3 errors per minute
    },
  },
}

export function getMonitoringConfig(): MonitoringConfig {
  const env = process.env.NODE_ENV || 'development'
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV // Custom env for staging/production distinction

  if (env === 'production') {
    // Use APP_ENV to distinguish between staging and production
    if (appEnv === 'staging') {
      return stagingConfig
    }
    return productionConfig
  }

  return developmentConfig
}

// Service-specific configurations
export const serviceConfigs = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: getMonitoringConfig().sampling.performanceTraces / 100,
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version,
  },
  datadog: {
    apiKey: process.env.DD_API_KEY,
    applicationKey: process.env.DD_APP_KEY,
    site: process.env.DD_SITE || 'datadoghq.com',
    service: 'carmen-erp',
    env: process.env.NODE_ENV || 'development',
  },
  newRelic: {
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    appName: 'Carmen ERP',
    environment: process.env.NODE_ENV || 'development',
  },
  grafana: {
    url: process.env.GRAFANA_URL,
    apiKey: process.env.GRAFANA_API_KEY,
    orgId: process.env.GRAFANA_ORG_ID || '1',
  },
  prometheus: {
    gateway: process.env.PROMETHEUS_GATEWAY,
    jobName: 'carmen-erp',
    instance: process.env.HOSTNAME || 'localhost',
  },
}

// Business metrics configuration
export const businessMetricsConfig = {
  criticalJourneys: [
    'purchase-request-creation',
    'purchase-order-approval',
    'goods-receipt-processing',
    'vendor-onboarding',
    'inventory-adjustment',
    'price-list-update',
    'user-authentication',
    'report-generation',
  ],
  kpis: [
    'procurement-cycle-time',
    'vendor-response-time',
    'inventory-turnover-rate',
    'cost-savings-achieved',
    'approval-processing-time',
    'system-availability',
    'user-adoption-rate',
    'error-resolution-time',
  ],
  customEvents: [
    'feature-usage',
    'workflow-completion',
    'integration-success',
    'performance-optimization',
    'security-incident',
    'data-quality-issue',
  ],
}