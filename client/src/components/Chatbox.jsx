import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSend } from 'react-icons/fi';

// GraphQL query to get messages (content and timestamp only)
const GET_MESSAGES = gql`
  query GetMessages($plannerId: ID!, $clientId: ID!, $eventId: ID!) {
    getMessages(plannerId: $plannerId, clientId: $clientId, eventId: $eventId) {
      content
      timestamp
    }
  }
`;

// GraphQL mutation to send a message
const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($senderId: ID!, $senderModel: String!, $receiverId: ID!, $receiverModel: String!, $eventId: ID!, $content: String!) {
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
    }
  }
`;

const Chatbox = ({ clientName, senderId, receiverId, eventId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Apollo useQuery to fetch messages (content and timestamp)
  const { loading, error, data, refetch } = useQuery(GET_MESSAGES, {
    variables: { 
      plannerId: senderId || '',
      clientId: receiverId || '',
      eventId: eventId || ''
    },
    skip: !senderId || !receiverId || !eventId,
    onError: (error) => {
      console.error('GraphQL error:', error);
    }
  });

  // Apollo useMutation to send a message
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => {
      setMessage('');
      refetch();  // Check for new messages after sending
    },
    onError: (error) => {
      console.error('Mutation error details:', error);
      if (error.networkError) {
        console.error('Network error:', error.networkError.result.errors);
      } else if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }
    }
  });

  // Auto-scroll to the bottom when new messages are loaded
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.getMessages]);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
  
    try {
      console.log('Sending message:', { senderId, senderModel: 'Planner', receiverId, receiverModel: 'Client', eventId, content: message.trim() });
  
      await sendMessage({
        variables: {
          senderId,
          senderModel: 'Planner',  // Assuming Planner is the sender's role
          receiverId,
          receiverModel: 'Client', // Assuming Client is the receiver's role
          eventId,
          content: message.trim()
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  // Function to render messages in the chatbox
  const renderMessages = () => {
    if (!data?.getMessages) return <p>No messages yet</p>;

    return (
      <div className="space-y-4">
        {data.getMessages.map((msg, index) => {
          const messageTime = new Date(msg.timestamp); // Convert timestamp to a Date object

          return (
            <div key={index} className="flex flex-col items-start">
              <div className="p-3 rounded-lg bg-green-100 text-green-800" style={{ maxWidth: '80%' }}>
                <p className="mb-1">{msg.content}</p>
                <p className="text-xs opacity-50">
                  {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Unknown time'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!senderId || !receiverId || !eventId) {
    return <p>Select a client and event to start chatting</p>;
  }

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error loading messages: {error.message}</p>;

  return (
    <Card className="flex flex-col h-[50vh]">
      <CardHeader>
        <CardTitle>Chat with {clientName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {renderMessages()}
        <div ref={messagesEndRef} />
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

export default Chatbox;
