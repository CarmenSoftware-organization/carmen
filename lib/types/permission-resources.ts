// Permission Resources and Actions for Carmen ERP
// Comprehensive mapping of all system resources and their available actions

// ============================================================================
// Resource Type Definitions
// ============================================================================

export enum ResourceType {
  // Procurement Resources
  PURCHASE_REQUEST = 'purchase_request',
  PURCHASE_ORDER = 'purchase_order',
  GOODS_RECEIPT_NOTE = 'goods_receipt_note',
  CREDIT_NOTE = 'credit_note',
  VENDOR_QUOTATION = 'vendor_quotation',
  PURCHASE_REQUEST_TEMPLATE = 'purchase_request_template',
  VENDOR_COMPARISON = 'vendor_comparison',

  // Inventory Resources
  INVENTORY_ITEM = 'inventory_item',
  STOCK_COUNT = 'stock_count',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_TRANSFER = 'stock_transfer',
  PHYSICAL_COUNT = 'physical_count',
  SPOT_CHECK = 'spot_check',
  WASTAGE_REPORT = 'wastage_report',
  FRACTIONAL_INVENTORY = 'fractional_inventory',
  INVENTORY_BALANCE = 'inventory_balance',
  STOCK_MOVEMENT = 'stock_movement',
  STOCK_CARD = 'stock_card',
  PERIOD_END = 'period_end',

  // Vendor Resources
  VENDOR = 'vendor',
  VENDOR_PRICE_LIST = 'vendor_price_list',
  VENDOR_CONTRACT = 'vendor_contract',
  VENDOR_CAMPAIGN = 'vendor_campaign',
  VENDOR_TEMPLATE = 'vendor_template',
  VENDOR_PORTAL = 'vendor_portal',
  VENDOR_PERFORMANCE = 'vendor_performance',

  // Product Resources
  PRODUCT = 'product',
  PRODUCT_CATEGORY = 'product_category',
  PRODUCT_SPECIFICATION = 'product_specification',
  PRODUCT_UNIT = 'product_unit',
  ENVIRONMENTAL_IMPACT = 'environmental_impact',

  // Recipe Resources
  RECIPE = 'recipe',
  RECIPE_VARIANT = 'recipe_variant',
  RECIPE_CATEGORY = 'recipe_category',
  CUISINE_TYPE = 'cuisine_type',
  MENU_ITEM = 'menu_item',
  RECIPE_COSTING = 'recipe_costing',

  // Financial Resources
  INVOICE = 'invoice',
  PAYMENT = 'payment',
  BUDGET = 'budget',
  JOURNAL_ENTRY = 'journal_entry',
  ACCOUNT_CODE = 'account_code',
  EXCHANGE_RATE = 'exchange_rate',
  DEPARTMENT_BUDGET = 'department_budget',
  CURRENCY = 'currency',

  // Store Operations Resources
  STORE_REQUISITION = 'store_requisition',
  STOCK_REPLENISHMENT = 'stock_replenishment',

  // Production Resources
  PRODUCTION_ORDER = 'production_order',
  BATCH_PRODUCTION = 'batch_production',
  QUALITY_CONTROL = 'quality_control',
  RECIPE_EXECUTION = 'recipe_execution',

  // Reporting & Analytics Resources
  OPERATIONAL_REPORT = 'operational_report',
  FINANCIAL_REPORT = 'financial_report',
  INVENTORY_REPORT = 'inventory_report',
  VENDOR_PERFORMANCE_REPORT = 'vendor_performance_report',
  COST_ANALYSIS_REPORT = 'cost_analysis_report',
  SALES_ANALYSIS_REPORT = 'sales_analysis_report',
  CONSUMPTION_ANALYTICS = 'consumption_analytics',

  // System Resources
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  POLICY = 'policy',
  WORKFLOW = 'workflow',
  WORKFLOW_STAGE = 'workflow_stage',
  BUSINESS_RULE = 'business_rule',
  LOCATION = 'location',
  DEPARTMENT = 'department',
  NOTIFICATION = 'notification',
  AUDIT_LOG = 'audit_log',
  SYSTEM_CONFIGURATION = 'system_configuration',
  INTEGRATION_SETTINGS = 'integration_settings',
  POS_INTEGRATION = 'pos_integration',
  BACKUP_RECOVERY = 'backup_recovery',

  // Special Resources
  DASHBOARD = 'dashboard',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  SYSTEM_HEALTH = 'system_health'
}

// ============================================================================
// Standard Actions (applicable to multiple resource types)
// ============================================================================

export enum StandardAction {
  // Read Operations
  VIEW = 'view',
  LIST = 'list',
  SEARCH = 'search',
  EXPORT = 'export',
  PRINT = 'print',

  // Write Operations
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  DUPLICATE = 'duplicate',
  ARCHIVE = 'archive',
  RESTORE = 'restore',

  // Workflow Operations
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  RECALL = 'recall',
  REOPEN = 'reopen',

  // Assignment Operations
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  DELEGATE = 'delegate',
  TRANSFER = 'transfer',

  // Special Operations
  OVERRIDE = 'override',
  AUDIT = 'audit',
  CONFIGURE = 'configure',
  EXECUTE = 'execute',
  MONITOR = 'monitor',
  ANALYZE = 'analyze'
}

// ============================================================================
// Resource-Specific Action Mappings
// ============================================================================

export interface ResourceActionMapping {
  [ResourceType.PURCHASE_REQUEST]: {
    // Basic CRUD
    view: 'View purchase request details';
    list: 'List all purchase requests';
    export: 'Export purchase request data';
    print: 'Print purchase request';
    
    // Creation and Modification
    create_draft: 'Create new draft purchase request';
    update_draft: 'Update draft purchase request';
    add_items: 'Add items to purchase request';
    remove_items: 'Remove items from purchase request';
    modify_quantities: 'Modify item quantities';
    change_vendors: 'Change vendor assignments';
    add_attachments: 'Add supporting documents';
    
    // Workflow Actions
    submit_for_approval: 'Submit PR for approval';
    approve_department: 'Approve at department level';
    approve_finance: 'Approve at finance level';
    approve_gm: 'Approve at general manager level';
    reject: 'Reject purchase request';
    recall: 'Recall submitted request';
    cancel: 'Cancel purchase request';
    reopen: 'Reopen closed request';
    
    // Conversion Actions
    convert_to_po: 'Convert approved PR to PO';
    split_items: 'Split items across multiple POs';
    
    // Special Actions
    override_approval: 'Override approval requirements';
    view_approval_history: 'View approval workflow history';
    duplicate: 'Create duplicate request';
  };

  [ResourceType.PURCHASE_ORDER]: {
    view: 'View purchase order details';
    list: 'List all purchase orders';
    export: 'Export purchase order data';
    print: 'Print purchase order';
    
    create: 'Create new purchase order';
    create_from_pr: 'Create PO from approved PR';
    update: 'Update purchase order';
    modify_items: 'Modify PO items';
    change_delivery_date: 'Change delivery dates';
    
    approve: 'Approve purchase order';
    reject: 'Reject purchase order';
    cancel: 'Cancel purchase order';
    close: 'Close completed PO';
    
    send_to_vendor: 'Send PO to vendor';
    acknowledge_receipt: 'Acknowledge vendor confirmation';
    track_delivery: 'Track delivery status';
    receive_goods: 'Process goods receipt';
    
    view_grn: 'View related goods receipt notes';
    view_invoices: 'View related invoices';
  };

  [ResourceType.GOODS_RECEIPT_NOTE]: {
    view: 'View goods receipt note';
    list: 'List all GRNs';
    export: 'Export GRN data';
    print: 'Print GRN';
    
    create: 'Create new GRN';
    create_from_po: 'Create GRN from PO';
    update: 'Update GRN details';
    
    verify_quantities: 'Verify received quantities';
    verify_quality: 'Verify item quality';
    record_discrepancies: 'Record delivery discrepancies';
    
    approve: 'Approve goods receipt';
    reject: 'Reject goods receipt';
    post_inventory: 'Post to inventory';
    
    attach_documents: 'Attach delivery documents';
    process_invoice: 'Process vendor invoice';
  };

  [ResourceType.INVENTORY_ITEM]: {
    view: 'View inventory item details';
    view_stock: 'View stock levels';
    view_costs: 'View item costs and valuation';
    view_movements: 'View stock movement history';
    list: 'List inventory items';
    search: 'Search inventory items';
    export: 'Export inventory data';
    
    create: 'Create new inventory item';
    update: 'Update item details';
    archive: 'Archive inactive items';
    
    adjust_quantity: 'Adjust stock quantities';
    transfer_stock: 'Transfer stock between locations';
    write_off: 'Write off damaged/expired stock';
    reserve_stock: 'Reserve stock for orders';
    
    perform_count: 'Perform stock count';
    set_reorder_levels: 'Set reorder points';
    change_valuation: 'Change valuation method';
    
    generate_barcode: 'Generate item barcode';
    update_specifications: 'Update technical specifications';
    manage_suppliers: 'Manage item suppliers';
  };

