import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { FiMenu, FiHome, FiUsers, FiSettings, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { gql, useQuery } from '@apollo/client';
import Chatbox from './Chatbox';
import client from '@/apolloClient';

// Define the GraphQL query to fetch clients and events
const GET_CLIENTS_AND_EVENTS = gql`
  query GetClientsAndEvents {
    clients {
      id
      name
      planner {
        id
        username
      }
      events {
        id
        name
        planner {
          id
          username
        }
      }
    }
    events {
      id
      name
      planner {
        id
        username
      }
    }
  }
`;

const Sidebar = ({ userRole: propUserRole, clientName, unreadMessages }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true'; // Initialize from local storage
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [userRole, setUserRole] = useState(null); // Local state for userRole
  const [planner, setPlanner] = useState(null); // State to store planner information for clients

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', newState); // Save collapsed state to local storage
      return newState;
    });
  };

  // UseEffect to handle userRole persistence from localStorage
  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (propUserRole) {
      setUserRole(propUserRole);
    } else if (storedUserRole) {
      setUserRole(storedUserRole);
    } else {
      setUserRole(null); // Clear role if no user logged in
    }
  }, [propUserRole]); // Rerun when `propUserRole` changes

  useEffect(() => {
    // Clear selected client when event changes
    setSelectedClient(null);
  }, [selectedEvent]);

  // Apollo Client's useQuery hook to fetch clients and events
  const { loading, error, data } = useQuery(GET_CLIENTS_AND_EVENTS, {
    skip: userRole !== 'Planner' && userRole !== 'Client', // Skip the query if the user is not a planner or client
  });

  // Get the senderId from the user object (assuming it's stored in localStorage)
  const senderId = localStorage.getItem('userId');
  const clientId = localStorage.getItem('clientId');
  const plannerId = localStorage.getItem('plannerId');

  // Automatically set the client and planner when an event is selected for a client
  useEffect(() => {
    if (userRole === 'Client' && selectedEvent) {
      const eventPlanner = selectedEvent?.planner;
      if (eventPlanner) {
        setPlanner(eventPlanner);
        setSelectedClient({ id: senderId, name: clientName }); // Set the client as the logged-in user
      }
    }
  }, [selectedEvent, userRole, senderId, clientName]);

  if (!userRole || !senderId) return null;
  if (loading) return <p>Loading events and clients...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { clients, events } = data || { clients: [], events: [] };
  const filteredClients = selectedEvent
    ? clients.filter(client => client.events.some(event => event.id === selectedEvent.id))
    : clients;

  return (
    <div className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-100 border-r flex flex-col transition-all duration-300`}>
      <div className={`flex items-center justify-center w-full h-16 border-b`}>
        <Button variant="ghost" onClick={toggleSidebar} className="p-0 w-full h-full flex items-center justify-center">
          <FiMenu style={{ width: 24, height: 24 }} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 flex flex-col">
        <nav className="flex flex-col">
          <Link to={userRole === 'Planner' ? '/planner-dashboard' : '/client-dashboard'} className="flex items-center justify-center w-full h-16">
            <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
              <FiHome style={{ width: 24, height: 24 }} className="mx-4" />
              {!isCollapsed && <span>Dashboard</span>}
            </Button>
          </Link>

          {userRole === 'Planner' && (
            <>
              <div className="flex items-center justify-center w-full h-16">
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiCalendar style={{ width: 24, height: 24 }} className="mx-4" />
                  {!isCollapsed && <span>Events</span>}
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '144px' }}>
                {events.length > 0 ? events.map(event => (
                  <div
                    key={event.id}
                    className={`flex items-center ${isCollapsed ? 'justify-start' : 'justify-center'} px-2 py-2 cursor-pointer hover:bg-gray-200 ${
                      selectedEvent?.id === event.id ? 'bg-blue-200' : ''
                    }`} // Highlight selected event
                    onClick={() => setSelectedEvent(event)}
                  >
                    <span className={`truncate ${isCollapsed ? 'text-xs' : 'text-base'} ${isCollapsed ? 'w-5/6' : 'w-5/6'} ${!isCollapsed && 'text-left'}`}>{event.name}</span>
                  </div>
                )) : (
                  !isCollapsed && <p className="px-4 py-2 text-gray-500">No events</p>
                )}
              </div>

              <div className="flex items-center justify-center w-full h-16">
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiUsers style={{ width: 24, height: 24 }} className="mx-4" />
                  {!isCollapsed && <span>Clients</span>}
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '144px' }}>
                {filteredClients.length > 0 ? filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`flex items-center ${isCollapsed ? 'justify-start' : 'justify-center'} px-2 py-2 cursor-pointer hover:bg-gray-200 ${
                      selectedClient?.id === client.id ? 'bg-blue-200' : ''
                    }`} // Highlight selected client
                    onClick={() => setSelectedClient(client)}
                  >
                    <span className={`truncate ${isCollapsed ? 'text-xs' : 'text-base'} ${isCollapsed ? 'w-5/6' : 'w-5/6'} ${!isCollapsed && 'text-left'}`}>{client.name}</span>
                  </div>
                )) : (
                  !isCollapsed && <p className="px-4 py-2 text-gray-500">No clients</p>
                )}
              </div>
            </>
          )}

          {userRole === 'Client' && (
            <>
              <div className="flex items-center justify-center w-full h-16">
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiCalendar style={{ width: 24, height: 24 }} className="mx-4" />
                  {!isCollapsed && <span>Events</span>}
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '144px' }}>
                {events.length > 0 ? events.map(event => (
                  <div
                    key={event.id}
                    className={`flex items-center ${isCollapsed ? 'justify-start' : 'justify-center'} px-2 py-2 cursor-pointer hover:bg-gray-200 ${
                      selectedEvent?.id === event.id ? 'bg-blue-200' : ''
                    }`} // Highlight selected event
                    onClick={() => setSelectedEvent(event)}
                  >
                    <span className={`truncate ${isCollapsed ? 'text-xs' : 'text-base'} ${isCollapsed ? 'w-5/6' : 'w-5/6'} ${!isCollapsed && 'text-left'}`}>{event.name}</span>
                  </div>
                )) : (
                  !isCollapsed && <p className="px-4 py-2 text-gray-500">No events</p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center justify-center w-full h-16 relative">
            <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
              <FiMessageSquare style={{ width: 24, height: 24 }} className="mx-4" />
              {!isCollapsed && <span>Messages</span>}
            </Button>
            {unreadMessages > 0 && (
              <span className="absolute top-3 right-3 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                {unreadMessages}
              </span>
            )}
          </div>

          {/* Show Chatbox for Planner when both Event and Client are selected */}
          {!isCollapsed && userRole === 'Planner' && selectedClient && selectedEvent && (
            <Chatbox
              clientName={selectedClient.name}
              userRole={userRole}
              senderId={plannerId}
              receiverId={selectedClient.id}
              eventId={selectedEvent.id}
            />
          )}

          {/* Show Chatbox for Client when Event is selected */}
          {!isCollapsed && userRole === 'Client' && selectedEvent && planner && (
            <Chatbox
              clientName={clientName}
              userRole={userRole}
              senderId={clientId}
              receiverId={planner.id}
              eventId={selectedEvent.id}
            />
          )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;