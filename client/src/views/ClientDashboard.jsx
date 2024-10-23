import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import TimelineClient from '../components/TimelineClient';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ClientDashboard.css';

// Define the icon for the map marker
const icon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// GraphQL Operations
const GET_CLIENT_EVENTS = gql`
  query GetClientEvents($id: ID!) {
    client(id: $id) {
      id
      name
      notes
      events {
        id
        name
        description
        startDate
        endDate
        location
        planner {
          id
          name
        }
        subevents {
          id
          name
          startDate
          endDate
        }
      }
    }
  }
`;

const UPDATE_CLIENT_NOTES = gql`
  mutation UpdateClientNotes($clientId: ID!, $notes: [String!]) {
    updateClientNotes(clientId: $clientId, notes: $notes) {
      id
      notes
    }
  }
`;

const ClientDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notes, setNotes] = useState('');
  const [map, setMap] = useState(null);
  const [showNotice, setShowNotice] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const clientId = localStorage.getItem('clientId');

  const { loading, error, data } = useQuery(GET_CLIENT_EVENTS, {
    variables: { id: clientId },
    onCompleted: (data) => {
      if (data?.client?.events) {
        try {
          const formattedEvents = data.client.events.map(event => ({
            ...event,
            title: event.name,
            start: new Date(parseInt(event.startDate)),
            end: new Date(parseInt(event.endDate))
          }));
          setEvents(formattedEvents);
          
          // Set initial notes
          if (data.client.notes && data.client.notes.length > 0) {
            setNotes(data.client.notes.join('\n'));
          }
        } catch (err) {
          console.error('Error formatting events:', err);
        }
      }
    }
  });

  const [updateClientNotes] = useMutation(UPDATE_CLIENT_NOTES, {
    onError: (error) => {
      console.error('Error saving notes:', error);
    }
  });

  useEffect(() => {
    if (selectedEvent?.location) {
      fetchCoordinates(selectedEvent.location);
    }
  }, [selectedEvent]);

  const fetchCoordinates = async (location) => {
    setMapLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates([parseFloat(lat), parseFloat(lon)]);
      } else {
        setCoordinates(null);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setCoordinates(null);
    } finally {
      setMapLoading(false);
    }
  };

  // Handle event selection from sidebar
  useEffect(() => {
    const handleEventSelection = (e) => {
      const event = e.detail;
      setSelectedEvent(event);
    };

    window.addEventListener('eventSelected', handleEventSelection);
    return () => window.removeEventListener('eventSelected', handleEventSelection);
  }, []);

  const handleSaveNotes = async () => {
    try {
      const notesList = notes.split('\n').filter(note => note.trim() !== '');
      await updateClientNotes({
        variables: {
          clientId,
          notes: notesList
        }
      });
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const carouselSettings = {
    responsive: {
      superLargeDesktop: {
        breakpoint: { max: 4000, min: 3000 },
        items: 3
      },
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 2
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
      }
    },
    infinite: false,
    autoPlay: false,
    arrows: true,
    className: "py-4"
  };

  const renderSubEventCard = (subevent) => (
    <Card className="m-2 bg-white shadow-lg">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{subevent.name}</h3>
        <p className="text-sm text-gray-600">
          {moment(parseInt(subevent.startDate)).format('MMM Do, h:mm a')} - 
          {moment(parseInt(subevent.endDate)).format('h:mm a')}
        </p>
      </CardContent>
    </Card>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl">Loading your events...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-xl text-red-600">Error loading events: {error.message}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Section - Timeline */}
      <div className="timeline-container flex-1 bg-white rounded-lg shadow-lg p-4">
        <TimelineClient 
          events={events} 
          setEvents={setEvents}
          selectedEvent={selectedEvent}
        />
      </div>

      {/* Bottom Section - Split into 3 parts */}
      <div className="h-1/3 flex gap-4">
        {/* Carousel of SubEvents */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Sub Events</h3>
          {selectedEvent?.subevents?.length > 0 ? (
            <Carousel {...carouselSettings}>
              {selectedEvent.subevents.map((subevent) => (
                <div key={subevent.id} className="p-2">
                  {renderSubEventCard(subevent)}
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No sub-events available
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="map-container flex-1 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Event Location</h2>
          <div className="h-64 rounded-md overflow-hidden border relative">
            {mapLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading map...
              </div>
            ) : coordinates ? (
              <MapContainer 
                center={coordinates} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                dragging={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={coordinates} icon={icon} />
              </MapContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">
                  {selectedEvent?.location || "Location not available"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notice */}
      {showNotice && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          <span className="block sm:inline">Notes saved successfully!</span>
        </div>
      )}

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <ScrollArea className="h-32">
          <Textarea
            placeholder="Add notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none"
          />
        </ScrollArea>
        <div className="mt-2 flex justify-end">
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={() => setNotes('')}
          >
            Clear
          </Button>
          <Button onClick={handleSaveNotes}>Save Notes</Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;