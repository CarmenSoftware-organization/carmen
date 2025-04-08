
export type LocationType = 'storage' | 'kitchen' | 'restaurant' | 'bar' | 'maintenance' | 'housekeeping' | 'all';

export interface HotelLocation {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  floor: number;
  building?: string;
  status: 'active' | 'inactive' | 'maintenance';
  capacity?: number;
  responsibleDepartment: string;
  itemCount: number;
  lastCount?: string;
}

export interface HotelProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  brand?: string;
  uom: string;
  packSize: number;
  par?: number;
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
  price?: number;
  supplier?: string;
  location?: string;
  lastCountDate?: string;
  currentStock?: number;
}
