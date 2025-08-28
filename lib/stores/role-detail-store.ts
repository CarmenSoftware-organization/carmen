import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RoleDetailState {
  // Permission view settings
  permissionViewMode: 'grouped' | 'flat';
  permissionSearchTerm: string;
  expandedGroups: Record<string, boolean>;
  
  // User assignment state
  selectedAssignedUsers: string[];
  selectedAvailableUsers: string[];
  assignedUserSearchTerm: string;
  availableUserSearchTerm: string;
  
  // Policy assignment state
  selectedAssignedPolicies: string[];
  selectedAvailablePolicies: string[];
  assignedPolicySearchTerm: string;
  availablePolicySearchTerm: string;
  assignedPolicyTypeFilter: string;
  availablePolicyTypeFilter: string;
  
  // UI state
  isProcessingUsers: boolean;
  isProcessingPolicies: boolean;
  activeTab: 'permissions' | 'users' | 'policies';
  
  // Actions
  setPermissionViewMode: (mode: 'grouped' | 'flat') => void;
  setPermissionSearchTerm: (term: string) => void;
  toggleGroupExpansion: (groupName: string) => void;
  
  setSelectedAssignedUsers: (users: string[]) => void;
  setSelectedAvailableUsers: (users: string[]) => void;
  setAssignedUserSearchTerm: (term: string) => void;
  setAvailableUserSearchTerm: (term: string) => void;
  
  setSelectedAssignedPolicies: (policies: string[]) => void;
  setSelectedAvailablePolicies: (policies: string[]) => void;
  setAssignedPolicySearchTerm: (term: string) => void;
  setAvailablePolicySearchTerm: (term: string) => void;
  setAssignedPolicyTypeFilter: (filter: string) => void;
  setAvailablePolicyTypeFilter: (filter: string) => void;
  
  setIsProcessingUsers: (processing: boolean) => void;
  setIsProcessingPolicies: (processing: boolean) => void;
  setActiveTab: (tab: 'permissions' | 'users' | 'policies') => void;
  
  // Bulk operations
  addUsersToRole: (userIds: string[], roleId: string) => Promise<boolean>;
  removeUsersFromRole: (userIds: string[], roleId: string) => Promise<boolean>;
  addPoliciesToRole: (policyIds: string[], roleId: string) => Promise<boolean>;
  removePoliciesFromRole: (policyIds: string[], roleId: string) => Promise<boolean>;
  
  // Reset functions
  resetUserSelections: () => void;
  resetPolicySelections: () => void;
  resetAllState: () => void;
}

