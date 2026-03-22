import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminService } from '../services/api';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try {
      const data = await adminService.getCompanies();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Delete company "${companyName}" and all their jobs/applications?`)) return;
    try {
      await adminService.deleteCompany(companyId);
      loadCompanies();
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
        <div className="page-header">
          <h1 className="page-title">🏢 Companies</h1>
          <p className="page-subtitle">Manage registered companies</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Companies</h3>
            <span className="tag">{companies.length} total</span>
          </div>

          {companies.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
              No companies registered yet
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Company', 'Industry', 'Website', 'Jobs', 'Applications', 'Registered', 'Actions'].map(h => (
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
                  {companies.map((c, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '500' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--slate-600)' }}>{c.industry || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#6366f1', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Visit →
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="tag">{c.jobs_count || 0}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="tag">{c.applications_count || 0}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleDelete(c.id, c.name)} style={{
                          padding: '5px 14px', borderRadius: '6px', border: '1px solid #ef4444',
                          background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444'
                        }}>Delete</button>
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

export default AdminCompanies;
