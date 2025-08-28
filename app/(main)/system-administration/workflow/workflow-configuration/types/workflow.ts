export type OperatorType = "eq" | "lt" | "gt" | "lte" | "gte"
export type ActionType = "SKIP_STAGE" | "NEXT_STAGE"
export type NotificationChannel = "Email" | "System"
export type NotificationEventTrigger = "onSubmit" | "onApprove" | "onReject" | "onSendBack" | "onSLA"
export type WorkflowRoleType = 'requester' | 'purchaser' | 'approver' | 'reviewer'

export interface Product {
  id: number
  name: string
  code: string
  category: string
  subCategory?: string
  itemGroup?: string
}

export interface Stage {
  id: number
  name: string
  description: string
  sla: string
  slaUnit: string
  availableActions: string[]
  hideFields: {
    pricePerUnit: boolean
    totalPrice: boolean
  }
  assignedUsers: {
    id: number
    name: string
    department: string
    location: string
  }[]
  roleType: WorkflowRoleType
}

export interface RoutingCondition {
  field: string
  operator: OperatorType
  value: string
}

export interface RoutingAction {
  type: ActionType
  parameters: {
    targetStage: string
  }
}

export interface RoutingRule {
  id: number
  name: string
  description: string
  triggerStage: string
  condition: RoutingCondition
  action: RoutingAction
}

export interface WorkflowNotification {
  id: number
  event: string
  eventTrigger: NotificationEventTrigger
  description?: string
  recipients: string[]
  channels: NotificationChannel[]
}

export interface Template {
  id: number
  name: string
  eventTrigger: NotificationEventTrigger
  description?: string
  subjectLine: string
  content: string
}

export interface Workflow {
  id: string
  name: string
  type: string
  description: string
  documentReferencePattern: string
  status: string
  stages: Stage[]
  routingRules: RoutingRule[]
  notifications: WorkflowNotification[]
  notificationTemplates: Template[]
  products: Product[]
}

