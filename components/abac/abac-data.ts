
// components/abac/abac-data.ts

export const MOCK_ABAC_DATA = {
  subjectAttributes: {
    'role.id': ['admin', 'department-manager', 'finance-manager', 'staff'],
    'department.code': ['F&B', 'PROC', 'FIN', 'HR'],
    'clearanceLevel': ['public', 'internal', 'confidential', 'restricted'],
    'onDuty': ['true', 'false'],
  },
  resourceTypes: {
    purchase_request: {
      actions: ['approve_department', 'view', 'create_draft', 'submit_for_approval'],
      attributes: ['totalValue.amount', 'dataClassification', 'documentStatus', 'ownerDepartment'],
    },
    inventory_item: {
      actions: ['view_stock', 'adjust_quantity', 'perform_count'],
      attributes: ['valuation', 'location', 'category'],
    },
    recipe: {
      actions: ['view', 'modify_ingredients', 'calculate_cost'],
      attributes: ['cost', 'category', 'isAllergenFree'],
    },
  },
  environmentAttributes: {
    'isBusinessHours': ['true', 'false'],
    'isInternalNetwork': ['true', 'false'],
    'authenticationMethod': ['password', 'sso', 'mfa'],
  },
  operators: {
    string: ['==', '!=', 'in', 'not_in', 'contains'],
    number: ['==', '!=', '>', '<', '>=', '<='],
    boolean: ['==', '!='],
  },
};
