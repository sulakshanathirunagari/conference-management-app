import React from 'react';
import { Calendar, MapPin, Users, Edit, Trash, Eye, AlertCircle } from 'lucide-react';

const EventList = ({ events, loading, onEdit, onView, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Events Found</h3>
        <p className="text-gray-600">You haven't created any events yet. Click the "Create Event" button to get started.</p>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Event banner image */}
          <div className="relative h-48 bg-purple-100">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-12 h-12 text-purple-300" />
              </div>
            )}
            
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Event details */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{event.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <Calendar className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </span>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{event.location}</span>
              </div>
              
              <div className="flex items-start">
                <Users className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {event.attendees ? event.attendees.length : 0} / {event.capacity} attendees
                </span>
              </div>
            </div>
            
            {/* Event description preview */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {event.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => onView(event)}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-full"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onEdit(event)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full"
                title="Edit Event"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onDelete(event._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full"
                title="Delete Event"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;