// components/notifications/NotificationPanel.jsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationList from './NotificationList';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  
  // Fetch notifications
  // Fix in NotificationPanel.jsx - make sure the API endpoint is correct
const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Make sure this URL matches the route in notificationRoutes.js
      const response = await fetch('http://localhost:5000/api/notifications/my', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.data || []);
      
      // Calculate unread count
      const userId = localStorage.getItem('userId');
      const unreadNotifications = data.data.filter(
        notification => !notification.isRead[userId]
      );
      setUnreadCount(unreadNotifications.length);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load notifications on mount and set up refresh interval
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Update local state to reflect change
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId
              ? {
                  ...notification,
                  isRead: {
                    ...notification.isRead,
                    [localStorage.getItem('userId')]: true
                  }
                }
              : notification
          )
        );
        
        // Decrement unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Toggle notification panel
  const togglePanel = () => {
    setShowPanel(prev => !prev);
  };
  
  return (
    <div className="relative">
      {/* Bell icon with counter badge */}
      <button 
        onClick={togglePanel}
        className="p-2 relative"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              <span className="text-sm text-gray-500">
                {unreadCount} unread
              </span>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">
                {error}
              </div>
            ) : (
              <NotificationList 
                notifications={notifications} 
                onMarkAsRead={handleMarkAsRead} 
              />
            )}
          </div>
          
          <div className="p-3 border-t text-center">
            <a href="/notifications" className="text-sm text-purple-600 hover:text-purple-700">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;