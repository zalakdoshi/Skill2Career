import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { recommendationService, dataService } from '../services/api';

const SkillAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analysisData, insights] = await Promise.all([
        recommendationService.getSkillAnalysis(),
        dataService.getMarketInsights()
      ]);
      setAnalysis(analysisData.analysis);
      setMarketInsights(insights);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="page-title">Skill Analysis</h1>
          <p className="page-subtitle">Understand your skills and how they match industry demand</p>
        </div>

        {/* Summary Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon primary">💡</div>
            <div className="stat-content">
              <div className="stat-value">{analysis?.total_skills || 0}</div>
              <div className="stat-label">Total Skills</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{analysis?.top_category || 'N/A'}</div>
              <div className="stat-label">Best Fit Category</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">📊</div>
            <div className="stat-content">
              <div className="stat-value">{marketInsights?.job_count || 0}</div>
              <div className="stat-label">Jobs Analyzed</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Skill Distribution */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>📊 Your Skill Distribution</h3>
            
            {analysis?.skill_distribution ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(analysis.skill_distribution).map(([category, count], idx) => {
                  const percentage = Math.min((count / 10) * 100, 100);
                  const colors = [
                    { bg: 'linear-gradient(90deg, #b088c4, #c9a0d6)', light: 'rgba(176, 136, 196, 0.12)', text: '#9085c4' },
                    { bg: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', light: 'rgba(139, 92, 246, 0.12)', text: '#7c3aed' },
                    { bg: 'linear-gradient(90deg, #06b6d4, #22d3ee)', light: 'rgba(6, 182, 212, 0.12)', text: '#0891b2' },
                    { bg: 'linear-gradient(90deg, #10b981, #34d399)', light: 'rgba(16, 185, 129, 0.12)', text: '#059669' },
                    { bg: 'linear-gradient(90deg, #f59e0b, #fbbf24)', light: 'rgba(245, 158, 11, 0.12)', text: '#d97706' }
                  ];
                  const color = colors[idx % 5];
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '16px 18px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(253, 242, 248, 0.6))',
                        borderRadius: '16px',
                        border: '1px solid rgba(176, 136, 196, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: '600',
                          color: '#1e1e3f'
                        }}>{category}</span>
                        <span style={{ 
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          padding: '5px 12px',
                          borderRadius: '12px',
                          background: color.light,
                          color: color.text,
                          border: `1px solid ${color.light}`
                        }}>{count} skills</span>
                      </div>
                      <div style={{ 
                        height: '10px', 
                        background: 'rgba(0, 0, 0, 0.06)', 
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${percentage}%`,
                          height: '100%',
                          background: color.bg,
                          borderRadius: '10px',
                          transition: 'width 0.5s ease',
                          boxShadow: `0 0 10px ${color.light}`
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <div className="empty-title">No skills added</div>
                <div className="empty-text">Add skills in your profile to see analysis</div>
              </div>
            )}
          </div>

          {/* Career Category Fit */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>🎯 Career Category Fit</h3>
            
            {analysis?.category_fit ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(analysis.category_fit)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, score], idx) => (
                    <div key={idx} style={{ 
                      padding: '16px 18px',
                      background: idx === 0 
                        ? 'linear-gradient(135deg, rgba(176, 136, 196, 0.12), rgba(244, 114, 182, 0.06))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(253, 242, 248, 0.6))',
                      borderRadius: '16px',
                      border: idx === 0 
                        ? '1px solid rgba(176, 136, 196, 0.25)' 
                        : '1px solid rgba(176, 136, 196, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {idx === 0 && (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #b088c4, #c9a0d6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem'
                          }}>🏆</div>
                        )}
                        <span style={{ 
                          fontWeight: idx === 0 ? '700' : '500',
                          color: '#1e1e3f',
                          fontSize: idx === 0 ? '1rem' : '0.95rem'
                        }}>{category}</span>
                      </div>
                      <div style={{
                        padding: '6px 14px',
                        background: score >= 50 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))'
                          : score >= 30 
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1))'
                          : 'linear-gradient(135deg, rgba(176, 136, 196, 0.15), rgba(244, 114, 182, 0.1))',
                        border: `1px solid ${
                          score >= 50 ? 'rgba(16, 185, 129, 0.3)' 
                          : score >= 30 ? 'rgba(245, 158, 11, 0.3)' 
                          : 'rgba(176, 136, 196, 0.3)'
                        }`,
                        color: score >= 50 ? '#059669' : score >= 30 ? '#d97706' : '#9085c4',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem'
                      }}>
                        {Math.round(score)}%
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No data available</div>
                <div className="empty-text">Complete your profile to see career fit analysis</div>
              </div>
            )}
          </div>
        </div>

        {/* Market Insights */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>📈 Top Skills in Job Market</h3>
          
          {marketInsights?.top_skills && marketInsights.top_skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {marketInsights.top_skills.slice(0, 15).map((item, idx) => (
                <div key={idx} style={{
                  padding: '8px 14px',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontWeight: '500' }}>{item.skill}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)',
                    background: 'var(--border-color)',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Market insights will be available once job data is processed.
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>💡 Recommendations</h3>
          
          <div style={{ 
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(16, 185, 129, 0.05))',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary-color)'
          }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
              Based on your current skills:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
              {analysis?.total_skills < 5 && (
                <li>Add more skills to your profile for better career matching</li>
              )}
              {analysis?.skill_distribution?.['Programming Languages'] < 2 && (
                <li>Learn at least 2-3 programming languages for most tech roles</li>
              )}
              {analysis?.skill_distribution?.['Frameworks'] < 1 && (
                <li>Pick up a popular framework like React, Django, or Spring</li>
              )}
              {analysis?.top_category && (
                <li>Your skills align best with <strong>{analysis.top_category}</strong> roles - consider focusing here</li>
              )}
              <li>Keep learning and updating your skills based on market demand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
