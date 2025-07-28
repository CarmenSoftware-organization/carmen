import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action',
          message: 'Action is required'
        },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['start', 'pause', 'resume', 'stop', 'cancel'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
          message: `Action must be one of: ${validActions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Simulate operation control
    const controlResult = {
      operationId: id,
      action,
      previousStatus: 'in_progress',
      newStatus: getNewStatus(action),
      timestamp: new Date().toISOString(),
      message: getActionMessage(action)
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: controlResult,
      message: `Operation ${action} executed successfully`
    });
  } catch (error) {
    console.error('Error controlling bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to control operation',
        message: 'An error occurred while controlling the bulk operation'
      },
      { status: 500 }
    );
  }
}

function getNewStatus(action: string): string {
  switch (action) {
    case 'start':
      return 'in_progress';
    case 'pause':
      return 'paused';
    case 'resume':
      return 'in_progress';
    case 'stop':
    case 'cancel':
      return 'cancelled';
    default:
      return 'unknown';
  }
}

function getActionMessage(action: string): string {
  switch (action) {
    case 'start':
      return 'Operation has been started';
    case 'pause':
      return 'Operation has been paused';
    case 'resume':
      return 'Operation has been resumed';
    case 'stop':
      return 'Operation has been stopped';
    case 'cancel':
      return 'Operation has been cancelled';
    default:
      return 'Operation action completed';
  }
}