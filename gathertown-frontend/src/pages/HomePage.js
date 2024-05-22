import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import EventList from '../features/events/EventsList';
import { fetchEvents } from '../api/eventsService';
import { getLocation } from '../components/LocationService';

function HomePage() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [position, setPosition] = useState({ lat: 40.730610, lng: -73.935242 }); // Default to New York City

    useEffect(() => {
        console.log("HomePage: useEffect triggered - Requesting geolocation...");
        getLocation(
            position => {
                console.log(`HomePage: Geolocation success - Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
                setPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                console.log("HomePage: Fetching events based on current position...");
                // Increase the search radius to 200 miles (approximately 321868 meters)
                fetchEvents(position.coords.latitude, position.coords.longitude, 321868)
                .then(eventsData => {
                    console.log(`HomePage: Events fetched: ${eventsData.length} found`, eventsData);
                    setEvents(eventsData);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("HomePage: Error fetching events:", error);
                    setIsLoading(false);
                });            
            },
            error => {
                console.error("HomePage: Geolocation error:", error);
                setIsLoading(false);
            }
        );
    }, []);
    
    if (isLoading) {
        console.log('Loading data...');
        return <p>Loading events...</p>;
    }

    if (events.length === 0) {
        console.log('No events found at the fetched location.');
        return <p>No events found near your location.</p>;
    }

    console.log('Rendering the HomePage with events and map...');
    return (
        <div className="container">
            <div className="map">
                <MapComponent
                    center={hoveredEvent || selectedEvent ? 
                            { lat: hoveredEvent?.location.coordinates[1] || selectedEvent.location.coordinates[1], 
                              lng: hoveredEvent?.location.coordinates[0] || selectedEvent.location.coordinates[0] } 
                            : position}
                    events={events}
                    hoveredEvent={hoveredEvent}
                    selectedEventId={selectedEvent && selectedEvent._id}
                />
            </div>
            <div className="event-list">
                <EventList 
                    events={events}
                    onEventHover={setHoveredEvent}
                    onEventSelect={setSelectedEvent}
                />
            </div>
        </div>
    );
}

export default HomePage;
