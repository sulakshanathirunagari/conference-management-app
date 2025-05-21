import React, { useState, useEffect } from 'react';
import { Calendar, Users, Bell, LogOut, Search, User, Settings , Mail} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EventManagement from '../components/events/EventManagement';
import NotificationForm from '../components/notifications/NotificationForm';
import NotificationPanel from '../components/notifications/NotificationPanel';
import ProfilePage from '../components/profile/ProfilePage';

const OrganizerDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState([]);
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalEvents: 0,
    totalSessions: 0,
    totalSpeakers: 0
  });
  const [chartData, setChartData] = useState({
    events: [],
    sessions: [],
    speakers: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  
  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        setCurrentUser(data.user);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Fetch organizer's data when component mounts
  useEffect(() => {
    fetchDashboardData();
    fetchEvents();
    fetchSpeakers();
  }, []);

  // Fetch dashboard data for KPIs and charts
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await fetch('http://localhost:5000/api/events/my/events?role=organizer', {
        credentials: 'include'
      });
      
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events data');
      }
      
      const eventsData = await eventsResponse.json();
      const events = eventsData.data || [];
      
      // Calculate dashboard metrics
      let totalSessions = 0;
      let speakerSet = new Set();
      
      // Count total sessions and unique speakers
      events.forEach(event => {
        totalSessions += event.sessions ? event.sessions.length : 0;
        
        if (event.speakers && event.speakers.length > 0) {
          event.speakers.forEach(speaker => {
            speakerSet.add(speaker._id || speaker);
          });
        }
      });
      
      // Set dashboard metrics
      setDashboardMetrics({
        totalEvents: events.length,
        totalSessions: totalSessions,
        totalSpeakers: speakerSet.size
      });
      
      // Generate chart data for events over time
      const eventsByMonth = {};
      const sessionsByMonth = {};
      const speakersByMonth = {};
      
      // Initialize month buckets for the last 6 months
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });
        eventsByMonth[monthKey] = 0;
        sessionsByMonth[monthKey] = 0;
        speakersByMonth[monthKey] = new Set();
      }
      
      // Populate data for each month
      events.forEach(event => {
        const eventDate = new Date(event.startDate);
        const monthKey = eventDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (eventsByMonth[monthKey] !== undefined) {
          eventsByMonth[monthKey]++;
          
          // Add sessions count
          sessionsByMonth[monthKey] += event.sessions ? event.sessions.length : 0;
          
          // Add unique speakers
          if (event.speakers && event.speakers.length > 0) {
            event.speakers.forEach(speaker => {
              speakersByMonth[monthKey].add(speaker._id || speaker);
            });
          }
        }
      });
      
      // Convert to chart data format
      const chartData = {
        events: Object.entries(eventsByMonth).map(([name, value]) => ({ name, value })),
        sessions: Object.entries(sessionsByMonth).map(([name, value]) => ({ name, value })),
        speakers: Object.entries(speakersByMonth).map(([name, set]) => ({ name, value: set.size }))
      };
      
      setChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch organizer's events
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events/my/events?role=organizer', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
        
        // Select the first event by default for sending notifications
        if (data.data && data.data.length > 0) {
          setSelectedEvent(data.data[0]);
          // Fetch notifications for this event
          fetchEventNotifications(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    }
  };
  
  // Fetch available speakers
  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/users/speakers/available', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch speakers');
      }
      
      const data = await response.json();
      setSpeakers(data.data || []);
      setFilteredSpeakers(data.data || []);
      
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setError('Failed to load speakers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch notifications for a specific event
  const fetchEventNotifications = async (eventId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/notifications/event/${eventId}?page=${pagination.page}&limit=${pagination.limit}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setEventNotifications(data.data || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      });
      
    } catch (err) {
      console.error('Error fetching event notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle event change in dropdown
  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find(evt => evt._id === eventId);
    setSelectedEvent(event);
    
    if (event) {
      // Reset pagination and fetch notifications for the selected event
      setPagination({ ...pagination, page: 1 });
      fetchEventNotifications(eventId);
    }
  };
  
  // Function to handle speaker search
  const handleSpeakerSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSpeakerSearch(searchTerm);
    
    if (!searchTerm) {
      setFilteredSpeakers(speakers);
      return;
    }
    
    const filtered = speakers.filter(speaker => 
      speaker.fullName.toLowerCase().includes(searchTerm) || 
      (speaker.organization && speaker.organization.toLowerCase().includes(searchTerm)) ||
      (speaker.bio && speaker.bio.toLowerCase().includes(searchTerm))
    );
    
    setFilteredSpeakers(filtered);
  };
  
  // Function to handle notification creation success
  const handleNotificationSuccess = () => {
    setShowNotificationForm(false);
    
    // Refresh notifications list
    if (selectedEvent) {
      fetchEventNotifications(selectedEvent._id);
    }
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
      
      if (selectedEvent) {
        fetchEventNotifications(selectedEvent._id);
      }
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to handle profile update
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with simplified navigation */}
      <div className="w-64 bg-purple-700 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Conference Hub</h1>
          <p className="text-purple-200 text-sm">Organizer Panel</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-3 bg-purple-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                {currentUser ? (
                  <span className="font-medium">
                    {currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <span className="font-medium">O</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser?.fullName || 'Organizer'}</p>
                <p className="text-xs text-purple-200">{currentUser?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>
          
          {/* Sidebar navigation */}
          <ul className="mt-6 space-y-1 px-2">
            <li>
              <button 
                onClick={() => setActiveComponent('dashboard')}
                className={`flex items-center px-4 py-2.5 text-purple-100 w-full text-left ${
                  activeComponent === 'dashboard' ? 'bg-purple-800' : 'hover:bg-purple-600'
                } rounded-lg group`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveComponent('events')}
                className={`flex items-center px-4 py-2.5 text-purple-100 w-full text-left ${
                  activeComponent === 'events' ? 'bg-purple-800' : 'hover:bg-purple-600'
                } rounded-lg group`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>My Events</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveComponent('speakers')}
                className={`flex items-center px-4 py-2.5 text-purple-100 w-full text-left ${
                  activeComponent === 'speakers' ? 'bg-purple-800' : 'hover:bg-purple-600'
                } rounded-lg group`}
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Speakers</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveComponent('notifications')}
                className={`flex items-center px-4 py-2.5 text-purple-100 w-full text-left ${
                  activeComponent === 'notifications' ? 'bg-purple-800' : 'hover:bg-purple-600'
                } rounded-lg group`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveComponent('profile')}
                className={`flex items-center px-4 py-2.5 text-purple-100 w-full text-left ${
                  activeComponent === 'profile' ? 'bg-purple-800' : 'hover:bg-purple-600'
                } rounded-lg group`}
              >
                <User className="w-5 h-5 mr-3" />
                <span>My Profile</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-purple-100 hover:bg-purple-600 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {activeComponent === 'dashboard' && 'Dashboard'}
              {activeComponent === 'events' && 'Event Management'}
              {activeComponent === 'speakers' && 'Speaker Directory'}
              {activeComponent === 'notifications' && 'Notification Management'}
              {activeComponent === 'profile' && 'My Profile'}
            </h2>
            
            {/* Notification Panel */}
            <div>
              <NotificationPanel />
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Dashboard View with KPIs and Charts */}
          {activeComponent === 'dashboard' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
                      <p className="text-3xl font-bold mt-2 text-purple-600">{dashboardMetrics.totalEvents}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Events you've organized</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Total Sessions</h3>
                      <p className="text-3xl font-bold mt-2 text-blue-600">{dashboardMetrics.totalSessions}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Across all your events</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Total Speakers</h3>
                      <p className="text-3xl font-bold mt-2 text-green-600">{dashboardMetrics.totalSpeakers}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Speakers in your events</p>
                </div>
              </div>
              
              {/* Event Trend Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Events Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.events}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" name="Events" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Sessions and Speakers Trends Charts - 2 column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Sessions Over Time</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.sessions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Sessions" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Speakers Over Time</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.speakers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Speakers" stroke="#10b981" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Recent Events Summary */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Recent Events</h3>
                  <button 
                    onClick={() => setActiveComponent('events')}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events found</p>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.slice(0, 5).map((event) => (
                          <tr key={event._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(event.startDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${event.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                                ${event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${event.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                ${event.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                              `}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.attendees ? event.attendees.length : 0} / {event.capacity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Event Management View */}
          {activeComponent === 'events' && <EventManagement />}
          
          {/* Speakers View with Search */}
          {activeComponent === 'speakers' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">Speaker Directory</h3>
                  
                  {/* Search input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search speakers..."
                      value={speakerSearch}
                      onChange={handleSpeakerSearch}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full"
                    />
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : filteredSpeakers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No speakers found</p>
                    {speakerSearch ? (
                      <p className="text-gray-400 text-sm">
                        Try adjusting your search query
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Add speakers to your events to see them here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpeakers.map(speaker => (
                      <div key={speaker._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl font-bold mr-4">
                              {speaker.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-lg">{speaker.fullName}</h4>
                              {speaker.organization && (
                                <p className="text-gray-600">{speaker.organization}</p>
                              )}
                            </div>
                          </div>
                          
                          {speaker.bio && (
                            <p className="mt-3 text-gray-600 text-sm line-clamp-3">{speaker.bio}</p>
                          )}
                          
                          <div className="mt-4 flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {speaker.email}
                          </div>
                          
                          {/* Speaker Stats - Events & Sessions */}
                          
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Notifications View */}
          {activeComponent === 'notifications' && (
            <div className="space-y-6">
              {/* Create Notification Section */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Send New Notification</h3>
                  
                  {!showNotificationForm && (
                    <div className="flex items-center">
                      <select
                        value={selectedEvent ? selectedEvent._id : ''}
                        onChange={handleEventChange}
                        className="mr-3 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {events.length === 0 && (
                          <option value="" disabled>No events available</option>
                        )}
                        {events.map(event => (
                          <option key={event._id} value={event._id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => setShowNotificationForm(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                        disabled={!selectedEvent}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Create Notification
                      </button>
                    </div>
                  )}
                </div>
                
                {showNotificationForm ? (
                  <NotificationForm 
                    event={selectedEvent}
                    onClose={() => setShowNotificationForm(false)}
                    onSuccess={handleNotificationSuccess}
                  />
                ) : (
                  <p className="text-gray-600">
                    {events.length > 0 
                      ? "Select an event and click 'Create Notification' to send announcements to your event participants."
                      : "You don't have any events yet. Create an event first to send notifications."}
                  </p>
                )}
              </div>
              
              {/* Recent Notifications List */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Sent Notifications</h3>
                </div>
                
                {/* Loading state */}
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                )}
                
                {/* Empty state */}
                {!loading && eventNotifications.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No notifications sent yet</p>
                    <p className="text-gray-400 text-sm">
                      Notifications you send will appear here
                    </p>
                  </div>
                )}
                
                {/* Notifications list */}
                {!loading && eventNotifications.length > 0 && (
                  <>
                    <div className="space-y-4 mb-4">
                      {eventNotifications.map(notification => (
                        <div key={notification._id} className="border rounded-lg overflow-hidden">
                          <div className={`px-4 py-3 border-b flex justify-between items-center
                            ${notification.type === 'info' ? 'bg-blue-50' : ''}
                            ${notification.type === 'update' ? 'bg-green-50' : ''}
                            ${notification.type === 'warning' ? 'bg-yellow-50' : ''}
                            ${notification.type === 'urgent' ? 'bg-red-50' : ''}
                          `}>
                            <span className={`text-sm font-medium
                              ${notification.type === 'info' ? 'text-blue-700' : ''}
                              ${notification.type === 'update' ? 'text-green-700' : ''}
                              ${notification.type === 'warning' ? 'text-yellow-700' : ''}
                              ${notification.type === 'urgent' ? 'text-red-700' : ''}
                            `}>
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg">{notification.title}</h4>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            <div className="mt-3 text-sm text-gray-500">
                              {notification.recipients === 'all' && <span>Sent to all participants</span>}
                              {notification.recipients === 'speakers' && <span>Sent to all speakers</span>}
                              {notification.recipients === 'attendees' && <span>Sent to all attendees</span>}
                              {notification.recipients === 'specific' && <span>Sent to {notification.specificRecipients?.length || 0} specific recipients</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center mt-6">
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded text-sm ${
                                pagination.page === page
                                  ? 'bg-purple-600 text-white'
                                  : 'border hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-1 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Profile View */}
          {activeComponent === 'profile' && (
            <ProfilePage currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
          )}
        </main>
      </div>
    </div>
  );
};

export default OrganizerDashboard;