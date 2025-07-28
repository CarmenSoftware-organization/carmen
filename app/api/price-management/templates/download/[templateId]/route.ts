import { NextRequest, NextResponse } from 'next/server';
import excelTemplates from '@/lib/mock/price-management/excel-templates.json';
import vendorsData from '@/lib/mock/price-management/vendors.json';
const vendors = vendorsData.vendors;

interface RouteParams {
  params: {
    templateId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'excel';

    // Find the template
    const template = excelTemplates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Template not found',
            details: `Template with ID ${templateId} does not exist`
          }
        },
        { status: 404 }
      );
    }

    // Get vendor information if it's a vendor-specific template
    let vendor = null;
    if (template.vendorId) {
      vendor = vendors.find(v => v.id === template.vendorId);
    }

    // Generate Excel template data (mock implementation)
    const excelData = generateExcelTemplate(template, vendor);

    if (format === 'json') {
      // Return template structure as JSON for development/testing
      return NextResponse.json({
        success: true,
        data: {
          template,
          vendor,
          excelStructure: excelData
        }
      });
    }

    // In a real implementation, this would generate an actual Excel file
    // For now, we'll return the template structure with download headers
    const response = NextResponse.json({
      success: true,
      data: {
        templateId: template.id,
        templateName: template.templateName,
        vendorName: template.vendorName,
        downloadUrl: `/api/price-management/templates/download/${templateId}?format=excel`,
        excelStructure: excelData,
        instructions: template.instructions,
        validationRules: template.validationRules
      }
    });

    // Set headers for file download
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Content-Disposition', `attachment; filename="${template.templateName.replace(/[^a-zA-Z0-9]/g, '_')}.json"`);

    return response;
  } catch (error) {
    console.error('Error downloading template:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEMPLATE_DOWNLOAD_ERROR',
          message: 'Failed to download template',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

function generateExcelTemplate(template: any, vendor: any) {
  // Generate sample Excel structure with headers and sample data
  const headers = template.columns.map((col: any) => ({
    name: col.name + (col.required ? ' *' : ''),
    key: col.key,
    type: col.type,
    validation: col.validation,
    options: col.options || null
  }));

  // Generate sample rows based on template type
  const sampleRows = generateSampleRows(template, vendor);

  return {
    worksheetName: `${template.vendorName} - Price Template`,
    headers,
    sampleRows,
    instructions: {
      title: 'Instructions',
      content: template.instructions
    },
    validationRules: {
      title: 'Validation Rules',
      rules: template.validationRules
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

function generateSampleRows(template: any, vendor: any) {
  const sampleRows = [];
  const categories = template.categories.filter((cat: string) => cat !== 'All Categories');
  
  // Generate 3-5 sample rows based on template type
  for (let i = 1; i <= Math.min(5, categories.length + 2); i++) {
    const row: any = {};
    
    template.columns.forEach((col: any) => {
      switch (col.key) {
        case 'productId':
          row[col.key] = `PROD-${String(i).padStart(3, '0')}`;
          break;
        case 'productName':
          row[col.key] = getSampleProductName(template.templateType, i);
          break;
        case 'category':
          row[col.key] = categories[i % categories.length] || categories[0];
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
          if (col.required || Math.random() > 0.5) {
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
          row[col.key] = getSampleUnit(template.templateType);
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

function getSampleProductName(templateType: string, index: number): string {
  const productNames = {
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
  
  const names = productNames[templateType as keyof typeof productNames] || productNames.generic;
  return names[(index - 1) % names.length];
}

function getSampleUnit(templateType: string): string {
  const units = ['kg', 'L', 'unit', 'box', 'pack', 'carton'];
  return units[Math.floor(Math.random() * units.length)];
}