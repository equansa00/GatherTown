// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  console.log('Navbar: user:', user); 

  return (
    <nav>
      <h1>GatherTown</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/all-events">All Events</Link></li>
        <li><Link to="/create-event">Create Event</Link></li>
        <li><Link to="/profile">Profile</Link></li> {/* Add a link to the profile page */}

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




