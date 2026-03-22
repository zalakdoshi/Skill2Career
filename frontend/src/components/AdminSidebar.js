import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/careers', label: 'Careers' },
    { path: '/admin/analytics', label: 'Analytics' },
    { path: '/admin/courses', label: 'Courses' },
    { path: '/admin/companies', label: 'Companies' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="top-navbar admin-navbar">
      <div className="top-navbar-inner">
        {/* Left — Logo */}
        <div className="top-navbar-left">
          <div className="top-navbar-brand" onClick={() => navigate('/admin')}>
            <div className="top-navbar-logo admin-logo">S2C</div>
            <span className="top-navbar-name">Skill2Career</span>
            <span className="admin-badge">Admin</span>
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
          <button
            className="top-nav-link user-view-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← User View
          </button>
          <div className="top-navbar-user">
            <div className="top-navbar-avatar">{getInitials(user?.name)}</div>
            <span className="top-navbar-username">{user?.name || 'Admin'}</span>
          </div>
          <button className="top-navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;
