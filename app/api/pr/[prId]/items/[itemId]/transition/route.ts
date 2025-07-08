import { NextRequest, NextResponse } from 'next/server';
import { EnhancedPRItem, UserRole } from '@/app/(main)/procurement/purchase-requests/components/tabs/UpdatedEnhancedItemsTab';

// Type alias for backward compatibility  
type EnhancedItemStatus = string;

// Mock items store - same as other endpoints
let mockItems: any[] = [];

// POST /api/pr/[prId]/items/[itemId]/transition - Transition item status
export async function POST(
  request: NextRequest,
  { params }: { params: { prId: string; itemId: string } }
) {
  try {
    const body = await request.json();
    const { toStatus, comments, fieldUpdates, notifyUsers } = body;
    const { searchParams } = new URL(request.url);
    const userRole = (searchParams.get('userRole') as UserRole) || 'staff';
    
    const itemIndex = mockItems.findIndex(item => item.id === params.itemId);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    const currentItem = mockItems[itemIndex];
    
    // Validate transition is allowed
    const isValidTransition = (from: EnhancedItemStatus, to: EnhancedItemStatus, role: UserRole): boolean => {
      const validTransitions: Record<UserRole, Record<EnhancedItemStatus, EnhancedItemStatus[]>> = {
        staff: {
          draft: ['pending_hd'],
          review: ['draft'], // Can revise and resubmit
          pending_hd: [],
          hd_approved: [],
          pending_manager: [],
          manager_approved: [],
          rejected: []
        },
        hd: {
          draft: [],
          review: [],
          pending_hd: ['hd_approved', 'review', 'rejected'],
          hd_approved: [],
          pending_manager: [],
          manager_approved: [],
          rejected: []
        },
        purchase_staff: {
          draft: [],
          review: [],
          pending_hd: [],
          hd_approved: ['pending_manager'],
          pending_manager: [],
          manager_approved: [],
          rejected: []
        },
        finance_manager: {
          draft: [],
          review: [],
          pending_hd: [],
          hd_approved: [],
          pending_manager: ['manager_approved', 'review', 'rejected'],
          manager_approved: [],
          rejected: []
        },
        gm: {
          draft: [],
          review: [],
          pending_hd: [],
          hd_approved: [],
          pending_manager: [],
          manager_approved: [],
          rejected: []
        }
      };
      
      return validTransitions[role][from]?.includes(to) || false;
    };
    
    if (!isValidTransition((currentItem as any).documentStatus, toStatus, userRole)) {
      return NextResponse.json(
        { 
          error: 'Invalid status transition',
          message: `Cannot transition from '${(currentItem as any).documentStatus}' to '${toStatus}' as ${userRole}`,
          validTransitions: getValidTransitions((currentItem as any).documentStatus, userRole)
        },
        { status: 400 }
      );
    }
    
    // Validate required fields for specific transitions
    if ((toStatus === 'review' || toStatus === 'rejected') && !comments?.trim()) {
      return NextResponse.json(
        { 
          error: 'Comments required',
          message: `Comments are required when ${toStatus === 'review' ? 'sending for review' : 'rejecting'} an item`,
          requiredFields: ['comments']
        },
        { status: 400 }
      );
    }
    
    // Prepare updates
    const updates: any = {
      documentStatus: toStatus as any,
      version: currentItem.version + 1,
      lastModifiedBy: 'current-user' // Would come from auth context
    };
    
    // Add status-specific fields
    if (toStatus === 'review' && comments) {
      (updates as any).reviewComments = comments;
    }
    
    if (toStatus === 'rejected' && comments) {
      (updates as any).rejectionReason = comments;
    }
    
    // Apply any field updates provided
    if (fieldUpdates) {
      if (fieldUpdates.approvedQuantity !== undefined) {
        (updates as any).approvedQuantity = fieldUpdates.approvedQuantity;
      }
      if (fieldUpdates.approvedUnit !== undefined) {
        (updates as any).approvedUnit = fieldUpdates.approvedUnit;
      }
    }
    
    // Apply updates
    mockItems[itemIndex] = { ...currentItem, ...updates };
    const updatedItem = mockItems[itemIndex];
    
    // Determine notifications to send
    const notifications = {
      sent: [] as { userId: string; method: string; sentAt: string }[],
      failed: [] as { userId: string; method: string; error: string }[]
    };
    
    // Mock notification logic
    const notificationTargets = getNotificationTargets(toStatus, userRole);
    for (const target of notificationTargets) {
      // In real implementation, this would call actual notification service
      notifications.sent.push({
        userId: target,
        method: 'email',
        sentAt: new Date().toISOString()
      });
    }
    
    // Add any additional users specified
    if (notifyUsers?.length) {
      for (const userId of notifyUsers) {
        notifications.sent.push({
          userId,
          method: 'email',
          sentAt: new Date().toISOString()
        });
      }
    }
    
    // Get next available actions
    const nextActions = getAvailableActions(updatedItem, userRole);
    
    // Filter item for response based on role
    const filteredItem = filterItemByRole(updatedItem, userRole);
    
    return NextResponse.json({
      item: filteredItem,
      message: 'Status updated successfully',
      nextActions,
      notifications
    });
  } catch (error) {
    console.error('Error transitioning item status:', error);
    return NextResponse.json(
      { error: 'Failed to transition item status' },
      { status: 500 }
    );
  }
}

