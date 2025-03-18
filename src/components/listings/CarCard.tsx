import { MapPin, Calendar, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface CarCardProps {
  car: {
    id: string;
    title: string;
    year: number;
    price: number;
    location: string;
    mileage: number;
    image: string;
    condition: 'Excellent' | 'Good' | 'Fair';
  };
  className?: string;
}

export function CarCard({ car, className }: CarCardProps) {
  const handleViewDetails = () => {
    // Store the car details in localStorage for the CarDetails page
    localStorage.setItem(`car-${car.id}`, JSON.stringify(car));
  };

  return (
    <div className={cn("bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="relative aspect-[16/9]">
        <img
          src={car.image}
          alt={car.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            {
              'bg-green-100 text-green-800': car.condition === 'Excellent',
              'bg-blue-100 text-blue-800': car.condition === 'Good',
              'bg-yellow-100 text-yellow-800': car.condition === 'Fair',
            }
          )}>
            {car.condition}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{car.title}</h3>
        <p className="text-primary font-bold text-xl mb-4">
          KSh {car.price.toLocaleString()}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
        </div>
        
        <Link
          to={`/car/${car.id}`}
          className="block w-full mt-4 bg-primary hover:bg-primary-hover text-black font-medium py-2 rounded-lg transition-colors text-center"
          onClick={handleViewDetails}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}