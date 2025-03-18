import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Check, X, Car } from 'lucide-react';

interface CarListing {
  id: string;
  title: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  image: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  status: 'active' | 'sold' | 'archived';
  listingDate: string;
}

export function InventoryPage() {
  const [inventory, setInventory] = useState<CarListing[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Load inventory from localStorage
    const savedInventory = JSON.parse(localStorage.getItem('carInventory') || '[]');
    
    // If no inventory exists in localStorage, initialize with demo data
    if (savedInventory.length === 0) {
      const demoInventory = [
        {
          id: 'car-1',
          title: '2020 Toyota Land Cruiser V8',
          year: 2020,
          price: 12500000,
          location: 'Nairobi, Kenya',
          mileage: 45000,
          image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
          condition: 'Excellent' as const,
          status: 'active' as const,
          listingDate: '2025-02-15T12:00:00.000Z'
        },
        {
          id: 'car-2',
          title: '2019 Mercedes-Benz C200',
          year: 2019,
          price: 4800000,
          location: 'Mombasa, Kenya',
          mileage: 62000,
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80',
          condition: 'Good' as const,
          status: 'active' as const,
          listingDate: '2025-02-20T14:30:00.000Z'
        },
        {
          id: 'car-3',
          title: '2018 Mazda CX-5',
          year: 2018,
          price: 3200000,
          location: 'Nairobi, Kenya',
          mileage: 85000,
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
          condition: 'Fair' as const,
          status: 'sold' as const,
          listingDate: '2025-01-10T09:15:00.000Z'
        }
      ];
      
      localStorage.setItem('carInventory', JSON.stringify(demoInventory));
      setInventory(demoInventory);
    } else {
      setInventory(savedInventory);
    }
  }, []);

  const updateCarStatus = (carId: string, status: 'active' | 'sold' | 'archived') => {
    const updatedInventory = inventory.map(car => 
      car.id === carId ? { ...car, status } : car
    );
    
    setInventory(updatedInventory);
    localStorage.setItem('carInventory', JSON.stringify(updatedInventory));
    
    // Add to recent activities
    const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    const car = inventory.find(c => c.id === carId);
    const newActivity = {
      id: Date.now().toString(),
      message: `Car ${car?.title} marked as ${status}`,
      time: 'Just now',
      type: status === 'sold' ? 'sale' : 'listing'
    };
    localStorage.setItem('recentActivities', JSON.stringify([newActivity, ...recentActivities]));
  };

  const deleteCar = (carId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const carToDelete = inventory.find(car => car.id === carId);
      const updatedInventory = inventory.filter(car => car.id !== carId);
      setInventory(updatedInventory);
      localStorage.setItem('carInventory', JSON.stringify(updatedInventory));
      
      // Add to recent activities
      if (carToDelete) {
        const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
        const newActivity = {
          id: Date.now().toString(),
          message: `Deleted listing: ${carToDelete.title}`,
          time: 'Just now',
          type: 'listing'
        };
        localStorage.setItem('recentActivities', JSON.stringify([newActivity, ...recentActivities]));
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
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Inventory</h1>
        <Link
          to="/list-car"
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Car className="w-5 h-5" />
          List New Car
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            All ({inventory.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'active' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Active ({inventory.filter(car => car.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('sold')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'sold' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Sold ({inventory.filter(car => car.status === 'sold').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'archived' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Archived ({inventory.filter(car => car.status === 'archived').length})
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
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 overflow-hidden rounded">
                        <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{car.title}</div>
                        <div className="text-sm text-gray-500">{car.year} · {car.mileage.toLocaleString()} km · {car.condition}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">KSh {car.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        car.status === 'active' ? 'bg-green-100 text-green-800' : 
                        car.status === 'sold' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(car.listingDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {car.status !== 'sold' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'sold')}
                            className="p-1 hover:bg-green-100 hover:text-green-800 rounded"
                            title="Mark as Sold"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        {car.status === 'active' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'archived')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Archive Listing"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {car.status === 'archived' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'active')}
                            className="p-1 hover:bg-green-100 hover:text-green-800 rounded"
                            title="Restore Listing"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          to={`/edit-car/${car.id}`}
                          className="p-1 hover:bg-blue-100 hover:text-blue-800 rounded"
                          title="Edit Listing"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => deleteCar(car.id)}
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