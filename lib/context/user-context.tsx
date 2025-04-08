'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserContextType } from '../types/user';

// Mock user data - replace with actual API call
const mockUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  department: 'F&B',
  role: 'Counter',
  avatar: '/avatars/default.png',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get user
    const loadUser = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(mockUser);
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
    <UserContext.Provider value={{ user, setUser, isLoading }}>
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
