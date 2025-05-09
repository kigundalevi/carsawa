/**
 * API Service
 * 
 * This service handles all API calls to the backend server.
 * It provides methods for authentication, car management, and other operations.
 */

const API_BASE_URL = 'https://carsawa-backend-6zf3.onrender.com';

// Helper function to get auth headers
const getHeaders = (contentType?: string) => {
  const headers = new Headers();
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  if (contentType) {
    headers.append('Content-Type', contentType);
  }
  return headers;
};

// Helper function to handle API responses
// api.ts
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    let errorMessage = 'An error occurred';
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch (e) {
      console.error('Failed to parse error response:', e);
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Authentication API calls
export const authAPI = {
  /**
   * Register a new user
   * @param dealerData Object containing dealer registration details
   */
  register: async (formData: FormData) => {
    const url = `${API_BASE_URL}/api/auth/register`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Fetch error details:', error); // Log the exact error
      throw error; // Re-throw to handle it in the calling code
    }
  },
  /**
   * Login user
   * @param email User's email
   * @param password User's password
   */
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const headers = getHeaders()
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: headers,
    });
    return handleResponse(response);
  },

  /**
   * Update user profile
   * @param profileData Object containing profile information to update
   */
  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    location?: string;
    profileImage?: string;
    password?: string;
  }) => {
    const headers = getHeaders('application/json')
    const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  /**
   * Change user password
   * @param passwordData Object containing current and new passwords
   */
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const headers = getHeaders('application/json')
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },
};

// Car inventory API calls
export const carAPI = {
  /**
   * Get all cars with optional filters
   * @param filters Object containing filter parameters
   */
  getAllCars: async (filters: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/api/cars${queryString}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get current dealer's listings
   * @param dealerId The ID of the dealer whose listings are to be fetched
   */
  getMyListings: async (dealerId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/cars/dealer/${dealerId}`, {
      headers: getHeaders(),
    });
    const data = await handleResponse(response);
    return data.cars; // Assuming backend returns { cars, page, pages, total }
  },

 /**
   * Get a specific car by ID
   * @param id Car ID
   */
 getCarById: async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
},

  /**
   * Create a new car listing
   * @param carData FormData containing car details and images
   */
  createCar: async (carData: FormData) => {
    const headers = getHeaders()
    const response = await fetch(`${API_BASE_URL}/api/cars/create`, {
      method: 'POST',
      headers: headers,
      body: carData,
    });
    return handleResponse(response);
  },

  /**
   * Update an existing car listing
   * @param id Car ID
   * @param carData Object containing updated car details
   */
  updateCar: async (id: string, carData: Record<string, any>) => {
    const headers = getHeaders('application/json')
    const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  /**
   * Delete a car listing
   * @param id Car ID
   */
  deleteCar: async (id: string) => {
    const headers = getHeaders()
    const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
      method: 'DELETE',
      headers: headers,
    });
    return handleResponse(response);
  },

  /**
   * Update car status
   * @param id Car ID
   * @param status New status ('Available', 'Sold', 'Reserved')
   */
  updateCarStatus: async (id: string, status: 'Available' | 'Sold' | 'Reserved') => {
    const headers = getHeaders('application/json')
    const response = await fetch(`${API_BASE_URL}/api/cars/${id}/status`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

// Transactions API calls
// export const transactionAPI = {
//   getPurchases: async () => {
//     const response = await fetch(`${API_BASE_URL}/api/transactions/purchases`, {
//       headers: getHeaders(),
//     });
//     return handleResponse(response);
//   },

//   getSales: async () => {
//     const response = await fetch(`${API_BASE_URL}/api/transactions/sales`, {
//       headers: getHeaders(),
//     });
//     return handleResponse(response);
//   },
// };

// Notifications API calls
// export const notificationAPI = {
//   getNotifications: async () => {
//     const response = await fetch(`${API_BASE_URL}/api/notifications`, {
//       headers: getHeaders(),
//     });
//     return handleResponse(response);
//   },

//   markAsRead: async (ids: string[]) => {
//     const headers = getHeaders('application/json')
//     const response = await fetch(`${API_BASE_URL}/api/notifications/read`, {
//       method: 'POST',
//       headers: headers,
//       body: JSON.stringify({ ids }),
//     });
//     return handleResponse(response);
//   },

//   markAllAsRead: async () => {
//     const headers = getHeaders('application/json')
//     const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
//       method: 'POST',
//       headers: headers,
//     });
//     return handleResponse(response);
//   },

//   getUnreadCount: async () => {
//       const headers = getHeaders('application/json')
//     const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
//       headers: headers,
//     });
//     return handleResponse(response);
//   },
// };