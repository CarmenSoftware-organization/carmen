/**
 * Environment Variable Validation and Configuration
 * 
 * Provides type-safe environment configuration with comprehensive validation
 * and startup validation for production deployments.
 * 
 * @author Carmen ERP Team
 */

import { z } from 'zod'

// Database Environment Schema
const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  
  // Connection Pool Configuration
  DB_CONNECTION_LIMIT: z.coerce.number().min(1).max(100).default(10),
  DB_POOL_TIMEOUT: z.coerce.number().min(1).max(300).default(10), // seconds
  
  // Reliability Features
  DB_CIRCUIT_BREAKER: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  DB_MONITORING: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  DB_TIMEOUTS: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  
  // Circuit Breaker Configuration
  DB_CB_FAILURE_THRESHOLD: z.coerce.number().min(1).max(20).default(5),
  DB_CB_TIMEOUT: z.coerce.number().min(10000).max(300000).default(60000), // ms
  
  // Monitoring Configuration
  DB_HEALTH_CHECK_INTERVAL: z.coerce.number().min(5000).max(300000).default(30000), // ms
  DB_ALERT_WEBHOOK_URL: z.string().url().optional(),
  
  // Alert Thresholds
  DB_ALERT_HEALTH_SCORE_THRESHOLD: z.coerce.number().min(0).max(100).default(70),
  DB_ALERT_POOL_UTILIZATION_THRESHOLD: z.coerce.number().min(0).max(100).default(80),
  DB_ALERT_QUERY_TIME_THRESHOLD: z.coerce.number().min(100).max(10000).default(1000), // ms
  DB_ALERT_ERROR_RATE_THRESHOLD: z.coerce.number().min(0).max(100).default(5), // percentage
  DB_ALERT_CONNECTION_TIMEOUT_THRESHOLD: z.coerce.number().min(1).max(50).default(3)
})

// Authentication & Security Environment Schema
const authSecurityEnvSchema = z.object({
  // JWT Configuration
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .regex(/^[A-Za-z0-9+/=]+$/, 'JWT_SECRET must be a valid base64 string'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long')
    .regex(/^[A-Za-z0-9+/=]+$/, 'JWT_REFRESH_SECRET must be a valid base64 string'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // API Security
  API_RATE_LIMIT_WINDOW: z.coerce.number().min(60).max(3600).default(900), // seconds (15 minutes)
  API_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(10).max(10000).default(1000),
  API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  
  // Security Headers
  SECURITY_HEADERS_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  
  // Content Security Policy
  CSP_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  CSP_REPORT_URI: z.string().url().optional(),
  
  // Session Security
  SESSION_SECRET: z.string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long'),
  SESSION_SECURE: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  SESSION_HTTP_ONLY: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  SESSION_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  
  // Encryption
  ENCRYPTION_KEY: z.string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters long')
    .max(32, 'ENCRYPTION_KEY must be exactly 32 characters long'),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-gcm'),
  
  // Audit Logging
  AUDIT_LOG_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  AUDIT_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().min(1).max(365).default(90),
  
  // Security Monitoring
  SECURITY_EVENTS_WEBHOOK_URL: z.string().url().optional(),
  FAILED_LOGIN_THRESHOLD: z.coerce.number().min(1).max(20).default(5),
  ACCOUNT_LOCKOUT_DURATION: z.coerce.number().min(300).max(86400).default(1800), // seconds (30 minutes)
})

// Application Environment Schema
const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(3000),
  HOST: z.string().default('localhost'),
  
  // Application URLs
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // External API Keys (Optional)
  ANTHROPIC_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  
  // Monitoring and Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_METRICS: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  METRICS_PORT: z.coerce.number().min(1000).max(65535).optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.coerce.number().min(1024).max(104857600).default(10485760), // 10MB default
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Email Configuration (Optional)
  EMAIL_SERVICE: z.enum(['smtp', 'sendgrid', 'ses', 'disabled']).default('disabled'),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().min(1).max(65535).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Redis Configuration (Optional for caching)
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).max(15).default(0),
  
  // Feature Flags
  FEATURE_ADVANCED_ANALYTICS: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  FEATURE_MULTI_CURRENCY: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  FEATURE_VENDOR_PORTAL: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  FEATURE_MOBILE_APP: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
})

