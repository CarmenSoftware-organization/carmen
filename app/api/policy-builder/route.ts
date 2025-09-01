import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { 
  PolicyBuilderState, 
  PolicyBuilderValidation, 
  ValidationError, 
  ValidationWarning,
  ConditionTemplate,
  PolicyDashboardStats
} from '@/lib/types/policy-builder'

const prisma = new PrismaClient()

// Validation schemas
const policyBuilderStateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.number().int().min(0).max(1000).default(500),
  enabled: z.boolean().default(true),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Conditions
  subjectConditions: z.array(z.object({
    attribute: z.string(),
    operator: z.string(),
    value: z.any(),
    description: z.string().optional()
  })).default([]),
  
  resourceConditions: z.array(z.object({
    attribute: z.string(),
    operator: z.string(),
    value: z.any(),
    description: z.string().optional()
  })).default([]),
  
  actionConditions: z.array(z.string()).default([]),
  
  environmentConditions: z.array(z.object({
    attribute: z.string(),
    operator: z.string(),
    value: z.any(),
    description: z.string().optional()
  })).default([]),
  
  // Rules
  rules: z.array(z.object({
    id: z.string(),
    description: z.string(),
    condition: z.object({
      type: z.enum(['simple', 'composite']),
      attribute: z.string().optional(),
      operator: z.string().optional(),
      value: z.any().optional(),
      expressions: z.array(z.any()).optional(),
      logicalOperator: z.enum(['AND', 'OR', 'NOT']).optional()
    })
  })).default([]),
  
  effect: z.enum(['permit', 'deny']),
  logicalOperator: z.enum(['AND', 'OR', 'NOT']).default('AND'),
  
  // Test scenarios
  testScenarios: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    subjectAttributes: z.record(z.any()),
    resourceAttributes: z.record(z.any()),
    environmentAttributes: z.record(z.any()),
    action: z.string(),
    expectedResult: z.enum(['permit', 'deny'])
  })).default([]),
  
  // Metadata
  version: z.string().default('1.0'),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional()
})

const validationRequestSchema = z.object({
  policyBuilderState: policyBuilderStateSchema,
  validationLevel: z.enum(['basic', 'comprehensive', 'performance']).default('basic')
})

const templateRequestSchema = z.object({
  category: z.string().optional(),
  resourceType: z.string().optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
  tags: z.array(z.string()).optional()
})

/**
 * GET /api/policy-builder - Get policy builder dashboard stats and templates
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'dashboard'

    switch (action) {
      case 'dashboard':
        return await getDashboardStats()
      
      case 'templates':
        return await getConditionTemplates(request)
      
      case 'validation-rules':
        return await getValidationRules()
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('GET /api/policy-builder error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 })
  }
}

/**
 * POST /api/policy-builder - Validate policy builder state
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedRequest = validationRequestSchema.parse(body)

    const validation = await validatePolicyBuilderState(
      validatedRequest.policyBuilderState,
      validatedRequest.validationLevel
    )

    return NextResponse.json({
      success: true,
      data: validation
    })

  } catch (error) {
    console.error('POST /api/policy-builder error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid validation request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Validation failed'
    }, { status: 500 })
  }
}

/**
 * PUT /api/policy-builder - Convert policy builder state to policy and save
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { policyBuilderState, saveAsDraft = false } = body
    
    const validatedState = policyBuilderStateSchema.parse(policyBuilderState)

    // Validate the policy state
    const validation = await validatePolicyBuilderState(validatedState, 'comprehensive')
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Policy validation failed',
        validation
      }, { status: 400 })
    }

    // Convert policy builder state to policy data format
    const policyData = convertBuilderStateToPolicyData(validatedState)

    // Check for name conflicts
    const existingPolicy = await prisma.policy.findUnique({
      where: { name: validatedState.name }
    })

    if (existingPolicy) {
      return NextResponse.json({
        success: false,
        error: 'Policy with this name already exists'
      }, { status: 409 })
    }

    // Create the policy
    const policy = await prisma.policy.create({
      data: {
        name: validatedState.name,
        description: validatedState.description,
        priority: validatedState.priority,
        effect: validatedState.effect.toUpperCase() as any,
        status: saveAsDraft ? 'DRAFT' : 'ACTIVE',
        combiningAlgorithm: 'DENY_OVERRIDES', // Default
        policyData,
        version: validatedState.version,
        tags: validatedState.tags,
        validFrom: validatedState.effectiveFrom ? new Date(validatedState.effectiveFrom) : null,
        validTo: validatedState.effectiveTo ? new Date(validatedState.effectiveTo) : null,
        createdBy: 'system', // TODO: Get from session
        updatedBy: 'system'
      }
    })

    // Create test scenarios if provided
    for (const scenario of validatedState.testScenarios) {
      await prisma.policyTestScenario.create({
        data: {
          name: `${validatedState.name} - ${scenario.name}`,
          description: scenario.description,
          category: validatedState.category || 'policy_builder',
          tags: [...validatedState.tags, 'generated'],
          scenarioData: {
            testInput: {
              subject: {
                userId: scenario.id, // Placeholder
                attributes: scenario.subjectAttributes
              },
              resource: {
                resourceType: 'test_resource',
                resourceId: scenario.id,
                attributes: scenario.resourceAttributes
              },
              action: {
                actionType: scenario.action,
                attributes: {}
              },
              environment: {
                attributes: scenario.environmentAttributes
              }
            },
            expectedOutput: {
              decision: scenario.expectedResult
            },
            testMetadata: {
              generatedFrom: 'policy_builder',
              policyId: policy.id
            }
          },
          createdBy: 'system'
        }
      })
    }

    // Log policy creation
    await prisma.auditLog.create({
      data: {
        eventType: 'POLICY_CREATED_VIA_BUILDER',
        eventCategory: 'POLICY',
        eventData: {
          actor: {
            userId: 'system',
            action: 'CREATE_VIA_BUILDER'
          },
          resource: {
            resourceType: 'policy',
            resourceId: policy.id,
            resourceName: policy.name
          },
          builderData: {
            subjectConditions: validatedState.subjectConditions.length,
            resourceConditions: validatedState.resourceConditions.length,
            actionConditions: validatedState.actionConditions.length,
            environmentConditions: validatedState.environmentConditions.length,
            rulesCount: validatedState.rules.length,
            testScenariosCount: validatedState.testScenarios.length
          }
        },
        success: true,
        complianceFlags: ['AUDIT_REQUIRED'],
        source: 'policy_builder'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        policyId: policy.id,
        name: policy.name,
        status: policy.status.toLowerCase(),
        createdAt: policy.createdAt,
        testScenariosCreated: validatedState.testScenarios.length
      }
    }, { status: 201 })

  } catch (error) {
    console.error('PUT /api/policy-builder error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid policy builder state',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create policy from builder'
    }, { status: 500 })
  }
}

/**
 * Get dashboard statistics
 */
