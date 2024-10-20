import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { FiMenu, FiHome, FiUsers, FiSettings, FiMessageSquare } from 'react-icons/fi';
import Chatbox from './Chatbox';

const Sidebar = ({ userRole, clientName, unreadMessages }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);  // Set to true for collapsed state

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const iconSize = 24;
  const iconStyle = { width: iconSize, height: iconSize };

  const iconContainerClass = "flex items-center justify-center w-full h-16";  // Fixed height for each icon container

  return (
    <div className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-100 border-r flex flex-col transition-all duration-300`}>
      {userRole && (
        <div className={`${iconContainerClass} border-b`}>
          <Button variant="ghost" onClick={toggleSidebar} className="p-0 w-full h-full flex items-center justify-center">
            <FiMenu style={iconStyle} />
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 flex flex-col">
        {userRole ? (
          <nav className="flex flex-col">
            <Link to="/dashboard" className={iconContainerClass}>
              <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                <FiHome style={iconStyle} className="mx-4" />
                {!isCollapsed && <span>Dashboard</span>}
              </Button>
            </Link>
            
            {userRole === 'Planner' && (
              <Link to="/clients" className={iconContainerClass}>
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiUsers style={iconStyle} className="mx-4" />
                  {!isCollapsed && <span>Clients</span>}
                </Button>
              </Link>
            )}

            {isCollapsed && (
              <div className={`${iconContainerClass} relative`}>
                <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                  <FiMessageSquare style={iconStyle} className="mx-4" />
                  <span>Messages</span>
                </Button>
                {unreadMessages > 0 && (
                  <span className="absolute top-3 right-3 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </div>
            )}

            {!isCollapsed && <Chatbox clientName={clientName} userRole={userRole} />}
          </nav>
        ) : (
          <div className="flex justify-center items-center h-full">
            {/* Empty div to maintain layout */}
          </div>
        )}
        
        {userRole === 'Planner' && (
          <div className="mt-auto">
            <Link to="/PlannerSettings" className={iconContainerClass}>
              <Button variant="ghost" className="p-0 w-full h-full flex items-center justify-start">
                <FiSettings style={iconStyle} className="mx-4" />
                {!isCollapsed && <span>Settings</span>}
              </Button>
            </Link>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;