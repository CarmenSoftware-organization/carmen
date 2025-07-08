export interface FieldPermissions {
  location: boolean;
  product: boolean;
  comment: boolean;
  requestQty: boolean;
  requestUnit: boolean;
  requiredDate: boolean;
  approvedQty: boolean;
  vendor: boolean;
  price: boolean;
  orderUnit: boolean;
  // PR Header fields
  refNumber: boolean;
  date: boolean;
  type: boolean;
  requestor: boolean;
  department: boolean;
  description: boolean;
}

export function getFieldPermissions(userRole: string): FieldPermissions {
  const permissions: FieldPermissions = {
    location: false,
    product: false,
    comment: false,
    requestQty: false,
    requestUnit: false,
    requiredDate: false,
    approvedQty: false,
    vendor: false,
    price: false,
    orderUnit: false,
    refNumber: false,
    date: false,
    type: false,
    requestor: false,
    department: false,
    description: false,
  };

  switch (userRole) {
    case 'Requestor':
    case 'Staff':
      return {
        ...permissions,
        location: true,
        product: true,
        comment: true,
        requestQty: true,
        requestUnit: true,
        requiredDate: true,
        // PR Header permissions for requestor
        refNumber: true,
        date: true,
        type: true,
        requestor: true,
        department: true,
        description: true,
      };
    
    case 'Department Manager':
    case 'Approver':
      return {
        ...permissions,
        comment: true,
        approvedQty: true,
      };
    
    case 'Purchasing Staff':
    case 'Purchase':
      return {
        ...permissions,
        comment: true,
        approvedQty: true,
        vendor: true,
        price: true,
        orderUnit: true,
      };
    
    default:
      return permissions;
  }
}

export function canEditField(fieldName: keyof FieldPermissions, userRole: string): boolean {
  const permissions = getFieldPermissions(userRole);
  return permissions[fieldName];
}

// Function to check if user can view financial information (pricing, totals, transaction summary)
export function canViewFinancialInfo(userRole: string): boolean {
  const restrictedRoles = ['Requestor', 'Staff'];
  return !restrictedRoles.includes(userRole);
}