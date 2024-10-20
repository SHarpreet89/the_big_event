// src/components/ui/LocationPicker.jsx
import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your Mapbox access token

const LocationPicker = ({ value, onChange }) => {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value);

  const handleMapClick = (event) => {
    const [longitude, latitude] = event.lngLat;
    setSelectedLocation({ longitude, latitude });
    onChange({ longitude, latitude });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" onClick={() => setShowMap(!showMap)}>
          {selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : 'Pick a location'}
        </Button>
      </PopoverTrigger>
      {showMap && (
        <PopoverContent className="w-auto p-0">
          <Map
            initialViewState={{
              longitude: selectedLocation ? selectedLocation.longitude : -100,
              latitude: selectedLocation ? selectedLocation.latitude : 40,
              zoom: 3.5,
            }}
            style={{ width: 400, height: 300 }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            onClick={handleMapClick}
          >
            {selectedLocation && (
              <Marker longitude={selectedLocation.longitude} latitude={selectedLocation.latitude} />
            )}
          </Map>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default LocationPicker;