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
  Currency,
  POSTransaction,
  PendingTransaction,
  TransactionStatus,
  TransactionError,
  ErrorCategory,
  POSMapping,
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  ApplicationSettings,
  DisplaySettings,
  RegionalSettings,
  NotificationSettings,
  ThemeMode,
  Language
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

// ====== POS INTEGRATION TYPE GUARDS ======

/**
 * Check if status is a valid TransactionStatus
 */
export const isTransactionStatus = (value: any): value is TransactionStatus => {
  const validStatuses: TransactionStatus[] = [
    'pending_approval',
    'approved',
    'rejected',
    'processing',
    'success',
    'failed',
    'manually_resolved'
  ];
  return typeof value === 'string' && validStatuses.includes(value as TransactionStatus);
};

/**
 * Check if value is a POSTransaction object
 */
export const isPOSTransaction = (value: any): value is POSTransaction => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.transactionId === 'string' &&
    typeof value.externalId === 'string' &&
    isTransactionStatus(value.status) &&
    typeof value.locationId === 'string' &&
    isMoney(value.totalAmount) &&
    typeof value.itemCount === 'number'
  );
};

/**
 * Check if value is a PendingTransaction object
 */
export const isPendingTransaction = (value: any): value is PendingTransaction => {
  return (
    isPOSTransaction(value) &&
    value.status === 'pending_approval' &&
    typeof value.requester === 'object' &&
    Array.isArray(value.lineItems)
  );
};

/**
 * Check if category is a valid ErrorCategory
 */
export const isErrorCategory = (value: any): value is ErrorCategory => {
  const validCategories = Object.values(ErrorCategory);
  return validCategories.includes(value);
};

/**
 * Check if value is a TransactionError object
 */
export const isTransactionError = (value: any): value is TransactionError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    isErrorCategory(value.category) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    typeof value.occurredAt === 'string'
  );
};

/**
 * Check if value is a POSMapping object
 */
export const isPOSMapping = (value: any): value is POSMapping => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.posItemId === 'string' &&
    typeof value.recipeId === 'string' &&
    typeof value.portionSize === 'number' &&
    typeof value.unit === 'string' &&
    typeof value.isActive === 'boolean'
  );
};

/**
 * Check if transaction can be retried
 */
export const canRetryTransaction = (transaction: POSTransaction): boolean => {
  if (!isPOSTransaction(transaction)) return false;
  return transaction.status === 'failed';
};

/**
 * Check if transaction requires approval
 */
export const requiresApproval = (transaction: POSTransaction): boolean => {
  if (!isPOSTransaction(transaction)) return false;
  return transaction.status === 'pending_approval';
};

/**
 * Check if transaction is successful
 */
export const isSuccessfulTransaction = (transaction: POSTransaction): boolean => {
  if (!isPOSTransaction(transaction)) return false;
  return transaction.status === 'success';
};

/**
 * Check if transaction has failed
 */
export const isFailedTransaction = (transaction: POSTransaction): boolean => {
  if (!isPOSTransaction(transaction)) return false;
  return transaction.status === 'failed';
};

/**
 * Check if mapping is active
 */
export const isActiveMapping = (mapping: POSMapping): boolean => {
  return isPOSMapping(mapping) && mapping.isActive;
};

/**
 * Check if user can approve POS transactions
 */
export const canApprovePOSTransaction = (user: User): boolean => {
  if (!isUser(user)) return false;
  return userHasPermission(user, 'approve_transactions');
};

/**
 * Check if user can retry POS transactions
 */
export const canRetryPOSTransaction = (user: User): boolean => {
  if (!isUser(user)) return false;
  return userHasPermission(user, 'retry_transactions');
};

/**
 * Check if user can manage POS mappings
 */
export const canManagePOSMappings = (user: User): boolean => {
  if (!isUser(user)) return false;
  return userHasPermission(user, 'manage_pos_mappings') ||
         userHasPermission(user, 'create_mappings');
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

// ====== SETTINGS TYPE GUARDS ======

/**
 * Check if value is a valid ThemeMode
 */
export const isThemeMode = (value: any): value is ThemeMode => {
  const validModes: ThemeMode[] = ['light', 'dark', 'system'];
  return typeof value === 'string' && validModes.includes(value as ThemeMode);
};

/**
 * Check if value is a valid Language
 */
export const isLanguage = (value: any): value is Language => {
  const validLanguages: Language[] = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru', 'ko', 'ar'];
  return typeof value === 'string' && validLanguages.includes(value as Language);
};

/**
 * Check if value is a valid DisplaySettings object
 */
export const isDisplaySettings = (value: any): value is DisplaySettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    isThemeMode(value.theme) &&
    typeof value.fontSize === 'string' &&
    typeof value.highContrast === 'boolean' &&
    typeof value.compactMode === 'boolean' &&
    typeof value.showAnimations === 'boolean' &&
    typeof value.sidebarCollapsed === 'boolean'
  );
};

