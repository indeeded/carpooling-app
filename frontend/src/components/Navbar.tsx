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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-1 11h-3m-6 0H5m6 0a2 2 0 100-4 2 2 0 000 4zm6-4a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg">CarPool</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            Find rides
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'driver' && (
                <Link to="/rides/new" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Post a ride
                </Link>
              )}
              <Link to="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.firstName}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-500 px-3 py-2 transition-colors ml-1">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary ml-2">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
