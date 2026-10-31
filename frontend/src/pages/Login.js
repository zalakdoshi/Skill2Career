import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const DEMO_EMAIL = 'demo@skill2career.com';
const DEMO_PASSWORD = 'Demo@123';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, companyLogin } = useAuth();

  const doLogin = async (em, pw) => {
    setError('');
    setLoading(true);
    try {
      const data = await login(em, pw);
      if (data.user && data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      try {
        await companyLogin(em, pw);
        navigate('/company/dashboard');
      } catch {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    doLogin(DEMO_EMAIL, DEMO_PASSWORD);
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
            <span className="auth-nav-text">Don't have an account?</span>
            <Link to="/register" className="auth-nav-btn">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="auth-content">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>

          {error && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── One-click Demo Login Banner ── */}
          <button
            type="button"
            className="auth-demo-btn"
            disabled={loading}
            onClick={handleDemoLogin}
          >
            <span className="auth-demo-icon">🚀</span>
            <span className="auth-demo-text">
              <strong>Try Demo Account</strong>
              <small>One click — no signup needed</small>
            </span>
            <span className="auth-demo-arrow">→</span>
          </button>

          <div className="auth-demo-divider"><span>or sign in manually</span></div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

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

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
