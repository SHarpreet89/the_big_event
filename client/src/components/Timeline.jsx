import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { gql, useMutation } from '@apollo/client';
import LocationPicker from './LocationPicker';

const localizer = momentLocalizer(moment);

// Add GraphQL mutation
const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent(
    $id: ID!
    $name: String!
    $description: String
    $startDate: String!
    $endDate: String!
    $location: String!
  ) {
    updateEvent(
      id: $id
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      location: $location
    ) {
      id
      name
      description
      startDate
      endDate
      location
    }
  }
`;

const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;

function EventPopup({ event, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(event.title || event.name); // Handle both title and name
  const [start, setStart] = useState(event.start || new Date(event.startDate)); // Handle both start and startDate
  const [end, setEnd] = useState(event.end || new Date(event.endDate)); // Handle both end and endDate
  const [location, setLocation] = useState(event.location || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const popupRef = useRef(null);

  // GraphQL mutations
  const [updateEvent] = useMutation(UPDATE_EVENT_MUTATION, {
    onError: (error) => {
      console.error('Error updating event:', error);
      setUpdateError('Failed to update event. Please try again.');
    }
  });

  const [deleteEvent] = useMutation(DELETE_EVENT_MUTATION, {
    onError: (error) => {
      console.error('Error deleting event:', error);
      setUpdateError('Failed to delete event. Please try again.');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');

    try {
      // Send mutation to update in database
      const response = await updateEvent({
        variables: {
          id: event.id,
          name: title,
          description: event.description || '',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: location
        }
      });

      if (response.data) {
        // Update local state with the returned data
        const updatedEvent = {
          ...event,
          title: title,
          name: title,
          start: start,
          end: end,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: location
        };
        
        onUpdate(updatedEvent);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setUpdateError('Failed to update event. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteEvent({
        variables: {
          id: event.id
        }
      });

      if (response.data) {
        onDelete(event.id);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setUpdateError('Failed to delete event. Please try again.');
    }
  };

  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Event</h2>
        
        {updateError && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {updateError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock size={16} />
                Start
              </label>
              <input
                type="datetime-local"
                value={moment(start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setStart(new Date(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock size={16} />
                End
              </label>
              <input
                type="datetime-local"
                value={moment(end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setEnd(new Date(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            {isEditingLocation ? (
              <LocationPicker
                initialAddress={location}
                onLocationSelect={({ address }) => {
                  setLocation(address);
                  setIsEditingLocation(false);
                }}
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Timeline({ events, setEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef(null);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(ev => 
      ev.id === updatedEvent.id ? updatedEvent : ev
    ));
    setSelectedEvent(null);
  }, [setEvents]);

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
    setSelectedEvent(null);
  }, [setEvents]);

  return (
    <div ref={calendarRef} style={{ flex: 1, overflow: 'auto' }} className="bg-yellow-50">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day', 'agenda']}
        components={{
          week: {
            event: ({ event }) => (
              <div className="p-1">
                <strong>{event.title}</strong>
                <p className="text-xs text-gray-600">{moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}</p>
                {event.location && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                  </p>
                )}
              </div>
            ),
          },
          day: {
            event: ({ event }) => (
              <div className="p-1">
                <strong>{event.title}</strong>
                <p className="text-xs text-gray-600">{moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}</p>
                {event.location && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                  </p>
                )}
              </div>
            ),
          },
          agenda: {
            event: ({ event }) => (
              <div className="p-1">
                <strong>{event.title}</strong>
                <p className="text-xs text-gray-600">
                  {moment(event.start).format('MMMM Do YYYY, h:mm a')} - {moment(event.end).format('h:mm a')}
                </p>
                {event.location && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                  </p>
                )}
              </div>
            ),
          },
        }}
      />
      {selectedEvent && (
        <EventPopup 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}

export default Timeline;