# Workflow Module - API and Stored Procedures Documentation

## 1. REST API Endpoints

### 1.1 Workflow Configuration

#### Get Workflows
```typescript
GET /api/workflows
Response: Workflow[]
```

#### Get Workflow by ID
```typescript
GET /api/workflows/:id
Response: Workflow
```

#### Create Workflow
```typescript
POST /api/workflows
Body: {
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
Response: Workflow
```

#### Update Workflow
```typescript
PUT /api/workflows/:id
Body: Partial<Workflow>
Response: Workflow
```

#### Delete Workflow
```typescript
DELETE /api/workflows/:id
Response: { success: boolean }
```

### 1.2 Stage Management

#### Get Stages
```typescript
GET /api/workflows/:workflowId/stages
Response: Stage[]
```

#### Get Stage by ID
```typescript
GET /api/workflows/:workflowId/stages/:id
Response: Stage
```

#### Create Stage
```typescript
POST /api/workflows/:workflowId/stages
Body: {
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
}
Response: Stage
```

#### Update Stage
```typescript
PUT /api/workflows/:workflowId/stages/:id
Body: Partial<Stage>
Response: Stage
```

#### Delete Stage
```typescript
DELETE /api/workflows/:workflowId/stages/:id
Response: { success: boolean }
```

### 1.3 Routing Rules

#### Get Rules
```typescript
GET /api/workflows/:workflowId/rules
Response: RoutingRule[]
```

#### Get Rule by ID
```typescript
GET /api/workflows/:workflowId/rules/:id
Response: RoutingRule
```

#### Create Rule
```typescript
POST /api/workflows/:workflowId/rules
Body: {
  name: string
  description: string
  triggerStage: string
  condition: RoutingCondition
  action: RoutingAction
}
Response: RoutingRule
```

#### Update Rule
```typescript
PUT /api/workflows/:workflowId/rules/:id
Body: Partial<RoutingRule>
Response: RoutingRule
```

#### Delete Rule
```typescript
DELETE /api/workflows/:workflowId/rules/:id
Response: { success: boolean }
```

### 1.4 Workflow Execution

#### Start Workflow
```typescript
POST /api/workflows/:workflowId/execute
Body: {
  documentId: string
  initiator: string
  initialData: Record<string, any>
}
Response: {
  instanceId: string
  currentStage: Stage
  status: string
}
```

#### Process Stage Action
```typescript
POST /api/workflows/:workflowId/instances/:instanceId/action
Body: {
  action: string
  userId: string
  comments?: string
  data?: Record<string, any>
}
Response: {
  nextStage: Stage
  status: string
}
```

#### Get Instance Status
```typescript
GET /api/workflows/:workflowId/instances/:instanceId
Response: {
  instanceId: string
  workflow: Workflow
  currentStage: Stage
  status: string
  history: {
    stage: Stage
    action: string
    actionBy: string
    actionDate: string
    comments?: string
  }[]
}
```

## 2. Stored Procedures

### 2.1 Workflow Configuration

#### sp_CreateWorkflow
```sql
PROCEDURE sp_CreateWorkflow
  @Name nvarchar(100),
  @Type nvarchar(50),
  @Description nvarchar(500),
  @DocumentPattern nvarchar(50),
  @Status nvarchar(20)
RETURNS UNIQUEIDENTIFIER
```

#### sp_UpdateWorkflow
```sql
PROCEDURE sp_UpdateWorkflow
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @Status nvarchar(20)
RETURNS bit
```

#### sp_DeleteWorkflow
```sql
PROCEDURE sp_DeleteWorkflow
  @WorkflowId uniqueidentifier
RETURNS bit
```

### 2.2 Stage Management

#### sp_CreateStage
```sql
PROCEDURE sp_CreateStage
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10),
  @AvailableActions nvarchar(max),
  @HideFields nvarchar(max)
RETURNS int
```

#### sp_UpdateStage
```sql
PROCEDURE sp_UpdateStage
  @StageId int,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10),
  @AvailableActions nvarchar(max),
  @HideFields nvarchar(max)
RETURNS bit
```

