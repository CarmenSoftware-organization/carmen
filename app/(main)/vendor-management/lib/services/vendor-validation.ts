// Vendor Validation Service - Phase 1 Task 2
// Implements comprehensive validation and business rules for vendors

import { 
  Vendor, 
  ValidationResult, 
  ValidationError,
  ApiResponse 
} from '../../types'
import { vendorApi } from '../api'

// Advanced validation rules interface
export interface VendorValidationConfig {
  strictMode: boolean
  allowWarnings: boolean
  customRules: CustomValidationRule[]
  skipFields: string[]
  requireAllFields: boolean
}

export interface CustomValidationRule {
  field: string
  validator: (value: any, vendor: Partial<Vendor>) => ValidationError | null
  severity: 'error' | 'warning' | 'info'
  message: string
}

// Field-specific validation rules
export const FIELD_VALIDATORS = {
  // Company name validation
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/,
    blacklistWords: ['test', 'dummy', 'example'],
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return {
          field: 'name',
          code: 'REQUIRED',
          message: 'Company name is required',
          severity: 'error'
        }
      }

      if (value.length < 2) {
        return {
          field: 'name',
          code: 'TOO_SHORT',
          message: 'Company name must be at least 2 characters long',
          severity: 'error'
        }
      }

      if (value.length > 100) {
        return {
          field: 'name',
          code: 'TOO_LONG',
          message: 'Company name must be no more than 100 characters long',
          severity: 'error'
        }
      }

      if (!/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/.test(value)) {
        return {
          field: 'name',
          code: 'INVALID_CHARACTERS',
          message: 'Company name contains invalid characters',
          severity: 'error'
        }
      }

      // Check for blacklisted words
      const lowerValue = value.toLowerCase()
      const blacklistWords = ['test', 'dummy', 'example', 'sample']
      for (const word of blacklistWords) {
        if (lowerValue.includes(word)) {
          return {
            field: 'name',
            code: 'BLACKLISTED_WORD',
            message: `Company name should not contain "${word}"`,
            severity: 'warning'
          }
        }
      }

      return null
    }
  },

  // Email validation
  contactEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    disposableEmailDomains: ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'],
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return {
          field: 'contactEmail',
          code: 'REQUIRED',
          message: 'Contact email is required',
          severity: 'error'
        }
      }

      if (value.length > 254) {
        return {
          field: 'contactEmail',
          code: 'TOO_LONG',
          message: 'Email address is too long',
          severity: 'error'
        }
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return {
          field: 'contactEmail',
          code: 'INVALID_FORMAT',
          message: 'Invalid email format',
          severity: 'error'
        }
      }

      // Check for disposable email domains
      const domain = value.split('@')[1]?.toLowerCase()
      const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com']
      if (domain && disposableDomains.includes(domain)) {
        return {
          field: 'contactEmail',
          code: 'DISPOSABLE_EMAIL',
          message: 'Please use a business email address',
          severity: 'warning'
        }
      }

      return null
    }
  },

  // Phone validation
  contactPhone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
    minLength: 10,
    maxLength: 20,
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return {
          field: 'contactPhone',
          code: 'REQUIRED',
          message: 'Contact phone is required',
          severity: 'error'
        }
      }

      // Remove all non-digit characters for length check
      const digitsOnly = value.replace(/\D/g, '')
      
      if (digitsOnly.length < 10) {
        return {
          field: 'contactPhone',
          code: 'TOO_SHORT',
          message: 'Phone number must have at least 10 digits',
          severity: 'error'
        }
      }

      if (digitsOnly.length > 15) {
        return {
          field: 'contactPhone',
          code: 'TOO_LONG',
          message: 'Phone number must have no more than 15 digits',
          severity: 'error'
        }
      }

      if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
        return {
          field: 'contactPhone',
          code: 'INVALID_FORMAT',
          message: 'Invalid phone number format',
          severity: 'error'
        }
      }

      return null
    }
  },

  // Address validation
  address: {
    required: true,
    validate: (value: any): ValidationError | null => {
      if (!value) {
        return {
          field: 'address',
          code: 'REQUIRED',
          message: 'Address is required',
          severity: 'error'
        }
      }

      if (typeof value !== 'object') {
        return {
          field: 'address',
          code: 'INVALID_TYPE',
          message: 'Address must be an object',
          severity: 'error'
        }
      }

      // Validate street
      if (!value.street || typeof value.street !== 'string') {
        return {
          field: 'address.street',
          code: 'REQUIRED',
          message: 'Street address is required',
          severity: 'error'
        }
      }

      if (value.street.length < 5) {
        return {
          field: 'address.street',
          code: 'TOO_SHORT',
          message: 'Street address must be at least 5 characters long',
          severity: 'error'
        }
      }

      // Validate city
      if (!value.city || typeof value.city !== 'string') {
        return {
          field: 'address.city',
          code: 'REQUIRED',
          message: 'City is required',
          severity: 'error'
        }
      }

      if (value.city.length < 2) {
        return {
          field: 'address.city',
          code: 'TOO_SHORT',
          message: 'City must be at least 2 characters long',
          severity: 'error'
        }
      }

      // Validate state
      if (!value.state || typeof value.state !== 'string') {
        return {
          field: 'address.state',
          code: 'REQUIRED',
          message: 'State is required',
          severity: 'error'
        }
      }

      if (value.state.length < 2) {
        return {
          field: 'address.state',
          code: 'TOO_SHORT',
          message: 'State must be at least 2 characters long',
          severity: 'error'
        }
      }

      // Validate postal code
      if (!value.postalCode || typeof value.postalCode !== 'string') {
        return {
          field: 'address.postalCode',
          code: 'REQUIRED',
          message: 'Postal code is required',
          severity: 'error'
        }
      }

      if (!/^[\d\-\s]+$/.test(value.postalCode)) {
        return {
          field: 'address.postalCode',
          code: 'INVALID_FORMAT',
          message: 'Invalid postal code format',
          severity: 'error'
        }
      }

      // Validate country
      if (!value.country || typeof value.country !== 'string') {
        return {
          field: 'address.country',
          code: 'REQUIRED',
          message: 'Country is required',
          severity: 'error'
        }
      }

      if (value.country.length < 2) {
        return {
          field: 'address.country',
          code: 'TOO_SHORT',
          message: 'Country must be at least 2 characters long',
          severity: 'error'
        }
      }

      return null
    }
  },

  // Status validation
  status: {
    required: false,
    allowedValues: ['active', 'inactive', 'suspended'],
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return null // Status is optional during creation
      }

      const allowedValues = ['active', 'inactive', 'suspended']
      if (!allowedValues.includes(value)) {
        return {
          field: 'status',
          code: 'INVALID_VALUE',
          message: `Invalid status. Allowed values: ${allowedValues.join(', ')}`,
          severity: 'error'
        }
      }

      return null
    }
  },

  // Currency validation
  preferredCurrency: {
    required: true,
    allowedValues: ['BHT', 'USD', 'CNY', 'SGD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR', 'MXN'],
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return {
          field: 'preferredCurrency',
          code: 'REQUIRED',
          message: 'Preferred currency is required',
          severity: 'error'
        }
      }

      const allowedValues = ['BHT', 'USD', 'CNY', 'SGD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR', 'MXN']
      if (!allowedValues.includes(value)) {
        return {
          field: 'preferredCurrency',
          code: 'INVALID_VALUE',
          message: `Invalid currency. Allowed values: ${allowedValues.join(', ')}`,
          severity: 'error'
        }
      }

      return null
    }
  },

  // Payment terms validation
  paymentTerms: {
    required: false,
    maxLength: 500,
    validate: (value: string): ValidationError | null => {
      if (!value) {
        return null // Payment terms are optional
      }

      if (value.length > 500) {
        return {
          field: 'paymentTerms',
          code: 'TOO_LONG',
          message: 'Payment terms must be no more than 500 characters long',
          severity: 'error'
        }
      }

      return null
    }
  }
}

