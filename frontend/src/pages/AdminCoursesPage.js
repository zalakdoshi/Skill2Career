import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ skill: '', title: '', platform: '', url: '', type: 'free' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCourses();
      setCourses(data.courses || []);
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCourse.skill || !newCourse.title || !newCourse.platform || !newCourse.url) return;
    try {
      setAdding(true);
      await adminService.addCourse(newCourse);
      setNewCourse({ skill: '', title: '', platform: '', url: '', type: 'free' });
      setShowAdd(false);
      loadCourses();
    } catch (error) {
      alert(error.message);
    } finally {
      setAdding(false);
    }
  };

  // Get unique platforms
  const platforms = [...new Set(courses.map(c => c.platform || 'Unknown'))];

  // Filter courses
  const filtered = courses.filter(c => {
    const matchSearch = !searchTerm ||
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.skill || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlatform = selectedPlatform === 'all' || (c.platform || 'Unknown') === selectedPlatform;
    return matchSearch && matchPlatform;
  });

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
          <h1 className="page-title">📚 Course Management</h1>
          <p className="page-subtitle">Manage course recommendations — stored in MongoDB</p>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f5eff4' }}>📘</div>
            <div className="stat-info">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>🆓</div>
            <div className="stat-info">
              <div className="stat-value">{courses.filter(c => c.type === 'free').length}</div>
              <div className="stat-label">Free Courses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>💎</div>
            <div className="stat-info">
              <div className="stat-value">{courses.filter(c => c.type === 'paid').length}</div>
              <div className="stat-label">Paid Courses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe' }}>🎯</div>
            <div className="stat-info">
              <div className="stat-value">{skills.length}</div>
              <div className="stat-label">Skill Categories</div>
            </div>
          </div>
        </div>

        {/* Add Course Form */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAdd ? '1rem' : 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>➕ Add New Course</h3>
            <button onClick={() => setShowAdd(!showAdd)} style={{
              padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
              background: showAdd ? '#fee2e2' : 'linear-gradient(135deg, #d4789c, #e891b9)',
              color: showAdd ? '#dc2626' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
            }}>{showAdd ? 'Cancel' : 'Add Course'}</button>
          </div>
          {showAdd && (
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input placeholder="Skill (e.g. HTML)" value={newCourse.skill}
                onChange={e => setNewCourse({...newCourse, skill: e.target.value})}
                list="skill-suggestions" required
                style={{ padding: '10px 12px', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)', fontFamily: 'Inter, sans-serif' }} />
              <datalist id="skill-suggestions">
                {skills.map(s => <option key={s} value={s} />)}
              </datalist>
              <input placeholder="Course Title" value={newCourse.title}
                onChange={e => setNewCourse({...newCourse, title: e.target.value})} required
                style={{ padding: '10px 12px', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)', fontFamily: 'Inter, sans-serif' }} />
              <input placeholder="Platform (e.g. Coursera, YouTube)" value={newCourse.platform}
                onChange={e => setNewCourse({...newCourse, platform: e.target.value})} required
                style={{ padding: '10px 12px', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)', fontFamily: 'Inter, sans-serif' }} />
              <input placeholder="URL" value={newCourse.url}
                onChange={e => setNewCourse({...newCourse, url: e.target.value})} required
                style={{ gridColumn: 'span 2', padding: '10px 12px', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)', fontFamily: 'Inter, sans-serif' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={newCourse.type} onChange={e => setNewCourse({...newCourse, type: e.target.value})}
                  style={{ flex: 1, padding: '10px 12px', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)', fontFamily: 'Inter, sans-serif' }}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <button type="submit" disabled={adding} style={{
                  padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #d4789c, #e891b9)', color: 'white',
                  border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap'
                }}>{adding ? 'Adding...' : 'Save ✓'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search courses or skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                flex: 1, minWidth: '200px', padding: '10px 14px', fontSize: '0.88rem',
                border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-input)',
                outline: 'none', fontFamily: 'Inter, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedPlatform('all')}
                style={{
                  padding: '7px 14px', fontSize: '0.82rem', fontWeight: 600,
                  border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer',
                  background: selectedPlatform === 'all' ? '#d4789c' : 'white',
                  color: selectedPlatform === 'all' ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >All</button>
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  style={{
                    padding: '7px 14px', fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer',
                    background: selectedPlatform === p ? '#d4789c' : 'white',
                    color: selectedPlatform === p ? 'white' : 'var(--text-secondary)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="card" style={{ padding: '1.25rem', overflow: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Courses ({filtered.length})
          </h3>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No courses found</div>
              <div className="empty-text">Try a different search or add new courses</div>
            </div>
          ) : (
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>COURSE</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>SKILL</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>PLATFORM</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>TYPE</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>LINK</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((course, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bg-secondary)' }}>
                    <td style={{ padding: '12px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '300px' }}>
                      {course.title || 'Untitled'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', fontSize: '0.76rem', fontWeight: 600,
                        background: '#f5eff4', color: '#d4789c', borderRadius: '10px'
                      }}>{course.skill || '—'}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', fontSize: '0.76rem', fontWeight: 600,
                        background: '#ede9fe', color: '#7c3aed', borderRadius: '10px'
                      }}>{course.platform || 'Unknown'}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px', fontSize: '0.76rem', fontWeight: 700,
                        background: course.type === 'free' ? '#d1fae5' : '#fef3c7',
                        color: course.type === 'free' ? '#059669' : '#d97706',
                        borderRadius: '10px'
                      }}>{course.type === 'free' ? '🆓 Free' : '💎 Paid'}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {course.url ? (
                        <a href={course.url} target="_blank" rel="noopener noreferrer"
                          style={{
                            padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px',
                            color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-block'
                          }}>
                          Open ↗
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
