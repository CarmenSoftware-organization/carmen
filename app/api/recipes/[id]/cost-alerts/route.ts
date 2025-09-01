/**
 * Recipe Cost Alerts API - Monitor cost variations and threshold breaches
 * 
 * GET /api/recipes/[id]/cost-alerts - Get active cost monitoring alerts
 * 
 * Security Features:
 * - JWT/Keycloak authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createMenuEngineeringService
} from '@/lib/services/menu-engineering-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for cost alerts query
const CostAlertsQuerySchema = z.object({
  // Alert filters
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).optional().default('all'),
  status: z.enum(['active', 'acknowledged', 'resolved', 'all']).optional().default('active'),
  alertType: z.enum(['price_increase', 'price_decrease', 'threshold_breach', 'variance', 'availability', 'quality', 'all']).optional().default('all'),
  // Time period
  since: z.coerce.date().optional(),
  until: z.coerce.date().optional(),
  period: z.enum(['today', 'last_24h', 'last_7d', 'last_30d', 'custom']).optional().default('last_7d'),
  // Threshold filters
  minVariancePercent: z.coerce.number().optional(),
  maxVariancePercent: z.coerce.number().optional(),
  minImpactAmount: z.coerce.number().min(0).optional(),
  // Output options
  includeHistorical: z.string().transform(str => str === 'true').optional().default(false),
  includeRecommendations: z.string().transform(str => str === 'true').optional().default(false),
  includeIngredientDetails: z.string().transform(str => str !== 'false').optional().default(true),
  // Sorting and pagination
  sortBy: z.enum(['severity', 'timestamp', 'impact', 'variance']).optional().default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50)
}).refine(data => {
  // If period is custom, since and until are required
  if (data.period === 'custom') {
    return data.since && data.until && data.since <= data.until;
  }
  return true;
}, {
  message: "For custom period, both since and until are required and since must be <= until"
})

// Path parameter validation
const PathParamsSchema = z.object({
  id: SecureSchemas.uuid
})

/**
 * GET /api/recipes/[id]/cost-alerts - Get recipe cost monitoring alerts
 * Requires authentication and 'read:recipe_alerts' permission
 */
