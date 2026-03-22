import React, { useState, useEffect } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import { companyService } from '../services/api';

const CompanyCandidates = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [inviteJobId, setInviteJobId] = useState(null);
  const [invitingId, setInvitingId] = useState(null);

  useEffect(() => {
    loadApplications();
    loadCompanyJobs();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await companyService.getApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyJobs = async () => {
    try {
      const data = await companyService.getJobs();
      setCompanyJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadMatchedCandidates = async () => {
    if (matchedCandidates.length > 0) return;
    setMatchLoading(true);
    try {
      const data = await companyService.searchCandidates('');
      setMatchedCandidates(data.candidates || []);
    } catch (error) {
      console.error('Failed to load matched candidates:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const loadAllCandidates = async () => {
    setAllLoading(true);
    try {
      const data = await companyService.getAllCandidates();
      setAllCandidates(data.candidates || []);
    } catch (error) {
      console.error('Failed to load all candidates:', error);
    } finally {
      setAllLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'matched') loadMatchedCandidates();
    if (tab === 'all') loadAllCandidates();
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await companyService.updateApplicationStatus(appId, newStatus);
      loadApplications();
    } catch (error) {
      alert(error.message);
    }
  };

  const sendInvite = async (studentId, jobId) => {
    setInvitingId(studentId);
    try {
      await companyService.inviteCandidate(studentId, jobId);
      alert('✅ Invite sent successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setInvitingId(null);
    }
  };

  const filteredApps = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter);

  const getStatusColor = (status) => {
    const colors = {
      applied: '#6366f1', shortlisted: '#f59e0b',
      interviewed: '#3b82f6', hired: '#10b981', rejected: '#ef4444',
      invited: '#8b5cf6'
    };
    return colors[status] || '#64748b';
  };

  const getMatchColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    if (pct >= 25) return '#3b82f6';
    return '#94a3b8';
  };

  const CandidateCard = ({ c, showInvite = false }) => (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: c.placement_interest !== false
                ? 'linear-gradient(135deg, #10b981, #34d399)'
                : 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '600', fontSize: '0.9rem'
            }}>{c.name?.[0] || '?'}</div>
            <div>
              <div style={{ fontWeight: '600' }}>{c.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{c.email}</div>
            </div>
            {c.placement_interest !== false ? (
              <span style={{
                padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem',
                fontWeight: '600', background: '#10b98115', color: '#10b981',
                border: '1px solid #10b98130'
              }}>✓ Open to Work</span>
            ) : (
              <span style={{
                padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem',
                fontWeight: '600', background: '#ef444415', color: '#ef4444',
                border: '1px solid #ef444430'
              }}>✗ Not Looking</span>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
            {c.branch && <span>{c.branch} · </span>}
            CGPA: {c.cgpa || 'N/A'} · {c.projects_count || 0} projects
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: showInvite ? '0.75rem' : 0 }}>
            {(c.skills || []).slice(0, 8).map((s, i) => (
              <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>
            ))}
            {(c.skills || []).length > 8 && (
              <span className="tag" style={{ fontSize: '0.7rem' }}>+{c.skills.length - 8}</span>
            )}
          </div>

          {/* Invite button with job selector */}
          {showInvite && c.placement_interest !== false && companyJobs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={inviteJobId === c.id ? inviteJobId : ''}
                onChange={e => setInviteJobId(e.target.value ? c.id + '::' + e.target.value : null)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--slate-200)',
                  fontSize: '0.8rem', background: 'var(--slate-50)', cursor: 'pointer'
                }}
              >
                <option value="">Select job to invite for...</option>
                {companyJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              {inviteJobId && inviteJobId.startsWith(c.id + '::') && (
                <button
                  onClick={() => sendInvite(c.id, inviteJobId.split('::')[1])}
                  disabled={invitingId === c.id}
                  style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem',
                    opacity: invitingId === c.id ? 0.6 : 1
                  }}
                >{invitingId === c.id ? 'Sending...' : '📩 Send Invite'}</button>
              )}
            </div>
          )}
        </div>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: `conic-gradient(${getMatchColor(c.match_percentage)} ${c.match_percentage}%, var(--slate-100) 0)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', marginLeft: '1rem', flexShrink: 0
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.8rem', color: getMatchColor(c.match_percentage)
          }}>{c.match_percentage}%</div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="app-container">
      <CompanySidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Candidates & Applications</h1>
          <p className="page-subtitle">Discover talent, view job matches, and manage applications</p>
        </div>

        {/* 3-Tab Switch */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid var(--slate-200)' }}>
          {[
            { key: 'applications', label: `📋 Applications (${applications.length})` },
            { key: 'matched', label: '🎯 Job Matches' },
            { key: 'all', label: '👥 All Candidates' }
          ].map(tab => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
              padding: '12px 24px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: activeTab === tab.key ? '600' : '400', fontSize: '0.95rem',
              color: activeTab === tab.key ? '#6366f1' : 'var(--slate-500)',
              borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['all', 'applied', 'shortlisted', 'interviewed', 'hired', 'rejected', 'invited'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: statusFilter === s ? '600' : '400',
                  background: statusFilter === s ? '#6366f120' : 'var(--slate-100)',
                  color: statusFilter === s ? '#6366f1' : 'var(--slate-600)',
                  textTransform: 'capitalize', transition: 'all 0.2s'
                }}>{s === 'all' ? `All (${applications.length})` : s}</button>
              ))}
            </div>

            {filteredApps.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                No applications found
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredApps.map(app => (
                  <div key={app.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: '600', fontSize: '0.9rem'
                          }}>{app.student_name?.[0] || '?'}</div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{app.student_name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{app.student_email}</div>
                          </div>
                          {app.type === 'invite' && (
                            <span style={{
                              padding: '2px 8px', borderRadius: '8px', fontSize: '0.65rem',
                              fontWeight: '600', background: '#8b5cf615', color: '#8b5cf6',
                              border: '1px solid #8b5cf630'
                            }}>📩 Invited</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                          {app.type === 'invite' ? 'Invited for' : 'Applied for'}: <strong>{app.job_title}</strong>
                          {app.student_branch && <span> · {app.student_branch}</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(app.student_skills || []).slice(0, 6).map((s, i) => (
                            <span key={i} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                          ))}
                          {(app.student_skills || []).length > 6 && (
                            <span className="tag" style={{ fontSize: '0.7rem' }}>+{app.student_skills.length - 6}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span className="tag" style={{
                          background: `${getStatusColor(app.status)}20`,
                          color: getStatusColor(app.status),
                          fontWeight: '600', textTransform: 'capitalize', fontSize: '0.85rem'
                        }}>{app.status}</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {app.status !== 'shortlisted' && app.status !== 'hired' && (
                            <button onClick={() => updateStatus(app.id, 'shortlisted')} style={{
                              padding: '4px 12px', borderRadius: '6px', border: '1px solid #f59e0b',
                              background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#f59e0b'
                            }}>Shortlist</button>
                          )}
                          {app.status !== 'interviewed' && app.status !== 'hired' && (
                            <button onClick={() => updateStatus(app.id, 'interviewed')} style={{
                              padding: '4px 12px', borderRadius: '6px', border: '1px solid #3b82f6',
                              background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#3b82f6'
                            }}>Interview</button>
                          )}
                          {app.status !== 'hired' && (
                            <button onClick={() => updateStatus(app.id, 'hired')} style={{
                              padding: '4px 12px', borderRadius: '6px', border: '1px solid #10b981',
                              background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#10b981'
                            }}>Hire</button>
                          )}
                          {app.status !== 'rejected' && (
                            <button onClick={() => updateStatus(app.id, 'rejected')} style={{
                              padding: '4px 12px', borderRadius: '6px', border: '1px solid #ef4444',
                              background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444'
                            }}>Reject</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Job Matches Tab ── */}
        {activeTab === 'matched' && (
          <div>
            <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1rem', background: '#6366f108', border: '1px solid #6366f120' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', margin: 0 }}>
                🎯 These candidates match the skills required by your posted jobs. Only students <strong>open to opportunities</strong> are shown. You can <strong>invite</strong> them to apply.
              </p>
            </div>
            {matchLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
              </div>
            ) : matchedCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                No matching candidates found. Post jobs with required skills to see matches.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>
                  Found <strong>{matchedCandidates.length}</strong> candidates matching your job requirements
                </div>
                {matchedCandidates.map(c => <CandidateCard key={c.id} c={c} showInvite={true} />)}
              </div>
            )}
          </div>
        )}

        {/* ── All Candidates Tab ── */}
        {activeTab === 'all' && (
          <div>
            <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1rem', background: '#10b98108', border: '1px solid #10b98120' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', margin: 0 }}>
                👥 All registered students. <strong style={{ color: '#10b981' }}>Green</strong> = open to opportunities, <strong style={{ color: '#ef4444' }}>Red</strong> = not looking. Match % is based on your posted job requirements.
              </p>
            </div>
            {allLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
              </div>
            ) : allCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                No candidates found yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '0.25rem' }}>
                  Showing <strong>{allCandidates.length}</strong> students — {allCandidates.filter(c => c.placement_interest !== false).length} open to work
                </div>
                {allCandidates.map(c => <CandidateCard key={c.id} c={c} showInvite={true} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCandidates;
