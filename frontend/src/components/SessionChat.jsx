import React, { useState, useEffect } from 'react';
import { MessageSquare, Search } from 'lucide-react';

const SessionChat = ({ currentUser, sessions }) => {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: null });
  
  // Set the first session as active when sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0]._id);
      setActiveSession(sessions[0]);
    }
  }, [sessions, activeSessionId]);
  
  // Fetch questions when active session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchSessionQuestions();
    }
  }, [activeSessionId]);
  
  // Update active session when activeSessionId changes
  useEffect(() => {
    if (sessions && activeSessionId) {
      const session = sessions.find(s => s._id === activeSessionId);
      if (session) {
        setActiveSession(session);
      }
    }
  }, [activeSessionId, sessions]);
  
  // Clear status messages after delay
  useEffect(() => {
    if (submitStatus.success || submitStatus.error) {
      const timer = setTimeout(() => {
        setSubmitStatus({ success: false, error: null });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);
  
  // Fetch questions for the active session
  const fetchSessionQuestions = async () => {
    if (!activeSessionId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/questions/session/${activeSessionId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      
      const data = await response.json();
      setQuestions(data.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Submit an answer to a question
  const handleSubmitAnswer = async (questionId) => {
    if (!answerText[questionId]?.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: answerText[questionId]
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit answer');
      }
      
      const data = await response.json();
      
      // Update the question in the list with the new answer
      setQuestions(prev => 
        prev.map(q => q._id === questionId ? data.data : q)
      );
      
      // Clear the answer field
      setAnswerText(prev => ({ ...prev, [questionId]: '' }));
      
      // Show success message
      setSubmitStatus({ success: 'Answer submitted successfully!', error: null });
    } catch (err) {
      console.error('Error submitting answer:', err);
      setSubmitStatus({ success: false, error: err.message || 'Failed to submit answer' });
    }
  };
  
  // Format date/time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter questions based on search query
  const getFilteredQuestions = () => {
    if (!searchQuery) return questions;
    
    return questions.filter(question => 
      question.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Get unanswered questions
  const getUnansweredQuestions = () => {
    return getFilteredQuestions().filter(q => q.status === 'pending');
  };
  
  // Get answered questions
  const getAnsweredQuestions = () => {
    return getFilteredQuestions().filter(q => q.status === 'answered');
  };
  
  const unansweredQuestions = getUnansweredQuestions();
  const answeredQuestions = getAnsweredQuestions();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Session selector (if multiple sessions) */}
      {sessions && sessions.length > 0 && (
        <div className="p-4 bg-gray-50 border-b">
          <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Session
          </label>
          <select
            id="session-select"
            className="block w-full p-2 border border-gray-300 rounded-md"
            value={activeSessionId || ''}
            onChange={(e) => setActiveSessionId(e.target.value)}
          >
            {sessions.map(session => (
              <option key={session._id} value={session._id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Attendee Questions for {activeSession?.title || 'Selected Session'}
          </h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        
        {/* Status messages */}
        {submitStatus.success && (
          <div className="mb-4 p-2 bg-green-50 text-green-800 rounded-md">
            {submitStatus.success}
          </div>
        )}
        
        {submitStatus.error && (
          <div className="mb-4 p-2 bg-red-50 text-red-800 rounded-md">
            {submitStatus.error}
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && !loading && (
          <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
            {error}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">No questions from attendees yet</p>
            <p className="text-gray-500 text-sm">
              Questions will appear here when attendees submit them.
            </p>
            <button
              onClick={fetchSessionQuestions}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        )}
        
        {/* Questions that need answers */}
        {!loading && unansweredQuestions.length > 0 && (
          <div className="mb-8">
            <h4 className="font-medium text-red-800 mb-3 pb-2 border-b">
              Questions Waiting for Answers ({unansweredQuestions.length})
            </h4>
            
            <div className="space-y-4">
              {unansweredQuestions.map(question => (
                <div key={question._id} className="border rounded-lg overflow-hidden">
                  {/* Question header */}
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {question.askedBy?.fullName || 'Attendee'}
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(question.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Question content */}
                  <div className="p-4">
                    <p className="text-gray-800 mb-3">{question.text}</p>
                    
                    {/* Answer form */}
                    <div className="mt-3">
                      <label className="block font-medium text-sm text-gray-700 mb-1">
                        Your Answer
                      </label>
                      <textarea
                        placeholder="Type your answer here..."
                        value={answerText[question._id] || ''}
                        onChange={(e) => setAnswerText(prev => ({ ...prev, [question._id]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md p-3 mb-2"
                        rows={3}
                      />
                      <button
                        onClick={() => handleSubmitAnswer(question._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        disabled={!answerText[question._id]?.trim()}
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Answered questions */}
        {!loading && answeredQuestions.length > 0 && (
          <div>
            <h4 className="font-medium text-green-800 mb-3 pb-2 border-b">
              Answered Questions ({answeredQuestions.length})
            </h4>
            
            <div className="space-y-4">
              {answeredQuestions.map(question => (
                <div key={question._id} className="border rounded-lg overflow-hidden">
                  {/* Question header */}
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {question.askedBy?.fullName || 'Attendee'}
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(question.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Question content */}
                  <div className="p-4">
                    <p className="text-gray-800 mb-3">{question.text}</p>
                    
                    {/* Answer display */}
                    <div className="mt-3 bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-sm text-green-800">
                          Your Answer
                        </span>
                        <span className="mx-2 text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(question.answer.answeredAt)}
                        </span>
                      </div>
                      <p className="text-gray-800">{question.answer.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Refresh button */}
        {!loading && questions.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={fetchSessionQuestions}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Refresh Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionChat;