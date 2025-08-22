/**
 * Data Validation Utilities
 * 
 * Validation functions for ensuring data integrity and business rule compliance.
 * These validators help enforce business constraints and data quality.
 */

import { 
  Money,
  User,
  Vendor,
  Product,
  Recipe,
  PurchaseRequest,
  PurchaseOrder,
  InventoryItem,
  isValidEmail,
  isPositiveNumber,
  isValidDate,
  isMoney
} from './index'

// ====== VALIDATION RESULT TYPES ======

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ====== CORE VALIDATORS ======

/**
 * Validate Money object
 */
export const validateMoney = (
  money: any, 
  fieldName: string = 'amount',
  options: {
    required?: boolean;
    minAmount?: number;
    maxAmount?: number;
    allowedCurrencies?: string[];
  } = {}
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (options.required && !money) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    });
    return { isValid: false, errors, warnings };
  }
  
  if (money && !isMoney(money)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid Money object`,
      code: 'INVALID_TYPE'
    });
    return { isValid: false, errors, warnings };
  }
  
  if (money) {
    const { minAmount, maxAmount, allowedCurrencies } = options;
    
    if (minAmount !== undefined && money.amount < minAmount) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${minAmount}`,
        code: 'MIN_VALUE'
      });
    }
    
    if (maxAmount !== undefined && money.amount > maxAmount) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${maxAmount}`,
        code: 'MAX_VALUE'
      });
    }
    
    if (allowedCurrencies && !allowedCurrencies.includes(money.currency)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} currency must be one of: ${allowedCurrencies.join(', ')}`,
        code: 'INVALID_CURRENCY'
      });
    }
    
    if (money.amount < 0) {
      warnings.push({
        field: fieldName,
        message: `${fieldName} is negative`,
        code: 'NEGATIVE_AMOUNT'
      });
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate email address
 */
export const validateEmail = (
  email: any, 
  fieldName: string = 'email',
  required: boolean = false
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (required && (!email || email.trim() === '')) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    });
    return { isValid: false, errors, warnings };
  }
  
  if (email && !isValidEmail(email)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid email address`,
      code: 'INVALID_EMAIL'
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate date field
 */
export const validateDate = (
  date: any,
  fieldName: string = 'date',
  options: {
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
    futureOnly?: boolean;
    pastOnly?: boolean;
  } = {}
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (options.required && !date) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    });
    return { isValid: false, errors, warnings };
  }
  
  if (date && !isValidDate(date)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a valid date`,
      code: 'INVALID_DATE'
    });
    return { isValid: false, errors, warnings };
  }
  
  if (date && isValidDate(date)) {
    const now = new Date();
    const { minDate, maxDate, futureOnly, pastOnly } = options;
    
    if (minDate && date < minDate) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be after ${minDate.toDateString()}`,
        code: 'MIN_DATE'
      });
    }
    
    if (maxDate && date > maxDate) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be before ${maxDate.toDateString()}`,
        code: 'MAX_DATE'
      });
    }
    
    if (futureOnly && date <= now) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be in the future`,
        code: 'FUTURE_ONLY'
      });
    }
    
    if (pastOnly && date >= now) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be in the past`,
        code: 'PAST_ONLY'
      });
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

// ====== BUSINESS ENTITY VALIDATORS ======

/**
 * Validate User object
 */
