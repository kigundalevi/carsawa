import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Car, CreditCard, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  message: string;
  time: string;
  type: 'listing' | 'bid' | 'sale';
  read: boolean;
}

export function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load notifications from localStorage
    const recentActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    
    // Convert activities to notifications with read status
    const notificationsData = recentActivities.map((activity: any) => ({
      ...activity,
      read: false
    }));
    
    setNotifications(notificationsData);
    
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    
    // Update localStorage
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'bid':
        return <Gavel className="w-5 h-5 text-yellow-500" />;
      case 'sale':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Mark all as read
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${notification.read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-gray-50">
        <Link 
          to="/notifications"
          className="text-xs text-primary hover:text-primary-hover block text-center"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
