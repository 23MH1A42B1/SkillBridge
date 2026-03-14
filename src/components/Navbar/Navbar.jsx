import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout, getUserNotifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = currentUser?.role === 'candidate'
    ? getUserNotifications(currentUser.UserID).filter(n => !n.Read).length
    : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">SB</span>
          <span className="brand-text">SkillBridge</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>

          {!currentUser ? (
            <Link to="/login" className="btn btn-sm btn-primary">Sign In</Link>
          ) : (
            <div className="navbar-user">
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              <Link
                to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
                className={`btn btn-sm btn-outline ${['/admin', '/dashboard'].includes(location.pathname) ? 'active' : ''}`}
              >
                {currentUser.role === 'admin' ? '🛡️ Admin' : '📊 Dashboard'}
              </Link>
              <span className="navbar-name">{currentUser.Name}</span>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
