import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { gql, useMutation, useQuery } from '@apollo/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LocationPicker from '../components/LocationPicker';

const CREATE_CLIENT_MUTATION = gql`
  mutation CreateClient($name: String!, $email: String!, $phone: String!, $password: String!, $plannerId: ID, $eventId: ID) {
    createClient(name: $name, email: $email, phone: $phone, password: $password, plannerId: $plannerId, eventId: $eventId) {
      user {
        id
        username
        email
      }
      client {
        id
        name
      }
    }
  }
`;

const ASSIGN_CLIENT_MUTATION = gql`
  mutation AssignClientToPlannerAndEvent($clientId: ID!, $plannerId: ID, $eventId: ID) {
    assignClientToPlannerAndEvent(clientId: $clientId, plannerId: $plannerId, eventId: $eventId) {
      id
      name
      planner {
        id
        name
      }
      events {
        id
        name
      }
    }
  }
`;

const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($name: String!, $description: String, $startDate: String!, $endDate: String!, $location: String!, $plannerId: ID, $clientId: ID) {
    createEvent(name: $name, description: $description, startDate: $startDate, endDate: $endDate, location: $location, plannerId: $plannerId, clientId: $clientId) {
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
      clients {
        id
        name
      }
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
    }
  }
`;

const GET_PLANNERS = gql`
  query GetPlanners {
    planners {
      id
      name
    }
  }
`;

const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      name
    }
  }
`;

