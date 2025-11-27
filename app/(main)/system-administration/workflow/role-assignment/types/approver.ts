// Import centralized types
import { User as BaseUser, Role as BaseRole } from '@/lib/types'

// Re-export centralized types
export type Role = BaseRole
export type User = BaseUser

export interface RoleConfiguration {
  name: string
  description?: string
  widgetAccess: {
    myPR: boolean
    myApproval: boolean
    myOrder: boolean
  }
  visibilitySetting: 'location' | 'department' | 'full'
}

export interface AssignedUser extends User {
  roleId: string
  assignedDate: string
}
