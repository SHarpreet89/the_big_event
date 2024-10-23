import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { FiMenu, FiHome, FiUsers, FiSettings, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { gql, useQuery } from '@apollo/client';
import Chatbox from './Chatbox';
import ChatboxClient from './ChatboxClient';

const GET_CLIENTS_AND_EVENTS = gql`
  query GetClientsAndEvents {
    clients {
      id
      name
      planner {
        id
        name
      }
      events {
        id
        name
        planner {
          id
          name
        }
      }
    }
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
      clients {
        id
        name
      }
    }
  }
`;

const Sidebar = ({ 
  userRole: propUserRole, 
  clientName, 
  unreadMessages,
  showOnlyMyEvents,
  onShowOnlyMyEventsChange 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState === 'true';
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [planner, setPlanner] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const senderId = localStorage.getItem('userId');
  const clientId = localStorage.getItem('clientId');
  const plannerId = localStorage.getItem('plannerId');

  const { loading, error, data } = useQuery(GET_CLIENTS_AND_EVENTS, {
    skip: userRole !== 'Planner' && userRole !== 'Client',
    onCompleted: (data) => {
      //console.log('Query completed successfully:', data);
    }
  });

  // Debug current state
  // useEffect(() => {
  //   console.log('Current render state:', {
  //     selectedEvent,
  //     planner,
  //     userRole,
  //     isChatVisible,
  //     clientId,
  //     clientName
  //   });
  // }, [selectedEvent, planner, userRole, isChatVisible, clientId, clientName]);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (propUserRole) {
      setUserRole(propUserRole);
    } else if (storedUserRole) {
      setUserRole(storedUserRole);
    } else {
      setUserRole(null);
    }
  }, [propUserRole]);

  // Event selection handler
  const handleEventSelection = (event) => {
    setSelectedEvent(event);
    setIsChatVisible(false);
  
    // This block is only for clients
    if (userRole === 'Client' && event?.planner) {
      setPlanner(event.planner);
      setSelectedClient({ id: clientId, name: clientName });
  
      setTimeout(() => {
        setIsChatVisible(true);
      }, 100);
    }
  
    // Dispatch event for dashboard update
    window.dispatchEvent(new CustomEvent('eventSelected', { detail: event }));
  };
  // Client selection handler (for planners)
  const handleClientSelection = (client) => {
    setSelectedClient(client);
    setIsChatVisible(true);
    //console.log('Selected client for chat:', client.name);
  };

  useEffect(() => {
    if (data?.events) {
      let filtered = [...data.events];
      
      if (userRole === 'Client') {
        filtered = filtered.filter(event => 
          event?.clients?.some(client => client?.id === clientId)
        );
        //console.log('Filtered client events:', filtered);
      } else if (userRole === 'Planner' && showOnlyMyEvents) {
        filtered = filtered.filter(event => event?.planner?.id === plannerId);
      }

      setFilteredEvents(filtered);
    }
  }, [data, userRole, clientId, plannerId, showOnlyMyEvents]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', newState);
      return newState;
    });
  };

  const getFilteredClients = (clients, selectedEvent) => {
    if (!selectedEvent) return [];
    return clients.filter(client => 
      client.events.some(event => event?.id === selectedEvent?.id)
    );
  };

  // Chat render function with debug logging
  const renderChat = () => {
    if (isCollapsed || !isChatVisible) {
      //console.log('Chat hidden due to:', { isCollapsed, isChatVisible });
      return null;
    }

    if (userRole === 'Client' && selectedEvent && planner) {
      // console.log('Rendering client chat with:', {
      //   eventId: selectedEvent.id,
      //   plannerId: planner.id,
      //   clientId
      // });

      return (
        <div className="px-4 py-3 bg-white rounded-lg shadow-lg">
          <ChatboxClient
            key={`chat-${selectedEvent.id}-${Date.now()}`}
            clientName={clientName}
            userRole={userRole}
            senderId={clientId}
            receiverId={planner.id}
            eventId={selectedEvent.id}
            plannerName={planner.name}
          />
        </div>
      );
    }

    if (userRole === 'Planner' && selectedClient && selectedEvent) {
      return (
        <div className="px-4 py-3 bg-white rounded-lg shadow-lg">
          <Chatbox
            key={`chat-${selectedEvent.id}-${selectedClient.id}-${Date.now()}`}
            clientName={selectedClient.name}
            userRole={userRole}
            senderId={plannerId}
            receiverId={selectedClient.id}
            eventId={selectedEvent.id}
          />
        </div>
      );
    }

    return null;
  };

  if (!userRole || !senderId) return null;
  if (loading) return <p>Loading events and clients...</p>;
  if (error) return <div>Error loading events and clients: {error.message}</div>;

  const { clients = [] } = data || {};
  const filteredClients = getFilteredClients(clients, selectedEvent);

  return (
    <div className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-100 border-r flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-center w-full h-16 border-b">
        <Button variant="ghost" onClick={toggleSidebar} className="p-0 w-full h-full flex items-center justify-center">
          <FiMenu style={{ width: 24, height: 24 }} />
        </Button>
      </div>

      <ScrollArea className="flex-1 flex flex-col">
        <nav className="flex flex-col">
          {/* Dashboard Link */}
          <Link to={userRole === 'Planner' ? '/planner-dashboard' : '/client-dashboard'} 
                className="flex items-center justify-center w-full h-16">
            <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
              <FiHome style={{ width: 24, height: 24 }} className="mx-4" />
              {!isCollapsed && <span>Dashboard</span>}
            </Button>
          </Link>

          {/* Events Section */}
          <div className="flex items-center justify-center w-full h-16">
            <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
              <FiCalendar style={{ width: 24, height: 24 }} className="mx-4" />
              {!isCollapsed && <span>Events</span>}
            </Button>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: '144px' }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div
                  key={event?.id}
                  className={`flex items-center ${isCollapsed ? 'justify-start' : 'justify-center'} 
                    px-2 py-2 cursor-pointer hover:bg-gray-200 ${
                    selectedEvent?.id === event?.id ? 'bg-blue-200' : ''
                  }`}
                  onClick={() => handleEventSelection(event)}
                >
                  <span className={`truncate ${isCollapsed ? 'text-xs' : 'text-base'} 
                    ${isCollapsed ? 'w-5/6' : 'w-5/6'} ${!isCollapsed && 'text-left'}`}>
                    {event?.name || 'Unnamed Event'}
                  </span>
                </div>
              ))
            ) : (
              !isCollapsed && <p className="px-4 py-2 text-gray-500">No events</p>
            )}
          </div>

          {/* Planner-specific sections */}
          {userRole === 'Planner' && (
            <>
              <div className="flex items-center justify-center w-full h-16">
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiUsers style={{ width: 24, height: 24 }} className="mx-4" />
                  {!isCollapsed && <span>Clients</span>}
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '144px' }}>
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <div
                      key={client?.id}
                      className={`flex items-center ${isCollapsed ? 'justify-start' : 'justify-center'} 
                        px-2 py-2 cursor-pointer hover:bg-gray-200 ${
                        selectedClient?.id === client?.id ? 'bg-blue-200' : ''
                      }`}
                      onClick={() => handleClientSelection(client)}
                    >
                      <span className={`truncate ${isCollapsed ? 'text-xs' : 'text-base'} 
                        ${isCollapsed ? 'w-5/6' : 'w-5/6'} ${!isCollapsed && 'text-left'}`}>
                        {client?.name || 'Unnamed Client'}
                      </span>
                    </div>
                  ))
                ) : (
                  !isCollapsed && <p className="px-4 py-2 text-gray-500">No clients</p>
                )}
              </div>
            </>
          )}

          {/* Messages Section */}
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

          {/* Chat Section */}
          <div className="mt-4">
            {renderChat()}
          </div>
        </nav>
      </ScrollArea>

      {/* Settings Section for Planners */}
      {userRole === 'Planner' && (
        <div className="mt-auto border-t">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 px-4 py-3 border-b">
              <Checkbox 
                id="showMyEvents" 
                checked={showOnlyMyEvents}
                onCheckedChange={(checked) => {
                  onShowOnlyMyEventsChange(checked);
                  if (checked && selectedEvent?.planner?.id !== plannerId) {
                    setSelectedEvent(null);
                    setSelectedClient(null);
                    setIsChatVisible(false);
                  }
                }}
              />
              <Label 
                htmlFor="showMyEvents" 
                className="text-sm cursor-pointer text-gray-700"
              >
                Show only my events
              </Label>
            </div>
          )}
          
          <Link to="/PlannerSettings" className="flex items-center justify-center w-full h-16">
            <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
              <FiSettings style={{ width: 24, height: 24 }} className="mx-4" />
              {!isCollapsed && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;