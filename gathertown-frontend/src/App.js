// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventSubmissionForm from './pages/EventSubmissionForm';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import EventsList from './features/events/EventsList';
import EventDetails from './features/events/EventDetails';
import SubmitEvent from './features/events/SubmitEvent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './App.css';

function App() {
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) {
    throw new Error('Missing Google Maps API key. Please add it to the .env file');
  }

  return (
    <Router>
      <AuthProvider>
        <div className="container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage  googleMapsApiKey={googleMapsApiKey} />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/submit-event" element={<SubmitEvent />} />
              <Route path="/submit" element={<EventSubmissionForm />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
