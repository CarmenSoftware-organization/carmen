import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { enhancedPermissionService } from '@/lib/services/permissions/enhanced-permission-service'
import { 
  PolicyTestResult, 
  PolicyTestScenario, 
  PolicyEvaluationTrace,
  MockRequest
} from '@/lib/types/policy-builder'

const prisma = new PrismaClient()

// Validation schemas
const testScenarioSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  testInput: z.object({
    subject: z.object({
      userId: z.string(),
      attributes: z.record(z.any())
    }),
    resource: z.object({
      resourceType: z.string(),
      resourceId: z.string(),
      attributes: z.record(z.any())
    }),
    action: z.object({
      actionType: z.string(),
      attributes: z.record(z.any()).optional()
    }),
    environment: z.object({
      timestamp: z.string().datetime().optional(),
      location: z.string().optional(),
      businessHours: z.boolean().optional(),
      attributes: z.record(z.any()).optional()
    }).optional()
  }),
  expectedOutput: z.object({
    decision: z.enum(['permit', 'deny']),
    expectedObligations: z.array(z.string()).optional(),
    expectedAdvice: z.array(z.string()).optional(),
    minimumConfidence: z.number().min(0).max(1).optional()
  }),
  testMetadata: z.object({
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
    expectedExecutionTime: z.number().optional()
  }).optional()
})

const runTestSchema = z.object({
  policyIds: z.array(z.string()).min(1).max(50),
  scenarioIds: z.array(z.string()).min(1).max(100).optional(),
  options: z.object({
    includeTrace: z.boolean().default(true),
    includeMetrics: z.boolean().default(true),
    failFast: z.boolean().default(false),
    maxConcurrency: z.number().min(1).max(10).default(3),
    timeoutMs: z.number().min(1000).max(30000).default(10000)
  }).optional().default({})
})

const bulkTestSchema = z.object({
  testSuite: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    scenarios: z.array(testScenarioSchema).min(1).max(50)
  }),
  targetPolicies: z.array(z.string()).min(1).max(20),
  options: z.object({
    includeTrace: z.boolean().default(false),
    stopOnFailure: z.boolean().default(false),
    parallelExecution: z.boolean().default(true),
    saveResults: z.boolean().default(true)
  }).optional().default({})
})

