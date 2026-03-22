import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [mode, setMode] = useState('student'); // 'student' or 'company'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, companyRegister } = useAuth();

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
    'Manufacturing', 'Consulting', 'Media', 'Telecom', 'Automotive', 'Other'
  ];

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setIndustry(''); setWebsite(''); setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'company') {
        await companyRegister({ name, email, password, industry, website, description });
        navigate('/company/dashboard');
      } else {
        await register(email, password, name);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Top Nav */}
      <nav className="auth-nav">
        <div className="auth-nav-inner">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">S2C</div>
            <span className="auth-brand-name">Skill2Career</span>
          </Link>
          <div className="auth-nav-right">
            <span className="auth-nav-text">Already have an account?</span>
            <Link to="/login" className="auth-nav-btn">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="auth-content">
        <div className="auth-card" style={mode === 'company' ? { maxWidth: '500px' } : {}}>
          {/* Role Toggle */}
          <div className="auth-role-toggle">
            <button
              className={`auth-role-btn ${mode === 'student' ? 'active' : ''}`}
              onClick={() => switchMode('student')}
            >
              👤 Student
            </button>
            <button
              className={`auth-role-btn ${mode === 'company' ? 'active company' : ''}`}
              onClick={() => switchMode('company')}
            >
              🏢 Company
            </button>
          </div>

          <h1 className="auth-title">
            {mode === 'company' ? 'Register your company' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'company'
              ? 'Set up your company to start hiring talent'
              : 'Start your career journey in under 2 minutes'}
          </p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>{mode === 'company' ? 'Company Name' : 'Full Name'}</label>
              <input
                type="text"
                placeholder={mode === 'company' ? 'Your company name' : 'Your full name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {mode === 'company' && (
              <>
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label>Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                      className="auth-select">
                      <option value="">Select Industry</option>
                      {industries.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="auth-field">
                    <label>Website</label>
                    <input
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label>Description</label>
                  <textarea
                    className="auth-textarea"
                    placeholder="Brief description of your company"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder={mode === 'company' ? 'company@email.com' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field-row">
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`auth-submit ${mode === 'company' ? 'company-submit' : ''}`} disabled={loading}>
              {loading ? (
                <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
              ) : (
                <>{mode === 'company' ? 'Register Company →' : 'Create Account →'}</>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
