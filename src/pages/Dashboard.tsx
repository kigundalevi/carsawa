import React from 'react';
import { Car, Gavel, TrendingUp, DollarSign } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { BidCard } from '../components/dashboard/BidCard';
import { ActivityCard } from '../components/dashboard/ActivityCard';

// Sample data - In a real app, this would come from an API
const activeBids = [
  {
    id: '1',
    carName: '2019 Toyota Fortuner',
    amount: 3500000,
    timeLeft: '2h 15m',
    image: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    carName: '2020 Honda CR-V',
    amount: 2800000,
    timeLeft: '4h 30m',
    image: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=300&q=80'
  }
];

const recentActivities = [
  {
    id: '1',
    message: 'New bid placed on 2019 Toyota Fortuner',
    time: '15 minutes ago',
    type: 'bid' as const
  },
  {
    id: '2',
    message: 'Successfully sold 2018 Mazda CX-5',
    time: '2 hours ago',
    type: 'sale' as const
  },
  {
    id: '3',
    message: 'Listed 2021 BMW X3 for sale',
    time: '4 hours ago',
    type: 'listing' as const
  }
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Listings"
          value="24"
          icon={Car}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Bids"
          value="8"
          icon={Gavel}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Sales This Month"
          value="6"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Revenue (KSh)"
          value="4.2M"
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