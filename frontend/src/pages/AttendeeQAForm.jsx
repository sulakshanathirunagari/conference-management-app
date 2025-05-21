import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, ThumbsUp, Clock, User, MessageSquare, Lock } from 'lucide-react';

const AttendeeQAForm = () => {
  const { eventId, sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch current user, session details, and questions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch current user
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userResponse.json();
        setCurrentUser(userData.user);
        
        // Fetch event details
        const eventResponse = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          credentials: 'include'
        });
        
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event details');
        }
        
        const eventData = await eventResponse.json();
        setEventData(eventData.data);
        
        // Find the session in the event data
        const session = eventData.data.sessions.find(s => s._id === sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        
        setSessionData(session);
        
        // Check if session is active (current time is between start and end time)
        const now = new Date();
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        
        // For sessions happening today, allow Q&A 15 minutes before start
        const isToday = sessionStart.toDateString() === now.toDateString();
        const earlyAccessTime = new Date(sessionStart);
        earlyAccessTime.setMinutes(earlyAccessTime.getMinutes() - 15);
        
        const isActive = (isToday && now >= earlyAccessTime && now <= sessionEnd) ||
                         (now >= sessionStart && now <= sessionEnd);
        
        setIsSessionActive(isActive);
        
        // Only fetch questions if the session is active or has already happened
        if (isActive || now > sessionEnd) {
          // Fetch questions for this session
          const questionsResponse = await fetch(`http://localhost:5000/api/questions/session/${sessionId}`, {
            credentials: 'include'
          });
          
          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while loading the Q&A session');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling to refresh questions every 30 seconds, but only if session is active
    const intervalId = setInterval(() => {
      const now = new Date();
      if (sessionData) {
        const sessionEnd = new Date(sessionData.endTime);
        if (now <= sessionEnd) {
          fetchQuestions();
        }
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [eventId, sessionId]);

  // Scroll to bottom of questions when new ones come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questions]);

  // Fetch questions for this session
  const fetchQuestions = async () => {
    if (!isSessionActive) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/questions/session/${sessionId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  // Submit a new question
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim() || !isSessionActive) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          eventId,
          text: newQuestion,
          isAnonymous: false
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit question');
      }
      
      const data = await response.json();
      
      // Add the new question to the list
      setQuestions([...questions, data.data]);
      
      // Clear the input
      setNewQuestion('');
    } catch (err) {
      console.error('Error submitting question:', err);
      setError(err.message || 'Failed to submit your question');
    } finally {
      setSubmitting(false);
    }
  };

  // Upvote a question
  const handleUpvote = async (questionId) => {
    if (!isSessionActive) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}/upvote`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh questions
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error upvoting question:', err);
    }
  };

  // Format date for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString(undefined, { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          {error || 'Session not found'}
        </div>
      </div>
    );
  }

  // Calculate time remaining or time until session starts
  const now = new Date();
  const sessionStart = new Date(sessionData.startTime);
  const sessionEnd = new Date(sessionData.endTime);
  const isUpcoming = now < sessionStart;
  const isPast = now > sessionEnd;
  
  // Time formatting
  const getTimeStatus = () => {
    if (isUpcoming) {
      const diff = sessionStart - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `Starts in ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `Starts in ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    } else if (isPast) {
      return 'Session has ended';
    } else {
      return 'Session in progress';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Session header */}
        <div className="bg-green-600 text-white p-4">
          <h1 className="text-xl font-bold">{sessionData.title}</h1>
          <div className="flex items-center mt-1">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {formatDate(sessionData.startTime)} • {formatTime(sessionData.startTime)} - {formatTime(sessionData.endTime)}
            </span>
            <span className="mx-2">•</span>
            <span className="text-sm">{sessionData.location}</span>
          </div>
          {sessionData.speaker && (
            <div className="flex items-center mt-2">
              <User className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                Speaker: {sessionData.speaker.fullName}
              </span>
            </div>
          )}
          <div className="mt-2 text-sm bg-white bg-opacity-20 px-2 py-1 rounded inline-block">
            {getTimeStatus()}
          </div>
        </div>
        
        {/* Q&A section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
              Live Q&A
            </h2>
            <span className="text-sm text-gray-500">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
          
          {/* Session not active message */}
          {!isSessionActive && (
            <div className={`mb-6 p-4 rounded-lg text-center ${isPast ? 'bg-gray-100 text-gray-700' : 'bg-yellow-50 text-yellow-700'}`}>
              <Lock className="w-8 h-8 mx-auto mb-2 opacity-70" />
              <h3 className="font-semibold text-lg mb-1">
                {isPast ? 'Session has ended' : 'Q&A will be available when the session starts'}
              </h3>
              <p>
                {isPast 
                  ? 'You can view the questions and answers from this session below.' 
                  : `Live Q&A will be available 15 minutes before the session starts at ${formatTime(sessionData.startTime)}.`}
              </p>
            </div>
          )}
          
          {/* Questions list */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">
                  {isSessionActive 
                    ? "No questions yet. Be the first to ask!" 
                    : isPast 
                    ? "No questions were asked during this session." 
                    : "Questions will appear here once the session begins."}
                </p>
              </div>
            ) : (
              questions.sort((a, b) => {
                // Sort by answered status, then by upvotes, then by date
                if (a.status === 'answered' && b.status !== 'answered') return 1;
                if (a.status !== 'answered' && b.status === 'answered') return -1;
                
                // Then by number of upvotes
                const aUpvotes = a.upvotes?.length || 0;
                const bUpvotes = b.upvotes?.length || 0;
                if (aUpvotes !== bUpvotes) return bUpvotes - aUpvotes;
                
                // Then by date
                return new Date(b.createdAt) - new Date(a.createdAt);
              }).map(question => (
                <div 
                  key={question._id} 
                  className={`border rounded-lg overflow-hidden ${
                    question.status === 'answered' ? 'border-green-200 bg-green-50' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <button 
                            onClick={() => handleUpvote(question._id)}
                            disabled={!isSessionActive}
                            className={`flex flex-col items-center p-1 rounded ${
                              !isSessionActive 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : question.upvotes?.includes(currentUser?._id) 
                                ? 'text-green-600'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs mt-1">{question.upvotes?.length || 0}</span>
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800">{question.text}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className="font-medium">
                              {question.askedBy?._id === currentUser?._id 
                                ? 'You' 
                                : question.askedBy?.fullName || 'Anonymous'}
                            </span>
                            <span className="mx-1">•</span>
                            <span>{new Date(question.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Answer section if answered */}
                    {question.status === 'answered' && question.answer && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center text-sm text-green-700 mb-1">
                          <User className="w-4 h-4 mr-1" />
                          <span className="font-medium">
                            {question.answer.answeredBy?.fullName || (sessionData.speaker?.fullName + ' (Speaker)')}
                          </span>
                        </div>
                        <p className="text-gray-700">{question.answer.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Ask question form */}
          <form onSubmit={handleSubmitQuestion} className="mt-4">
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={isSessionActive 
                  ? "Type your question here..." 
                  : isPast 
                  ? "This session has ended" 
                  : "Wait for the session to start to ask questions"}
                className="flex-1 px-4 py-2 focus:outline-none"
                disabled={!isSessionActive || submitting}
              />
              <button
                type="submit"
                disabled={!isSessionActive || !newQuestion.trim() || submitting}
                className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendeeQAForm;