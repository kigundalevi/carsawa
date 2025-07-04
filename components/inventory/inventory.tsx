import { useState, useEffect } from 'react';
import Link  from 'next/link';
import { Edit, Trash, Check, X, Car, Loader, AlertCircle } from 'lucide-react';
import { carAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface CarListing {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  transmission: string;
  bodyType: string;
  fuelType: string;
  status: 'Available' | 'Sold' | 'Reserved';
  images: string[];
  createdAt: string;
  dealer: string;
}

export function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<CarListing[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure user is authenticated and has an ID
      if (!user?._id) {
        throw new Error('User not authenticated');
      }
      
      const response = await carAPI.getMyListings(user._id); 
      
      // Check if response is array or object with cars property
      if (Array.isArray(response)) {
        setInventory(response);
      } else if (response && response.cars && Array.isArray(response.cars)) {
        setInventory(response.cars);
      } else {
        setInventory([]);
      }
    } catch (err) {
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const updateCarStatus = async (carId: string, status: 'Available' | 'Sold' | 'Reserved') => {
    try {
      await carAPI.updateCarStatus(carId, status);
      setInventory(prev =>
        prev.map(car => (car._id === carId ? { ...car, status } : car))
      );
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update car status';
      setError(errorMessage);
    }
  };

  const deleteCar = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await carAPI.deleteCar(carId);
        setInventory(prev => prev.filter(car => car._id !== carId));
      } catch (err) {
        setError(`Failed to delete car: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const filteredInventory = filterStatus === 'all'
    ? inventory
    : inventory.filter(car => car.status === filterStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">You must be logged in to view and manage inventory.</p>
        <Link href="/login" className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Inventory</h1>
        <Link
          href="/list-car"
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Car className="w-5 h-5" />
          List New Car
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button onClick={fetchInventory} className="ml-4 underline hover:text-red-800">
            Try Again
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            All ({inventory.length})
          </button>
          <button
            onClick={() => setFilterStatus('Available')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'Available' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Available ({inventory.filter(car => car.status === 'Available').length})
          </button>
          <button
            onClick={() => setFilterStatus('Sold')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'Sold' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Sold ({inventory.filter(car => car.status === 'Sold').length})
          </button>
          <button
            onClick={() => setFilterStatus('Reserved')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'Reserved' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Reserved ({inventory.filter(car => car.status === 'Reserved').length})
          </button>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cars found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Car Details</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Listed Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map(car => (
                  <tr key={car._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 overflow-hidden rounded">
                        <img
                          src={car.images && car.images.length > 0 ? car.images[0] : '/placeholder.png'}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{car.make} {car.model}</div>
                        <div className="text-sm text-gray-500">{car.year} · {car.mileage.toLocaleString()} km · {car.condition}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">KSh {car.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          car.status === 'Available' ? 'bg-green-100 text-green-800' :
                          car.status === 'Sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {car.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(car.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {car.status !== 'Sold' && (
                          <button
                            onClick={() => updateCarStatus(car._id, 'Sold')}
                            className="p-1 hover:bg-blue-100 hover:text-blue-800 rounded"
                            title="Mark as Sold"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        {car.status !== 'Reserved' && (
                          <button
                            onClick={() => updateCarStatus(car._id, 'Reserved')}
                            className="p-1 hover:bg-yellow-100 hover:text-yellow-800 rounded"
                            title="Mark as Reserved"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {car.status !== 'Available' && (
                          <button
                            onClick={() => updateCarStatus(car._id, 'Available')}
                            className="p-1 hover:bg-green-100 hover:text-green-800 rounded"
                            title="Mark as Available"
                          >
                            <Car className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          href={`/edit-car/${car._id}`}
                          className="p-1 hover:bg-blue-100 hover:text-blue-800 rounded"
                          title="Edit Listing"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => deleteCar(car._id)}
                          className="p-1 hover:bg-red-100 hover:text-red-800 rounded"
                          title="Delete Listing"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}