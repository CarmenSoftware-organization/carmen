
// types/abac.ts

// Core Data Structures from docs/architecture/abac-design.md

export interface Money {
  amount: number;
  currency: string;
}

export interface BudgetScope {
  // Define as needed
}

export interface GeoLocation {
  // Define as needed
}

export enum Role {
  // Define roles as needed, e.g.
  Admin = 'admin',
  DepartmentManager = 'department-manager',
  FinanceManager = 'financial-manager',
  Staff = 'staff',
  WarehouseManager = 'warehouse-manager',
}

export interface Department {
  id: string;
  name: string;
  code?: string;
}

export interface Location {
  id: string;
  name: string;
}

export enum DocumentStatus {
  Draft = 'draft',
  PendingApproval = 'pending_approval',
  Approved = 'approved',
  Rejected = 'rejected',
  Archived = 'archived',
}

// Attribute Definitions

export interface SubjectAttributes {
  userId: string;
  username: string;
  email: string;
  role: Role;
  roles: Role[];
  department: Department;
  departments: Department[];
  location: Location;
  locations: Location[];
  employeeType: 'full-time' | 'part-time' | 'contractor' | 'temporary';
  seniority: number;
  clearanceLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  assignedWorkflowStages: string[];
  delegatedAuthorities: string[];
  specialPermissions: string[];
  accountStatus: 'active' | 'suspended' | 'locked' | 'inactive';
  onDuty: boolean;
  shiftTiming?: { start: Date; end: Date };
  approvalLimit?: Money;
  budgetAccess?: BudgetScope[];
}

export interface ResourceAttributes {
  resourceId: string;
  resourceType: ResourceType;
  resourceName: string;
  owner?: string;
  ownerDepartment?: string;
  ownerLocation?: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  documentStatus?: DocumentStatus;
  workflowStage?: string;
  approvalLevel?: number;
  totalValue?: Money;
  budgetCategory?: string;
  costCenter?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  effectiveDate?: Date;
  requiresAudit: boolean;
  regulatoryFlags?: string[];
  retentionPeriod?: number;
  parentResource?: string;
  relatedResources?: string[];
  dependencies?: string[];
  collaborationEnabled?: boolean;
  collaboratingDepartments?: string[];
  collaboratingUsers?: string[];
}

export interface EnvironmentAttributes {
  currentTime: Date;
  dayOfWeek: string;
  isBusinessHours: boolean;
  isHoliday: boolean;
  requestIP: string;
  requestLocation?: GeoLocation;
  isInternalNetwork: boolean;
  facility?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'api';
  deviceId?: string;
  sessionId: string;
  authenticationMethod: 'password' | 'sso' | 'mfa' | 'biometric';
  sessionAge: number;
  systemLoad: 'low' | 'normal' | 'high' | 'critical';
  maintenanceMode: boolean;
  emergencyMode: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceMode?: string[];
  auditMode: boolean;
}

// Resource Classification

export enum ResourceType {
  PURCHASE_REQUEST = 'purchase_request',
  PURCHASE_ORDER = 'purchase_order',
  GOODS_RECEIPT_NOTE = 'grn',
  CREDIT_NOTE = 'credit_note',
  INVENTORY_ITEM = 'inventory_item',
  STOCK_COUNT = 'stock_count',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_TRANSFER = 'stock_transfer',
  VENDOR = 'vendor',
  VENDOR_PRICE_LIST = 'vendor_price_list',
  VENDOR_CONTRACT = 'vendor_contract',
  PRODUCT = 'product',
  PRODUCT_CATEGORY = 'product_category',
  PRODUCT_SPECIFICATION = 'product_specification',
  RECIPE = 'recipe',
  RECIPE_VARIANT = 'recipe_variant',
  MENU_ITEM = 'menu_item',
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  BUDGET = 'budget',
  JOURNAL_ENTRY = 'journal_entry',
  STORE_REQUISITION = 'store_requisition',
  WASTAGE_REPORT = 'wastage_report',
  PRODUCTION_ORDER = 'production_order',
  USER = 'user',
  ROLE = 'role',
  WORKFLOW = 'workflow',
  REPORT = 'report',
  CONFIGURATION = 'configuration',
}

// Action Definitions

export enum StandardAction {
  VIEW = 'view',
  LIST = 'list',
  SEARCH = 'search',
  EXPORT = 'export',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  RECALL = 'recall',
  ASSIGN = 'assign',
  DELEGATE = 'delegate',
  OVERRIDE = 'override',
  AUDIT = 'audit',
}

// Policy Framework

export interface AttributeCondition {
  attribute: string;
  operator: Operator;
  value: any;
}

export enum Operator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  MATCHES = 'matches',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
}

export interface Expression {
  type: 'simple' | 'composite';
  attribute?: string;
  operator?: Operator;
  value?: any;
  expressions?: Expression[];
  logicalOperator?: 'AND' | 'OR' | 'NOT';
}

export interface Rule {
  id: string;
  description: string;
  condition: Expression;
  combiningAlgorithm?: 'all' | 'any' | 'majority';
}

export interface Obligation {
  id: string;
  type: string;
  attributes: Record<string, any>;
}

export interface Advice {
  id: string;
  type: string;
  attributes: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  target: {
    subjects?: AttributeCondition[];
    resources?: AttributeCondition[];
    actions?: string[];
    environment?: AttributeCondition[];
  };
  rules: Rule[];
  effect: 'permit' | 'deny';
  obligations?: Obligation[];
  advice?: Advice[];
}