/**
 * GET /api/policies/test - Get test scenarios and results
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const category = url.searchParams.get('category')
    const tags = url.searchParams.get('tags')?.split(',').map(t => t.trim())
    const search = url.searchParams.get('search')
    const include_results = url.searchParams.get('include_results') === 'true'

    // Build filters
    const where: any = {}
    if (category) where.category = category
    if (tags && tags.length > 0) where.tags = { hasSome: tags }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get scenarios with optional test results
    const includeResults = include_results ? {
      testResults: {
        take: 10,
        orderBy: { executedAt: 'desc' as const },
        select: {
          id: true,
          passed: true,
          score: true,
          executionTime: true,
          executedAt: true,
          executedBy: true,
          policyId: true
        }
      }
    } : {}

    const [scenarios, totalCount] = await Promise.all([
      prisma.policyTestScenario.findMany({
        where,
        include: includeResults,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.policyTestScenario.count({ where })
    ])

    // Transform scenarios
    const transformedScenarios = scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      category: scenario.category,
      tags: scenario.tags,
      scenarioData: scenario.scenarioData,
      createdBy: scenario.createdBy,
      createdAt: scenario.createdAt,
      recentResults: include_results ? (scenario as any).testResults : undefined
    }))

    return NextResponse.json({
      success: true,
      data: {
        scenarios: transformedScenarios,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('GET /api/policies/test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test scenarios'
    }, { status: 500 })
  }
}

/**
 * POST /api/policies/test - Create a new test scenario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testScenarioSchema.parse(body)

    // Create test scenario
    const scenario = await prisma.policyTestScenario.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category || 'general',
        tags: validatedData.tags,
        scenarioData: {
          testInput: validatedData.testInput,
          expectedOutput: validatedData.expectedOutput,
          testMetadata: validatedData.testMetadata || {}
        },
        createdBy: 'system' // TODO: Get from session
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        category: scenario.category,
        createdAt: scenario.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/policies/test error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid test scenario data',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create test scenario'
    }, { status: 500 })
  }
}

/**
 * PUT /api/policies/test - Run tests on policies with scenarios
 */
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  const testRunId = `test_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const body = await request.json()
    const validatedData = runTestSchema.parse(body)

    // Get policies to test
    const policies = await prisma.policy.findMany({
      where: { 
        id: { in: validatedData.policyIds },
        status: 'ACTIVE'
      },
      select: { id: true, name: true, policyData: true }
    })

    if (policies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active policies found for testing'
      }, { status: 404 })
    }

    // Get test scenarios
    let scenarios: any[]
    if (validatedData.scenarioIds && validatedData.scenarioIds.length > 0) {
      scenarios = await prisma.policyTestScenario.findMany({
        where: { id: { in: validatedData.scenarioIds } }
      })
    } else {
      // Use default test scenarios
      scenarios = await prisma.policyTestScenario.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      })
    }

    if (scenarios.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No test scenarios found'
      }, { status: 404 })
    }

    // Run tests
    const testResults: any[] = []
    const errors: any[] = []
    let totalTests = 0
    let passedTests = 0

    for (const policy of policies) {
      for (const scenario of scenarios) {
        totalTests++
        
        try {
          const scenarioData = scenario.scenarioData as any
          const testInput = scenarioData.testInput
          const expectedOutput = scenarioData.expectedOutput

          // Create mock request for evaluation
          const mockRequest = {
            userId: testInput.subject.userId,
            resourceType: testInput.resource.resourceType,
            resourceId: testInput.resource.resourceId,
            action: testInput.action.actionType,
            context: {
              additionalAttributes: {
                ...testInput.subject.attributes,
                ...testInput.resource.attributes,
                ...testInput.action.attributes,
                ...(testInput.environment?.attributes || {})
              }
            },
            options: {
              includeTrace: validatedData.options.includeTrace,
              auditEnabled: false // Don't audit test runs
            }
          }

          // Evaluate the request
          const evalStartTime = Date.now()
          const evaluationResult = await enhancedPermissionService.checkPermission(mockRequest)
          const executionTime = Date.now() - evalStartTime

          // Compare results
          const actualDecision = evaluationResult.allowed ? 'permit' : 'deny'
          const expectedDecision = expectedOutput.decision
          const passed = actualDecision === expectedDecision
          
          if (passed) passedTests++

          // Calculate score based on multiple factors
          let score = passed ? 1.0 : 0.0
          
          // Adjust score based on obligations and advice matching (if specified)
          // TODO: Implement obligation and advice matching

          // Store test result
          const testResult = await prisma.policyTestResult.create({
            data: {
              testRunId,
              scenarioId: scenario.id,
              policyId: policy.id,
              executedAt: new Date(),
              executedBy: 'system', // TODO: Get from session
              passed,
              score,
              executionTime,
              resultData: {
                actualResult: {
                  decision: actualDecision,
                  evaluationTime: executionTime,
                  reason: evaluationResult.reason
                },
                comparison: {
                  decisionMatch: passed,
                  expectedDecision,
                  actualDecision
                },
                testOutcome: {
                  passed,
                  score,
                  failureReasons: passed ? [] : ['decision_mismatch']
                },
                debugInfo: {
                  matchedPolicies: evaluationResult.matchedPolicies,
                  attributeResolutionTime: evaluationResult.attributeResolutionTime
                }
              }
            }
          })

          testResults.push({
            testId: testResult.id,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            policyId: policy.id,
            policyName: policy.name,
            passed,
            score,
            executionTime,
            expected: expectedDecision,
            actual: actualDecision,
            reason: evaluationResult.reason
          })

          // Check for fail-fast
          if (validatedData.options.failFast && !passed) {
            break
          }

        } catch (error) {
          const errorInfo = {
            scenarioId: scenario.id,
            policyId: policy.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          
          errors.push(errorInfo)
          
          if (validatedData.options.failFast) {
            throw error
          }
        }
      }
      
      if (validatedData.options.failFast && errors.length > 0) {
        break
      }
    }

    // Calculate summary statistics
    const summary = {
      testRunId,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: totalTests > 0 ? passedTests / totalTests : 0,
      totalExecutionTime: Date.now() - startTime,
      averageTestTime: testResults.length > 0 
        ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
        : 0,
      policiesTested: policies.length,
      scenariosUsed: scenarios.length,
      errors: errors.length
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        results: testResults,
        errors
      }
    })

  } catch (error) {
    console.error('PUT /api/policies/test error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid test request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      testRunId,
      executionTime: Date.now() - startTime
    }, { status: 500 })
  }
}

/**
 * PATCH /api/policies/test - Run bulk test suites
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()
  const testSuiteRunId = `suite_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    const body = await request.json()
    const validatedData = bulkTestSchema.parse(body)

    // Get target policies
    const policies = await prisma.policy.findMany({
      where: { 
        id: { in: validatedData.targetPolicies },
        status: 'ACTIVE'
      }
    })

    if (policies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active policies found for testing'
      }, { status: 404 })
    }

    // Process test suite
    const testSuite = validatedData.testSuite
    const results: any[] = []
    const errors: any[] = []
    let totalExecutions = 0
    let successfulExecutions = 0

    // Process each scenario against each policy
    for (const scenario of testSuite.scenarios) {
      for (const policy of policies) {
        totalExecutions++

        try {
          const testInput = scenario.testInput
          const expectedOutput = scenario.expectedOutput

          // Create evaluation request
          const mockRequest = {
            userId: testInput.subject.userId,
            resourceType: testInput.resource.resourceType,
            resourceId: testInput.resource.resourceId,
            action: testInput.action.actionType,
            context: {
              additionalAttributes: {
                ...testInput.subject.attributes,
                ...testInput.resource.attributes,
                ...testInput.action.attributes,
                ...(testInput.environment?.attributes || {})
              }
            },
            options: {
              includeTrace: validatedData.options.includeTrace,
              auditEnabled: false
            }
          }

          // Run evaluation
          const evalResult = await enhancedPermissionService.checkPermission(mockRequest)
          const actualDecision = evalResult.allowed ? 'permit' : 'deny'
          const passed = actualDecision === expectedOutput.decision
          
          if (passed) successfulExecutions++

          // Save result if requested
          if (validatedData.options.saveResults) {
            const testResult = await prisma.policyTestResult.create({
              data: {
                testRunId: testSuiteRunId,
                scenarioId: scenario.name, // Using name since these are ephemeral scenarios
                policyId: policy.id,
                executedAt: new Date(),
                executedBy: 'system',
                passed,
                score: passed ? 1.0 : 0.0,
                executionTime: evalResult.executionTime || 0,
                resultData: {
                  testSuite: testSuite.name,
                  scenarioName: scenario.name,
                  actualResult: {
                    decision: actualDecision,
                    reason: evalResult.reason
                  },
                  expectedResult: {
                    decision: expectedOutput.decision
                  },
                  passed
                }
              }
            })
          }

          results.push({
            scenarioName: scenario.name,
            policyId: policy.id,
            policyName: policy.name,
            passed,
            expected: expectedOutput.decision,
            actual: actualDecision,
            executionTime: evalResult.executionTime
          })

        } catch (error) {
          const errorInfo = {
            scenarioName: scenario.name,
            policyId: policy.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          
          errors.push(errorInfo)
          
          if (validatedData.options.stopOnFailure) {
            break
          }
        }
      }
      
      if (validatedData.options.stopOnFailure && errors.length > 0) {
        break
      }
    }

    // Calculate suite summary
    const suiteSummary = {
      testSuiteRunId,
      suiteName: testSuite.name,
      totalExecutions,
      successfulExecutions,
      failedExecutions: totalExecutions - successfulExecutions,
      successRate: totalExecutions > 0 ? successfulExecutions / totalExecutions : 0,
      totalTime: Date.now() - startTime,
      averageExecutionTime: results.length > 0 
        ? results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length
        : 0,
      scenarioCount: testSuite.scenarios.length,
      policyCount: policies.length,
      errorCount: errors.length
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: suiteSummary,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('PATCH /api/policies/test error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bulk test request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Bulk test execution failed',
      testSuiteRunId,
      executionTime: Date.now() - startTime
    }, { status: 500 })
  }
}