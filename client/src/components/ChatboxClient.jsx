import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSend } from 'react-icons/fi';

const GET_MESSAGES = gql`
  query GetMessages($plannerId: ID!, $clientId: ID!, $eventId: ID!) {
    getMessages(plannerId: $plannerId, clientId: $clientId, eventId: $eventId) {
      content
      timestamp
      senderModel
      senderId
    }
  }
`;

const GET_PLANNER_NAME = gql`
  query GetPlanner($plannerId: ID!) {
    planner(id: $plannerId) {
      id
      name
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage(
    $senderId: ID!, 
    $senderModel: String!, 
    $receiverId: ID!, 
    $receiverModel: String!, 
    $eventId: ID!, 
    $content: String!
  ) {
    sendMessage(
      senderId: $senderId,
      senderModel: $senderModel,
      receiverId: $receiverId,
      receiverModel: $receiverModel,
      eventId: $eventId,
      content: $content
    ) {
      content
      timestamp
      senderModel
      senderId
    }
  }
`;

const ChatboxClient = ({ clientName, senderId, receiverId, eventId, userRole }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Query for planner's name
  const { data: plannerData } = useQuery(GET_PLANNER_NAME, {
    variables: { plannerId: receiverId },
    skip: !receiverId || userRole !== 'Client',
  });

  console.log('ChatboxClient initialized with:', {
    senderId,
    receiverId,
    eventId,
    userRole,
    plannerName: plannerData?.planner?.name
  });

  // Query Messages
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, {
    variables: { 
      plannerId: userRole === 'Planner' ? senderId : receiverId,
      clientId: userRole === 'Client' ? senderId : receiverId,
      eventId
    },
    skip: !senderId || !receiverId || !eventId,
    pollInterval: 5000,
    onCompleted: (data) => {
      console.log('Messages received:', data?.getMessages);
    }
  });
  
  // Send Message Mutation
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessage(''); // Clear message field after successful send
      refetch();
    },
    onError: (error) => {
      console.error('Send message error:', error);
    }
  });

  // Auto-scroll effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.getMessages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const senderModel = userRole;
    const receiverModel = userRole === 'Planner' ? 'Client' : 'Planner';

    try {
      await sendMessage({
        variables: {
          senderId,
          senderModel,
          receiverId,
          receiverModel,
          eventId,
          content: message.trim()
        }
      });
      setMessage(''); // Clear message field immediately after sending
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const renderMessages = () => {
    if (!data?.getMessages) return <p>No messages yet</p>;
  
    return (
      <div className="space-y-4">
        {data.getMessages.map((msg, index) => {
          const isCurrentUser = msg.senderModel === userRole;
          const messageTime = new Date(msg.timestamp);
  
          return (
            <div key={index} 
                 className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg ${
                isCurrentUser ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`} style={{ maxWidth: '80%' }}>
                <p className="mb-1">{msg.content}</p>
                <p className="text-xs opacity-50">
                  {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  if (!senderId || !receiverId || !eventId) {
    return <p>Select an event to start chatting</p>;
  }

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error loading messages: {error.message}</p>;

  // Get the appropriate name to display
  const chatPartnerName = userRole === 'Client' 
    ? plannerData?.planner?.name || 'Planner'
    : clientName || 'Client';

  return (
    <Card className="flex flex-col h-[50vh]">
      <CardHeader>
        <CardTitle>Chat with {chatPartnerName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {renderMessages()}
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
            className="w-1/5 flex justify-center items-center"
          >
            <FiSend size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatboxClient;