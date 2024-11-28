export interface CountItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  expectedQuantity: number;
  unit: string;
}

export const departments = [
  { id: '1', name: 'F&B' },
  { id: '2', name: 'Housekeeping' },
  { id: '3', name: 'Maintenance' },
  { id: '4', name: 'Front Office' },
  { id: '5', name: 'Security' },
];

export const users = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Emily Brown' },
  { id: '5', name: 'David Wilson' },
];

export const storeLocations = [
  { id: '1', name: 'Main Kitchen Store' },
  { id: '2', name: 'Dry Store' },
  { id: '3', name: 'Cold Room' },
  { id: '4', name: 'Linen Room' },
  { id: '5', name: 'Equipment Store' },
];

export const itemsToCount: CountItem[] = [
  {
    id: "1",
    name: "Basmati Rice",
    sku: "GR-BSM-001",
    description: "Premium Long Grain Basmati Rice - 25kg bag",
    expectedQuantity: 50,
    unit: "bags"
  },
  {
    id: "2",
    name: "Olive Oil Extra Virgin",
    sku: "OIL-EV-002",
    description: "Extra Virgin Olive Oil - 5L container",
    expectedQuantity: 30,
    unit: "bottles"
  },
  {
    id: "3",
    name: "Black Pepper Ground",
    sku: "SP-BP-003",
    description: "Ground Black Pepper - 1kg pack",
    expectedQuantity: 25,
    unit: "packs"
  },
  {
    id: "4",
    name: "Chicken Stock Powder",
    sku: "ST-CH-004",
    description: "Professional Kitchen Chicken Stock Powder - 2.5kg tin",
    expectedQuantity: 15,
    unit: "tins"
  },
  {
    id: "5",
    name: "Pasta Penne",
    sku: "PA-PEN-005",
    description: "Durum Wheat Penne Pasta - 5kg bag",
    expectedQuantity: 40,
    unit: "bags"
  },
  {
    id: "6",
    name: "Tomato Paste",
    sku: "SC-TP-006",
    description: "Double Concentrated Tomato Paste - 3kg tin",
    expectedQuantity: 35,
    unit: "tins"
  },
  {
    id: "7",
    name: "Garlic Powder",
    sku: "SP-GP-007",
    description: "Pure Garlic Powder - 500g container",
    expectedQuantity: 20,
    unit: "containers"
  },
  {
    id: "8",
    name: "Vegetable Oil",
    sku: "OIL-VG-008",
    description: "Refined Vegetable Oil - 20L container",
    expectedQuantity: 25,
    unit: "containers"
  },
  {
    id: "9",
    name: "Table Salt",
    sku: "SP-ST-009",
    description: "Fine Table Salt - 2kg pack",
    expectedQuantity: 45,
    unit: "packs"
  },
  {
    id: "10",
    name: "Sugar White",
    sku: "SG-WH-010",
    description: "Fine White Sugar - 10kg bag",
    expectedQuantity: 30,
    unit: "bags"
  }
];

