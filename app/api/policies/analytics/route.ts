import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const analyticsQuerySchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
  metricType: z.enum(['performance', 'usage', 'compliance', 'security', 'all']).default('all'),
  policyIds: z.string().optional(), // Comma-separated policy IDs
  groupBy: z.enum(['hour', 'day', 'week', 'policy', 'user', 'resource']).default('day'),
  includeDetails: z.coerce.boolean().default(false)
})

const complianceReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reportType: z.enum(['audit', 'access', 'policy_changes', 'violations']).default('audit'),
  format: z.enum(['json', 'csv']).default('json'),
  includeDetails: z.coerce.boolean().default(true),
  policyIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional()
})

/**
 * GET /api/policies/analytics - Get policy analytics and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const query = analyticsQuerySchema.parse(params)

    // Calculate time range
    const now = new Date()
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    const startTime = timeRanges[query.timeRange]

    // Parse policy IDs if provided
    const policyIds = query.policyIds?.split(',').filter(Boolean)

    const analytics: any = {
      timeRange: query.timeRange,
      startTime,
      endTime: now,
      metrics: {}
    }

    // Performance metrics
    if (query.metricType === 'performance' || query.metricType === 'all') {
      analytics.metrics.performance = await getPerformanceMetrics(startTime, policyIds, query.groupBy)
    }

    // Usage metrics
    if (query.metricType === 'usage' || query.metricType === 'all') {
      analytics.metrics.usage = await getUsageMetrics(startTime, policyIds, query.groupBy)
    }

    // Compliance metrics
    if (query.metricType === 'compliance' || query.metricType === 'all') {
      analytics.metrics.compliance = await getComplianceMetrics(startTime, policyIds)
    }

    // Security metrics
    if (query.metricType === 'security' || query.metricType === 'all') {
      analytics.metrics.security = await getSecurityMetrics(startTime, policyIds)
    }

    // Overall summary
    analytics.summary = await getAnalyticsSummary(startTime, policyIds)

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('GET /api/policies/analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid analytics query',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, { status: 500 })
  }
}

/**
 * POST /api/policies/analytics - Generate compliance report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedRequest = complianceReportSchema.parse(body)

    const startDate = new Date(validatedRequest.startDate)
    const endDate = new Date(validatedRequest.endDate)

    // Generate report based on type
    let reportData: any = {}

    switch (validatedRequest.reportType) {
      case 'audit':
        reportData = await generateAuditReport(startDate, endDate, validatedRequest)
        break
      
      case 'access':
        reportData = await generateAccessReport(startDate, endDate, validatedRequest)
        break
      
      case 'policy_changes':
        reportData = await generatePolicyChangesReport(startDate, endDate, validatedRequest)
        break
      
      case 'violations':
        reportData = await generateViolationsReport(startDate, endDate, validatedRequest)
        break
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid report type'
        }, { status: 400 })
    }

    // Format report
    const report = {
      reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportType: validatedRequest.reportType,
      generatedAt: new Date(),
      period: {
        startDate,
        endDate,
        durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      },
      summary: reportData.summary,
      data: reportData.data,
      metadata: {
        format: validatedRequest.format,
        includeDetails: validatedRequest.includeDetails,
        filters: {
          policyIds: validatedRequest.policyIds,
          userIds: validatedRequest.userIds
        }
      }
    }

    // Log report generation
    await prisma.auditLog.create({
      data: {
        eventType: 'COMPLIANCE_REPORT_GENERATED',
        eventCategory: 'COMPLIANCE',
        eventData: {
          actor: {
            userId: 'system', // TODO: Get from session
            action: 'GENERATE_REPORT'
          },
          reportType: validatedRequest.reportType,
          period: { startDate, endDate },
          recordCount: reportData.summary?.totalRecords || 0
        },
        success: true,
        complianceFlags: ['AUDIT_REQUIRED'],
        source: 'api'
      }
    })

    // Return appropriate format
    if (validatedRequest.format === 'csv') {
      const csv = convertToCSV(reportData.data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${report.reportId}.csv"`
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        data: report
      })
    }

  } catch (error) {
    console.error('POST /api/policies/analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid compliance report request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate compliance report'
    }, { status: 500 })
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(startTime: Date, policyIds?: string[], groupBy: string = 'day') {
  const whereClause: any = {
    createdAt: { gte: startTime }
  }
  
  if (policyIds?.length) {
    whereClause.policyId = { in: policyIds }
  }

  const evaluationLogs = await prisma.policyEvaluationLog.findMany({
    where: whereClause,
    select: {
      policyId: true,
      evaluationTime: true,
      finalDecision: true,
      createdAt: true,
      policy: {
        select: { name: true }
      }
    }
  })

  // Group by specified time period
  const grouped: Record<string, any[]> = {}
  evaluationLogs.forEach(log => {
    const key = groupBy === 'hour' 
      ? log.createdAt.toISOString().slice(0, 13) + ':00:00'
      : groupBy === 'day'
      ? log.createdAt.toISOString().slice(0, 10)
      : groupBy === 'week'
      ? getWeekKey(log.createdAt)
      : log.policyId

    if (!grouped[key]) grouped[key] = []
    grouped[key].push(log)
  })

  // Calculate metrics for each group
  const timeSeriesData = Object.entries(grouped).map(([key, logs]) => ({
    period: key,
    totalEvaluations: logs.length,
    averageTime: logs.reduce((sum, log) => sum + log.evaluationTime, 0) / logs.length,
    maxTime: Math.max(...logs.map(log => log.evaluationTime)),
    minTime: Math.min(...logs.map(log => log.evaluationTime)),
    permitRate: logs.filter(log => log.finalDecision === 'PERMIT').length / logs.length,
    denyRate: logs.filter(log => log.finalDecision === 'DENY').length / logs.length
  }))

  // Overall performance metrics
  const overallMetrics = {
    totalEvaluations: evaluationLogs.length,
    averageEvaluationTime: evaluationLogs.reduce((sum, log) => sum + log.evaluationTime, 0) / evaluationLogs.length,
    p95EvaluationTime: calculatePercentile(evaluationLogs.map(log => log.evaluationTime), 0.95),
    p99EvaluationTime: calculatePercentile(evaluationLogs.map(log => log.evaluationTime), 0.99),
    slowestPolicies: getSlowestPolicies(evaluationLogs, 5)
  }

  return {
    overall: overallMetrics,
    timeSeries: timeSeriesData.sort((a, b) => a.period.localeCompare(b.period))
  }
}

/**
 * Get usage metrics
 */
