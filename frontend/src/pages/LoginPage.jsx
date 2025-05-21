// import React, { useState } from 'react';
// import { Eye, EyeOff, User, Lock } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//         credentials: 'include',
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//       }
      
//       // Store user data in localStorage or context if needed
//       localStorage.setItem('user', JSON.stringify(data.user));
//       localStorage.setItem('token', data.token);
      
//       // Alert with role info (you can remove this in production)
//       alert(`Successfully logged in as ${data.user.role}. Redirecting to dashboard...`);
      
//       // Navigate based on user role
//       switch (data.user.role) {
//         case 'admin':
//           navigate('/admin/dashboard');
//           break;
//         case 'organizer':
//           navigate('/organizer/dashboard');
//           break;
//         case 'speaker':
//           navigate('/speaker/dashboard');
//           break;
//         case 'attendee':
//           navigate('/attendee/dashboard');
//           break;
//         default:
//           navigate('/');
//       }
//     } catch (err) {
//       setError(err.message || 'An error occurred during login');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
//       <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl">
//         <div className="bg-white p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
//             <p className="text-gray-600 mt-2">Sign in to your conference hub account</p>
//           </div>
          
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}
          
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
//                 Email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="you@example.com"
//                   required
//                 />
//               </div>
//             </div>
            
//             <div className="space-y-2">
//               <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} className="text-gray-400" />
//                   ) : (
//                     <Eye size={18} className="text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>
            
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                   Remember me
//                 </label>
//               </div>
              
//               <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
//                 Forgot password?
//               </a>
//             </div>
            
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>
          
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
//                 Register here
//               </a>
//             </p>
//           </div>
//         </div>
        
//         <div className="bg-indigo-600 py-4 px-8 text-center">
//           <p className="text-xs text-indigo-200">
//             © {new Date().getFullYear()} Conference Hub. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store user data in localStorage or context if needed
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Alert with role info (you can remove this in production)
      alert(`Successfully logged in as ${data.user.role}. Redirecting to dashboard...`);
      
      // Navigate based on user role
      switch (data.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'organizer':
          navigate('/organizer/dashboard');
          break;
        case 'speaker':
          navigate('/speaker/dashboard');
          break;
        case 'attendee':
          navigate('/attendee/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl flex">
        {/* Left side with image */}
        <div className="w-1/2 bg-indigo-700 flex items-center justify-center p-8 hidden md:flex">
          <div className="relative w-full h-full">
            {/* Conference illustration/image */}
            <div className="absolute inset-0 bg-cover bg-center rounded-l-lg" 
                 style={{ 
                   backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')",
                   filter: "brightness(0.8)" 
                 }}>
            </div>
            <div className="absolute inset-0 bg-indigo-900 opacity-50 rounded-l-lg"></div>
            <div className="relative z-10 h-full flex flex-col justify-center text-white p-6">
              <h2 className="text-3xl font-bold mb-4">Conference Hub</h2>
              <p className="text-lg mb-6">Connect, learn, and engage with industry professionals at our premier events.</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Access all event materials
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Network with speakers
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Manage your schedule
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right side with login form */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your conference hub account</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Register here
              </a>
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Conference Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;