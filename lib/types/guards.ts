/**
 * Type Guards and Type Checking Utilities
 * 
 * Type guard functions to safely check and validate types at runtime.
 * These functions help with type narrowing and safe type assertions.
 */

import { 
  User, 
  Vendor, 
  Product, 
  Recipe, 
  PurchaseRequest, 
  PurchaseOrder, 
  GoodsReceiveNote,
  InventoryItem,
  Invoice,
  DocumentStatus,
  WorkflowStatus,
  Money,
  Currency
} from './index'

// ====== CORE TYPE GUARDS ======

/**
 * Check if value is a valid Money object
 */
export const isMoney = (value: any): value is Money => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.amount === 'number' &&
    typeof value.currency === 'string' &&
    value.currency.length > 0
  );
};

/**
 * Check if value is a valid Currency object
 */
export const isCurrency = (value: any): value is Currency => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'number' &&
    typeof value.code === 'string' &&
    typeof value.description === 'string' &&
    typeof value.active === 'boolean'
  );
};

/**
 * Check if status is a valid DocumentStatus
 */
export const isDocumentStatus = (value: any): value is DocumentStatus => {
  const validStatuses: DocumentStatus[] = ['draft', 'inprogress', 'approved', 'converted', 'rejected', 'void'];
  return typeof value === 'string' && validStatuses.includes(value as DocumentStatus);
};

/**
 * Check if status is a valid WorkflowStatus
 */
export const isWorkflowStatus = (value: any): value is WorkflowStatus => {
  const validStatuses: WorkflowStatus[] = ['draft', 'pending', 'approved', 'review', 'rejected'];
  return typeof value === 'string' && validStatuses.includes(value as WorkflowStatus);
};

// ====== USER TYPE GUARDS ======

/**
 * Check if value is a User object
 */
export const isUser = (value: any): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.role === 'string' &&
    typeof value.department === 'string' &&
    Array.isArray(value.availableRoles) &&
    Array.isArray(value.availableDepartments) &&
    Array.isArray(value.availableLocations) &&
    typeof value.context === 'object'
  );
};

/**
 * Check if user has specific permission
 */
export const userHasPermission = (user: User, permission: string): boolean => {
  if (!isUser(user)) return false;
  return user.context.currentRole.permissions.includes(permission);
};

/**
 * Check if user can approve workflow stage
 */
export const userCanApproveStage = (user: User, stage: string): boolean => {
  if (!isUser(user)) return false;
  return user.assignedWorkflowStages?.includes(stage) || false;
};

// ====== VENDOR TYPE GUARDS ======

/**
 * Check if value is a Vendor object
 */
export const isVendor = (value: any): value is Vendor => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.vendorCode === 'string' &&
    typeof value.companyName === 'string' &&
    typeof value.businessRegistrationNumber === 'string' &&
    typeof value.isActive === 'boolean' &&
    Array.isArray(value.addresses) &&
    Array.isArray(value.contacts)
  );
};

/**
 * Check if vendor is active
 */
export const isActiveVendor = (vendor: Vendor): boolean => {
  return isVendor(vendor) && vendor.isActive && vendor.status === 'active';
};

// ====== PRODUCT TYPE GUARDS ======

/**
 * Check if value is a Product object
 */
export const isProduct = (value: any): value is Product => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.productCode === 'string' &&
    typeof value.productName === 'string' &&
    typeof value.productType === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.isActive === 'boolean'
  );
};

/**
 * Check if product is purchasable
 */
export const isPurchasableProduct = (product: Product): boolean => {
  return isProduct(product) && product.isPurchasable && product.isActive;
};

/**
 * Check if product is sellable
 */
export const isSellableProduct = (product: Product): boolean => {
  return isProduct(product) && product.isSellable && product.isActive;
};

// ====== INVENTORY TYPE GUARDS ======

/**
 * Check if value is an InventoryItem object
 */
export const isInventoryItem = (value: any): value is InventoryItem => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.itemCode === 'string' &&
    typeof value.itemName === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.isActive === 'boolean'
  );
};

/**
 * Check if inventory item requires serial tracking
 */
export const requiresSerialTracking = (item: InventoryItem): boolean => {
  return isInventoryItem(item) && item.isSerialized;
};

// ====== RECIPE TYPE GUARDS ======

/**
 * Check if value is a Recipe object
 */
export const isRecipe = (value: any): value is Recipe => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.recipeCode === 'string' &&
    typeof value.name === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.cuisineTypeId === 'string' &&
    Array.isArray(value.ingredients) &&
    Array.isArray(value.preparationSteps) &&
    typeof value.isActive === 'boolean'
  );
};

