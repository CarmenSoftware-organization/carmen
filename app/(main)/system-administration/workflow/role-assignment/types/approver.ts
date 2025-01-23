export interface Role {
  id: number
  name: string
  description: string
  userCount: number
}

export interface User {
  id: number
  name: string
  department: string
  location: string
}

export interface RoleConfiguration {
  name: string
  description: string
  widgetAccess: {
    myPR: boolean
    myApproval: boolean
    myOrder: boolean
  }
  visibilitySetting: 'location' | 'department' | 'full'
}

export interface AssignedUser extends User {
  roleId: number
  assignedDate: string
}
