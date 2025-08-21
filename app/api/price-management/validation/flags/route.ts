import { NextRequest, NextResponse } from 'next/server';
import { automatedQualityService } from '@/lib/services/automated-quality-service';

// GET /api/price-management/validation/flags - Get quality flags
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get('vendorId');
    const status = request.nextUrl.searchParams.get('status') || 'active';

    let flags;
    if (status === 'active') {
      flags = await automatedQualityService.getActiveFlags(vendorId || undefined);
    } else {
      // Would implement getFlags with status filter
      flags = await automatedQualityService.getActiveFlags(vendorId || undefined);
    }

    // Group flags by severity for better organization
    const flagsBySeverity = flags.reduce((acc, flag) => {
      if (!acc[flag.severity]) acc[flag.severity] = [];
      acc[flag.severity].push(flag);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      data: {
        flags,
        flagsBySeverity,
        summary: {
          total: flags.length,
          critical: flags.filter(f => f.severity === 'critical').length,
          high: flags.filter(f => f.severity === 'high').length,
          medium: flags.filter(f => f.severity === 'medium').length,
          low: flags.filter(f => f.severity === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('Flags fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quality flags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/price-management/validation/flags/[flagId]/resolve
export async function PUT(request: NextRequest) {
  try {
    const flagId = request.nextUrl.pathname.split('/').pop()?.replace('/resolve', '');
    
    if (!flagId) {
      return NextResponse.json({
        success: false,
        error: 'Flag ID is required'
      }, { status: 400 });
    }

    const { resolutionNotes, resolvedBy } = await request.json();

    if (!resolutionNotes || !resolvedBy) {
      return NextResponse.json({
        success: false,
        error: 'Resolution notes and resolver ID are required'
      }, { status: 400 });
    }

    await automatedQualityService.resolveFlag(flagId, resolutionNotes, resolvedBy);

    return NextResponse.json({
      success: true,
      message: 'Flag resolved successfully'
    });

  } catch (error) {
    console.error('Flag resolution error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to resolve flag',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}