import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        CarPool
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
          Find rides
        </Link>
        {isAuthenticated ? (
          <>
            {user?.role === 'driver' && (
              <Link to="/rides/new" className="text-gray-600 hover:text-gray-900 text-sm">
                Post a ride
              </Link>
            )}
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900 text-sm">
              {user?.firstName}
            </Link>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm">
              Login
            </Link>
            <Link to="/register" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