async function getDashboardStats(): Promise<NextResponse> {
  const [
    totalPolicies,
    activePolicies,
    draftPolicies,
    expiredPolicies,
    recentActivity,
    performanceMetrics
  ] = await Promise.all([
    prisma.policy.count(),
    prisma.policy.count({ where: { status: 'ACTIVE' } }),
    prisma.policy.count({ where: { status: 'DRAFT' } }),
    prisma.policy.count({ 
      where: { 
        validTo: { lt: new Date() },
        status: 'ACTIVE'
      } 
    }),
    prisma.auditLog.findMany({
      where: { 
        eventCategory: 'POLICY',
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      take: 20,
      orderBy: { timestamp: 'desc' }
    }),
    calculatePerformanceMetrics()
  ])

  const stats: PolicyDashboardStats = {
    totalPolicies,
    activePolicies,
    draftPolicies,
    expiredPolicies,
    recentActivity: recentActivity.map(activity => ({
      id: activity.id,
      type: activity.eventType.toLowerCase().replace('policy_', '') as any,
      policyId: (activity.eventData as any)?.resource?.resourceId || 'unknown',
      policyName: (activity.eventData as any)?.resource?.resourceName || 'Unknown Policy',
      userId: (activity.eventData as any)?.actor?.userId || 'system',
      userName: 'System User', // TODO: Resolve user names
      timestamp: activity.timestamp,
      details: activity.eventData
    })),
    performanceMetrics
  }

  return NextResponse.json({
    success: true,
    data: stats
  })
}

/**
 * Get condition templates
 */
async function getConditionTemplates(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const resourceType = url.searchParams.get('resourceType')

  // Get predefined templates
  const templates: ConditionTemplate[] = [
    {
      id: 'dept_manager_approval',
      name: 'Department Manager Approval',
      description: 'Allow department managers to approve requests from their department',
      category: 'approval',
      conditions: [
        {
          attribute: 'subject.role.name',
          operator: '==',
          value: 'department_manager',
          description: 'User must be a department manager'
        },
        {
          attribute: 'subject.department.id',
          operator: '==',
          value: 'resource.ownerDepartment',
          description: 'Same department as resource'
        }
      ],
      tags: ['approval', 'department', 'management'],
      isSystem: true
    },
    {
      id: 'business_hours_only',
      name: 'Business Hours Only',
      description: 'Restrict access to business hours only',
      category: 'temporal',
      conditions: [
        {
          attribute: 'environment.isBusinessHours',
          operator: '==',
          value: true,
          description: 'Must be during business hours'
        }
      ],
      tags: ['time', 'business_hours'],
      isSystem: true
    },
    {
      id: 'value_limit_check',
      name: 'Value Limit Check',
      description: 'Check if resource value is within user approval limit',
      category: 'financial',
      conditions: [
        {
          attribute: 'resource.totalValue.amount',
          operator: '<=',
          value: 'subject.approvalLimit.amount',
          description: 'Resource value must be within approval limit'
        }
      ],
      tags: ['financial', 'approval', 'limit'],
      isSystem: true
    },
    {
      id: 'secure_location_access',
      name: 'Secure Location Access',
      description: 'Require access from secure internal network',
      category: 'security',
      conditions: [
        {
          attribute: 'environment.isInternalNetwork',
          operator: '==',
          value: true,
          description: 'Must be from internal network'
        },
        {
          attribute: 'subject.clearanceLevel',
          operator: 'in',
          value: ['confidential', 'restricted'],
          description: 'Must have appropriate clearance'
        }
      ],
      tags: ['security', 'network', 'clearance'],
      isSystem: true
    }
  ]

  // Filter templates if requested
  let filteredTemplates = templates
  if (category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === category)
  }

  return NextResponse.json({
    success: true,
    data: {
      templates: filteredTemplates,
      categories: [...new Set(templates.map(t => t.category))]
    }
  })
}

/**
 * Get validation rules
 */
async function getValidationRules(): Promise<NextResponse> {
  const validationRules = {
    policy: {
      name: {
        required: true,
        minLength: 1,
        maxLength: 255,
        pattern: '^[a-zA-Z0-9\\s\\-_]+$'
      },
      priority: {
        required: true,
        min: 0,
        max: 1000,
        type: 'integer'
      }
    },
    conditions: {
      maxConditionsPerCategory: 20,
      requiredOperators: {
        string: ['==', '!=', 'contains', 'in'],
        number: ['==', '!=', '>', '<', '>=', '<='],
        boolean: ['==', '!='],
        date: ['==', '!=', '>', '<', '>=', '<=']
      }
    },
    rules: {
      maxRulesPerPolicy: 50,
      maxNestingDepth: 5,
      maxExpressionsPerRule: 10
    },
    performance: {
      maxEvaluationTime: 1000, // ms
      maxAttributeResolutions: 100,
      recommendedPolicyCount: 200
    }
  }

  return NextResponse.json({
    success: true,
    data: validationRules
  })
}

/**
 * Validate policy builder state
 */
