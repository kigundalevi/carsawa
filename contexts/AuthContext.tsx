"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

// Define user interface
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  profileImage?: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>; // Updated to accept FormData
  logout: () => Promise<void>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * 
 * Provides authentication state and methods to the entire application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        // User is not logged in, that's okay
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function (unchanged)
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      const { token, ...userData } = response; // Assuming API returns { token, ...userFields }
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function (updated to handle FormData)
  const register = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(formData);
      const { token, ...userData } = response; // Assuming API returns { token, ...userFields }
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function (unchanged)
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create the context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}