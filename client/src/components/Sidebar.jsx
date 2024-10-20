import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-100 border-r">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">The Big Event</h2>
          <nav className="space-y-2">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/about">About</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link to="/contact">Contact</Link>
            </Button>
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;