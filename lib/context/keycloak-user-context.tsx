'use client';

/**
 * Keycloak User Context Provider
 * 
 * Integrates NextAuth.js Keycloak sessions with Carmen ERP's existing user context system.
 * Maintains backward compatibility while adding Keycloak authentication support.
 * 
 * @author Carmen ERP Team
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { User, UserContextType, UserContext, Role } from '../types/user'
import { mockDepartments, mockLocations } from '../mock-data'
// Note: Audit logging moved to server-side only to avoid client-side environment validation
// import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced User interface for Keycloak integration
interface KeycloakUser extends Omit<User, 'id'> {
  id: string
  keycloakId: string
  keycloakRoles?: string[]
  keycloakGroups?: string[]
  accessToken?: string
}

// Enhanced UserContextType for Keycloak
interface KeycloakUserContextType extends UserContextType {
  user: KeycloakUser | null
  setUser: (user: KeycloakUser | null) => void
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  isSessionLoading: boolean
}

/**
 * Maps Keycloak roles to Carmen ERP roles
 */
function mapKeycloakRole(keycloakRoles: string[] = []): Role {
  const roleMapping: Record<string, Role> = {
    'carmen-admin': 'admin',
    'carmen-super-admin': 'super-admin',
    'carmen-financial-manager': 'financial-manager',
    'carmen-department-manager': 'department-manager',
    'carmen-purchasing-staff': 'purchasing-staff',
    'carmen-chef': 'chef',
    'carmen-counter': 'counter',
    'carmen-staff': 'staff',
    // Fallback mappings
    'admin': 'admin',
    'manager': 'department-manager',
    'staff': 'staff',
    'user': 'staff'
  }

  // Check for exact matches first
  for (const keycloakRole of keycloakRoles) {
    if (roleMapping[keycloakRole]) {
      return roleMapping[keycloakRole]
    }
  }

  // Check for partial matches (case-insensitive)
  for (const keycloakRole of keycloakRoles) {
    const lowerRole = keycloakRole.toLowerCase()
    if (lowerRole.includes('admin')) return 'admin'
    if (lowerRole.includes('manager')) return 'department-manager'
    if (lowerRole.includes('chef')) return 'chef'
    if (lowerRole.includes('purchasing') || lowerRole.includes('buyer')) return 'purchasing-staff'
    if (lowerRole.includes('finance') || lowerRole.includes('financial')) return 'financial-manager'
    if (lowerRole.includes('counter') || lowerRole.includes('cashier')) return 'counter'
  }

  // Default fallback
  return 'staff'
}

/**
 * Extract permissions from Keycloak roles
 */
function extractPermissionsFromRoles(roles: string[]): string[] {
  const permissions: string[] = []
  
  const rolePermissions: Record<string, string[]> = {
    'admin': ['*'],
    'super-admin': ['*'],
    'financial-manager': ['finance.*', 'reports.*', 'procurement.approve'],
    'department-manager': ['department.*', 'procurement.create', 'inventory.view'],
    'purchasing-staff': ['procurement.*', 'vendor.*', 'inventory.update'],
    'chef': ['recipes.*', 'production.*', 'inventory.view'],
    'counter': ['pos.*', 'inventory.view'],
    'staff': ['profile.view', 'inventory.view']
  }

  for (const role of roles) {
    const mappedRole = mapKeycloakRole([role])
    if (rolePermissions[mappedRole]) {
      permissions.push(...rolePermissions[mappedRole])
    }
  }

  return [...new Set(permissions)]
}

/**
 * Determine department from Keycloak groups or roles
 */
function determineDepartmentFromKeycloak(groups: string[] = [], roles: string[] = []): typeof mockDepartments[0] {
  const allClaims = [...groups, ...roles].map(s => s.toLowerCase())
  
  // Map common department indicators
  if (allClaims.some(claim => 
    claim.includes('kitchen') || 
    claim.includes('chef') || 
    claim.includes('culinary'))) {
    return mockDepartments.find(d => d.id === 'kitchen') || mockDepartments[0]
  }

  if (allClaims.some(claim => 
    claim.includes('procurement') || 
    claim.includes('purchasing') || 
    claim.includes('supply'))) {
    return mockDepartments.find(d => d.id === 'procurement') || mockDepartments[0]
  }

  if (allClaims.some(claim => 
    claim.includes('finance') || 
    claim.includes('accounting') || 
    claim.includes('financial'))) {
    return mockDepartments.find(d => d.id === 'finance') || mockDepartments[0]
  }

  if (allClaims.some(claim => 
    claim.includes('inventory') || 
    claim.includes('warehouse') || 
    claim.includes('storage'))) {
    return mockDepartments.find(d => d.id === 'inventory') || mockDepartments[0]
  }

  // Default to first department
  return mockDepartments[0]
}

