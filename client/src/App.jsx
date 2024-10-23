import './App.css';
import { Outlet } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add shared state for showOnlyMyEvents
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(() => {
    return localStorage.getItem('showOnlyMyEvents') === 'true';
  });

  // Handle the checkbox change
  const handleShowOnlyMyEventsChange = (checked) => {
    setShowOnlyMyEvents(checked);
    localStorage.setItem('showOnlyMyEvents', checked);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.warn('No token found');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ApolloProvider client={client}>
      <div className="flex h-screen">
        {userRole !== 'Admin' && (
          <Sidebar 
            userRole={userRole} 
            showOnlyMyEvents={showOnlyMyEvents}
            onShowOnlyMyEventsChange={handleShowOnlyMyEventsChange}
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <Outlet 
                context={{ 
                  setUserRole, 
                  showOnlyMyEvents,
                  onShowOnlyMyEventsChange: handleShowOnlyMyEventsChange 
                }} 
              />
            </div>
          </main>
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;