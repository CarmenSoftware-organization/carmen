export interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'warehouse' | 'office';
  address?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Available options for this user
  availableRoles: Role[];
  availableDepartments: Department[];
  availableLocations: Location[];
}

export interface UserContext {
  // Current active context
  currentRole: Role;
  currentDepartment: Department;
  currentLocation: Location;
}

export interface User extends UserProfile {
  // Current active selections
  role: string;
  department: string;
  location?: string;
  // Workflow stages this user can approve
  assignedWorkflowStages?: string[];
  context: UserContext;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserContext: (context: Partial<UserContext>) => void;
  isLoading: boolean;
}
