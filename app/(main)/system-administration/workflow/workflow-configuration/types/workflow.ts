export type OperatorType = "eq" | "lt" | "gt" | "lte" | "gte"
export type ActionType = "SKIP_STAGE" | "NEXT_STAGE"
export type NotificationChannel = "Email" | "System"
export type NotificationEventTrigger = "onApprove" | "onReject" | "onSendBack" | "onSubmit" | "onSLA"

export interface WorkflowStage {
  id: number
  name: string
  approver: string
  sla: string
  slaUnit: string
  approverRoles: string[]
  availableActions: string[]
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

export interface Workflow {
  id: string
  name: string
  type: string
  description: string
  documentReferencePattern: string
  status: string
  stages: WorkflowStage[]
  routingRules: RoutingRule[]
  notifications: WorkflowNotification[]
}

