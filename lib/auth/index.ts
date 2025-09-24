// Mock auth module for development - replace with real auth implementation
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getUser(): Promise<User | null> {
  // Mock user for development
  return {
    id: '1',
    email: 'admin@carmen.com',
    name: 'Admin User',
    role: 'admin'
  };
}

export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function hasPermission(permission: string): Promise<boolean> {
  // Mock permission check - always return true for development
  console.log('Checking permission:', permission);
  return true;
}