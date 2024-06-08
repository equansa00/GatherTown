import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AllEventsList from '../features/events/AllEventsList';
import { fetchAllEvents } from '../api/eventsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EventSearch from '../components/EventSearch';
import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';

const AllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const [highlightedEventId, setHighlightedEventId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getAllEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllEvents({ ...searchParams, page });
        if (response && response.events) {
          setEvents(response.events);
          setTotalPages(response.totalPages);
          setTotalEvents(response.totalEvents);
          setRsvpStatus(initializeRsvpStatus(response.events));
        } else {
          setEvents([]);
          setTotalPages(0);
          setTotalEvents(0);
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

  useEffect(() => {
    if (location.state && location.state.event) {
      const newEvent = location.state.event;
      setEvents((prevEvents) => {
        if (!prevEvents.some(event => event._id === newEvent._id)) {
          return [newEvent, ...prevEvents];
        }
        return prevEvents;
      });
      setHighlightedEventId(location.state.event._id);
      const lastPage = Math.ceil(totalEvents / 10);
      navigate(`/all-events?page=${lastPage}`, { replace: true });
    }
  }, [location.state, navigate, totalEvents]);

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
      console.error('RSVP error:', error);
      alert('Failed to RSVP. Please try again later.');
    });
  };

  const handleShowOnMap = (event) => {
    navigate('/', { state: { eventId: event._id, event } });
  };

  const handleSearch = (params) => {
    setSearchParams(params);
    setPage(1);
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFirstPage = () => {
    setPage(1);
  };

  const handleLastPage = () => {
    setPage(totalPages);
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
            onEventClick={(event) => console.log('Event clicked:', event)}
            onEventHover={(event) => console.log('Event hovered:', event)}
            rsvpStatus={rsvpStatus}
            handleRSVP={handleRSVP}
            handleShowOnMap={handleShowOnMap}
            highlightedEventId={highlightedEventId}
          />
          <div className="pagination-controls">
            <button onClick={handleFirstPage} disabled={page === 1}>
              First
            </button>
           

            <button onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </button>
            <button onClick={handleLastPage} disabled={page === totalPages}>
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEventsPage;

























// // src/pages/AllEventsPage.js
// import React, { useState, useEffect } from 'react';
// import AllEventsList from '../features/events/AllEventsList';
// import { fetchAllEvents } from '../api/eventsService';
// import LoadingSpinner from '../components/LoadingSpinner';
// import ErrorDisplay from '../components/ErrorDisplay';
// import EventSearch from '../components/EventSearch';
// import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
// import { useNavigate } from 'react-router-dom';

// const AllEventsPage = () => {
//   const [events, setEvents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchParams, setSearchParams] = useState({});
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [rsvpStatus, setRsvpStatus] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const getAllEvents = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetchAllEvents({ ...searchParams, page });
//         if (response && response.events) {
//           setEvents(response.events);
//           setTotalPages(response.totalPages);
//           setRsvpStatus(initializeRsvpStatus(response.events));
//         } else {
//           setEvents([]);
//           setTotalPages(0);
//         }
//         setError(null);
//       } catch (err) {
//         setError('Failed to load events');
//         console.error('Error while loading events:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     getAllEvents();
//   }, [searchParams, page]);

//   const handleRSVP = async (eventId, e) => {
//     e.stopPropagation();
//     await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
//       console.error('RSVP error:', error);
//       alert('Failed to RSVP. Please try again later.');
//     });
//   };

//   const handleShowOnMap = (event) => {
//     navigate('/', { state: { eventId: event._id, event } });
//   };

//   const handleSearch = (params) => {
//     setSearchParams(params);
//     setPage(1); // Reset to first page on new search
//   };

//   const handleNextPage = () => {
//     setPage((prevPage) => Math.min(prevPage + 1, totalPages));
//   };

//   const handlePreviousPage = () => {
//     setPage((prevPage) => Math.max(prevPage - 1, 1));
//   };

//   const handleFirstPage = () => {
//     setPage(1);
//   };

//   const handleLastPage = () => {
//     setPage(totalPages);
//   };

//   return (
//     <div className="all-events-page">
//       <h1>All Events</h1>
//       <EventSearch onSearch={handleSearch} />
//       {isLoading && <LoadingSpinner />}
//       {error && <ErrorDisplay message={error} />}
//       {!isLoading && !error && (
//         <>
//           <AllEventsList
//             events={events}
//             onEventClick={(event) => console.log('Event clicked:', event)}
//             onEventHover={(event) => console.log('Event hovered:', event)}
//             rsvpStatus={rsvpStatus}
//             setRsvpStatus={setRsvpStatus}
//             handleRSVP={handleRSVP} // Pass the handleRSVP function
//             handleShowOnMap={handleShowOnMap} // Pass the handleShowOnMap function
//           />
//           <div className="pagination-controls">
//             <button onClick={handleFirstPage} disabled={page === 1}>
//               First
//             </button>
//             <button onClick={handlePreviousPage} disabled={page === 1}>
//               Previous
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button onClick={handleNextPage} disabled={page === totalPages}>
//               Next
//             </button>
//             <button onClick={handleLastPage} disabled={page === totalPages}>
//               Last
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AllEventsPage;
