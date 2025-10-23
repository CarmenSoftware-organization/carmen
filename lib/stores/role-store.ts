// Role Store for managing role data across components
// This provides a simple state management solution for roles

import React from 'react';
import { Role } from '@/lib/types';
import { mockRoles as initialMockRoles } from '@/lib/mock-data/permission-roles';

// In-memory store for role data (in a real app, this would be managed by Zustand/Redux/etc.)
let rolesStore: Role[] = [...initialMockRoles];

// Event emitter for role changes
type RoleChangeListener = (roles: Role[]) => void;
let listeners: Set<RoleChangeListener> = new Set();

export const roleStore = {
  // Get all roles
  getRoles: (): Role[] => {
    return [...rolesStore];
  },

  // Add a new role
  addRole: (role: Omit<Role, 'id'>): Role => {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
    };
    rolesStore.push(newRole);
    notifyListeners();
    return newRole;
  },

  // Update an existing role
  updateRole: (roleId: string, updates: Partial<Omit<Role, 'id'>>): Role | null => {
    const index = rolesStore.findIndex(r => r.id === roleId);
    if (index === -1) return null;
    
    rolesStore[index] = { ...rolesStore[index], ...updates };
    notifyListeners();
    return rolesStore[index];
  },

  // Delete a role
  deleteRole: (roleId: string): boolean => {
    const index = rolesStore.findIndex(r => r.id === roleId);
    if (index === -1) return false;
    
    rolesStore.splice(index, 1);
    notifyListeners();
    return true;
  },

  // Get a specific role
  getRole: (roleId: string): Role | undefined => {
    return rolesStore.find(r => r.id === roleId);
  },

  // Subscribe to role changes
  subscribe: (listener: RoleChangeListener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Reset roles to initial state (for testing/demo purposes)
  reset: (): void => {
    rolesStore = [...initialMockRoles];
    notifyListeners();
  }
};

// Notify all listeners of role changes
function notifyListeners() {
  const roles = [...rolesStore];
  listeners.forEach(listener => listener(roles));
}

// Hook for React components to use the role store
export function useRoleStore() {
  const [roles, setRoles] = React.useState<Role[]>(() => roleStore.getRoles());

  React.useEffect(() => {
    const unsubscribe = roleStore.subscribe((updatedRoles) => {
      setRoles(updatedRoles);
    });

    return unsubscribe;
  }, []);

  return {
    roles,
    addRole: roleStore.addRole,
    updateRole: roleStore.updateRole,
    deleteRole: roleStore.deleteRole,
    getRole: roleStore.getRole,
    getAllRoles: () => roles, // Provide access to current roles
    reset: roleStore.reset
  };
}