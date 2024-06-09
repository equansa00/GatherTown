import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateEvent.css';

const CreateEvent = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'Other',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    images: '',
    ageGroup: '',
    interests: '',
    tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const geocodeAddress = async (address) => {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json`, {
      params: {
        access_token: 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'
      }
    });
    if (response.data.features && response.data.features.length > 0) {
      const [longitude, latitude] = response.data.features[0].geometry.coordinates;
      return [longitude, latitude];
    }
    return [0, 0];
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const address = `${eventData.street}, ${eventData.city}, ${eventData.state}, ${eventData.country}, ${eventData.zipCode}`;
    const coordinates = await geocodeAddress(address);
    const event = {
      ...eventData,
      location: {
        type: 'Point',
        coordinates: coordinates,
        street: eventData.street,
        city: eventData.city,
        state: eventData.state,
        country: eventData.country,
        zipCode: eventData.zipCode,
      },
    };

    try {
      let imageUploadUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'your_upload_preset'); // replace with your upload preset
        const imageUploadResponse = await axios.post('https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload', formData);
        imageUploadUrl = imageUploadResponse.data.secure_url;
      }
      event.images = imageUploadUrl ? [imageUploadUrl] : [];

      const response = await axios.post('http://localhost:5000/api/events', event, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Event created successfully:', response.data);
      navigate('/all-events', { state: { eventId: response.data._id, event: response.data } });
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request data:', error.request);
      } else {
        console.error('General error message:', error.message);
      }
    }
  };

  return (
    <div className="create-event-container">
            <h1>Create Event</h1>

    <form onSubmit={handleFormSubmit}>
      <label>
        Title:
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Date:
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Time:
        <input
          type="time"
          name="time"
          value={eventData.time}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Category:
        <select
          name="category"
          value={eventData.category}
          onChange={handleInputChange}
          required
        >
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Art">Art</option>
          <option value="Food">Food</option>
          <option value="Tech">Tech</option>
          <option value="Recreation">Recreation</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label>
        Street:
        <input
          type="text"
          name="street"
          value={eventData.street}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        City:
        <input
          type="text"
          name="city"
          value={eventData.city}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        State:
        <input
          type="text"
          name="state"
          value={eventData.state}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Country:
        <input
          type="text"
          name="country"
          value={eventData.country}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Zip Code:
        <input
          type="text"
          name="zipCode"
          value={eventData.zipCode}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Upload Image:
        <input
          type="file"
          onChange={handleFileChange}
        />
      </label>
      <button type="submit">Create Event</button>
    </form>
    </div>
  );
};

export default CreateEvent;

















// // src/pages/CreateEvent.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const CreateEvent = () => {
//   const [eventData, setEventData] = useState({
//     title: '',
//     description: '',
//     date: '',
//     time: '',
//     category: 'Other',
//     street: '',
//     city: '',
//     state: '',
//     country: '',
//     zipCode: '',
//     images: '',
//     ageGroup: '',
//     interests: '',
//     tags: '',
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEventData({
//       ...eventData,
//       [name]: value,
//     });
//   };

//   const handleFileChange = (e) => {
//     setImageFile(e.target.files[0]);
//   };

//   const geocodeAddress = async (address) => {
//     const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json`, {
//       params: {
//         access_token: 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw        '
//       }
//     });
//     if (response.data.features && response.data.features.length > 0) {
//       const [longitude, latitude] = response.data.features[0].geometry.coordinates;
//       return [longitude, latitude];
//     }
//     return [0, 0];
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     const address = `${eventData.street}, ${eventData.city}, ${eventData.state}, ${eventData.country}, ${eventData.zipCode}`;
//     const coordinates = await geocodeAddress(address);
//     const event = {
//       ...eventData,
//       location: {
//         type: 'Point',
//         coordinates: coordinates,
//         street: eventData.street,
//         city: eventData.city,
//         state: eventData.state,
//         country: eventData.country,
//         zipCode: eventData.zipCode,
//       },
//     };

//     try {
//       let imageUploadUrl = '';
//       if (imageFile) {
//         const formData = new FormData();
//         formData.append('file', imageFile);
//         formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');  // Replace with your actual Cloudinary upload preset
//         const imageUploadResponse = await axios.post('https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_CLOUD_NAME/image/upload', formData);
//         imageUploadUrl = imageUploadResponse.data.secure_url;
//       }
//       event.images = imageUploadUrl ? [imageUploadUrl] : [];

//       const response = await axios.post('http://localhost:5000/api/events', event, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       console.log('Event created successfully:', response.data);
//       navigate('/all-events', { state: { eventId: response.data._id, event: response.data } });
//     } catch (error) {
//       console.error('Error creating event:', error);
//       if (error.response) {
//         console.error('Error response data:', error.response.data);
//         console.error('Error response status:', error.response.status);
//         console.error('Error response headers:', error.response.headers);
//       } else if (error.request) {
//         console.error('Error request data:', error.request);
//       } else {
//         console.error('General error message:', error.message);
//       }
//     }
//   };

//   return (
//     <form onSubmit={handleFormSubmit}>
//       <label>
//         Title:
//         <input
//           type="text"
//           name="title"
//           value={eventData.title}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Description:
//         <textarea
//           name="description"
//           value={eventData.description}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Date:
//         <input
//           type="date"
//           name="date"
//           value={eventData.date}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Time:
//         <input
//           type="time"
//           name="time"
//           value={eventData.time}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Category:
//         <select
//           name="category"
//           value={eventData.category}
//           onChange={handleInputChange}
//           required
//         >
//           <option value="Music">Music</option>
//           <option value="Sports">Sports</option>
//           <option value="Art">Art</option>
//           <option value="Food">Food</option>
//           <option value="Tech">Tech</option>
//           <option value="Recreation">Recreation</option>
//           <option value="Other">Other</option>
//         </select>
//       </label>
//       <label>
//         Street:
//         <input
//           type="text"
//           name="street"
//           value={eventData.street}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         City:
//         <input
//           type="text"
//           name="city"
//           value={eventData.city}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         State:
//         <input
//           type="text"
//           name="state"
//           value={eventData.state}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Country:
//         <input
//           type="text"
//           name="country"
//           value={eventData.country}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Zip Code:
//         <input
//           type="text"
//           name="zipCode"
//           value={eventData.zipCode}
//           onChange={handleInputChange}
//           required
//         />
//       </label>
//       <label>
//         Upload Image:
//         <input
//           type="file"
//           onChange={handleFileChange}
//         />
//       </label>
//       <button type="submit">Create Event</button>
//     </form>
//   );
// };

// export default CreateEvent;
