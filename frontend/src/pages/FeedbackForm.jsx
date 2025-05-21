import React, { useState, useEffect } from 'react';
import { Calendar, Star, CheckCircle, X, Send } from 'lucide-react';



const FeedbackForm = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    content: '',
    speaker: 0,
    organization: 0,
    venue: 0,
    recommend: false
  });
  
  // Fetch the attendee's registered events that have already concluded
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch the user's attended events
        const response = await fetch('http://localhost:5000/api/events/my/events?role=attendee', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Filter for past events only
        const now = new Date();
        const pastEvents = data.data.filter(event => new Date(event.endDate) < now);
        
        setEvents(pastEvents);
        
        // Auto-select the first event if available
        if (pastEvents.length > 0) {
          setSelectedEvent(pastEvents[0]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Reset feedback when event changes
  useEffect(() => {
    if (selectedEvent) {
      setSelectedSessionId('');
      setFeedback({
        rating: 0,
        content: '',
        speaker: 0,
        organization: 0,
        venue: 0,
        recommend: false
      });
      setSuccess(false);
    }
  }, [selectedEvent]);
  
  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find(event => event._id === eventId);
    setSelectedEvent(event);
  };
  
  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
  };
  
  const handleRatingChange = (category, value) => {
    setFeedback(prev => ({
      ...prev,
      [category]: value
    }));
  };
  
  const handleRecommendChange = () => {
    setFeedback(prev => ({
      ...prev,
      recommend: !prev.recommend
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError('Please select an event to provide feedback.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Prepare feedback data
      const feedbackData = {
        eventId: selectedEvent._id,
        sessionId: selectedSessionId || null,
        overallRating: feedback.rating,
        speakerRating: feedback.speaker,
        organizationRating: feedback.organization,
        venueRating: feedback.venue,
        wouldRecommend: feedback.recommend,
        comments: feedback.content
      };
      
      // Submit feedback
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      
      // Reset form on success
      setSuccess(true);
      setFeedback({
        rating: 0,
        content: '',
        speaker: 0,
        organization: 0,
        venue: 0,
        recommend: false
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render star rating component
  const StarRating = ({ rating, onChange, readOnly = false }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
            disabled={readOnly}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error && !events.length) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        {error}
      </div>
    );
  }
  
  if (!loading && events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Past Events Found</h3>
        <p className="text-gray-600">
          You haven't attended any events that have concluded yet. After attending events, you can provide feedback here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-600 p-4 text-white">
        <h2 className="text-xl font-semibold">Event Feedback</h2>
        <p className="text-sm text-green-100 mt-1">
          Your feedback helps us improve future events and sessions
        </p>
      </div>
      
      {success ? (
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Thank You for Your Feedback!</h3>
          <p className="text-gray-600 mb-6">
            Your input is valuable to us and helps improve future events.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          {/* Event selection */}
          <div className="mb-6">
            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select
              id="event"
              value={selectedEvent?._id || ''}
              onChange={handleEventChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            >
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {formatDate(event.startDate)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Optional session selection */}
          {selectedEvent && selectedEvent.sessions && selectedEvent.sessions.length > 0 && (
            <div className="mb-6">
              <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
                Select Session (Optional)
              </label>
              <select
                id="session"
                value={selectedSessionId}
                onChange={handleSessionChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Overall Event Feedback</option>
                {selectedEvent.sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Overall rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Experience
            </label>
            <StarRating
              rating={feedback.rating}
              onChange={(value) => handleRatingChange('rating', value)}
            />
          </div>
          
          {/* Other ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker Quality
              </label>
              <StarRating
                rating={feedback.speaker}
                onChange={(value) => handleRatingChange('speaker', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <StarRating
                rating={feedback.organization}
                onChange={(value) => handleRatingChange('organization', value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue/Platform
              </label>
              <StarRating
                rating={feedback.venue}
                onChange={(value) => handleRatingChange('venue', value)}
              />
            </div>
          </div>
          
          {/* Would recommend checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="recommend"
                type="checkbox"
                checked={feedback.recommend}
                onChange={handleRecommendChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="recommend" className="ml-2 block text-sm text-gray-700">
                I would recommend this event to others
              </label>
            </div>
          </div>
          
          {/* Comments */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              id="content"
              rows={4}
              value={feedback.content}
              onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts about the event, what you liked, and what could be improved..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || feedback.rating === 0}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;