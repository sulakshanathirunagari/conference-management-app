// components/notifications/NotificationList.jsx
import React from 'react';
import { Info, AlertTriangle, Bell, RefreshCw, CheckCircle } from 'lucide-react';

const NotificationList = ({ notifications, onMarkAsRead }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No notifications to display</p>
      </div>
    );
  }
  
  // Helper function to get icon based on notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'update':
        return <RefreshCw className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  // Helper function to get background color based on notification type
  const getTypeBackground = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50';
      case 'urgent':
        return 'bg-red-50';
      case 'update':
        return 'bg-green-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };
  
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div 
          key={notification._id} 
          className={`${getTypeBackground(notification.type)} p-4 rounded-lg border shadow-sm relative ${
            notification.isRead[localStorage.getItem('userId')] ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              {getTypeIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <p className="text-gray-700 mt-1">{notification.message}</p>
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div>
                  <span>From: {notification.sender?.fullName || 'System'}</span>
                  <span className="mx-2">•</span>
                  <span>Event: {notification.event?.title}</span>
                </div>
                <div>
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            {!notification.isRead[localStorage.getItem('userId')] && (
              <button 
                onClick={() => onMarkAsRead(notification._id)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Mark as read"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;