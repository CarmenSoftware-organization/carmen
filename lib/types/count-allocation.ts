import { HotelProduct } from "../mock/hotel-data";


export interface CountAllocation {
  id: string;
  productId: string;
  expectedQuantity: number;
  countedQuantity?: number;
  status: "pending" | "in_progress" | "completed" | "discrepancy";
  assignedTo?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  variance?: number;
  variancePercentage?: number;
}

export interface CountSession {
  id: string;
  countDate: Date;
  startTime: string;
  reason: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
  counterName: string;
  department: string;
  countType: "full" | "partial" | "spot";
  allocations: CountAllocation[];
  totalItems: number;
  completedItems: number;
  discrepancyItems: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationGroup {
  locationCode: string;
  locationName: string;
  items: (HotelProduct & { allocation: CountAllocation })[];
}
