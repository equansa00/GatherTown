import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changePassword } from '../services/profileService';
import { deleteEvent } from '../api/eventsService';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [createdEvents, setCreatedEvents] = useState([]);
  const [rsvpedEvents, setRsvpedEvents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [eventUpdateMessage, setEventUpdateMessage] = useState('');
  const [eventDeleteMessage, setEventDeleteMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user, createdEvents, rsvpedEvents } = await getUserProfile();
        setUser(user);
        setCreatedEvents(createdEvents);
        setRsvpedEvents(rsvpedEvents);
        setProfileForm({ name: user.firstName, email: user.email });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const updatedUser = await updateUserProfile(profileForm);
      setUser(updatedUser);
      setEditMode(false);
      setEventUpdateMessage('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordChangeMessage(response.message); // Set the success message
      alert('Password changed successfully. Please sign in again.');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setCreatedEvents(createdEvents.filter(event => event._id !== eventId));
      setEventDeleteMessage('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again later.');
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <div className="profile-info">
        {editMode ? (
          <>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Name"
            />
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Email"
            />
            <button onClick={handleProfileUpdate}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <p>Name: {user.firstName}</p>
            <p>Email: {user.email}</p>
            <button onClick={() => setEditMode(true)}>Edit</button>
          </>
        )}
        {eventUpdateMessage && <p>{eventUpdateMessage}</p>} {/* Display the success message for profile update */}
      </div>
      <div className="change-password">
        <h2>Change Password</h2>
        <input
          type="password"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          placeholder="Current Password"
        />
        <input
          type="password"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          placeholder="New Password"
        />
        <button onClick={handleChangePassword}>Change Password</button>
        {passwordChangeMessage && <p>{passwordChangeMessage}</p>} {/* Display the success message */}
      </div>
      <div className="events-list">
        <h2>Events Created</h2>
        <ul>
          {createdEvents.map(event => (
            <li key={event._id}>
              <Link to={`/events/${event._id}`}>{event.title}</Link>
              <button onClick={() => navigate(`/edit-event/${event._id}`)}>Edit</button>
              <button onClick={() => handleDeleteEvent(event._id)}>Delete</button>
            </li>
          ))}
        </ul>
        {eventDeleteMessage && <p>{eventDeleteMessage}</p>} {/* Display the success message for event deletion */}
        <h2>Events RSVPed</h2>
        <ul>
          {rsvpedEvents.map(event => (
            <li key={event._id}>
              <Link to={`/events/${event._id}`}>{event.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
