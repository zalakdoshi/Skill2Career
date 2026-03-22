import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-overlay" style={{ position: 'relative' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const { profile, top_recommendations, skill_analysis, average_readiness, profile_completion } = dashboardData || {};

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your career readiness overview</p>
        </div>

        {/* Profile Completion Banner */}
        {profile_completion < 100 && (
          <div className="profile-completion" style={{ marginBottom: '2rem' }}>
            <div className="completion-header">
              <span className="completion-text">Complete your profile for better recommendations</span>
              <span className="completion-percentage">{profile_completion}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill primary"
                style={{ width: `${profile_completion}%` }}
              />
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/profile')}
              style={{ marginTop: '1rem' }}
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon primary">📊</div>
            <div className="stat-content">
              <div className="stat-value">{Math.round(average_readiness || 0)}%</div>
              <div className="stat-label">Avg. Readiness</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">💡</div>
            <div className="stat-content">
              <div className="stat-value">{skill_analysis?.total_skills || 0}</div>
              <div className="stat-label">Total Skills</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">📁</div>
            <div className="stat-content">
              <div className="stat-value">{profile?.projects?.length || 0}</div>
              <div className="stat-label">Projects</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">🎓</div>
            <div className="stat-content">
              <div className="stat-value">{profile?.cgpa || '0.0'}</div>
              <div className="stat-label">CGPA</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Top Career Matches */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎯 Top Career Matches</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => navigate('/recommendations')}
              >
                View All
              </button>
            </div>
            
            {top_recommendations && top_recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {top_recommendations.slice(0, 4).map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 18px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(253, 242, 248, 0.6))',
                      borderRadius: '16px',
                      border: '1px solid rgba(176, 136, 196, 0.15)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(176, 136, 196, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(176, 136, 196, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(176, 136, 196, 0.15)';
                    }}
                    onClick={() => navigate('/recommendations')}
                  >
                    {/* Left accent bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: rec.compatibility_score >= 70 
                        ? 'linear-gradient(180deg, #10b981, #34d399)' 
                        : rec.compatibility_score >= 40 
                        ? 'linear-gradient(180deg, #f59e0b, #fbbf24)' 
                        : 'linear-gradient(180deg, #b088c4, #c9a0d6)',
                      borderRadius: '16px 0 0 16px'
                    }} />
                    
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '6px',
                        color: '#1e1e3f',
                        fontSize: '0.95rem'
                      }}>
                        {rec.role.title}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, rgba(176, 136, 196, 0.12), rgba(244, 114, 182, 0.08))',
                        color: '#9085c4',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: '1px solid rgba(176, 136, 196, 0.2)'
                      }}>
                        {rec.role.category}
                      </span>
                    </div>
                    
                    {/* Score with circular progress */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: rec.compatibility_score >= 70 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))'
                          : rec.compatibility_score >= 40
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1))'
                          : 'linear-gradient(135deg, rgba(176, 136, 196, 0.15), rgba(244, 114, 182, 0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${
                          rec.compatibility_score >= 70 ? '#10b981' 
                          : rec.compatibility_score >= 40 ? '#f59e0b' 
                          : '#b088c4'
                        }`,
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        color: rec.compatibility_score >= 70 ? '#059669' 
                          : rec.compatibility_score >= 40 ? '#d97706' 
                          : '#9085c4'
                      }}>
                        {Math.round(rec.compatibility_score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No recommendations yet</div>
                <div className="empty-text">Add your skills to get personalized career recommendations</div>
              </div>
            )}
          </div>

          {/* Skill Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💡 Skill Distribution</h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => navigate('/skills')}
              >
                Details
              </button>
            </div>
            
            {skill_analysis && skill_analysis.skill_distribution ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(skill_analysis.skill_distribution).map(([category, count], idx) => {
                  const percentage = Math.min((count / 10) * 100, 100);
                  const colors = [
                    { bg: 'linear-gradient(90deg, #b088c4, #c9a0d6)', light: 'rgba(176, 136, 196, 0.12)' },
                    { bg: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', light: 'rgba(139, 92, 246, 0.12)' },
                    { bg: 'linear-gradient(90deg, #06b6d4, #22d3ee)', light: 'rgba(6, 182, 212, 0.12)' },
                    { bg: 'linear-gradient(90deg, #10b981, #34d399)', light: 'rgba(16, 185, 129, 0.12)' },
                    { bg: 'linear-gradient(90deg, #f59e0b, #fbbf24)', light: 'rgba(245, 158, 11, 0.12)' }
                  ];
                  const color = colors[idx % 5];
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '14px 16px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(253, 242, 248, 0.6))',
                        borderRadius: '14px',
                        border: '1px solid rgba(176, 136, 196, 0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: '600',
                          color: '#1e1e3f'
                        }}>{category}</span>
                        <span style={{ 
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: color.light,
                          color: '#1e1e3f'
                        }}>{count} skills</span>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        background: 'rgba(0, 0, 0, 0.06)', 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${percentage}%`,
                          height: '100%',
                          background: color.bg,
                          borderRadius: '8px',
                          transition: 'width 0.5s ease',
                          boxShadow: `0 0 8px ${color.light}`
                        }} />
                      </div>
                    </div>
                  );
                })}
                
                {skill_analysis.top_category && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(176, 136, 196, 0.1), rgba(244, 114, 182, 0.05))',
                    borderRadius: '16px',
                    border: '1px solid rgba(176, 136, 196, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #b088c4, #c9a0d6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>🏆</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                        Best Fit Category
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#9085c4' }}>
                        {skill_analysis.top_category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <div className="empty-title">No skills added</div>
                <div className="empty-text">Add your skills in the profile section</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
              Update Profile
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/recommendations')}>
              Explore Careers
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/mentor')}>
              Ask AI Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
