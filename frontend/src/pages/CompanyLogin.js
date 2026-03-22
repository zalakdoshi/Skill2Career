import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', industry: '', website: '', description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { companyLogin, companyRegister } = useAuth();

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
    'Manufacturing', 'Consulting', 'Media', 'Telecom', 'Automotive', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await companyRegister(formData);
      } else {
        await companyLogin(formData.email, formData.password);
      }
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo" onClick={() => navigate('/')}>S2C</div>
          <h1>{isRegister ? 'Register Your Company' : 'Company Login'}</h1>
          <p>{isRegister ? 'Create your company account to start hiring' : 'Sign in to your company dashboard'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Enter company name" required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange}>
                  <option value="">Select Industry</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange}
                  placeholder="https://yourcompany.com" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Brief description of your company" rows="3" />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="company@email.com" required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Min 6 characters" required minLength="6" />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Register Company' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <p>Already have an account? <button onClick={() => { setIsRegister(false); setError(''); }}>Sign In</button></p>
          ) : (
            <p>New company? <button onClick={() => { setIsRegister(true); setError(''); }}>Register here</button></p>
          )}
          <p style={{ marginTop: '0.5rem' }}>
            <button onClick={() => navigate('/login')} style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>← Student/Admin Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
