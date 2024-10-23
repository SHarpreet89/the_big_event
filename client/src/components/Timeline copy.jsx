import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function EventPopup({ event, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);
  const popupRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...event, title, start, end });
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
    <div className="EventPopup" ref={popupRef}>
      <h2>Edit Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Start: </label>
          <input 
            type="datetime-local" 
            value={moment(start).format('YYYY-MM-DDTHH:mm')} 
            onChange={(e) => setStart(new Date(e.target.value))} 
          />
        </div>
        <div>
          <label>End: </label>
          <input 
            type="datetime-local" 
            value={moment(end).format('YYYY-MM-DDTHH:mm')} 
            onChange={(e) => setEnd(new Date(e.target.value))} 
          />
        </div>
        <button type="submit">Update</button>
        <button type="button" onClick={() => onDelete(event.id)}>Delete</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
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
    <div ref={calendarRef} style={{ flex: 1, overflow: 'auto' }}>
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
              <div>
                <strong>{event.title}</strong>
                <p>{moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}</p>
              </div>
            ),
          },
          day: {
            event: ({ event }) => (
              <div>
                <strong>{event.title}</strong>
                <p>{moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}</p>
              </div>
            ),
          },
          agenda: {
            event: ({ event }) => (
              <div>
                <strong>{event.title}</strong>
                <p>{moment(event.start).format('MMMM Do YYYY, h:mm a')} - {moment(event.end).format('h:mm a')}</p>
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