
export interface SpotCheckDetails {
  countId: string
  counter: string
  department: string
  store: string
  date: Date
  selectedItems: Array<{
    id: string
    code: string
    name: string
    description: string
    expectedQuantity: number
    unit: string
  }>
}

export interface SpotCheckData {
  id: string;
  name: string;
  date: Date;
  status: 'active' | 'completed' | 'cancelled';
  items: number;
  locations: number;
  createdBy: string;
  completedItems?: number;
}

export interface CountItem {
  id: string;
  name: string;
  description: string;
  expectedCount: number;
  actualCount?: number;
  department: string;
  code: string;
  category: string;
  currentStock: number;
} 