async function validatePolicyBuilderState(
  state: any,
  level: 'basic' | 'comprehensive' | 'performance'
): Promise<PolicyBuilderValidation> {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Basic validation
  if (!state.name || state.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Policy name is required',
      type: 'required'
    })
  }

  if (state.name && state.name.length > 255) {
    errors.push({
      field: 'name',
      message: 'Policy name must be 255 characters or less',
      type: 'invalid'
    })
  }

  if (state.priority < 0 || state.priority > 1000) {
    errors.push({
      field: 'priority',
      message: 'Priority must be between 0 and 1000',
      type: 'invalid'
    })
  }

  // Check for at least one condition or rule
  const totalConditions = 
    state.subjectConditions.length + 
    state.resourceConditions.length + 
    state.actionConditions.length + 
    state.environmentConditions.length +
    state.rules.length

  if (totalConditions === 0) {
    errors.push({
      field: 'conditions',
      message: 'Policy must have at least one condition or rule',
      type: 'required'
    })
  }

  if (level === 'comprehensive' || level === 'performance') {
    // Comprehensive validation
    
    // Check condition complexity
    if (state.subjectConditions.length > 20) {
      warnings.push({
        field: 'subjectConditions',
        message: 'Large number of subject conditions may impact performance',
        type: 'performance'
      })
    }

    if (state.rules.length > 50) {
      warnings.push({
        field: 'rules',
        message: 'Large number of rules may impact evaluation performance',
        type: 'performance'
      })
    }

    // Check for conflicting conditions
    const duplicateAttributes = findDuplicateAttributes(state)
    if (duplicateAttributes.length > 0) {
      warnings.push({
        field: 'conditions',
        message: `Duplicate attribute conditions: ${duplicateAttributes.join(', ')}`,
        type: 'best_practice'
      })
    }
  }

  if (level === 'performance') {
    // Performance validation
    const estimatedComplexity = calculatePolicyComplexity(state)
    if (estimatedComplexity > 100) {
      warnings.push({
        field: 'complexity',
        message: 'High policy complexity may result in slow evaluation times',
        type: 'performance'
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Convert policy builder state to policy data format
 */
function convertBuilderStateToPolicyData(state: any): any {
  return {
    target: {
      subjects: state.subjectConditions.map((condition: any) => ({
        type: condition.attribute.split('.')[1], // Extract type from attribute path
        values: Array.isArray(condition.value) ? condition.value : [condition.value]
      })),
      resources: state.resourceConditions.map((condition: any) => ({
        type: condition.attribute.split('.')[1],
        attributes: {
          [condition.attribute]: {
            operator: condition.operator,
            value: condition.value
          }
        }
      })),
      actions: state.actionConditions,
      environment: state.environmentConditions.map((condition: any) => ({
        attribute: condition.attribute,
        operator: condition.operator,
        value: condition.value
      }))
    },
    rules: state.rules,
    obligations: [], // TODO: Add obligation support to builder
    advice: [] // TODO: Add advice support to builder
  }
}

/**
 * Calculate performance metrics
 */
async function calculatePerformanceMetrics(): Promise<any> {
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const [evaluationLogs, recentPolicies] = await Promise.all([
    prisma.policyEvaluationLog.findMany({
      where: { createdAt: { gte: lastWeek } },
      select: { evaluationTime: true, policyId: true }
    }),
    prisma.policy.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true }
    })
  ])

  const averageEvaluationTime = evaluationLogs.length > 0
    ? evaluationLogs.reduce((sum, log) => sum + log.evaluationTime, 0) / evaluationLogs.length
    : 0

  const evaluationsPerDay = evaluationLogs.length / 7

  // Find slowest policies
  const policyTimes: Record<string, number[]> = {}
  evaluationLogs.forEach(log => {
    if (!policyTimes[log.policyId]) policyTimes[log.policyId] = []
    policyTimes[log.policyId].push(log.evaluationTime)
  })

  const slowestPolicies = Object.entries(policyTimes)
    .map(([policyId, times]) => ({
      policyId,
      name: recentPolicies.find(p => p.id === policyId)?.name || 'Unknown',
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
    }))
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, 5)

  return {
    averageEvaluationTime,
    evaluationsPerDay,
    cacheHitRate: 0.75, // TODO: Implement actual cache hit rate calculation
    slowestPolicies,
    errorRate: 0.02 // TODO: Calculate actual error rate
  }
}

/**
 * Helper functions
 */
function findDuplicateAttributes(state: any): string[] {
  const allConditions = [
    ...state.subjectConditions,
    ...state.resourceConditions,
    ...state.environmentConditions
  ]
  
  const attributeCounts: Record<string, number> = {}
  allConditions.forEach((condition: any) => {
    attributeCounts[condition.attribute] = (attributeCounts[condition.attribute] || 0) + 1
  })

  return Object.entries(attributeCounts)
    .filter(([_, count]) => count > 1)
    .map(([attribute]) => attribute)
}

function calculatePolicyComplexity(state: any): number {
  let complexity = 0
  
  // Base complexity from conditions
  complexity += state.subjectConditions.length * 2
  complexity += state.resourceConditions.length * 2
  complexity += state.actionConditions.length * 1
  complexity += state.environmentConditions.length * 2
  
  // Rule complexity
  state.rules.forEach((rule: any) => {
    complexity += calculateRuleComplexity(rule.condition)
  })
  
  return complexity
}

function calculateRuleComplexity(condition: any): number {
  if (condition.type === 'simple') {
    return 1
  } else if (condition.type === 'composite') {
    let complexity = 1 // Base for composite
    if (condition.expressions) {
      complexity += condition.expressions.reduce(
        (sum: number, expr: any) => sum + calculateRuleComplexity(expr),
        0
      )
    }
    return complexity
  }
  return 0
}