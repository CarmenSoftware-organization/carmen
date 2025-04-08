import { 

  ActionType, 
  OperatorType, 
  NotificationEventTrigger, 
  NotificationChannel,
  RoutingRule,
  Template,
  Workflow,
  Product
} from "../types/workflow"

const notificationTemplates: Template[] = [
  {
    id: 1,
    name: "Request Submitted",
    eventTrigger: "onSubmit",
    description: "Template for when a request is submitted",
    subjectLine: "New Purchase Request: {{request.number}}",
    content: "Dear {{approver.name}},\n\nA new purchase request ({{request.number}}) has been submitted by {{requester.name}} from {{requester.department}} and requires your attention.\n\nRequest Details:\nAmount: {{request.amount}}\nDate: {{request.date}}\n\nPlease review and take necessary action.\n\nBest regards,\n{{system.companyName}}"
  },
  {
    id: 2,
    name: "Request Approved",
    eventTrigger: "onApprove",
    description: "Template for when a request is approved",
    subjectLine: "Purchase Request Approved: {{request.number}}",
    content: "Dear {{requester.name}},\n\nYour purchase request ({{request.number}}) has been approved by {{approver.name}}.\n\nThe request will now proceed to the next stage: {{workflow.nextStage}}.\n\nBest regards,\n{{system.companyName}}"
  },
  {
    id: 3,
    name: "Request Rejected",
    eventTrigger: "onReject",
    description: "Template for when a request is rejected",
    subjectLine: "Purchase Request Rejected: {{request.number}}",
    content: "Dear {{requester.name}},\n\nYour purchase request ({{request.number}}) has been rejected by {{approver.name}}.\n\nPlease review the request and make necessary adjustments.\n\nBest regards,\n{{system.companyName}}"
  },
  {
    id: 4,
    name: "SLA Warning",
    eventTrigger: "onSLA",
    description: "Template for SLA warning notifications",
    subjectLine: "SLA Warning: Action Required for {{request.number}}",
    content: "Dear {{approver.name}},\n\nThis is a reminder that the purchase request ({{request.number}}) requires your attention.\n\nTime remaining: {{workflow.slaRemaining}}\n\nPlease take action as soon as possible.\n\nBest regards,\n{{system.companyName}}"
  }
]

const initialProducts: Product[] = [
  { id: 1, name: "Room Service", code: "RS", category: "Service" },
  { id: 2, name: "Laundry Service", code: "LS", category: "Service" },
  { id: 3, name: "Food & Beverage", code: "FB", category: "Product" },
  { id: 4, name: "Spa Service", code: "SS", category: "Service" },
  { id: 5, name: "Meeting Room", code: "MR", category: "Facility" },
]

export const sampleWorkflows: Workflow[] = [
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
        description: "Initial stage for creating and submitting requests",
        sla: "4", 
        slaUnit: "hours", 
        availableActions: ["Submit"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 2, 
        name: "Purchasing Review", 
        description: "Review by purchasing staff for accuracy and completeness",
        sla: "8", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 3, 
        name: "Department Approval", 
        description: "Review and approval by department head",
        sla: "12", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 4, 
        name: "Finance Review", 
        description: "Financial review and budget verification",
        sla: "24", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 5, 
        name: "Final Approval", 
        description: "Final approval by general manager",
        sla: "48", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 6, 
        name: "Completed", 
        description: "Request has been completed",
        sla: "0", 
        slaUnit: "hours", 
        availableActions: [],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
    ],
    routingRules: [
      { 
        id: 1, 
        name: "Amount <= 10,000 BAHT", 
        description: "Skip to Completed for amounts less than or equal to 10,000 BAHT",
        triggerStage: "Finance Review",
        condition: { field: "amount", operator: "lte", value: "10000" },
        action: { type: "SKIP_STAGE", parameters: { targetStage: "Completed" } }
      },
      { 
        id: 2, 
        name: "Amount > 10,000 BAHT", 
        description: "Route to GM Approval for amounts greater than 10,000 BAHT",
        triggerStage: "Finance Review",
        condition: { field: "amount", operator: "gt", value: "10000" },
        action: { type: "NEXT_STAGE", parameters: { targetStage: "Final Approval" } }
      },
    ],
    notifications: [
      { 
        id: 1, 
        event: "Request Submitted", 
        eventTrigger: "onSubmit",
        recipients: ["Requester", "Purchasing Staff"], 
        channels: ["Email", "System"]
      },
      { 
        id: 2, 
        event: "Pending Approval", 
        eventTrigger: "onSubmit",
        recipients: ["Current Approver"], 
        channels: ["Email", "System"]
      },
      { 
        id: 3, 
        event: "Request Approved", 
        eventTrigger: "onApprove",
        recipients: ["Requester", "Previous Approver", "Next Approver"], 
        channels: ["Email", "System"]
      },
      { 
        id: 4, 
        event: "Request Rejected", 
        eventTrigger: "onReject",
        recipients: ["Requester", "All Previous Approvers"], 
        channels: ["Email", "System"]
      },
      { 
        id: 5, 
        event: "SLA Warning", 
        eventTrigger: "onSLA",
        recipients: ["Current Approver", "Approver's Manager"], 
        channels: ["Email", "System"]
      },
    ],
    notificationTemplates,
    products: [initialProducts[0], initialProducts[2]]
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
        description: "Initial stage for creating market list requests",
        sla: "2", 
        slaUnit: "hours", 
        availableActions: ["Submit"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 2, 
        name: "Department Approval", 
        description: "Department head review of market list",
        sla: "4", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 3, 
        name: "Purchasing Review", 
        description: "Review by purchasing for market list items",
        sla: "6", 
        slaUnit: "hours", 
        availableActions: ["Approve", "Reject", "Send Back"],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
      { 
        id: 4, 
        name: "Completed", 
        description: "Market list request has been completed",
        sla: "0", 
        slaUnit: "hours", 
        availableActions: [],
        hideFields: {
          pricePerUnit: false,
          totalPrice: false
        },
        assignedUsers: []
      },
    ],
    routingRules: [
      { 
        id: 1, 
        name: "Amount <= 5,000 BAHT", 
        description: "Skip to Completed for amounts less than or equal to 5,000 BAHT",
        triggerStage: "Department Approval",
        condition: { field: "amount", operator: "lte", value: "5000" },
        action: { type: "SKIP_STAGE", parameters: { targetStage: "Completed" } }
      },
    ],
    notifications: [
      { 
        id: 1, 
        event: "Request Submitted", 
        eventTrigger: "onSubmit",
        recipients: ["Requester", "Department Head"], 
        channels: ["Email", "System"]
      },
      { 
        id: 2, 
        event: "Request Approved", 
        eventTrigger: "onApprove",
        recipients: ["Requester", "Purchasing Staff"], 
        channels: ["Email", "System"]
      },
      { 
        id: 3, 
        event: "Request Finalised", 
        eventTrigger: "onApprove",
        recipients: ["Requester", "Department Head", "Purchasing Staff"], 
        channels: ["Email", "System"]
      },
    ],
    notificationTemplates: [],
    products: [initialProducts[2], initialProducts[3]]
  }
]

export const mockRoutingRules: RoutingRule[] = sampleWorkflows[0].routingRules

