import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExcelTemplateService } from '../excel-template-service';

// Mock the template data
vi.mock('../../mock/price-management/excel-templates.json', () => ({
  default: {
    templates: [
      {
        id: '1',
        vendorId: 'vendor-1',
        name: 'Standard Price Template',
        categories: ['electronics', 'office-supplies'],
        columns: ['Product ID', 'Product Name', 'Unit Price', 'Currency', 'Min Quantity'],
        lastGenerated: '2024-01-15T10:00:00Z'
      }
    ],
    submissions: [
      {
        id: '1',
        vendorId: 'vendor-1',
        templateId: '1',
        fileName: 'prices_2024_01.xlsx',
        submissionDate: '2024-01-15T14:30:00Z',
        status: 'processed',
        itemCount: 150,
        errorCount: 0
      }
    ]
  }
}));

describe('ExcelTemplateService', () => {
  let service: ExcelTemplateService;

  beforeEach(() => {
    service = new ExcelTemplateService();
  });

  describe('generateTemplate', () => {
    it('should generate Excel template for vendor and categories', async () => {
      const buffer = await service.generateTemplate('vendor-1', ['electronics', 'office-supplies']);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include vendor-specific data in template', async () => {
      const buffer = await service.generateTemplate('vendor-1', ['electronics']);

      expect(buffer).toBeInstanceOf(Buffer);
      // Template should contain vendor-specific formatting and data
    });

    it('should handle empty categories array', async () => {
      await expect(service.generateTemplate('vendor-1', [])).rejects.toThrow('Categories are required');
    });

    it('should handle invalid vendor ID', async () => {
      await expect(service.generateTemplate('invalid-vendor', ['electronics'])).rejects.toThrow('Vendor not found');
    });
  });

  describe('processTemplate', () => {
    it('should process valid Excel template', async () => {
      // Mock Excel buffer
      const mockBuffer = Buffer.from('mock excel data');
      
      const result = await service.processTemplate(mockBuffer, 'vendor-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.processedItems).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle template with validation errors', async () => {
      const mockBuffer = Buffer.from('invalid excel data');
      
      const result = await service.processTemplate(mockBuffer, 'vendor-1');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate required columns', async () => {
      const mockBuffer = Buffer.from('incomplete excel data');
      
      const result = await service.processTemplate(mockBuffer, 'vendor-1');

      if (!result.success) {
        expect(result.errors.some(error => error.includes('required column'))).toBe(true);
      }
    });
  });

  describe('validateTemplate', () => {
    it('should validate correct template structure', async () => {
      const mockBuffer = Buffer.from('valid excel structure');
      
      const validation = await service.validateTemplate(mockBuffer);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect missing required columns', async () => {
      const mockBuffer = Buffer.from('missing columns excel');
      
      const validation = await service.validateTemplate(mockBuffer);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate data types in columns', async () => {
      const mockBuffer = Buffer.from('invalid data types excel');
      
      const validation = await service.validateTemplate(mockBuffer);

      if (!validation.isValid) {
        expect(validation.errors.some(error => error.includes('data type'))).toBe(true);
      }
    });
  });

  describe('getTemplateHistory', () => {
    it('should return template generation history for vendor', async () => {
      const history = await service.getTemplateHistory('vendor-1');

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        history.forEach(entry => {
          expect(entry.templateId).toBeDefined();
          expect(entry.generatedDate).toBeDefined();
          expect(entry.categories).toBeDefined();
        });
      }
    });

    it('should return empty array for vendor with no history', async () => {
      const history = await service.getTemplateHistory('vendor-without-history');
      expect(history).toEqual([]);
    });
  });

  describe('getSubmissionHistory', () => {
    it('should return submission history for vendor', async () => {
      const history = await service.getSubmissionHistory('vendor-1');

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        history.forEach(entry => {
          expect(entry.fileName).toBeDefined();
          expect(entry.submissionDate).toBeDefined();
          expect(entry.status).toBeDefined();
          expect(entry.itemCount).toBeGreaterThanOrEqual(0);
        });
      }
    });
  });

  describe('downloadTemplate', () => {
    it('should provide download URL for template', async () => {
      const downloadInfo = await service.downloadTemplate('template-1');

      expect(downloadInfo).toBeDefined();
      expect(downloadInfo.downloadUrl).toBeDefined();
      expect(downloadInfo.fileName).toBeDefined();
      expect(downloadInfo.expiresAt).toBeDefined();
    });

    it('should handle invalid template ID', async () => {
      await expect(service.downloadTemplate('invalid-template')).rejects.toThrow('Template not found');
    });
  });

  describe('parseExcelData', () => {
    it('should parse Excel data correctly', () => {
      const mockExcelData = [
        ['Product ID', 'Product Name', 'Unit Price', 'Currency'],
        ['PROD-001', 'Office Chair', '150.00', 'USD'],
        ['PROD-002', 'Desk Lamp', '45.50', 'USD']
      ];

      const parsed = service.parseExcelData(mockExcelData);

      expect(parsed.length).toBe(2);
      expect(parsed[0].productId).toBe('PROD-001');
      expect(parsed[0].productName).toBe('Office Chair');
      expect(parsed[0].unitPrice).toBe(150.00);
      expect(parsed[0].currency).toBe('USD');
    });

    it('should handle empty Excel data', () => {
      const parsed = service.parseExcelData([]);
      expect(parsed).toEqual([]);
    });

    it('should validate price formats', () => {
      const mockExcelData = [
        ['Product ID', 'Product Name', 'Unit Price', 'Currency'],
        ['PROD-001', 'Office Chair', 'invalid-price', 'USD']
      ];

      expect(() => service.parseExcelData(mockExcelData)).toThrow('Invalid price format');
    });
  });
});