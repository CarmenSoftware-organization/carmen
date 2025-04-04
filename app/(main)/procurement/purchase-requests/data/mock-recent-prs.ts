import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage } from "@/lib/types";

/**
 * Mock data for recent Purchase Requests
 * This data follows the PurchaseRequest interface defined in lib/types.ts
 */
export const mockRecentPRs: Partial<PurchaseRequest>[] = [
  {
    id: "pr001",
    refNumber: "PR-2023-001",
    date: new Date("2023-11-15"),
    description: "Office furniture for meeting room",
    vendor: "Furniture Plus",
    vendorId: 1004,
    type: PRType.AssetPurchase,
    status: DocumentStatus.Completed,
    workflowStatus: WorkflowStatus.approved,
    currentWorkflowStage: WorkflowStage.completed,
    department: "Administration",
    location: "HQ",
    jobCode: "ADMIN-2023",
    currency: "USD",
    totalAmount: 2499.99,
    items: [
      {
        name: "Conference Table",
        description: "8-person conference table, oak finish",
        unit: "Unit",
        location: "HQ",
        vendor: "Furniture Plus",
        price: 1299.99,
        taxRate: 7,
        discountRate: 0,
        quantityRequested: 1,
        quantityApproved: 1,
        deliveryDate: new Date("2023-11-30"),
        deliveryPoint: "Main Reception",
        currency: "USD",
        currencyRate: 1,
        foc: 0,
        taxIncluded: false,
        adjustments: {
          tax: false
        },
        itemCategory: "Furniture",
        itemSubcategory: "Tables",
        status: "Accepted",
        inventoryInfo: {
          onHand: 0,
          onOrdered: 1,
          reorderLevel: 0,
          restockLevel: 0,
          averageMonthlyUsage: 0,
          lastPrice: 1299.99,
          lastOrderDate: new Date("2023-10-15"),
          lastVendor: "Furniture Plus",
          inventoryUnit: "Unit"
        },
        accountCode: "CAPEX-FURN",
        jobCode: "ADMIN-2023",
        baseSubTotalPrice: 1299.99,
        subTotalPrice: 1299.99,
        baseNetAmount: 1299.99,
        netAmount: 1299.99,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 91.00,
        taxAmount: 91.00,
        baseTotalAmount: 1390.99,
        totalAmount: 1390.99,
        baseCurrency: "USD",
        pricelistNumber: "PL-2023-001",
        comment: "Needed for new meeting room"
      },
      {
        name: "Office Chairs",
        description: "Ergonomic office chairs, black",
        unit: "Unit",
        location: "HQ",
        vendor: "Furniture Plus",
        price: 249.99,
        taxRate: 7,
        discountRate: 0,
        quantityRequested: 8,
        quantityApproved: 8,
        deliveryDate: new Date("2023-11-30"),
        deliveryPoint: "Main Reception",
        currency: "USD",
        currencyRate: 1,
        foc: 0,
        taxIncluded: false,
        adjustments: {
          tax: false
        },
        itemCategory: "Furniture",
        itemSubcategory: "Chairs",
        status: "Accepted",
        inventoryInfo: {
          onHand: 2,
          onOrdered: 8,
          reorderLevel: 2,
          restockLevel: 5,
          averageMonthlyUsage: 1,
          lastPrice: 249.99,
          lastOrderDate: new Date("2023-09-10"),
          lastVendor: "Furniture Plus",
          inventoryUnit: "Unit"
        },
        accountCode: "CAPEX-FURN",
        jobCode: "ADMIN-2023",
        baseSubTotalPrice: 1999.92,
        subTotalPrice: 1999.92,
        baseNetAmount: 1999.92,
        netAmount: 1999.92,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 139.99,
        taxAmount: 139.99,
        baseTotalAmount: 2139.91,
        totalAmount: 2139.91,
        baseCurrency: "USD",
        pricelistNumber: "PL-2023-001",
        comment: "Ergonomic chairs for new meeting room"
      }
    ]
  },
  {
    id: "pr002",
    refNumber: "PR-2023-002",
    date: new Date("2023-11-10"),
    description: "Monthly cleaning supplies",
    vendor: "Janitorial Supply Co.",
    vendorId: 1005,
    type: PRType.GeneralPurchase,
    status: DocumentStatus.Completed,
    workflowStatus: WorkflowStatus.approved,
    currentWorkflowStage: WorkflowStage.completed,
    department: "Housekeeping",
    location: "Main Building",
    jobCode: "HOUSE-2023",
    currency: "USD",
    totalAmount: 349.50,
    items: [
      {
        name: "All-Purpose Cleaner",
        description: "Industrial all-purpose cleaner, 5L",
        unit: "Bottle",
        location: "Main Building",
        vendor: "Janitorial Supply Co.",
        price: 24.99,
        taxRate: 7,
        discountRate: 0,
        quantityRequested: 5,
        quantityApproved: 5,
        deliveryDate: new Date("2023-11-20"),
        deliveryPoint: "Housekeeping Storage",
        currency: "USD",
        currencyRate: 1,
        foc: 0,
        taxIncluded: false,
        adjustments: {
          tax: false
        },
        itemCategory: "Cleaning Supplies",
        itemSubcategory: "Cleaners",
        status: "Accepted",
        inventoryInfo: {
          onHand: 2,
          onOrdered: 5,
          reorderLevel: 3,
          restockLevel: 8,
          averageMonthlyUsage: 4,
          lastPrice: 24.99,
          lastOrderDate: new Date("2023-10-10"),
          lastVendor: "Janitorial Supply Co.",
          inventoryUnit: "Bottle"
        },
        accountCode: "OPEX-CLEAN",
        jobCode: "HOUSE-2023",
        baseSubTotalPrice: 124.95,
        subTotalPrice: 124.95,
        baseNetAmount: 124.95,
        netAmount: 124.95,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 8.75,
        taxAmount: 8.75,
        baseTotalAmount: 133.70,
        totalAmount: 133.70,
        baseCurrency: "USD",
        pricelistNumber: "PL-2023-002",
        comment: "Monthly restocking"
      },
      {
        name: "Microfiber Cloths",
        description: "Microfiber cleaning cloths, pack of 50",
        unit: "Pack",
        location: "Main Building",
        vendor: "Janitorial Supply Co.",
        price: 19.99,
        taxRate: 7,
        discountRate: 0,
        quantityRequested: 3,
        quantityApproved: 3,
        deliveryDate: new Date("2023-11-20"),
        deliveryPoint: "Housekeeping Storage",
        currency: "USD",
        currencyRate: 1,
        foc: 0,
        taxIncluded: false,
        adjustments: {
          tax: false
        },
        itemCategory: "Cleaning Supplies",
        itemSubcategory: "Cloths",
        status: "Accepted",
        inventoryInfo: {
          onHand: 1,
          onOrdered: 3,
          reorderLevel: 1,
          restockLevel: 3,
          averageMonthlyUsage: 2,
          lastPrice: 19.99,
          lastOrderDate: new Date("2023-10-10"),
          lastVendor: "Janitorial Supply Co.",
          inventoryUnit: "Pack"
        },
        accountCode: "OPEX-CLEAN",
        jobCode: "HOUSE-2023",
        baseSubTotalPrice: 59.97,
        subTotalPrice: 59.97,
        baseNetAmount: 59.97,
        netAmount: 59.97,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 4.20,
        taxAmount: 4.20,
        baseTotalAmount: 64.17,
        totalAmount: 64.17,
        baseCurrency: "USD",
        pricelistNumber: "PL-2023-002",
        comment: "Running low on cleaning cloths"
      }
    ]
  }
];

/**
 * Function to get a recent PR by ID
 * @param prId The ID of the PR to retrieve
 * @returns The PR with the specified ID, or undefined if not found
 */
export function getRecentPRById(prId: string): Partial<PurchaseRequest> | undefined {
  return mockRecentPRs.find(pr => pr.id === prId);
}

/**
 * Function to get recent PRs by type
 * @param type The PR type to filter by
 * @returns An array of PRs of the specified type
 */
export function getRecentPRsByType(type: PRType): Partial<PurchaseRequest>[] {
  return mockRecentPRs.filter(pr => pr.type === type);
}

/**
 * Function to get recent PRs by department
 * @param department The department to filter by
 * @returns An array of PRs for the specified department
 */
export function getRecentPRsByDepartment(department: string): Partial<PurchaseRequest>[] {
  return mockRecentPRs.filter(pr => pr.department === department);
} 