/**
 * Check if recipe is published and active
 */
export const isActiveRecipe = (recipe: Recipe): boolean => {
  return isRecipe(recipe) && recipe.status === 'published' && recipe.isActive;
};

// ====== PROCUREMENT TYPE GUARDS ======

/**
 * Check if value is a PurchaseRequest object
 */
export const isPurchaseRequest = (value: any): value is PurchaseRequest => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.requestNumber === 'string' &&
    typeof value.requestDate !== 'undefined' &&
    typeof value.requiredDate !== 'undefined' &&
    typeof value.departmentId === 'string' &&
    typeof value.requestedBy === 'string' &&
    isDocumentStatus(value.status)
  );
};

/**
 * Check if value is a PurchaseOrder object
 */
export const isPurchaseOrder = (value: any): value is PurchaseOrder => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.orderNumber === 'string' &&
    typeof value.vendorId === 'string' &&
    typeof value.orderDate !== 'undefined' &&
    typeof value.approvedBy === 'string'
  );
};

/**
 * Check if value is a GoodsReceiveNote object
 */
export const isGoodsReceiveNote = (value: any): value is GoodsReceiveNote => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.grnNumber === 'string' &&
    typeof value.vendorId === 'string' &&
    typeof value.receiptDate !== 'undefined' &&
    typeof value.receivedBy === 'string'
  );
};

/**
 * Check if purchase request can be approved by user
 */
export const canApprovePurchaseRequest = (pr: PurchaseRequest, user: User): boolean => {
  if (!isPurchaseRequest(pr) || !isUser(user)) return false;
  
  // Check if user has approval permission
  if (!userHasPermission(user, 'approve_pr')) return false;
  
  // Check workflow stage permissions
  const currentStage = pr.currentStage;
  if (currentStage && !userCanApproveStage(user, currentStage)) return false;
  
  return true;
};

// ====== FINANCE TYPE GUARDS ======

/**
 * Check if value is an Invoice object
 */
export const isInvoice = (value: any): value is Invoice => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.invoiceNumber === 'string' &&
    typeof value.invoiceDate !== 'undefined' &&
    typeof value.currency === 'string' &&
    isMoney(value.totalAmount)
  );
};

// ====== ARRAY TYPE GUARDS ======

/**
 * Check if array contains only User objects
 */
export const isUserArray = (value: any[]): value is User[] => {
  return Array.isArray(value) && value.every(isUser);
};

/**
 * Check if array contains only Vendor objects
 */
export const isVendorArray = (value: any[]): value is Vendor[] => {
  return Array.isArray(value) && value.every(isVendor);
};

/**
 * Check if array contains only Product objects
 */
export const isProductArray = (value: any[]): value is Product[] => {
  return Array.isArray(value) && value.every(isProduct);
};

/**
 * Check if array contains only Recipe objects
 */
export const isRecipeArray = (value: any[]): value is Recipe[] => {
  return Array.isArray(value) && value.every(isRecipe);
};

// ====== UTILITY TYPE GUARDS ======

/**
 * Check if value is a non-empty string
 */
export const isNonEmptyString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if value is a positive number
 */
export const isPositiveNumber = (value: any): value is number => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Check if value is a valid date
 */
export const isValidDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

/**
 * Check if value is a valid email
 */
export const isValidEmail = (value: any): value is string => {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Check if value is a valid UUID
 */
export const isValidUUID = (value: any): value is string => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

// ====== VALIDATION HELPERS ======

/**
 * Validate Money object with specific constraints
 */
export const isValidMoney = (
  value: any, 
  options: { minAmount?: number; maxAmount?: number; allowedCurrencies?: string[] } = {}
): value is Money => {
  if (!isMoney(value)) return false;
  
  const { minAmount, maxAmount, allowedCurrencies } = options;
  
  if (minAmount !== undefined && value.amount < minAmount) return false;
  if (maxAmount !== undefined && value.amount > maxAmount) return false;
  if (allowedCurrencies && !allowedCurrencies.includes(value.currency)) return false;
  
  return true;
};

/**
 * Validate that object has required audit fields
 */
export const hasAuditFields = (value: any): boolean => {
  return (
    typeof value === 'object' &&
    value !== null &&
    isValidDate(value.createdAt) &&
    isNonEmptyString(value.createdBy)
  );
};

/**
 * Type assertion helper with validation
 */
export const assertType = <T>(value: any, guard: (value: any) => value is T, errorMessage?: string): T => {
  if (!guard(value)) {
    throw new Error(errorMessage || `Type assertion failed`);
  }
  return value;
};