import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EventsPage from './features/events/AllEventsPage';
import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SubmitEvent from './features/events/SubmitEvent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import AllEventsPage from './pages/AllEventsPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const handleEventClick = () => {
   
  };

  const handleEventHover = () => {
    
  };

  const userLocation = {
    lat: 40.73061, // Example coordinates
    lng: -73.935242
  };

  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Navbar />
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  googleMapsApiKey={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} 
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  loadError={loadError}
                  setLoadError={setLoadError}
                  userLocation={userLocation}
                  handleEventClick={handleEventClick}
                  handleEventHover={handleEventHover}
                />
              } 
            />
            <Route path="/events" component={EventsPage} />
            <Route path="/submit" element={<SubmitEvent />} />
            <Route path="/all-events" element={<AllEventsPage />} />
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


