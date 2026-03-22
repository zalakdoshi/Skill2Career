import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { jobService } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const data = await jobService.getJobs();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    // Ask confirmation before applying
    const confirmed = window.confirm(
      '💼 Are you interested in placement and job opportunities?\n\n' +
      'By clicking OK, you confirm that you are open to being contacted by companies for this and similar roles.\n\n' +
      'Click OK to apply, or Cancel to go back.'
    );
    if (!confirmed) return;

    setApplyingId(jobId);
    try {
      await jobService.applyToJob(jobId);
      loadJobs();
    } catch (error) {
      alert(error.message);
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = filter === 'all' ? jobs
    : filter === 'high-match' ? jobs.filter(j => j.skill_match >= 60)
    : filter === 'internship' ? jobs.filter(j => j.job_type === 'internship')
    : filter === 'full-time' ? jobs.filter(j => j.job_type === 'full-time')
    : jobs;

  const getMatchColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    if (pct >= 25) return '#3b82f6';
    return '#94a3b8';
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
          <h1 className="page-title">💼 Job Openings</h1>
          <p className="page-subtitle">Browse jobs matched to your skills — green = you have it, red = need to learn</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All Jobs (${jobs.length})` },
            { key: 'high-match', label: '🎯 High Match (60%+)' },
            { key: 'full-time', label: 'Full-Time' },
            { key: 'internship', label: 'Internship' }
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: filter === f.key ? '600' : '400',
              background: filter === f.key ? '#6366f120' : 'var(--slate-100)',
              color: filter === f.key ? '#6366f1' : 'var(--slate-600)',
              transition: 'all 0.2s'
            }}>{f.label}</button>
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
            <p style={{ fontSize: '1.1rem' }}>No jobs available yet</p>
            <p style={{ fontSize: '0.9rem' }}>Check back later for new opportunities!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
            {filteredJobs.map(job => (
              <div key={job.id} className="card job-card" style={{
                padding: '1.5rem', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
              }}>
                {/* Skill Match Badge */}
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: `conic-gradient(${getMatchColor(job.skill_match)} ${job.skill_match}%, var(--slate-100) 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', background: 'var(--white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '0.75rem', color: getMatchColor(job.skill_match)
                  }}>{job.skill_match}%</div>
                </div>

                <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '0.8rem'
                  }}>{job.company_name?.[0] || '?'}</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{job.company_name}</div>
                    {job.company_industry && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{job.company_industry}</div>
                    )}
                  </div>
                </div>

                <h3 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.05rem', paddingRight: '60px' }}>{job.title}</h3>

                {job.description && (
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', margin: '0 0 0.75rem', lineHeight: '1.4' }}>
                    {job.description.substring(0, 120)}{job.description.length > 120 ? '...' : ''}
                  </p>
                )}

                {/* Matched Skills (green) */}
                {(job.matched_skills || []).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>✓ Skills you have:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {job.matched_skills.map((s, i) => (
                        <span key={i} style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '500',
                          background: '#10b98115', color: '#10b981', border: '1px solid #10b98130'
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills (red/orange) */}
                {(job.missing_skills || []).length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>✗ Skills to learn:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {job.missing_skills.map((s, i) => (
                        <span key={i} style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '500',
                          background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430'
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* No skills data — show raw tags */}
                {!(job.matched_skills || []).length && !(job.missing_skills || []).length && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.75rem' }}>
                    {(job.required_skills || []).slice(0, 5).map((s, i) => (
                      <span key={i} className="tag" style={{ fontSize: '0.72rem' }}>{s}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--slate-400)', marginBottom: '1rem' }}>
                  {job.location && <span>📍 {job.location}</span>}
                  <span style={{ textTransform: 'capitalize' }}>🏢 {job.job_type}</span>
                  {(job.salary_min > 0 || job.salary_max > 0) && (
                    <span>💰 ₹{(job.salary_min / 1000).toFixed(0)}K - ₹{(job.salary_max / 1000).toFixed(0)}K</span>
                  )}
                </div>

                {job.already_applied ? (
                  <button disabled style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #10b981', background: '#10b98110',
                    color: '#10b981', fontWeight: '600', cursor: 'default', fontSize: '0.9rem'
                  }}>✓ Applied</button>
                ) : (
                  <button onClick={() => handleApply(job.id)} disabled={applyingId === job.id} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
                    opacity: applyingId === job.id ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}>{applyingId === job.id ? 'Applying...' : 'Apply Now →'}</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
