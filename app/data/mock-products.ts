export interface Product {
  id: string
  productCode: string
  name: string
  description: string
  localDescription: string
  categoryId: string
  categoryName: string
  subCategoryId: string
  subCategoryName: string
  itemGroupId: string
  itemGroupName: string
  primaryInventoryUnitId: string
  primaryUnitName: string
  size: string
  color: string
  barcode: string
  isActive: boolean
  basePrice: number
  currency: string
  taxType: string
  taxRate: number
  standardCost: number
  lastCost: number
  priceDeviationLimit: number
  quantityDeviationLimit: number
  minStockLevel: number
  maxStockLevel: number
  isForSale: boolean
  isIngredient: boolean
  weight: number
  shelfLife: number
  storageInstructions: string
  imagesUrl: string
  unitConversions: UnitConversion[]
  storeAssignments?: StoreAssignment[]
}

export interface UnitConversion {
  id: string
  unitId: string
  unitName: string
  conversionFactor: number
  fromUnit: string
  toUnit: string
  unitType: 'INVENTORY' | 'ORDER' | 'RECIPE'
}

export interface StoreAssignment {
  id: string
  storeId: string
  minimumQuantity: number
  maximumQuantity: number
}

export const productList: Product[] = [
  {
    id: 'PRD001',
    productCode: 'PRD-001',
    name: 'Organic Jasmine Rice',
    description: 'Premium quality organic jasmine rice sourced from certified organic farms. Known for its fragrant aroma and soft, sticky texture when cooked.',
    localDescription: 'ข้าวหอมะลิอินทรีย์',
    categoryId: 'CAT-001',
    categoryName: 'Rice & Grains',
    subCategoryId: 'SCAT-001',
    subCategoryName: 'Rice',
    itemGroupId: 'GRP-001',
    itemGroupName: 'Organic Products',
    primaryInventoryUnitId: 'UNIT-001',
    primaryUnitName: 'EACH',
    size: '1',
    color: 'White',
    barcode: '8851234567890',
    isActive: true,
    basePrice: 35.50,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 28.40,
    lastCost: 29.75,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 100,
    maxStockLevel: 1000,
    isForSale: true,
    isIngredient: true,
    weight: 1,
    shelfLife: 365,
    storageInstructions: 'Store in a cool, dry place away from direct sunlight',
    imagesUrl: '/images/products/jasmine-rice.jpg',
    unitConversions: [
      {
        id: 'CONV-001',
        unitId: 'UNIT-001',
        unitName: 'Kilogram',
        conversionFactor: 1,
        fromUnit: 'UNIT-001',
        toUnit: 'UNIT-001',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-002',
        unitId: 'UNIT-002',
        unitName: 'Bag (5kg)',
        conversionFactor: 5,
        fromUnit: 'UNIT-002',
        toUnit: 'UNIT-001',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-003',
        unitId: 'UNIT-003',
        unitName: 'Sack (25kg)',
        conversionFactor: 25,
        fromUnit: 'UNIT-003',
        toUnit: 'UNIT-001',
        unitType: 'ORDER'
      }
    ],
    storeAssignments: [
      {
        id: 'SA-001',
        storeId: 'STR-001',
        minimumQuantity: 100,
        maximumQuantity: 1000
      }
    ]
  },
  {
    id: 'PRD002',
    productCode: 'PRD-002',
    name: 'Palm Sugar',
    description: 'Traditional Thai palm sugar made from coconut palm sap. Natural sweetener with caramel notes.',
    localDescription: 'น้ำตาลมะพร้าว',
    categoryId: 'CAT-002',
    categoryName: 'Sweeteners',
    subCategoryId: 'SCAT-002',
    subCategoryName: 'Natural Sweeteners',
    itemGroupId: 'GRP-002',
    itemGroupName: 'Traditional Products',
    primaryInventoryUnitId: 'UNIT-004',
    primaryUnitName: 'KG',
    size: '500g',
    color: 'Brown',
    barcode: '8851234567891',
    isActive: true,
    basePrice: 85.00,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 65.00,
    lastCost: 68.50,
    priceDeviationLimit: 15,
    quantityDeviationLimit: 10,
    minStockLevel: 50,
    maxStockLevel: 500,
    isForSale: true,
    isIngredient: true,
    weight: 0.5,
    shelfLife: 180,
    storageInstructions: 'Keep in airtight container in cool, dry place',
    imagesUrl: '/images/products/palm-sugar.jpg',
    unitConversions: [
      {
        id: 'CONV-004',
        unitId: 'UNIT-004',
        unitName: 'Kilogram',
        conversionFactor: 1,
        fromUnit: 'UNIT-004',
        toUnit: 'UNIT-001',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-005',
        unitId: 'UNIT-005',
        unitName: 'Pack (500g)',
        conversionFactor: 0.5,
        fromUnit: 'UNIT-005',
        toUnit: 'UNIT-004',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-006',
        unitId: 'UNIT-006',
        unitName: 'Box (10kg)',
        conversionFactor: 10,
        fromUnit: 'UNIT-006',
        toUnit: 'UNIT-004',
        unitType: 'ORDER'
      }
    ]
  }
] 