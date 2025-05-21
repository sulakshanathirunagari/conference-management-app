import React, { useState, useEffect } from 'react';
import { PlusCircle, List } from 'lucide-react';
import EventList from './EventList';
import EventForm from './EventForm';
import EventDetails from './EventDetails';

const EventManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'details'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Fetch all events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Function to fetch all events (for the list view)
  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      // This should fetch ALL events
      const response = await fetch('http://localhost:5000/api/events/my/events?role=organizer', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      setError('Error fetching events: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch a single event's details
  const fetchEventDetails = async (eventId) => {
    if (!eventId) {
      setError('Cannot fetch details: Event ID is missing');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      setSelectedEvent(data.data);
    } catch (err) {
      setError('Error fetching event details: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateEvent = async (eventData) => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      // Refresh events list
      await fetchEvents();
      
      // Return to list view
      setView('list');
    } catch (err) {
      setError('Error creating event: ' + err.message);
      console.error(err);
      return false;
    }
    
    return true;
  };
  
  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      // Refresh events list
      await fetchEvents();
      
      // Return to list view
      setView('list');
    } catch (err) {
      setError('Error updating event: ' + err.message);
      console.error(err);
      return false;
    }
    
    return true;
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      // Refresh events list
      await fetchEvents();
      
      // If we're in details view of the deleted event, go back to list
      if (view === 'details' && selectedEvent?._id === eventId) {
        setView('list');
      }
    } catch (err) {
      setError('Error deleting event: ' + err.message);
      console.error(err);
    }
  };
  
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setView('edit');
  };
  
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setView('details');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
        
        <div className="flex space-x-2">
          {view !== 'list' && (
            <button
              onClick={() => setView('list')}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <List className="w-4 h-4 mr-2" />
              <span>Back to List</span>
            </button>
          )}
          
          {view === 'list' && (
            <button
              onClick={() => {
                setSelectedEvent(null);
                setView('create');
              }}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {view === 'list' && (
        <EventList 
          events={events} 
          loading={loading} 
          onEdit={handleEditClick} 
          onView={handleViewDetails} 
          onDelete={handleDeleteEvent}
        />
      )}
      
      {(view === 'create' || view === 'edit') && (
        <EventForm 
          event={view === 'edit' ? selectedEvent : null}
          onSubmit={view === 'edit' 
            ? (data) => handleUpdateEvent(selectedEvent._id, data)
            : handleCreateEvent
          }
          onCancel={() => setView('list')}
        />
      )}
      
      {view === 'details' && selectedEvent && (
        <EventDetails 
          event={selectedEvent} 
          onEdit={() => setView('edit')}
          onDelete={() => handleDeleteEvent(selectedEvent._id)}
          onBack={() => setView('list')}
          onRefresh={() => fetchEventDetails(selectedEvent._id)}
        />
      )}
    </div>
  );
};

export default EventManagement;