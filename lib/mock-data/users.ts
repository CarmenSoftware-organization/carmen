/**
 * User Mock Data
 * 
 * Centralized mock data for users, roles, departments, and locations.
 */

import { User, Role, Department, Location } from '../types'

// ====== ROLES ======

export const mockRoles: Role[] = [
  { 
    id: 'staff', 
    name: 'Staff', 
    permissions: ['create_pr', 'view_pr', 'edit_own_pr', 'view_inventory'] 
  },
  { 
    id: 'department-manager', 
    name: 'Department Manager', 
    permissions: ['approve_pr', 'view_department_pr', 'manage_budget', 'view_department_reports'] 
  },
  { 
    id: 'financial-manager', 
    name: 'Financial Manager', 
    permissions: ['approve_pr', 'view_all_pr', 'manage_financials', 'view_financial_reports', 'manage_budgets'] 
  },
  { 
    id: 'purchasing-staff', 
    name: 'Purchasing Staff', 
    permissions: ['convert_to_po', 'manage_vendors', 'view_all_pr', 'create_po', 'manage_supplier_relationships'] 
  },
  { 
    id: 'counter', 
    name: 'Counter Staff', 
    permissions: ['process_orders', 'view_inventory', 'handle_sales', 'manage_pos'] 
  },
  { 
    id: 'chef', 
    name: 'Chef', 
    permissions: ['create_recipes', 'manage_kitchen', 'view_inventory', 'manage_menu', 'food_costing'] 
  },
  { 
    id: 'warehouse-manager', 
    name: 'Warehouse Manager', 
    permissions: ['manage_inventory', 'physical_counts', 'stock_adjustments', 'inventory_reports'] 
  },
  { 
    id: 'admin', 
    name: 'System Administrator', 
    permissions: ['full_access', 'user_management', 'system_configuration', 'data_backup'] 
  }
];

// ====== DEPARTMENTS ======

export const mockDepartments: Department[] = [
  { id: 'fb', name: 'Food & Beverage', code: 'F&B' },
  { id: 'housekeeping', name: 'Housekeeping', code: 'HK' },
  { id: 'administration', name: 'Administration', code: 'ADMIN' },
  { id: 'maintenance', name: 'Maintenance', code: 'MAINT' },
  { id: 'front-office', name: 'Front Office', code: 'FO' },
  { id: 'kitchen', name: 'Kitchen Operations', code: 'KITCHEN' },
  { id: 'procurement', name: 'Procurement', code: 'PROC' },
  { id: 'finance', name: 'Finance', code: 'FIN' },
  { id: 'hr', name: 'Human Resources', code: 'HR' },
  { id: 'security', name: 'Security', code: 'SEC' }
];

// ====== LOCATIONS ======

export const mockLocations: Location[] = [
  { 
    id: 'main-hotel', 
    name: 'Grand Hotel Main', 
    type: 'hotel', 
    address: '123 Main St, New York, NY 10001' 
  },
  { 
    id: 'main-kitchen', 
    name: 'Main Kitchen', 
    type: 'restaurant', 
    address: 'Ground Floor, Grand Hotel' 
  },
  { 
    id: 'central-warehouse', 
    name: 'Central Warehouse', 
    type: 'warehouse', 
    address: '456 Storage Ave, Queens, NY 11101' 
  },
  { 
    id: 'admin-office', 
    name: 'Administrative Office', 
    type: 'office', 
    address: '2nd Floor, Grand Hotel' 
  },
  { 
    id: 'pool-bar', 
    name: 'Pool Bar & Grill', 
    type: 'restaurant', 
    address: 'Pool Area, Grand Hotel' 
  },
  { 
    id: 'rooftop-restaurant', 
    name: 'Rooftop Fine Dining', 
    type: 'restaurant', 
    address: 'Rooftop Level, Grand Hotel' 
  },
  { 
    id: 'banquet-hall', 
    name: 'Grand Banquet Hall', 
    type: 'office', 
    address: '3rd Floor, Grand Hotel' 
  },
  { 
    id: 'dry-store', 
    name: 'Dry Storage', 
    type: 'warehouse', 
    address: 'Basement Level 1, Grand Hotel' 
  },
  { 
    id: 'cold-storage', 
    name: 'Cold Storage Room', 
    type: 'warehouse', 
    address: 'Basement Level 1, Grand Hotel' 
  },
  { 
    id: 'receiving-dock', 
    name: 'Receiving Dock', 
    type: 'warehouse', 
    address: 'Loading Bay, Grand Hotel' 
  }
];

// ====== USERS ======

