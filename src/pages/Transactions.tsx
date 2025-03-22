import { useState, useEffect } from 'react';
import { Car, CreditCard, ShoppingBag, ArrowRight, Filter, Search, Loader } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { carAPI } from '../services/api';

interface Purchase {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  price: number;
  purchaseDate: string;
  seller: string;
}

interface Sale {
  id: string;
  title: string;
  image: string;
  images: { id: string; url: string }[];
  price: number;
  listingDate: string;
  buyer: string;
  status: string;
}

type TransactionItem = Purchase | Sale;

export function Transactions() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>(
    tabParam === 'sales' ? 'sales' : 'purchases'
  );
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'sales') {
      setActiveTab('sales');
    } else if (tabParam === 'purchases') {
      setActiveTab('purchases');
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch purchases and sales in parallel
        const [purchasesData, salesData] = await Promise.all([
          carAPI.getPurchases(),
          carAPI.getSales()
        ]);
        
        setPurchases(purchasesData);
        setSales(salesData);
      } catch (err) {
        setError('Failed to load transaction data. Please try again.');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper functions to safely access properties that might not exist on both types
  const getTitle = (item: TransactionItem): string => {
    return 'carTitle' in item ? item.carTitle : item.title;
  };

  const getImage = (item: TransactionItem): string => {
    if ('carImage' in item) {
      return item.carImage;
    }
    return item.image || (item.images && item.images.length > 0 ? item.images[0].url : '');
  };

  const getSellerOrBuyer = (item: TransactionItem, isSale: boolean): string => {
    if (isSale) {
      return 'buyer' in item ? item.buyer : 'Unknown';
    }
    return 'seller' in item ? item.seller : 'Unknown';
  };

  const getTransactionDate = (item: TransactionItem): string => {
    return 'purchaseDate' in item ? item.purchaseDate : item.listingDate;
  };

  const getItemId = (item: TransactionItem, isSale: boolean): string => {
    if (isSale) {
      return item.id;
    }
    return 'carId' in item ? item.carId : item.id;
  };

  const filteredTransactions = (activeTab === 'purchases' ? purchases : sales).filter(item => {
    const title = getTitle(item);
    const sellerOrBuyer = getSellerOrBuyer(item, activeTab === 'sales');
    
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerOrBuyer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

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
              {filteredTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row gap-6 p-6 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden">
                    <img
                      src={getImage(item)}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {getTitle(item)}
                        </h3>
                        <p className="text-gray-500 text-sm mb-2">
                          {activeTab === 'purchases' ? 'Purchased from' : 'Sold to'}: {getSellerOrBuyer(item, activeTab === 'sales')}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Transaction Date: {formatDate(getTransactionDate(item))}
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          KSh {item.price.toLocaleString()}
                        </div>
                        <Link
                          to={`/car/${getItemId(item, activeTab === 'sales')}`}
                          className="text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
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
