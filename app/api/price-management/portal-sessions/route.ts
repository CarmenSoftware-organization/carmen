import { NextRequest, NextResponse } from 'next/server';
import portalSessionsData from '@/lib/mock/price-management/portal-sessions.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const active = searchParams.get('active');

    let filteredSessions = [...portalSessionsData];

    // Apply filters
    if (status) {
      filteredSessions = filteredSessions.filter(session => 
        session.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (vendorId) {
      filteredSessions = filteredSessions.filter(session => 
        session.vendorId === vendorId
      );
    }

    if (active === 'true') {
      const now = new Date();
      filteredSessions = filteredSessions.filter(session => 
        session.status === 'Active' && new Date(session.expiresAt) > now
      );
    }

    // Sort by creation date (newest first)
    filteredSessions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredSessions,
      summary: {
        total: filteredSessions.length,
        active: filteredSessions.filter(s => s.status === 'Active').length,
        completed: filteredSessions.filter(s => s.status === 'Completed').length,
        pending: filteredSessions.filter(s => s.status === 'Pending').length,
        expired: filteredSessions.filter(s => s.status === 'Expired').length
      }
    });
  } catch (error) {
    console.error('Portal Sessions API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_session':
        return handleCreateSession(body);
      case 'send_invitations':
        return handleSendInvitations(body);
      case 'extend_session':
        return handleExtendSession(body);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Portal Sessions POST API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function handleCreateSession(body: any) {
  const requiredFields = ['vendorId', 'vendorName'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({
        success: false,
        error: `Missing required field: ${field}`
      }, { status: 400 });
    }
  }

  const sessionToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const newSession = {
    id: `session-${Date.now()}`,
    vendorId: body.vendorId,
    vendorName: body.vendorName,
    sessionToken,
    status: 'Pending',
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    invitedAt: new Date().toISOString(),
    accessedAt: null,
    completedAt: null,
    collectionMethod: body.collectionMethod || 'portal',
    assignedCategories: body.assignedCategories || [],
    submissionsCount: 0,
    submissions: [],
    portalUrl: `/price-management/vendor-portal/${sessionToken}`,
    lastActivity: null
  };

  return NextResponse.json({
    success: true,
    message: 'Portal session created successfully',
    data: newSession
  }, { status: 201 });
}

async function handleSendInvitations(body: any) {
  const { vendorIds, message, expirationDays } = body;

  if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'vendorIds must be a non-empty array'
    }, { status: 400 });
  }

  const invitations = vendorIds.map(vendorId => {
    const sessionToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expirationDays || 7));

    return {
      vendorId,
      sessionToken,
      portalUrl: `/price-management/vendor-portal/${sessionToken}`,
      expiresAt: expiresAt.toISOString(),
      sentAt: new Date().toISOString()
    };
  });

  return NextResponse.json({
    success: true,
    message: `Invitations sent to ${vendorIds.length} vendors`,
    data: {
      totalInvitations: vendorIds.length,
      invitations,
      message: message || 'Please submit your latest pricing information',
      expirationDays: expirationDays || 7
    }
  });
}

async function handleExtendSession(body: any) {
  const { sessionId, additionalDays } = body;

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'sessionId is required'
    }, { status: 400 });
  }

  const session = portalSessionsData.find(s => s.id === sessionId);
  if (!session) {
    return NextResponse.json({
      success: false,
      error: 'Session not found'
    }, { status: 404 });
  }

  const newExpirationDate = new Date(session.expiresAt);
  newExpirationDate.setDate(newExpirationDate.getDate() + (additionalDays || 7));

  return NextResponse.json({
    success: true,
    message: 'Session extended successfully',
    data: {
      sessionId,
      oldExpiresAt: session.expiresAt,
      newExpiresAt: newExpirationDate.toISOString(),
      additionalDays: additionalDays || 7
    }
  });
}