import { useState, useEffect } from 'react';
import { Car, CreditCard, ShoppingBag, ArrowRight, Filter, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface Purchase {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  price: number;
  purchaseDate: string;
  seller: string;
}

export function Transactions() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>(
    tabParam === 'sales' ? 'sales' : 'purchases'
  );
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (tabParam === 'sales') {
      setActiveTab('sales');
    } else if (tabParam === 'purchases') {
      setActiveTab('purchases');
    }
  }, [tabParam]);

  useEffect(() => {
    const savedPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    setPurchases(savedPurchases);

    const inventory = JSON.parse(localStorage.getItem('carInventory') || '[]');
    const soldCars = inventory.filter((car: any) => car.status === 'sold');
    setSales(soldCars);

    if (savedPurchases.length === 0) {
      const demoPurchases = [
        {
          id: 'purchase-1',
          carId: 'car-demo-1',
          carTitle: '2019 BMW X5',
          carImage: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=400&q=80',
          price: 8500000,
          purchaseDate: '2025-03-10T14:30:00.000Z',
          seller: 'Premium Motors'
        },
        {
          id: 'purchase-2',
          carId: 'car-demo-2',
          carTitle: '2021 Mercedes-Benz GLE',
          carImage: 'https://images.unsplash.com/photo-1617814076668-8dfc6fe3b324?auto=format&fit=crop&w=400&q=80',
          price: 10200000,
          purchaseDate: '2025-02-28T09:15:00.000Z',
          seller: 'Luxury Auto'
        }
      ];
      localStorage.setItem('purchases', JSON.stringify(demoPurchases));
      setPurchases(demoPurchases);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = (activeTab === 'purchases' ? purchases : sales).filter(item => 
    item.carTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage your vehicle purchases and sales</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 px-6 py-4 text-center font-medium relative ${
                activeTab === 'purchases' 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                My Purchases
              </div>
              {activeTab === 'purchases' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex-1 px-6 py-4 text-center font-medium relative ${
                activeTab === 'sales' 
                  ? 'text-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                My Sales
              </div>
              {activeTab === 'sales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              {activeTab === 'purchases' ? (
                <>
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Purchases Found</h3>
                  <p className="text-gray-500 mb-6">You haven't made any purchases yet.</p>
                  <Link
                    to="/listings"
                    className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Car className="w-5 h-5" />
                    Browse Cars
                  </Link>
                </>
              ) : (
                <>
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Sales Found</h3>
                  <p className="text-gray-500 mb-6">You haven't sold any cars yet.</p>
                  <Link
                    to="/list-car"
                    className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Car className="w-5 h-5" />
                    List Your Car
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredTransactions.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row gap-6 p-6 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden">
                    <img
                      src={item.carImage || item.image}
                      alt={item.carTitle || item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.carTitle || item.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-2">
                          {activeTab === 'purchases' ? 'Purchased from' : 'Sold to'}: {item.seller || 'Buyer Name'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Transaction Date: {formatDate(item.purchaseDate || item.listingDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                          KSh {(item.price || 0).toLocaleString()}
                        </div>
                        <Link
                          to={`/car/${item.carId || item.id}`}
                          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                    {item.year && item.mileage && (
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>Year: {item.year}</span>
                        <span>•</span>
                        <span>Mileage: {item.mileage.toLocaleString()} km</span>
                        <span>•</span>
                        <span>Condition: {item.condition}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
