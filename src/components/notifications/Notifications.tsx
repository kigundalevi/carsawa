import { useState, useEffect, useRef } from 'react';
import { Bell, X, Car, CreditCard, ShoppingBag, Check, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../../services/api';

interface Notification {
  id: string;
  type: 'car-added' | 'car-updated' | 'car-sold' | 'car-purchased' | 'car-deleted';
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

interface NotificationsDropdownProps {
  onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationAPI.getNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Close dropdown when clicking outside
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

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      // Update local state to mark all as read
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Less than 24 hours ago
      if (diffInHours < 1) {
        // Less than 1 hour ago
        const minutes = Math.floor(diffInMs / (1000 * 60));
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // More than 2 days ago
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'car-added':
        return <Car className="w-5 h-5 text-green-500" />;
      case 'car-updated':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'car-sold':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'car-purchased':
        return <ShoppingBag className="w-5 h-5 text-orange-500" />;
      case 'car-deleted':
        return <Car className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Mark all as read
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex flex-col items-center justify-center">
            <Loader className="w-6 h-6 animate-spin text-primary mb-2" />
            <p className="text-gray-500 text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-primary hover:text-primary-hover text-sm"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-gray-800 font-medium">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    {notification.relatedId && (
                      <Link 
                        to={`/car/${notification.relatedId}`}
                        className="text-xs text-primary hover:text-primary-hover"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
