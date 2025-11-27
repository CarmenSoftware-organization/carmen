import { Role, RoleConfiguration } from "@/app/(main)/system-administration/workflow/role-assignment/types/approver"
import { mockRoles, mockUsers } from '@/lib/mock-data'

// Re-export centralized mock data
export const roles: Role[] = mockRoles
export const users = mockUsers

export const initialRoleConfiguration: RoleConfiguration = {
  name: "",
  description: "",
  widgetAccess: {
    myPR: false,
    myApproval: false,
    myOrder: false
  },
  visibilitySetting: "location"
}
