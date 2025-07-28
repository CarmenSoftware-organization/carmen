import { NextRequest, NextResponse } from 'next/server';
import excelTemplates from '@/lib/mock/price-management/excel-templates.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const templateType = searchParams.get('type') || 'all';

    let filteredTemplates = excelTemplates;

    // Filter by vendor ID if provided
    if (vendorId) {
      filteredTemplates = excelTemplates.filter(
        template => template.vendorId === vendorId || template.templateType === 'generic'
      );
    }

    // Filter by template type if specified
    if (templateType !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        template => template.templateType === templateType
      );
    }

    // Only return active templates
    const activeTemplates = filteredTemplates.filter(template => template.isActive);

    return NextResponse.json({
      success: true,
      data: {
        templates: activeTemplates,
        total: activeTemplates.length
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEMPLATE_FETCH_ERROR',
          message: 'Failed to fetch templates',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, templateName, categories, currency, supportedCurrencies, columns, instructions, validationRules } = body;

    // Validate required fields
    if (!templateName || !categories || !currency || !columns) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: 'templateName, categories, currency, and columns are required'
          }
        },
        { status: 400 }
      );
    }

    // Create new template (in real implementation, this would save to database)
    const newTemplate = {
      id: `template-${Date.now()}`,
      vendorId: vendorId || null,
      vendorName: vendorId ? `Vendor ${vendorId}` : 'Generic Template',
      templateName,
      templateType: vendorId ? 'vendor_specific' : 'generic',
      categories,
      currency,
      supportedCurrencies: supportedCurrencies || [currency],
      columns,
      instructions: instructions || [],
      validationRules: validationRules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    return NextResponse.json({
      success: true,
      data: {
        template: newTemplate,
        message: 'Template created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEMPLATE_CREATE_ERROR',
          message: 'Failed to create template',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}