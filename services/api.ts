/**
 * API Service
 * 
 * This service handles all API calls to the backend server.
 * It provides methods for authentication, car management, and other operations.
 */

const API_BASE_URL = 'https://api.carsawa.africa/api';
;

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
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const textError = await response.text();
        console.log('Error response text:', textError);
        errorMessage = textError || errorMessage;
      }
    } catch (e) {
      console.error('Failed to parse error response:', e);
    }
    
    throw new Error(errorMessage);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse success response as JSON:', error);
    return {}; // Return empty object for non-JSON success responses
  }
};

// Helper function to validate coordinates
const validateCoordinates = (latitude: number | string, longitude: number | string): boolean => {
  const lat = parseFloat(latitude.toString());
  const lng = parseFloat(longitude.toString());
  
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
};

// Helper function to create FormData for dealer registration/update
export const createDealerFormData = (dealerData: {
  name: string;
  email: string;
  password?: string;
  phone: string;
  whatsapp: string;
  location: string; // Address string
  latitude: number | string;
  longitude: number | string;
  profileImage?: File;
}): FormData => {
  // Validate coordinates before creating FormData
  if (!validateCoordinates(dealerData.latitude, dealerData.longitude)) {
    throw new Error('Invalid latitude or longitude coordinates');
  }

  const formData = new FormData();
  
  // Add text fields
  formData.append('name', dealerData.name);
  formData.append('email', dealerData.email);
  if (dealerData.password) {
    formData.append('password', dealerData.password);
  }
  formData.append('phone', dealerData.phone);
  formData.append('whatsapp', dealerData.whatsapp);
  formData.append('location', dealerData.location); // This is the address string
  formData.append('latitude', dealerData.latitude.toString());
  formData.append('longitude', dealerData.longitude.toString());
  
  // Add profile image if provided
  if (dealerData.profileImage) {
    formData.append('profileImage', dealerData.profileImage);
  }
  
  return formData;
};

// Authentication API calls
export const authAPI = {
  /**
   * Register a new dealer
   * @param dealerData Object containing dealer registration details
   */
  register: async (dealerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    whatsapp: string;
    location: string;
    latitude: number | string;
    longitude: number | string;
    profileImage?: File;
  }) => {
    try {
      const formData = createDealerFormData(dealerData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param email User's email
   * @param password User's password
   */
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
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
    password?: string;
    phone?: string;
    whatsapp?: string;
    location?: string;
    latitude?: number | string;
    longitude?: number | string;
    profileImage?: File;
  }) => {
    try {
      // Validate coordinates if provided
      if ((profileData.latitude !== undefined || profileData.longitude !== undefined)) {
        const lat = profileData.latitude ?? 0;
        const lng = profileData.longitude ?? 0;
        if (!validateCoordinates(lat, lng)) {
          throw new Error('Invalid latitude or longitude coordinates');
        }
      }

      const formData = new FormData();
      
      // Add fields that are provided
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.email) formData.append('email', profileData.email);
      if (profileData.password) formData.append('password', profileData.password);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.whatsapp) formData.append('whatsapp', profileData.whatsapp);
      if (profileData.location) formData.append('location', profileData.location);
      if (profileData.latitude !== undefined) formData.append('latitude', profileData.latitude.toString());
      if (profileData.longitude !== undefined) formData.append('longitude', profileData.longitude.toString());
      if (profileData.profileImage) formData.append('profileImage', profileData.profileImage);

      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: getHeaders(), // Don't set Content-Type for FormData
        body: formData,
      });
      
      return handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change user password
   * @param passwordData Object containing current and new passwords
   */
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders('application/json'),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  /**
   * Get nearby dealers
   * @param location Object containing latitude, longitude, and optional radius
   */
  getNearbyDealers: async (location: {
    latitude: number | string;
    longitude: number | string;
    radius?: number;
  }) => {
    if (!validateCoordinates(location.latitude, location.longitude)) {
      throw new Error('Invalid coordinates provided');
    }

    const queryParams = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      ...(location.radius && { radius: location.radius.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/auth/dealers/nearby?${queryParams.toString()}`, {
      headers: getHeaders(),
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
    
    // Handle filters properly
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/cars?${queryParams.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get current dealer's listings
   * @param dealerId The ID of the dealer whose listings are to be fetched
   */
  getMyListings: async (dealerId: string) => {
    const response = await fetch(`${API_BASE_URL}/cars/dealer/${dealerId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get a specific car by ID
   * @param id Car ID
   */
  getCarById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Create a new car listing
   * @param carData FormData containing car details and images
   */
  createCar: async (carData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/cars/create`, {
      method: 'POST',
      headers: getHeaders(), // Don't set Content-Type for FormData
      body: carData,
    });
    return handleResponse(response);
  },

  /**
   * Update an existing car listing
   * @param id Car ID
   * @param carData FormData containing updated car details and images
   */
  updateCar: async (id: string, carData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'PUT',
      headers: getHeaders(), // Don't set Content-Type for FormData
      body: carData,
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
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Update car status
   * @param id Car ID
   * @param status New status ('Available', 'Sold', 'Reserved')
   */
  updateCarStatus: async (id: string, status: 'Available' | 'Sold' | 'Reserved') => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}/status`, {
        method: 'PUT',
        headers: getHeaders('application/json'),
        body: JSON.stringify({ status }),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      throw error;
    }
  },
};

// Location utilities
export const locationAPI = {
  /**
   * Get current user's location using browser geolocation
   */
  getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  /**
   * Validate coordinates
   * @param latitude 
   * @param longitude 
   */
  validateCoordinates: validateCoordinates,
};

// Type definitions for better TypeScript support
export interface DealerRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp: string;
  location: string;
  latitude: number | string;
  longitude: number | string;
  profileImage?: File;
}

export interface DealerUpdateData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  latitude?: number | string;
  longitude?: number | string;
  profileImage?: File;
}

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface DealerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: LocationData;
  profileImage?: string;
  token?: string;
}

// Transactions API calls
// export const transactionAPI = {
//   getPurchases: async () => {
//     const response = await fetch(`${API_BASE_URL}/transactions/purchases`, {
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