import { StatusType } from "../components"

export interface LocationMapping {
  id: string
  posLocationId: string
  posLocationName: string
  posLocationCode?: string
  carmenLocationId: string
  carmenLocationName: string
  carmenLocationType: string
  isActive: boolean
  syncEnabled: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
  notes?: string
  // Keep legacy properties for backward compatibility
  locationCode?: string
  mappedName?: string
  posType?: string
  status?: StatusType
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
  createdAt?: Date
  updatedAt?: Date
}

export interface LocationMappingFormData {
  locationCode: string
  posLocationName: string
  mappedName: string
  posType: string
  status: StatusType
} 