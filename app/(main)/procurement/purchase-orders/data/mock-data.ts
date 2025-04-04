import { PurchaseOrder, PurchaseOrderStatus, CurrencyCode } from '@/lib/types'

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

// Mock buyers
const buyers = [
  'John Smith',
  'Maria Rodriguez',
  'David Chen',
  'Sarah Johnson',
  'Michael Brown',
  'Emily Davis',
  'Robert Wilson',
]

// Mock descriptions
const descriptions = [
  'Office supplies and equipment',
  'IT hardware and accessories',
  'Kitchen equipment and utensils',
  'Furniture and fixtures',
  'Cleaning supplies and equipment',
  'Maintenance tools and materials',
  'Marketing materials and supplies',
]

// Generate a random date within the last 6 months
const getRandomRecentDate = () => {
  const now = new Date()
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(now.getMonth() - 6)
  
  return new Date(
    sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
  )
}

// Generate a random future date within the next 2 months
const getRandomFutureDate = () => {
  const now = new Date()
  const twoMonthsLater = new Date(now)
  twoMonthsLater.setMonth(now.getMonth() + 2)
  
  return new Date(
    now.getTime() + Math.random() * (twoMonthsLater.getTime() - now.getTime())
  )
}

// Generate a random amount within a range
const getRandomAmount = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Generate a PO number with a prefix and sequential number
const generatePONumber = (index: number) => {
  return `PO-${String(2024000 + index).padStart(6, '0')}`
}

// Create mock purchase orders
export const mockPurchaseOrders: PurchaseOrder[] = Array.from({ length: 15 }, (_, index) => {
  // Determine status based on index to ensure a good mix
  const statusIndex = index % 4
  const statuses = [
    PurchaseOrderStatus.Open,
    PurchaseOrderStatus.Sent,
    PurchaseOrderStatus.Partial,
    PurchaseOrderStatus.Closed
  ]
  const status = statuses[statusIndex]
  
  // Select random vendor and buyer
  const vendor = vendors[index % vendors.length]
  const buyer = buyers[index % buyers.length]
  
  // Generate random amounts
  const baseAmount = getRandomAmount(1000, 20000)
  const taxRate = 0.1 // 10% tax
  const discountRate = 0.05 // 5% discount
  const discountAmount = Math.round(baseAmount * discountRate)
  const subTotalPrice = baseAmount - discountAmount
  const taxAmount = Math.round(subTotalPrice * taxRate)
  const totalAmount = subTotalPrice + taxAmount
  
  // Select a description
  const description = descriptions[index % descriptions.length]
  
  // Generate dates
  const orderDate = getRandomRecentDate()
  const deliveryDate = getRandomFutureDate()
  
  // Create the purchase order
  return {
    poId: String(index + 1),
    number: generatePONumber(index + 1),
    vendorId: vendor.id,
    vendorName: vendor.name,
    orderDate,
    DeliveryDate: deliveryDate,
    status,
    currencyCode: CurrencyCode.USD,
    baseCurrencyCode: CurrencyCode.USD,
    exchangeRate: 1,
    notes: `Order for ${description.toLowerCase()}`,
    createdBy: 101 + index,
    approvedBy: 201 + index,
    approvalDate: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // 1 day after order date
    email: `orders@${vendor.name.toLowerCase().replace(/\s+/g, '')}.com`,
    buyer,
    creditTerms: index % 2 === 0 ? "Net 30" : "Net 45",
    description,
    remarks: "Please deliver during business hours",
    baseSubTotalPrice: baseAmount,
    subTotalPrice: baseAmount,
    baseNetAmount: subTotalPrice,
    netAmount: subTotalPrice,
    baseDiscAmount: discountAmount,
    discountAmount,
    baseTaxAmount: taxAmount,
    taxAmount,
    baseTotalAmount: totalAmount,
    totalAmount,
    items: [] // We're not focusing on items for the list view
  }
}) 