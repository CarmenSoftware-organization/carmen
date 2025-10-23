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
  isMoney,
  isValidTimezone,
  isValidCurrencyCode,
  isValidHexColor,
  isLanguage,
  isThemeMode
} from './index'

import type {
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  ApplicationSettings
} from './settings'

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

// ====== SETTINGS VALIDATORS ======

/**
 * Validate UserPreferences object
 */
export const validateUserPreferences = (preferences: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!preferences?.userId) {
    errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
  }

  // Display settings validation
  if (preferences?.display) {
    if (preferences.display.theme && !isThemeMode(preferences.display.theme)) {
      errors.push({
        field: 'display.theme',
        message: 'Theme must be one of: light, dark, system',
        code: 'INVALID_THEME'
      });
    }

    const validFontSizes = ['small', 'medium', 'large', 'extra-large'];
    if (preferences.display.fontSize && !validFontSizes.includes(preferences.display.fontSize)) {
      errors.push({
        field: 'display.fontSize',
        message: 'Font size must be one of: ' + validFontSizes.join(', '),
        code: 'INVALID_FONT_SIZE'
      });
    }
  }

  // Regional settings validation
  if (preferences?.regional) {
    if (preferences.regional.language && !isLanguage(preferences.regional.language)) {
      errors.push({
        field: 'regional.language',
        message: 'Invalid language code',
        code: 'INVALID_LANGUAGE'
      });
    }

    if (preferences.regional.timezone && !isValidTimezone(preferences.regional.timezone)) {
      errors.push({
        field: 'regional.timezone',
        message: 'Invalid timezone identifier',
        code: 'INVALID_TIMEZONE'
      });
    }

    if (preferences.regional.currency && !isValidCurrencyCode(preferences.regional.currency)) {
      errors.push({
        field: 'regional.currency',
        message: 'Invalid currency code (must be ISO 4217 format)',
        code: 'INVALID_CURRENCY'
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate CompanySettings object
 */
export const validateCompanySettings = (settings: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!settings?.companyName?.trim()) {
    errors.push({ field: 'companyName', message: 'Company name is required', code: 'REQUIRED' });
  }

  if (!settings?.legalName?.trim()) {
    errors.push({ field: 'legalName', message: 'Legal name is required', code: 'REQUIRED' });
  }

  // Email validation
  if (settings?.email) {
    const emailValidation = validateEmail(settings.email, 'email', true);
    errors.push(...emailValidation.errors);
  }

  // Phone validation (basic)
  if (settings?.phone && settings.phone.trim().length < 10) {
    errors.push({
      field: 'phone',
      message: 'Phone number must be at least 10 characters',
      code: 'INVALID_PHONE'
    });
  }

  // Address validation
  if (settings?.address) {
    if (!settings.address.street?.trim()) {
      errors.push({ field: 'address.street', message: 'Street address is required', code: 'REQUIRED' });
    }
    if (!settings.address.city?.trim()) {
      errors.push({ field: 'address.city', message: 'City is required', code: 'REQUIRED' });
    }
    if (!settings.address.country?.trim()) {
      errors.push({ field: 'address.country', message: 'Country is required', code: 'REQUIRED' });
    }
  }

  // Branding validation
  if (settings?.primaryColor && !isValidHexColor(settings.primaryColor)) {
    errors.push({
      field: 'primaryColor',
      message: 'Primary color must be a valid hex color code',
      code: 'INVALID_COLOR'
    });
  }

  if (settings?.secondaryColor && !isValidHexColor(settings.secondaryColor)) {
    errors.push({
      field: 'secondaryColor',
      message: 'Secondary color must be a valid hex color code',
      code: 'INVALID_COLOR'
    });
  }

  // Currency and timezone
  if (settings?.defaultCurrency && !isValidCurrencyCode(settings.defaultCurrency)) {
    errors.push({
      field: 'defaultCurrency',
      message: 'Invalid currency code (must be ISO 4217 format)',
      code: 'INVALID_CURRENCY'
    });
  }

  if (settings?.defaultTimezone && !isValidTimezone(settings.defaultTimezone)) {
    errors.push({
      field: 'defaultTimezone',
      message: 'Invalid timezone identifier',
      code: 'INVALID_TIMEZONE'
    });
  }

  if (settings?.defaultLanguage && !isLanguage(settings.defaultLanguage)) {
    errors.push({
      field: 'defaultLanguage',
      message: 'Invalid language code',
      code: 'INVALID_LANGUAGE'
    });
  }

  // Fiscal year validation
  if (settings?.fiscalYearStart) {
    const fiscalYearRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!fiscalYearRegex.test(settings.fiscalYearStart)) {
      errors.push({
        field: 'fiscalYearStart',
        message: 'Fiscal year start must be in MM-DD format',
        code: 'INVALID_FORMAT'
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate SecuritySettings object
 */
export const validateSecuritySettings = (settings: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Password policy validation
  if (settings?.passwordPolicy) {
    const policy = settings.passwordPolicy;

    if (policy.minLength && (policy.minLength < 6 || policy.minLength > 128)) {
      errors.push({
        field: 'passwordPolicy.minLength',
        message: 'Password minimum length must be between 6 and 128',
        code: 'INVALID_RANGE'
      });
    }

    if (policy.preventReuse && policy.preventReuse < 0) {
      errors.push({
        field: 'passwordPolicy.preventReuse',
        message: 'Password reuse prevention must be non-negative',
        code: 'INVALID_VALUE'
      });
    }

    if (policy.expiryDays && policy.expiryDays < 0) {
      errors.push({
        field: 'passwordPolicy.expiryDays',
        message: 'Password expiry days must be non-negative',
        code: 'INVALID_VALUE'
      });
    }

    // Warning for weak policies
    if (policy.minLength < 12) {
      warnings.push({
        field: 'passwordPolicy.minLength',
        message: 'Consider using a minimum length of 12 or more for better security',
        code: 'WEAK_POLICY'
      });
    }

    if (!policy.requireUppercase || !policy.requireLowercase || !policy.requireNumbers) {
      warnings.push({
        field: 'passwordPolicy',
        message: 'Consider requiring all character types for better security',
        code: 'WEAK_POLICY'
      });
    }
  }

  // Session settings validation
  if (settings?.sessionSettings) {
    const session = settings.sessionSettings;

    if (session.timeout && (session.timeout < 5 || session.timeout > 1440)) {
      errors.push({
        field: 'sessionSettings.timeout',
        message: 'Session timeout must be between 5 and 1440 minutes',
        code: 'INVALID_RANGE'
      });
    }

    if (session.maxConcurrentSessions && session.maxConcurrentSessions < 1) {
      errors.push({
        field: 'sessionSettings.maxConcurrentSessions',
        message: 'Max concurrent sessions must be at least 1',
        code: 'INVALID_VALUE'
      });
    }

    if (session.rememberMeDuration && session.rememberMeDuration < 1) {
      errors.push({
        field: 'sessionSettings.rememberMeDuration',
        message: 'Remember me duration must be at least 1 day',
        code: 'INVALID_VALUE'
      });
    }
  }

  // Login attempts validation
  if (settings?.loginAttempts) {
    const attempts = settings.loginAttempts;

    if (attempts.maxAttempts && attempts.maxAttempts < 3) {
      errors.push({
        field: 'loginAttempts.maxAttempts',
        message: 'Max login attempts should be at least 3',
        code: 'INVALID_VALUE'
      });
    }

    if (attempts.lockoutDuration && attempts.lockoutDuration < 5) {
      errors.push({
        field: 'loginAttempts.lockoutDuration',
        message: 'Lockout duration should be at least 5 minutes',
        code: 'INVALID_VALUE'
      });
    }
  }

  // IP access control validation
  if (settings?.ipAccessControl?.enabled) {
    const ipControl = settings.ipAccessControl;

    if (ipControl.whitelist && Array.isArray(ipControl.whitelist)) {
      ipControl.whitelist.forEach((ip: string, index: number) => {
        if (!isValidIPOrCIDR(ip)) {
          errors.push({
            field: `ipAccessControl.whitelist[${index}]`,
            message: 'Invalid IP address or CIDR range',
            code: 'INVALID_IP'
          });
        }
      });
    }

    if (ipControl.blacklist && Array.isArray(ipControl.blacklist)) {
      ipControl.blacklist.forEach((ip: string, index: number) => {
        if (!isValidIPOrCIDR(ip)) {
          errors.push({
            field: `ipAccessControl.blacklist[${index}]`,
            message: 'Invalid IP address or CIDR range',
            code: 'INVALID_IP'
          });
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate ApplicationSettings object
 */
export const validateApplicationSettings = (settings: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Email configuration validation
  if (settings?.email?.enabled) {
    const email = settings.email;

    if (!email.fromEmail) {
      errors.push({
        field: 'email.fromEmail',
        message: 'From email is required when email is enabled',
        code: 'REQUIRED'
      });
    } else if (!isValidEmail(email.fromEmail)) {
      errors.push({
        field: 'email.fromEmail',
        message: 'From email must be a valid email address',
        code: 'INVALID_EMAIL'
      });
    }

    if (email.provider === 'smtp') {
      if (!email.smtp?.host?.trim()) {
        errors.push({ field: 'email.smtp.host', message: 'SMTP host is required', code: 'REQUIRED' });
      }

      if (!email.smtp?.port || email.smtp.port < 1 || email.smtp.port > 65535) {
        errors.push({
          field: 'email.smtp.port',
          message: 'SMTP port must be between 1 and 65535',
          code: 'INVALID_PORT'
        });
      }
    }
  }

  // Backup settings validation
  if (settings?.backup?.enabled) {
    const backup = settings.backup;

    if (!backup.schedule?.frequency) {
      errors.push({
        field: 'backup.schedule.frequency',
        message: 'Backup frequency is required when backup is enabled',
        code: 'REQUIRED'
      });
    }

    if (backup.retention) {
      if (backup.retention.keepDaily < 0) {
        errors.push({
          field: 'backup.retention.keepDaily',
          message: 'Daily backup retention must be non-negative',
          code: 'INVALID_VALUE'
        });
      }

      if (backup.retention.keepWeekly < 0) {
        errors.push({
          field: 'backup.retention.keepWeekly',
          message: 'Weekly backup retention must be non-negative',
          code: 'INVALID_VALUE'
        });
      }

      if (backup.retention.keepMonthly < 0) {
        errors.push({
          field: 'backup.retention.keepMonthly',
          message: 'Monthly backup retention must be non-negative',
          code: 'INVALID_VALUE'
        });
      }
    }
  }

  // Data retention validation
  if (settings?.dataRetention) {
    const retention = settings.dataRetention;

    Object.entries(retention.documents || {}).forEach(([docType, days]) => {
      if (typeof days === 'number' && days < 0) {
        errors.push({
          field: `dataRetention.documents.${docType}`,
          message: 'Retention period must be non-negative',
          code: 'INVALID_VALUE'
        });
      }
    });

    Object.entries(retention.logs || {}).forEach(([logType, days]) => {
      if (typeof days === 'number' && days < 0) {
        errors.push({
          field: `dataRetention.logs.${logType}`,
          message: 'Retention period must be non-negative',
          code: 'INVALID_VALUE'
        });
      }
    });
  }

  // API rate limiting validation
  if (settings?.integrations?.api?.rateLimiting?.enabled) {
    const rateLimit = settings.integrations.api.rateLimiting;

    if (rateLimit.requestsPerMinute && rateLimit.requestsPerMinute < 1) {
      errors.push({
        field: 'integrations.api.rateLimiting.requestsPerMinute',
        message: 'Requests per minute must be at least 1',
        code: 'INVALID_VALUE'
      });
    }

    if (rateLimit.requestsPerHour && rateLimit.requestsPerHour < 1) {
      errors.push({
        field: 'integrations.api.rateLimiting.requestsPerHour',
        message: 'Requests per hour must be at least 1',
        code: 'INVALID_VALUE'
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Helper function to validate IP address or CIDR range
 */
const isValidIPOrCIDR = (value: string): boolean => {
  // IPv4 address regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv4 CIDR regex
  const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

  if (ipv4Regex.test(value)) {
    const parts = value.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  if (cidrRegex.test(value)) {
    const [ip, mask] = value.split('/');
    const maskNum = parseInt(mask, 10);
    return maskNum >= 0 && maskNum <= 32 && isValidIPOrCIDR(ip);
  }

  return false;
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