/**
 * Convert NextAuth session to Carmen User object
 */
function sessionToCarmenUser(session: any): KeycloakUser | null {
  if (!session?.user) {
    return null
  }

  // Handle development authentication
  if (session.user.email && !session.roles && !session.keycloakId) {
    // This is likely a development session, derive role from user data
    const devRole = session.user.role || 'admin' // Default to admin for dev
    const keycloakRoles = [devRole]
    const keycloakGroups: string[] = []
    const mappedRole = mapKeycloakRole(keycloakRoles)
    const department = determineDepartmentFromKeycloak(keycloakGroups, keycloakRoles)
    const location = mockLocations[0]

    const availableRoles = [
      { name: mappedRole, permissions: extractPermissionsFromRoles([mappedRole]) }
    ]

    return {
      id: 'dev-user-001',
      keycloakId: 'dev-user-001',
      name: session.user.name || session.user.email?.split('@')[0] || 'Development User',
      email: session.user.email || '',
      avatar: session.user.image || '/avatars/default.png',
      keycloakRoles,
      keycloakGroups,
      accessToken: undefined,
      availableRoles,
      availableDepartments: mockDepartments,
      availableLocations: mockLocations,
      role: mappedRole,
      department: department.name,
      location: location.name,
      permissions: extractPermissionsFromRoles(keycloakRoles),
      assignedWorkflowStages: mappedRole === 'admin' 
        ? ['departmentHeadApproval', 'financeManagerApproval'] 
        : mappedRole === 'department-manager'
        ? ['departmentHeadApproval']
        : mappedRole === 'financial-manager'
        ? ['financeManagerApproval']
        : [],
      context: {
        currentRole: availableRoles[0],
        currentDepartment: department,
        currentLocation: location,
        showPrices: ['admin', 'financial-manager', 'department-manager'].includes(mappedRole),
      }
    }
  }

  // Handle Keycloak authentication
  const keycloakRoles = session.roles || []
  const keycloakGroups = session.groups || []
  const mappedRole = mapKeycloakRole(keycloakRoles)
  const department = determineDepartmentFromKeycloak(keycloakGroups, keycloakRoles)
  const location = mockLocations[0] // Default to first location

  // Determine available roles based on Keycloak roles
  // In a real implementation, this might come from Keycloak or be configured
  const availableRoles = [
    { name: mappedRole, permissions: extractPermissionsFromRoles([mappedRole]) }
  ]

  return {
    id: session.user.id || session.keycloakId || '',
    keycloakId: session.keycloakId || session.user.id || '',
    name: session.user.name || session.user.email || 'Unknown User',
    email: session.user.email || '',
    avatar: session.user.image || '/avatars/default.png',
    keycloakRoles,
    keycloakGroups,
    accessToken: session.accessToken,
    availableRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Current active selections
    role: mappedRole,
    department: department.name,
    location: location.name,
    // Extract permissions from roles
    permissions: extractPermissionsFromRoles(keycloakRoles),
    // Workflow stages - could be mapped from Keycloak roles/groups
    assignedWorkflowStages: mappedRole === 'admin' 
      ? ['departmentHeadApproval', 'financeManagerApproval'] 
      : mappedRole === 'department-manager'
      ? ['departmentHeadApproval']
      : mappedRole === 'financial-manager'
      ? ['financeManagerApproval']
      : [],
    context: {
      currentRole: availableRoles[0],
      currentDepartment: department,
      currentLocation: location,
      showPrices: ['admin', 'financial-manager', 'department-manager'].includes(mappedRole),
    }
  }
}

