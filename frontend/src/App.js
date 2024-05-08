import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import EventCard from './EventCard';
import EventDetails from './EventDetails';
import EventForm from './EventForm';
import LoginPage from './LoginPage';
import EventsList from './EventsList';

function App() {
    // Sample event data for testing
    const sampleEvent = {
      id: '1',
      title: 'Sample Event',
      description: 'This is a sample event.',
      date: '2023-01-01',
      location: 'Sample Location'
    };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<EventCard event={sampleEvent} />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/submit" element={<EventForm />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;

