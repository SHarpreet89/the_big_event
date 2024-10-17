import { Link } from 'react-router-dom';
function Nav() {
    return (
      <nav>
        <ul className="flex-row">
        <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/eventdetails">Event Details</Link>
          </li>
          <li>
            <Link to="/clientdashboard">Client Dashboard</Link>
          </li>
        </ul>
      </nav>
    );
  }
  
  export default Nav;