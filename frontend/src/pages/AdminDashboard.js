import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <AdminSidebar />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const recentUsers = users.slice(-5).reverse();

  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', color: '#6366f1' }}>👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_users || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))', color: '#10b981' }}>🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_careers || 0}</div>
              <div className="stat-label">Career Paths</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))', color: '#f59e0b' }}>💡</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_skills || 0}</div>
              <div className="stat-label">Skills in DB</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.1))', color: '#b088c4' }}>📚</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_courses || 0}</div>
              <div className="stat-label">Courses</div>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.1))', color: '#3b82f6' }}>🏢</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_companies || 0}</div>
              <div className="stat-label">Companies</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(192,132,252,0.1))', color: '#a855f7' }}>💼</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_jobs || 0}</div>
              <div className="stat-label">Job Postings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(45,212,191,0.1))', color: '#14b8a6' }}>📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_applications || 0}</div>
              <div className="stat-label">Applications</div>
            </div>
          </div>

          <div className="stat-card" style={{visibility: 'hidden'}}></div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👥 Recent Users</h3>
            <span className="tag">{users.length} total</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Branch', 'Skills', 'Projects'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      borderBottom: '2px solid var(--slate-200)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--slate-500)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>{u.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--slate-500)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`tag ${u.role === 'admin' ? 'warning' : 'success'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--slate-600)' }}>{u.branch || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="tag">{u.skills_count || 0}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="tag">{u.projects_count || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
