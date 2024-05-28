// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SubmitEvent from './features/events/SubmitEvent'; // Import SubmitEvent component
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import AllEventsPage from './pages/AllEventsPage'; // Create and import AllEventsPage component
import Login from './features/auth/Login'; // Ensure this file exists
import Register from './features/auth/Register'; // Ensure this file exists
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage googleMapsApiKey={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />} />
            <Route path="/submit" element={<SubmitEvent />} />
            <Route path="/all-events" element={<AllEventsPage />} /> {/* Define route for All Events page */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;

