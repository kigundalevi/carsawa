import { useState, useEffect } from 'react';
import { Car, Gavel, TrendingUp, DollarSign } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { BidCard } from '../components/dashboard/BidCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';

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

export function Dashboard() {
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBids: 0,
    salesThisMonth: 6,
    revenue: '4.2M'
  });

  useEffect(() => {
    // Load active bids from localStorage
    const storedBids = localStorage.getItem('activeBids');
    if (storedBids) {
      setActiveBids(JSON.parse(storedBids));
    }

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

    // Count total listings from localStorage
    const carInventory = JSON.parse(localStorage.getItem('carInventory') || '[]');
    
    // Update stats
    setStats({
      totalListings: carInventory.length,
      activeBids: storedBids ? JSON.parse(storedBids).length : 0,
      salesThisMonth: 6,
      revenue: '4.2M'
    });
  }, []);

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
        />
        <StatCard
          title="Active Bids"
          value={stats.activeBids.toString()}
          icon={Gavel}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Sales This Month"
          value={stats.salesThisMonth.toString()}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Revenue (KSh)"
          value={stats.revenue}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BidCard title="Active Bids" bids={activeBids} />
        <ActivityCard activities={recentActivities} />
      </div>
    </div>
  );
}