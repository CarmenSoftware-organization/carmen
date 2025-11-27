/**
 * Legacy Simple Mock Data
 * 
 * This file contains simplified mock data structures used in older components.
 * It is maintained for backward compatibility while migrating to the new centralized mock data system.
 */

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

// Re-export from inventory for compatibility
export { storeLocations, itemsToCount } from './inventory';

