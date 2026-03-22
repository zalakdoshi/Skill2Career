import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { jobService } from '../services/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const data = await jobService.getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['applied', 'shortlisted', 'interviewed', 'hired'];

  const getStatusColor = (status) => {
    const colors = {
      applied: '#6366f1', shortlisted: '#f59e0b',
      interviewed: '#3b82f6', hired: '#10b981', rejected: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIndex = (status) => {
    if (status === 'rejected') return -1;
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">📝 My Applications</h1>
          <p className="page-subtitle">Track the status of your job applications in real-time</p>
        </div>

        {applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No applications yet</p>
            <p style={{ fontSize: '0.9rem' }}>Browse jobs and start applying!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {applications.map(app => {
              const currentStep = getStatusIndex(app.status);
              const isRejected = app.status === 'rejected';

              return (
                <div key={app.id} className="card" style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${getStatusColor(app.status)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem' }}>{app.job_title}</h3>
                      <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
                        🏢 {app.company_name}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.5rem' }}>
                        {(app.job_skills || []).slice(0, 5).map((s, i) => (
                          <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="tag" style={{
                        background: `${getStatusColor(app.status)}20`,
                        color: getStatusColor(app.status),
                        fontWeight: '700', textTransform: 'capitalize', fontSize: '0.9rem',
                        padding: '6px 14px'
                      }}>{app.status}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {!isRejected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '0.5rem' }}>
                      {statusSteps.map((step, idx) => {
                        const isActive = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <React.Fragment key={step}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                              <div style={{
                                width: isCurrent ? '32px' : '24px',
                                height: isCurrent ? '32px' : '24px',
                                borderRadius: '50%',
                                background: isActive
                                  ? `linear-gradient(135deg, ${getStatusColor(step)}, ${getStatusColor(step)}cc)`
                                  : 'var(--slate-100)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isActive ? '#fff' : 'var(--slate-400)',
                                fontSize: isCurrent ? '0.8rem' : '0.65rem', fontWeight: '600',
                                transition: 'all 0.3s',
                                boxShadow: isCurrent ? `0 0 0 4px ${getStatusColor(step)}30` : 'none'
                              }}>
                                {isActive ? '✓' : (idx + 1)}
                              </div>
                              <div style={{
                                fontSize: '0.7rem', marginTop: '4px', textTransform: 'capitalize',
                                color: isActive ? getStatusColor(step) : 'var(--slate-400)',
                                fontWeight: isCurrent ? '600' : '400'
                              }}>{step}</div>
                            </div>
                            {idx < statusSteps.length - 1 && (
                              <div style={{
                                flex: 1, height: '3px', minWidth: '30px',
                                background: idx < currentStep
                                  ? `linear-gradient(90deg, ${getStatusColor(statusSteps[idx])}, ${getStatusColor(statusSteps[idx + 1])})`
                                  : 'var(--slate-100)',
                                borderRadius: '2px', margin: '0 4px', marginBottom: '18px',
                                transition: 'background 0.3s'
                              }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '0.5rem', padding: '8px 16px', borderRadius: '8px',
                      background: '#ef444410', color: '#ef4444', fontSize: '0.85rem',
                      textAlign: 'center'
                    }}>
                      Application was not selected for this position
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
