/**
 * API Service
 * 
 * This service handles all API calls to the backend server.
 * It provides methods for authentication, car management, and other operations.
 */

// Base URL for API calls -
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.json();
};

// Authentication API calls
export const authAPI = {
  /**
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @param name User's full name
   */
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
      credentials: 'include', // Include cookies for session management
    });
    return handleResponse(response);
  },

  /**
   * Login user
   * @param email User's email
   * @param password User's password
   */
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies for session management
    });
    return handleResponse(response);
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies for session management
    });
    return handleResponse(response);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include', // Include cookies for session management
    });
    return handleResponse(response);
  },
};

// Car inventory API calls
export const carAPI = {
  /**
   * Get all cars in inventory
   * @param filters Optional filters for the query
   */
  getAllCars: async (filters = {}) => {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/cars${queryString}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get cars owned by the current dealer
   */
  getMyListings: async () => {
    const response = await fetch(`${API_BASE_URL}/cars/my-listings`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get a specific car by ID
   * @param id Car ID
   */
  getCarById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Create a new car listing
   * @param carData Car data object
   */
  createCar: async (carData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      body: carData, // FormData for file uploads
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Update an existing car listing
   * @param id Car ID
   * @param carData Car data object
   */
  updateCar: async (id: string, carData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'PUT',
      body: carData, // FormData for file uploads
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Delete a car listing
   * @param id Car ID
   */
  deleteCar: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Update car status
   * @param id Car ID
   * @param status New status ('active', 'sold', 'archived')
   */
  updateCarStatus: async (id: string, status: 'active' | 'sold' | 'archived') => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get user's purchases
   */
  getPurchases: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/purchases`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get user's sales
   */
  getSales: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/sales`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Transactions API calls
export const transactionAPI = {
  /**
   * Get all purchases by the current user
   */
  getPurchases: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/purchases`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get all sales by the current user
   */
  getSales: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/sales`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Notifications API calls
export const notificationAPI = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Mark notifications as read
   * @param ids Array of notification IDs to mark as read
   */
  markAsRead: async (ids: string[]) => {
    const response = await fetch(`${API_BASE_URL}/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};
