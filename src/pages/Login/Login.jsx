import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Login.css';

export default function Login() {
  const { users, login, loginAsAdmin } = useApp();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if (isAdmin) {
      loginAsAdmin();
      navigate('/admin');
    } else if (selectedUser) {
      login(selectedUser, 'candidate');
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="ms-logo">
            <svg viewBox="0 0 21 21" width="21" height="21">
              <rect x="0" y="0" width="10" height="10" fill="#f25022" />
              <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
              <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
              <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
            </svg>
          </div>
          <h1>Sign in to SkillBridge</h1>
          <p className="login-subtitle">Microsoft Entra ID — Single Sign-On</p>
        </div>

        <div className="login-form">
          <div className="role-toggle">
            <button
              className={`role-btn ${!isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(false)}
            >
              Candidate
            </button>
            <button
              className={`role-btn ${isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(true)}
            >
              Admin
            </button>
          </div>

          {!isAdmin ? (
            <div className="user-select-section">
              <label className="form-label">Select your account</label>
              <div className="user-list">
                {users.map(u => (
                  <button
                    key={u.UserID}
                    className={`user-option ${selectedUser === u.UserID ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(u.UserID)}
                  >
                    <div className="user-avatar">{u.Name.charAt(0)}</div>
                    <div className="user-info">
                      <span className="user-name">{u.Name}</span>
                      <span className="user-email">{u.Email}</span>
                    </div>
                    <span className="user-college">{u.College}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-login-info">
              <div className="admin-icon">🛡️</div>
              <p>Sign in as <strong>Placement Admin</strong></p>
              <p className="text-muted">Full access to admin dashboard, user management, scraper controls, and Power BI analytics.</p>
            </div>
          )}

          <button
            className="btn btn-lg btn-primary login-btn"
            onClick={handleLogin}
            disabled={!isAdmin && !selectedUser}
          >
            Sign in with Microsoft
          </button>

          <div className="login-footer">
            <p className="text-muted text-sm">
              Protected by Microsoft Entra ID. Role-based access control enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
