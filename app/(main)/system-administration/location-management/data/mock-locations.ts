// <COMMENT> Mock data for locations

export interface Location {
  id: string
  code: string
  name: string
  type: 'Direct' | 'Inventory' | 'Consignment'
  eop: 'Default Zero' | 'Enter Counted Stock' | 'Default System'
  deliveryPoint: string
  department: string
  isActive: boolean
}

export const mockLocations: Location[] = [
  {
    id: '1',
    code: 'AGS',
    name: 'A&G - Security',
    type: 'Direct',
    eop: 'Default Zero',
    deliveryPoint: 'Default',
    department: 'Engineering',
    isActive: true,
  },
  {
    id: '2',
    code: 'INV1',
    name: 'Main Warehouse',
    type: 'Inventory',
    eop: 'Enter Counted Stock',
    deliveryPoint: 'Dock 1',
    department: 'Warehouse',
    isActive: true,
  },
  {
    id: '3',
    code: 'INV2',
    name: 'Overflow Storage',
    type: 'Inventory',
    eop: 'Default System',
    deliveryPoint: 'Dock 2',
    department: 'Warehouse',
    isActive: false,
  },
  {
    id: '4',
    code: 'CON3',
    name: 'Supplier Items',
    type: 'Consignment',
    eop: 'Default System',
    deliveryPoint: 'Zone B',
    department: 'Procurement',
    isActive: false,
  },
  {
    id: '5',
    code: 'CON4',
    name: 'Consignment Counted',
    type: 'Consignment',
    eop: 'Enter Counted Stock',
    deliveryPoint: 'Zone C',
    department: 'Procurement',
    isActive: true,
  },
] 