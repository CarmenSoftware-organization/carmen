// Mock API protection for development - replace with real implementation
import { NextRequest, NextResponse } from 'next/server';

export interface ProtectedRouteOptions {
  permissions?: string[];
  roles?: string[];
}

export function withAuth(handler: Function, options?: ProtectedRouteOptions) {
  return async (request: NextRequest) => {
    // Mock authentication - always pass in development
    console.log('API Protection check:', {
      path: request.nextUrl.pathname,
      permissions: options?.permissions,
      roles: options?.roles
    });

    // Add mock user to request for handlers that need it
    const mockUser = {
      id: '1',
      email: 'admin@carmen.com',
      name: 'Admin User',
      role: 'admin'
    };

    // Call the original handler with mock context
    return handler(request, { user: mockUser });
  };
}

export async function checkPermissions(permissions: string[]): Promise<boolean> {
  // Mock permission check - always return true for development
  console.log('Checking API permissions:', permissions);
  return true;
}

export async function requirePermissions(permissions: string[]): Promise<void> {
  const hasAccess = await checkPermissions(permissions);
  if (!hasAccess) {
    throw new Error('Insufficient permissions');
  }
}

// Mock auth strategies for development
export const authStrategies = {
  hybrid: (handler: Function) => {
    return (request: any, context?: any) => {
      console.log('Mock auth strategy - hybrid');
      return handler(request, { user: { id: 'mock-user', role: 'admin' } }, context);
    };
  }
};