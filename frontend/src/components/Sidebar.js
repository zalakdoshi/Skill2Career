import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'My Profile' },
    { path: '/recommendations', label: 'Career Paths' },
    { path: '/skills', label: 'Skill Analysis' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/my-applications', label: 'Applications' },
    { path: '/mentor', label: 'AI Mentor' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="top-navbar">
      <div className="top-navbar-inner">
        {/* Left — Logo */}
        <div className="top-navbar-left">
          <div className="top-navbar-brand" onClick={() => navigate('/')}>
            <div className="top-navbar-logo">S2C</div>
            <span className="top-navbar-name">Skill2Career</span>
            <span className="user-badge">User</span>
          </div>
        </div>

        {/* Center — Nav Links */}
        <div className="top-navbar-links">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`top-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right — User */}
        <div className="top-navbar-right">
          {isAdmin && (
            <button
              className="top-nav-link admin-switch-btn"
              onClick={() => navigate('/admin')}
            >
              Admin Panel →
            </button>
          )}
          <div className="top-navbar-user" onClick={() => navigate('/profile')}>
            <div className="top-navbar-avatar">{getInitials(user?.name)}</div>
            <span className="top-navbar-username">{user?.name || 'User'}</span>
          </div>
          <button className="top-navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
