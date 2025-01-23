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