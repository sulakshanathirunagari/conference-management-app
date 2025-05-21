import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User, 
  Download, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

const AttendeeEventDetail = ({ event, onBackClick, onRegisterClick, onJoinQA }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSession, setExpandedSession] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Toggle expanded session
  const toggleSession = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
    }
  };

  // Handle material download
  const handleDownload = (material) => {
    // For demo purposes we just open the URL in a new tab
    if (material && material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Event banner */}
      <div className="relative h-64 bg-green-100">
        {event?.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-24 h-24 text-green-300" />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <button
            onClick={onBackClick}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
            title="Back to Events"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Event title */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">{event?.title}</h1>
        {event?.status === "published" && (
          <div className="mt-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Registration Open
            </span>
          </div>
        )}
      </div>
      
      {/* Navigation tabs */}
      <div className="border-b">
        <nav className="flex">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'overview' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'sessions' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions {event?.sessions && `(${event.sessions.length || 0})`}
          </button>
          
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'speakers' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('speakers')}
          >
            Speakers {event?.speakers && `(${event.speakers.length || 0})`}
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Date</h3>
                </div>
                <p className="text-gray-800">
                  {formatDate(event?.startDate)}
                  {event?.startDate !== event?.endDate && (
                    <> - {formatDate(event?.endDate)}</>
                  )}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Location</h3>
                </div>
                <p className="text-gray-800">{event?.location}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">Attendees</h3>
                </div>
                <p className="text-gray-800">
                  {event?.attendees ? event.attendees.length : 0} / {event?.capacity || 'Unlimited'}
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">About This Event</h3>
              <div className="prose text-gray-700 max-w-none">
                {event?.description}
              </div>
            </div>
            
            {/* Price info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Registration</h3>
              <p className="text-gray-700 mb-4">
                {event?.price === 0 ? (
                  "This is a free event. Register to secure your spot!"
                ) : (
                  `Tickets start at $${event?.price?.toFixed(2) || '0.00'}`
                )}
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => onRegisterClick(event?._id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
                >
                  {event?.price === 0 ? 'Register Now' : 'Get Tickets'}
                </button>
                
                <button
                  onClick={onBackClick}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
                >
                  Back to Events
                </button>
              </div>
            </div>
            
            {/* Tags */}
            {event?.tags && event.tags.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sessions tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Event Schedule</h3>
            
            {!event?.sessions || event.sessions.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No sessions have been scheduled for this event yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {event.sessions.map(session => (
                  <div key={session._id} className="border rounded-lg overflow-hidden">
                    {/* Session header */}
                    <div 
                      className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSession(session._id)}
                    >
                      <div className="flex flex-col">
                        <h4 className="font-medium text-gray-800">{session.title}</h4>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(session.startTime)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                      </div>
                      
                      <div>
                        {expandedSession === session._id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Session details (expandable) */}
                    {expandedSession === session._id && (
                      <div className="p-4">
                        <div className="mb-4">
                          <p className="text-gray-700">{session.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Location</p>
                              <p className="text-sm text-gray-600">{session.location}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <User className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Speaker</p>
                              <p className="text-sm text-gray-600">
                                {session.speaker?.fullName || "TBA"}
                                {session.speaker?.organization && ` (${session.speaker.organization})`}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Session materials (if available) */}
                        {session.resources && session.resources.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Materials</h5>
                            <div className="space-y-2">
                              {session.resources.map((material, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <div className="flex items-center">
                                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm">{material.fileName || "Document"}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDownload(material)}
                                    className="p-1 text-green-600 hover:text-green-800"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Link to Q&A (if session is active/upcoming) */}
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {session.capacity > 0 ? `Capacity: ${session.capacity}` : 'Unlimited capacity'}
                          </span>
                          
                          <button
                            onClick={() => onJoinQA(event._id, session._id)}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Join Q&A
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Speakers tab */}
        {activeTab === 'speakers' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Event Speakers</h3>
            
            {!event?.speakers || event.speakers.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No speakers have been announced for this event yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.speakers.map(speaker => (
                  <div key={speaker._id} className="border rounded-lg overflow-hidden p-4">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        {speaker.profileImage ? (
                          <img 
                            src={speaker.profileImage} 
                            alt={speaker.fullName} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-green-600" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800">{speaker.fullName}</h4>
                        {speaker.organization && (
                          <p className="text-sm text-gray-600">{speaker.organization}</p>
                        )}
                        {speaker.bio && (
                          <p className="text-sm text-gray-600 mt-2">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sessions by this speaker */}
                    {event.sessions && event.sessions.filter(s => s.speaker?._id === speaker._id).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Sessions</h5>
                        <ul className="space-y-1">
                          {event.sessions
                            .filter(s => s.speaker?._id === speaker._id)
                            .map(session => (
                              <li key={session._id} className="text-sm text-gray-600">
                                • {session.title} ({formatTime(session.startTime)})
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeEventDetail;