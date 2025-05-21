// components/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Building, BookOpen, Save, Camera } from 'lucide-react';

const ProfilePage = ({ currentUser, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    bio: '',
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Initialize form with current user data when available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        organization: currentUser.organization || '',
        bio: currentUser.bio || '',
        profileImage: currentUser.profileImage || ''
      });
      
      if (currentUser.profileImage) {
        setImagePreview(currentUser.profileImage);
      }
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Store the file for upload
    setFormData(prev => ({
      ...prev,
      profileImageFile: file
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create form data for the API call
      const apiFormData = {
        fullName: formData.fullName,
        organization: formData.organization,
        bio: formData.bio
      };
      
      // If there's a new image, upload it first
      if (formData.profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.profileImageFile);
        
        const uploadResponse = await fetch('http://localhost:5000/api/upload/single', {
          method: 'POST',
          body: imageFormData,
          credentials: 'include'
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile image');
        }
        
        const uploadData = await uploadResponse.json();
        apiFormData.profileImage = uploadData.fileUrl;
      }
      
      // Update user profile
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiFormData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      
      // Show success message
      setSuccess('Profile updated successfully');
      
      // Update the user data in the parent component
      if (onProfileUpdate) {
        onProfileUpdate(data.data);
      }
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <div className="relative">
              <div className="w-32 h-32 border rounded-full overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-purple-600" />
                  </div>
                )}
              </div>
              <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  id="profileImage" 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Upload a profile picture</p>
          </div>
          
          <div className="flex-grow space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            
            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                  placeholder="Your email"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>
          </div>
        </div>
        
        {/* Organization */}
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Your company or organization"
            />
          </div>
        </div>
        
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Tell us about yourself"
            ></textarea>
          </div>
          <p className="text-xs text-gray-500 mt-1">Share a brief professional bio. This may be visible to event participants.</p>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;