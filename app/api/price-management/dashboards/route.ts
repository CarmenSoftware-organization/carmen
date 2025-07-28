import { NextRequest, NextResponse } from 'next/server';
import { customDashboardService } from '@/lib/services/custom-dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('isPublic');

    const filters: any = {};
    if (userRole) filters.userRole = userRole;
    if (userId) filters.userId = userId;
    if (isPublic !== null) filters.isPublic = isPublic === 'true';

    const dashboards = await customDashboardService.getDashboards(filters);

    return NextResponse.json({
      success: true,
      dashboards,
      total: dashboards.length
    });

  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      userRole,
      userId,
      isPublic = false,
      widgets = [],
      layout = 'grid',
      theme = 'auto',
      createdBy
    } = body;

    // Validate required fields
    if (!name || !userRole || !createdBy) {
      return NextResponse.json(
        { error: 'Name, userRole, and createdBy are required' },
        { status: 400 }
      );
    }

    // Validate layout
    if (!['grid', 'flex'].includes(layout)) {
      return NextResponse.json(
        { error: 'Invalid layout. Must be: grid or flex' },
        { status: 400 }
      );
    }

    // Validate theme
    if (!['light', 'dark', 'auto'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be: light, dark, or auto' },
        { status: 400 }
      );
    }

    const newDashboard = await customDashboardService.createDashboard({
      name,
      description: description || '',
      userRole,
      userId,
      isPublic,
      widgets,
      layout,
      theme,
      createdBy
    });

    return NextResponse.json({
      success: true,
      dashboard: newDashboard,
      message: 'Dashboard created successfully'
    });

  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    // Validate layout if provided
    if (updates.layout && !['grid', 'flex'].includes(updates.layout)) {
      return NextResponse.json(
        { error: 'Invalid layout. Must be: grid or flex' },
        { status: 400 }
      );
    }

    // Validate theme if provided
    if (updates.theme && !['light', 'dark', 'auto'].includes(updates.theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be: light, dark, or auto' },
        { status: 400 }
      );
    }

    const updatedDashboard = await customDashboardService.updateDashboard(id, updates);

    return NextResponse.json({
      success: true,
      dashboard: updatedDashboard,
      message: 'Dashboard updated successfully'
    });

  } catch (error) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      );
    }

    await customDashboardService.deleteDashboard(id);

    return NextResponse.json({
      success: true,
      message: 'Dashboard deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    );
  }
}