// Helper functions
function getValidTransitions(currentStatus: EnhancedItemStatus, userRole: UserRole): EnhancedItemStatus[] {
  const validTransitions: Record<UserRole, Record<EnhancedItemStatus, EnhancedItemStatus[]>> = {
    staff: {
      draft: ['pending_hd'],
      review: ['draft'],
      pending_hd: [],
      hd_approved: [],
      pending_manager: [],
      manager_approved: [],
      rejected: []
    },
    hd: {
      draft: [],
      review: [],
      pending_hd: ['hd_approved', 'review', 'rejected'],
      hd_approved: [],
      pending_manager: [],
      manager_approved: [],
      rejected: []
    },
    purchase_staff: {
      draft: [],
      review: [],
      pending_hd: [],
      hd_approved: ['pending_manager'],
      pending_manager: [],
      manager_approved: [],
      rejected: []
    },
    finance_manager: {
      draft: [],
      review: [],
      pending_hd: [],
      hd_approved: [],
      pending_manager: ['manager_approved', 'review', 'rejected'],
      manager_approved: [],
      rejected: []
    },
    gm: {
      draft: [],
      review: [],
      pending_hd: [],
      hd_approved: [],
      pending_manager: [],
      manager_approved: [],
      rejected: []
    }
  };
  
  return validTransitions[userRole][currentStatus] || [];
}

function getNotificationTargets(newStatus: EnhancedItemStatus, changedBy: UserRole): string[] {
  const targets: string[] = [];
  
  switch (newStatus) {
    case 'pending_hd':
      targets.push('hd_user'); // Notify HD when item submitted
      break;
    case 'hd_approved':
      targets.push('purchase_staff_user'); // Notify purchase staff when HD approves
      break;
    case 'pending_manager':
      targets.push('manager_user'); // Notify manager when submitted for final approval
      break;
    case 'review':
      targets.push('original_requestor'); // Notify requestor when sent for review
      break;
    case 'rejected':
      targets.push('original_requestor'); // Notify requestor when rejected
      break;
    case 'manager_approved':
      targets.push('purchase_staff_user', 'original_requestor'); // Notify both when finally approved
      break;
  }
  
  return targets;
}

function getAvailableActions(item: any, userRole: UserRole) {
  const actions = [];
  
  switch (userRole) {
    case 'staff':
      if ((item as any).documentStatus === 'draft') {
        actions.push({ 
          action: 'pending_hd', 
          label: 'Submit for Approval', 
          requiresComment: false 
        });
      }
      break;
      
    case 'hd':
      if ((item as any).documentStatus === 'pending_hd') {
        actions.push(
          { action: 'hd_approved', label: 'Approve', requiresComment: false },
          { action: 'review', label: 'Send for Review', requiresComment: true },
          { action: 'rejected', label: 'Reject', requiresComment: true }
        );
      }
      break;
      
    case 'purchase_staff':
      if ((item as any).documentStatus === 'hd_approved') {
        actions.push({ 
          action: 'pending_manager', 
          label: 'Submit to Manager', 
          requiresComment: false 
        });
      }
      break;
      
    case 'finance_manager':
      if ((item as any).documentStatus === 'pending_manager') {
        actions.push(
          { action: 'manager_approved', label: 'Final Approve', requiresComment: false },
          { action: 'review', label: 'Send for Review', requiresComment: true },
          { action: 'rejected', label: 'Reject', requiresComment: true }
        );
      }
      break;
      
    case 'gm':
      // GM role might have specific actions here if needed
      break;
  }
  
  return actions;
}

function filterItemByRole(item: any, userRole: UserRole): any {
  const filteredItem = { ...item };
  
  // Hide financial information from staff
  if (userRole === 'staff') {
    delete filteredItem.estimatedUnitPrice;
    delete filteredItem.estimatedTotalPrice;
    delete filteredItem.estimatedVendorName;
    delete filteredItem.priceEstimateSource;
    delete filteredItem.priceEstimateAccuracy;
    delete filteredItem.purchaserEstimatedPrice;
    delete filteredItem.purchaserVendorId;
    delete filteredItem.purchaserNotes;
    delete filteredItem.actualUnitPrice;
    delete filteredItem.actualTotalPrice;
  }
  
  return filteredItem;
}