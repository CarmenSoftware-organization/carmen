interface PricelistItem {
  id: string;
  rank: number;
  sku: string;
  productName: string;
  name: string;
  taxRate: number;
  price: number;
  unit: string;
  discountPercentage: number;
  discountAmount: number;
  minQuantity: number;
  total: number;
  lastReceivedPrice: number;
}

interface Pricelist {
  id: string;
  number: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items: PricelistItem[];
}

export const mockPriceLists: Pricelist[] = [
  {
    id: "1",
    number: "PL-2023-001",
    name: "Summer Sale 2023",
    description: "Special discounts for summer products",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    isActive: true,
    items: [
      {
        id: "1",
        rank: 1,
        sku: "SUM-001",
        productName: "Beach Umbrella",
        name: "Large Beach Umbrella",
        taxRate: 0.08,
        price: 39.99,
        unit: "each",
        discountPercentage: 10,
        discountAmount: 4.00,
        minQuantity: 1,
        total: 35.99,
        lastReceivedPrice: 25.00
      },
      {
        id: "2",
        rank: 2,
        sku: "SUM-002",
        productName: "Sunscreen",
        name: "SPF 50 Sunscreen",
        taxRate: 0.08,
        price: 12.99,
        unit: "bottle",
        discountPercentage: 5,
        discountAmount: 0.65,
        minQuantity: 2,
        total: 12.34,
        lastReceivedPrice: 8.50
      },
      {
        id: "3",
        rank: 3,
        sku: "SUM-003",
        productName: "Beach Towel",
        name: "Extra Large Beach Towel",
        taxRate: 0.08,
        price: 24.99,
        unit: "each",
        discountPercentage: 15,
        discountAmount: 3.75,
        minQuantity: 1,
        total: 21.24,
        lastReceivedPrice: 15.00
      },
      {
        id: "4",
        rank: 4,
        sku: "SUM-004",
        productName: "Cooler",
        name: "20L Portable Cooler",
        taxRate: 0.08,
        price: 49.99,
        unit: "each",
        discountPercentage: 20,
        discountAmount: 10.00,
        minQuantity: 1,
        total: 39.99,
        lastReceivedPrice: 30.00
      },
      {
        id: "5",
        rank: 5,
        sku: "SUM-005",
        productName: "Flip Flops",
        name: "Comfortable Flip Flops",
        taxRate: 0.08,
        price: 14.99,
        unit: "pair",
        discountPercentage: 0,
        discountAmount: 0,
        minQuantity: 1,
        total: 14.99,
        lastReceivedPrice: 7.50
      }
    ]
  },
  {
    id: "2",
    number: "PL-2023-002",
    name: "Winter Discount 2023",
    description: "Special winter product discounts",
    startDate: "2023-11-01",
    endDate: "2024-02-28",
    isActive: true,
    items: [
      {
        id: "1",
        rank: 1,
        sku: "WIN-001",
        productName: "Winter Jacket",
        name: "Insulated Winter Jacket",
        taxRate: 0.08,
        price: 99.99,
        unit: "each",
        discountPercentage: 15,
        discountAmount: 15.00,
        minQuantity: 1,
        total: 84.99,
        lastReceivedPrice: 60.00
      },
      {
        id: "2",
        rank: 2,
        sku: "WIN-002",
        productName: "Snow Boots",
        name: "Waterproof Snow Boots",
        taxRate: 0.08,
        price: 79.99,
        unit: "pair",
        discountPercentage: 10,
        discountAmount: 8.00,
        minQuantity: 1,
        total: 71.99,
        lastReceivedPrice: 45.00
      }
    ]
  }
]; 