export const useRoleDetailStore = create<RoleDetailState>()(
  devtools(
    (set, get) => ({
      // Initial state
      permissionViewMode: 'grouped',
      permissionSearchTerm: '',
      expandedGroups: {},
      
      selectedAssignedUsers: [],
      selectedAvailableUsers: [],
      assignedUserSearchTerm: '',
      availableUserSearchTerm: '',
      
      selectedAssignedPolicies: [],
      selectedAvailablePolicies: [],
      assignedPolicySearchTerm: '',
      availablePolicySearchTerm: '',
      assignedPolicyTypeFilter: 'all',
      availablePolicyTypeFilter: 'all',
      
      isProcessingUsers: false,
      isProcessingPolicies: false,
      activeTab: 'permissions',
      
      // Permission actions
      setPermissionViewMode: (mode) =>
        set({ permissionViewMode: mode }, false, 'setPermissionViewMode'),
      
      setPermissionSearchTerm: (term) =>
        set({ permissionSearchTerm: term }, false, 'setPermissionSearchTerm'),
      
      toggleGroupExpansion: (groupName) =>
        set(
          (state) => ({
            expandedGroups: {
              ...state.expandedGroups,
              [groupName]: !state.expandedGroups[groupName]
            }
          }),
          false,
          'toggleGroupExpansion'
        ),
      
      // User assignment actions
      setSelectedAssignedUsers: (users) =>
        set({ selectedAssignedUsers: users }, false, 'setSelectedAssignedUsers'),
      
      setSelectedAvailableUsers: (users) =>
        set({ selectedAvailableUsers: users }, false, 'setSelectedAvailableUsers'),
      
      setAssignedUserSearchTerm: (term) =>
        set({ assignedUserSearchTerm: term }, false, 'setAssignedUserSearchTerm'),
      
      setAvailableUserSearchTerm: (term) =>
        set({ availableUserSearchTerm: term }, false, 'setAvailableUserSearchTerm'),
      
      // Policy assignment actions
      setSelectedAssignedPolicies: (policies) =>
        set({ selectedAssignedPolicies: policies }, false, 'setSelectedAssignedPolicies'),
      
      setSelectedAvailablePolicies: (policies) =>
        set({ selectedAvailablePolicies: policies }, false, 'setSelectedAvailablePolicies'),
      
      setAssignedPolicySearchTerm: (term) =>
        set({ assignedPolicySearchTerm: term }, false, 'setAssignedPolicySearchTerm'),
      
      setAvailablePolicySearchTerm: (term) =>
        set({ availablePolicySearchTerm: term }, false, 'setAvailablePolicySearchTerm'),
      
      setAssignedPolicyTypeFilter: (filter) =>
        set({ assignedPolicyTypeFilter: filter }, false, 'setAssignedPolicyTypeFilter'),
      
      setAvailablePolicyTypeFilter: (filter) =>
        set({ availablePolicyTypeFilter: filter }, false, 'setAvailablePolicyTypeFilter'),
      
      // UI state actions
      setIsProcessingUsers: (processing) =>
        set({ isProcessingUsers: processing }, false, 'setIsProcessingUsers'),
      
      setIsProcessingPolicies: (processing) =>
        set({ isProcessingPolicies: processing }, false, 'setIsProcessingPolicies'),
      
      setActiveTab: (tab) =>
        set({ activeTab: tab }, false, 'setActiveTab'),
      
      // Bulk operations
      addUsersToRole: async (userIds, roleId) => {
        set({ isProcessingUsers: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // In a real app, this would make an API call
          console.log('Adding users to role:', { userIds, roleId });
          
          // Reset selections on success
          set({ 
            selectedAvailableUsers: [],
            isProcessingUsers: false 
          });
          
          return true;
        } catch (error) {
          console.error('Failed to add users to role:', error);
          set({ isProcessingUsers: false });
          return false;
        }
      },
      
      removeUsersFromRole: async (userIds, roleId) => {
        set({ isProcessingUsers: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // In a real app, this would make an API call
          console.log('Removing users from role:', { userIds, roleId });
          
          // Reset selections on success
          set({ 
            selectedAssignedUsers: [],
            isProcessingUsers: false 
          });
          
          return true;
        } catch (error) {
          console.error('Failed to remove users from role:', error);
          set({ isProcessingUsers: false });
          return false;
        }
      },
      
      addPoliciesToRole: async (policyIds, roleId) => {
        set({ isProcessingPolicies: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // In a real app, this would make an API call
          console.log('Adding policies to role:', { policyIds, roleId });
          
          // Reset selections on success
          set({ 
            selectedAvailablePolicies: [],
            isProcessingPolicies: false 
          });
          
          return true;
        } catch (error) {
          console.error('Failed to add policies to role:', error);
          set({ isProcessingPolicies: false });
          return false;
        }
      },
      
      removePoliciesFromRole: async (policyIds, roleId) => {
        set({ isProcessingPolicies: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // In a real app, this would make an API call
          console.log('Removing policies from role:', { policyIds, roleId });
          
          // Reset selections on success
          set({ 
            selectedAssignedPolicies: [],
            isProcessingPolicies: false 
          });
          
          return true;
        } catch (error) {
          console.error('Failed to remove policies from role:', error);
          set({ isProcessingPolicies: false });
          return false;
        }
      },
      
      // Reset functions
      resetUserSelections: () =>
        set({
          selectedAssignedUsers: [],
          selectedAvailableUsers: [],
          assignedUserSearchTerm: '',
          availableUserSearchTerm: ''
        }, false, 'resetUserSelections'),
      
      resetPolicySelections: () =>
        set({
          selectedAssignedPolicies: [],
          selectedAvailablePolicies: [],
          assignedPolicySearchTerm: '',
          availablePolicySearchTerm: '',
          assignedPolicyTypeFilter: 'all',
          availablePolicyTypeFilter: 'all'
        }, false, 'resetPolicySelections'),
      
      resetAllState: () =>
        set({
          permissionViewMode: 'grouped',
          permissionSearchTerm: '',
          expandedGroups: {},
          selectedAssignedUsers: [],
          selectedAvailableUsers: [],
          assignedUserSearchTerm: '',
          availableUserSearchTerm: '',
          selectedAssignedPolicies: [],
          selectedAvailablePolicies: [],
          assignedPolicySearchTerm: '',
          availablePolicySearchTerm: '',
          assignedPolicyTypeFilter: 'all',
          availablePolicyTypeFilter: 'all',
          isProcessingUsers: false,
          isProcessingPolicies: false,
          activeTab: 'permissions'
        }, false, 'resetAllState')
    }),
    {
      name: 'role-detail-store',
      // Only enable devtools in development
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);