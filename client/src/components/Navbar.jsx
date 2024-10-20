import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; // Import a logout icon from react-icons

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">THE BIG EVENT</h1>
      <Link to="/logout" className="text-white hover:text-gray-300">
        <FiLogOut size={24} />
      </Link>
    </nav>
  );
}

export default Navbar;