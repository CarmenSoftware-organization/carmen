import { NextRequest, NextResponse } from 'next/server';

// Mock data for individual test data set
const mockTestDataSet = {
  id: 'dataset-001',
  name: 'Standard Office Supplies',
  description: 'Common office supply scenarios for basic rule testing',
  category: 'office-supplies',
  testCases: [
    {
      id: 'case-001',
      name: 'Standard Pen Purchase',
      description: 'Typical pen purchase scenario',
      testData: {
        product: { id: 'prod-001', name: 'Office Pens', category: 'office-supplies' },
        request: { quantity: 50, urgency: 'normal', department: 'HR' },
        vendor: { id: 'vendor-001', name: 'Office Depot', isPreferred: true, location: 'local' },
        price: { total: 125.50, currency: 'USD' }
      },
      expectedResults: [
        { ruleId: 'rule-001', shouldTrigger: true, expectedAction: 'assignVendor', confidence: 95 }
      ]
    }
  ],
  createdAt: '2024-01-20T10:00:00Z',
  createdBy: 'admin',
  isBuiltIn: true,
  usageCount: 45,
  lastUsed: '2024-01-25T14:30:00Z',
  metadata: {
    totalTestCases: 2,
    successRate: 95.5,
    averageExecutionTime: 1.2,
    lastExecutionResults: {
      passed: 18,
      failed: 1,
      total: 19
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // In a real implementation, this would fetch from database
    const testDataSet = { ...mockTestDataSet, id };
    
    return NextResponse.json({
      success: true,
      testDataSet
    });
  } catch (error) {
    console.error('Error fetching test data set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test data set' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Check if it's a built-in data set
    if (mockTestDataSet.isBuiltIn && id === mockTestDataSet.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify built-in test data sets' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would update the database
    const updatedDataSet = {
      ...mockTestDataSet,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };
    
    console.log('Updating test data set:', id, body);
    
    return NextResponse.json({
      success: true,
      message: 'Test data set updated successfully',
      testDataSet: updatedDataSet
    });
  } catch (error) {
    console.error('Error updating test data set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update test data set' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if it's a built-in data set
    if (mockTestDataSet.isBuiltIn && id === mockTestDataSet.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete built-in test data sets' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would delete from database
    console.log('Deleting test data set:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Test data set deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test data set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test data set' },
      { status: 500 }
    );
  }
}