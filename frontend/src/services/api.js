const API_URL = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth Services
export const authService = {
  async register(email, password, name) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get user');
    return data;
  }
};

// Profile Services
export const profileService = {
  async getProfile() {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get profile');
    return data;
  },

  async updateProfile(profileData) {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  }
};

// Recommendation Services
export const recommendationService = {
  async getRecommendations() {
    const response = await fetch(`${API_URL}/recommendations`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get recommendations');
    return data;
  },

  async getSkillAnalysis() {
    const response = await fetch(`${API_URL}/skills/analysis`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get skill analysis');
    return data;
  }
};

// Dashboard Services
export const dashboardService = {
  async getDashboard() {
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get dashboard');
    return data;
  }
};

// Data Services
export const dataService = {
  async getSkillsList() {
    const response = await fetch(`${API_URL}/data/skills`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get skills');
    return data;
  },

  async getCareers() {
    const response = await fetch(`${API_URL}/data/careers`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get careers');
    return data;
  },

  async getMarketInsights() {
    const response = await fetch(`${API_URL}/data/market-insights`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get insights');
    return data;
  }
};

// AI Mentor Services
export const mentorService = {
  async sendMessage(message) {
    const response = await fetch(`${API_URL}/mentor/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get response');
    return data;
  }
};

// Saved Careers Services
export const savedCareersService = {
  async getSavedCareers() {
    const response = await fetch(`${API_URL}/careers/saved`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get saved careers');
    return data;
  },

  async saveCareer(careerId, careerTitle) {
    const response = await fetch(`${API_URL}/careers/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ career_id: careerId, career_title: careerTitle })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to save career');
    return data;
  },

  async unsaveCareer(careerId) {
    const response = await fetch(`${API_URL}/careers/unsave/${careerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to unsave career');
    return data;
  }
};

// Course Services
export const courseService = {
  async getRecommendedCourses() {
    const response = await fetch(`${API_URL}/courses/recommend`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get courses');
    return data;
  }
};

// Admin Services
export const adminService = {
  async getStats() {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get admin stats');
    return data;
  },

  async getUsers() {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get users');
    return data;
  },

  async deleteUser(userId) {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async getCareers() {
    const response = await fetch(`${API_URL}/admin/careers`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get careers');
    return data;
  },

  async addCareer(careerData) {
    const response = await fetch(`${API_URL}/admin/careers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(careerData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add career');
    return data;
  },

  async updateCareer(careerId, careerData) {
    const response = await fetch(`${API_URL}/admin/careers/${careerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(careerData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update career');
    return data;
  },

  async deleteCareer(careerId) {
    const response = await fetch(`${API_URL}/admin/careers/${careerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete career');
    return data;
  },

  async getCourses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.type) params.append('type', filters.type);
    const url = `${API_URL}/admin/courses${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get courses');
    return data;
  },

  async addCourse(courseData) {
    const response = await fetch(`${API_URL}/admin/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add course');
    return data;
  },

  async deleteCourse(courseId) {
    const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete course');
    return data;
  },

  async getCompanies() {
    const response = await fetch(`${API_URL}/admin/companies`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get companies');
    return data;
  },

  async deleteCompany(companyId) {
    const response = await fetch(`${API_URL}/admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete company');
    return data;
  }
};

// Company Auth Services
export const companyAuthService = {
  async register(data) {
    const response = await fetch(`${API_URL}/company/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  async login(email, password) {
    const response = await fetch(`${API_URL}/company/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getCurrentCompany() {
    const response = await fetch(`${API_URL}/company/me`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to get company');
    return result;
  }
};

// Company Services (authenticated company endpoints)
export const companyService = {
  async getStats() {
    const response = await fetch(`${API_URL}/company/stats`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get stats');
    return data;
  },

  async getJobs() {
    const response = await fetch(`${API_URL}/company/jobs`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get jobs');
    return data;
  },

  async createJob(jobData) {
    const response = await fetch(`${API_URL}/company/jobs`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(jobData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create job');
    return data;
  },

  async updateJob(jobId, updates) {
    const response = await fetch(`${API_URL}/company/jobs/${jobId}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update job');
    return data;
  },

  async deleteJob(jobId) {
    const response = await fetch(`${API_URL}/company/jobs/${jobId}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete job');
    return data;
  },

  async searchCandidates(skills) {
    const response = await fetch(`${API_URL}/company/candidates?skills=${encodeURIComponent(skills)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to search candidates');
    return data;
  },

  async getApplications() {
    const response = await fetch(`${API_URL}/company/applications`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get applications');
    return data;
  },

  async updateApplicationStatus(appId, status) {
    const response = await fetch(`${API_URL}/company/applications/${appId}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update application');
    return data;
  },

  async getAllCandidates() {
    const response = await fetch(`${API_URL}/company/all-candidates`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get candidates');
    return data;
  },

  async inviteCandidate(studentId, jobId) {
    const response = await fetch(`${API_URL}/company/invite`, {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ student_id: studentId, job_id: jobId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send invite');
    return data;
  }
};

// Job Services (student-side)
export const jobService = {
  async getJobs() {
    const response = await fetch(`${API_URL}/jobs`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get jobs');
    return data;
  },

  async applyToJob(jobId) {
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST', headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to apply');
    return data;
  },

  async getMyApplications() {
    const response = await fetch(`${API_URL}/my-applications`, { headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get applications');
    return data;
  }
};
