// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav>
      <h1>GatherTown</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/events">Events Near Me</Link></li>
        <li><Link to="/events">All Events</Link></li>

        <li><Link to="/submit">Submit Event</Link></li>
        {!user ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        ) : (
          <>
            <li>Welcome, {user.username}</li>
            <li><button onClick={logout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