// Combined Environment Schema
const environmentSchema = z.object({
  ...databaseEnvSchema.shape,
  ...authSecurityEnvSchema.shape,
  ...appEnvSchema.shape,
})

// Type definitions
export type EnvironmentConfig = z.infer<typeof environmentSchema>
export type DatabaseConfig = z.infer<typeof databaseEnvSchema>
export type AuthSecurityConfig = z.infer<typeof authSecurityEnvSchema>
export type AppConfig = z.infer<typeof appEnvSchema>

// Environment validation result
export interface ValidationResult {
  success: boolean
  data?: EnvironmentConfig
  errors?: z.ZodError
  criticalErrors: string[]
  warnings: string[]
}

/**
 * Validates all environment variables against the schema
 * @returns ValidationResult with parsed configuration or errors
 */
export function validateEnvironment(): ValidationResult {
  const result = environmentSchema.safeParse(process.env)
  const criticalErrors: string[] = []
  const warnings: string[] = []
  
  if (!result.success) {
    // Categorize errors by severity
    result.error.issues.forEach(issue => {
      const path = issue.path.join('.')
      const message = `${path}: ${issue.message}`
      
      // Critical errors (security-related and database)
      if (
        path.startsWith('DATABASE_URL') ||
        path.startsWith('JWT_') ||
        path.startsWith('SESSION_') ||
        path.startsWith('ENCRYPTION_')
      ) {
        criticalErrors.push(message)
      } else {
        warnings.push(message)
      }
    })
    
    return {
      success: false,
      errors: result.error,
      criticalErrors,
      warnings
    }
  }
  
  // Additional validation for production environment
  if (result.data.NODE_ENV === 'production') {
    // Check for production-specific requirements
    if (result.data.JWT_SECRET.length < 64) {
      warnings.push('JWT_SECRET should be at least 64 characters in production')
    }
    
    if (result.data.CORS_ORIGIN === '*') {
      warnings.push('CORS_ORIGIN should not be "*" in production')
    }
    
    if (!result.data.DB_ALERT_WEBHOOK_URL) {
      warnings.push('DB_ALERT_WEBHOOK_URL is recommended in production')
    }
    
    if (!result.data.SECURITY_EVENTS_WEBHOOK_URL) {
      warnings.push('SECURITY_EVENTS_WEBHOOK_URL is recommended in production')
    }
  }
  
  return {
    success: true,
    data: result.data,
    criticalErrors,
    warnings
  }
}

/**
 * Validates environment and exits process if critical errors exist
 * Should be called during application startup
 */
export function validateEnvironmentOrExit(): EnvironmentConfig {
  console.log('🔍 Validating environment configuration...')
  
  const validation = validateEnvironment()
  
  // Display warnings
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:')
    validation.warnings.forEach(warning => {
      console.warn(`   • ${warning}`)
    })
    console.warn('')
  }
  
  // Handle critical errors
  if (validation.criticalErrors.length > 0) {
    console.error('❌ Critical Environment Errors:')
    validation.criticalErrors.forEach(error => {
      console.error(`   • ${error}`)
    })
    console.error('')
    console.error('🚨 Application cannot start with critical environment errors')
    process.exit(1)
  }
  
  // Handle validation failure
  if (!validation.success || !validation.data) {
    console.error('❌ Environment validation failed')
    if (validation.errors) {
      console.error('Validation errors:', validation.errors.format())
    }
    process.exit(1)
  }
  
  console.log('✅ Environment configuration validated successfully')
  
  // Log environment info (non-sensitive)
  console.log(`📋 Environment: ${validation.data.NODE_ENV}`)
  console.log(`🔗 Database: ${validation.data.DATABASE_URL ? 'Configured' : 'Not configured'}`)
  console.log(`🛡️  Security features: ${validation.data.SECURITY_HEADERS_ENABLED ? 'Enabled' : 'Disabled'}`)
  console.log(`📊 Monitoring: ${validation.data.DB_MONITORING ? 'Enabled' : 'Disabled'}`)
  console.log(`🔒 Audit logging: ${validation.data.AUDIT_LOG_ENABLED ? 'Enabled' : 'Disabled'}`)
  console.log('')
  
  return validation.data
}

