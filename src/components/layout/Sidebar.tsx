import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  ClipboardList, 
  Gavel, 
  Receipt, 
  UserCircle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Car Listings', to: '/listings', icon: Car },
  { name: 'Inventory', to: '/inventory', icon: ClipboardList },
  { name: 'Bids', to: '/bids', icon: Gavel },
  { name: 'Transactions', to: '/transactions', icon: Receipt },
  { name: 'Profile', to: '/profile', icon: UserCircle },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-secondary min-h-screen fixed left-0 top-0 pt-16">
      <nav className="mt-8 px-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors',
                'hover:bg-secondary-light',
                isActive
                  ? 'text-primary bg-secondary-light'
                  : 'text-gray-300'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}