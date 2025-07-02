'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserContextType, Role, Department, Location, UserContext } from '../types/user';

// Mock data for available options
const mockRoles: Role[] = [
  { id: 'requestor', name: 'Requestor', permissions: ['create_pr', 'view_pr', 'edit_own_pr'] },
  { id: 'department-manager', name: 'Department Manager', permissions: ['approve_pr', 'view_department_pr', 'manage_budget'] },
  { id: 'purchasing-staff', name: 'Purchasing Staff', permissions: ['convert_to_po', 'manage_vendors', 'view_all_pr'] },
  { id: 'counter', name: 'Counter Staff', permissions: ['process_orders', 'view_inventory'] },
  { id: 'chef', name: 'Chef', permissions: ['create_recipes', 'manage_kitchen', 'view_inventory'] },
];

const mockDepartments: Department[] = [
  { id: 'fb', name: 'Food & Beverage', code: 'F&B' },
  { id: 'housekeeping', name: 'Housekeeping', code: 'HK' },
  { id: 'administration', name: 'Administration', code: 'ADMIN' },
  { id: 'maintenance', name: 'Maintenance', code: 'MAINT' },
  { id: 'front-office', name: 'Front Office', code: 'FO' },
];

const mockLocations: Location[] = [
  { id: 'main-hotel', name: 'Grand Hotel Main', type: 'hotel', address: '123 Main St, New York' },
  { id: 'main-kitchen', name: 'Main Kitchen', type: 'restaurant', address: 'Ground Floor, Grand Hotel' },
  { id: 'central-warehouse', name: 'Central Warehouse', type: 'warehouse', address: '456 Storage Ave, Queens' },
  { id: 'admin-office', name: 'Administrative Office', type: 'office', address: '2nd Floor, Grand Hotel' },
  { id: 'pool-bar', name: 'Pool Bar & Grill', type: 'restaurant', address: 'Pool Area, Grand Hotel' },
];

// Mock user data - replace with actual API call
const createMockUser = (): User => {
  const defaultRole = mockRoles[0];
  const defaultDepartment = mockDepartments[0];
  const defaultLocation = mockLocations[0];

  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/avatars/default.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Current active selections
    role: defaultRole.name,
    department: defaultDepartment.name,
    location: defaultLocation.name,
    context: {
      currentRole: defaultRole,
      currentDepartment: defaultDepartment,
      currentLocation: defaultLocation,
    }
  };
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserContext = (contextUpdates: Partial<UserContext>) => {
    if (!user) return;

    const updatedUser = { ...user };

    // Update role if provided
    if (contextUpdates.currentRole) {
      updatedUser.context.currentRole = contextUpdates.currentRole;
      updatedUser.role = contextUpdates.currentRole.name;
    }

    // Update department if provided
    if (contextUpdates.currentDepartment) {
      updatedUser.context.currentDepartment = contextUpdates.currentDepartment;
      updatedUser.department = contextUpdates.currentDepartment.name;
    }

    // Update location if provided
    if (contextUpdates.currentLocation) {
      updatedUser.context.currentLocation = contextUpdates.currentLocation;
      updatedUser.location = contextUpdates.currentLocation.name;
    }

    setUser(updatedUser);
    
    // Here you would typically also save to localStorage or send to API
    console.log('User context updated:', updatedUser.context);
  };

  useEffect(() => {
    // Simulate API call to get user
    const loadUser = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(createMockUser());
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUserContext, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
