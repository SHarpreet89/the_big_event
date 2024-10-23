import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { CalendarDays, User, Users, MapPin } from "lucide-react";
import moment from 'moment';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function EventCardWithMap({ event }) {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.location)}`);
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
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [event.location]);

  return (
    <div className="h-[400px] p-4 flex justify-center"> {/* Center the card */}
      <Card className="w-[250px] h-full bg-white shadow-lg"> {/* Fixed width */}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {event.title}
          </CardTitle>
          {event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}
        </CardHeader>

        <CardContent className="h-[calc(100%-4rem)] flex flex-col">
          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Client: {event.clients?.map(client => client.name).join(', ')}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">Planner: {event.planner?.name}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <div>
                <div>{moment(event.start).format('MMM Do YYYY')}</div>
                <div className="text-xs">
                  {moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t border-gray-200 my-2" />

          {/* Map Container */}
          <div className="flex-1 min-h-[40px] rounded-md overflow-hidden border relative">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading map...
              </div>
            ) : coordinates ? (
              <MapContainer 
                center={coordinates} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
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
                  {event.location || "Location not available"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EventCardWithMap;