export const validateUser = (user: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!user?.id) {
    errors.push({ field: 'id', message: 'User ID is required', code: 'REQUIRED' });
  }
  
  if (!user?.name?.trim()) {
    errors.push({ field: 'name', message: 'User name is required', code: 'REQUIRED' });
  }
  
  // Email validation
  const emailValidation = validateEmail(user?.email, 'email', true);
  errors.push(...emailValidation.errors);
  warnings.push(...emailValidation.warnings);
  
  // Role validation
  if (!user?.role) {
    errors.push({ field: 'role', message: 'User role is required', code: 'REQUIRED' });
  }
  
  // Department validation
  if (!user?.department) {
    errors.push({ field: 'department', message: 'User department is required', code: 'REQUIRED' });
  }
  
  // Context validation
  if (!user?.context) {
    errors.push({ field: 'context', message: 'User context is required', code: 'REQUIRED' });
  } else {
    if (!user.context.currentRole) {
      errors.push({ field: 'context.currentRole', message: 'Current role is required', code: 'REQUIRED' });
    }
    
    if (!user.context.currentDepartment) {
      errors.push({ field: 'context.currentDepartment', message: 'Current department is required', code: 'REQUIRED' });
    }
    
    if (!user.context.currentLocation) {
      errors.push({ field: 'context.currentLocation', message: 'Current location is required', code: 'REQUIRED' });
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate Vendor object
 */
export const validateVendor = (vendor: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!vendor?.id) {
    errors.push({ field: 'id', message: 'Vendor ID is required', code: 'REQUIRED' });
  }
  
  if (!vendor?.vendorCode?.trim()) {
    errors.push({ field: 'vendorCode', message: 'Vendor code is required', code: 'REQUIRED' });
  }
  
  if (!vendor?.companyName?.trim()) {
    errors.push({ field: 'companyName', message: 'Company name is required', code: 'REQUIRED' });
  }
  
  if (!vendor?.businessRegistrationNumber?.trim()) {
    errors.push({ field: 'businessRegistrationNumber', message: 'Business registration number is required', code: 'REQUIRED' });
  }
  
  // Addresses validation
  if (!vendor?.addresses || !Array.isArray(vendor.addresses) || vendor.addresses.length === 0) {
    errors.push({ field: 'addresses', message: 'At least one address is required', code: 'REQUIRED' });
  } else {
    const primaryAddresses = vendor.addresses.filter((addr: any) => addr.isPrimary);
    if (primaryAddresses.length === 0) {
      warnings.push({ field: 'addresses', message: 'No primary address specified', code: 'NO_PRIMARY' });
    } else if (primaryAddresses.length > 1) {
      warnings.push({ field: 'addresses', message: 'Multiple primary addresses found', code: 'MULTIPLE_PRIMARY' });
    }
  }
  
  // Contacts validation
  if (!vendor?.contacts || !Array.isArray(vendor.contacts) || vendor.contacts.length === 0) {
    errors.push({ field: 'contacts', message: 'At least one contact is required', code: 'REQUIRED' });
  } else {
    const primaryContacts = vendor.contacts.filter((contact: any) => contact.isPrimary);
    if (primaryContacts.length === 0) {
      warnings.push({ field: 'contacts', message: 'No primary contact specified', code: 'NO_PRIMARY' });
    }
    
    // Validate contact emails
    vendor.contacts.forEach((contact: any, index: number) => {
      if (contact.email) {
        const emailValidation = validateEmail(contact.email, `contacts[${index}].email`);
        errors.push(...emailValidation.errors);
        warnings.push(...emailValidation.warnings);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate Purchase Request
 */
export const validatePurchaseRequest = (pr: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!pr?.requestNumber?.trim()) {
    errors.push({ field: 'requestNumber', message: 'Request number is required', code: 'REQUIRED' });
  }
  
  if (!pr?.departmentId) {
    errors.push({ field: 'departmentId', message: 'Department is required', code: 'REQUIRED' });
  }
  
  if (!pr?.locationId) {
    errors.push({ field: 'locationId', message: 'Location is required', code: 'REQUIRED' });
  }
  
  if (!pr?.requestedBy) {
    errors.push({ field: 'requestedBy', message: 'Requested by is required', code: 'REQUIRED' });
  }
  
  // Date validations
  const requestDateValidation = validateDate(pr?.requestDate, 'requestDate', { required: true });
  errors.push(...requestDateValidation.errors);
  
  const requiredDateValidation = validateDate(pr?.requiredDate, 'requiredDate', { 
    required: true, 
    futureOnly: true 
  });
  errors.push(...requiredDateValidation.errors);
  
  // Required date should be after request date
  if (pr?.requestDate && pr?.requiredDate && pr.requiredDate <= pr.requestDate) {
    errors.push({
      field: 'requiredDate',
      message: 'Required date must be after request date',
      code: 'INVALID_DATE_RANGE'
    });
  }
  
  // Estimated total validation
  if (pr?.estimatedTotal) {
    const totalValidation = validateMoney(pr.estimatedTotal, 'estimatedTotal');
    errors.push(...totalValidation.errors);
    warnings.push(...totalValidation.warnings);
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate Purchase Order
 */
export const validatePurchaseOrder = (po: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!po?.orderNumber?.trim()) {
    errors.push({ field: 'orderNumber', message: 'Order number is required', code: 'REQUIRED' });
  }
  
  if (!po?.vendorId) {
    errors.push({ field: 'vendorId', message: 'Vendor is required', code: 'REQUIRED' });
  }
  
  if (!po?.approvedBy) {
    errors.push({ field: 'approvedBy', message: 'Approved by is required', code: 'REQUIRED' });
  }
  
  // Date validations
  const orderDateValidation = validateDate(po?.orderDate, 'orderDate', { required: true });
  errors.push(...orderDateValidation.errors);
  
  const deliveryDateValidation = validateDate(po?.expectedDeliveryDate, 'expectedDeliveryDate', { 
    required: true,
    minDate: po?.orderDate
  });
  errors.push(...deliveryDateValidation.errors);
  
  // Amount validations
  if (po?.totalAmount) {
    const totalValidation = validateMoney(po.totalAmount, 'totalAmount', {
      required: true,
      minAmount: 0
    });
    errors.push(...totalValidation.errors);
    warnings.push(...totalValidation.warnings);
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate Product
 */
export const validateProduct = (product: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!product?.productCode?.trim()) {
    errors.push({ field: 'productCode', message: 'Product code is required', code: 'REQUIRED' });
  }
  
  if (!product?.productName?.trim()) {
    errors.push({ field: 'productName', message: 'Product name is required', code: 'REQUIRED' });
  }
  
  if (!product?.categoryId) {
    errors.push({ field: 'categoryId', message: 'Category is required', code: 'REQUIRED' });
  }
  
  if (!product?.baseUnit) {
    errors.push({ field: 'baseUnit', message: 'Base unit is required', code: 'REQUIRED' });
  }
  
  // Validate costs if provided
  if (product?.standardCost) {
    const costValidation = validateMoney(product.standardCost, 'standardCost', {
      minAmount: 0
    });
    errors.push(...costValidation.errors);
    warnings.push(...costValidation.warnings);
  }
  
  // Validate quantities
  if (product?.minimumOrderQuantity && !isPositiveNumber(product.minimumOrderQuantity)) {
    errors.push({
      field: 'minimumOrderQuantity',
      message: 'Minimum order quantity must be positive',
      code: 'INVALID_QUANTITY'
    });
  }
  
  if (product?.maximumOrderQuantity && !isPositiveNumber(product.maximumOrderQuantity)) {
    errors.push({
      field: 'maximumOrderQuantity',
      message: 'Maximum order quantity must be positive',
      code: 'INVALID_QUANTITY'
    });
  }
  
  // Check min/max quantity relationship
  if (product?.minimumOrderQuantity && product?.maximumOrderQuantity && 
      product.minimumOrderQuantity > product.maximumOrderQuantity) {
    errors.push({
      field: 'maximumOrderQuantity',
      message: 'Maximum quantity must be greater than minimum quantity',
      code: 'INVALID_RANGE'
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate Recipe
 */
export const validateRecipe = (recipe: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Required fields
  if (!recipe?.recipeCode?.trim()) {
    errors.push({ field: 'recipeCode', message: 'Recipe code is required', code: 'REQUIRED' });
  }
  
  if (!recipe?.name?.trim()) {
    errors.push({ field: 'name', message: 'Recipe name is required', code: 'REQUIRED' });
  }
  
  if (!recipe?.categoryId) {
    errors.push({ field: 'categoryId', message: 'Category is required', code: 'REQUIRED' });
  }
  
  if (!recipe?.cuisineTypeId) {
    errors.push({ field: 'cuisineTypeId', message: 'Cuisine type is required', code: 'REQUIRED' });
  }
  
  // Validate yield
  if (!recipe?.yield || !isPositiveNumber(recipe.yield)) {
    errors.push({
      field: 'yield',
      message: 'Recipe yield must be positive',
      code: 'INVALID_YIELD'
    });
  }
  
  // Validate timing
  if (recipe?.prepTime && (!Number.isInteger(recipe.prepTime) || recipe.prepTime < 0)) {
    errors.push({
      field: 'prepTime',
      message: 'Preparation time must be a non-negative integer',
      code: 'INVALID_TIME'
    });
  }
  
  if (recipe?.cookTime && (!Number.isInteger(recipe.cookTime) || recipe.cookTime < 0)) {
    errors.push({
      field: 'cookTime',
      message: 'Cook time must be a non-negative integer',
      code: 'INVALID_TIME'
    });
  }
  
  // Validate ingredients
  if (!recipe?.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push({ field: 'ingredients', message: 'At least one ingredient is required', code: 'REQUIRED' });
  } else {
    recipe.ingredients.forEach((ingredient: any, index: number) => {
      if (!ingredient.name?.trim()) {
        errors.push({
          field: `ingredients[${index}].name`,
          message: 'Ingredient name is required',
          code: 'REQUIRED'
        });
      }
      
      if (!isPositiveNumber(ingredient.quantity)) {
        errors.push({
          field: `ingredients[${index}].quantity`,
          message: 'Ingredient quantity must be positive',
          code: 'INVALID_QUANTITY'
        });
      }
    });
  }
  
  // Validate preparation steps
  if (!recipe?.preparationSteps || !Array.isArray(recipe.preparationSteps) || recipe.preparationSteps.length === 0) {
    errors.push({ field: 'preparationSteps', message: 'At least one preparation step is required', code: 'REQUIRED' });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

// ====== BUSINESS RULE VALIDATORS ======

/**
 * Validate that purchase request amount is within budget
 */
export const validatePurchaseRequestBudget = (
  pr: PurchaseRequest,
  budgetLimit: Money
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (pr.estimatedTotal && budgetLimit) {
    if (pr.estimatedTotal.currency !== budgetLimit.currency) {
      errors.push({
        field: 'estimatedTotal',
        message: 'Purchase request currency does not match budget currency',
        code: 'CURRENCY_MISMATCH'
      });
    } else if (pr.estimatedTotal.amount > budgetLimit.amount) {
      errors.push({
        field: 'estimatedTotal',
        message: `Purchase request amount exceeds budget limit of ${budgetLimit.amount}`,
        code: 'BUDGET_EXCEEDED'
      });
    } else if (pr.estimatedTotal.amount > budgetLimit.amount * 0.8) {
      warnings.push({
        field: 'estimatedTotal',
        message: `Purchase request amount is near budget limit (${Math.round(pr.estimatedTotal.amount / budgetLimit.amount * 100)}%)`,
        code: 'BUDGET_WARNING'
      });
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate vendor eligibility for purchase order
 */
export const validateVendorEligibility = (vendor: Vendor): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!vendor.isActive) {
    errors.push({
      field: 'vendor',
      message: 'Vendor is not active',
      code: 'VENDOR_INACTIVE'
    });
  }
  
  if (vendor.status === 'suspended') {
    errors.push({
      field: 'vendor',
      message: 'Vendor is suspended',
      code: 'VENDOR_SUSPENDED'
    });
  }
  
  if (vendor.status === 'blacklisted') {
    errors.push({
      field: 'vendor',
      message: 'Vendor is blacklisted',
      code: 'VENDOR_BLACKLISTED'
    });
  }
  
  if (vendor.status === 'under_review') {
    warnings.push({
      field: 'vendor',
      message: 'Vendor is under review',
      code: 'VENDOR_UNDER_REVIEW'
    });
  }
  
  return { isValid: errors.length === 0, errors, warnings };
};

// ====== UTILITY FUNCTIONS ======

/**
 * Combine multiple validation results
 */
export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  
  results.forEach(result => {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Create validation error
 */
export const createValidationError = (
  field: string, 
  message: string, 
  code: string = 'VALIDATION_ERROR'
): ValidationError => {
  return { field, message, code };
};

/**
 * Create validation warning
 */
export const createValidationWarning = (
  field: string, 
  message: string, 
  code: string = 'VALIDATION_WARNING'
): ValidationWarning => {
  return { field, message, code };
};