const KeycloakUserContext = createContext<KeycloakUserContextType | undefined>(undefined)

export function KeycloakUserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<KeycloakUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convert session to user whenever session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'unauthenticated' || !session) {
      setUser(null)
      setIsLoading(false)
      return
    }

    if (session.error) {
      console.error('Session error:', session.error)
      // Handle token refresh errors by signing out
      handleSignOut()
      return
    }

    // Convert session to Carmen user
    const carmenUser = sessionToCarmenUser(session)
    console.log('Converting session to user:', { session, carmenUser })
    setUser(carmenUser)
    setIsLoading(false)

    // Log user session activity (temporarily disabled for client-side compatibility)
    if (carmenUser) {
      // TODO: Move audit logging to server-side API call
      // createSecurityAuditLog({
      //   eventType: SecurityEventType.USER_ACTIVITY,
      //   userId: carmenUser.keycloakId,
      //   details: {
      //     activity: 'session_active',
      //     role: carmenUser.role,
      //     department: carmenUser.department,
      //     provider: 'keycloak'
      //   }
      // }).catch(console.error)
    }
  }, [session, status])

  const updateUserContext = useCallback((contextUpdates: Partial<UserContext>) => {
    if (!user) return

    const updatedUser = { ...user }

    // Update role if provided
    if (contextUpdates.currentRole) {
      updatedUser.context.currentRole = contextUpdates.currentRole
      updatedUser.role = contextUpdates.currentRole.name as Role
    }

    // Update department if provided
    if (contextUpdates.currentDepartment) {
      updatedUser.context.currentDepartment = contextUpdates.currentDepartment
      updatedUser.department = contextUpdates.currentDepartment.name
    }

    // Update location if provided
    if (contextUpdates.currentLocation) {
      updatedUser.context.currentLocation = contextUpdates.currentLocation
      updatedUser.location = contextUpdates.currentLocation.name
    }

    // Update price visibility if provided
    if (contextUpdates.showPrices !== undefined) {
      updatedUser.context.showPrices = contextUpdates.showPrices
    }

    setUser(updatedUser)
    
    // Log context update (temporarily disabled for client-side compatibility)
    // TODO: Move audit logging to server-side API call
    // createSecurityAuditLog({
    //   eventType: SecurityEventType.USER_CONTEXT_CHANGED,
    //   userId: updatedUser.keycloakId,
    //   details: {
    //     contextUpdates,
    //     newRole: updatedUser.role,
    //     newDepartment: updatedUser.department,
    //     newLocation: updatedUser.location
    //   }
    // }).catch(console.error)

    console.log('User context updated:', updatedUser.context)
  }, [user])

  const handleSignIn = useCallback(async () => {
    try {
      await signIn('keycloak', { 
        callbackUrl: window.location.origin + '/dashboard' 
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      if (user) {
        // TODO: Move audit logging to server-side API call
        // await createSecurityAuditLog({
        //   eventType: SecurityEventType.USER_LOGOUT,
        //   userId: user.keycloakId,
        //   details: {
        //     provider: 'keycloak',
        //     voluntary: true
        //   }
        // })
      }

      await signOut({
        callbackUrl: window.location.origin + '/auth/signin'
      })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [user])

  const refreshSession = useCallback(async () => {
    try {
      await update()
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [update])

  const contextValue: KeycloakUserContextType = {
    user,
    setUser,
    updateUserContext,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshSession,
    isSessionLoading: status === 'loading',
  }

  return (
    <KeycloakUserContext.Provider value={contextValue}>
      {children}
    </KeycloakUserContext.Provider>
  )
}

export function useKeycloakUser(): KeycloakUserContextType {
  const context = useContext(KeycloakUserContext)
  if (context === undefined) {
    throw new Error('useKeycloakUser must be used within a KeycloakUserProvider')
  }
  return context
}

// Backward compatibility hooks
export function useUser(): UserContextType {
  const keycloakContext = useKeycloakUser()
  
  return {
    user: keycloakContext.user,
    setUser: keycloakContext.setUser,
    updateUserContext: keycloakContext.updateUserContext,
    isLoading: keycloakContext.isLoading,
  }
}

// Export KeycloakUserProvider as default for easy migration
export { KeycloakUserProvider as UserProvider }