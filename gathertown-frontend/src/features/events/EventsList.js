import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import EventListItem from './EventListItem';
import { fetchEvents, rsvpToEvent } from '../../api/eventsService';

function EventsList({ onEventHover, onEventSelect }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(1); // Pagination support

  useEffect(() => {
    fetchInitialEvents();
  }, []);

  const fetchInitialEvents = async () => {
    try {
      const initialEvents = await fetchEvents(40.712776, -74.005974, 10000); // Example: New York coordinates
      setEvents(initialEvents);
      setNextPage(nextPage + 1); // Increment page for the next fetch
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchMoreData = async () => {
    try {
      const moreEvents = await fetchEvents(40.712776, -74.005974, 10000, nextPage);
      if (moreEvents.length === 0) {
        setHasMore(false);
      } else {
        setEvents(prevEvents => [...prevEvents, ...moreEvents]);
        setNextPage(nextPage + 1); // Update the page number after successful fetch
      }
    } catch (error) {
      console.error("Failed to fetch more events:", error);
    }
  };

  const handleEventSelect = event => {
    setSelectedEvent(selectedEvent === event ? null : event);
    if (onEventSelect) {
      onEventSelect(event);  // Guard against undefined function
    }
  };

  const handleEventHover = event => {
    if (onEventHover) {  // Guard against undefined function
      onEventHover(event);
    }
    console.log("Hovered over event:", event.title);
  };

  const handleRSVP = async eventId => {
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  return (
    <InfiniteScroll
      dataLength={events.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      height={400}
      style={{ overflow: 'visible' }}
    >
      {events.map(event => (
        <EventListItem
          key={event._id}
          event={event}
          onHover={handleEventHover}
          onSelect={handleEventSelect}
          isSelected={selectedEvent === event}
          onRSVP={handleRSVP}
        />
      ))}
    </InfiniteScroll>
  );
}

export default EventsList;
