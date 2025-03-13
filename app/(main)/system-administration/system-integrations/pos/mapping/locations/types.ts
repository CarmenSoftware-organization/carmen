import { StatusType } from "../components"

export interface LocationMapping {
  id: string
  locationCode: string
  posLocationName: string
  mappedName: string
  posType: string
  status: StatusType
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
  createdAt: Date
  updatedAt: Date
}

export interface LocationMappingFormData {
  locationCode: string
  posLocationName: string
  mappedName: string
  posType: string
  status: StatusType
} 