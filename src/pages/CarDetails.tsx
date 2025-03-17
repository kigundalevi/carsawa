import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Gauge, MapPin, Shield, PenTool as Tool, Award } from 'lucide-react';
import { BidModal } from '../components/bidding/BidModal';
import { BidHistory } from '../components/bidding/BidHistory';

// Sample data - In a real app, this would come from an API
const carDetails = {
  id: '1',
  title: '2020 Toyota Land Cruiser V8',
  year: 2020,
  price: 12500000,
  location: 'Nairobi, Kenya',
  mileage: 45000,
  condition: 'Excellent' as const,
  description: 'Fully loaded 2020 Toyota Land Cruiser V8 with leather interior, sunroof, and all the premium features. Single owner, full service history available.',
  features: [
    'Leather Interior',
    'Sunroof',
    'Navigation System',
    'Bluetooth',
    'Reverse Camera',
    '360° Camera System',
    'Heated Seats',
    'Cruise Control'
  ],
  images: [
    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1669224088511-b2e78641feb9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1669224088499-4996ba8fbb5a?auto=format&fit=crop&w=1200&q=80'
  ],
  inspectionReport: {
    exterior: 'Excellent',
    interior: 'Excellent',
    mechanical: 'Excellent',
    lastInspection: '2024-02-15'
  }
};

const bidHistory = [
  { id: '1', amount: 12300000, bidder: 'John D.', time: '2 hours ago' },
  { id: '2', amount: 12200000, bidder: 'Sarah M.', time: '3 hours ago' },
  { id: '3', amount: 12000000, bidder: 'Mike K.', time: '5 hours ago' }
];

export function CarDetails() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const { id } = useParams();

  const handleBidSubmit = (amount: number) => {
    console.log('Bid submitted:', amount);
    // In a real app, this would make an API call
  };

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
              className="w-full bg-primary hover:bg-primary-hover text-black font-medium py-3 rounded-lg transition-colors mb-4"
            >
              Place Bid
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