const PlannerSettings = () => {
  const { register: registerClient, handleSubmit: handleSubmitClient, formState: { errors: clientErrors } } = useForm();
  const { register: registerEvent, handleSubmit: handleSubmitEvent, formState: { errors: eventErrors } } = useForm();
  const { register: registerAssign, handleSubmit: handleSubmitAssign, setValue: setAssignValue, formState: { errors: assignErrors } } = useForm();
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [eventLocation, setEventLocation] = useState('');
  const [eventCoordinates, setEventCoordinates] = useState(null);
  const [createClient] = useMutation(CREATE_CLIENT_MUTATION);
  const [assignClient] = useMutation(ASSIGN_CLIENT_MUTATION);
  const [createEvent] = useMutation(CREATE_EVENT_MUTATION);
  const { data: clientsData, loading: clientsLoading, error: clientsError } = useQuery(GET_CLIENTS);
  const { data: plannersData, loading: plannersLoading, error: plannersError } = useQuery(GET_PLANNERS);
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS);
  const [statusMessage, setStatusMessage] = useState('');

  const onCreateEvent = async (data) => {
    try {
      // Format location as either coordinates or address
      const locationString = eventCoordinates 
        ? `${eventCoordinates.lat},${eventCoordinates.lon}`
        : eventLocation;

      const eventResponse = await createEvent({
        variables: {
          name: data.eventName,
          description: data.eventDescription || '',
          startDate: startDate ? startDate.toISOString() : '',
          endDate: endDate ? endDate.toISOString() : '',
          location: locationString,
          plannerId: data.plannerId || null,
          clientId: data.clientId || null,
        },
        refetchQueries: [{ query: GET_EVENTS }],
      });
  
      console.log('Create Event Response:', eventResponse.data.createEvent);
      setStatusMessage('Event created successfully!');
  
      if (data.plannerId && data.clientId) {
        try {
          const assignResponse = await assignClient({
            variables: {
              clientId: String(data.clientId),
              plannerId: String(data.plannerId),
              eventId: String(eventResponse.data.createEvent.id),
            },
          });
  
          console.log('Assign Client Response:', assignResponse.data.assignClientToPlannerAndEvent);
          setStatusMessage('Event created and client assigned successfully!');
        } catch (assignError) {
          console.error('Error assigning client to planner and event:', assignError);
          setStatusMessage(`Event created successfully, but client assignment failed: ${assignError.message}`);
        }
      }
    } catch (eventError) {
      console.error('Error creating event:', eventError);
      setStatusMessage(`Error creating event: ${eventError.message}`);
    }
  };

  const onCreateClient = async (data) => {
    try {
      const response = await createClient({
        variables: {
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone,
          password: data.clientPassword,
          plannerId: data.plannerId || null,
          eventId: data.eventId || null,
        },
        refetchQueries: [{ query: GET_CLIENTS }],
      });
      console.log('Create Client Response:', response.data.createClient);
      setStatusMessage('Client created successfully!');
    } catch (error) {
      console.error('Error creating client:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const onAssignClient = async (data) => {
    try {
      const clientId = String(data.clientId);
      const plannerId = data.plannerId ? String(data.plannerId) : null;
      const eventId = data.eventId ? String(data.eventId) : null;

      console.log('Assigning client with data:', {
        clientId,
        plannerId,
        eventId
      });

      const response = await assignClient({
        variables: {
          clientId,
          plannerId,
          eventId
        },
        refetchQueries: [
          { query: GET_CLIENTS },
          { query: GET_EVENTS },
          { query: GET_PLANNERS }
        ]
      });

      console.log('Assignment successful:', response.data);
      setStatusMessage('Client assigned successfully!');
      
      setAssignValue('clientId', '');
      setAssignValue('plannerId', '');
      setAssignValue('eventId', '');
    } catch (error) {
      console.error('Error assigning client:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const handleEventSelect = (e) => {
    const eventId = e.target.value;
    setAssignValue('eventId', eventId);
  };

  useEffect(() => {
    if (clientsData && clientsData.clients.length > 0) {
      const client = clientsData.clients[0];
      setAssignValue('clientId', client.id);
    }
  }, [clientsData, setAssignValue]);

  if (clientsLoading || plannersLoading || eventsLoading) return <p>Loading...</p>;
  if (clientsError || plannersError || eventsError) {
    console.error('Error loading data:', { clientsError, plannersError, eventsError });
    return <p>Error loading data</p>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {statusMessage && <p className="text-red-500 mb-4">{statusMessage}</p>}
      <div className="flex">
        {/* Left Side: Create Client */}
        <div className="w-1/2 pr-4">
          <h2 className="text-xl font-bold mb-4">Create Client</h2>
          <form onSubmit={handleSubmitClient(onCreateClient)}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Client Name</label>
              <input
                className="border p-2 w-full"
                {...registerClient('clientName', { required: 'Client name is required' })}
              />
              {clientErrors.clientName && <p className="text-red-500">{clientErrors.clientName.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Client Email</label>
              <input
                className="border p-2 w-full"
                type="email"
                {...registerClient('clientEmail', { required: 'Client email is required' })}
              />
              {clientErrors.clientEmail && <p className="text-red-500">{clientErrors.clientEmail.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Client Phone</label>
              <input
                className="border p-2 w-full"
                type="tel"
                {...registerClient('clientPhone', { required: 'Client phone is required' })}
              />
              {clientErrors.clientPhone && <p className="text-red-500">{clientErrors.clientPhone.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Client Password</label>
              <input
                className="border p-2 w-full"
                type="password"
                {...registerClient('clientPassword', { required: 'Client password is required' })}
              />
              {clientErrors.clientPassword && <p className="text-red-500">{clientErrors.clientPassword.message}</p>}
            </div>

            <button type="submit" className="bg-blue-500 text-white p-2">Create Client</button>
          </form>
        </div>

        {/* Right Side: Create Event */}
        <div className="w-1/2 pl-4">
          <h2 className="text-xl font-bold mb-4">Create Event</h2>
          <form onSubmit={handleSubmitEvent(onCreateEvent)}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Event Name</label>
              <input
                className="border p-2 w-full"
                {...registerEvent('eventName', { required: 'Event name is required' })}
              />
              {eventErrors.eventName && <p className="text-red-500">{eventErrors.eventName.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Event Description</label>
              <input
                className="border p-2 w-full"
                {...registerEvent('eventDescription')}
              />
            </div>

            {/* Date and Time Container */}
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date and Time</label>
                <DatePicker
                  className="border p-2 w-full"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Select a start date and time"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date and Time</label>
                <DatePicker
                  className="border p-2 w-full"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Select an end date and time"
                />
              </div>
            </div>

            {/* Location Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Event Location</label>
              <LocationPicker
                initialAddress={eventLocation}
                onLocationSelect={({ coordinates, address }) => {
                  setEventLocation(address);
                  setEventCoordinates(coordinates);
                }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Planner</label>
              <select
                className="border p-2 w-full"
                {...registerEvent('plannerId')}
              >
                <option value="">Select a planner</option>
                {plannersData && plannersData.planners.map(planner => (
                  <option key={planner.id} value={String(planner.id)}>{planner.name}</option>
                ))}
                {(!plannersData || plannersData.planners.length === 0) && (
                  <option value="">No Planners Available</option>
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Client</label>
              <select
                className="border p-2 w-full"
                {...registerEvent('clientId')}
              >
                <option value="">Select a client</option>
                {clientsData && clientsData.clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
                {(!clientsData || clientsData.clients.length === 0) && (
                  <option value="">No Clients Available</option>
                )}
              </select>
            </div>

            <button type="submit" className="bg-blue-500 text-white p-2">Create Event</button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Assign Client to Planner/Event */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Assign Client to Planner/Event</h2>
        <form onSubmit={handleSubmitAssign(onAssignClient)}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Client</label>
            <select
              className="border p-2 w-full"
              {...registerAssign('clientId', { required: 'Client is required' })}
              onChange={(e) => {
                const clientId = e.target.value;
                const client = clientsData.clients.find(client => client.id === clientId);
                if (client) {
                  setAssignValue('plannerId', client.planner ? client.planner.id : '');
                  setAssignValue('eventId', client.events.length > 0 ? client.events[0].id : '');
                }
              }}
            >
              <option value="">Select a client</option>
              {clientsData && clientsData.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
              {(!clientsData || clientsData.clients.length === 0) && (
                <option value="">No Clients Available</option>
              )}
            </select>
            {assignErrors.clientId && <p className="text-red-500">{assignErrors.clientId.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Planner</label>
            <select
              className="border p-2 w-full"
              {...registerAssign('plannerId')}
            >
              <option value="">Select a planner</option>
              {plannersData && plannersData.planners.map(planner => (
                <option key={planner.id} value={String(planner.id)}>{planner.name}</option>
              ))}
              {(!plannersData || plannersData.planners.length === 0) && (
                <option value="">No Planners Available</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Event</label>
            <select
              className="border p-2 w-full"
              {...registerAssign('eventId')}
              onChange={handleEventSelect}
            >
              <option value="">Select an event</option>
              {eventsData && eventsData.events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
              {(!eventsData || eventsData.events.length === 0) && (
                <option value="">No Events Available</option>
              )}
            </select>
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2">Assign</button>
        </form>
      </div>
    </div>
  );
};

export default PlannerSettings;