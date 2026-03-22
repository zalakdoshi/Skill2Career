import React, { useState, useEffect } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import { companyService } from '../services/api';

const CompanyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, appsData] = await Promise.all([
        companyService.getStats(),
        companyService.getApplications()
      ]);
      setStats(statsData);
      setApplications(appsData.applications || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <CompanySidebar />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const recentApps = applications.slice(0, 8);

  const getStatusColor = (status) => {
    const colors = {
      applied: '#6366f1', shortlisted: '#f59e0b',
      interviewed: '#3b82f6', hired: '#10b981', rejected: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  return (
    <div className="app-container">
      <CompanySidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Company Dashboard</h1>
          <p className="page-subtitle">Overview of your hiring activity</p>
        </div>

        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', color: '#6366f1' }}>💼</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_jobs || 0}</div>
              <div className="stat-label">Total Jobs</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))', color: '#10b981' }}>✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.active_jobs || 0}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))', color: '#f59e0b' }}>📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.total_applications || 0}</div>
              <div className="stat-label">Applications</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,114,182,0.1))', color: '#ec4899' }}>🎯</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.hired || 0}</div>
              <div className="stat-label">Hired</div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Recent Applications</h3>
            <span className="tag">{applications.length} total</span>
          </div>

          {recentApps.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
              No applications yet. Post a job to start receiving applications!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Student', 'Job', 'Skills', 'Status', 'Applied'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        borderBottom: '2px solid var(--slate-200)',
                        fontSize: '0.8rem', fontWeight: '600',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: 'var(--slate-500)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '500' }}>{app.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{app.student_email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--slate-600)' }}>{app.job_title}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(app.student_skills || []).slice(0, 3).map((s, i) => (
                            <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                          ))}
                          {(app.student_skills || []).length > 3 && (
                            <span className="tag" style={{ fontSize: '0.7rem' }}>+{app.student_skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="tag" style={{
                          background: `${getStatusColor(app.status)}20`,
                          color: getStatusColor(app.status),
                          fontWeight: '600', textTransform: 'capitalize'
                        }}>{app.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