/**
 * Gets validated environment configuration
 * Performs validation and caches the result
 */
let cachedConfig: EnvironmentConfig | null = null

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    const validation = validateEnvironment()
    
    if (!validation.success || !validation.data) {
      // In development mode, provide more detailed error information
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Environment configuration validation failed:')
        if (validation.criticalErrors.length > 0) {
          console.error('Critical errors:')
          validation.criticalErrors.forEach(error => console.error(`  • ${error}`))
        }
        if (validation.warnings.length > 0) {
          console.error('Warnings:')
          validation.warnings.forEach(warning => console.error(`  • ${warning}`))
        }
        if (validation.errors) {
          console.error('Full validation errors:', JSON.stringify(validation.errors.format(), null, 2))
        }
      }
      throw new Error('Environment configuration is invalid')
    }
    
    cachedConfig = validation.data
  }
  
  return cachedConfig
}

/**
 * Gets specific configuration sections
 */
export function getDatabaseConfig(): DatabaseConfig {
  const config = getEnvironmentConfig()
  return {
    DATABASE_URL: config.DATABASE_URL,
    DB_CONNECTION_LIMIT: config.DB_CONNECTION_LIMIT,
    DB_POOL_TIMEOUT: config.DB_POOL_TIMEOUT,
    DB_CIRCUIT_BREAKER: config.DB_CIRCUIT_BREAKER,
    DB_MONITORING: config.DB_MONITORING,
    DB_TIMEOUTS: config.DB_TIMEOUTS,
    DB_CB_FAILURE_THRESHOLD: config.DB_CB_FAILURE_THRESHOLD,
    DB_CB_TIMEOUT: config.DB_CB_TIMEOUT,
    DB_HEALTH_CHECK_INTERVAL: config.DB_HEALTH_CHECK_INTERVAL,
    DB_ALERT_WEBHOOK_URL: config.DB_ALERT_WEBHOOK_URL,
    DB_ALERT_HEALTH_SCORE_THRESHOLD: config.DB_ALERT_HEALTH_SCORE_THRESHOLD,
    DB_ALERT_POOL_UTILIZATION_THRESHOLD: config.DB_ALERT_POOL_UTILIZATION_THRESHOLD,
    DB_ALERT_QUERY_TIME_THRESHOLD: config.DB_ALERT_QUERY_TIME_THRESHOLD,
    DB_ALERT_ERROR_RATE_THRESHOLD: config.DB_ALERT_ERROR_RATE_THRESHOLD,
    DB_ALERT_CONNECTION_TIMEOUT_THRESHOLD: config.DB_ALERT_CONNECTION_TIMEOUT_THRESHOLD,
  }
}

