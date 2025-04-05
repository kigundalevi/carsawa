import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CarCard } from '../components/listings/CarCard';
import { ListingsFilter } from '../components/listings/ListingsFilter';
import { Loader, AlertCircle } from 'lucide-react';
import { carAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Car {
  id: string;
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  image: string;
  images?: { id: string; url: string }[];
  status: 'active' | 'sold' | 'archived';
  dealerId?: string;
  userId?: string; // ID of the user who wants to sell the car
  isUserListing?: boolean; // Flag to identify user listings vs dealer listings
}

interface Filters {
  make: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  condition: string;
}

export function Listings() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    make: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    condition: ''
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch cars that are available for bidding (user listings)
        // In a real API, we would have a parameter like isUserListing=true
        const data = await carAPI.getAllCars({ isUserListing: 'true' });
        
        // Only show active cars
        const activeCars = data.filter((car: Car) => car.status === 'active');
        
        // If the user is a dealer, filter out their own listings
        const filteredCars = user?.role === 'dealer' 
          ? activeCars.filter((car: Car) => car.dealerId !== user.id)
          : activeCars;
          
        setCars(filteredCars);
      } catch (err) {
        setError('Failed to load car listings. Please try again.');
        console.error('Error fetching car listings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [user]);

  // Apply filters to cars
  const filteredCars = cars.filter(car => {
    // Filter by make/model (search in title)
    if (filters.make && !car.title.toLowerCase().includes(filters.make.toLowerCase())) {
      return false;
    }
    
    // Filter by min price
    if (filters.minPrice && car.price < parseInt(filters.minPrice)) {
      return false;
    }
    
    // Filter by max price
    if (filters.maxPrice && car.price > parseInt(filters.maxPrice)) {
      return false;
    }
    
    // Filter by min year
    if (filters.minYear && car.year < parseInt(filters.minYear)) {
      return false;
    }
    
    // Filter by max year
    if (filters.maxYear && car.year > parseInt(filters.maxYear)) {
      return false;
    }
    
    // Filter by condition
    if (filters.condition && car.condition !== filters.condition) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading car listings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Available Cars for Bidding</h1>
        <p className="text-gray-600 mt-1">Browse and filter cars from users looking to sell</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {user?.role === 'dealer' && (
        <div className="flex justify-end">
          <Link
            to="/inventory"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Manage My Inventory
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ListingsFilter onFilterChange={handleFilterChange} filters={filters} />
        </div>
        <div className="lg:col-span-3">
          {filteredCars.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Cars Found</h3>
              <p className="text-gray-600 mb-4">
                No cars match your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => setFilters({
                  make: '',
                  minPrice: '',
                  maxPrice: '',
                  minYear: '',
                  maxYear: '',
                  condition: ''
                })}
                className="text-primary hover:text-primary-hover font-medium"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCars.map(car => (
                <CarCard 
                  key={car.id} 
                  car={car}
                  showBidButton={user?.role === 'dealer'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}