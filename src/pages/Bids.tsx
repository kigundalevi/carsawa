import { useState, useEffect } from 'react';
import { Gavel, Clock, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Bid {
  id: string;
  carId: string;
  carName: string;
  amount: number;
  timeLeft: string;
  image: string;
  status: 'pending' | 'accepted' | 'rejected';
  bidDate: string;
  seller: string;
}

export function Bids() {
  const [myBids, setMyBids] = useState<Bid[]>([]);

  useEffect(() => {
    // Load bids from localStorage
    const storedBids = localStorage.getItem('activeBids');
    if (storedBids) {
      setMyBids(JSON.parse(storedBids));
    } else {
      // Create demo bids if none exist
      const demoBids = [
        {
          id: 'bid-1',
          carId: 'car-demo-1',
          carName: '2020 Toyota Land Cruiser',
          amount: 7500000,
          timeLeft: '2 days left',
          image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
          status: 'pending',
          bidDate: '2025-03-15T10:30:00.000Z',
          seller: 'Premium Motors'
        },
        {
          id: 'bid-2',
          carId: 'car-demo-2',
          carName: '2022 Honda CR-V',
          amount: 4200000,
          timeLeft: '1 day left',
          image: 'https://images.unsplash.com/photo-1568844293986-ca9c5c1bc2e0?auto=format&fit=crop&w=400&q=80',
          status: 'accepted',
          bidDate: '2025-03-16T14:45:00.000Z',
          seller: 'AutoHub Kenya'
        },
        {
          id: 'bid-3',
          carId: 'car-demo-3',
          carName: '2021 Mazda CX-5',
          amount: 3800000,
          timeLeft: 'Ended',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80',
          status: 'rejected',
          bidDate: '2025-03-14T09:15:00.000Z',
          seller: 'Car City'
        }
      ];
      localStorage.setItem('activeBids', JSON.stringify(demoBids));
      setMyBids(demoBids);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Bids</h1>
          <p className="text-gray-600 mt-1">Track all your bids on vehicles</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {myBids.length === 0 ? (
          <div className="text-center py-16">
            <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Bids Yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any bids yet.</p>
            <Link
              to="/listings"
              className="bg-primary hover:bg-primary-hover text-black px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Car className="w-5 h-5" />
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Left</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0 rounded-md overflow-hidden">
                          <img className="h-full w-full object-cover" src={bid.image} alt={bid.carName} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bid.carName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">KSh {bid.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(bid.bidDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{bid.seller}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBidStatusColor(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {bid.timeLeft}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/car/${bid.carId}`} className="text-primary hover:text-primary-hover flex items-center justify-end gap-1">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
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
