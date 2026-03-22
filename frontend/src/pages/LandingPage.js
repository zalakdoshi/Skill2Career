import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-logo">S2C</div>
            <span className="landing-brand-name">Skill2Career</span>
          </div>
          <div className="landing-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#companies">For Companies</a>
          </div>
          <div className="landing-auth-btns">
            <button className="landing-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="landing-btn-solid" onClick={() => navigate('/register')}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-badge">🚀 AI-Powered Career & Job Matching</div>
        <h1 className="hero-title">
          Find Your Perfect<br />
          <span className="hero-highlight">Career Path.</span>
        </h1>
        <p className="hero-subtitle">
          Skill2Career connects students with their ideal careers and companies with
          the right talent. AI-powered skill matching, personalized course recommendations,
          and real-time job opportunities — all in one platform.
        </p>
        <div className="hero-actions">
          <button className="landing-btn-solid large" onClick={() => navigate('/register')}>
            Start Free →
          </button>
          <button className="landing-btn-ghost large" onClick={() => navigate('/login')}>
            I already have an account
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">50+</span>
            <span className="hero-stat-label">Career Paths</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">100+</span>
            <span className="hero-stat-label">Free Courses</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">💼</span>
            <span className="hero-stat-label">Live Jobs</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">AI</span>
            <span className="hero-stat-label">Mentor Chat</span>
          </div>
        </div>
      </section>

      {/* ── Student Features ── */}
      <section className="features" id="features">
        <div className="section-header">
          <span className="section-badge">For Students</span>
          <h2 className="section-title">Everything You Need to Launch Your Career</h2>
          <p className="section-subtitle">From skill analysis to job applications, we've got you covered.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #d4789c, #e891b9)'}}>🎯</div>
            <h3>Smart Career Matching</h3>
            <p>Our AI analyzes your skills, CGPA, projects, and internships to recommend the best career paths for you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #10b981, #34d399)'}}>📚</div>
            <h3>Course Recommendations</h3>
            <p>Get curated courses from Coursera, Udemy, and freeCodeCamp matched to your skill gaps.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'}}>🤖</div>
            <h3>AI Career Mentor</h3>
            <p>Chat with our AI mentor for personalized career advice, interview tips, and learning roadmaps.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #f59e0b, #fbbf24)'}}>📊</div>
            <h3>Skill Gap Analysis</h3>
            <p>See exactly which skills you need to develop and track your progress over time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #3b82f6, #60a5fa)'}}>💼</div>
            <h3>Job Listings</h3>
            <p>Browse real-time job postings from companies, see your skill match percentage, and apply with one click.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #06b6d4, #22d3ee)'}}>📋</div>
            <h3>Application Tracker</h3>
            <p>Track your job applications in real-time — from Applied to Shortlisted to Hired.</p>
          </div>
        </div>
      </section>

      {/* ── For Companies ── */}
      <section className="features company-features" id="companies">
        <div className="section-header">
          <span className="section-badge" style={{background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderColor: 'rgba(99,102,241,0.2)'}}>For Companies</span>
          <h2 className="section-title">Hire the Right Talent, Faster</h2>
          <p className="section-subtitle">Post jobs, discover skill-matched candidates, and manage applications in one place.</p>
        </div>
        <div className="features-grid three-col">
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #6366f1, #818cf8)'}}>📝</div>
            <h3>Post Jobs</h3>
            <p>Create job postings with required skills, salary range, location, and job type. Manage all your listings from one dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'}}>🔍</div>
            <h3>Discover Candidates</h3>
            <p>Search student profiles by skills and see automatic match scores based on skill overlap with your job requirements.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{background: 'linear-gradient(135deg, #a855f7, #c084fc)'}}>📊</div>
            <h3>Track Applications</h3>
            <p>View all applications, shortlist candidates, schedule interviews, and manage the hiring pipeline in real-time.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section" id="how">
        <div className="section-header">
          <span className="section-badge">How It Works</span>
          <h2 className="section-title">3 Simple Steps to Your Dream Career</h2>
        </div>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Build Your Profile</h3>
            <p>Add your skills, projects, education details, and career interests.</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Get Matched</h3>
            <p>AI matches you with careers & live jobs. Companies discover you based on your skills.</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Apply & Grow</h3>
            <p>Apply to jobs with one click, learn recommended courses, and track your career progress.</p>
          </div>
        </div>
      </section>

      {/* ── Courses Section ── */}
      <section className="courses-section" id="courses">
        <div className="section-header">
          <span className="section-badge">Courses</span>
          <h2 className="section-title">Learn from the Best Platforms</h2>
          <p className="section-subtitle">We curate courses from top platforms to fill your exact skill gaps.</p>
        </div>
        <div className="platform-logos">
          <div className="platform-logo">Coursera</div>
          <div className="platform-logo">Udemy</div>
          <div className="platform-logo">freeCodeCamp</div>
          <div className="platform-logo">YouTube</div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to Find Your<br /><span className="hero-highlight">Perfect Career?</span></h2>
        <p>Students discover careers. Companies discover talent. All powered by AI.</p>
        <div className="cta-buttons">
          <button className="landing-btn-solid large" onClick={() => navigate('/register')}>
            I'm a Student →
          </button>
          <button className="landing-btn-ghost large" style={{borderColor: '#818cf8', color: '#6366f1'}} onClick={() => navigate('/register')}>
            I'm a Company →
          </button>
        </div>
        <span className="cta-note">Setup in less than 2 minutes</span>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo small">S2C</div>
            <span>Skill2Career</span>
          </div>
          <div className="footer-links">
            <a href="#features">For Students</a>
            <a href="#companies">For Companies</a>
            <a href="#how">How It Works</a>
          </div>
          <div className="footer-copy">© 2026 Skill2Career. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
