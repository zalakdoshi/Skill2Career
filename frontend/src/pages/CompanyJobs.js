import React, { useState, useEffect } from 'react';
import CompanySidebar from '../components/CompanySidebar';
import { companyService } from '../services/api';

const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', required_skills: '',
    salary_min: '', salary_max: '', location: '', job_type: 'full-time'
  });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const data = await companyService.getJobs();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({ title: '', description: '', required_skills: '', salary_min: '', salary_max: '', location: '', job_type: 'full-time' });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title, description: job.description || '',
      required_skills: (job.required_skills || []).join(', '),
      salary_min: job.salary_min || '', salary_max: job.salary_max || '',
      location: job.location || '', job_type: job.job_type || 'full-time'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
      salary_min: Number(formData.salary_min) || 0,
      salary_max: Number(formData.salary_max) || 0
    };
    try {
      if (editingJob) {
        await companyService.updateJob(editingJob.id, payload);
      } else {
        await companyService.createJob(payload);
      }
      setShowModal(false);
      loadJobs();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    try {
      await companyService.deleteJob(jobId);
      loadJobs();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await companyService.updateJob(job.id, { status: newStatus });
      loadJobs();
    } catch (error) {
      alert(error.message);
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

  return (
    <div className="app-container">
      <CompanySidebar />
      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Job Postings</h1>
            <p className="page-subtitle">Manage your job listings</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal} style={{
            padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontWeight: '600', fontSize: '0.9rem'
          }}>+ Post New Job</button>
        </div>

        {jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--slate-400)', marginBottom: '1rem' }}>No jobs posted yet</p>
            <button onClick={openCreateModal} style={{
              padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
            }}>Post Your First Job</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{job.title}</h3>
                      <span className="tag" style={{
                        background: job.status === 'active' ? '#10b98120' : '#ef444420',
                        color: job.status === 'active' ? '#10b981' : '#ef4444',
                        fontWeight: '600', textTransform: 'capitalize'
                      }}>{job.status}</span>
                      <span className="tag">{job.job_type}</span>
                    </div>
                    {job.description && (
                      <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        {job.description.substring(0, 150)}{job.description.length > 150 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.5rem' }}>
                      {(job.required_skills || []).map((s, i) => (
                        <span key={i} className="tag" style={{ fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-400)' }}>
                      {job.location && <span>📍 {job.location}</span>}
                      {(job.salary_min > 0 || job.salary_max > 0) && (
                        <span>💰 ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}</span>
                      )}
                      <span>📋 {job.application_count || 0} applications</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '1rem' }}>
                    <button onClick={() => toggleStatus(job)} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--slate-200)',
                      background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--slate-600)'
                    }}>{job.status === 'active' ? 'Close' : 'Reopen'}</button>
                    <button onClick={() => openEditModal(job)} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid #6366f1',
                      background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: '#6366f1'
                    }}>Edit</button>
                    <button onClick={() => handleDelete(job.id)} style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid #ef4444',
                      background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444'
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Job Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    placeholder="e.g. Frontend Developer" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    placeholder="Describe the role and responsibilities..." rows="4" />
                </div>
                <div className="form-group">
                  <label>Required Skills (comma-separated)</label>
                  <input type="text" name="required_skills" value={formData.required_skills} onChange={handleChange}
                    placeholder="e.g. React, JavaScript, CSS, Node.js" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Min Salary (₹)</label>
                    <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange}
                      placeholder="e.g. 300000" />
                  </div>
                  <div className="form-group">
                    <label>Max Salary (₹)</label>
                    <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange}
                      placeholder="e.g. 800000" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                      placeholder="e.g. Bangalore, Remote" />
                  </div>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select name="job_type" value={formData.job_type} onChange={handleChange}>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{
                    padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--slate-200)',
                    background: 'transparent', cursor: 'pointer', color: 'var(--slate-600)'
                  }}>Cancel</button>
                  <button type="submit" style={{
                    padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
                  }}>{editingJob ? 'Update Job' : 'Post Job'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobs;
