import { useState, useEffect, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSend } from 'react-icons/fi';

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($senderId: ID!, $senderModel: String!, $receiverId: ID!, $receiverModel: String!, $eventId: ID!, $content: String!) {
    sendMessage(senderId: $senderId, senderModel: $senderModel, receiverId: $receiverId, receiverModel: $receiverModel, eventId: $eventId, content: $content) {
      id
      content
      senderId
      receiverId
      eventId
    }
  }
`;

const Chatbox = ({ clientName, userRole, senderId, receiverId, eventId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);

  const handleSendMessage = async () => {
    if (message.trim()) {
      console.log({
        senderId,
        senderModel: userRole,
        receiverId,
        receiverModel: userRole === 'Planner' ? 'Client' : 'Planner',
        eventId,
        content: message,
      });
      try {
        const response = await sendMessage({
          variables: {
            senderId,
            senderModel: userRole,
            receiverId,
            receiverModel: userRole === 'Planner' ? 'Client' : 'Planner',
            eventId,
            content: message,
          },
        });
        setMessages([...messages, { text: message, sender: userRole }]);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[50vh]">
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
            <div
              key={index}
              className={`p-2 rounded ${msg.sender === 'Planner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
            >
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
