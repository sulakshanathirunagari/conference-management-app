// components/notifications/NotificationForm.jsx
import React, { useState, useEffect } from 'react';
import { Send, X, AlertTriangle, Info, RefreshCw, Bell } from 'lucide-react';

const NotificationForm = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipients: 'all',
    specificRecipients: [],
    type: 'info'
  });
  
  const [availableRecipients, setAvailableRecipients] = useState({
    speakers: [],
    attendees: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch available recipients when component mounts
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        // Fetch speakers for this event
        const speakersResponse = await fetch(`http://localhost:5000/api/events/${event._id}/speakers`, {
          credentials: 'include'
        });
        
        // Fetch attendees for this event
        const attendeesResponse = await fetch(`http://localhost:5000/api/events/${event._id}/attendees`, {
          credentials: 'include'
        });
        
        if (speakersResponse.ok && attendeesResponse.ok) {
          const speakersData = await speakersResponse.json();
          const attendeesData = await attendeesResponse.json();
          
          setAvailableRecipients({
            speakers: speakersData.data || [],
            attendees: attendeesData.data || []
          });
        }
      } catch (err) {
        console.error('Error fetching recipients:', err);
        setError('Could not load recipients');
      }
    };
    
    if (event && event._id) {
      fetchRecipients();
    }
  }, [event]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset specific recipients when recipient type changes
    if (name === 'recipients' && value !== 'specific') {
      setFormData(prev => ({
        ...prev,
        specificRecipients: []
      }));
    }
  };
  
  const handleRecipientSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      specificRecipients: selectedOptions
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.title || !formData.message) {
        throw new Error('Please provide both title and message');
      }
      
      if (formData.recipients === 'specific' && formData.specificRecipients.length === 0) {
        throw new Error('Please select at least one recipient');
      }
      
      // Send notification
      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event._id,
          title: formData.title,
          message: formData.message,
          recipients: formData.recipients,
          specificRecipients: formData.specificRecipients,
          type: formData.type
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send notification');
      }
      
      // Success! Clear form and notify parent
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        recipients: 'all',
        specificRecipients: [],
        type: 'info'
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Send Notification
        </h3>
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            <label className={`flex items-center p-2 rounded-lg border ${
              formData.type === 'info' ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
            } cursor-pointer`}>
              <input
                type="radio"
                name="type"
                value="info"
                checked={formData.type === 'info'}
                onChange={handleChange}
                className="sr-only"
              />
              <Info className="w-5 h-5 text-blue-500 mr-2" />
              <span>Info</span>
            </label>
            
            <label className={`flex items-center p-2 rounded-lg border ${
              formData.type === 'update' ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'
            } cursor-pointer`}>
              <input
                type="radio"
                name="type"
                value="update"
                checked={formData.type === 'update'}
                onChange={handleChange}
                className="sr-only"
              />
              <RefreshCw className="w-5 h-5 text-green-500 mr-2" />
              <span>Update</span>
            </label>
            
            <label className={`flex items-center p-2 rounded-lg border ${
              formData.type === 'warning' ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-gray-50'
            } cursor-pointer`}>
              <input
                type="radio"
                name="type"
                value="warning"
                checked={formData.type === 'warning'}
                onChange={handleChange}
                className="sr-only"
              />
              <Bell className="w-5 h-5 text-yellow-500 mr-2" />
              <span>Warning</span>
            </label>
            
            <label className={`flex items-center p-2 rounded-lg border ${
              formData.type === 'urgent' ? 'bg-red-50 border-red-300' : 'hover:bg-gray-50'
            } cursor-pointer`}>
              <input
                type="radio"
                name="type"
                value="urgent"
                checked={formData.type === 'urgent'}
                onChange={handleChange}
                className="sr-only"
              />
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span>Urgent</span>
            </label>
          </div>
        </div>
        
        {/* Recipients */}
        <div>
          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
            Send To
          </label>
          <select
            id="recipients"
            name="recipients"
            value={formData.recipients}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Participants</option>
            <option value="speakers">All Speakers</option>
            <option value="attendees">All Attendees</option>
            <option value="specific">Specific People</option>
          </select>
        </div>
        
        {/* Specific Recipients (shown only when "specific" is selected) */}
        {formData.recipients === 'specific' && (
          <div>
            <label htmlFor="specificRecipients" className="block text-sm font-medium text-gray-700 mb-1">
              Select Recipients
            </label>
            <select
              id="specificRecipients"
              name="specificRecipients"
              multiple
              size={5}
              value={formData.specificRecipients}
              onChange={handleRecipientSelection}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <optgroup label="Speakers">
                {availableRecipients.speakers.map(speaker => (
                  <option key={`speaker-${speaker._id}`} value={speaker._id}>
                    {speaker.fullName} (Speaker)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Attendees">
                {availableRecipients.attendees.map(attendee => (
                  <option key={`attendee-${attendee._id}`} value={attendee._id}>
                    {attendee.fullName} (Attendee)
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd key to select multiple recipients
            </p>
          </div>
        )}
        
        {/* Notification Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter notification title"
            required
          />
        </div>
        
        {/* Notification Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter notification message"
            required
          ></textarea>
        </div>
        
        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationForm;