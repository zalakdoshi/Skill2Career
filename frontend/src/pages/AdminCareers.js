import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminCareers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', key_skills: '', min_cgpa: 6.0, growth_rate: 'Medium'
  });

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    try {
      const data = await adminService.getCareers();
      setCareers(data.careers || []);
    } catch (error) {
      console.error('Failed to load careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category: '', description: '', key_skills: '', min_cgpa: 6.0, growth_rate: 'Medium' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      key_skills: typeof formData.key_skills === 'string'
        ? formData.key_skills.split(',').map(s => s.trim()).filter(Boolean)
        : formData.key_skills,
      min_cgpa: parseFloat(formData.min_cgpa) || 6.0
    };

    try {
      if (editId) {
        await adminService.updateCareer(editId, payload);
      } else {
        await adminService.addCareer(payload);
      }
      loadCareers();
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (career) => {
    setFormData({
      title: career.title || '',
      category: career.category || '',
      description: career.description || '',
      key_skills: (career.key_skills || []).join(', '),
      min_cgpa: career.min_cgpa || 6.0,
      growth_rate: career.growth_rate || 'Medium'
    });
    setEditId(career.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this career path?')) return;
    try {
      await adminService.deleteCareer(id);
      setCareers(careers.filter(c => c.id !== id));
    } catch (error) {
      alert(error.message);
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

  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Career Management</h1>
            <p className="page-subtitle">Add, edit, and manage career paths</p>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? '✕ Close' : '+ Add Career'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              {editId ? '✏️ Edit Career' : '➕ New Career Path'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={formData.title} required
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Full Stack Developer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Web Development" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Description</label>
                <input className="form-input" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this career path" />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Key Skills (comma separated)</label>
                <input className="form-input" value={formData.key_skills}
                  onChange={e => setFormData({...formData, key_skills: e.target.value})}
                  placeholder="React, Node.js, MongoDB, JavaScript" />
              </div>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min CGPA</label>
                  <input type="number" className="form-input" step="0.1" min="0" max="10"
                    value={formData.min_cgpa}
                    onChange={e => setFormData({...formData, min_cgpa: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Growth Rate</label>
                  <select className="form-select" value={formData.growth_rate}
                    onChange={e => setFormData({...formData, growth_rate: e.target.value})}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Very High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Update Career' : 'Add Career'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Careers List */}
        <div className="grid-2">
          {careers.map((career, idx) => (
            <div key={idx} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>{career.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="tag">{career.category || 'General'}</span>
                    <span className={`tag ${career.growth_rate === 'Very High' || career.growth_rate === 'High' ? 'success' : 'warning'}`}>
                      📈 {career.growth_rate || 'Medium'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(career)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(career.id)}>Delete</button>
                </div>
              </div>

              {career.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                  {career.description.length > 120 ? career.description.slice(0, 120) + '...' : career.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(career.key_skills || []).slice(0, 6).map((skill, i) => (
                  <span key={i} className="tag" style={{ fontSize: '0.75rem' }}>{skill}</span>
                ))}
                {(career.key_skills || []).length > 6 && (
                  <span className="tag" style={{ fontSize: '0.75rem' }}>+{career.key_skills.length - 6}</span>
                )}
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--slate-400)' }}>
                Min CGPA: {career.min_cgpa || 6.0}
              </div>
            </div>
          ))}
        </div>

        {careers.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No career paths</div>
              <div className="empty-text">Add your first career path above</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCareers;
