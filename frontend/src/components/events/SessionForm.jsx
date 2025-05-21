// src/components/events/SessionForm.jsx
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Save, X } from 'lucide-react';

const SessionForm = ({ session, eventId, onSubmit, onCancel, availableSpeakers = [] }) => {
  const initialFormState = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    speaker: '',
    capacity: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form with session data when editing
  useEffect(() => {
    if (session) {
      // Format datetime for input elements
      const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
      };

      setFormData({
        title: session.title || '',
        description: session.description || '',
        startTime: session.startTime ? formatDateTime(session.startTime) : '',
        endTime: session.endTime ? formatDateTime(session.endTime) : '',
        location: session.location || '',
        speaker: session.speaker?._id || session.speaker || '',
        capacity: session.capacity || 0
      });
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
    }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.title.trim()) newErrors.title = 'Session title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    // Speaker is MANDATORY - emphasized validation
    if (!formData.speaker) newErrors.speaker = 'Speaker assignment is mandatory';
    
    // Validate date/time logic
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call parent onSubmit handler with form data
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting session:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          {session ? 'Edit Session' : 'Add New Session'}
        </h3>
        <button 
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Title */}
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Session Title*
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
            placeholder="Enter session title"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>
        
        {/* Session Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
            placeholder="Describe the session"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
        
        {/* Start and End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 inline mr-1" />
              Start Time*
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg ${errors.startTime ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 inline mr-1" />
              End Time*
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg ${errors.endTime ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>
        
        {/* Location */}
        <div className="space-y-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location*
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
            placeholder="Room number, hall name, etc."
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
          )}
        </div>
        
        {/* Speaker - MANDATORY */}
        <div className="space-y-1">
          <label htmlFor="speaker" className="block text-sm font-medium text-gray-700">
            <User className="w-4 h-4 inline mr-1" />
            Speaker* (Mandatory)
          </label>
          <select
            id="speaker"
            name="speaker"
            value={formData.speaker}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.speaker ? 'border-red-500' : 'border-gray-300'} focus:ring-purple-500 focus:border-purple-500`}
          >
            <option value="">-- Select Speaker --</option>
            {availableSpeakers.map(speaker => (
              <option key={speaker._id} value={speaker._id}>
                {speaker.fullName} {speaker.organization ? `(${speaker.organization})` : ''}
              </option>
            ))}
          </select>
          {errors.speaker && (
            <p className="text-red-500 text-xs mt-1">{errors.speaker}</p>
          )}
        </div>
        
        {/* Capacity */}
        <div className="space-y-1">
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity (leave at 0 for unlimited)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>Save Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;