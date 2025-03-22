import { useState, useEffect } from 'react';
import { Car, Bell, Plus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationsDropdown } from '../notifications/Notifications';
import { notificationAPI } from '../../services/api';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch unread notification count from API
    const fetchNotificationCount = async () => {
      try {
        const count = await notificationAPI.getUnreadCount();
        setNotificationCount(count);
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }
    };
    
    fetchNotificationCount();
    
    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(fetchNotificationCount, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // If opening notifications, reset the count
    if (!showNotifications) {
      setNotificationCount(0);
    }
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-black fixed top-0 left-0 right-0 z-50 flex items-center px-4 shadow-md">
      <button 
        onClick={toggleSidebar}
        className="text-gray-300 hover:text-primary transition-colors mr-2 md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-2 ml-2">
        <Car className="w-8 h-8 text-primary" />
        <span className="text-primary text-xl font-bold">Carsawa</span>
      </div>
      
      <div className="flex items-center ml-auto gap-4">
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="text-primary hover:text-primary-hover transition-colors relative p-2"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsDropdown onClose={closeNotifications} />
          )}
        </div>
        
        <Link 
          to="/list-car" 
          className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">List Your Car</span>
        </Link>
      </div>
    </header>
  );
}