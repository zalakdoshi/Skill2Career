import React, { useState } from 'react';
import './CareerCard.css';

const CareerCard = ({ recommendation, onViewDetails, isSaved = false, onToggleSave }) => {
  const { role, compatibility_score, readiness, skill_gaps } = recommendation;
  const [showAllSkillsToLearn, setShowAllSkillsToLearn] = useState(false);
  const [showAllSkillsHave, setShowAllSkillsHave] = useState(false);

  const getScoreClass = (score) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#b088c4';
  };

  const matchedSkills = role.required_skills.length - skill_gaps.missing_required.length;
  const totalSkills = role.required_skills.length;
  const skillPercentage = Math.round((matchedSkills / totalSkills) * 100);

  // Calculate stroke dash for SVG circle
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compatibility_score / 100) * circumference;

  const scoreClass = getScoreClass(compatibility_score);
  const skillClass = getScoreClass(skillPercentage);
  const readinessClass = getScoreClass(readiness.overall_readiness);

  // Get skills the user has
  const skillsUserHas = role.required_skills.filter(skill => !skill_gaps.missing_required.includes(skill));
  const skillsToLearn = skill_gaps.missing_required;

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave();
    }
  };

  return (
    <div className="career-card">
      {/* Bookmark/Save Button */}
      <button 
        className={`career-card__save-btn ${isSaved ? 'saved' : ''}`}
        onClick={handleSaveClick}
        title={isSaved ? 'Remove from saved' : 'Save career'}
      >
        {isSaved ? '⭐' : '☆'}
      </button>

      {/* Decorative gradient orb */}
      <div className={`career-card__orb career-card__orb--${scoreClass}`} />

      {/* Top accent line */}
      <div className={`career-card__accent career-card__accent--${scoreClass}`} />

      {/* Header with SVG Score Circle */}
      <div className="career-card__header">
        {/* Animated SVG Score Circle */}
        <div className="career-card__score-container">
          <div className="career-card__score-bg" />
          
          <svg width="80" height="80" className="career-card__score-svg">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="6"
            />
            {/* Progress circle with gradient */}
            <defs>
              <linearGradient 
                id={`scoreGradient-${role.title.replace(/\s/g, '')}`} 
                x1="0%" 
                y1="0%" 
                x2="100%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={getScoreColor(compatibility_score)} />
                <stop offset="100%" stopColor={getScoreColor(compatibility_score)} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={`url(#scoreGradient-${role.title.replace(/\s/g, '')})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`career-card__score-ring career-card__score-ring--${scoreClass}`}
            />
          </svg>
          
          {/* Score text in center */}
          <div className="career-card__score-text">
            <span className="career-card__score-value">
              {Math.round(compatibility_score)}%
            </span>
            <span className="career-card__score-label">Match</span>
          </div>
        </div>

        {/* Title & Category */}
        <div className="career-card__info">
          <h3 className="career-card__title">{role.title}</h3>
          <div className="career-card__badges">
            <span className="career-card__badge career-card__badge--category">
              {role.category}
            </span>
            {role.growth_rate && (
              <span className="career-card__badge career-card__badge--growth">
                <span>📈</span>
                {role.growth_rate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="career-card__description">{role.description}</p>

      {/* Stats Row - Glassmorphism pills */}
      <div className="career-card__stats">
        {/* Skills Matched Pill */}
        <div className="career-card__stat-pill">
          <div className="career-card__stat-header">
            <span className="career-card__stat-label">Skills Match</span>
            <span className={`career-card__stat-value career-card__stat-value--${skillClass}`}>
              {skillPercentage}%
            </span>
          </div>
          <div className="career-card__progress-track">
            <div 
              className={`career-card__progress-fill career-card__progress-fill--${skillClass}`}
              style={{ width: `${skillPercentage}%` }}
            />
          </div>
        </div>

        {/* Readiness Pill */}
        <div className="career-card__stat-pill">
          <div className="career-card__stat-header">
            <span className="career-card__stat-label">Readiness</span>
            <span className={`career-card__stat-value career-card__stat-value--${readinessClass}`}>
              {Math.round(readiness.overall_readiness)}%
            </span>
          </div>
          <div className="career-card__progress-track">
            <div 
              className={`career-card__progress-fill career-card__progress-fill--${readinessClass}`}
              style={{ width: `${readiness.overall_readiness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="career-card__skills">
        {/* Skills You Have */}
        {matchedSkills > 0 && (
          <div className="career-card__skills-group">
            <span className="career-card__skills-label career-card__skills-label--have">
              <span className="career-card__skills-icon career-card__skills-icon--have">✓</span>
              Skills You Have
            </span>
            <div className="career-card__skills-list">
              {(showAllSkillsHave ? skillsUserHas : skillsUserHas.slice(0, 4)).map((skill, idx) => (
                <span key={idx} className="career-card__skill-tag career-card__skill-tag--have">
                  {skill}
                </span>
              ))}
              {skillsUserHas.length > 4 && (
                <span 
                  className="career-card__skill-tag career-card__skill-tag--more career-card__skill-tag--clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllSkillsHave(!showAllSkillsHave);
                  }}
                >
                  {showAllSkillsHave ? '− Show less' : `+${skillsUserHas.length - 4} more`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Skills to Learn */}
        {skillsToLearn.length > 0 && (
          <div className="career-card__skills-group">
            <span className="career-card__skills-label career-card__skills-label--learn">
              <span className="career-card__skills-icon career-card__skills-icon--learn">+</span>
              Skills to Learn
            </span>
            <div className="career-card__skills-list">
              {(showAllSkillsToLearn ? skillsToLearn : skillsToLearn.slice(0, 4)).map((skill, idx) => (
                <span key={idx} className="career-card__skill-tag career-card__skill-tag--learn">
                  {skill}
                </span>
              ))}
              {skillsToLearn.length > 4 && (
                <span 
                  className="career-card__skill-tag career-card__skill-tag--more career-card__skill-tag--clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllSkillsToLearn(!showAllSkillsToLearn);
                  }}
                >
                  {showAllSkillsToLearn ? '− Show less' : `+${skillsToLearn.length - 4} more`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <button 
        className="career-card__button"
        onClick={() => onViewDetails && onViewDetails(recommendation)}
      >
        View Details
        <span className="career-card__button-arrow">→</span>
      </button>
    </div>
  );
};

export default CareerCard;
