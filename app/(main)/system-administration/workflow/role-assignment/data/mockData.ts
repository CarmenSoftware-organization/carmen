import { Role, User, RoleConfiguration } from "../types/approver"


export const roles: Role[] = [
  {
    id: 1,
    name: "Requester",
    description: "Initiates purchase requests and monitors their progress through the workflow",
    userCount: 25
  },
  {
    id: 2,
    name: "Purchasing Staff",
    description: "Reviews and processes purchase requests, coordinates with vendors, and ensures compliance with purchasing policies",
    userCount: 8
  },
  {
    id: 3,
    name: "Department Head",
    description: "Reviews and approves department-level purchase requests, manages department budget allocation",
    userCount: 12
  },
  {
    id: 4,
    name: "Finance Manager",
    description: "Oversees financial aspects of purchase requests, ensures budget compliance, and manages financial approvals",
    userCount: 3
  },
  {
    id: 5,
    name: "General Manager",
    description: "Provides final approval for high-value purchases and strategic procurement decisions",
    userCount: 1
  }
]

export const users: User[] = [
  // Requesters
  {
    id: 1,
    name: "Sarah Chen",
    department: "Housekeeping",
    location: "Main Building"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    department: "Food & Beverage",
    location: "Restaurant"
  },
  {
    id: 3,
    name: "Lisa Thompson",
    department: "Front Office",
    location: "Lobby"
  },
  {
    id: 4,
    name: "Ahmed Hassan",
    department: "Engineering",
    location: "Maintenance"
  },
  // Purchasing Staff
  {
    id: 5,
    name: "Emily Wong",
    department: "Purchasing",
    location: "Admin Office"
  },
  {
    id: 6,
    name: "John Martinez",
    department: "Purchasing",
    location: "Admin Office"
  },
  // Department Heads
  {
    id: 7,
    name: "Maria Garcia",
    department: "Housekeeping",
    location: "Main Building"
  },
  {
    id: 8,
    name: "Thomas Anderson",
    department: "Food & Beverage",
    location: "Restaurant"
  },
  {
    id: 9,
    name: "William Chen",
    department: "Front Office",
    location: "Lobby"
  },
  {
    id: 10,
    name: "Robert Kim",
    department: "Engineering",
    location: "Maintenance"
  },
  // Finance Managers
  {
    id: 11,
    name: "David Kim",
    department: "Finance",
    location: "Admin Office"
  },
  {
    id: 12,
    name: "Jennifer Lee",
    department: "Finance",
    location: "Admin Office"
  },
  // General Manager
  {
    id: 13,
    name: "James Wilson",
    department: "Executive",
    location: "Executive Office"
  }
]

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
  
  