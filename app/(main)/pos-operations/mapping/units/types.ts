import { StatusType } from "../components"


export type UnitType = "recipe" | "sales" | "both"

export interface UnitMapping {
  id: string
  unitCode: string
  unitName: string
  unitType: UnitType
  baseUnit: string
  conversionRate: number
  status: StatusType
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UnitMappingFormData {
  unitCode: string
  unitName: string
  unitType: UnitType
  baseUnit: string
  conversionRate: number
  status: StatusType
} 