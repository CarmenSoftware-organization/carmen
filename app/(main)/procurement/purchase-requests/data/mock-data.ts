import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage, CurrencyCode } from '@/lib/types'

// Mock requestors
const requestors = [
  { id: 'user1', name: 'John Doe', department: 'IT' },
  { id: 'user2', name: 'Jane Smith', department: 'Finance' },
  { id: 'user3', name: 'Michael Johnson', department: 'Operations' },
  { id: 'user4', name: 'Emily Brown', department: 'Marketing' },
  { id: 'user5', name: 'David Wilson', department: 'HR' },
  { id: 'user6', name: 'Sarah Lee', department: 'Kitchen' },
  { id: 'user7', name: 'Robert Chen', department: 'Purchasing' },
]

// Mock vendors
const vendors = [
  { id: 1, name: 'Tech Supplies Co.' },
  { id: 2, name: 'Office Essentials Ltd.' },
  { id: 3, name: 'Fresh Produce Distributors' },
  { id: 4, name: 'Kitchen Equipment Specialists' },
  { id: 5, name: 'Furniture Warehouse' },
  { id: 6, name: 'Industrial Supplies Inc.' },
  { id: 7, name: 'Global IT Solutions' },
]

// Mock locations
const locations = ['HQ', 'Branch Office', 'Warehouse', 'Kitchen', 'Restaurant', 'Store #1', 'Store #2']

// Mock descriptions for different PR types
const descriptions = {
  [PRType.GeneralPurchase]: [
    'Office supplies and stationery',
    'Cleaning supplies for Q2',
    'Staff uniforms',
    'Maintenance tools and equipment',
    'Safety equipment',
  ],
  [PRType.MarketList]: [
    'Fresh produce for week 23',
    'Meat and seafood for weekend special',
    'Dry goods monthly stock',
    'Dairy products weekly order',
    'Specialty ingredients for new menu',
  ],
  [PRType.AssetPurchase]: [
    'New workstations for IT department',
    'Kitchen equipment upgrade',
    'Office furniture for new hires',
    'POS system replacement',
    'Delivery vehicles',
  ],
}

// Generate a random date within the last 3 months
const getRandomRecentDate = () => {
  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(now.getMonth() - 3)
  
  return new Date(
    threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
  )
}

// Generate a random future date within the next month
const getRandomFutureDate = () => {
  const now = new Date()
  const oneMonthLater = new Date(now)
  oneMonthLater.setMonth(now.getMonth() + 1)
  
  return new Date(
    now.getTime() + Math.random() * (oneMonthLater.getTime() - now.getTime())
  )
}

// Generate a random amount within a range
const getRandomAmount = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Generate a PR number with a prefix and sequential number
const generatePRNumber = (index: number) => {
  return `PR${String(2024000 + index).padStart(6, '0')}`
}

// Create mock purchase requests
export const mockPurchaseRequests: PurchaseRequest[] = Array.from({ length: 15 }, (_, index) => {
  // Determine type and status based on index to ensure a good mix
  const typeIndex = index % 3
  const prType = Object.values(PRType)[typeIndex]
  
  const statusIndex = index % 4
  const statuses = [
    DocumentStatus.Draft,
    DocumentStatus.Submitted,
    DocumentStatus.InProgress,
    DocumentStatus.Completed
  ]
  const status = statuses[statusIndex]
  
  // Set workflow status based on document status
  let workflowStatus = WorkflowStatus.pending
  let workflowStage = WorkflowStage.departmentHeadApproval
  
  if (status === DocumentStatus.Completed) {
    workflowStatus = WorkflowStatus.approved
    workflowStage = WorkflowStage.completed
  } else if (status === DocumentStatus.Rejected) {
    workflowStatus = WorkflowStatus.rejected
    workflowStage = WorkflowStage.departmentHeadApproval
  } else if (status === DocumentStatus.Draft) {
    workflowStatus = WorkflowStatus.pending
    workflowStage = WorkflowStage.requester
  }
  
  // Select random requestor, vendor, location
  const requestor = requestors[index % requestors.length]
  const vendor = vendors[index % vendors.length]
  const location = locations[index % locations.length]
  
  // Generate random amounts
  const baseAmount = getRandomAmount(500, 10000)
  const taxRate = 0.1 // 10% tax
  const taxAmount = Math.round(baseAmount * taxRate)
  const totalAmount = baseAmount + taxAmount
  
  // Select a description based on PR type
  const typeDescriptions = descriptions[prType as keyof typeof descriptions] || descriptions[PRType.GeneralPurchase]
  const description = typeDescriptions[index % typeDescriptions.length]
  
  // Create the purchase request
  return {
    id: String(index + 1),
    refNumber: generatePRNumber(index + 1),
    date: getRandomRecentDate(),
    type: prType,
    vendor: vendor.name,
    vendorId: vendor.id,
    deliveryDate: getRandomFutureDate(),
    description,
    requestorId: requestor.id,
    requestor: {
      name: requestor.name,
      id: requestor.id,
      department: requestor.department
    },
    status,
    workflowStatus,
    currentWorkflowStage: workflowStage,
    location,
    department: requestor.department,
    jobCode: `${requestor.department.substring(0, 2).toUpperCase()}2024Q${Math.floor(index / 4) + 1}`,
    estimatedTotal: totalAmount,
    currency: CurrencyCode.USD,
    baseCurrencyCode: CurrencyCode.USD,
    baseSubTotalPrice: baseAmount,
    subTotalPrice: baseAmount,
    baseNetAmount: baseAmount,
    netAmount: baseAmount,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: taxAmount,
    taxAmount: taxAmount,
    baseTotalAmount: totalAmount,
    totalAmount
  }
}) 