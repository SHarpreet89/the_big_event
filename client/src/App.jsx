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

// Construct GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql', // Make sure this is correct, try using 'http://localhost:4000/graphql' if needed
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  console.log('Token:', token); // Debugging log to see if the token is retrieved
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
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  return (
    <ApolloProvider client={client}>
      <div className="flex h-screen">
        <Sidebar userRole={userRole} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <Outlet context={{ setUserRole }} />
            </div>
          </main>
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;