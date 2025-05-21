import React, { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, RefreshCw, Calendar, CheckCircle } from 'lucide-react';

const AttendeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fetch user and notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // First get current user
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userResponse.json();
        setCurrentUser(userData.user);
        
        // Then fetch notifications
        const notifResponse = await fetch('http://localhost:5000/api/notifications/my', {
          credentials: 'include'
        });
        
        if (!notifResponse.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const notifData = await notifResponse.json();
        setNotifications(notifData.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId
              ? {
                  ...notification,
                  isRead: {
                    ...notification.isRead,
                    [currentUser._id]: true
                  }
                }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notif => !notif.isRead[currentUser._id])
        .map(notif => notif._id);
      
      if (unreadIds.length === 0) return;
      
      // Create promises for all mark-as-read requests
      const markPromises = unreadIds.map(id => 
        fetch(`http://localhost:5000/api/notifications/${id}/read`, {
          method: 'PUT',
          credentials: 'include'
        })
      );
      
      // Execute all promises
      await Promise.all(markPromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: {
            ...notification.isRead,
            [currentUser._id]: true
          }
        }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'update':
        return <RefreshCw className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Get background color based on notification type
  const getNotificationBg = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'urgent':
        return 'bg-red-50';
      case 'update':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        {error}
      </div>
    );
  }
  
  // Count unread notifications
  const unreadCount = notifications.filter(notif => !notif.isRead[currentUser?._id]).length;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-green-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Your Notifications</h2>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-2 py-1 bg-white text-green-600 text-sm rounded-lg hover:bg-green-50"
          >
            Mark All as Read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Notifications Yet</h3>
          <p className="text-gray-600">
            You will receive notifications about event updates, changes, and other important information here.
          </p>
        </div>
      ) : (
        <div>
          {/* Unread notifications section */}
          {unreadCount > 0 && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-3">New ({unreadCount})</h3>
              <div className="space-y-3">
                {notifications
                  .filter(notif => !notif.isRead[currentUser._id])
                  .map(notification => (
                    <div 
                      key={notification._id} 
                      className={`${getNotificationBg(notification.type)} p-4 rounded-lg border-l-4 ${
                        notification.type === 'info' ? 'border-blue-500' :
                        notification.type === 'warning' ? 'border-yellow-500' :
                        notification.type === 'urgent' ? 'border-red-500' :
                        notification.type === 'update' ? 'border-green-500' :
                        'border-gray-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-gray-800">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-gray-500 hover:text-gray-700 ml-2"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-gray-700 mt-1">{notification.message}</p>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            </div>
                            {notification.event && (
                              <a 
                                href={`/events/${notification.event._id}`}
                                className="text-green-600 hover:text-green-800"
                              >
                                {notification.event.title}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Previously read notifications */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Earlier</h3>
            <div className="space-y-3">
              {notifications
                .filter(notif => notif.isRead[currentUser._id])
                .map(notification => (
                  <div 
                    key={notification._id} 
                    className={`${getNotificationBg(notification.type)} p-4 rounded-lg opacity-75`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {notification.title}
                        </h4>
                        <p className="text-gray-700 mt-1">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          {notification.event && (
                            <a 
                              href={`/events/${notification.event._id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              {notification.event.title}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeNotifications;