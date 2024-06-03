// src/pages/AllEventsPage.js
import React, { useEffect, useState } from 'react';
import { fetchAllEvents } from '../api/eventsService';
import AllEventsList from '../features/events/AllEventsList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EventSearch from '../features/events/EventSearch';

const AllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const getAllEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllEvents({ ...searchParams, page });
        console.log('Fetched events data:', response);
        if (response && response.events) {
          setEvents(response.events);
          setTotalPages(response.totalPages);
        } else {
          setEvents([]);
          setTotalPages(0);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error while loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getAllEvents();
  }, [searchParams, page]);

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const handleEventHover = (event) => {
    console.log('Event hovered:', event);
  };

  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(0); // Reset to first page on new search
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleFirstPage = () => {
    setPage(0);
  };

  const handleLastPage = () => {
    setPage(totalPages - 1);
  };

  return (
    <div className="all-events-page">
      <h1>All Events</h1>
      <EventSearch onSearch={handleSearch} />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {!isLoading && !error && (
        <>
          <AllEventsList
            events={events}
            onEventClick={handleEventClick}
            onEventHover={handleEventHover}
          />
          <div className="pagination-controls">
            <button onClick={handleFirstPage} disabled={page === 0}>
              First
            </button>
            <button onClick={handlePreviousPage} disabled={page === 0}>
              Previous
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages - 1}>
              Next
            </button>
            <button onClick={handleLastPage} disabled={page === totalPages - 1}>
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEventsPage;