export const mockUsers: User[] = [
  {
    id: 'user-chef-001',
    name: 'Chef Maria Rodriguez',
    email: 'maria.rodriguez@grandhotel.com',
    avatar: '/avatars/maria-rodriguez.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Chef',
    department: 'Food & Beverage',
    location: 'Main Kitchen',
    assignedWorkflowStages: ['departmentHeadApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'chef')!,
      currentDepartment: mockDepartments.find(d => d.id === 'fb')!,
      currentLocation: mockLocations.find(l => l.id === 'main-kitchen')!,
      showPrices: true,
    },
    createdAt: new Date('2023-01-15'),
    createdBy: 'system',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-manager-001',
    name: 'John Smith',
    email: 'john.smith@grandhotel.com',
    avatar: '/avatars/john-smith.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Department Manager',
    department: 'Food & Beverage',
    location: 'Grand Hotel Main',
    assignedWorkflowStages: ['departmentHeadApproval', 'financeManagerApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'department-manager')!,
      currentDepartment: mockDepartments.find(d => d.id === 'fb')!,
      currentLocation: mockLocations.find(l => l.id === 'main-hotel')!,
      showPrices: true,
    },
    createdAt: new Date('2022-06-01'),
    createdBy: 'system',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-purchasing-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@grandhotel.com',
    avatar: '/avatars/sarah-johnson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Purchasing Staff',
    department: 'Procurement',
    location: 'Administrative Office',
    assignedWorkflowStages: ['purchaseReview'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'purchasing-staff')!,
      currentDepartment: mockDepartments.find(d => d.id === 'procurement')!,
      currentLocation: mockLocations.find(l => l.id === 'admin-office')!,
      showPrices: true,
    },
    createdAt: new Date('2023-03-10'),
    createdBy: 'admin',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-finance-001',
    name: 'Michael Chen',
    email: 'michael.chen@grandhotel.com',
    avatar: '/avatars/michael-chen.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Financial Manager',
    department: 'Finance',
    location: 'Administrative Office',
    assignedWorkflowStages: ['financeManagerApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'financial-manager')!,
      currentDepartment: mockDepartments.find(d => d.id === 'finance')!,
      currentLocation: mockLocations.find(l => l.id === 'admin-office')!,
      showPrices: true,
    },
    createdAt: new Date('2022-01-20'),
    createdBy: 'system',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-warehouse-001',
    name: 'David Wilson',
    email: 'david.wilson@grandhotel.com',
    avatar: '/avatars/david-wilson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Warehouse Manager',
    department: 'Procurement',
    location: 'Central Warehouse',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'warehouse-manager')!,
      currentDepartment: mockDepartments.find(d => d.id === 'procurement')!,
      currentLocation: mockLocations.find(l => l.id === 'central-warehouse')!,
      showPrices: true,
    },
    createdAt: new Date('2023-07-05'),
    createdBy: 'admin',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-staff-001',
    name: 'Emily Brown',
    email: 'emily.brown@grandhotel.com',
    avatar: '/avatars/emily-brown.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Staff',
    department: 'Housekeeping',
    location: 'Grand Hotel Main',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'staff')!,
      currentDepartment: mockDepartments.find(d => d.id === 'housekeeping')!,
      currentLocation: mockLocations.find(l => l.id === 'main-hotel')!,
      showPrices: false,
    },
    createdAt: new Date('2023-09-12'),
    createdBy: 'admin',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-counter-001',
    name: 'James Anderson',
    email: 'james.anderson@grandhotel.com',
    avatar: '/avatars/james-anderson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'Counter Staff',
    department: 'Food & Beverage',
    location: 'Pool Bar & Grill',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'counter')!,
      currentDepartment: mockDepartments.find(d => d.id === 'fb')!,
      currentLocation: mockLocations.find(l => l.id === 'pool-bar')!,
      showPrices: false,
    },
    createdAt: new Date('2024-02-14'),
    createdBy: 'admin',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  },
  {
    id: 'user-admin-001',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@grandhotel.com',
    avatar: '/avatars/lisa-thompson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    role: 'System Administrator',
    department: 'Administration',
    location: 'Administrative Office',
    assignedWorkflowStages: ['gmApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'admin')!,
      currentDepartment: mockDepartments.find(d => d.id === 'administration')!,
      currentLocation: mockLocations.find(l => l.id === 'admin-office')!,
      showPrices: true,
    },
    createdAt: new Date('2021-12-01'),
    createdBy: 'system',
    updatedAt: new Date('2024-08-20'),
    updatedBy: 'admin'
  }
];

// ====== UTILITY FUNCTIONS ======

/**
 * Get user by ID
 */
export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

/**
 * Get users by role
 */
export const getMockUsersByRole = (roleId: string): User[] => {
  return mockUsers.filter(user => user.context.currentRole.id === roleId);
};

/**
 * Get users by department
 */
export const getMockUsersByDepartment = (departmentId: string): User[] => {
  return mockUsers.filter(user => user.context.currentDepartment.id === departmentId);
};

/**
 * Get role by ID
 */
export const getMockRoleById = (id: string): Role | undefined => {
  return mockRoles.find(role => role.id === id);
};

/**
 * Get department by ID
 */
export const getMockDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find(dept => dept.id === id);
};

/**
 * Get location by ID
 */
export const getMockLocationById = (id: string): Location | undefined => {
  return mockLocations.find(location => location.id === id);
};

/**
 * Get locations by department (legacy compatibility)
 */
export const getLocationsByDepartment = (department: string): Location[] => {
  // For now, return all locations since we don't have department filtering implemented
  return mockLocations;
};