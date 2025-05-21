import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Check } from 'lucide-react';

const FeedbackForm = ({ onFeedbackSubmitted }) => {
  // State for the form
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [sessions, setSessions] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // State to track which sessions already have feedback
  const [feedbackExists, setFeedbackExists] = useState({});

  // Fetch attended events when component mounts
  useEffect(() => {
    fetchAttendedEvents();
  }, []);

  // Fetch sessions when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchEventSessions(selectedEvent);
    } else {
      setSessions([]);
      setSelectedSession('');
    }
  }, [selectedEvent]);

  // Check if feedback exists when session is selected
  useEffect(() => {
    if (selectedSession) {
      checkFeedbackExists(selectedSession);
    }
  }, [selectedSession]);

  // Fetch events the user has attended
  const fetchAttendedEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attended events');
      }

      const data = await response.json();
      // Only show events that have already started
      const filteredEvents = data.data.filter(event => 
        new Date(event.startDate) <= new Date()
      );
      
      setAttendedEvents(filteredEvents);
    } catch (err) {
      console.error('Error fetching attended events:', err);
      setError('Failed to load your attended events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions for a specific event
  const fetchEventSessions = async (eventId) => {
    try {
      setLoading(true);
      // Find the event in our already loaded events
      const event = attendedEvents.find(e => e._id === eventId);
      
      if (event && event.sessions) {
        setSessions(event.sessions);
      } else {
        // Fetch event details if sessions aren't included in attendedEvents
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event sessions');
        }

        const data = await response.json();
        setSessions(data.data.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching event sessions:', err);
      setError('Failed to load sessions for this event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if feedback exists for a session
  const checkFeedbackExists = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/feedback/check/${sessionId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check feedback status');
      }

      const data = await response.json();
      
      // Update the feedbackExists state
      setFeedbackExists(prev => ({
        ...prev,
        [sessionId]: data.exists
      }));

      // If feedback exists, disable the form
      if (data.exists) {
        setError(`You've already submitted feedback for this session.`);
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error checking feedback status:', err);
      // Don't show this as an error to the user
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent || !selectedSession || !rating || !feedbackText.trim()) {
      setError('Please complete all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: selectedEvent,
          sessionId: selectedSession,
          rating,
          comment: feedbackText,
          isAnonymous
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      // Update feedbackExists state to show this session has feedback now
      setFeedbackExists(prev => ({
        ...prev,
        [selectedSession]: true
      }));

      // Reset form
      setSelectedSession('');
      setRating(0);
      setFeedbackText('');
      setIsAnonymous(false);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      // Notify parent component that feedback was submitted
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get session name by ID
  const getSessionName = (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    return session ? session.title : 'Unknown Session';
  };

  // Render star rating
  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                (hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Feedback submitted successfully! Thank you for your input.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md"
            disabled={loading || attendedEvents.length === 0}
          >
            <option value="">Select an event</option>
            {attendedEvents.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Session selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Session
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md"
            disabled={loading || !selectedEvent || sessions.length === 0}
          >
            <option value="">Select a session</option>
            {sessions.map((session) => (
              <option 
                key={session._id} 
                value={session._id}
                disabled={feedbackExists[session._id]}
              >
                {session.title} {feedbackExists[session._id] ? '(Feedback submitted)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate this session
          </label>
          {renderStars()}
          <p className="mt-1 text-sm text-gray-500">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Feedback text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Feedback
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Share your experience, what you learned, and any suggestions for improvement..."
              disabled={loading || feedbackExists[selectedSession]}
            />
          </div>
        </div>

        {/* Anonymous checkbox */}
        <div className="flex items-center">
          <input
            id="anonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            disabled={loading || feedbackExists[selectedSession]}
          />
          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
            Submit feedback anonymously
          </label>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={loading || !selectedEvent || !selectedSession || !rating || !feedbackText.trim() || feedbackExists[selectedSession]}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;