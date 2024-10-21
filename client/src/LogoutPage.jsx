import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {}; // Provide default empty object if context is null
  const { setUserRole } = context;

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    if (setUserRole) {
      setUserRole(null); // Reset the user role
    }
    navigate('/login'); // Redirect to login page
  }, [setUserRole, navigate]);

  return null;
};

export default Logout;