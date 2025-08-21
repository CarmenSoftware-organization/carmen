import { TemplateValidator, createTemplateValidator } from '@/lib/utils/template-validation';
import { notificationService, NotificationContext } from './notification-service';

export interface ExcelTemplateConfig {
  id: string;
  vendorId: string | null;
  vendorName: string;
  templateName: string;
  templateType: 'vendor_specific' | 'generic';
  categories: string[];
  currency: string;
  supportedCurrencies: string[];
  columns: TemplateColumn[];
  instructions: string[];
  validationRules: ValidationRule[];
  isActive: boolean;
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

export interface TemplateGenerationResult {
  success: boolean;
  templateId: string;
  downloadUrl: string;
  excelStructure: any;
  error?: string;
}

export interface TemplateProcessingResult {
  success: boolean;
  submissionId: string;
  validationResults: any;
  importResults: any;
  notifications: string[];
  error?: string;
}

export class ExcelTemplateService {
  private templates: Map<string, ExcelTemplateConfig>;

  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  private async loadTemplates() {
    try {
      // In a real implementation, this would load from database
      // For now, we'll load from the mock JSON file
      const templatesModule = await import('@/lib/mock/price-management/excel-templates.json');
      const templates = templatesModule.default;
      
      templates.forEach((template: any) => {
        this.templates.set(template.id, template);
      });
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async generateTemplate(templateId: string, vendorId?: string): Promise<TemplateGenerationResult> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          templateId,
          downloadUrl: '',
          excelStructure: null,
          error: 'Template not found'
        };
      }

      // Validate vendor access if it's a vendor-specific template
      if (template.vendorId && vendorId && template.vendorId !== vendorId) {
        return {
          success: false,
          templateId,
          downloadUrl: '',
          excelStructure: null,
          error: 'Access denied: Template not available for this vendor'
        };
      }

      // Generate Excel structure
      const excelStructure = this.createExcelStructure(template);
      
      // Generate download URL
      const downloadUrl = `/api/price-management/templates/download/${templateId}`;

      return {
        success: true,
        templateId,
        downloadUrl,
        excelStructure
      };
    } catch (error) {
      return {
        success: false,
        templateId,
        downloadUrl: '',
        excelStructure: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processTemplateSubmission(
    templateId: string,
    vendorId: string,
    fileData: any[],
    submissionMethod: 'email' | 'portal' = 'portal'
  ): Promise<TemplateProcessingResult> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          submissionId: '',
          validationResults: null,
          importResults: null,
          notifications: [],
          error: 'Template not found'
        };
      }

      // Create submission ID
      const submissionId = `sub-${Date.now()}-${vendorId}`;

      // Validate the data
      const validator = createTemplateValidator(template);
      const validationResults = validator.validateData(fileData);

      // Process the data if validation passes
      let importResults = null;
      let notifications: string[] = [];

      if (validationResults.isValid || validationResults.errors.length === 0) {
        // Import the data (mock implementation)
        importResults = await this.importPriceData(fileData, template, vendorId);
        
        // Send confirmation notification
        const notificationContext: NotificationContext = {
          vendorName: template.vendorName,
          vendorEmail: 'vendor@example.com', // In real implementation, get from vendor data
          templateName: template.templateName,
          submissionId,
          processingResults: importResults,
          validationResults,
          warnings: validationResults.warningDetails,
          supportEmail: 'support@carmen.com',
          supportPhone: '+1 (555) 123-4567'
        };

        const notificationSent = await notificationService.sendNotification(
          'price_submission_confirmation',
          notificationContext
        );

        if (notificationSent) {
          notifications.push('Confirmation email sent successfully');
        }
      } else {
        // Send error notification
        const notificationContext: NotificationContext = {
          vendorName: template.vendorName,
          vendorEmail: 'vendor@example.com',
          templateName: template.templateName,
          submissionId,
          errors: validationResults.errors,
          supportEmail: 'support@carmen.com',
          supportPhone: '+1 (555) 123-4567'
        };

        const notificationSent = await notificationService.sendNotification(
          'price_submission_error',
          notificationContext
        );

        if (notificationSent) {
          notifications.push('Error notification sent successfully');
        }
      }

      return {
        success: validationResults.errors.length === 0,
        submissionId,
        validationResults,
        importResults,
        notifications
      };
    } catch (error) {
      return {
        success: false,
        submissionId: '',
        validationResults: null,
        importResults: null,
        notifications: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private createExcelStructure(template: ExcelTemplateConfig) {
    // Create headers with validation indicators
    const headers = template.columns.map(col => ({
      name: col.name + (col.required ? ' *' : ''),
      key: col.key,
      type: col.type,
      validation: col.validation,
      options: col.options || null,
      width: this.getColumnWidth(col.type)
    }));

    // Generate sample data rows
    const sampleRows = this.generateSampleData(template);

    // Create instructions worksheet
    const instructionsSheet = {
      name: 'Instructions',
      content: [
        { type: 'title', text: `${template.templateName} - Instructions` },
        { type: 'subtitle', text: 'Please read carefully before filling out the template' },
        ...template.instructions.map(instruction => ({ type: 'instruction', text: instruction })),
        { type: 'subtitle', text: 'Validation Rules' },
        ...template.validationRules.map(rule => ({ type: 'rule', text: `${rule.fields.join(', ')}: ${rule.message}` })),
        { type: 'subtitle', text: 'Support Information' },
        { type: 'support', text: 'For assistance, contact support@carmen.com or call +1 (555) 123-4567' }
      ]
    };

    // Create data worksheet
    const dataSheet = {
      name: 'Price Data',
      headers,
      sampleRows,
      validationRules: this.createExcelValidationRules(template),
      formatting: this.createExcelFormatting(template)
    };

    return {
      workbook: {
        name: template.templateName,
        sheets: [dataSheet, instructionsSheet]
      },
      metadata: {
        templateId: template.id,
        vendorId: template.vendorId,
        vendorName: template.vendorName,
        generatedAt: new Date().toISOString(),
        currency: template.currency,
        supportedCurrencies: template.supportedCurrencies,
        categories: template.categories
      }
    };
  }

  private generateSampleData(template: ExcelTemplateConfig): any[] {
    const sampleRows = [];
    const categories = template.categories.filter(cat => cat !== 'All Categories');
    
    // Generate 3-5 sample rows
    for (let i = 1; i <= Math.min(5, Math.max(3, categories.length)); i++) {
      const row: any = {};
      
      template.columns.forEach(col => {
        switch (col.key) {
          case 'productId':
            row[col.key] = `SAMPLE-${String(i).padStart(3, '0')}`;
            break;
          case 'productName':
            row[col.key] = this.getSampleProductName(template.templateType, i);
            break;
          case 'category':
            row[col.key] = categories[i % categories.length] || categories[0] || 'Sample Category';
            break;
          case 'unitPrice':
            row[col.key] = (Math.random() * 100 + 10).toFixed(2);
            break;
          case 'currency':
            row[col.key] = template.currency;
            break;
          case 'minQuantity':
            row[col.key] = Math.floor(Math.random() * 5) + 1;
            break;
          case 'bulkPrice':
            if (Math.random() > 0.5) {
              row[col.key] = (parseFloat(row.unitPrice || '0') * 0.9).toFixed(2);
            }
            break;
          case 'bulkMinQuantity':
            if (row.bulkPrice) {
              row[col.key] = Math.floor(Math.random() * 10) + 10;
            }
            break;
          case 'validFrom':
            row[col.key] = new Date().toISOString().split('T')[0];
            break;
          case 'validTo':
            const validTo = new Date();
            validTo.setMonth(validTo.getMonth() + 1);
            row[col.key] = validTo.toISOString().split('T')[0];
            break;
          case 'unit':
            row[col.key] = this.getSampleUnit();
            break;
          case 'description':
            row[col.key] = `Sample description for ${row.productName || 'product'}`;
            break;
          default:
            if (col.options && col.options.length > 0) {
              row[col.key] = col.options[Math.floor(Math.random() * col.options.length)];
            } else if (col.type === 'text') {
              row[col.key] = `Sample ${col.name}`;
            } else if (col.type === 'number') {
              row[col.key] = Math.floor(Math.random() * 100) + 1;
            }
            break;
        }
      });
      
      sampleRows.push(row);
    }
    
    return sampleRows;
  }

  private getSampleProductName(templateType: string, index: number): string {
    const productNames: { [key: string]: string[] } = {
      'vendor_specific': [
        'Premium Coffee Beans - 1kg',
        'Organic Flour - 25kg',
        'Extra Virgin Olive Oil - 1L',
        'Fresh Tomatoes - 5kg',
        'Industrial Mixer - Model X200'
      ],
      'generic': [
        'Sample Product A',
        'Sample Product B',
        'Sample Product C',
        'Sample Product D',
        'Sample Product E'
      ]
    };
    
    const names = productNames[templateType] || productNames.generic;
    return names[(index - 1) % names.length];
  }

  private getSampleUnit(): string {
    const units = ['kg', 'L', 'unit', 'box', 'pack', 'carton', 'piece'];
    return units[Math.floor(Math.random() * units.length)];
  }

  private getColumnWidth(type: string): number {
    switch (type) {
      case 'text': return 25;
      case 'number': return 12;
      case 'currency': return 15;
      case 'date': return 15;
      case 'dropdown': return 20;
      default: return 20;
    }
  }

  private createExcelValidationRules(template: ExcelTemplateConfig) {
    const rules: any[] = [];
    
    template.columns.forEach((col, index) => {
      const columnLetter = String.fromCharCode(65 + index); // A, B, C, etc.
      
      switch (col.type) {
        case 'dropdown':
          if (col.options && col.options.length > 0) {
            rules.push({
              type: 'list',
              column: columnLetter,
              values: col.options,
              errorMessage: `Please select from: ${col.options.join(', ')}`
            });
          }
          break;
        case 'number':
        case 'currency':
          rules.push({
            type: 'decimal',
            column: columnLetter,
            minimum: col.validation === 'positive_number' || col.validation === 'positive_integer' ? 0.01 : undefined,
            errorMessage: `${col.name} must be a valid ${col.validation === 'positive_number' ? 'positive ' : ''}number`
          });
          break;
        case 'date':
          rules.push({
            type: 'date',
            column: columnLetter,
            errorMessage: `${col.name} must be a valid date (YYYY-MM-DD)`
          });
          break;
      }
    });
    
    return rules;
  }

  private createExcelFormatting(template: ExcelTemplateConfig) {
    const formatting: any[] = [];
    
    template.columns.forEach((col, index) => {
      const columnLetter = String.fromCharCode(65 + index);
      
      switch (col.type) {
        case 'currency':
          formatting.push({
            column: columnLetter,
            format: 'currency',
            currency: template.currency
          });
          break;
        case 'date':
          formatting.push({
            column: columnLetter,
            format: 'date',
            pattern: 'yyyy-mm-dd'
          });
          break;
        case 'number':
          formatting.push({
            column: columnLetter,
            format: 'number',
            decimals: col.validation === 'positive_integer' ? 0 : 2
          });
          break;
      }
      
      if (col.required) {
        formatting.push({
          column: columnLetter,
          highlight: 'required',
          backgroundColor: '#fff2cc'
        });
      }
    });
    
    return formatting;
  }

  private async importPriceData(data: any[], template: ExcelTemplateConfig, vendorId: string) {
    // Mock implementation of data import
    // In a real implementation, this would save to database
    
    const itemsProcessed = data.length;
    const itemsCreated = Math.floor(itemsProcessed * 0.8);
    const itemsUpdated = itemsProcessed - itemsCreated;
    const itemsSkipped = 0;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      itemsProcessed,
      itemsCreated,
      itemsUpdated,
      itemsSkipped,
      categories: template.categories,
      currency: template.currency,
      importedAt: new Date().toISOString()
    };
  }

  getTemplate(templateId: string): ExcelTemplateConfig | undefined {
    return this.templates.get(templateId);
  }

  getTemplatesForVendor(vendorId: string): ExcelTemplateConfig[] {
    return Array.from(this.templates.values()).filter(
      template => template.vendorId === vendorId || template.templateType === 'generic'
    );
  }

  getAllTemplates(): ExcelTemplateConfig[] {
    return Array.from(this.templates.values());
  }
}

// Singleton instance
export const excelTemplateService = new ExcelTemplateService();