const getCostAlerts = withSecurity(
  authStrategies.hybrid(
    withAuthorization('recipes', 'read', async (
      request: NextRequest, 
      { user, params }: { user: UnifiedAuthenticatedUser, params: { id: string } }
    ) => {
      try {
        // Validate path parameters
        const pathValidation = await validateInput({ id: params.id }, PathParamsSchema)
        if (!pathValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid recipe ID',
              details: pathValidation.errors
            },
            400
          )
        }

        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawQuery = {
          severity: searchParams.get('severity') || undefined,
          status: searchParams.get('status') || undefined,
          alertType: searchParams.get('alertType') || undefined,
          since: searchParams.get('since') || undefined,
          until: searchParams.get('until') || undefined,
          period: searchParams.get('period') || undefined,
          minVariancePercent: searchParams.get('minVariancePercent') || undefined,
          maxVariancePercent: searchParams.get('maxVariancePercent') || undefined,
          minImpactAmount: searchParams.get('minImpactAmount') || undefined,
          includeHistorical: searchParams.get('includeHistorical') || undefined,
          includeRecommendations: searchParams.get('includeRecommendations') || undefined,
          includeIngredientDetails: searchParams.get('includeIngredientDetails') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          limit: searchParams.get('limit') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, CostAlertsQuerySchema, {
          maxLength: 500,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid cost alerts query parameters',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid query parameters',
              details: validationResult.errors
            },
            400
          )
        }

        const queryParams = validationResult.sanitized || validationResult.data!
        const recipeId = pathValidation.data!.id

        // Calculate date range based on period
        const now = new Date()
        let since: Date
        let until: Date = new Date(now)
        
        switch (queryParams.period) {
          case 'today':
            since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'last_24h':
            since = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case 'last_7d':
            since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'last_30d':
            since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'custom':
            since = queryParams.since!
            until = queryParams.until!
            break
          default:
            since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }

        // Log cost alerts access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_cost_alerts',
          action: 'read',
          recipeId,
          filters: {
            severity: queryParams.severity,
            status: queryParams.status,
            alertType: queryParams.alertType,
            period: queryParams.period
          }
        })

        // Initialize cache and services
        const cache = new EnhancedCacheLayer()

        // Mock cost alerts data (in real implementation, this would query alert database)
        const mockAlerts = generateMockCostAlerts(recipeId, queryParams, since, until)

        // Apply filters
        let filteredAlerts = mockAlerts.filter(alert => {
          if (queryParams.severity !== 'all' && alert.severity !== queryParams.severity) return false
          if (queryParams.status !== 'all' && alert.status !== queryParams.status) return false
          if (queryParams.alertType !== 'all' && alert.type !== queryParams.alertType) return false
          if (queryParams.minVariancePercent && Math.abs(alert.variancePercent || 0) < queryParams.minVariancePercent) return false
          if (queryParams.maxVariancePercent && Math.abs(alert.variancePercent || 0) > queryParams.maxVariancePercent) return false
          if (queryParams.minImpactAmount && (alert.impactAmount?.amount || 0) < queryParams.minImpactAmount) return false
          return true
        })

        // Apply sorting
        filteredAlerts.sort((a, b) => {
          const field = queryParams.sortBy
          let aValue: any, bValue: any

          switch (field) {
            case 'severity':
              const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
              aValue = severityOrder[a.severity]
              bValue = severityOrder[b.severity]
              break
            case 'timestamp':
              aValue = new Date(a.timestamp).getTime()
              bValue = new Date(b.timestamp).getTime()
              break
            case 'impact':
              aValue = a.impactAmount?.amount || 0
              bValue = b.impactAmount?.amount || 0
              break
            case 'variance':
              aValue = Math.abs(a.variancePercent || 0)
              bValue = Math.abs(b.variancePercent || 0)
              break
            default:
              aValue = new Date(a.timestamp).getTime()
              bValue = new Date(b.timestamp).getTime()
          }

          if (queryParams.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          }
        })

        // Apply limit
        const limitedAlerts = filteredAlerts.slice(0, queryParams.limit)

        // Calculate summary statistics
        const summary = {
          totalAlerts: filteredAlerts.length,
          bySeverity: {
            critical: filteredAlerts.filter(a => a.severity === 'critical').length,
            high: filteredAlerts.filter(a => a.severity === 'high').length,
            medium: filteredAlerts.filter(a => a.severity === 'medium').length,
            low: filteredAlerts.filter(a => a.severity === 'low').length
          },
          byStatus: {
            active: filteredAlerts.filter(a => a.status === 'active').length,
            acknowledged: filteredAlerts.filter(a => a.status === 'acknowledged').length,
            resolved: filteredAlerts.filter(a => a.status === 'resolved').length
          },
          byType: {
            priceIncrease: filteredAlerts.filter(a => a.type === 'price_increase').length,
            priceDecrease: filteredAlerts.filter(a => a.type === 'price_decrease').length,
            thresholdBreach: filteredAlerts.filter(a => a.type === 'threshold_breach').length,
            variance: filteredAlerts.filter(a => a.type === 'variance').length,
            availability: filteredAlerts.filter(a => a.type === 'availability').length,
            quality: filteredAlerts.filter(a => a.type === 'quality').length
          },
          totalImpact: filteredAlerts.reduce((sum, alert) => sum + (alert.impactAmount?.amount || 0), 0),
          averageVariance: filteredAlerts.length > 0 
            ? filteredAlerts.reduce((sum, alert) => sum + Math.abs(alert.variancePercent || 0), 0) / filteredAlerts.length 
            : 0
        }

        // Create response data
        const responseData = {
          recipeId,
          recipeName: 'Signature Burger',
          recipeCode: 'SIG-001',
          period: {
            from: since.toISOString(),
            to: until.toISOString(),
            type: queryParams.period
          },
          summary,
          alerts: limitedAlerts,
          recommendations: queryParams.includeRecommendations ? [
            {
              type: 'cost_optimization',
              priority: 'high',
              title: 'Switch to alternative supplier for ground beef',
              description: 'Current supplier prices have increased 15.2%. Alternative supplier offers 8% lower prices.',
              potentialSaving: { amount: 127.50, currency: 'USD' }
            },
            {
              type: 'inventory_management',
              priority: 'medium',
              title: 'Adjust portion size to maintain target margin',
              description: 'Consider reducing portion size by 5% to offset ingredient cost increases.',
              potentialSaving: { amount: 89.25, currency: 'USD' }
            }
          ] : undefined,
          historical: queryParams.includeHistorical ? {
            previousPeriod: {
              totalAlerts: 18,
              criticalAlerts: 2,
              totalImpact: 234.67
            },
            trend: 'increasing',
            patternAnalysis: 'Ingredient cost volatility increased 23% compared to previous period'
          } : undefined
        }

        // Log successful alerts retrieval
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_cost_alerts',
          action: 'alerts_retrieved',
          recipeId,
          totalAlerts: summary.totalAlerts,
          criticalAlerts: summary.bySeverity.critical,
          totalImpact: summary.totalImpact
        })

        // Create response
        const response = createSecureResponse(
          {
            success: true,
            data: responseData,
            metadata: {
              recipeId,
              period: queryParams.period,
              filters: {
                severity: queryParams.severity,
                status: queryParams.status,
                alertType: queryParams.alertType
              },
              generatedAt: new Date().toISOString(),
              cacheTtl: 300 // 5 minutes for alerts
            }
          }
        )

        // Add metadata headers
        response.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes
        response.headers.set('X-Recipe-Id', recipeId)
        response.headers.set('X-Total-Alerts', summary.totalAlerts.toString())
        response.headers.set('X-Critical-Alerts', summary.bySeverity.critical.toString())
        response.headers.set('X-Total-Impact', summary.totalImpact.toString())

        return response

      } catch (error) {
        console.error('Error in GET /api/recipes/[id]/cost-alerts:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          recipeId: params.id,
          stack: error instanceof Error ? error.stack : undefined
        })

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        )
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 0, // No body for GET requests
      validateOrigin: false // Allow cross-origin GET requests
    },
    corsConfig: {
      methods: ['GET'],
      exposedHeaders: ['X-Recipe-Id', 'X-Total-Alerts', 'X-Critical-Alerts', 'X-Total-Impact']
    }
  }
)

// Helper function to generate mock cost alerts
function generateMockCostAlerts(recipeId: string, params: any, since: Date, until: Date) {
  const alertTypes = ['price_increase', 'price_decrease', 'threshold_breach', 'variance', 'availability', 'quality'] as const
  const severities = ['critical', 'high', 'medium', 'low'] as const
  const statuses = ['active', 'acknowledged', 'resolved'] as const
  
  const alerts = []
  
  // Generate 25 mock alerts
  for (let i = 0; i < 25; i++) {
    const timestamp = new Date(since.getTime() + Math.random() * (until.getTime() - since.getTime()))
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    alerts.push({
      id: `alert_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
      recipeId,
      type,
      severity,
      status,
      timestamp: timestamp.toISOString(),
      title: generateAlertTitle(type, severity),
      message: generateAlertMessage(type),
      ingredientId: `ing_${Math.floor(Math.random() * 5) + 1}`,
      ingredientName: ['Ground Beef', 'Brioche Bun', 'Aged Cheddar', 'Fresh Tomato', 'Lettuce'][Math.floor(Math.random() * 5)],
      variancePercent: type.includes('price') || type === 'variance' ? (Math.random() - 0.5) * 40 : undefined,
      impactAmount: { amount: Math.random() * 200, currency: 'USD' },
      threshold: type === 'threshold_breach' ? {
        type: 'cost_increase',
        value: 10,
        actual: 12.5
      } : undefined,
      supplier: ['Premium Meat Co.', 'Local Butcher', 'Artisan Bakery', 'Dairy Delights', 'Fresh Farms'][Math.floor(Math.random() * 5)],
      acknowledgedBy: status !== 'active' ? user.id : undefined,
      acknowledgedAt: status !== 'active' ? new Date(timestamp.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
      resolvedAt: status === 'resolved' ? new Date(timestamp.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString() : undefined,
      actions: [
        'Review supplier contract',
        'Compare alternative suppliers',
        'Adjust portion size',
        'Update menu pricing'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    })
  }
  
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateAlertTitle(type: string, severity: string) {
  const titles = {
    price_increase: `${severity.charAt(0).toUpperCase() + severity.slice(1)} price increase detected`,
    price_decrease: `${severity.charAt(0).toUpperCase() + severity.slice(1)} price decrease detected`,
    threshold_breach: `Cost threshold breach - ${severity} level`,
    variance: `${severity.charAt(0).toUpperCase() + severity.slice(1)} cost variance alert`,
    availability: `Ingredient availability ${severity} alert`,
    quality: `Quality ${severity} alert detected`
  }
  return titles[type as keyof typeof titles] || 'Cost monitoring alert'
}

function generateAlertMessage(type: string) {
  const messages = {
    price_increase: 'Ingredient price has increased significantly from the last recorded price',
    price_decrease: 'Ingredient price has decreased significantly from the last recorded price',
    threshold_breach: 'Recipe cost has exceeded the predefined threshold limit',
    variance: 'Cost variance has exceeded acceptable limits compared to historical average',
    availability: 'Ingredient availability issues detected that may impact cost',
    quality: 'Quality concerns detected that may require ingredient substitution'
  }
  return messages[type as keyof typeof messages] || 'Cost monitoring alert detected'
}

// Apply rate limiting
export const GET = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 200, // 200 alert requests per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `recipe-cost-alerts:${req.headers.get('authorization') || req.ip}`
})(getCostAlerts)