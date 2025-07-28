import { NextRequest, NextResponse } from 'next/server';
import emailSubmissions from '@/lib/mock/price-management/email-submissions.json';
import excelTemplates from '@/lib/mock/price-management/excel-templates.json';
import vendorsData from '@/lib/mock/price-management/vendors.json';
const vendors = vendorsData.vendors;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredSubmissions = [...emailSubmissions];

    // Filter by vendor ID if provided
    if (vendorId) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.vendorId === vendorId
      );
    }

    // Filter by status if provided
    if (status) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.processingStatus === status
      );
    }

    // Sort by creation date (newest first)
    filteredSubmissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          total: filteredSubmissions.length,
          limit,
          offset,
          hasMore: offset + limit < filteredSubmissions.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching email submissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EMAIL_SUBMISSIONS_FETCH_ERROR',
          message: 'Failed to fetch email submissions',
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
    const { 
      vendorId, 
      templateId, 
      emailDetails, 
      fileData,
      simulateProcessing = false 
    } = body;

    // Validate required fields
    if (!vendorId || !emailDetails) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: 'vendorId and emailDetails are required'
          }
        },
        { status: 400 }
      );
    }

    // Find vendor and template
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found',
            details: `Vendor with ID ${vendorId} does not exist`
          }
        },
        { status: 404 }
      );
    }

    const template = templateId ? excelTemplates.find(t => t.id === templateId) : null;

    // Create new email submission
    const newSubmission = {
      id: `email-sub-${Date.now()}`,
      vendorId,
      vendorName: vendor.baseVendorId,
      templateId: templateId || null,
      submissionMethod: 'email',
      emailDetails: {
        ...emailDetails,
        receivedAt: new Date().toISOString(),
        messageId: `msg-${Date.now()}-${vendorId}`
      },
      processingStatus: simulateProcessing ? 'processing' : 'pending',
      processingSteps: [
        {
          step: 'email_received',
          timestamp: new Date().toISOString(),
          status: 'success',
          message: 'Email received and queued for processing'
        }
      ],
      validationResults: null,
      importResults: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    // If simulating processing, add more steps
    if (simulateProcessing) {
      const processingSteps = simulateEmailProcessing(fileData, template);
      newSubmission.processingSteps.push(...processingSteps);
      
      // Determine final status based on processing results
      const hasErrors = processingSteps.some(step => step.status === 'error');
      newSubmission.processingStatus = hasErrors ? 'failed' : 'completed';
      
      if (!hasErrors) {
        (newSubmission as any).completedAt = new Date().toISOString();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        submission: newSubmission,
        message: 'Email submission processed successfully'
      }
    });
  } catch (error) {
    console.error('Error processing email submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EMAIL_PROCESSING_ERROR',
          message: 'Failed to process email submission',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

function simulateEmailProcessing(fileData: any, template: any) {
  const steps = [];
  const now = new Date();

  // Step 1: Attachment extraction
  steps.push({
    step: 'attachment_extracted',
    timestamp: new Date(now.getTime() + 10000).toISOString(),
    status: 'success',
    message: 'Excel file extracted successfully'
  });

  // Step 2: File validation
  steps.push({
    step: 'file_validation',
    timestamp: new Date(now.getTime() + 20000).toISOString(),
    status: 'success',
    message: 'File format validation passed'
  });

  // Step 3: Data parsing
  const itemCount = Math.floor(Math.random() * 50) + 10;
  steps.push({
    step: 'data_parsing',
    timestamp: new Date(now.getTime() + 35000).toISOString(),
    status: 'success',
    message: `${itemCount} price items parsed successfully`
  });

  // Step 4: Business validation (simulate random validation results)
  const validationResult = Math.random();
  if (validationResult < 0.1) {
    // 10% chance of validation errors
    steps.push({
      step: 'business_validation',
      timestamp: new Date(now.getTime() + 50000).toISOString(),
      status: 'error',
      message: 'Validation failed - invalid data found'
    });
    
    steps.push({
      step: 'error_notification_sent',
      timestamp: new Date(now.getTime() + 65000).toISOString(),
      status: 'success',
      message: 'Error notification sent to vendor'
    });
  } else if (validationResult < 0.3) {
    // 20% chance of warnings
    steps.push({
      step: 'business_validation',
      timestamp: new Date(now.getTime() + 50000).toISOString(),
      status: 'warning',
      message: 'Validation passed with warnings'
    });
    
    steps.push({
      step: 'data_import',
      timestamp: new Date(now.getTime() + 65000).toISOString(),
      status: 'success',
      message: 'Price data imported with warnings'
    });
    
    steps.push({
      step: 'confirmation_sent',
      timestamp: new Date(now.getTime() + 80000).toISOString(),
      status: 'success',
      message: 'Confirmation email sent with warnings'
    });
  } else {
    // 70% chance of success
    steps.push({
      step: 'business_validation',
      timestamp: new Date(now.getTime() + 50000).toISOString(),
      status: 'success',
      message: 'All business rules validation passed'
    });
    
    steps.push({
      step: 'data_import',
      timestamp: new Date(now.getTime() + 65000).toISOString(),
      status: 'success',
      message: 'Price data imported to system'
    });
    
    steps.push({
      step: 'confirmation_sent',
      timestamp: new Date(now.getTime() + 80000).toISOString(),
      status: 'success',
      message: 'Confirmation email sent to vendor'
    });
  }

  return steps;
}