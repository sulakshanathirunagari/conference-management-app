// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/Registerpage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import SpeakerDashboard from './pages/SpeakerDashboard';
import AttendeeDashboard from './pages/AttendeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import TicketPayment from './components/tickets/TicketPayment';
import TicketSuccess from './components/tickets/TicketSuccess';
import MyTickets from './components/tickets/MyTickets';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes for Different User Roles */}
        <Route 
          path="/admin/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/organizer/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/speaker/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['speaker']}>
              <SpeakerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/attendee/dashboard/*" 
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
  path="/events/:id/tickets" 
  element={
    <ProtectedRoute>
      <TicketPayment />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/tickets/:id/success" 
  element={
    <ProtectedRoute>
      <TicketSuccess />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/tickets/my-tickets" 
  element={
    <ProtectedRoute>
      <MyTickets />
    </ProtectedRoute>
  } 
/>


        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;