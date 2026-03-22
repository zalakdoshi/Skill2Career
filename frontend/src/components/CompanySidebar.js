import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/company/dashboard', label: 'Dashboard' },
    { path: '/company/jobs', label: 'Jobs' },
    { path: '/company/candidates', label: 'Candidates' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="top-navbar company-navbar">
      <div className="top-navbar-inner">
        <div className="top-navbar-left">
          <div className="top-navbar-brand" onClick={() => navigate('/company/dashboard')}>
            <div className="top-navbar-logo company-logo">S2C</div>
            <span className="top-navbar-name">Skill2Career</span>
            <span className="company-badge">Company</span>
          </div>
        </div>

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

        <div className="top-navbar-right">
          <div className="top-navbar-user">
            <div className="top-navbar-avatar">{getInitials(user?.name)}</div>
            <span className="top-navbar-username">{user?.name || 'Company'}</span>
          </div>
          <button className="top-navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CompanySidebar;
