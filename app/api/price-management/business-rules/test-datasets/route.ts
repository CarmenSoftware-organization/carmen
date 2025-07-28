import { NextRequest, NextResponse } from 'next/server';

// Mock data for test data sets
const mockTestDataSets = [
  {
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
      },
      {
        id: 'case-002',
        name: 'Bulk Paper Purchase',
        description: 'Large quantity paper purchase',
        testData: {
          product: { id: 'prod-002', name: 'Copy Paper', category: 'office-supplies' },
          request: { quantity: 500, urgency: 'normal', department: 'HR' },
          vendor: { id: 'vendor-002', name: 'Paper Plus', hasBulkPricing: true, bulkMinQuantity: 100 },
          price: { total: 750.00, currency: 'USD' }
        },
        expectedResults: [
          { ruleId: 'rule-002', shouldTrigger: true, expectedAction: 'applyBulkDiscount', confidence: 98 }
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
  },
  {
    id: 'dataset-002',
    name: 'High-Value Electronics',
    description: 'Test scenarios for expensive electronics purchases',
    category: 'electronics',
    testCases: [
      {
        id: 'case-003',
        name: 'Laptop Purchase',
        description: 'High-value laptop purchase requiring approval',
        testData: {
          product: { id: 'prod-003', name: 'Business Laptop', category: 'electronics' },
          request: { quantity: 10, urgency: 'normal', department: 'IT' },
          vendor: { id: 'vendor-003', name: 'Tech Solutions', isPreferred: false, location: 'national' },
          price: { total: 15000.00, currency: 'USD' }
        },
        expectedResults: [
          { ruleId: 'rule-003', shouldTrigger: true, expectedAction: 'flagForReview', confidence: 100 },
          { ruleId: 'rule-004', shouldTrigger: true, expectedAction: 'requireApproval', confidence: 100 }
        ]
      }
    ],
    createdAt: '2024-01-22T09:15:00Z',
    createdBy: 'it.manager',
    isBuiltIn: false,
    usageCount: 12,
    lastUsed: '2024-01-24T16:45:00Z',
    metadata: {
      totalTestCases: 1,
      successRate: 88.7,
      averageExecutionTime: 2.1,
      lastExecutionResults: {
        passed: 8,
        failed: 1,
        total: 9
      }
    }
  },
  {
    id: 'dataset-003',
    name: 'International Vendors',
    description: 'Test scenarios for international vendor transactions',
    category: 'international',
    testCases: [
      {
        id: 'case-004',
        name: 'European Equipment',
        description: 'Equipment purchase from European vendor',
        testData: {
          product: { id: 'prod-004', name: 'Manufacturing Equipment', category: 'equipment' },
          request: { quantity: 1, urgency: 'normal', department: 'Production' },
          vendor: { id: 'vendor-004', name: 'European Suppliers', location: 'international' },
          price: { total: 2500.00, currency: 'EUR' }
        },
        expectedResults: [
          { ruleId: 'rule-005', shouldTrigger: true, expectedAction: 'convertCurrency', confidence: 99 },
          { ruleId: 'rule-006', shouldTrigger: true, expectedAction: 'addImportDuty', confidence: 95 }
        ]
      }
    ],
    createdAt: '2024-01-21T11:30:00Z',
    createdBy: 'procurement.manager',
    isBuiltIn: false,
    usageCount: 8,
    lastUsed: '2024-01-23T13:20:00Z',
    metadata: {
      totalTestCases: 1,
      successRate: 92.3,
      averageExecutionTime: 1.8,
      lastExecutionResults: {
        passed: 7,
        failed: 1,
        total: 8
      }
    }
  },
  {
    id: 'dataset-004',
    name: 'Edge Cases',
    description: 'Test scenarios for edge cases and error conditions',
    category: 'edge-cases',
    testCases: [
      {
        id: 'case-005',
        name: 'Zero Quantity Request',
        description: 'Invalid request with zero quantity',
        testData: {
          product: { id: 'prod-005', name: 'Test Product', category: 'office-supplies' },
          request: { quantity: 0, urgency: 'normal', department: 'HR' },
          vendor: { id: 'vendor-005', name: 'Test Vendor', isPreferred: true, location: 'local' },
          price: { total: 0.00, currency: 'USD' }
        },
        expectedResults: [
          { ruleId: 'rule-007', shouldTrigger: true, expectedAction: 'rejectRequest', confidence: 100 }
        ]
      },
      {
        id: 'case-006',
        name: 'Unsupported Currency',
        description: 'Request with unsupported currency',
        testData: {
          product: { id: 'prod-006', name: 'Special Item', category: 'office-supplies' },
          request: { quantity: 1, urgency: 'normal', department: 'HR' },
          vendor: { id: 'vendor-006', name: 'Exotic Vendor', location: 'international' },
          price: { total: 100.00, currency: 'XYZ' }
        },
        expectedResults: [
          { ruleId: 'rule-008', shouldTrigger: true, expectedAction: 'flagForManualReview', confidence: 100 }
        ]
      }
    ],
    createdAt: '2024-01-23T14:00:00Z',
    createdBy: 'qa.tester',
    isBuiltIn: false,
    usageCount: 25,
    lastUsed: '2024-01-25T10:15:00Z',
    metadata: {
      totalTestCases: 2,
      successRate: 78.4,
      averageExecutionTime: 1.5,
      lastExecutionResults: {
        passed: 19,
        failed: 6,
        total: 25
      }
    }
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      testDataSets: mockTestDataSets,
      totalCount: mockTestDataSets.length
    });
  } catch (error) {
    console.error('Error fetching test data sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test data sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, category' },
        { status: 400 }
      );
    }

    // Create new test data set
    const newDataSet = {
      id: `dataset-${Date.now()}`,
      name: body.name,
      description: body.description,
      category: body.category,
      testCases: body.testCases || [],
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || 'current-user',
      isBuiltIn: false,
      usageCount: 0,
      lastUsed: null
    };

    // In a real implementation, this would save to database
    console.log('Creating new test data set:', newDataSet);

    return NextResponse.json({
      success: true,
      message: 'Test data set created successfully',
      testDataSet: newDataSet
    });
  } catch (error) {
    console.error('Error creating test data set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test data set' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Missing test data set ID' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update the database
    console.log('Updating test data set:', body.id, body);

    return NextResponse.json({
      success: true,
      message: 'Test data set updated successfully',
      testDataSet: body
    });
  } catch (error) {
    console.error('Error updating test data set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update test data set' },
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
        { success: false, error: 'Missing test data set ID' },
        { status: 400 }
      );
    }

    // Check if it's a built-in data set
    const dataSet = mockTestDataSets.find(ds => ds.id === id);
    if (dataSet?.isBuiltIn) {
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