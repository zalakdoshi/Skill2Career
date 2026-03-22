import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminAnalytics = () => {
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
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute analytics from users data
  const branchDistribution = {};
  const skillFrequency = {};
  let totalSkills = 0;
  let totalProjects = 0;
  let completedProfiles = 0;

  users.forEach(u => {
    // Branch
    const branch = u.branch || 'Not Set';
    branchDistribution[branch] = (branchDistribution[branch] || 0) + 1;
    // Skills
    const skills = u.skills || [];
    totalSkills += skills.length;
    skills.forEach(s => {
      skillFrequency[s] = (skillFrequency[s] || 0) + 1;
    });
    // Projects
    totalProjects += (u.projects || 0);
    // Profile completion
    if (skills.length > 0 && u.branch) completedProfiles++;
  });

  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxSkillCount = topSkills.length > 0 ? topSkills[0][1] : 1;

  if (loading) {
    return (
      <div className="app-container">
        <AdminSidebar />
        <div className="main-content">
          <div className="loading-overlay" style={{ position: 'relative' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Platform insights and user trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe' }}>📈</div>
            <div className="stat-info">
              <div className="stat-value">{users.length > 0 ? (totalSkills / users.length).toFixed(1) : 0}</div>
              <div className="stat-label">Avg Skills/User</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>📁</div>
            <div className="stat-info">
              <div className="stat-value">{totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
            <div className="stat-info">
              <div className="stat-value">{completedProfiles}</div>
              <div className="stat-label">Completed Profiles</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eddce6' }}>📊</div>
            <div className="stat-info">
              <div className="stat-value">{users.length > 0 ? ((completedProfiles / users.length) * 100).toFixed(0) : 0}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Top Skills */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 700 }}>🔥 Most Popular Skills</h3>
            {topSkills.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No skill data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topSkills.map(([skill, count], i) => (
                  <div key={skill}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{skill}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{count} user{count > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(count / maxSkillCount) * 100}%`,
                        background: 'linear-gradient(135deg, #d4789c, #e891b9)',
                        borderRadius: '3px',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch Distribution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 700 }}>🎓 Branch Distribution</h3>
            {Object.keys(branchDistribution).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No branch data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(branchDistribution).sort((a,b) => b[1]-a[1]).map(([branch, count]) => (
                  <div key={branch} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: '#f8fafc', borderRadius: '10px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{branch}</span>
                    <span style={{
                      padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700,
                      background: '#ede9fe', color: '#7c3aed', borderRadius: '12px'
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Platform Overview */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 700 }}>🏛️ Platform Overview</h3>
          <div className="grid-4">
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{stats?.total_users || 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Registered Users</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f5eff4', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d4789c' }}>{stats?.total_careers || 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Career Paths</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#eff6ff', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{stats?.total_skills || 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Skills Tracked</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#faf5ff', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed' }}>{stats?.total_courses || 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Courses Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
