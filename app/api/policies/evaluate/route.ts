import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { enhancedPermissionService } from '@/lib/services/permissions/enhanced-permission-service'
import { PolicyEvaluationTrace, PolicyTestResult } from '@/lib/types/policy-builder'
import { AccessRequest, AccessDecision, EffectType } from '@/lib/types/permissions'

const prisma = new PrismaClient()

// Validation schemas
const evaluationRequestSchema = z.object({
  // Subject (user) information
  userId: z.string().min(1),
  
  // Resource information
  resourceType: z.string().min(1),
  resourceId: z.string().optional(),
  
  // Action to perform
  action: z.string().min(1),
  
  // Additional context
  context: z.object({
    department: z.string().optional(),
    location: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional(),
    requestId: z.string().optional(),
    additionalAttributes: z.record(z.any()).optional()
  }).optional(),
  
  // Evaluation options
  options: z.object({
    includeTrace: z.boolean().default(false),
    includeObligations: z.boolean().default(true),
    includeAdvice: z.boolean().default(true),
    resolveAttributes: z.boolean().default(true),
    enableCaching: z.boolean().default(true),
    auditEnabled: z.boolean().default(true),
    evaluationTimeout: z.number().min(100).max(30000).default(5000) // milliseconds
  }).optional().default({})
})

const batchEvaluationSchema = z.object({
  requests: z.array(evaluationRequestSchema).min(1).max(100),
  options: z.object({
    failFast: z.boolean().default(false),
    maxConcurrency: z.number().min(1).max(10).default(5),
    includeTrace: z.boolean().default(false),
    auditEnabled: z.boolean().default(true)
  }).optional().default({})
})

/**
 * POST /api/policies/evaluate - Evaluate a single access request against ABAC policies
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const validatedRequest = evaluationRequestSchema.parse(body)

    // Create enhanced permission check request
    const permissionRequest = {
      userId: validatedRequest.userId,
      resourceType: validatedRequest.resourceType,
      resourceId: validatedRequest.resourceId,
      action: validatedRequest.action,
      context: validatedRequest.context,
      options: validatedRequest.options
    }

    // Perform the evaluation
    const result = await enhancedPermissionService.checkPermission(permissionRequest)

    // Build evaluation trace if requested
    let evaluationTrace: PolicyEvaluationTrace[] = []
    if (validatedRequest.options?.includeTrace) {
      evaluationTrace = await buildEvaluationTrace(result, validatedRequest)
    }

    // Build response
    const evaluationResult = {
      requestId: validatedRequest.context?.requestId || `eval_${Date.now()}`,
      allowed: result.allowed,
      effect: result.allowed ? 'permit' : 'deny' as EffectType,
      reason: result.reason,
      
      // Policy information
      matchedPolicies: result.matchedPolicies,
      evaluatedPolicies: result.decision.evaluatedPolicies.length,
      
      // Performance metrics
      evaluationTime: result.executionTime,
      attributeResolutionTime: result.attributeResolutionTime,
      totalTime: Date.now() - startTime,
      cacheHit: false, // TODO: Implement cache hit detection
      
      // Additional information if requested
      obligations: validatedRequest.options?.includeObligations ? result.decision.evaluatedPolicies
        .flatMap(p => p.obligations || [])
        : undefined,

      advice: validatedRequest.options?.includeAdvice ? result.decision.evaluatedPolicies
        .flatMap(p => p.advice || [])
        : undefined,
      
      evaluationTrace: validatedRequest.options?.includeTrace ? evaluationTrace : undefined,
      
      // Debug information
      debugInfo: {
        resolvedAttributes: result.resolvedAttributes ? Object.keys(result.resolvedAttributes).length : 0,
        auditLogId: result.auditLogId
      }
    }

    return NextResponse.json({
      success: true,
      data: evaluationResult
    })

  } catch (error) {
    console.error('POST /api/policies/evaluate error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid evaluation request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Policy evaluation failed',
      evaluationTime: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * PUT /api/policies/evaluate - Batch evaluation of multiple access requests
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const validatedBatch = batchEvaluationSchema.parse(body)

    const results = []
    const errors = []

    // Process requests with controlled concurrency
    const semaphore = new Semaphore(validatedBatch.options.maxConcurrency)
    
    const promises = validatedBatch.requests.map(async (req, index) => {
      return await semaphore.acquire(async () => {
        try {
          const permissionRequest = {
            userId: req.userId,
            resourceType: req.resourceType,
            resourceId: req.resourceId,
            action: req.action,
            context: req.context,
            options: {
              ...req.options,
              includeTrace: validatedBatch.options.includeTrace,
              auditEnabled: validatedBatch.options.auditEnabled
            }
          }

          const result = await enhancedPermissionService.checkPermission(permissionRequest)

          return {
            index,
            success: true,
            data: {
              requestId: req.context?.requestId || `batch_${index}_${Date.now()}`,
              allowed: result.allowed,
              effect: result.allowed ? 'permit' : 'deny' as EffectType,
              reason: result.reason,
              matchedPolicies: result.matchedPolicies,
              evaluationTime: result.executionTime,
              auditLogId: result.auditLogId
            }
          }
        } catch (error) {
          const errorResult = {
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: {
              requestId: req.context?.requestId || `batch_${index}_${Date.now()}`,
              allowed: false,
              effect: 'deny' as EffectType,
              reason: 'Evaluation error'
            }
          }

          if (validatedBatch.options.failFast) {
            throw error
          }

          return errorResult
        }
      })
    })

    try {
      const batchResults = await Promise.all(promises)
      
      // Sort results by original order
      batchResults.sort((a, b) => a.index - b.index)
      
      const successful = batchResults.filter(r => r.success)
      const failed = batchResults.filter(r => !r.success)

      return NextResponse.json({
        success: true,
        data: {
          results: batchResults.map(r => r.data),
          summary: {
            total: validatedBatch.requests.length,
            successful: successful.length,
            failed: failed.length,
            totalTime: Date.now() - startTime,
            averageTime: successful.length > 0
              ? successful.reduce((sum, r) => {
                  const evalTime = 'evaluationTime' in r.data ? r.data.evaluationTime : 0
                  return sum + (evalTime || 0)
                }, 0) / successful.length
              : 0
          },
          errors: failed.map(f => ({
            index: f.index,
            error: 'error' in f ? f.error : 'Unknown error'
          }))
        }
      })

    } catch (error) {
      // Handle fail-fast case
      return NextResponse.json({
        success: false,
        error: 'Batch evaluation failed (fail-fast mode)',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('PUT /api/policies/evaluate error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid batch evaluation request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Batch policy evaluation failed',
      evaluationTime: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * Build detailed evaluation trace for debugging
 */
