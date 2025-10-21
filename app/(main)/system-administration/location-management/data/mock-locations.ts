// <COMMENT> Mock data for locations

export interface Location {
  id: string
  code: string
  name: string
  type: 'Direct' | 'Inventory' | 'Consignment'
  eop: string
  deliveryPoint: string
  isActive: boolean
  assignedUsers?: string[] // Array of user IDs assigned to this location
}

export const mockLocations: Location[] = [
  {
    id: '1',
    code: 'NYC001',
    name: 'New York Central Kitchen',
    type: 'Inventory',
    eop: 'true',
    deliveryPoint: 'Loading Dock A',
    isActive: true,
    assignedUsers: ['user-manager-001', 'user-staff-001', 'user-staff-002'],
  },
  {
    id: '2',
    code: 'LA002',
    name: 'Los Angeles Distribution',
    type: 'Direct',
    eop: 'false',
    deliveryPoint: 'Warehouse Gate 3',
    isActive: true,
    assignedUsers: ['user-manager-002', 'user-staff-003'],
  },
  {
    id: '3',
    code: 'CHI003',
    name: 'Chicago Processing Plant',
    type: 'Consignment',
    eop: 'true',
    deliveryPoint: 'Receiving Bay 2',
    isActive: false,
    assignedUsers: ['user-staff-004', 'user-staff-005'],
  },
  {
    id: '4',
    code: 'MIA004',
    name: 'Miami Seafood Center',
    type: 'Inventory',
    eop: 'false',
    deliveryPoint: 'Cold Storage Entry',
    isActive: true,
    assignedUsers: ['user-manager-003', 'user-staff-006', 'user-staff-007'],
  },
  {
    id: '5',
    code: 'SEA005',
    name: 'Seattle Fresh Market',
    type: 'Direct',
    eop: 'true',
    deliveryPoint: 'Market Loading Zone',
    isActive: true,
    assignedUsers: ['user-staff-008'],
  },
] 