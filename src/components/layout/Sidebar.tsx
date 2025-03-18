import { 
  LayoutDashboard, 
  Car, 
  ClipboardList, 
  Gavel, 
  Receipt, 
  UserCircle,
  ChevronLeft,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

interface DealerProfile {
  name: string;
  email: string;
  avatar: string;
}

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Car Listings', to: '/listings', icon: Car },
  { name: 'Inventory', to: '/inventory', icon: ClipboardList },
  { name: 'Bids', to: '/bids', icon: Gavel },
  { name: 'Transactions', to: '/transactions', icon: Receipt },
];

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const [dealer, setDealer] = useState<DealerProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('dealerProfile');
    if (savedProfile) {
      setDealer(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <div className={cn(
      "bg-secondary min-h-screen fixed left-0 top-0 pt-16 shadow-lg transition-all duration-300 z-10",
      isCollapsed ? "w-20" : "w-64",
      "md:translate-x-0",
      "transform",
      "md:block"
    )}>
      <div className="absolute right-0 top-20 bg-secondary rounded-r-md p-1 cursor-pointer hidden md:block"
        onClick={toggleCollapse}
      >
        {isCollapsed ? 
          <ChevronRight className="w-4 h-4 text-gray-300" /> : 
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        }
      </div>

      <div className={cn(
        "flex flex-col items-center px-4 py-6 border-b border-gray-700",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <div className="relative">
          <img 
            src={dealer.avatar} 
            alt="Dealer avatar" 
            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
          />
          <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-secondary"></div>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3 text-center">
            <h3 className="text-primary font-medium">{dealer.name}</h3>
            <p className="text-gray-400 text-xs mt-1">{dealer.email}</p>
            <NavLink
              to="/profile"
              className="mt-3 text-xs text-gray-300 hover:text-primary flex items-center justify-center gap-1"
            >
              <Settings className="w-3 h-3" />
              Manage Profile
            </NavLink>
          </div>
        )}
      </div>

      <nav className={cn("mt-6", isCollapsed ? "px-2" : "px-4")}>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors mb-1",
                "hover:bg-secondary-light",
                isCollapsed ? "justify-center px-2" : "px-4",
                isActive
                  ? "text-primary bg-secondary-light"
                  : "text-gray-300"
              )
            }
            title={isCollapsed ? item.name : ""}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-6 absolute bottom-0 left-0 right-0">
        <NavLink
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors mb-1",
            "hover:bg-secondary-light text-gray-300",
            isCollapsed ? "justify-center px-2" : "px-4"
          )}
          title={isCollapsed ? "Profile" : ""}
        >
          <UserCircle className="w-5 h-5" />
          {!isCollapsed && "Profile"}
        </NavLink>
        
        <button
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors w-full",
            "hover:bg-secondary-light text-gray-300",
            isCollapsed ? "justify-center px-2" : "px-4"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}