// Main validation service class
export class VendorValidationService {
  private config: VendorValidationConfig

  constructor(config: Partial<VendorValidationConfig> = {}) {
    this.config = {
      strictMode: false,
      allowWarnings: true,
      customRules: [],
      skipFields: [],
      requireAllFields: false,
      ...config
    }
  }

  // Validate entire vendor object
  async validateVendor(vendor: Partial<Vendor>): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    const validatedFields: string[] = []

    // Validate each field
    for (const [fieldName, validator] of Object.entries(FIELD_VALIDATORS)) {
      if (this.config.skipFields.includes(fieldName)) {
        continue
      }

      const fieldValue = this.getFieldValue(vendor, fieldName)
      
      try {
        const result = validator.validate(fieldValue)
        if (result) {
          if (result.severity === 'error') {
            errors.push(result)
          } else if (result.severity === 'warning' && this.config.allowWarnings) {
            warnings.push(result)
          }
        }
        validatedFields.push(fieldName)
      } catch (error) {
        errors.push({
          field: fieldName,
          code: 'VALIDATION_ERROR',
          message: `Validation failed for field ${fieldName}`,
          severity: 'error',
          context: { error: error instanceof Error ? error.message : String(error) }
        })
      }
    }

    // Apply custom rules
    for (const customRule of this.config.customRules) {
      if (this.config.skipFields.includes(customRule.field)) {
        continue
      }

      try {
        const fieldValue = this.getFieldValue(vendor, customRule.field)
        const result = customRule.validator(fieldValue, vendor)
        if (result) {
          if (result.severity === 'error') {
            errors.push(result)
          } else if (result.severity === 'warning' && this.config.allowWarnings) {
            warnings.push(result)
          }
        }
      } catch (error) {
        errors.push({
          field: customRule.field,
          code: 'CUSTOM_VALIDATION_ERROR',
          message: `Custom validation failed for field ${customRule.field}`,
          severity: 'error',
          context: { error: error instanceof Error ? error.message : String(error) }
        })
      }
    }

