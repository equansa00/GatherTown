import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Fetch event details from API
    fetch(`/api/events/${id}`)
      .then(response => response.json())
      .then(data => setEvent(data));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {/* Display more details here */}
    </div>
  );
}

export default EventDetails;