export function getAuthSecurityConfig(): AuthSecurityConfig {
  const config = getEnvironmentConfig()
  return {
    JWT_SECRET: config.JWT_SECRET,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: config.JWT_REFRESH_EXPIRES_IN,
    API_RATE_LIMIT_WINDOW: config.API_RATE_LIMIT_WINDOW,
    API_RATE_LIMIT_MAX_REQUESTS: config.API_RATE_LIMIT_MAX_REQUESTS,
    API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: config.API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
    SECURITY_HEADERS_ENABLED: config.SECURITY_HEADERS_ENABLED,
    CORS_ORIGIN: config.CORS_ORIGIN,
    CORS_CREDENTIALS: config.CORS_CREDENTIALS,
    CSP_ENABLED: config.CSP_ENABLED,
    CSP_REPORT_URI: config.CSP_REPORT_URI,
    SESSION_SECRET: config.SESSION_SECRET,
    SESSION_SECURE: config.SESSION_SECURE,
    SESSION_HTTP_ONLY: config.SESSION_HTTP_ONLY,
    SESSION_SAME_SITE: config.SESSION_SAME_SITE,
    ENCRYPTION_KEY: config.ENCRYPTION_KEY,
    ENCRYPTION_ALGORITHM: config.ENCRYPTION_ALGORITHM,
    AUDIT_LOG_ENABLED: config.AUDIT_LOG_ENABLED,
    AUDIT_LOG_LEVEL: config.AUDIT_LOG_LEVEL,
    AUDIT_LOG_RETENTION_DAYS: config.AUDIT_LOG_RETENTION_DAYS,
    SECURITY_EVENTS_WEBHOOK_URL: config.SECURITY_EVENTS_WEBHOOK_URL,
    FAILED_LOGIN_THRESHOLD: config.FAILED_LOGIN_THRESHOLD,
    ACCOUNT_LOCKOUT_DURATION: config.ACCOUNT_LOCKOUT_DURATION,
  }
}

export function getAppConfig(): AppConfig {
  const config = getEnvironmentConfig()
  return {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    HOST: config.HOST,
    NEXTAUTH_URL: config.NEXTAUTH_URL,
    NEXTAUTH_SECRET: config.NEXTAUTH_SECRET,
    ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY,
    PERPLEXITY_API_KEY: config.PERPLEXITY_API_KEY,
    OPENAI_API_KEY: config.OPENAI_API_KEY,
    GOOGLE_API_KEY: config.GOOGLE_API_KEY,
    MISTRAL_API_KEY: config.MISTRAL_API_KEY,
    XAI_API_KEY: config.XAI_API_KEY,
    AZURE_OPENAI_API_KEY: config.AZURE_OPENAI_API_KEY,
    LOG_LEVEL: config.LOG_LEVEL,
    ENABLE_METRICS: config.ENABLE_METRICS,
    METRICS_PORT: config.METRICS_PORT,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES: config.ALLOWED_FILE_TYPES,
    UPLOAD_PATH: config.UPLOAD_PATH,
    EMAIL_SERVICE: config.EMAIL_SERVICE,
    EMAIL_HOST: config.EMAIL_HOST,
    EMAIL_PORT: config.EMAIL_PORT,
    EMAIL_USER: config.EMAIL_USER,
    EMAIL_PASSWORD: config.EMAIL_PASSWORD,
    EMAIL_FROM: config.EMAIL_FROM,
    REDIS_URL: config.REDIS_URL,
    REDIS_PASSWORD: config.REDIS_PASSWORD,
    REDIS_DB: config.REDIS_DB,
    FEATURE_ADVANCED_ANALYTICS: config.FEATURE_ADVANCED_ANALYTICS,
    FEATURE_MULTI_CURRENCY: config.FEATURE_MULTI_CURRENCY,
    FEATURE_VENDOR_PORTAL: config.FEATURE_VENDOR_PORTAL,
    FEATURE_MOBILE_APP: config.FEATURE_MOBILE_APP,
  }
}

/**
 * Utility to check if running in production
 */
export function isProduction(): boolean {
  return getEnvironmentConfig().NODE_ENV === 'production'
}

/**
 * Utility to check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironmentConfig().NODE_ENV === 'development'
}

/**
 * Utility to check if running in test mode
 */
export function isTest(): boolean {
  return getEnvironmentConfig().NODE_ENV === 'test'
}

// Export default validation function for startup
export default validateEnvironmentOrExit