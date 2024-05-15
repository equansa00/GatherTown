///home/equansa00/Desktop/Community_Driven_Local_Event_FinderFEB22/frontend/src/pages/EventSubmissionForm.js
import React, { useState } from 'react';
import { submitEvent } from '../api/eventsApi';


const EventSubmissionForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token'); 
            if (!token) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await submitEvent(formData, token);

            // Success! 
            alert('Event submitted successfully!');
            console.log('Event creation response:', response); 
            // Reset form or redirect user

        } catch (error) {
            console.error('Error submitting event:', error);
            alert(`Failed to submit event: ${error.message}`); 
        } 

        setSubmitting(false);
    };


    return (
        <form onSubmit={handleSubmit}>
            <h2>Submit New Event</h2>
            {/* Title */}
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />

            {/* Description */}
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />

            {/* Date */}
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />

            {/* Location */}
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />

            <button type="submit" disabled={submitting}>Submit Event</button>
        </form>
    );
};

export default EventSubmissionForm;
