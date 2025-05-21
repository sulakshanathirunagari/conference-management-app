import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, Clock, Calendar, MessageSquare } from 'lucide-react';

const FeedbackView = ({ currentUser }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackData, setFeedbackData] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState({});

  // Fetch feedback data when component mounts
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Fetch feedback for the speaker
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/feedback/speaker', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedbackData(data.data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanding/collapsing a feedback section
  const toggleExpand = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate percentage for rating bar
  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  // Render a rating breakdown bar
  const renderRatingBar = (label, count, total) => {
    const percentage = calculatePercentage(count, total);
    
    return (
      <div className="flex items-center text-sm mb-1">
        <span className="w-16">{label}</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
          <div
            className="bg-yellow-400 h-2.5 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="w-10 text-right">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">My Session Feedback</h3>
        <button
          onClick={fetchFeedback}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* No feedback yet */}
      {!loading && !error && feedbackData.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">No Feedback Yet</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't received any feedback for your sessions yet. Check back after your sessions have completed.
          </p>
        </div>
      )}

      {/* Feedback list */}
      {!loading && !error && feedbackData.length > 0 && (
        <div className="space-y-6">
          {feedbackData.map((sessionData) => (
            <div key={sessionData.sessionId} className="border rounded-lg overflow-hidden shadow-sm">
              {/* Session header */}
              <div className="bg-white p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-lg text-gray-800">{sessionData.sessionTitle}</h4>
                    <p className="text-sm text-gray-600">{sessionData.eventTitle}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-center">
                      <p className="text-3xl font-bold text-gray-800">{sessionData.stats.averageRating}</p>
                      <div className="flex justify-center">
                        {renderStars(Math.round(sessionData.stats.averageRating))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {sessionData.stats.totalFeedback} {sessionData.stats.totalFeedback === 1 ? 'rating' : 'ratings'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(sessionData.sessionId)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      {expandedSessions[sessionData.sessionId] ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Ratings breakdown - visible without expanding */}
                <div className="mt-4">
                  {renderRatingBar('5 stars', sessionData.stats.ratingCounts[5], sessionData.stats.totalFeedback)}
                  {renderRatingBar('4 stars', sessionData.stats.ratingCounts[4], sessionData.stats.totalFeedback)}
                  {renderRatingBar('3 stars', sessionData.stats.ratingCounts[3], sessionData.stats.totalFeedback)}
                  {renderRatingBar('2 stars', sessionData.stats.ratingCounts[2], sessionData.stats.totalFeedback)}
                  {renderRatingBar('1 star', sessionData.stats.ratingCounts[1], sessionData.stats.totalFeedback)}
                </div>
              </div>

              {/* Expanded content - individual feedback */}
              {expandedSessions[sessionData.sessionId] && (
                <div className="bg-gray-50 px-4 py-3">
                  <h5 className="font-medium text-gray-700 mb-4">Attendee Comments</h5>
                  
                  {sessionData.feedback.length === 0 ? (
                    <p className="text-gray-500 italic py-2">No written comments provided.</p>
                  ) : (
                    <div className="space-y-4">
                      {sessionData.feedback.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="mr-3">
                                {renderStars(item.rating)}
                              </div>
                              <p className="font-medium text-gray-800">
                                {item.attendee.fullName}
                              </p>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700">{item.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackView;