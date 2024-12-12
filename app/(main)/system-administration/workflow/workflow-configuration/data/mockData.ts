import { 
  ActionType, 
  OperatorType, 
  NotificationEventTrigger, 
  NotificationChannel,
  RoutingRule 
} from "../types/workflow"
import { roles } from "../../role-assignment/data/mockData"

export const sampleWorkflows = [
  {
    id: "WF-001",
    name: "General Purchase Workflow",
    type: "Purchase Request",
    description: "Workflow for general purchase requests in a hotel environment",
    documentReferencePattern: "GP-{YYYY}-{00000}",
    status: "Active",
    stages: [
      { 
        id: 1, 
        name: "Request Creation", 
        approver: "Requester", 
        sla: "4", 
        slaUnit: "hours", 
        approverRoles: [roles[0].name], 
        availableActions: ["Submit"] 
      },
      { 
        id: 2, 
        name: "Purchasing Review", 
        approver: "Purchasing Staff", 
        sla: "8", 
        slaUnit: "hours", 
        approverRoles: [roles[1].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 3, 
        name: "Department Approval", 
        approver: "Department Head", 
        sla: "12", 
        slaUnit: "hours", 
        approverRoles: [roles[2].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 4, 
        name: "Finance Review", 
        approver: "Finance Manager", 
        sla: "24", 
        slaUnit: "hours", 
        approverRoles: [roles[3].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 5, 
        name: "Final Approval", 
        approver: "General Manager", 
        sla: "48", 
        slaUnit: "hours", 
        approverRoles: [roles[4].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 6, 
        name: "Completed", 
        approver: "System", 
        sla: "0", 
        slaUnit: "hours", 
        approverRoles: ["System"], 
        availableActions: [] 
      },
    ],
    routingRules: [
      { 
        id: 1, 
        name: "Amount <= 10,000 BAHT", 
        description: "Skip to Completed for amounts less than or equal to 10,000 BAHT",
        triggerStage: "Finance Review",
        condition: { field: "amount", operator: "lte" as OperatorType, value: "10000" },
        action: { type: "SKIP_STAGE" as ActionType, parameters: { targetStage: "Completed" } }
      },
      { 
        id: 2, 
        name: "Amount > 10,000 BAHT", 
        description: "Route to GM Approval for amounts greater than 10,000 BAHT",
        triggerStage: "Finance Review",
        condition: { field: "amount", operator: "gt" as OperatorType, value: "10000" },
        action: { type: "NEXT_STAGE" as ActionType, parameters: { targetStage: "Final Approval" } }
      },
    ],
    notifications: [
      { 
        id: 1, 
        event: "Request Submitted", 
        eventTrigger: "onSubmit" as NotificationEventTrigger,
        recipients: ["Requester", "Purchasing Staff"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 2, 
        event: "Pending Approval", 
        eventTrigger: "onSubmit" as NotificationEventTrigger,
        recipients: ["Current Approver"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 3, 
        event: "Request Approved", 
        eventTrigger: "onApprove" as NotificationEventTrigger,
        recipients: ["Requester", "Previous Approver", "Next Approver"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 4, 
        event: "Request Rejected", 
        eventTrigger: "onReject" as NotificationEventTrigger,
        recipients: ["Requester", "All Previous Approvers"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 5, 
        event: "SLA Warning", 
        eventTrigger: "onSLA" as NotificationEventTrigger,
        recipients: ["Current Approver", "Approver's Manager"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
    ],
  },
  {
    id: "WF-002",
    name: "Market List Workflow",
    type: "Purchase Request",
    description: "Workflow for market list requests in a hotel environment",
    documentReferencePattern: "ML-{YYYY}-{00000}",
    status: "Active",
    stages: [
      { 
        id: 1, 
        name: "Request Creation", 
        approver: "Requester", 
        sla: "2", 
        slaUnit: "hours", 
        approverRoles: [roles[0].name], 
        availableActions: ["Submit"] 
      },
      { 
        id: 2, 
        name: "Department Approval", 
        approver: "Department Head", 
        sla: "4", 
        slaUnit: "hours", 
        approverRoles: [roles[2].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 3, 
        name: "Purchasing Review", 
        approver: "Purchasing Staff", 
        sla: "6", 
        slaUnit: "hours", 
        approverRoles: [roles[1].name], 
        availableActions: ["Approve", "Reject", "Send Back"] 
      },
      { 
        id: 4, 
        name: "Completed", 
        approver: "System", 
        sla: "0", 
        slaUnit: "hours", 
        approverRoles: ["System"], 
        availableActions: [] 
      },
    ],
    routingRules: [
      { 
        id: 1, 
        name: "Amount <= 5,000 BAHT", 
        description: "Skip to Completed for amounts less than or equal to 5,000 BAHT",
        triggerStage: "Department Approval",
        condition: { field: "amount", operator: "lte" as OperatorType, value: "5000" },
        action: { type: "SKIP_STAGE" as ActionType, parameters: { targetStage: "Completed" } }
      },
    ],
    notifications: [
      { 
        id: 1, 
        event: "Request Submitted", 
        eventTrigger: "onSubmit" as NotificationEventTrigger,
        recipients: ["Requester", "Department Head"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 2, 
        event: "Request Approved", 
        eventTrigger: "onApprove" as NotificationEventTrigger,
        recipients: ["Requester", "Purchasing Staff"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
      { 
        id: 3, 
        event: "Request Finalised", 
        eventTrigger: "onApprove" as NotificationEventTrigger,
        recipients: ["Requester", "Department Head", "Purchasing Staff"], 
        channels: ["Email", "System"] as NotificationChannel[] 
      },
    ],
  },
  {
    id: "WF-003",
    name: "Store Requisition Workflow",
    type: "Store Requisition",
    description: "Workflow for store requisition requests",
    documentReferencePattern: "SR-{YYYY}-{00000}",
    status: "Draft",
    stages: [],
    routingRules: [],
    notifications: [],
  },
  {
    id: "WF-004",
    name: "Asset Purchase Workflow",
    type: "Purchase Request",
    description: "Workflow for asset purchase requests",
    documentReferencePattern: "AP-{YYYY}-{00000}",
    status: "Inactive",
    stages: [],
    routingRules: [],
    notifications: [],
  },
]

export const mockRoutingRules: RoutingRule[] = sampleWorkflows[0].routingRules

