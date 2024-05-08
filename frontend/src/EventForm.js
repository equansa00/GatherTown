import React, { useState } from 'react';

function EventForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit these details to the API
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
      <input type="text" name="date" value={formData.date} onChange={handleChange} placeholder="Date" />
      <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
      <select name="category" value={formData.category} onChange={handleChange}>
        <option value="">Select Category</option>
        <option value="Music">Music</option>
        <option value="Sports">Sports</option>
        <option value="Art">Art</option>
      </select>
      <button type="submit">Submit Event</button>
    </form>
  );
}

export default EventForm;
