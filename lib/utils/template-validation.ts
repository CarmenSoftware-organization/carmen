export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: ValidationError[];
  warningDetails: ValidationError[];
}

export interface TemplateColumn {
  name: string;
  key: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'dropdown';
  required: boolean;
  validation: string;
  options?: string[];
}

export interface ValidationRule {
  rule: string;
  fields: string[];
  message: string;
}

export class TemplateValidator {
  private columns: TemplateColumn[];
  private validationRules: ValidationRule[];
  private supportedCurrencies: string[];

  constructor(columns: TemplateColumn[], validationRules: ValidationRule[], supportedCurrencies: string[] = ['USD']) {
    this.columns = columns;
    this.validationRules = validationRules;
    this.supportedCurrencies = supportedCurrencies;
  }

  validateData(data: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let validRows = 0;

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      let rowValid = true;

      // Validate each column
      this.columns.forEach(column => {
        const value = row[column.key];
        const fieldErrors = this.validateField(column, value, rowNumber);
        
        fieldErrors.forEach(error => {
          if (error.severity === 'error') {
            errors.push(error);
            rowValid = false;
          } else {
            warnings.push(error);
          }
        });
      });

      // Validate business rules
      const ruleErrors = this.validateBusinessRules(row, rowNumber);
      ruleErrors.forEach(error => {
        if (error.severity === 'error') {
          errors.push(error);
          rowValid = false;
        } else {
          warnings.push(error);
        }
      });

      if (rowValid) {
        validRows++;
      }
    });

    return {
      isValid: errors.length === 0,
      totalRows: data.length,
      validRows,
      invalidRows: data.length - validRows,
      warnings: warnings.length,
      errors,
      warningDetails: warnings
    };
  }

  private validateField(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required fields
    if (column.required && (value === null || value === undefined || value === '')) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} is required`,
        severity: 'error',
        value
      });
      return errors;
    }

    // Skip validation if field is empty and not required
    if (!column.required && (value === null || value === undefined || value === '')) {
      return errors;
    }

    // Type-specific validation
    switch (column.type) {
      case 'text':
        errors.push(...this.validateText(column, value, rowNumber));
        break;
      case 'number':
        errors.push(...this.validateNumber(column, value, rowNumber));
        break;
      case 'currency':
        errors.push(...this.validateCurrency(column, value, rowNumber));
        break;
      case 'date':
        errors.push(...this.validateDate(column, value, rowNumber));
        break;
      case 'dropdown':
        errors.push(...this.validateDropdown(column, value, rowNumber));
        break;
    }

    return errors;
  }

  private validateText(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (typeof value !== 'string') {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} must be text`,
        severity: 'error',
        value
      });
      return errors;
    }

    // Validation-specific checks
    switch (column.validation) {
      case 'alphanumeric':
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: `${column.name} must contain only letters, numbers, spaces, hyphens, and underscores`,
            severity: 'error',
            value
          });
        }
        break;
      case 'text':
        if (value.length > 255) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: `${column.name} must be less than 255 characters`,
            severity: 'warning',
            value
          });
        }
        break;
    }

    return errors;
  }

  private validateNumber(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} must be a valid number`,
        severity: 'error',
        value
      });
      return errors;
    }

    // Validation-specific checks
    switch (column.validation) {
      case 'positive_number':
        if (numValue <= 0) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: `${column.name} must be a positive number`,
            severity: 'error',
            value
          });
        }
        break;
      case 'positive_integer':
        if (numValue <= 0 || !Number.isInteger(numValue)) {
          errors.push({
            row: rowNumber,
            field: column.key,
            message: `${column.name} must be a positive integer`,
            severity: 'error',
            value
          });
        }
        break;
    }

    return errors;
  }

  private validateCurrency(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} must be a valid currency amount`,
        severity: 'error',
        value
      });
      return errors;
    }

    if (numValue < 0) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} cannot be negative`,
        severity: 'error',
        value
      });
    }

    // Check for reasonable decimal places (max 4 for currency)
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 4) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} should not have more than 4 decimal places`,
        severity: 'warning',
        value
      });
    }

    return errors;
  }

  private validateDate(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} must be a valid date`,
        severity: 'error',
        value
      });
      return errors;
    }

    // Check if date is in the past (for validity dates)
    if (column.key.includes('valid') && date < new Date()) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} should not be in the past`,
        severity: 'warning',
        value
      });
    }

    return errors;
  }

  private validateDropdown(column: TemplateColumn, value: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!column.options || column.options.length === 0) {
      return errors;
    }

    if (!column.options.includes(value)) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `${column.name} must be one of: ${column.options.join(', ')}`,
        severity: 'error',
        value
      });
    }

    // Special validation for currency codes
    if (column.key === 'currency' && !this.supportedCurrencies.includes(value)) {
      errors.push({
        row: rowNumber,
        field: column.key,
        message: `Currency '${value}' is not supported. Supported currencies: ${this.supportedCurrencies.join(', ')}`,
        severity: 'error',
        value
      });
    }

    return errors;
  }

  private validateBusinessRules(row: any, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    this.validationRules.forEach(rule => {
      switch (rule.rule) {
        case 'date_range':
          if (rule.fields.length >= 2) {
            const fromDate = new Date(row[rule.fields[0]]);
            const toDate = new Date(rule.fields[1]);
            
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime()) && fromDate >= toDate) {
              errors.push({
                row: rowNumber,
                field: rule.fields.join(', '),
                message: rule.message,
                severity: 'error'
              });
            }
          }
          break;

        case 'bulk_price_validation':
          if (rule.fields.length >= 2) {
            const unitPrice = Number(row[rule.fields[0]]);
            const bulkPrice = Number(row[rule.fields[1]]);
            
            if (!isNaN(unitPrice) && !isNaN(bulkPrice) && bulkPrice >= unitPrice) {
              errors.push({
                row: rowNumber,
                field: rule.fields.join(', '),
                message: rule.message,
                severity: 'error'
              });
            }
          }
          break;

        case 'bulk_quantity_validation':
          if (rule.fields.length >= 2) {
            const minQty = Number(row[rule.fields[0]]);
            const bulkMinQty = Number(row[rule.fields[1]]);
            
            if (!isNaN(minQty) && !isNaN(bulkMinQty) && bulkMinQty <= minQty) {
              errors.push({
                row: rowNumber,
                field: rule.fields.join(', '),
                message: rule.message,
                severity: 'error'
              });
            }
          }
          break;

        case 'weekly_validity':
          if (rule.fields.length >= 2) {
            const fromDate = new Date(row[rule.fields[0]]);
            const toDate = new Date(row[rule.fields[1]]);
            
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
              const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
              if (diffDays > 7) {
                errors.push({
                  row: rowNumber,
                  field: rule.fields.join(', '),
                  message: rule.message,
                  severity: 'warning'
                });
              }
            }
          }
          break;

        case 'quarterly_validity':
          if (rule.fields.length >= 2) {
            const fromDate = new Date(row[rule.fields[0]]);
            const toDate = new Date(row[rule.fields[1]]);
            
            if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
              const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
              if (diffDays < 80 || diffDays > 100) {
                errors.push({
                  row: rowNumber,
                  field: rule.fields.join(', '),
                  message: rule.message,
                  severity: 'warning'
                });
              }
            }
          }
          break;
      }
    });

    return errors;
  }
}

export function createTemplateValidator(template: any): TemplateValidator {
  return new TemplateValidator(
    template.columns,
    template.validationRules,
    template.supportedCurrencies
  );
}