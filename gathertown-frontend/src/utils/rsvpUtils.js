// src/utils/rsvpUtils.js

import { rsvpToEvent } from '../api/eventsService';

export const initializeRsvpStatus = (events) => {
  return events.map(event => ({ id: event._id, isRSVPed: event.isRSVPed || false }));
};

export const handleRsvp = async (eventId, rsvpStatus, setRsvpStatus, onError) => {
  try {
    const eventStatus = rsvpStatus.find(status => status.id === eventId);
    if (eventStatus.isRSVPed) {
      alert('You have already RSVPed to this event.');
      return;
    }

    await rsvpToEvent(eventId);
    alert('RSVP successful!');
    setRsvpStatus(rsvpStatus.map(status => 
      status.id === eventId ? { ...status, isRSVPed: true } : status
    ));
  } catch (error) {
    alert('Failed to RSVP');
    console.error('RSVP error:', error);
    if (onError) onError(error);
  }
};
