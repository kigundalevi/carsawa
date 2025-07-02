"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, DealerRegistrationData, DealerProfile } from '@/services/api';

// Define user interface to match backend response
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  profileImage?: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (dealerData: DealerRegistrationData) => Promise<void>;
  updateProfile: (profileData: Partial<DealerRegistrationData>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          // Validate token by fetching current user
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } catch (err) {
        // Token is invalid or expired, clear storage
        console.log('Token validation failed, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: DealerProfile = await authAPI.login(email, password);
      const { token, ...userData } = response;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      setUser(userData as User);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (dealerData: DealerRegistrationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: DealerProfile = await authAPI.register(dealerData);
      const { token, ...userData } = response;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      setUser(userData as User);
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      console.error('Registration error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<DealerRegistrationData>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updatedUserData = await authAPI.updateProfile(profileData);
      
      // Update user state with new data
      setUser(updatedUserData as User);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call logout API (optional, as token will be removed anyway)
      try {
        await authAPI.logout();
      } catch (err) {
        // Logout API call failed, but we'll still clear local data
        console.warn('Logout API call failed:', err);
      }
      
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout';
      setError(errorMessage);
      console.error('Logout error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create the context value
  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    updateProfile,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * HOC to protect routes that require authentication
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; // You can replace this with a proper loading component
    }
    
    if (!user) {
      // Redirect to login or show login modal
      // This depends on your routing setup
      return null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useAuthStatus() {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
}