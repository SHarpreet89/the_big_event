import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSend } from 'react-icons/fi'; // Import the send icon from react-icons

const Chatbox = ({ clientName, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: userRole === 'Planner' ? 'Planner' : 'Client' }]);
      setMessage('');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[50vh]"> {/* Set fixed height to 50% of viewport height */}
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="mb-2">
          <h2 className="text-md font-medium">{clientName ? `Chat with ${clientName}` : 'No client selected'}</h2>
        </div>
        <hr className="mb-4" />
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`p-2 rounded ${msg.sender === 'Planner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="w-1/5 flex justify-center items-center">
            <FiSend size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Chatbox;