async function getUsageMetrics(startTime: Date, policyIds?: string[], groupBy: string = 'day') {
  // Get access requests
  const accessRequests = await prisma.accessRequest.findMany({
    where: {
      createdAt: { gte: startTime },
      ...(policyIds?.length && { matchedPolicies: { hasSome: policyIds } })
    },
    select: {
      decision: true,
      requestData: true,
      matchedPolicies: true,
      createdAt: true
    }
  })

  // Analyze request patterns
  const resourceTypes: Record<string, number> = {}
  const actions: Record<string, number> = {}
  const users: Record<string, number> = {}
  const decisions: Record<string, number> = { PERMIT: 0, DENY: 0 }

  accessRequests.forEach(request => {
    const data = request.requestData as any
    
    // Count resource types
    const resourceType = data?.resource?.resourceType
    if (resourceType) {
      resourceTypes[resourceType] = (resourceTypes[resourceType] || 0) + 1
    }
    
    // Count actions
    const action = data?.action?.actionType
    if (action) {
      actions[action] = (actions[action] || 0) + 1
    }
    
    // Count users
    const userId = data?.subject?.userId
    if (userId) {
      users[userId] = (users[userId] || 0) + 1
    }
    
    // Count decisions
    decisions[request.decision] = (decisions[request.decision] || 0) + 1
  })

  return {
    totalRequests: accessRequests.length,
    topResourceTypes: Object.entries(resourceTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count })),
    topActions: Object.entries(actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count })),
    topUsers: Object.entries(users)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count })),
    decisionBreakdown: decisions,
    successRate: decisions.PERMIT / (decisions.PERMIT + decisions.DENY)
  }
}

/**
 * Get compliance metrics
 */
async function getComplianceMetrics(startTime: Date, policyIds?: string[]) {
  // Get audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { gte: startTime },
      complianceFlags: { isEmpty: false }
    },
    select: {
      eventType: true,
      eventCategory: true,
      complianceFlags: true,
      success: true,
      timestamp: true
    }
  })

  // Analyze compliance
  const complianceFlags: Record<string, number> = {}
  const eventCategories: Record<string, number> = {}
  let successfulEvents = 0

  auditLogs.forEach(log => {
    if (log.success) successfulEvents++
    
    log.complianceFlags?.forEach(flag => {
      complianceFlags[flag] = (complianceFlags[flag] || 0) + 1
    })
    
    eventCategories[log.eventCategory] = (eventCategories[log.eventCategory] || 0) + 1
  })

  return {
    totalAuditableEvents: auditLogs.length,
    successfulEvents,
    complianceRate: auditLogs.length > 0 ? successfulEvents / auditLogs.length : 0,
    complianceFlags: Object.entries(complianceFlags)
      .sort(([,a], [,b]) => b - a)
      .map(([flag, count]) => ({ flag, count })),
    eventCategories: Object.entries(eventCategories)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({ category, count }))
  }
}

/**
 * Get security metrics
 */
async function getSecurityMetrics(startTime: Date, policyIds?: string[]) {
  // Get denied access attempts
  const deniedRequests = await prisma.accessRequest.findMany({
    where: {
      decision: 'DENY',
      createdAt: { gte: startTime }
    },
    select: {
      requestData: true,
      createdAt: true,
      ipAddress: true
    }
  })

  // Analyze security patterns
  const suspiciousIPs: Record<string, number> = {}
  const deniedResources: Record<string, number> = {}
  const deniedActions: Record<string, number> = {}

  deniedRequests.forEach(request => {
    const data = request.requestData as any
    
    if (request.ipAddress) {
      suspiciousIPs[request.ipAddress] = (suspiciousIPs[request.ipAddress] || 0) + 1
    }
    
    const resourceType = data?.resource?.resourceType
    if (resourceType) {
      deniedResources[resourceType] = (deniedResources[resourceType] || 0) + 1
    }
    
    const action = data?.action?.actionType
    if (action) {
      deniedActions[action] = (deniedActions[action] || 0) + 1
    }
  })

  return {
    totalDeniedRequests: deniedRequests.length,
    suspiciousIPs: Object.entries(suspiciousIPs)
      .filter(([, count]) => count > 10) // Flag IPs with many denials
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count })),
    mostDeniedResources: Object.entries(deniedResources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count })),
    mostDeniedActions: Object.entries(deniedActions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }))
  }
}

/**
 * Get analytics summary
 */
async function getAnalyticsSummary(startTime: Date, policyIds?: string[]) {
  const [
    totalPolicies,
    activePolicies,
    totalEvaluations,
    totalAccessRequests,
    auditEvents
  ] = await Promise.all([
    prisma.policy.count(),
    prisma.policy.count({ where: { status: 'ACTIVE' } }),
    prisma.policyEvaluationLog.count({ where: { createdAt: { gte: startTime } } }),
    prisma.accessRequest.count({ where: { createdAt: { gte: startTime } } }),
    prisma.auditLog.count({ where: { timestamp: { gte: startTime } } })
  ])

  return {
    totalPolicies,
    activePolicies,
    totalEvaluations,
    totalAccessRequests,
    auditEvents,
    evaluationsPerHour: totalEvaluations / ((Date.now() - startTime.getTime()) / (60 * 60 * 1000)),
    systemHealth: activePolicies > 0 ? 'healthy' : 'warning'
  }
}

/**
 * Generate audit report
 */
