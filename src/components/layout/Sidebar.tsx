import { 
  LayoutDashboard, 
  ClipboardList, 
  UserCircle,
  ChevronLeft,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

interface DealerProfile {
  name: string;
  profileImage: string;
}

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', to: '/inventory', icon: ClipboardList },
];

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<DealerProfile>({
    name: 'Loading...',
    profileImage: '/default-avatar.png'
  });
  
  // Listen for profile update events
  useEffect(() => {
    // Define the event handler for profile updates
    const handleProfileUpdate = (event: Event) => {
      // Type assertion for the custom event
      const customEvent = event as CustomEvent<{ timestamp: number, profileImage: string }>;
      
      // If the event contains a new profile image, update it immediately without a fetch
      if (customEvent.detail?.profileImage) {
        setDealer(prev => ({
          ...prev,
          profileImage: customEvent.detail.profileImage
        }));
      } else {
        // Otherwise fetch the full profile
        fetchProfile();
      }
    };
    
    // Fetch profile on initial render
    fetchProfile();
    
    // Add event listener for profileUpdated events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Clean up event listener
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);
  
  // Function to fetch profile data
  const fetchProfile = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setDealer({
        name: userData.name,
        profileImage: userData.profileImage
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // Optionally handle error, e.g., redirect to login
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

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
            src={dealer.profileImage || '/default-avatar.png'} 
            alt="Dealer avatar" 
            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
          />
          <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-secondary"></div>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3 text-center">
            <h3 className="text-primary font-medium">{dealer.name}</h3>
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
          onClick={handleLogout}
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