import React, { useState, useEffect } from 'react';
import { Search, User, Briefcase, Mail } from 'lucide-react';

const SpeakersList = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch speakers data when component mounts
  useEffect(() => {
    const fetchSpeakers = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch all events to extract speakers
        const response = await fetch('http://localhost:5000/api/events?status=published', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Extract unique speakers from all events
        const uniqueSpeakers = new Map();
        
        data.data.forEach(event => {
          if (event.speakers && event.speakers.length > 0) {
            event.speakers.forEach(speaker => {
              // Store speakers by ID to remove duplicates
              if (speaker._id && !uniqueSpeakers.has(speaker._id)) {
                // Add event context to speaker
                speaker.events = [{
                  _id: event._id,
                  title: event.title,
                  startDate: event.startDate
                }];
                uniqueSpeakers.set(speaker._id, speaker);
              } else if (speaker._id) {
                // Add this event to existing speaker's events list
                const existingSpeaker = uniqueSpeakers.get(speaker._id);
                const eventExists = existingSpeaker.events.some(e => e._id === event._id);
                
                if (!eventExists) {
                  existingSpeaker.events.push({
                    _id: event._id,
                    title: event.title,
                    startDate: event.startDate
                  });
                }
              }
            });
          }
          
          // Also check sessions for speakers
          if (event.sessions && event.sessions.length > 0) {
            event.sessions.forEach(session => {
              if (session.speaker && session.speaker._id && !uniqueSpeakers.has(session.speaker._id)) {
                // Add session and event context
                const speakerWithContext = {
                  ...session.speaker,
                  events: [{
                    _id: event._id,
                    title: event.title,
                    startDate: event.startDate
                  }],
                  sessions: [{
                    _id: session._id,
                    title: session.title,
                    startTime: session.startTime,
                    eventId: event._id,
                    eventTitle: event.title
                  }]
                };
                uniqueSpeakers.set(session.speaker._id, speakerWithContext);
              } else if (session.speaker && session.speaker._id) {
                // Add this session to existing speaker
                const existingSpeaker = uniqueSpeakers.get(session.speaker._id);
                
                // Add event if not already present
                const eventExists = existingSpeaker.events.some(e => e._id === event._id);
                if (!eventExists) {
                  existingSpeaker.events.push({
                    _id: event._id,
                    title: event.title,
                    startDate: event.startDate
                  });
                }
                
                // Initialize sessions array if needed
                if (!existingSpeaker.sessions) {
                  existingSpeaker.sessions = [];
                }
                
                // Add session if not already present
                const sessionExists = existingSpeaker.sessions.some(s => s._id === session._id);
                if (!sessionExists) {
                  existingSpeaker.sessions.push({
                    _id: session._id,
                    title: session.title,
                    startTime: session.startTime,
                    eventId: event._id,
                    eventTitle: event.title
                  });
                }
              }
            });
          }
        });
        
        // Convert map to array and sort by name
        const speakersArray = Array.from(uniqueSpeakers.values()).sort((a, b) => {
          return a.fullName.localeCompare(b.fullName);
        });
        
        setSpeakers(speakersArray);
      } catch (err) {
        console.error('Error fetching speakers:', err);
        setError('Failed to load speakers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpeakers();
  }, []);
  
  // Filter speakers based on search term
  const filteredSpeakers = speakers.filter(speaker => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      speaker.fullName.toLowerCase().includes(term) ||
      (speaker.organization && speaker.organization.toLowerCase().includes(term)) ||
      (speaker.bio && speaker.bio.toLowerCase().includes(term))
    );
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric' 
    });
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
  
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search speakers by name, organization, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      
      {/* Speakers Grid */}
      {filteredSpeakers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Speakers Found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No speakers match your search for "${searchTerm}"` 
              : "There are no speakers registered for upcoming events."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map(speaker => (
            <div key={speaker._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
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
                    <h3 className="font-bold text-gray-800">{speaker.fullName}</h3>
                    {speaker.organization && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{speaker.organization}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {speaker.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{speaker.bio}</p>
                )}
                
                {/* Upcoming events & sessions */}
                {speaker.sessions && speaker.sessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Sessions:</h4>
                    <ul className="space-y-2">
                      {speaker.sessions
                        .filter(session => new Date(session.startTime) > new Date())
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                        .slice(0, 3)
                        .map(session => (
                          <li key={session._id} className="text-sm">
                            <a 
                              href={`/events/${session.eventId}`}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              {session.title}
                            </a>
                            <div className="text-gray-500 text-xs">
                              {formatDate(session.startTime)} • {session.eventTitle}
                            </div>
                          </li>
                        ))}
                        
                      {speaker.sessions.filter(session => new Date(session.startTime) > new Date()).length > 3 && (
                        <li className="text-sm text-gray-500">
                          + {speaker.sessions.filter(session => new Date(session.startTime) > new Date()).length - 3} more sessions
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Contact (if available) */}
                {speaker.email && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={`mailto:${speaker.email}`}
                      className="flex items-center text-sm text-green-600 hover:text-green-800"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contact Speaker
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeakersList;