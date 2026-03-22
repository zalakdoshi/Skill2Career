import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CareerCard from '../components/CareerCard';
import { recommendationService, savedCareersService } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [filter, setFilter] = useState('all');
  const [savedCareers, setSavedCareers] = useState([]);

  useEffect(() => {
    loadRecommendations();
    loadSavedCareers();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await recommendationService.getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCareers = async () => {
    try {
      const data = await savedCareersService.getSavedCareers();
      setSavedCareers(data.saved_careers || []);
    } catch (error) {
      console.error('Failed to load saved careers:', error);
    }
  };

  const toggleSaveCareer = async (careerId, careerTitle) => {
    const isCurrentlySaved = savedCareers.some(c => c.career_id === careerId);
    try {
      if (isCurrentlySaved) {
        await savedCareersService.unsaveCareer(careerId);
        setSavedCareers(savedCareers.filter(c => c.career_id !== careerId));
      } else {
        const result = await savedCareersService.saveCareer(careerId, careerTitle);
        setSavedCareers(result.saved_careers || [...savedCareers, { career_id: careerId, career_title: careerTitle }]);
      }
    } catch (error) {
      console.error('Failed to toggle save career:', error);
    }
  };

  const isCareerSaved = (careerId) => {
    return savedCareers.some(c => c.career_id === careerId);
  };

  const categories = ['all', 'saved', ...new Set(recommendations.map(r => r.role.category))];

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : filter === 'saved'
    ? recommendations.filter(r => isCareerSaved(r.role.id))
    : recommendations.filter(r => r.role.category === filter);

  const viewDetails = (recommendation) => {
    setSelectedRole(recommendation);
  };

  const closeDetails = () => {
    setSelectedRole(null);
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
          <h1 className="page-title">Career Recommendations</h1>
          <p className="page-subtitle">Explore career paths that match your skills and interests</p>
        </div>

        {/* Category Filter */}
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`tab ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Roles' : cat === 'saved' ? `⭐ Saved (${savedCareers.length})` : cat}
            </div>
          ))}
        </div>

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 ? (
          <div className="grid-3">
            {filteredRecommendations.map((rec, idx) => (
              <CareerCard 
                key={idx} 
                recommendation={rec} 
                onViewDetails={viewDetails}
                isSaved={isCareerSaved(rec.role.id)}
                onToggleSave={() => toggleSaveCareer(rec.role.id, rec.role.title)}
              />
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <div className="empty-title">No recommendations yet</div>
              <div className="empty-text">
                Complete your profile with skills, projects, and experience to get personalized career recommendations.
              </div>
            </div>
          </div>
        )}

        {/* ═══ Career Detail Modal — Clean White + Girly Accents ═══ */}
        {selectedRole && (
          <div className="glass-modal-overlay" onClick={closeDetails}>
            <div className="glass-modal" onClick={(e) => e.stopPropagation()}>

              {/* Close */}
              <button className="glass-modal__close" onClick={closeDetails}>✕</button>

              {/* Header — Score + Title */}
              <div className="modal-header">
                <div className="modal-score-wrap">
                  <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r="36" fill="none" stroke="#f1f5f9" strokeWidth="7" />
                    <circle
                      cx="45" cy="45" r="36" fill="none"
                      stroke={selectedRole.compatibility_score >= 70 ? '#10b981' : selectedRole.compatibility_score >= 40 ? '#f59e0b' : '#b088c4'}
                      strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={(2 * Math.PI * 36) - (selectedRole.compatibility_score / 100) * (2 * Math.PI * 36)}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="modal-score-text">
                    <span className="modal-score-value">{Math.round(selectedRole.compatibility_score)}%</span>
                    <span className="modal-score-label">Match</span>
                  </div>
                </div>
                <div className="modal-title-section">
                  <h2 className="modal-role-title">{selectedRole.role.title}</h2>
                  <div className="modal-badges">
                    <span className="modal-badge modal-badge--category">{selectedRole.role.category}</span>
                    {selectedRole.role.growth_rate && (
                      <span className="modal-badge modal-badge--growth">📈 {selectedRole.role.growth_rate}</span>
                    )}
                    <span className="modal-badge modal-badge--cgpa">Min CGPA: {selectedRole.role.min_cgpa}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="modal-description">
                <p>{selectedRole.role.description}</p>
              </div>

              {/* Readiness Breakdown */}
              <div className="modal-section">
                <h4 className="modal-section-title">📊 Readiness Breakdown</h4>
                <div className="modal-readiness-grid">
                  {[
                    { label: 'Skill Match', value: selectedRole.readiness.skill_score, icon: '🎯' },
                    { label: 'CGPA Score', value: selectedRole.readiness.cgpa_score, icon: '📚' },
                    { label: 'Projects', value: selectedRole.readiness.project_score, icon: '💻' },
                    { label: 'Internships', value: selectedRole.readiness.internship_score, icon: '💼' }
                  ].map((item, idx) => (
                    <div key={idx} className="modal-readiness-card">
                      <div className="modal-readiness-top">
                        <span className="modal-readiness-label">{item.icon} {item.label}</span>
                        <span className={`modal-readiness-value ${
                          item.value >= 70 ? 'text-mint' : item.value >= 40 ? 'text-amber' : 'text-rose'
                        }`}>{Math.round(item.value)}%</span>
                      </div>
                      <div className="modal-progress-track">
                        <div className={`modal-progress-fill ${
                          item.value >= 70 ? 'fill-mint' : item.value >= 40 ? 'fill-amber' : 'fill-rose'
                        }`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills You Have / Need */}
              <div className="modal-section">
                <h4 className="modal-section-title">🎯 Skills Analysis</h4>
                {selectedRole.matching_skills && selectedRole.matching_skills.length > 0 && (
                  <div className="modal-skill-group">
                    <span className="modal-skill-label modal-skill-label--have">✓ Skills You Have</span>
                    <div className="modal-skill-tags">
                      {selectedRole.matching_skills.map((s, i) => (
                        <span key={i} className="modal-skill-tag modal-skill-tag--have">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRole.missing_skills && selectedRole.missing_skills.length > 0 && (
                  <div className="modal-skill-group">
                    <span className="modal-skill-label modal-skill-label--learn">⚡ Skills to Learn</span>
                    <div className="modal-skill-tags">
                      {selectedRole.missing_skills.map((s, i) => (
                        <span key={i} className="modal-skill-tag modal-skill-tag--learn">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {selectedRole.suggestions && selectedRole.suggestions.length > 0 && (
                <div className="modal-section">
                  <h4 className="modal-section-title">💡 Improvement Tips</h4>
                  {selectedRole.suggestions.map((s, idx) => (
                    <div key={idx} className={`modal-suggestion ${s.priority === 'high' ? 'modal-suggestion--high' : 'modal-suggestion--medium'}`}>
                      {s.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Course Recommendations per Missing Skill */}
              {selectedRole.suggested_courses && selectedRole.suggested_courses.length > 0 && (
                <div className="modal-section">
                  <h4 className="modal-section-title">📚 Courses to Improve</h4>
                  {selectedRole.suggested_courses.map((group, gIdx) => (
                    <div key={gIdx} className="modal-course-group">
                      <div className="modal-course-skill-header">
                        <span className="modal-course-skill-dot" />
                        <span>Learn <strong>{group.skill}</strong></span>
                      </div>
                      {group.courses.map((course, cIdx) => (
                        <div key={cIdx} className="modal-course-item">
                          <div className="modal-course-info">
                            <div className="modal-course-title">{course.title}</div>
                            <div className="modal-course-meta">
                              <span className="modal-course-platform">{course.platform}</span>
                              <span className={`modal-course-type ${course.type === 'free' ? 'modal-course-type--free' : 'modal-course-type--paid'}`}>
                                {course.type === 'free' ? '🆓 Free' : '💎 Paid'}
                              </span>
                            </div>
                          </div>
                          <a href={course.url} target="_blank" rel="noopener noreferrer" className="modal-course-link">
                            Enroll →
                          </a>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button className="modal-close-btn" onClick={closeDetails}>
                Got It ✨
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
