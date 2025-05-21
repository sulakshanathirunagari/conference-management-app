import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Tag, Image, Upload, Save, X } from 'lucide-react';

const EventForm = ({ event, onSubmit, onCancel }) => {
  const initialFormState = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 100,
    price: 0,
    status: 'draft',
    tags: '',
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Populate form with event data when editing
  useEffect(() => {
    if (event) {
      // Format dates for input elements
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: formatDate(event.startDate) || '',
        endDate: formatDate(event.endDate) || '',
        location: event.location || '',
        capacity: event.capacity || 100,
        price: event.price || 0,
        status: event.status || 'draft',
        tags: event.tags ? event.tags.join(', ') : '',
      });
      
      if (event.coverImage) {
        setBannerPreview(event.coverImage);
      }
    }
  }, [event]);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };
  
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setBanner(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate form
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // Process form data
      const eventData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };
      
      // Handle banner upload first if there's a new banner
      if (banner) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('banner', banner);
        
        const uploadResponse = await fetch('http://localhost:5000/api/upload/banner', {
            method: 'POST',
            body: formDataWithImage,
            credentials: 'include',
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload banner image');
        }
        
        const uploadData = await uploadResponse.json();
        eventData.coverImage = uploadData.fileUrl;
      }
      
      // Submit the event data
      const success = await onSubmit(eventData);
      
      if (success) {
        // Form was submitted successfully, handled by parent component
      }
    } catch (err) {
      setError('Error submitting form: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {event ? 'Edit Event' : 'Create New Event'}
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Event Banner Image
          </label>
          
          {bannerPreview ? (
            <div className="relative">
              <img 
                src={bannerPreview} 
                alt="Event banner preview" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <button 
                type="button"
                onClick={() => {
                  setBanner(null);
                  setBannerPreview('');
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Image className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">Drag and drop image here or click to browse</p>
              <p className="text-xs text-gray-400 mb-3">PNG, JPG, GIF up to 5MB</p>
              <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                <span>Upload Banner</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleBannerChange}
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Event Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter event title"
            required
          />
        </div>
        
        {/* Event Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Event Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter event description"
            required
          />
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date*
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date*
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location*
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter event location"
            required
          />
        </div>
        
        {/* Capacity and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 inline mr-1" />
              Capacity*
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Price (0 for free)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        
        {/* Status */}
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Event Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Tags */}
        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g. technology, workshop, networking"
          />
        </div>
        
        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
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
                <span>Save Event</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;