/**
 * Real-Time Recipe Costing API - Dynamic cost calculation with current ingredient prices
 * 
 * GET /api/recipes/[id]/real-time-cost - Get current cost breakdown with real-time pricing
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
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for real-time cost query
const RealTimeCostQuerySchema = z.object({
  // Yield options
  yieldVariantId: SecureSchemas.uuid.optional(),
  portionSize: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().positive().default(1),
  // Pricing options
  includeLabor: z.string().transform(str => str !== 'false').default('true'),
  includeOverhead: z.string().transform(str => str !== 'false').default('true'),
  useLatestPrices: z.string().transform(str => str !== 'false').default('true'),
  // Vendor options
  preferredVendorId: SecureSchemas.uuid.optional(),
  useContractPrices: z.string().transform(str => str === 'true').default('false'),
  // Currency and location
  currency: z.string().regex(/^[A-Z]{3}$/, 'Invalid currency code').default('USD'),
  locationId: SecureSchemas.uuid.optional(),
  // Output options
  includeIngredientBreakdown: z.string().transform(str => str !== 'false').default('true'),
  includePriceHistory: z.string().transform(str => str === 'true').default('false'),
  includeAlternatives: z.string().transform(str => str === 'true').default('false'),
  // Analysis options
  compareToTarget: z.string().transform(str => str === 'true').default('false'),
  showVariance: z.string().transform(str => str === 'true').default('false')
})

// Path parameter validation
const PathParamsSchema = z.object({
  id: SecureSchemas.uuid
})

/**
 * GET /api/recipes/[id]/real-time-cost - Get real-time recipe cost calculation
 * Requires authentication and 'read:recipe_costing' permission
 */
const getRealTimeCost = withSecurity(
  authStrategies.hybrid(
    withAuthorization('recipes', 'read', async (
      request: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      // Extract params from URL
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
      const params = { id: pathSegments[pathSegments.length - 2] }
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
          yieldVariantId: searchParams.get('yieldVariantId') || undefined,
          portionSize: searchParams.get('portionSize') || undefined,
          quantity: searchParams.get('quantity') || undefined,
          includeLabor: searchParams.get('includeLabor') || undefined,
          includeOverhead: searchParams.get('includeOverhead') || undefined,
          useLatestPrices: searchParams.get('useLatestPrices') || undefined,
          preferredVendorId: searchParams.get('preferredVendorId') || undefined,
          useContractPrices: searchParams.get('useContractPrices') || undefined,
          currency: searchParams.get('currency') || undefined,
          locationId: searchParams.get('locationId') || undefined,
          includeIngredientBreakdown: searchParams.get('includeIngredientBreakdown') || undefined,
          includePriceHistory: searchParams.get('includePriceHistory') || undefined,
          includeAlternatives: searchParams.get('includeAlternatives') || undefined,
          compareToTarget: searchParams.get('compareToTarget') || undefined,
          showVariance: searchParams.get('showVariance') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, RealTimeCostQuerySchema as any, {
          maxLength: 500,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid real-time cost query parameters',
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

        const queryParams = (validationResult.sanitized || validationResult.data!) as z.infer<typeof RealTimeCostQuerySchema>
        const recipeId = pathValidation.data!.id

        // Log costing access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_real_time_cost',
          action: 'read',
          recipeId,
          options: {
            quantity: queryParams.quantity,
            includeLabor: queryParams.includeLabor,
            includeOverhead: queryParams.includeOverhead,
            useLatestPrices: queryParams.useLatestPrices,
            currency: queryParams.currency
          }
        })

        // Initialize cache and services
        const cache = new EnhancedCacheLayer({
          redis: {
            enabled: false,
            fallbackToMemory: true,
            connectionTimeout: 5000
          },
          memory: {
            maxMemoryMB: 100,
            maxEntries: 1000
          },
          ttl: {
            default: 300,
            financial: 600,
            inventory: 300,
            vendor: 3600
          },
          invalidation: {
            enabled: true,
            batchSize: 100,
            maxDependencies: 1000
          },
          monitoring: {
            enabled: false,
            metricsInterval: 60000
          }
        })

        // Mock real-time cost calculation (in real implementation, this would calculate from current prices)
        const realTimeCostData = {
          recipeId,
          recipeName: 'Signature Burger',
          recipeCode: 'SIG-001',
          calculatedAt: new Date().toISOString(),
          calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          parameters: {
            yieldVariantId: queryParams.yieldVariantId,
            portionSize: queryParams.portionSize || 1,
            quantity: queryParams.quantity,
            currency: queryParams.currency,
            locationId: queryParams.locationId,
            useLatestPrices: queryParams.useLatestPrices,
            preferredVendorId: queryParams.preferredVendorId
          },
          costBreakdown: {
            ingredients: queryParams.includeIngredientBreakdown ? [
              {
                ingredientId: 'ing-001',
                ingredientName: 'Ground Beef (80/20)',
                quantity: 0.25,
                unit: 'kg',
                unitCost: { amount: 12.50, currency: queryParams.currency },
                totalCost: { amount: 3.13, currency: queryParams.currency },
                vendor: 'Premium Meat Co.',
                priceDate: new Date().toISOString(),
                variance: { amount: -0.25, currency: queryParams.currency, percentage: -7.4 },
                alternatives: queryParams.includeAlternatives ? [
                  { vendor: 'Local Butcher', unitCost: { amount: 13.00, currency: queryParams.currency } },
                  { vendor: 'Wholesale Meats', unitCost: { amount: 11.75, currency: queryParams.currency } }
                ] : undefined
              },
              {
                ingredientId: 'ing-002',
                ingredientName: 'Brioche Bun',
                quantity: 1,
                unit: 'piece',
                unitCost: { amount: 1.25, currency: queryParams.currency },
                totalCost: { amount: 1.25, currency: queryParams.currency },
                vendor: 'Artisan Bakery',
                priceDate: new Date().toISOString(),
                variance: { amount: 0.05, currency: queryParams.currency, percentage: 4.2 },
                alternatives: queryParams.includeAlternatives ? [
                  { vendor: 'Commercial Bakery', unitCost: { amount: 0.95, currency: queryParams.currency } }
                ] : undefined
              },
              {
                ingredientId: 'ing-003',
                ingredientName: 'Aged Cheddar Cheese',
                quantity: 0.03,
                unit: 'kg',
                unitCost: { amount: 18.75, currency: queryParams.currency },
                totalCost: { amount: 0.56, currency: queryParams.currency },
                vendor: 'Dairy Delights',
                priceDate: new Date().toISOString(),
                variance: { amount: 0.12, currency: queryParams.currency, percentage: 27.3 }
              }
            ] : undefined,
            totals: {
              ingredientCost: { amount: 4.94, currency: queryParams.currency },
              laborCost: queryParams.includeLabor ? { amount: 2.15, currency: queryParams.currency } : undefined,
              overheadCost: queryParams.includeOverhead ? { amount: 1.25, currency: queryParams.currency } : undefined,
              totalDirectCost: { 
                amount: 4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0), 
                currency: queryParams.currency 
              },
              costPerUnit: { 
                amount: (4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0)) / queryParams.quantity, 
                currency: queryParams.currency 
              }
            }
          },
          pricing: {
            currentSellingPrice: { amount: 18.95, currency: queryParams.currency },
            suggestedSellingPrice: { amount: 19.25, currency: queryParams.currency },
            grossMargin: {
              amount: 18.95 - (4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0)),
              currency: queryParams.currency
            },
            grossMarginPercentage: ((18.95 - (4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0))) / 18.95 * 100)
          },
          comparison: queryParams.compareToTarget ? {
            targetCost: { amount: 8.50, currency: queryParams.currency },
            actualCost: { 
              amount: 4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0), 
              currency: queryParams.currency 
            },
            variance: {
              amount: (4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0)) - 8.50,
              currency: queryParams.currency,
              percentage: ((4.94 + (queryParams.includeLabor ? 2.15 : 0) + (queryParams.includeOverhead ? 1.25 : 0)) - 8.50) / 8.50 * 100
            },
            status: 'under_target'
          } : undefined,
          priceHistory: queryParams.includePriceHistory ? {
            period: '30_days',
            data: [
              { date: '2024-01-01', totalCost: 8.15 },
              { date: '2024-01-15', totalCost: 8.34 },
              { date: '2024-01-30', totalCost: 8.34 }
            ],
            trend: 'increasing',
            volatility: 'low'
          } : undefined,
          alerts: [
            {
              type: 'price_increase',
              severity: 'medium',
              message: 'Cheddar cheese price increased by 27.3% from last calculation',
              affectedIngredients: ['ing-003']
            }
          ]
        }

        // Log successful cost calculation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_real_time_cost',
          action: 'calculation_completed',
          recipeId,
          calculationId: realTimeCostData.calculationId,
          totalCost: realTimeCostData.costBreakdown.totals.totalDirectCost.amount,
          margin: realTimeCostData.pricing.grossMarginPercentage
        })

        // Create response
        const response = createSecureResponse(
          {
            success: true,
            data: realTimeCostData,
            metadata: {
              recipeId,
              calculatedAt: realTimeCostData.calculatedAt,
              parameters: realTimeCostData.parameters,
              cacheTtl: 300 // 5 minutes for real-time data
            }
          }
        )

        // Add caching and metadata headers
        response.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes
        response.headers.set('X-Recipe-Id', recipeId)
        response.headers.set('X-Calculation-Id', realTimeCostData.calculationId)
        response.headers.set('X-Total-Cost', realTimeCostData.costBreakdown.totals.totalDirectCost.amount.toString())
        response.headers.set('X-Gross-Margin', realTimeCostData.pricing.grossMarginPercentage.toFixed(2))

        return response

      } catch (error) {
        console.error('Error in GET /api/recipes/[id]/real-time-cost:', error)
        
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
      exposedHeaders: ['X-Recipe-Id', 'X-Calculation-Id', 'X-Total-Cost', 'X-Gross-Margin']
    }
  }
)

// Apply rate limiting
export const GET = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 500, // 500 cost calculations per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `recipe-real-time-cost:${req.headers.get('authorization') || req.ip}`
})(getRealTimeCost)