#### sp_AssignUsersToStage
```sql
PROCEDURE sp_AssignUsersToStage
  @StageId int,
  @Users nvarchar(max)
RETURNS bit
```

### 2.3 Routing Rules

#### sp_CreateRoutingRule
```sql
PROCEDURE sp_CreateRoutingRule
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @TriggerStage nvarchar(100),
  @Condition nvarchar(max),
  @Action nvarchar(max)
RETURNS int
```

#### sp_UpdateRoutingRule
```sql
PROCEDURE sp_UpdateRoutingRule
  @RuleId int,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @Condition nvarchar(max),
  @Action nvarchar(max)
RETURNS bit
```

### 2.4 Workflow Execution

#### sp_InitiateWorkflow
```sql
PROCEDURE sp_InitiateWorkflow
  @WorkflowId uniqueidentifier,
  @DocumentId nvarchar(50),
  @Initiator nvarchar(50),
  @InitialData nvarchar(max)
RETURNS uniqueidentifier
```

#### sp_ProcessStageAction
```sql
PROCEDURE sp_ProcessStageAction
  @InstanceId uniqueidentifier,
  @Action nvarchar(50),
  @UserId nvarchar(50),
  @Comments nvarchar(500),
  @ActionData nvarchar(max)
RETURNS bit
```

#### sp_GetWorkflowStatus
```sql
PROCEDURE sp_GetWorkflowStatus
  @InstanceId uniqueidentifier
RETURNS TABLE (
  InstanceId uniqueidentifier,
  WorkflowId uniqueidentifier,
  CurrentStage int,
  Status nvarchar(50),
  LastUpdated datetime
)
```

### 2.5 Notification Management

#### sp_CreateNotification
```sql
PROCEDURE sp_CreateNotification
  @WorkflowId uniqueidentifier,
  @Event nvarchar(100),
  @EventTrigger nvarchar(50),
  @Description nvarchar(500),
  @Recipients nvarchar(max),
  @Channels nvarchar(max)
RETURNS int
```

#### sp_SendNotification
```sql
PROCEDURE sp_SendNotification
  @NotificationId int,
  @InstanceId uniqueidentifier,
  @Recipients nvarchar(max),
  @TemplateData nvarchar(max)
RETURNS bit
```

## 3. Database Functions

### 3.1 Workflow Validation

#### fn_ValidateWorkflowStages
```sql
FUNCTION fn_ValidateWorkflowStages
  @WorkflowId uniqueidentifier
RETURNS bit
```

#### fn_ValidateRoutingRules
```sql
FUNCTION fn_ValidateRoutingRules
  @WorkflowId uniqueidentifier
RETURNS bit
```

### 3.2 SLA Calculations

#### fn_CalculateSLADeadline
```sql
FUNCTION fn_CalculateSLADeadline
  @StartTime datetime,
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10)
RETURNS datetime
```

#### fn_CheckSLABreached
```sql
FUNCTION fn_CheckSLABreached
  @InstanceId uniqueidentifier
RETURNS bit
```

## 4. Error Codes and Handling

### 4.1 API Error Codes
- WF001: Invalid workflow configuration
- WF002: Stage not found
- WF003: Invalid routing rule
- WF004: Unauthorized action
- WF005: Invalid workflow state transition
- WF006: SLA breach detected
- WF007: Notification delivery failure

### 4.2 Stored Procedure Error Handling
```sql
BEGIN TRY
  -- Procedure logic
END TRY
BEGIN CATCH
  INSERT INTO WorkflowErrors (
    ErrorNumber,
    ErrorSeverity,
    ErrorState,
    ErrorProcedure,
    ErrorLine,
    ErrorMessage,
    ErrorTimestamp
  )
  SELECT
    ERROR_NUMBER(),
    ERROR_SEVERITY(),
    ERROR_STATE(),
    ERROR_PROCEDURE(),
    ERROR_LINE(),
    ERROR_MESSAGE(),
    GETDATE()
  
  -- Return error to caller
  RETURN 0
END CATCH
``` 