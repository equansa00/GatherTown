// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateEvent from './features/events/CreateEvent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import AllEventsPage from './pages/AllEventsPage';
import AllEventsList from './features/events/AllEventsList';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import { AuthProvider } from './context/AuthContext';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import UpdateEvent from './features/events/UpdateEvent';
import EventFetcher from './components/EventFetcher';
import './App.css';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
  };

  const handleEventHover = (event) => {
    console.log('Event hovered:', event);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setSelectedEvent(updatedEvent);
    console.log('Event updated:', updatedEvent);
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
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  loadError={loadError}
                  setLoadError={setLoadError}
                  userLocation={userLocation}
                  handleEventClick={handleEventClick}
                  handleEventHover={handleEventHover}
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                />
              }
            />
            <Route
              path="/events/:id"
              element={<EventDetailsPage onUpdateEvent={handleUpdateEvent} />}
            />
            <Route path="/all-events/:eventId" element={<AllEventsList />} />
            <Route path="/map/:eventId" element={<EventDetailsPage onUpdateEvent={handleUpdateEvent} />} />
            <Route path="/events" element={<AllEventsPage />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/all-events" element={<AllEventsPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-event/:eventId" element={<UpdateEvent onUpdate={handleUpdateEvent} />} />
          </Routes>
          <EventFetcher />
          <Footer />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;


