import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { AttributeDefinition, AttributeCategory } from '@/lib/types/policy-builder'
import { SubjectAttributes, ResourceAttributes, EnvironmentAttributes, Operator } from '@/lib/types/permissions'

const prisma = new PrismaClient()

// Validation schemas
const attributeQuerySchema = z.object({
  category: z.enum(['subject', 'resource', 'environment', 'action', 'all']).default('all'),
  entityType: z.string().optional(),
  search: z.string().optional(),
  dataType: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object', 'all']).default('all'),
  isRequired: z.coerce.boolean().optional(),
  isSystem: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50)
})

const resolveAttributesSchema = z.object({
  subjectId: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  actionType: z.string().optional(),
  environmentContext: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional(),
    location: z.string().optional(),
    additionalAttributes: z.record(z.any()).optional()
  }).optional(),
  includeComputed: z.boolean().default(true),
  includeMetadata: z.boolean().default(false)
})

/**
 * GET /api/attributes - Get available attribute definitions
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const query = attributeQuerySchema.parse(params)

    // Build where clause for attribute search
    const where: any = {}
    
    if (query.category !== 'all') {
      where.attributeType = query.category
    }
    
    if (query.entityType) {
      where.entityType = query.entityType
    }
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { value: { path: '$.displayName', string_contains: query.search } }
      ]
    }

    // Get attributes with pagination
    const [attributes, totalCount] = await Promise.all([
      prisma.attribute.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [
          { attributeType: 'asc' },
          { entityType: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.attribute.count({ where })
    ])

    // Also get predefined attribute definitions
    const predefinedAttributes = await getPredefinedAttributeDefinitions(query.category)

    // Transform database attributes to attribute definitions
    const dbAttributeDefinitions: AttributeDefinition[] = attributes.map(attr => {
      const value = attr.value as any
      return {
        path: `${attr.attributeType}.${attr.name}`,
        name: attr.name,
        displayName: value?.displayName || attr.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: value?.description || `${attr.attributeType} attribute: ${attr.name}`,
        dataType: value?.dataType || 'string',
        category: attr.attributeType as any,
        examples: value?.examples || [],
        validOperators: getValidOperatorsForType(value?.dataType || 'string'),
        isRequired: value?.isRequired || false,
        isSystem: true,
        tags: value?.tags || []
      }
    })

    // Combine and categorize attributes
    const allAttributes = [...predefinedAttributes, ...dbAttributeDefinitions]
    const filteredAttributes = query.dataType === 'all' 
      ? allAttributes 
      : allAttributes.filter(attr => attr.dataType === query.dataType)

    // Group by category
    const categorizedAttributes: Record<string, AttributeDefinition[]> = {}
    filteredAttributes.forEach(attr => {
      if (!categorizedAttributes[attr.category]) {
        categorizedAttributes[attr.category] = []
      }
      categorizedAttributes[attr.category].push(attr)
    })

    // Build categories
    const categories: AttributeCategory[] = Object.entries(categorizedAttributes).map(([category, attrs]) => ({
      category: category as any,
      displayName: category.charAt(0).toUpperCase() + category.slice(1),
      description: getCategoryDescription(category as any),
      icon: getCategoryIcon(category as any),
      attributes: attrs
    }))

    return NextResponse.json({
      success: true,
      data: {
        categories,
        totalAttributes: filteredAttributes.length,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount + predefinedAttributes.length,
          totalPages: Math.ceil((totalCount + predefinedAttributes.length) / query.limit)
        }
      }
    })

  } catch (error) {
    console.error('GET /api/attributes error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch attributes'
    }, { status: 500 })
  }
}

/**
 * POST /api/attributes - Resolve attributes for evaluation context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedRequest = resolveAttributesSchema.parse(body)

    const resolvedAttributes: any = {}

    // Resolve subject attributes
    if (validatedRequest.subjectId) {
      resolvedAttributes.subject = await resolveSubjectAttributes(
        validatedRequest.subjectId,
        validatedRequest.includeComputed,
        validatedRequest.includeMetadata
      )
    }

    // Resolve resource attributes
    if (validatedRequest.resourceType) {
      resolvedAttributes.resource = await resolveResourceAttributes(
        validatedRequest.resourceType,
        validatedRequest.resourceId,
        validatedRequest.includeComputed,
        validatedRequest.includeMetadata
      )
    }

    // Resolve environment attributes
    resolvedAttributes.environment = await resolveEnvironmentAttributes(
      validatedRequest.environmentContext,
      validatedRequest.includeComputed,
      validatedRequest.includeMetadata
    )

    // Resolve action attributes
    if (validatedRequest.actionType) {
      resolvedAttributes.action = await resolveActionAttributes(
        validatedRequest.actionType,
        validatedRequest.includeComputed,
        validatedRequest.includeMetadata
      )
    }

    return NextResponse.json({
      success: true,
      data: resolvedAttributes
    })

  } catch (error) {
    console.error('POST /api/attributes error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid attribute resolution request',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to resolve attributes'
    }, { status: 500 })
  }
}

/**
 * Get predefined attribute definitions based on ABAC design
 */
async function getPredefinedAttributeDefinitions(category: string): Promise<AttributeDefinition[]> {
  const subjectAttributes: AttributeDefinition[] = [
    {
      path: 'subject.userId',
      name: 'userId',
      displayName: 'User ID',
      description: 'Unique identifier for the user',
      dataType: 'string',
      category: 'subject',
      examples: ['user123', 'emp001'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'subject.role.name',
      name: 'role',
      displayName: 'Role Name',
      description: 'Primary role assigned to the user',
      dataType: 'string',
      category: 'subject',
      examples: ['chef', 'manager', 'staff'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'subject.department.name',
      name: 'department',
      displayName: 'Department',
      description: 'Department the user belongs to',
      dataType: 'string',
      category: 'subject',
      examples: ['kitchen', 'procurement', 'finance'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'subject.clearanceLevel',
      name: 'clearanceLevel',
      displayName: 'Clearance Level',
      description: 'Security clearance level of the user',
      dataType: 'string',
      category: 'subject',
      examples: ['public', 'internal', 'confidential', 'restricted'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: false,
      isSystem: true
    },
    {
      path: 'subject.approvalLimit.amount',
      name: 'approvalLimit',
      displayName: 'Approval Limit',
      description: 'Maximum monetary amount the user can approve',
      dataType: 'number',
      category: 'subject',
      examples: [1000, 5000, 10000],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
      isRequired: false,
      isSystem: true
    }
  ]

  const resourceAttributes: AttributeDefinition[] = [
    {
      path: 'resource.resourceType',
      name: 'resourceType',
      displayName: 'Resource Type',
      description: 'Type of the resource being accessed',
      dataType: 'string',
      category: 'resource',
      examples: ['purchase_request', 'inventory_item', 'vendor'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'resource.totalValue.amount',
      name: 'totalValue',
      displayName: 'Total Value',
      description: 'Monetary value of the resource',
      dataType: 'number',
      category: 'resource',
      examples: [100, 1000, 10000],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
      isRequired: false,
      isSystem: true
    },
    {
      path: 'resource.dataClassification',
      name: 'dataClassification',
      displayName: 'Data Classification',
      description: 'Security classification of the resource data',
      dataType: 'string',
      category: 'resource',
      examples: ['public', 'internal', 'confidential', 'restricted'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: false,
      isSystem: true
    },
    {
      path: 'resource.documentStatus.status',
      name: 'documentStatus',
      displayName: 'Document Status',
      description: 'Current status of the document/resource',
      dataType: 'string',
      category: 'resource',
      examples: ['draft', 'submitted', 'approved', 'rejected'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: false,
      isSystem: true
    }
  ]

  const environmentAttributes: AttributeDefinition[] = [
    {
      path: 'environment.currentTime',
      name: 'currentTime',
      displayName: 'Current Time',
      description: 'Current date and time of the request',
      dataType: 'date',
      category: 'environment',
      examples: ['2024-01-15T10:00:00Z'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'environment.isBusinessHours',
      name: 'isBusinessHours',
      displayName: 'Is Business Hours',
      description: 'Whether the request is during business hours',
      dataType: 'boolean',
      category: 'environment',
      examples: [true, false],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS],
      isRequired: false,
      isSystem: true
    },
    {
      path: 'environment.requestIP',
      name: 'requestIP',
      displayName: 'Request IP Address',
      description: 'IP address of the request origin',
      dataType: 'string',
      category: 'environment',
      examples: ['192.168.1.100', '10.0.0.50'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN, Operator.CONTAINS],
      isRequired: false,
      isSystem: true
    },
    {
      path: 'environment.threatLevel',
      name: 'threatLevel',
      displayName: 'Threat Level',
      description: 'Current security threat level',
      dataType: 'string',
      category: 'environment',
      examples: ['low', 'medium', 'high', 'critical'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: false,
      isSystem: true
    }
  ]

  const actionAttributes: AttributeDefinition[] = [
    {
      path: 'action.name',
      name: 'actionName',
      displayName: 'Action Name',
      description: 'Name of the action being performed',
      dataType: 'string',
      category: 'action',
      examples: ['view', 'create', 'update', 'delete', 'approve'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: true,
      isSystem: true
    },
    {
      path: 'action.riskLevel',
      name: 'riskLevel',
      displayName: 'Risk Level',
      description: 'Risk level associated with the action',
      dataType: 'string',
      category: 'action',
      examples: ['low', 'medium', 'high', 'critical'],
      validOperators: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN],
      isRequired: false,
      isSystem: true
    }
  ]

  // Return attributes based on category filter
  if (category === 'all') {
    return [...subjectAttributes, ...resourceAttributes, ...environmentAttributes, ...actionAttributes]
  } else if (category === 'subject') {
    return subjectAttributes
  } else if (category === 'resource') {
    return resourceAttributes
  } else if (category === 'environment') {
    return environmentAttributes
  } else if (category === 'action') {
    return actionAttributes
  }

  return []
}

/**
 * Resolve subject attributes from database and user context
 */
async function resolveSubjectAttributes(
  subjectId: string,
  includeComputed: boolean = true,
  includeMetadata: boolean = false
): Promise<Partial<SubjectAttributes>> {
  const attributes: any = {}

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: subjectId },
    include: {
      roleAssignments: {
        where: { isActive: true },
        include: {
          role: true
        }
      }
    }
  })

  if (user) {
    const userData = user.userData as any
    
    attributes.userId = user.id
    attributes.username = user.name
    attributes.email = user.email
    
    // Role information
    if (user.roleAssignments.length > 0) {
      attributes.roles = user.roleAssignments.map(assignment => assignment.role)
      attributes.role = user.roleAssignments.find(a => 
        (a.context as any)?.isPrimary
      )?.role || user.roleAssignments[0].role
    }

    // User data attributes
    if (userData?.context) {
      attributes.department = userData.context.department
      attributes.location = userData.context.location
      attributes.clearanceLevel = userData.context.clearanceLevel || 'internal'
    }

    if (userData?.attributes) {
      attributes.approvalLimit = userData.attributes.approvalLimit
      attributes.specialPermissions = userData.attributes.specialPermissions || []
    }

    // Computed attributes
    if (includeComputed) {
      attributes.accountStatus = user.isActive ? 'active' : 'inactive'
      attributes.onDuty = true // TODO: Implement shift checking
      attributes.seniority = user.createdAt ? 
        Math.floor((Date.now() - user.createdAt.getTime()) / (365 * 24 * 60 * 60 * 1000)) : 0
    }
  }

  return attributes
}

/**
 * Resolve resource attributes from database
 */
async function resolveResourceAttributes(
  resourceType: string,
  resourceId?: string,
  includeComputed: boolean = true,
  includeMetadata: boolean = false
): Promise<Partial<ResourceAttributes>> {
  const attributes: any = {}

  attributes.resourceType = resourceType
  if (resourceId) {
    attributes.resourceId = resourceId
  }

  // Get resource definition
  const resourceDef = await prisma.resourceDefinition.findUnique({
    where: { resourceType }
  })

  if (resourceDef) {
    const definition = resourceDef.definition as any
    attributes.category = resourceDef.category
    attributes.dataClassification = definition.classification?.defaultLevel || 'internal'
  }

  // TODO: Implement specific resource attribute resolution based on resourceId
  // This would query actual resource tables and extract relevant attributes

  return attributes
}

/**
 * Resolve environment attributes from request context
 */
async function resolveEnvironmentAttributes(
  context?: any,
  includeComputed: boolean = true,
  includeMetadata: boolean = false
): Promise<Partial<EnvironmentAttributes>> {
  const attributes: any = {}

  const now = new Date()
  attributes.currentTime = now
  attributes.dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  if (context) {
    if (context.ipAddress) attributes.requestIP = context.ipAddress
    if (context.userAgent) attributes.userAgent = context.userAgent
    if (context.sessionId) attributes.sessionId = context.sessionId
    if (context.location) attributes.facility = context.location
  }

  // Computed attributes
  if (includeComputed) {
    const hour = now.getHours()
    attributes.isBusinessHours = hour >= 8 && hour <= 17 // 8 AM to 5 PM
    attributes.isHoliday = false // TODO: Implement holiday checking
    attributes.threatLevel = 'low' // TODO: Implement threat assessment
    attributes.systemLoad = 'normal' // TODO: Implement system monitoring
    attributes.maintenanceMode = false
    attributes.emergencyMode = false
  }

  return attributes
}

/**
 * Resolve action attributes
 */
async function resolveActionAttributes(
  actionType: string,
  includeComputed: boolean = true,
  includeMetadata: boolean = false
): Promise<any> {
  const attributes: any = {}

  attributes.name = actionType
  attributes.type = getActionType(actionType)

  if (includeComputed) {
    attributes.riskLevel = getActionRiskLevel(actionType)
    attributes.requiresApproval = getActionRequiresApproval(actionType)
    attributes.auditRequired = getActionAuditRequired(actionType)
  }

  return attributes
}

/**
 * Helper functions
 */
function getValidOperatorsForType(dataType: string): Operator[] {
  const operatorMap: Record<string, Operator[]> = {
    string: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.STARTS_WITH, Operator.ENDS_WITH, Operator.IN, Operator.NOT_IN],
    number: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL, Operator.IN, Operator.NOT_IN],
    boolean: [Operator.EQUALS, Operator.NOT_EQUALS],
    date: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
    array: [Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.IN, Operator.NOT_IN],
    object: [Operator.EXISTS, Operator.NOT_EXISTS, Operator.CONTAINS, Operator.NOT_CONTAINS]
  }
  return operatorMap[dataType] || [Operator.EQUALS, Operator.NOT_EQUALS]
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    subject: 'Attributes related to users, their roles, and organizational context',
    resource: 'Attributes of the resources being accessed or modified',
    environment: 'Context attributes about the request environment and conditions',
    action: 'Attributes describing the operations being performed'
  }
  return descriptions[category] || 'Miscellaneous attributes'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    subject: 'user',
    resource: 'database',
    environment: 'globe',
    action: 'zap'
  }
  return icons[category] || 'help-circle'
}

function getActionType(actionName: string): string {
  const typeMap: Record<string, string> = {
    'create': 'write',
    'read': 'read',
    'update': 'write',
    'delete': 'write',
    'approve': 'approve',
    'reject': 'approve',
    'submit': 'submit',
    'cancel': 'write',
    'view': 'read',
    'list': 'read',
    'export': 'export',
    'import': 'import'
  }
  return typeMap[actionName] || 'read'
}

function getActionRiskLevel(actionName: string): string {
  const riskMap: Record<string, string> = {
    'delete': 'high',
    'approve': 'medium',
    'reject': 'medium',
    'create': 'medium',
    'update': 'medium',
    'export': 'medium',
    'import': 'high',
    'view': 'low',
    'read': 'low',
    'list': 'low'
  }
  return riskMap[actionName] || 'medium'
}

function getActionRequiresApproval(actionName: string): boolean {
  const approvalActions = ['approve', 'reject', 'delete', 'import']
  return approvalActions.includes(actionName)
}

function getActionAuditRequired(actionName: string): boolean {
  const auditActions = ['approve', 'reject', 'delete', 'create', 'update', 'export', 'import']
  return auditActions.includes(actionName)
}