  [ResourceType.VENDOR]: {
    view: 'View vendor profile';
    view_performance: 'View vendor performance metrics';
    list: 'List all vendors';
    search: 'Search vendors';
    export: 'Export vendor data';
    
    create: 'Create new vendor';
    update: 'Update vendor details';
    archive: 'Archive inactive vendor';
    
    activate: 'Activate vendor';
    deactivate: 'Deactivate vendor';
    approve: 'Approve vendor registration';
    
    manage_contacts: 'Manage vendor contacts';
    manage_addresses: 'Manage vendor addresses';
    manage_certifications: 'Manage certifications';
    manage_pricelist: 'Manage vendor pricelists';
    
    send_rfq: 'Send request for quotation';
    compare_prices: 'Compare vendor prices';
    rate_vendor: 'Rate vendor performance';
    
    grant_portal_access: 'Grant vendor portal access';
    revoke_portal_access: 'Revoke vendor portal access';
  };

  [ResourceType.RECIPE]: {
    view: 'View recipe details';
    view_cost: 'View recipe costing';
    list: 'List all recipes';
    search: 'Search recipes';
    export: 'Export recipe data';
    print: 'Print recipe';
    
    create: 'Create new recipe';
    update: 'Update recipe details';
    archive: 'Archive old recipe';
    
    modify_ingredients: 'Modify recipe ingredients';
    modify_instructions: 'Modify cooking instructions';
    scale_recipe: 'Scale recipe portions';
    
    calculate_cost: 'Calculate recipe cost';
    update_costing: 'Update recipe costing';
    
    create_variant: 'Create recipe variant';
    approve: 'Approve recipe for use';
    publish: 'Publish recipe to menu';
    
    assign_category: 'Assign recipe category';
    set_nutrition_info: 'Set nutritional information';
    add_allergen_info: 'Add allergen information';
  };

  [ResourceType.USER]: {
    view: 'View user profile';
    list: 'List all users';
    search: 'Search users';
    export: 'Export user data';
    
    create: 'Create new user';
    update: 'Update user profile';
    delete: 'Delete user account';
    
    activate: 'Activate user account';
    deactivate: 'Deactivate user account';
    suspend: 'Suspend user account';
    unlock: 'Unlock user account';
    
    assign_roles: 'Assign user roles';
    assign_departments: 'Assign user departments';
    assign_locations: 'Assign user locations';
    set_permissions: 'Set special permissions';
    
    reset_password: 'Reset user password';
    force_password_change: 'Force password change';
    manage_sessions: 'Manage user sessions';
    
    view_audit_log: 'View user activity log';
    impersonate: 'Impersonate user account';
  };

  [ResourceType.WORKFLOW]: {
    view: 'View workflow configuration';
    list: 'List all workflows';
    export: 'Export workflow data';
    
    create: 'Create new workflow';
    update: 'Update workflow configuration';
    delete: 'Delete workflow';
    duplicate: 'Duplicate workflow';
    
    configure_stages: 'Configure workflow stages';
    assign_approvers: 'Assign stage approvers';
    set_conditions: 'Set workflow conditions';
    
    activate: 'Activate workflow';
    deactivate: 'Deactivate workflow';
    test: 'Test workflow configuration';
    
    monitor_performance: 'Monitor workflow performance';
    view_analytics: 'View workflow analytics';
  };

  [ResourceType.REPORT]: {
    view: 'View report';
    list: 'List available reports';
    search: 'Search reports';
    
    generate: 'Generate report';
    schedule: 'Schedule report generation';
    export: 'Export report data';
    print: 'Print report';
    
    share: 'Share report with others';
    save_template: 'Save report template';
    customize: 'Customize report parameters';
    
    view_history: 'View report generation history';
    delete: 'Delete report';
  };
}

// ============================================================================
// Resource Categories for Grouping
// ============================================================================

export enum ResourceCategory {
  PROCUREMENT = 'procurement',
  INVENTORY = 'inventory', 
  VENDOR = 'vendor',
  PRODUCT = 'product',
  RECIPE = 'recipe',
  FINANCIAL = 'financial',
  OPERATIONS = 'operations',
  PRODUCTION = 'production',
  REPORTING = 'reporting',
  SYSTEM = 'system'
}

export const RESOURCE_CATEGORIES: Record<ResourceCategory, ResourceType[]> = {
  [ResourceCategory.PROCUREMENT]: [
    ResourceType.PURCHASE_REQUEST,
    ResourceType.PURCHASE_ORDER,
    ResourceType.GOODS_RECEIPT_NOTE,
    ResourceType.CREDIT_NOTE,
    ResourceType.VENDOR_QUOTATION,
    ResourceType.PURCHASE_REQUEST_TEMPLATE,
    ResourceType.VENDOR_COMPARISON
  ],
  
  [ResourceCategory.INVENTORY]: [
    ResourceType.INVENTORY_ITEM,
    ResourceType.STOCK_COUNT,
    ResourceType.STOCK_ADJUSTMENT,
    ResourceType.STOCK_TRANSFER,
    ResourceType.PHYSICAL_COUNT,
    ResourceType.SPOT_CHECK,
    ResourceType.WASTAGE_REPORT,
    ResourceType.FRACTIONAL_INVENTORY,
    ResourceType.INVENTORY_BALANCE,
    ResourceType.STOCK_MOVEMENT,
    ResourceType.STOCK_CARD,
    ResourceType.PERIOD_END
  ],
  
  [ResourceCategory.VENDOR]: [
    ResourceType.VENDOR,
    ResourceType.VENDOR_PRICE_LIST,
    ResourceType.VENDOR_CONTRACT,
    ResourceType.VENDOR_CAMPAIGN,
    ResourceType.VENDOR_TEMPLATE,
    ResourceType.VENDOR_PORTAL,
    ResourceType.VENDOR_PERFORMANCE
  ],
  
  [ResourceCategory.PRODUCT]: [
    ResourceType.PRODUCT,
    ResourceType.PRODUCT_CATEGORY,
    ResourceType.PRODUCT_SPECIFICATION,
    ResourceType.PRODUCT_UNIT,
    ResourceType.ENVIRONMENTAL_IMPACT
  ],
  
  [ResourceCategory.RECIPE]: [
    ResourceType.RECIPE,
    ResourceType.RECIPE_VARIANT,
    ResourceType.RECIPE_CATEGORY,
    ResourceType.CUISINE_TYPE,
    ResourceType.MENU_ITEM,
    ResourceType.RECIPE_COSTING
  ],
  
  [ResourceCategory.FINANCIAL]: [
    ResourceType.INVOICE,
    ResourceType.PAYMENT,
    ResourceType.BUDGET,
    ResourceType.JOURNAL_ENTRY,
    ResourceType.ACCOUNT_CODE,
    ResourceType.EXCHANGE_RATE,
    ResourceType.DEPARTMENT_BUDGET,
    ResourceType.CURRENCY
  ],
  
  [ResourceCategory.OPERATIONS]: [
    ResourceType.STORE_REQUISITION,
    ResourceType.STOCK_REPLENISHMENT
  ],
  
  [ResourceCategory.PRODUCTION]: [
    ResourceType.PRODUCTION_ORDER,
    ResourceType.BATCH_PRODUCTION,
    ResourceType.QUALITY_CONTROL,
    ResourceType.RECIPE_EXECUTION
  ],
  
  [ResourceCategory.REPORTING]: [
    ResourceType.OPERATIONAL_REPORT,
    ResourceType.FINANCIAL_REPORT,
    ResourceType.INVENTORY_REPORT,
    ResourceType.VENDOR_PERFORMANCE_REPORT,
    ResourceType.COST_ANALYSIS_REPORT,
    ResourceType.SALES_ANALYSIS_REPORT,
    ResourceType.CONSUMPTION_ANALYTICS
  ],
  
  [ResourceCategory.SYSTEM]: [
    ResourceType.USER,
    ResourceType.ROLE,
    ResourceType.PERMISSION,
    ResourceType.POLICY,
    ResourceType.WORKFLOW,
    ResourceType.WORKFLOW_STAGE,
    ResourceType.BUSINESS_RULE,
    ResourceType.LOCATION,
    ResourceType.DEPARTMENT,
    ResourceType.NOTIFICATION,
    ResourceType.AUDIT_LOG,
    ResourceType.SYSTEM_CONFIGURATION,
    ResourceType.INTEGRATION_SETTINGS,
    ResourceType.POS_INTEGRATION,
    ResourceType.BACKUP_RECOVERY,
    ResourceType.DASHBOARD,
    ResourceType.EXPORT_DATA,
    ResourceType.IMPORT_DATA,
    ResourceType.SYSTEM_HEALTH
  ]
};

