import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { Policy } from '@/lib/types/permissions'

const prisma = new PrismaClient()

// Validation schema for policy updates
const updatePolicySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  effect: z.enum(['permit', 'deny']).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
  combiningAlgorithm: z.enum(['deny_overrides', 'permit_overrides', 'first_applicable', 'only_one_applicable']).optional(),
  policyData: z.object({
    target: z.object({
      subjects: z.array(z.object({
        type: z.string(),
        values: z.array(z.any())
      })).optional(),
      resources: z.array(z.object({
        type: z.string(),
        attributes: z.record(z.any()).optional()
      })).optional(),
      actions: z.array(z.string()).optional(),
      environment: z.array(z.object({
        attribute: z.string(),
        operator: z.string(),
        value: z.any()
      })).optional()
    }),
    rules: z.array(z.object({
      id: z.string(),
      name: z.string(),
      priority: z.number().optional(),
      condition: z.object({
        type: z.string(),
        expressions: z.array(z.any()).optional(),
        attribute: z.string().optional(),
        operator: z.string().optional(),
        value: z.any().optional()
      })
    })),
    obligations: z.array(z.object({
      type: z.string(),
      description: z.string(),
      parameters: z.record(z.any())
    })).optional(),
    advice: z.array(z.object({
      type: z.string(),
      message: z.string(),
      parameters: z.record(z.any()).optional()
    })).optional()
  }).optional(),
  tags: z.array(z.string()).optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional()
})

interface RouteParams {
  policyId: string
}

