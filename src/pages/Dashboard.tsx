import { useState, useEffect } from 'react';
import { Car, Gavel, TrendingUp, DollarSign, Loader } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { BidCard } from '../components/dashboard/BidCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';
import { carAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Bid {
  id: string;
  carId: string;
  carName: string;
  amount: number;
  timeLeft: string;
  image: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

interface Activity {
  id: string;
  message: string;
  time: string;
  type: 'bid' | 'sale' | 'listing';
}

interface CarListing {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'Available' | 'Sold' | 'Reserved';
  createdAt: string;
  // other properties as needed
}

export function Dashboard() {
  const { user } = useAuth();
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 'coming soon',
    salesThisMonth: 6,
    revenue: '4.2M'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        // Fetch car listings from API
        const response = await carAPI.getMyListings(user._id);
        
        // Process the response
        let carListings: CarListing[] = [];
        if (Array.isArray(response)) {
          carListings = response;
        } else if (response && response.cars && Array.isArray(response.cars)) {
          carListings = response.cars;
        }
        
        // Count available and sold cars
        const availableCars = carListings.filter(car => car.status === 'Available').length;
        const soldCars = carListings.filter(car => car.status === 'Sold');
        const soldCount = soldCars.length;
        
        // Calculate revenue from sold cars
        const calculateRevenue = () => {
          // Calculate total revenue from all sold cars
          const totalRevenue = soldCars.reduce((total, car) => total + car.price, 0);
          
          // Format revenue based on magnitude
          if (totalRevenue >= 1000000) {
            return (totalRevenue / 1000000).toFixed(1) + 'M';
          } else if (totalRevenue >= 1000) {
            return (totalRevenue / 1000).toFixed(1) + 'K';
          } else {
            return totalRevenue.toString();
          }
        };
        
        // Calculate sales for current month
        const calculateCurrentMonthSales = () => {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          // Filter cars sold in the current month
          return soldCars.filter(car => {
            const soldDate = new Date(car.createdAt);
            return soldDate.getMonth() === currentMonth && soldDate.getFullYear() === currentYear;
          }).length;
        };
        
        const currentMonthSales = calculateCurrentMonthSales();
        const revenue = calculateRevenue();
        
        // Load active bids from localStorage
        const storedBids = localStorage.getItem('activeBids');
        const parsedBids = storedBids ? JSON.parse(storedBids) : [];
        setActiveBids(parsedBids);
        
        // Load recent activities from localStorage
        const storedActivities = localStorage.getItem('recentActivities');
        if (storedActivities) {
          setRecentActivities(JSON.parse(storedActivities));
        } else {
          // Set default activities if none exist
          const defaultActivities = [
            {
              id: '1',
              message: 'Welcome to your dashboard',
              time: 'Just now',
              type: 'listing' as const
            }
          ];
          setRecentActivities(defaultActivities);
          localStorage.setItem('recentActivities', JSON.stringify(defaultActivities));
        }
        
        // Update stats with real data
        setStats({
          totalListings: carListings.length,
          activeBids: parsedBids.length,
          salesThisMonth: currentMonthSales,
          revenue: revenue
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Listings"
          value={stats.totalListings.toString()}
          icon={Car}
          trend={{ value: 12, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Bids"
          value={stats.activeBids.toString()}
          icon={Gavel}
          trend={{ value: 5, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Sales This Month"
          value={stats.salesThisMonth.toString()}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: false }}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenue (KSh)"
          value={stats.revenue}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BidCard title="Active Bids" bids={activeBids} />
        <ActivityCard activities={recentActivities} />
      </div>
    </div>
  );
}