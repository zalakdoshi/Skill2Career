import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SkillSelector from '../components/SkillSelector';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    cgpa: 0,
    branch: '',
    semester: 1,
    university: '',
    graduation_year: 0,
    backlogs: 0,
    skills: [],
    languages: [],
    frameworks: [],
    databases: [],
    platforms: [],
    projects: [],
    internships: [],
    career_interests: [],
    certifications: [],
    placement_interest: true
  });

  const [newProject, setNewProject] = useState({ name: '', description: '', technologies: '', teamSize: '', duration: '' });
  const [newInternship, setNewInternship] = useState({ company: '', role: '', duration: '' });
  const [customCareerInterest, setCustomCareerInterest] = useState('');
  const [careerOptions, setCareerOptions] = useState([]);
  const [loadingCareers, setLoadingCareers] = useState(true);

  useEffect(() => {
    if (profile) {
      setFormData({
        cgpa: profile.cgpa || 0,
        branch: profile.branch || '',
        semester: profile.semester || 1,
        university: profile.university || '',
        graduation_year: profile.graduation_year || 0,
        backlogs: profile.backlogs || 0,
        skills: profile.skills || [],
        languages: profile.languages || [],
        frameworks: profile.frameworks || [],
        databases: profile.databases || [],
        platforms: profile.platforms || [],
        projects: profile.projects || [],
        internships: profile.internships || [],
        career_interests: profile.career_interests || [],
        certifications: profile.certifications || [],
        placement_interest: profile.placement_interest !== false
      });
    }
  }, [profile]);

  // Fetch career options from backend
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/data/careers');
        const data = await response.json();
        if (data && data.careers) {
          // Extract just the titles for the career options
          const careerTitles = data.careers.map(career => career.title);
          setCareerOptions(careerTitles);
        }
      } catch (err) {
        console.error('Failed to load career options:', err);
        // Fallback to default options if API fails
        setCareerOptions([
          'Software Developer', 'Data Scientist', 'Full Stack Developer',
          'Machine Learning Engineer', 'DevOps Engineer', 'Backend Developer',
          'Frontend Developer', 'Cloud Engineer', 'Mobile App Developer',
          'Cybersecurity Analyst', 'Data Analyst', 'AI Research Engineer'
        ]);
      } finally {
        setLoadingCareers(false);
      }
    };
    fetchCareers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addProject = () => {
    if (newProject.name) {
      setFormData({
        ...formData,
        projects: [...formData.projects, { ...newProject }]
      });
      setNewProject({ name: '', description: '', technologies: '', teamSize: '', duration: '' });
    }
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    });
  };

  const addInternship = () => {
    if (newInternship.company && newInternship.role) {
      setFormData({
        ...formData,
        internships: [...formData.internships, { ...newInternship }]
      });
      setNewInternship({ company: '', role: '', duration: '' });
    }
  };

  const removeInternship = (index) => {
    setFormData({
      ...formData,
      internships: formData.internships.filter((_, i) => i !== index)
    });
  };

  const branches = [
    'Computer Science', 'Information Technology', 'Electronics', 
    'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Other'
  ];

  const teamSizeOptions = [
    'Solo', '2-3 members', '4-5 members', '6-10 members', '10+ members'
  ];

  const projectDurationOptions = [
    '< 1 week', '1-2 weeks', '2-4 weeks', '1-2 months', '3-6 months', '6+ months'
  ];

  const addCustomCareerInterest = () => {
    if (customCareerInterest.trim() && !formData.career_interests.includes(customCareerInterest.trim())) {
      setFormData({
        ...formData,
        career_interests: [...formData.career_interests, customCareerInterest.trim()]
      });
      setCustomCareerInterest('');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Update your academic details and skills</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>📚 Academic Information</h3>
            
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">CGPA (out of 10)</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <select
                  className="form-select"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Semester</label>
                <select
                  className="form-select"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                >
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>🎓 Education Details</h3>
            
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">University/College Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your university name"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Graduation Year</label>
                <select
                  className="form-select"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) || 0 })}
                >
                  <option value="0">Select Year</option>
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Backlogs</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="20"
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>💻 Technical Skills</h3>
            
            <div className="grid-2">
              <SkillSelector
                title="Programming Languages"
                category="languages"
                selectedSkills={formData.languages}
                onSkillsChange={(skills) => setFormData({ ...formData, languages: skills })}
              />

              <SkillSelector
                title="Frameworks & Libraries"
                category="frameworks"
                selectedSkills={formData.frameworks}
                onSkillsChange={(skills) => setFormData({ ...formData, frameworks: skills })}
              />

              <SkillSelector
                title="Databases"
                category="databases"
                selectedSkills={formData.databases}
                onSkillsChange={(skills) => setFormData({ ...formData, databases: skills })}
              />

              <SkillSelector
                title="Platforms & Tools"
                category="platforms"
                selectedSkills={formData.platforms}
                onSkillsChange={(skills) => setFormData({ ...formData, platforms: skills })}
              />
            </div>

            <SkillSelector
              title="Other Skills"
              category="skills"
              selectedSkills={formData.skills}
              onSkillsChange={(skills) => setFormData({ ...formData, skills: skills })}
            />
          </div>

          {/* Projects */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>📁 Projects</h3>
            
            {formData.projects.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                {formData.projects.map((project, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{project.name}</div>
                      {project.description && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {project.description}
                        </div>
                      )}
                      {project.technologies && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '4px' }}>
                          Tech: {project.technologies}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {project.teamSize && <span>👥 {project.teamSize}</span>}
                        {project.duration && <span>⏱️ {project.duration}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeProject(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brief Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What does it do?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies Used</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, Node.js, etc."
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Team Size</label>
                <select
                  className={`form-select ${!newProject.teamSize ? 'form-select-placeholder' : ''}`}
                  value={newProject.teamSize}
                  onChange={(e) => setNewProject({ ...newProject, teamSize: e.target.value })}
                >
                  <option value="">Select team size</option>
                  {teamSizeOptions.map((size, idx) => (
                    <option key={idx} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  className={`form-select ${!newProject.duration ? 'form-select-placeholder' : ''}`}
                  value={newProject.duration}
                  onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                >
                  <option value="">Select duration</option>
                  {projectDurationOptions.map((dur, idx) => (
                    <option key={idx} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addProject}
              style={{ marginTop: '1rem' }}
            >
              + Add Project
            </button>
          </div>

          {/* Internships */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>💼 Internships</h3>
            
            {formData.internships.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                {formData.internships.map((internship, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{internship.role}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {internship.company} {internship.duration && `• ${internship.duration}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeInternship(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter company name"
                  value={newInternship.company}
                  onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role/Position</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Software Intern"
                  value={newInternship.role}
                  onChange={(e) => setNewInternship({ ...newInternship, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 3 months"
                  value={newInternship.duration}
                  onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addInternship}
              style={{ marginTop: '1rem' }}
            >
              + Add Internship
            </button>
          </div>

          {/* Career Interests */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>🎯 Career Interests</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select from predefined career paths or add your own custom interests
            </p>
            
            {/* Predefined Career Options */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Popular Career Paths</label>
              {loadingCareers ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading career options...</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {careerOptions.map((option, idx) => {
                    const isSelected = formData.career_interests.includes(option);
                    return (
                      <span
                        key={idx}
                        className={`tag ${isSelected ? 'success' : ''}`}
                        style={{ cursor: 'pointer', padding: '8px 14px' }}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              career_interests: formData.career_interests.filter(c => c !== option)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              career_interests: [...formData.career_interests, option]
                            });
                          }
                        }}
                      >
                        {option} {isSelected && '✓'}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Career Interest Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Add Custom Career Interest</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Game Developer, Blockchain Engineer..."
                  value={customCareerInterest}
                  onChange={(e) => setCustomCareerInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomCareerInterest();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addCustomCareerInterest}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Display Custom Career Interests (those not in predefined list) */}
            {formData.career_interests.filter(c => !careerOptions.includes(c)).length > 0 && (
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Your Custom Interests</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.career_interests.filter(c => !careerOptions.includes(c)).map((custom, idx) => (
                    <span
                      key={idx}
                      className="tag success"
                      style={{ cursor: 'pointer', padding: '8px 14px' }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          career_interests: formData.career_interests.filter(c => c !== custom)
                        });
                      }}
                    >
                      {custom} ✕
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Placement Interest Toggle */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>💼 Open to Job Opportunities</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                  When enabled, companies can discover your profile and invite you for job opportunities
                </p>
              </div>
              <div 
                onClick={() => setFormData({ ...formData, placement_interest: !formData.placement_interest })}
                style={{
                  width: '52px', height: '28px', borderRadius: '14px', cursor: 'pointer',
                  background: formData.placement_interest 
                    ? 'linear-gradient(135deg, #10b981, #34d399)' 
                    : '#cbd5e1',
                  position: 'relative', transition: 'background 0.3s', flexShrink: 0
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '3px',
                  left: formData.placement_interest ? '27px' : '3px',
                  transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
            {!formData.placement_interest && (
              <div style={{ marginTop: '0.75rem', padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e' }}>
                ⚠️ Your profile is hidden from companies. Toggle this on to be discovered for jobs.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
