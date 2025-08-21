import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { performance } from 'perf_hooks';
import { createReadStream, createWriteStream, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Performance tests for large file processing
describe('Large File Processing Performance Tests', () => {
  const baseUrl = process.env.PERF_BASE_URL || 'http://localhost:3000';
  const testFilesDir = join(process.cwd(), 'tests/performance/test-files');
  
  beforeAll(async () => {
    // Ensure test files directory exists
    if (!existsSync(testFilesDir)) {
      await import('fs').then(fs => fs.mkdirSync(testFilesDir, { recursive: true }));
    }
  });

  afterAll(async () => {
    // Clean up test files
    const testFiles = [
      'large-pricelist-1000.csv',
      'large-pricelist-5000.csv',
      'large-pricelist-10000.csv',
      'large-pricelist-50000.csv',
      'malformed-large-file.csv',
      'mixed-currency-large.xlsx'
    ];

    testFiles.forEach(file => {
      const filePath = join(testFilesDir, file);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    });
  });

  const generateLargeCsvFile = (fileName: string, rowCount: number): string => {
    const filePath = join(testFilesDir, fileName);
    const writeStream = createWriteStream(filePath);
    
    // Write CSV header
    writeStream.write('Product ID,Product Name,Unit Price,Currency,Min Quantity,Category,Valid From,Valid To\n');
    
    // Generate rows
    for (let i = 1; i <= rowCount; i++) {
      const row = [
        `PROD-${i.toString().padStart(6, '0')}`,
        `Product ${i}`,
        (Math.random() * 1000 + 10).toFixed(2),
        Math.random() > 0.8 ? 'EUR' : 'USD',
        Math.floor(Math.random() * 10) + 1,
        ['electronics', 'office-supplies', 'furniture', 'tools'][Math.floor(Math.random() * 4)],
        '2024-01-01',
        '2024-12-31'
      ].join(',');
      
      writeStream.write(row + '\n');
    }
    
    writeStream.end();
    return filePath;
  };

  const generateMalformedCsvFile = (fileName: string, rowCount: number): string => {
    const filePath = join(testFilesDir, fileName);
    const writeStream = createWriteStream(filePath);
    
    writeStream.write('Product ID,Product Name,Unit Price,Currency,Min Quantity\n');
    
    for (let i = 1; i <= rowCount; i++) {
      let row: string;
      
      if (i % 10 === 0) {
        // Every 10th row has errors
        row = [
          '', // Missing product ID
          `Product ${i}`,
          'invalid-price', // Invalid price
          'INVALID_CURRENCY',
          '0' // Invalid min quantity
        ].join(',');
      } else if (i % 7 === 0) {
        // Every 7th row has missing columns
        row = `PROD-${i},Product ${i}`;
      } else {
        // Normal row
        row = [
          `PROD-${i.toString().padStart(6, '0')}`,
          `Product ${i}`,
          (Math.random() * 1000 + 10).toFixed(2),
          'USD',
          Math.floor(Math.random() * 10) + 1
        ].join(',');
      }
      
      writeStream.write(row + '\n');
    }
    
    writeStream.end();
    return filePath;
  };

  describe('CSV File Processing Performance', () => {
    it('should process 1,000 item CSV file efficiently', async () => {
      const fileName = 'large-pricelist-1000.csv';
      const filePath = generateLargeCsvFile(fileName, 1000);
      
      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const startTime = performance.now();
      
      // Create form data with the file
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const processingTime = performance.now() - startTime;
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.processedItems).toBe(1000);
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      console.log(`1K CSV Processing - Time: ${processingTime.toFixed(2)}ms, Items: ${data.processedItems}, Errors: ${data.errors?.length || 0}`);
    });

    it('should process 5,000 item CSV file within acceptable time', async () => {
      const fileName = 'large-pricelist-5000.csv';
      const filePath = generateLargeCsvFile(fileName, 5000);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const startTime = performance.now();
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const processingTime = performance.now() - startTime;
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.processedItems).toBe(5000);
      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      
      console.log(`5K CSV Processing - Time: ${processingTime.toFixed(2)}ms, Items: ${data.processedItems}, Rate: ${(data.processedItems / (processingTime / 1000)).toFixed(2)} items/sec`);
    });

    it('should process 10,000 item CSV file with streaming', async () => {
      const fileName = 'large-pricelist-10000.csv';
      const filePath = generateLargeCsvFile(fileName, 10000);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const startTime = performance.now();
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');
      formData.append('streaming', 'true'); // Enable streaming processing

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const processingTime = performance.now() - startTime;
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.processedItems).toBe(10000);
      expect(processingTime).toBeLessThan(60000); // Should complete within 60 seconds
      
      const processingRate = data.processedItems / (processingTime / 1000);
      expect(processingRate).toBeGreaterThan(100); // At least 100 items per second
      
      console.log(`10K CSV Processing - Time: ${processingTime.toFixed(2)}ms, Items: ${data.processedItems}, Rate: ${processingRate.toFixed(2)} items/sec`);
    });

    it('should handle very large files (50,000 items) with chunked processing', async () => {
      const fileName = 'large-pricelist-50000.csv';
      const filePath = generateLargeCsvFile(fileName, 50000);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const startTime = performance.now();
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');
      formData.append('chunkSize', '1000'); // Process in chunks of 1000

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const processingTime = performance.now() - startTime;
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.processedItems).toBe(50000);
      expect(processingTime).toBeLessThan(300000); // Should complete within 5 minutes
      
      const processingRate = data.processedItems / (processingTime / 1000);
      expect(processingRate).toBeGreaterThan(50); // At least 50 items per second
      
      console.log(`50K CSV Processing - Time: ${(processingTime / 1000).toFixed(2)}s, Items: ${data.processedItems}, Rate: ${processingRate.toFixed(2)} items/sec`);
    });
  });

  describe('Error Handling in Large Files', () => {
    it('should efficiently process files with validation errors', async () => {
      const fileName = 'malformed-large-file.csv';
      const filePath = generateMalformedCsvFile(fileName, 5000);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const startTime = performance.now();
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');
      formData.append('continueOnError', 'true');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const processingTime = performance.now() - startTime;
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.processedItems).toBeGreaterThan(0);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
      expect(processingTime).toBeLessThan(45000); // Should complete within 45 seconds
      
      const errorRate = (data.errors.length / 5000) * 100;
      const successRate = (data.processedItems / 5000) * 100;
      
      console.log(`Malformed File Processing - Time: ${processingTime.toFixed(2)}ms, Success Rate: ${successRate.toFixed(2)}%, Error Rate: ${errorRate.toFixed(2)}%`);
    });

    it('should provide detailed error reporting for large files', async () => {
      const fileName = 'malformed-large-file.csv';
      const filePath = generateMalformedCsvFile(fileName, 1000);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');
      formData.append('detailedErrors', 'true');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      expect(data.errors).toBeDefined();
      expect(Array.isArray(data.errors)).toBe(true);
      
      if (data.errors.length > 0) {
        // Check error structure
        data.errors.forEach((error: any) => {
          expect(error.row).toBeDefined();
          expect(error.column).toBeDefined();
          expect(error.message).toBeDefined();
          expect(error.value).toBeDefined();
        });
      }
      
      console.log(`Error Reporting - Total Errors: ${data.errors.length}, Sample Error:`, data.errors[0]);
    });
  });

  describe('Memory Usage During Large File Processing', () => {
    it('should maintain reasonable memory usage during large file processing', async () => {
      const fileName = 'large-pricelist-10000.csv';
      const filePath = generateLargeCsvFile(fileName, 10000);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const initialMemory = process.memoryUsage();
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      const finalMemory = process.memoryUsage();
      
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.heapUsed) * 100;
      
      expect(response.ok).toBe(true);
      expect(memoryIncreasePercent).toBeLessThan(100); // Memory increase should be less than 100%
      
      console.log(`Memory Usage - Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB, Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB, Increase: ${memoryIncreasePercent.toFixed(2)}%`);
    });
  });

  describe('Concurrent Large File Processing', () => {
    it('should handle multiple large file uploads simultaneously', async () => {
      const concurrentUploads = 5;
      const itemsPerFile = 2000;
      
      // Generate multiple test files
      const filePaths = await Promise.all(
        Array.from({ length: concurrentUploads }, (_, index) => {
          const fileName = `concurrent-large-${index}.csv`;
          return new Promise<string>(resolve => {
            setTimeout(() => {
              const path = generateLargeCsvFile(fileName, itemsPerFile);
              resolve(path);
            }, index * 500); // Stagger file generation
          });
        })
      );
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const startTime = performance.now();
      
      const uploadPromises = filePaths.map(async (filePath, index) => {
        const fileName = `concurrent-large-${index}.csv`;
        
        try {
          const formData = new FormData();
          const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
          const blob = new Blob([fileBuffer], { type: 'text/csv' });
          formData.append('file', blob, fileName);
          formData.append('vendorId', `vendor-concurrent-${index}`);
          formData.append('categoryId', 'electronics');

          const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
            method: 'POST',
            body: formData
          });

          const data = await response.json();
          
          return {
            index,
            success: response.ok,
            processedItems: data.processedItems || 0,
            errors: data.errors?.length || 0,
            responseTime: performance.now() - startTime
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: error.message,
            responseTime: performance.now() - startTime
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(r => r.success);
      const totalItemsProcessed = successfulUploads.reduce((sum, r) => sum + r.processedItems, 0);
      const avgResponseTime = successfulUploads.reduce((sum, r) => sum + r.responseTime, 0) / successfulUploads.length;
      
      expect(successfulUploads.length).toBeGreaterThan(concurrentUploads * 0.8); // 80% success rate
      expect(totalItemsProcessed).toBeGreaterThan(itemsPerFile * concurrentUploads * 0.8);
      expect(avgResponseTime).toBeLessThan(120000); // Average response time under 2 minutes
      
      console.log(`Concurrent Large File Processing - Success: ${successfulUploads.length}/${concurrentUploads}, Total Items: ${totalItemsProcessed}, Avg Time: ${(avgResponseTime / 1000).toFixed(2)}s`);
      
      // Clean up generated files
      filePaths.forEach(filePath => {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    });
  });

  describe('File Size Limits and Validation', () => {
    it('should handle maximum file size limits gracefully', async () => {
      // Test with a file that exceeds typical limits
      const fileName = 'oversized-file.csv';
      const filePath = generateLargeCsvFile(fileName, 100000); // Very large file
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const formData = new FormData();
      const fileBuffer = await import('fs').then(fs => fs.readFileSync(filePath));
      const blob = new Blob([fileBuffer], { type: 'text/csv' });
      formData.append('file', blob, fileName);
      formData.append('vendorId', 'vendor-perf-test');
      formData.append('categoryId', 'electronics');

      const response = await fetch(`${baseUrl}/api/price-management/templates/process`, {
        method: 'POST',
        body: formData
      });

      // Should either process successfully or return appropriate error
      if (!response.ok) {
        const errorData = await response.json();
        expect(errorData.error).toContain('file size');
      } else {
        const data = await response.json();
        expect(data.processedItems).toBeGreaterThan(0);
      }
      
      // Clean up
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    });
  });
});