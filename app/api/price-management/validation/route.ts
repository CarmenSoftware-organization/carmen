import { NextRequest, NextResponse } from 'next/server';
import { priceValidationEngine } from '@/lib/services/price-validation-engine';
import { dataQualityService } from '@/lib/services/data-quality-service';
import { errorReportingService } from '@/lib/services/error-reporting-service';
import { automatedQualityService } from '@/lib/services/automated-quality-service';
import { resubmissionWorkflowService } from '@/lib/services/resubmission-workflow-service';

// POST /api/price-management/validation - Validate price submission
export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json();
    const { submissionId, vendorId, isResubmission, originalSubmissionId } = submissionData;

    // Perform comprehensive validation
    const validationResult = await priceValidationEngine.validatePriceSubmission(submissionData);
    
    // Generate quality report
    const qualityReport = await dataQualityService.generateQualityReport(
      submissionId,
      vendorId,
      validationResult,
      submissionData
    );

    // Generate error report with correction guidance
    const errorReport = await errorReportingService.generateErrorReport(
      submissionId,
      vendorId,
      validationResult,
      qualityReport,
      submissionData
    );

    // Perform automated quality checks
    const automatedChecks = await automatedQualityService.performAutomatedQualityChecks(
      submissionId,
      vendorId,
      validationResult,
      submissionData
    );

    // Handle resubmission workflow if applicable
    let resubmissionResult = null;
    if (isResubmission && originalSubmissionId) {
      // This would typically fetch original submission data
      const originalSubmissionData = {}; // Mock data
      
      // Find existing workflow or create new one
      let workflowId = submissionId; // Simplified for demo
      resubmissionResult = await resubmissionWorkflowService.processResubmission(
        workflowId,
        submissionData,
        originalSubmissionData
      );
    } else if (errorReport.resubmissionRequired) {
      // Initiate new resubmission workflow
      const workflow = await resubmissionWorkflowService.initiateResubmissionWorkflow(
        submissionId,
        vendorId,
        validationResult,
        qualityReport,
        errorReport
      );
      resubmissionResult = { workflow, requiresResubmission: true };
    }

    return NextResponse.json({
      success: true,
      data: {
        validation: validationResult,
        quality: qualityReport,
        errors: errorReport,
        automatedChecks,
        resubmission: resubmissionResult,
        recommendation: automatedChecks.recommendation,
        nextSteps: generateNextSteps(automatedChecks.recommendation, errorReport, qualityReport)
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Validation service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/price-management/validation/quality-trends?vendorId=xxx&days=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        error: 'Vendor ID is required'
      }, { status: 400 });
    }

    const qualityTrend = await dataQualityService.getVendorQualityTrend(vendorId, days);
    const activeFlags = await automatedQualityService.getActiveFlags(vendorId);
    const activeAlerts = await automatedQualityService.getActiveAlerts(vendorId);
    const vendorWorkflows = await resubmissionWorkflowService.getVendorWorkflows(vendorId);

    return NextResponse.json({
      success: true,
      data: {
        qualityTrend,
        activeFlags,
        activeAlerts,
        activeWorkflows: vendorWorkflows.filter(w => w.status !== 'completed' && w.status !== 'cancelled'),
        summary: {
          currentQualityScore: qualityTrend.scoreHistory[qualityTrend.scoreHistory.length - 1]?.score || 0,
          trend: qualityTrend.trend,
          improvement: qualityTrend.improvement,
          activeIssues: activeFlags.length + activeAlerts.length,
          pendingWorkflows: vendorWorkflows.filter(w => w.status === 'in_progress').length
        }
      }
    });

  } catch (error) {
    console.error('Quality trends error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quality trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateNextSteps(
  recommendation: string,
  errorReport: any,
  qualityReport: any
): string[] {
  const steps: string[] = [];

  switch (recommendation) {
    case 'approve':
      steps.push('Submission approved automatically');
      steps.push('Prices will be available for assignment within 5 minutes');
      break;

    case 'flag_for_review':
      steps.push('Submission flagged for manual review');
      steps.push('Review team will assess within 24 hours');
      if (qualityReport.recommendations.length > 0) {
        steps.push('Consider addressing quality recommendations for faster approval');
      }
      break;

    case 'reject':
      steps.push('Submission rejected due to critical issues');
      if (errorReport.resubmissionRequired) {
        steps.push('Please address all critical errors and resubmit');
        steps.push(`Estimated fix time: ${errorReport.estimatedFixTime} minutes`);
      }
      break;
  }

  return steps;
}