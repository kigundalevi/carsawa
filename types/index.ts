// Car related interfaces
export interface Car {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  description: string;
  features: string[];
  status: 'active' | 'sold' | 'archived';
  images: CarImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CarImage {
  id: string;
  url: string;
  isPrimary?: boolean;
}

// Transaction related interfaces
export interface Purchase {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  price: number;
  purchaseDate: string;
  seller: string;
}

export interface Sale {
  id: string;
  title: string;
  image: string;
  images: CarImage[];
  price: number;
  listingDate: string;
  buyer: string;
  status: string;
}

export type TransactionItem = Purchase | Sale;

// Notification related interfaces
export interface Notification {
  id: string;
  type: 'car-added' | 'car-updated' | 'car-sold' | 'car-purchased' | 'car-deleted';
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

// User related interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dealer' | 'customer';
  createdAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination interface
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