/**
 * Check if value is a valid RegionalSettings object
 */
export const isRegionalSettings = (value: any): value is RegionalSettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    isLanguage(value.language) &&
    typeof value.timezone === 'string' &&
    typeof value.currency === 'string' &&
    typeof value.dateFormat === 'string' &&
    typeof value.timeFormat === 'string' &&
    typeof value.numberFormat === 'string' &&
    typeof value.firstDayOfWeek === 'string'
  );
};

/**
 * Check if value is a valid NotificationSettings object
 */
export const isNotificationSettings = (value: any): value is NotificationSettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray(value.preferences) &&
    typeof value.emailDigest === 'object' &&
    typeof value.doNotDisturb === 'object' &&
    typeof value.soundEnabled === 'boolean' &&
    typeof value.desktopNotifications === 'boolean'
  );
};

/**
 * Check if value is a UserPreferences object
 */
export const isUserPreferences = (value: any): value is UserPreferences => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    isDisplaySettings(value.display) &&
    isRegionalSettings(value.regional) &&
    isNotificationSettings(value.notifications) &&
    isValidDate(value.updatedAt) &&
    isValidDate(value.createdAt)
  );
};

/**
 * Check if value is a CompanySettings object
 */
export const isCompanySettings = (value: any): value is CompanySettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.companyName === 'string' &&
    typeof value.legalName === 'string' &&
    typeof value.taxId === 'string' &&
    typeof value.address === 'object' &&
    typeof value.phone === 'string' &&
    typeof value.email === 'string' &&
    isValidEmail(value.email) &&
    typeof value.logo === 'object' &&
    typeof value.defaultCurrency === 'string' &&
    typeof value.defaultTimezone === 'string' &&
    isLanguage(value.defaultLanguage) &&
    isValidDate(value.updatedAt) &&
    isValidDate(value.createdAt)
  );
};

/**
 * Check if value is a SecuritySettings object
 */
export const isSecuritySettings = (value: any): value is SecuritySettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.passwordPolicy === 'object' &&
    typeof value.sessionSettings === 'object' &&
    typeof value.twoFactor === 'object' &&
    typeof value.ipAccessControl === 'object' &&
    typeof value.loginAttempts === 'object' &&
    isValidDate(value.updatedAt) &&
    isValidDate(value.createdAt)
  );
};

/**
 * Check if value is an ApplicationSettings object
 */
export const isApplicationSettings = (value: any): value is ApplicationSettings => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'object' &&
    typeof value.backup === 'object' &&
    typeof value.dataRetention === 'object' &&
    typeof value.integrations === 'object' &&
    typeof value.features === 'object' &&
    typeof value.performance === 'object' &&
    isValidDate(value.updatedAt) &&
    isValidDate(value.createdAt)
  );
};

/**
 * Check if user can view settings
 */
export const canViewSettings = (user: User, settingsType: 'user' | 'company' | 'security' | 'application'): boolean => {
  if (!isUser(user)) return false;

  // All users can view their own preferences
  if (settingsType === 'user') {
    return userHasPermission(user, 'settings:user-preferences:view');
  }

  // Company, security, and application settings require specific permissions
  const permission = `settings:${settingsType}:view`;
  return userHasPermission(user, permission);
};

/**
 * Check if user can edit settings
 */
export const canEditSettings = (user: User, settingsType: 'user' | 'company' | 'security' | 'application'): boolean => {
  if (!isUser(user)) return false;

  // All users can edit their own preferences
  if (settingsType === 'user') {
    return userHasPermission(user, 'settings:user-preferences:edit');
  }

  // Company, security, and application settings require admin permissions
  const permission = `settings:${settingsType}:edit`;
  return userHasPermission(user, permission);
};

/**
 * Validate timezone string (basic IANA format check)
 */
export const isValidTimezone = (value: any): value is string => {
  if (typeof value !== 'string') return false;
  // Basic validation for IANA timezone format (e.g., 'America/New_York')
  const timezoneRegex = /^[A-Z][a-zA-Z]*\/[A-Z][a-zA-Z_]*$/;
  return timezoneRegex.test(value) || value === 'UTC';
};

/**
 * Validate currency code (ISO 4217 format)
 */
export const isValidCurrencyCode = (value: any): value is string => {
  if (typeof value !== 'string') return false;
  // ISO 4217 currency codes are 3 uppercase letters
  const currencyRegex = /^[A-Z]{3}$/;
  return currencyRegex.test(value);
};

/**
 * Validate hex color code
 */
export const isValidHexColor = (value: any): value is string => {
  if (typeof value !== 'string') return false;
  const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexColorRegex.test(value);
};