async function buildEvaluationTrace(
  result: any, 
  request: any
): Promise<PolicyEvaluationTrace[]> {
  const traces: PolicyEvaluationTrace[] = []

  if (result.decision?.evaluatedPolicies) {
    for (const policyResult of result.decision.evaluatedPolicies) {
      const policy = await prisma.policy.findUnique({
        where: { id: policyResult.policyId },
        select: { name: true, effect: true }
      })

      if (policy) {
        traces.push({
          policyId: policyResult.policyId,
          policyName: policy.name,
          effect: policyResult.matches ? policy.effect.toLowerCase() as EffectType : 'not_applicable',
          evaluationSteps: [
            {
              stepNumber: 1,
              stepType: 'target_match',
              description: 'Checking if policy target matches request',
              result: policyResult.matches,
              executionTime: 0 // TODO: Get actual step timing
            },
            {
              stepNumber: 2,
              stepType: 'rule_evaluation',
              description: 'Evaluating policy rules',
              result: policyResult.matches,
              executionTime: 0
            },
            {
              stepNumber: 3,
              stepType: 'final_decision',
              description: 'Determining final policy decision',
              result: policyResult.matches,
              executionTime: 0
            }
          ],
          executionTime: result.executionTime || 0,
          finalResult: policyResult.matches
        })
      }
    }
  }

  return traces
}

/**
 * Simple semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--
        this.executeTask(task, resolve, reject)
      } else {
        this.waiting.push(() => {
          this.permits--
          this.executeTask(task, resolve, reject)
        })
      }
    })
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (reason?: any) => void
  ) {
    try {
      const result = await task()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.permits++
      if (this.waiting.length > 0) {
        const next = this.waiting.shift()
        if (next) next()
      }
    }
  }
}