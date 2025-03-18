import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Gauge, MapPin, Shield, Award, AlertTriangle } from 'lucide-react';
import { BidModal } from '../components/bidding/BidModal';
import { BidHistory } from '../components/bidding/BidHistory';

// Fallback data in case no car is found
const fallbackCarDetails = {
  id: '1',
  title: 'Car Details Not Found',
  year: new Date().getFullYear(),
  price: 0,
  location: 'Unknown',
  mileage: 0,
  condition: 'Good' as const,
  description: 'Car details could not be loaded. Please go back to listings and try again.',
  features: ['No features available'],
  images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80'],
  inspectionReport: {
    exterior: 'Unknown',
    interior: 'Unknown',
    mechanical: 'Unknown',
    lastInspection: 'Unknown'
  }
};

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  time: string;
}

export function CarDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [carDetails, setCarDetails] = useState(fallbackCarDetails);
  const [bidPlaced, setBidPlaced] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Load car details from localStorage
    if (id) {
      const storedCar = localStorage.getItem(`car-${id}`);
      if (storedCar) {
        const parsedCar = JSON.parse(storedCar);
        
        // Extend the basic car data with additional details
        setCarDetails({
          ...parsedCar,
          description: parsedCar.description || 'No description available for this vehicle.',
          features: parsedCar.features || [
            'Leather Interior',
            'Sunroof',
            'Navigation System',
            'Bluetooth',
            'Reverse Camera',
            'Cruise Control'
          ],
          images: parsedCar.images || [parsedCar.image, parsedCar.image, parsedCar.image],
          inspectionReport: parsedCar.inspectionReport || {
            exterior: parsedCar.condition,
            interior: parsedCar.condition,
            mechanical: parsedCar.condition,
            lastInspection: new Date().toISOString().split('T')[0]
          }
        });
      }
    }

    // Load bid history from localStorage
    const storedBids = localStorage.getItem(`bids-${id}`);
    if (storedBids) {
      setBidHistory(JSON.parse(storedBids));
    } else {
      // Set default bid history if none exists
      const defaultBids = [
        { id: '1', amount: Math.floor(carDetails.price * 0.98), bidder: 'Sarah M.', time: '3 hours ago' },
        { id: '2', amount: Math.floor(carDetails.price * 0.95), bidder: 'Mike K.', time: '5 hours ago' }
      ];
      setBidHistory(defaultBids);
      localStorage.setItem(`bids-${id}`, JSON.stringify(defaultBids));
    }
  }, [id]);

  const handleBidSubmit = (amount: number) => {
    // Create a new bid
    const newBid = {
      id: Date.now().toString(),
      amount,
      bidder: 'You',
      time: 'Just now'
    };

    // Update bid history
    const updatedBids = [newBid, ...bidHistory];
    setBidHistory(updatedBids);
    localStorage.setItem(`bids-${id}`, JSON.stringify(updatedBids));

    // Add to active bids in localStorage
    const activeBids = JSON.parse(localStorage.getItem('activeBids') || '[]');
    const newActiveBid = {
      id: newBid.id,
      carId: id,
      carName: carDetails.title,
      amount: amount,
      timeLeft: '23h 45m',
      image: carDetails.images[0],
      status: 'pending'
    };
    localStorage.setItem('activeBids', JSON.stringify([...activeBids, newActiveBid]));

    // Add to recent activity
    const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    const newActivity = {
      id: Date.now().toString(),
      message: `New bid placed on ${carDetails.title}`,
      time: 'Just now',
      type: 'bid'
    };
    localStorage.setItem('recentActivities', JSON.stringify([newActivity, ...recentActivities]));

    // Set bid placed flag
    setBidPlaced(true);
  };

  if (!id) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the car you're looking for.</p>
        <button 
          onClick={() => navigate('/listings')}
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors"
        >
          Return to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] relative rounded-xl overflow-hidden">
            <img
              src={carDetails.images[selectedImage]}
              alt={carDetails.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {carDetails.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[16/9] relative rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${carDetails.title} view ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Car Details and Bidding */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">{carDetails.title}</h1>
            <p className="text-primary font-bold text-3xl mb-4">
              KSh {carDetails.price.toLocaleString()}
            </p>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{carDetails.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>{carDetails.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{carDetails.location}</span>
              </div>
            </div>

            <button
              onClick={() => setIsBidModalOpen(true)}
              className={`w-full font-medium py-3 rounded-lg transition-colors mb-4 ${
                bidPlaced 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-primary hover:bg-primary-hover text-black'
              }`}
            >
              {bidPlaced ? 'Bid Placed Successfully' : 'Place Bid'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Bidding ends in 23 hours
            </p>
          </div>

          <BidHistory bids={bidHistory} />
        </div>
      </div>

      {/* Description and Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Description</h2>
            <p className="text-gray-600">{carDetails.description}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {carDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-lg mb-4">Inspection Report</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Exterior</span>
              <span className="text-green-600">{carDetails.inspectionReport.exterior}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Interior</span>
              <span className="text-green-600">{carDetails.inspectionReport.interior}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mechanical</span>
              <span className="text-green-600">{carDetails.inspectionReport.mechanical}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Last inspected on {carDetails.inspectionReport.lastInspection}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        carTitle={carDetails.title}
        currentPrice={carDetails.price}
        onSubmitBid={handleBidSubmit}
      />
    </div>
  );
}