/**
 * GET /api/policies/[policyId] - Get a specific policy by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { policyId } = params

    if (!policyId) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        assignedRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        },
        evaluationLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            finalDecision: true,
            evaluationTime: true,
            createdAt: true
          }
        },
        testResults: {
          take: 10,
          orderBy: { executedAt: 'desc' },
          select: {
            id: true,
            passed: true,
            score: true,
            executionTime: true,
            executedAt: true,
            executedBy: true
          }
        },
        performanceMetrics: {
          take: 30,
          orderBy: { metricDate: 'desc' }
        }
      }
    })

    if (!policy) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }

    // Transform to API format
    const transformedPolicy = {
      id: policy.id,
      name: policy.name,
      description: policy.description,
      priority: policy.priority,
      effect: policy.effect.toLowerCase(),
      status: policy.status.toLowerCase(),
      combiningAlgorithm: policy.combiningAlgorithm.toLowerCase(),
      policyData: policy.policyData,
      version: policy.version,
      tags: policy.tags,
      validFrom: policy.validFrom,
      validTo: policy.validTo,
      createdBy: policy.createdBy,
      updatedBy: policy.updatedBy,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      
      // Related data
      assignedRoles: policy.assignedRoles.map(assignment => ({
        assignmentId: assignment.id,
        role: assignment.role,
        context: assignment.context,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt
      })),
      
      recentEvaluations: policy.evaluationLogs.map(log => ({
        id: log.id,
        decision: log.finalDecision.toLowerCase(),
        evaluationTime: log.evaluationTime,
        timestamp: log.createdAt
      })),
      
      recentTests: policy.testResults.map(test => ({
        id: test.id,
        passed: test.passed,
        score: test.score,
        executionTime: test.executionTime,
        executedAt: test.executedAt,
        executedBy: test.executedBy
      })),
      
      performanceData: policy.performanceMetrics.length > 0 ? {
        recentMetrics: policy.performanceMetrics,
        summary: {
          averageEvaluationTime: policy.performanceMetrics.reduce((acc, metric: any) => {
            const data = metric.performanceData as any
            return acc + (data?.evaluation?.averageEvaluationTime || 0)
          }, 0) / policy.performanceMetrics.length,
          totalEvaluations: policy.performanceMetrics.reduce((acc, metric: any) => {
            const data = metric.performanceData as any
            return acc + (data?.evaluation?.totalEvaluations || 0)
          }, 0)
        }
      } : null
    }

    return NextResponse.json({
      success: true,
      data: transformedPolicy
    })

  } catch (error) {
    console.error('GET /api/policies/[policyId] error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch policy'
    }, { status: 500 })
  }
}

/**
 * PUT /api/policies/[policyId] - Update a specific policy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { policyId } = params
    const body = await request.json()

    if (!policyId) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }

    const validatedData = updatePolicySchema.parse(body)

    // Check if policy exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { id: policyId }
    })

    if (!existingPolicy) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }

    // Check for name conflicts if name is being updated
    if (validatedData.name && validatedData.name !== existingPolicy.name) {
      const nameConflict = await prisma.policy.findFirst({
        where: {
          name: validatedData.name,
          id: { not: policyId }
        }
      })

      if (nameConflict) {
        return NextResponse.json({
          success: false,
          error: 'Policy with this name already exists'
        }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedBy: 'system', // TODO: Get from session
      updatedAt: new Date()
    }

    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.effect) updateData.effect = validatedData.effect.toUpperCase()
    if (validatedData.status) updateData.status = validatedData.status.toUpperCase()
    if (validatedData.combiningAlgorithm) updateData.combiningAlgorithm = validatedData.combiningAlgorithm.toUpperCase()
    if (validatedData.policyData) updateData.policyData = validatedData.policyData
    if (validatedData.tags) updateData.tags = validatedData.tags
    if (validatedData.validFrom) updateData.validFrom = new Date(validatedData.validFrom)
    if (validatedData.validTo) updateData.validTo = new Date(validatedData.validTo)

    // Update the policy
    const updatedPolicy = await prisma.policy.update({
      where: { id: policyId },
      data: updateData
    })

    // Clear permission cache for affected users/roles
    await prisma.$executeRaw`DELETE FROM abac_permission_cache WHERE created_at < NOW()`

    // Log the update
    await prisma.auditLog.create({
      data: {
        eventType: 'POLICY_UPDATED',
        eventCategory: 'POLICY',
        eventData: {
          actor: {
            userId: 'system', // TODO: Get from session
            action: 'UPDATE'
          },
          resource: {
            resourceType: 'policy',
            resourceId: policyId,
            resourceName: updatedPolicy.name
          },
          changes: {
            changeType: 'UPDATE',
            oldValues: {
              name: existingPolicy.name,
              priority: existingPolicy.priority,
              status: existingPolicy.status
            },
            newValues: {
              name: updatedPolicy.name,
              priority: updatedPolicy.priority,
              status: updatedPolicy.status
            },
            fieldsChanged: Object.keys(validatedData)
          }
        },
        success: true,
        complianceFlags: ['AUDIT_REQUIRED'],
        source: 'api'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPolicy.id,
        name: updatedPolicy.name,
        description: updatedPolicy.description,
        priority: updatedPolicy.priority,
        effect: updatedPolicy.effect.toLowerCase(),
        status: updatedPolicy.status.toLowerCase(),
        version: updatedPolicy.version,
        updatedAt: updatedPolicy.updatedAt
      }
    })

  } catch (error) {
    console.error('PUT /api/policies/[policyId] error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid policy data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update policy'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/policies/[policyId] - Delete (archive) a specific policy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { policyId } = params

    if (!policyId) {
      return NextResponse.json({
        success: false,
        error: 'Policy ID is required'
      }, { status: 400 })
    }

    // Check if policy exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        assignedRoles: true,
        evaluationLogs: { take: 1 }
      }
    })

    if (!existingPolicy) {
      return NextResponse.json({
        success: false,
        error: 'Policy not found'
      }, { status: 404 })
    }

    // Check if policy can be safely deleted
    const hasActiveAssignments = existingPolicy.assignedRoles.length > 0
    const hasEvaluationHistory = existingPolicy.evaluationLogs.length > 0

    if (hasActiveAssignments || hasEvaluationHistory) {
      // Archive instead of delete to preserve history
      const archivedPolicy = await prisma.policy.update({
        where: { id: policyId },
        data: {
          status: 'ARCHIVED',
          updatedBy: 'system', // TODO: Get from session
          updatedAt: new Date()
        }
      })

      // Log archival
      await prisma.auditLog.create({
        data: {
          eventType: 'POLICY_ARCHIVED',
          eventCategory: 'POLICY',
          eventData: {
            actor: {
              userId: 'system',
              action: 'ARCHIVE'
            },
            resource: {
              resourceType: 'policy',
              resourceId: policyId,
              resourceName: existingPolicy.name
            },
            reason: hasActiveAssignments ? 'Has active role assignments' : 'Has evaluation history'
          },
          success: true,
          complianceFlags: ['AUDIT_REQUIRED'],
          source: 'api'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: archivedPolicy.id,
          name: archivedPolicy.name,
          status: 'archived',
          message: 'Policy archived due to active assignments or evaluation history'
        }
      })
    } else {
      // Safe to hard delete
      await prisma.policy.delete({
        where: { id: policyId }
      })

      // Log deletion
      await prisma.auditLog.create({
        data: {
          eventType: 'POLICY_DELETED',
          eventCategory: 'POLICY',
          eventData: {
            actor: {
              userId: 'system',
              action: 'DELETE'
            },
            resource: {
              resourceType: 'policy',
              resourceId: policyId,
              resourceName: existingPolicy.name
            }
          },
          success: true,
          complianceFlags: ['AUDIT_REQUIRED'],
          source: 'api'
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: policyId,
          message: 'Policy permanently deleted'
        }
      })
    }

  } catch (error) {
    console.error('DELETE /api/policies/[policyId] error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete policy'
    }, { status: 500 })
  }
}