async function generateAuditReport(startDate: Date, endDate: Date, options: any) {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate }
    },
    orderBy: { timestamp: 'desc' }
  })

  return {
    summary: {
      totalRecords: auditLogs.length,
      eventTypes: [...new Set(auditLogs.map(log => log.eventType))],
      successRate: auditLogs.filter(log => log.success).length / auditLogs.length,
      complianceFlags: [...new Set(auditLogs.flatMap(log => log.complianceFlags || []))]
    },
    data: auditLogs.map(log => ({
      timestamp: log.timestamp,
      eventType: log.eventType,
      eventCategory: log.eventCategory,
      success: log.success,
      complianceFlags: log.complianceFlags,
      details: options.includeDetails ? log.eventData : undefined
    }))
  }
}

/**
 * Generate access report
 */
async function generateAccessReport(startDate: Date, endDate: Date, options: any) {
  const accessRequests = await prisma.accessRequest.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    summary: {
      totalRecords: accessRequests.length,
      permitRate: accessRequests.filter(req => req.decision === 'PERMIT').length / accessRequests.length,
      denyRate: accessRequests.filter(req => req.decision === 'DENY').length / accessRequests.length,
      averageEvaluationTime: accessRequests.reduce((sum, req) => sum + (req.evaluationTime || 0), 0) / accessRequests.length
    },
    data: accessRequests.map(req => ({
      timestamp: req.createdAt,
      decision: req.decision,
      evaluationTime: req.evaluationTime,
      matchedPolicies: req.matchedPolicies,
      details: options.includeDetails ? req.requestData : undefined
    }))
  }
}

/**
 * Generate policy changes report
 */
async function generatePolicyChangesReport(startDate: Date, endDate: Date, options: any) {
  const policyChanges = await prisma.auditLog.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate },
      eventCategory: 'POLICY'
    },
    orderBy: { timestamp: 'desc' }
  })

  return {
    summary: {
      totalRecords: policyChanges.length,
      changeTypes: [...new Set(policyChanges.map(change => change.eventType))],
      affectedPolicies: [...new Set(policyChanges.map(change => 
        (change.eventData as any)?.resource?.resourceId
      ).filter(Boolean))]
    },
    data: policyChanges.map(change => ({
      timestamp: change.timestamp,
      eventType: change.eventType,
      policyId: (change.eventData as any)?.resource?.resourceId,
      policyName: (change.eventData as any)?.resource?.resourceName,
      details: options.includeDetails ? change.eventData : undefined
    }))
  }
}

/**
 * Generate violations report
 */
async function generateViolationsReport(startDate: Date, endDate: Date, options: any) {
  const violations = await prisma.accessRequest.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      decision: 'DENY'
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    summary: {
      totalRecords: violations.length,
      violationRate: violations.length, // Total violations in period
      topViolationReasons: [], // TODO: Extract denial reasons
      suspiciousActivity: violations.filter(v => 
        (v.requestData as any)?.environment?.threatLevel === 'high'
      ).length
    },
    data: violations.map(violation => ({
      timestamp: violation.createdAt,
      userId: (violation.requestData as any)?.subject?.userId,
      resourceType: (violation.requestData as any)?.resource?.resourceType,
      action: (violation.requestData as any)?.action?.actionType,
      reason: violation.evaluationResult ? (violation.evaluationResult as any).reason : 'Unknown',
      details: options.includeDetails ? violation.requestData : undefined
    }))
  }
}

/**
 * Helper functions
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear()
  const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b)
  const index = Math.ceil(sorted.length * percentile) - 1
  return sorted[Math.max(0, index)] || 0
}

function getSlowestPolicies(logs: any[], count: number) {
  const policyTimes: Record<string, { times: number[], name?: string }> = {}
  
  logs.forEach(log => {
    if (!policyTimes[log.policyId]) {
      policyTimes[log.policyId] = { times: [], name: log.policy?.name }
    }
    policyTimes[log.policyId].times.push(log.evaluationTime)
  })

  return Object.entries(policyTimes)
    .map(([policyId, data]) => ({
      policyId,
      name: data.name || 'Unknown Policy',
      averageTime: data.times.reduce((sum, time) => sum + time, 0) / data.times.length,
      maxTime: Math.max(...data.times),
      evaluationCount: data.times.length
    }))
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, count)
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        return `"${value.toString().replace(/"/g, '""')}"`
      }).join(',')
    )
  ]
  
  return csvRows.join('\n')
}