    // Check for required fields if in strict mode
    if (this.config.strictMode || this.config.requireAllFields) {
      const requiredFields = Object.entries(FIELD_VALIDATORS)
        .filter(([_, validator]) => validator.required)
        .map(([fieldName]) => fieldName)

      for (const requiredField of requiredFields) {
        const fieldValue = this.getFieldValue(vendor, requiredField)
        if (!fieldValue) {
          errors.push({
            field: requiredField,
            code: 'REQUIRED',
            message: `${requiredField} is required`,
            severity: 'error'
          })
        }
      }
    }

    // Business rule validations
    const businessRuleErrors = await this.validateBusinessRules(vendor)
    errors.push(...businessRuleErrors)

    // Calculate quality score
    const qualityScore = this.calculateQualityScore(vendor, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      validatedFields,
      timestamp: new Date()
    }
  }

  // Validate specific field
  async validateField(vendor: Partial<Vendor>, fieldName: string): Promise<ValidationError | null> {
    const validator = FIELD_VALIDATORS[fieldName as keyof typeof FIELD_VALIDATORS]
    if (!validator) {
      return {
        field: fieldName,
        code: 'UNKNOWN_FIELD',
        message: `Unknown field: ${fieldName}`,
        severity: 'error'
      }
    }

    const fieldValue = this.getFieldValue(vendor, fieldName)
    return validator.validate(fieldValue)
  }

  // Validate business rules
  private async validateBusinessRules(vendor: Partial<Vendor>): Promise<ValidationError[]> {
    const errors: ValidationError[] = []

    // Check for duplicate company name
    if (vendor.name) {
      const duplicateCheck = await this.checkDuplicateCompanyName(vendor.name, vendor.id)
      if (duplicateCheck) {
        errors.push(duplicateCheck)
      }
    }

    // Check for duplicate email
    if (vendor.contactEmail) {
      const duplicateCheck = await this.checkDuplicateEmail(vendor.contactEmail, vendor.id)
      if (duplicateCheck) {
        errors.push(duplicateCheck)
      }
    }

    // Check for duplicate phone
    if (vendor.contactPhone) {
      const duplicateCheck = await this.checkDuplicatePhone(vendor.contactPhone, vendor.id)
      if (duplicateCheck) {
        errors.push(duplicateCheck)
      }
    }

    // Validate company registration if provided
    if (vendor.companyRegistration) {
      const registrationCheck = await this.validateCompanyRegistration(vendor.companyRegistration)
      if (registrationCheck) {
        errors.push(registrationCheck)
      }
    }

    // Validate tax ID if provided
    if (vendor.taxId) {
      const taxIdCheck = await this.validateTaxId(vendor.taxId)
      if (taxIdCheck) {
        errors.push(taxIdCheck)
      }
    }

    return errors
  }

  // Calculate quality score based on validation results
  private calculateQualityScore(
    vendor: Partial<Vendor>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): number {
    let score = 100

    // Deduct points for errors
    score -= errors.length * 15

    // Deduct points for warnings
    score -= warnings.length * 5

    // Bonus points for optional fields
    if (vendor.website) score += 5
    if (vendor.businessType) score += 5
    if (vendor.certifications && vendor.certifications.length > 0) score += 5
    if (vendor.languages && vendor.languages.length > 0) score += 3
    if (vendor.notes) score += 2

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score))
  }

  // Get field value from vendor object, supporting nested fields
  private getFieldValue(vendor: Partial<Vendor>, fieldName: string): any {
    if (fieldName === 'companyName') {
      return vendor.name
    }

    if (fieldName.includes('.')) {
      const [parentField, childField] = fieldName.split('.')
      const parentValue = vendor[parentField as keyof Vendor]
      if (parentValue && typeof parentValue === 'object') {
        return (parentValue as any)[childField]
      }
      return undefined
    }

    return vendor[fieldName as keyof Vendor]
  }

  // Check for duplicate company name
  private async checkDuplicateCompanyName(name: string, excludeId?: string): Promise<ValidationError | null> {
    try {
      const searchResult = await vendorApi.search(name, 10)
      if (searchResult.success && searchResult.data) {
        const duplicates = searchResult.data.filter(v => 
          v.name.toLowerCase() === name.toLowerCase() && v.id !== excludeId
        )
        
        if (duplicates.length > 0) {
          return {
            field: 'name',
            code: 'DUPLICATE_NAME',
            message: 'A vendor with this company name already exists',
            severity: 'error',
            suggestions: ['Use a more specific company name', 'Add a location identifier']
          }
        }
      }
    } catch (error) {
      // If we can't check for duplicates, issue a warning
      return {
        field: 'name',
        code: 'DUPLICATE_CHECK_FAILED',
        message: 'Could not verify company name uniqueness',
        severity: 'warning'
      }
    }

    return null
  }

  // Check for duplicate email
  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<ValidationError | null> {
    try {
      const searchResult = await vendorApi.search(email, 10)
      if (searchResult.success && searchResult.data) {
        const duplicates = searchResult.data.filter(v => 
          v.contactEmail.toLowerCase() === email.toLowerCase() && v.id !== excludeId
        )
        
        if (duplicates.length > 0) {
          return {
            field: 'contactEmail',
            code: 'DUPLICATE_EMAIL',
            message: 'A vendor with this email address already exists',
            severity: 'error',
            suggestions: ['Use a different email address', 'Contact the existing vendor']
          }
        }
      }
    } catch (error) {
      // If we can't check for duplicates, issue a warning
      return {
        field: 'contactEmail',
        code: 'DUPLICATE_CHECK_FAILED',
        message: 'Could not verify email uniqueness',
        severity: 'warning'
      }
    }

    return null
  }

  // Check for duplicate phone
  private async checkDuplicatePhone(phone: string, excludeId?: string): Promise<ValidationError | null> {
    try {
      const searchResult = await vendorApi.search(phone, 10)
      if (searchResult.success && searchResult.data) {
        const duplicates = searchResult.data.filter(v => 
          v.contactPhone === phone && v.id !== excludeId
        )
        
        if (duplicates.length > 0) {
          return {
            field: 'contactPhone',
            code: 'DUPLICATE_PHONE',
            message: 'A vendor with this phone number already exists',
            severity: 'error',
            suggestions: ['Use a different phone number', 'Contact the existing vendor']
          }
        }
      }
    } catch (error) {
      // If we can't check for duplicates, issue a warning
      return {
        field: 'contactPhone',
        code: 'DUPLICATE_CHECK_FAILED',
        message: 'Could not verify phone uniqueness',
        severity: 'warning'
      }
    }

    return null
  }

  // Validate company registration number
  private async validateCompanyRegistration(registration: string): Promise<ValidationError | null> {
    // This would integrate with external APIs to validate registration numbers
    // For now, we'll just check format
    if (registration.length < 5) {
      return {
        field: 'companyRegistration',
        code: 'INVALID_FORMAT',
        message: 'Company registration number is too short',
        severity: 'error'
      }
    }

    return null
  }

  // Validate tax ID
  private async validateTaxId(taxId: string): Promise<ValidationError | null> {
    // This would integrate with external APIs to validate tax IDs
    // For now, we'll just check format
    if (taxId.length < 5) {
      return {
        field: 'taxId',
        code: 'INVALID_FORMAT',
        message: 'Tax ID is too short',
        severity: 'error'
      }
    }

    return null
  }

  // Add custom validation rule
  addCustomRule(rule: CustomValidationRule): void {
    this.config.customRules.push(rule)
  }

  // Remove custom validation rule
  removeCustomRule(fieldName: string): void {
    this.config.customRules = this.config.customRules.filter(rule => rule.field !== fieldName)
  }

  // Update configuration
  updateConfig(config: Partial<VendorValidationConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Export singleton instance
export const vendorValidationService = new VendorValidationService()
export default vendorValidationService