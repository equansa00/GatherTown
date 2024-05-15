import React, { useState } from 'react';
import { submitEvent } from '../../api/eventsService';

const SubmitEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = { title, description, date, location, category };

    try {
      const response = await submitEvent(eventData);
      console.log('Event submitted successfully:', response);
      // Optionally, reset form fields here
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
      </label>
      <label>
        Date:
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>
        Location:
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        Category:
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <button type="submit">Submit Event</button>
    </form>
  );
};

export default SubmitEvent;
