// src/components/events/SessionList.jsx
import React from 'react';
import { Clock, MapPin, User, Edit, Trash } from 'lucide-react';

const SessionList = ({ sessions, onEdit, onDelete }) => {
  // Format time for display
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No sessions have been added to this event yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div key={session._id || index} className="border rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {formatDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(session)} 
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit session"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(session._id)} 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete session"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{session.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-1" />
                <span className="font-medium">
                  {session.speaker?.fullName || "Unknown Speaker"}
                </span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span>{session.location}</span>
              </div>
              
              {session.capacity > 0 && (
                <div className="flex items-center">
                  <span>Capacity: {session.capacity}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionList;