import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onLocationSelect, initialAddress = '' }) => {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null);
  const MAP_API_KEY = "f8045187228b415b8e7a34ed2f216782";

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&apiKey=${MAP_API_KEY}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setSuggestions(data.features);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setLocation(null); // Clear the map when typing starts
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const { lat, lon } = suggestion.properties;
    const formattedAddress = suggestion.properties.formatted;
    
    setLocation({ lat, lon });
    setAddress(formattedAddress);
    setSuggestions([]);
    
    onLocationSelect({
      coordinates: { lat, lon },
      address: formattedAddress
    });
  };

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <input
          className="border p-2 w-full rounded"
          type="text"
          value={address}
          onChange={handleInputChange}
          placeholder="Search for a location"
          style={{ zIndex: 20 }} // Ensures the input stays on top
        />
        
        {suggestions.length > 0 && (
          <ul 
            className="absolute z-30 w-full bg-white border border-gray-300 rounded-b max-h-48 overflow-y-auto shadow-lg"
            style={{ zIndex: 30 }} // Higher z-index to appear above the map
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.properties.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.properties.formatted}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Show map only if a location is selected */}
      {location && (
        <div 
          className="h-64 w-full rounded overflow-hidden border" 
          style={{ zIndex: 10 }} // Lower z-index than the dropdown to ensure the dropdown stays on top
        >
          <MapContainer 
            center={[location.lat, location.lon]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[location.lat, location.lon]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
