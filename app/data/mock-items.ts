import { MappingItem, RecipeComponent } from "@/app/(main)/pos-operations/mapping/store/mapping-store";

// More realistic mock data

// --- Mapped Items ---
export const mockMappedItems: MappingItem[] = [
  {
    id: 'pos-item-1',
    name: 'Classic Burger',
    sku: 'POS-BRG-001',
    lastSale: '2024-04-07T12:35:00Z',
    saleFrequency: 'High',
    status: 'mapped',
    lastUpdated: '2024-04-01T10:00:00Z',
    components: [
      { id: 'inv-bun-01', name: 'Brioche Bun', sku: 'BUN001', unit: 'piece', quantity: 1, costPerUnit: 0.50 },
      { id: 'inv-pat-01', name: 'Beef Patty (150g)', sku: 'PAT001', unit: 'g', quantity: 150, costPerUnit: 0.02 }, // $0.02/gram = $3.00 per patty
      { id: 'inv-let-01', name: 'Lettuce Shredded', sku: 'LET001', unit: 'g', quantity: 30, costPerUnit: 0.005 },
      { id: 'inv-tom-01', name: 'Tomato Slice', sku: 'TOM001', unit: 'g', quantity: 40, costPerUnit: 0.006 },
      { id: 'inv-oni-01', name: 'Onion Red Sliced', sku: 'ONI001', unit: 'g', quantity: 20, costPerUnit: 0.004 },
      { id: 'inv-chs-01', name: 'Cheddar Slice', sku: 'CHS001', unit: 'slice', quantity: 1, costPerUnit: 0.30 },
      { id: 'inv-sau-01', name: 'Burger Sauce', sku: 'SAU001', unit: 'ml', quantity: 15, costPerUnit: 0.01 },
    ],
  },
  {
    id: 'pos-item-2',
    name: 'Fries (Side)',
    sku: 'POS-FRY-001',
    lastSale: '2024-04-07T12:36:00Z',
    saleFrequency: 'High',
    status: 'mapped',
    lastUpdated: '2024-03-25T09:00:00Z',
    components: [
      { id: 'inv-pot-01', name: 'Potato Frozen Fries', sku: 'POT001', unit: 'g', quantity: 150, costPerUnit: 0.003 },
      { id: 'inv-oil-01', name: 'Frying Oil', sku: 'OIL001', unit: 'ml', quantity: 10, costPerUnit: 0.002 }, // Represents oil absorption/loss
      { id: 'inv-sal-01', name: 'Salt Fine Grain', sku: 'SAL001', unit: 'g', quantity: 2, costPerUnit: 0.001 },
    ],
  },
   {
    id: 'pos-item-3',
    name: 'Caesar Salad',
    sku: 'POS-SAL-001',
    lastSale: '2024-04-06T14:10:00Z',
    saleFrequency: 'Medium',
    status: 'mapped',
    lastUpdated: '2024-04-02T11:00:00Z',
    components: [
      { id: 'inv-rom-01', name: 'Romaine Lettuce', sku: 'ROM001', unit: 'g', quantity: 100, costPerUnit: 0.006 },
      { id: 'inv-cro-01', name: 'Croutons Garlic', sku: 'CRO001', unit: 'g', quantity: 30, costPerUnit: 0.01 },
      { id: 'inv-par-01', name: 'Parmesan Shaved', sku: 'PAR001', unit: 'g', quantity: 20, costPerUnit: 0.03 },
      { id: 'inv-dre-01', name: 'Caesar Dressing', sku: 'DRE001', unit: 'ml', quantity: 40, costPerUnit: 0.015 },
    ],
  },
  {
    id: 'pos-item-5',
    name: 'Cola Drink (330ml)',
    sku: 'POS-DRK-001',
    lastSale: '2024-04-07T11:00:00Z',
    saleFrequency: 'High',
    status: 'mapped',
    lastUpdated: '2024-03-10T10:00:00Z',
    components: [
        { id: 'inv-syr-01', name: 'Cola Syrup', sku: 'SYR001', unit: 'ml', quantity: 50, costPerUnit: 0.008 },
        { id: 'inv-co2-01', name: 'Carbonated Water', sku: 'CO2001', unit: 'ml', quantity: 280, costPerUnit: 0.001 }, // Includes water + CO2 cost
    ],
  },
];

// --- Unmapped Items ---
export const mockUnmappedItems: MappingItem[] = [
  {
    id: 'pos-item-4',
    name: 'Chicken Caesar Wrap',
    sku: 'POS-WRP-001',
    lastSale: '2024-04-07T13:05:00Z',
    saleFrequency: 'Medium',
    status: 'unmapped',
  },
  {
    id: 'pos-item-6',
    name: 'Espresso Single',
    sku: 'POS-ESP-001',
    lastSale: '2024-04-07T08:15:00Z',
    saleFrequency: 'High',
    status: 'unmapped',
  },
  {
    id: 'pos-item-7',
    name: 'Onion Rings',
    sku: 'POS-ONG-001',
    lastSale: '2024-04-06T18:00:00Z',
    saleFrequency: 'Low',
    status: 'unmapped',
  },
  {
    id: 'pos-item-8',
    name: 'Side Salad',
    sku: 'POS-SAL-002',
    lastSale: '2024-04-06T19:30:00Z',
    saleFrequency: 'Medium',
    status: 'unmapped',
  },
  {
    id: 'pos-item-9',
    name: 'Bottled Water (500ml)',
    sku: 'POS-WAT-001',
    lastSale: '2024-04-07T10:20:00Z',
    saleFrequency: 'High',
    status: 'unmapped',
  },
   {
    id: 'pos-item-10',
    name: 'Chocolate Chip Cookie',
    sku: 'POS-CKI-001',
    lastSale: '2024-04-07T15:00:00Z',
    saleFrequency: 'Medium',
    status: 'unmapped',
  },
]; 