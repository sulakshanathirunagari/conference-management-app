import React from 'react';
import { Users, UserPlus, Calendar, Settings, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Conference Hub</h1>
          <p className="text-indigo-200 text-sm">Admin Panel</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-3 bg-indigo-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="font-medium">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-indigo-200">admin@example.com</p>
              </div>
            </div>
          </div>
          
          <ul className="mt-6 space-y-1 px-2">
            <li>
              <a href="#" className="flex items-center px-4 py-2.5 text-indigo-100 bg-indigo-800 rounded-lg group">
                <Users className="w-5 h-5 mr-3" />
                <span>Users</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-2.5 text-indigo-100 hover:bg-indigo-600 rounded-lg group">
                <UserPlus className="w-5 h-5 mr-3" />
                <span>Invite Users</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-2.5 text-indigo-100 hover:bg-indigo-600 rounded-lg group">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Events</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-2.5 text-indigo-100 hover:bg-indigo-600 rounded-lg group">
                <Settings className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-indigo-100 hover:bg-indigo-600 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          </div>
        </header>
        
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Conferences</h3>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-sm text-green-600 mt-2">+2 this month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Organizers</h3>
              <p className="text-3xl font-bold mt-2">24</p>
              <p className="text-sm text-green-600 mt-2">+5 this month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Speakers</h3>
              <p className="text-3xl font-bold mt-2">86</p>
              <p className="text-sm text-green-600 mt-2">+12 this month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Attendees</h3>
              <p className="text-3xl font-bold mt-2">1,245</p>
              <p className="text-sm text-green-600 mt-2">+230 this month</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 whitespace-nowrap">John Doe</td>
                    <td className="py-3 px-4 whitespace-nowrap">john@example.com</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Organizer</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">Apr 12, 2025</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 whitespace-nowrap">Jane Smith</td>
                    <td className="py-3 px-4 whitespace-nowrap">jane@example.com</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Speaker</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">Apr 11, 2025</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 whitespace-nowrap">Robert Johnson</td>
                    <td className="py-3 px-4 whitespace-nowrap">robert@example.com</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Attendee</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">Apr 10, 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Conferences</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <h4 className="font-medium">Web Development Summit 2025</h4>
                <p className="text-sm text-gray-600">April 20-22, 2025 • San Francisco, CA</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">AI & Machine Learning Conference</h4>
                <p className="text-sm text-gray-600">May 5-7, 2025 • New York, NY</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">DevOps & Cloud Computing Expo</h4>
                <p className="text-sm text-gray-600">May 15-17, 2025 • Austin, TX</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;