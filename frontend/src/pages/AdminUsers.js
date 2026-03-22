import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.branch?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage all registered users</p>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or branch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', boxShadow: 'none', padding: '8px 0' }}
            />
            <span className="tag">{filteredUsers.length} users</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Branch', 'Job Ready', 'Skills', 'Projects', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 16px',
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
                {filteredUsers.map((u, idx) => (
                  <tr key={idx} style={{
                    borderBottom: '1px solid var(--slate-100)',
                    transition: 'background 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '600', fontSize: '0.85rem'
                        }}>
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: '500' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--slate-500)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`tag ${u.role === 'admin' ? 'warning' : 'success'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--slate-600)' }}>{u.branch || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role === 'user' ? (
                        u.placement_interest !== false ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem',
                            fontWeight: '600', background: '#10b98115', color: '#10b981',
                            border: '1px solid #10b98130'
                          }}>✓ Open</span>
                        ) : (
                          <span style={{
                            padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem',
                            fontWeight: '600', background: '#ef444415', color: '#ef4444',
                            border: '1px solid #ef444430'
                          }}>✗ No</span>
                        )
                      ) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}><span className="tag">{u.skills_count || 0}</span></td>
                    <td style={{ padding: '14px 16px' }}><span className="tag">{u.projects_count || 0}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role !== 'admin' && (
                        deleteConfirm === u.id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Confirm</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setDeleteConfirm(u.id)}
                            style={{ color: '#b088c4' }}
                          >
                            Delete
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No users found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