// ============================================================================
// Resource Metadata
// ============================================================================

export interface ResourceMetadata {
  name: string;
  description: string;
  category: ResourceCategory;
  icon: string;
  requiresApproval: boolean;
  isAuditable: boolean;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  maxRetentionPeriod?: number; // days
}

export const RESOURCE_METADATA: Record<ResourceType, ResourceMetadata> = {
  [ResourceType.PURCHASE_REQUEST]: {
    name: 'Purchase Request',
    description: 'Request for purchasing goods or services',
    category: ResourceCategory.PROCUREMENT,
    icon: 'ShoppingCart',
    requiresApproval: true,
    isAuditable: true,
    dataClassification: 'internal'
  },
  
  [ResourceType.PURCHASE_ORDER]: {
    name: 'Purchase Order',
    description: 'Order placed with vendor for goods or services',
    category: ResourceCategory.PROCUREMENT,
    icon: 'FileText',
    requiresApproval: true,
    isAuditable: true,
    dataClassification: 'internal'
  },
  
  [ResourceType.INVENTORY_ITEM]: {
    name: 'Inventory Item',
    description: 'Items stored in inventory',
    category: ResourceCategory.INVENTORY,
    icon: 'Package',
    requiresApproval: false,
    isAuditable: true,
    dataClassification: 'internal'
  },
  
  [ResourceType.VENDOR]: {
    name: 'Vendor',
    description: 'Supplier of goods or services',
    category: ResourceCategory.VENDOR,
    icon: 'Users',
    requiresApproval: true,
    isAuditable: true,
    dataClassification: 'internal'
  },
  
  [ResourceType.RECIPE]: {
    name: 'Recipe',
    description: 'Food preparation instructions and ingredients',
    category: ResourceCategory.RECIPE,
    icon: 'ChefHat',
    requiresApproval: true,
    isAuditable: false,
    dataClassification: 'internal'
  },
  
  [ResourceType.USER]: {
    name: 'User',
    description: 'System user account',
    category: ResourceCategory.SYSTEM,
    icon: 'User',
    requiresApproval: true,
    isAuditable: true,
    dataClassification: 'confidential'
  },
  
  [ResourceType.FINANCIAL_REPORT]: {
    name: 'Financial Report',
    description: 'Financial analysis and reporting',
    category: ResourceCategory.REPORTING,
    icon: 'BarChart3',
    requiresApproval: false,
    isAuditable: true,
    dataClassification: 'confidential'
  },
  
  // Add more resource metadata as needed...
  [ResourceType.WORKFLOW]: {
    name: 'Workflow',
    description: 'Business process workflow configuration',
    category: ResourceCategory.SYSTEM,
    icon: 'GitBranch',
    requiresApproval: true,
    isAuditable: true,
    dataClassification: 'internal'
  }
  
  // Note: Add complete metadata for all resources in production
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getResourcesByCategory(category: ResourceCategory): ResourceType[] {
  return RESOURCE_CATEGORIES[category] || [];
}

export function getResourceCategory(resourceType: ResourceType): ResourceCategory | undefined {
  for (const [category, resources] of Object.entries(RESOURCE_CATEGORIES)) {
    if (resources.includes(resourceType)) {
      return category as ResourceCategory;
    }
  }
  return undefined;
}

export function getResourceMetadata(resourceType: ResourceType): ResourceMetadata | undefined {
  return RESOURCE_METADATA[resourceType];
}

export function getAvailableActions(resourceType: ResourceType): string[] {
  // This would be populated based on ResourceActionMapping
  // For now, return standard actions as fallback
  return [
    StandardAction.VIEW,
    StandardAction.LIST,
    StandardAction.CREATE,
    StandardAction.UPDATE,
    StandardAction.DELETE,
    StandardAction.EXPORT
  ];
}

export function isResourceAuditable(resourceType: ResourceType): boolean {
  const metadata = getResourceMetadata(resourceType);
  return metadata?.isAuditable || false;
}

export function requiresApproval(resourceType: ResourceType): boolean {
  const metadata = getResourceMetadata(resourceType);
  return metadata?.requiresApproval || false;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidResourceType(value: string): value is ResourceType {
  return Object.values(ResourceType).includes(value as ResourceType);
}

export function isValidStandardAction(value: string): value is StandardAction {
  return Object.values(StandardAction).includes(value as StandardAction);
}

export function isValidResourceCategory(value: string): value is ResourceCategory {
  return Object.values(ResourceCategory).includes(value as ResourceCategory);
}