# 🎯 Skill2Career Backend

A powerful Flask-based backend service that provides AI-driven career recommendations, skill gap analysis, and job matching for students and companies.

**Live Deployment:** [skill2career.vercel.app](https://skill2career.vercel.app)

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Authentication & JWT Flow](#authentication--jwt-flow)
- [Database Models](#database-models)
- [Recommendation Algorithm](#recommendation-algorithm)
- [Gemini AI Integration](#gemini-ai-integration)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Local Development](#local-development)

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────┐
│   React Frontend    │  (Student/Company UI)
└──────────┬──────────┘
           │ HTTP/REST
           │
┌──────────▼──────────────────────────────┐
│    Flask Backend API                     │
├─────────────────────────────────────────┤
│ • Auth Routes (JWT)                     │
│ • Student Profile Management             │
│ • Recommendation Engine                  │
│ • Company & Job Management               │
│ • AI Mentor Integration                  │
└────┬──────────────────────────┬─────────┘
     │                          │
     │ MongoDB Driver           │ Gemini API
     │                          │
┌────▼────────────┐    ┌───────▼────────────┐
│  MongoDB Atlas   │    │  Google Gemini AI   │
│  (Data Storage)  │    │  (AI Guidance)      │
└─────────────────┘    └────────────────────┘
```

### Flask Application Structure

```
backend/
├── app.py                      # Main Flask application & route definitions
├── models.py                   # MongoDB models (User, Profile, Company, Job, etc.)
├── recommendation_engine.py    # Core recommendation algorithm
├── ai_mentor.py               # Gemini AI integration
├── data_loader.py             # Career data loading & caching
├── config.py                  # Configuration management
├── requirements.txt           # Python dependencies
├── test_recommendation_engine.py  # Comprehensive test suite
├── careers_data.json          # Career roles and requirements data
└── courses_data.json          # Learning resources by skill
```

### Data Flow

1. **Student Registration** → User account created, empty profile initialized
2. **Profile Completion** → Student enters skills, CGPA, projects, internships
3. **Recommendation Request** → Recommendation engine analyzes profile
4. **Skill Matching** → Algorithm calculates compatibility scores
5. **AI Enhancement** → Gemini AI generates personalized guidance
6. **Response** → Ranked career recommendations with skill gaps and suggestions

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js, JavaScript | Student/Company UI |
| **Backend** | Flask, Python | RESTful API server |
| **Database** | MongoDB Atlas | User profiles, jobs, applications |
| **Authentication** | JWT (Flask-JWT-Extended) | Secure token-based auth |
| **AI** | Google Gemini API | Intelligent guidance & mentoring |
| **Security** | Bcrypt | Password hashing |
| **CORS** | Flask-CORS | Cross-origin resource sharing |
| **Testing** | unittest, Mock | Test suite |

---

## 📡 API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 201 Created
{
  "message": "Registration successful",
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
  "access_token": "eyJ0eXAiOiJKV1QiLC..."
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" },
  "access_token": "eyJ0eXAiOiJKV1QiLC..."
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {access_token}

Response: 200 OK
{
  "user": { "id": "...", "email": "...", "name": "...", "role": "user" }
}
```

### Student Profile Routes

#### Get Profile
```
GET /api/profile
Authorization: Bearer {access_token}

Response: 200 OK
{
  "profile": {
    "user_id": "...",
    "cgpa": 7.5,
    "branch": "Computer Science",
    "semester": 6,
    "university": "ABC University",
    "graduation_year": 2025,
    "skills": ["Python", "JavaScript"],
    "languages": ["Python", "Java", "C++"],
    "frameworks": ["React", "Express"],
    "databases": ["MongoDB", "PostgreSQL"],
    "platforms": ["AWS", "Docker"],
    "projects": [...],
    "internships": [...],
    "career_interests": ["Full Stack Development"],
    "certifications": [...]
  },
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

#### Update Profile
```
PUT /api/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "cgpa": 7.8,
  "branch": "Computer Science",
  "semester": 7,
  "university": "ABC University",
  "graduation_year": 2025,
  "skills": ["Python", "JavaScript", "SQL"],
  "languages": ["Python", "Java", "C++"],
  "frameworks": ["React", "Express", "Django"],
  "databases": ["MongoDB", "PostgreSQL"],
  "platforms": ["AWS", "Docker", "Linux"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack web application",
      "tech": ["Python", "React", "MongoDB"],
      "link": "https://github.com/..."
    }
  ],
  "internships": [
    {
      "company": "TechCorp",
      "role": "Backend Developer",
      "duration": "3 months",
      "description": "Built RESTful APIs"
    }
  ],
  "career_interests": ["Full Stack Development", "Backend Development"]
}

Response: 200 OK
{ "message": "Profile updated successfully" }
```

### Recommendation Routes

#### Get Career Recommendations
```
GET /api/recommendations
Authorization: Bearer {access_token}

Response: 200 OK
{
  "recommendations": [
    {
      "role": {
        "id": "role_1",
        "role_name": "Full Stack Developer",
        "category": "Software Development",
        "description": "Build scalable web applications",
        "required_skills": ["Python", "JavaScript", "React", "MongoDB"],
        "preferred_skills": ["TypeScript", "Docker", "AWS"],
        "min_cgpa": 7.0,
        "avg_salary": "₹12-20 LPA"
      },
      "compatibility_score": 85.5,
      "readiness": {
        "overall_readiness": 82.0,
        "skill_score": 85.5,
        "cgpa_score": 100,
        "project_score": 50,
        "internship_score": 50
      },
      "skill_gaps": {
        "missing_required": ["TypeScript"],
        "missing_preferred": ["AWS"]
      },
      "suggestions": [
        {
          "type": "skill",
          "priority": "high",
          "message": "Learn TypeScript - critical for modern web development",
          "skills": ["TypeScript"]
        },
        {
          "type": "experience",
          "priority": "high",
          "message": "Build more full-stack projects to strengthen portfolio"
        }
      ]
    }
  ]
}
```

#### Get Skill Analysis
```
GET /api/skill-analysis
Authorization: Bearer {access_token}

Response: 200 OK
{
  "analysis": {
    "total_skills": 15,
    "skill_distribution": {
      "Programming Languages": 3,
      "Frameworks": 2,
      "Databases": 2,
      "Platforms & Tools": 2,
      "Other Skills": 6
    },
    "category_fit": {
      "Web Development": 85.5,
      "Data Science": 42.0,
      "Mobile Development": 35.0
    },
    "top_category": "Web Development"
  }
}
```

### Company Routes

#### Register Company
```
POST /api/company/register
Content-Type: application/json

{
  "name": "TechCorp Inc",
  "email": "hr@techcorp.com",
  "password": "securepass123",
  "industry": "Software Development",
  "website": "https://techcorp.com",
  "description": "Leading AI and ML solutions provider"
}

Response: 201 Created
{
  "message": "Company registered successfully",
  "company": { "id": "...", "name": "...", "email": "..." },
  "access_token": "eyJ0eXAiOiJKV1QiLC..."
}
```

#### Post Job Opening
```
POST /api/company/jobs
Authorization: Bearer {company_access_token}
Content-Type: application/json

{
  "title": "Senior Full Stack Developer",
  "description": "Build scalable web applications...",
  "required_skills": ["Python", "JavaScript", "React", "MongoDB"],
  "salary_min": 12,
  "salary_max": 20,
  "location": "Bangalore",
  "job_type": "full-time"
}

Response: 201 Created
{
  "message": "Job posted successfully",
  "job": { "id": "...", "title": "...", "company_id": "..." }
}
```

### Admin Routes

#### Get All Users (Admin Only)
```
GET /api/admin/users
Authorization: Bearer {admin_access_token}
x-admin-key: {ADMIN_KEY}

Response: 200 OK
{
  "total": 150,
  "users": [
    { "id": "...", "email": "...", "name": "...", "role": "user", "created_at": "..." }
  ]
}
```

---

## 🔐 Authentication & JWT Flow

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "identity": "user_id",
  "type": "access",
  "iat": 1634567890,
  "exp": 1634654290
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET_KEY)
```

### Authentication Flow

1. **Registration/Login** → Credentials validated, JWT token generated
2. **Token Stored** → Frontend stores token in localStorage/sessionStorage
3. **Request Headers** → Token sent as `Authorization: Bearer {token}`
4. **Token Validation** → Backend verifies JWT signature and expiry
5. **Protected Routes** → Routes decorated with `@jwt_required()` validate token
6. **Token Refresh** → Client can request new token before expiry (optional)

### User Roles

- **user**: Student (default role)
- **company**: Company recruiter
- **admin**: System administrator (limited current implementation)

---

## 📊 Database Models

### User Model

```python
{
  "_id": ObjectId,
  "email": string (unique),
  "name": string,
  "password_hash": string (bcrypt),
  "role": "user" | "company" | "admin",
  "created_at": datetime
}
```

### Profile Model

```python
{
  "_id": ObjectId,
  "user_id": string (unique),
  "cgpa": float,
  "branch": string,
  "semester": integer,
  "university": string,
  "graduation_year": integer,
  "backlogs": integer,
  "skills": [string],
  "languages": [string],
  "frameworks": [string],
  "databases": [string],
  "platforms": [string],
  "projects": [{
    "title": string,
    "description": string,
    "tech": [string],
    "link": string
  }],
  "internships": [{
    "company": string,
    "role": string,
    "duration": string,
    "description": string
  }],
  "career_interests": [string],
  "certifications": [string],
  "saved_careers": [string],
  "placement_interest": boolean,
  "updated_at": datetime
}
```

### Company Model

```python
{
  "_id": ObjectId,
  "name": string,
  "email": string (unique),
  "password_hash": string (bcrypt),
  "industry": string,
  "website": string,
  "logo_url": string,
  "description": string,
  "role": "company",
  "created_at": datetime
}
```

### Job Model

```python
{
  "_id": ObjectId,
  "company_id": string,
  "title": string,
  "description": string,
  "required_skills": [string],
  "salary_min": integer,
  "salary_max": integer,
  "location": string,
  "job_type": string,
  "status": "active" | "closed",
  "created_at": datetime
}
```

### Application Model

```python
{
  "_id": ObjectId,
  "job_id": string,
  "student_id": string,
  "company_id": string,
  "status": "applied" | "shortlisted" | "rejected" | "offered",
  "applied_at": datetime,
  "updated_at": datetime
}
```

---

## 🧠 Recommendation Algorithm

### Overview

The recommendation engine uses a multi-factor scoring system to match students with suitable career paths based on:
1. Skill compatibility (40%)
2. CGPA requirements (20%)
3. Project experience (20%)
4. Internship experience (20%)

### Skill Matching Process

#### Step 1: Skill Collection
Combines student's:
- Technical skills
- Programming languages
- Frameworks
- Databases
- Platforms & tools

#### Step 2: Required vs Preferred Skills
- **Required Skills**: Must-haves (70% weight)
- **Preferred Skills**: Nice-to-haves (30% weight)

```
Skill Match Score = (Required Match % × 0.7) + (Preferred Match % × 0.3)
```

#### Step 3: Skill Gap Analysis
Identifies missing required and preferred skills for targeted learning.

### Readiness Scoring

```
Overall Readiness = (Skill Score × 0.40) + 
                    (CGPA Score × 0.20) +
                    (Project Score × 0.20) +
                    (Internship Score × 0.20)
```

**CGPA Scoring**:
- CGPA ≥ min_required: 100%
- CGPA ≥ (min - 1): 70%
- CGPA ≥ (min - 2): 40%
- CGPA < (min - 2): 0%

**Project Scoring**:
- Each project: +25% (capped at 100%)

**Internship Scoring**:
- Each internship: +50% (capped at 100%)

### Example Calculation

**Student Profile**:
- Skills: 10/12 required (83%), 1/3 preferred (33%)
- CGPA: 7.5 (target 7.0 → 100%)
- Projects: 2 (50%)
- Internships: 1 (50%)

**Calculation**:
```
Skill Score = (83 × 0.7) + (33 × 0.3) = 58.1 + 9.9 = 68.0
Readiness = (68 × 0.40) + (100 × 0.20) + (50 × 0.20) + (50 × 0.20)
         = 27.2 + 20 + 10 + 10 = 67.2%
```

### Suggestions Generation

Algorithm generates contextual suggestions based on:
- Missing required skills (HIGH priority)
- Missing preferred skills (MEDIUM priority)
- Low CGPA vs requirement (MEDIUM priority)
- Insufficient projects (HIGH priority)
- No internship experience (HIGH priority)

---

## 🤖 Gemini AI Integration

### Purpose

Gemini AI provides personalized, context-aware guidance to complement algorithmic recommendations.

### Integration Points

1. **Profile Analysis** → Generate career insights from student profile
2. **Skill Gap Recommendations** → AI suggests optimal learning paths
3. **Interview Preparation** → Generate role-specific interview tips
4. **Resume Review** → AI-powered resume suggestions
5. **Career Mentoring** → Interactive AI chatbot for career questions

### API Integration

```python
# In ai_mentor.py
def get_ai_guidance(profile, recommendations, query):
    """
    Generate AI guidance using Gemini API
    """
    prompt = f"""
    Student Profile:
    - Skills: {profile.skills}
    - CGPA: {profile.cgpa}
    - Projects: {len(profile.projects)}
    - Career Interests: {profile.career_interests}
    
    Top Recommendations: {[r['role']['role_name'] for r in recommendations[:3]]}
    
    Student Question: {query}
    
    Provide personalized, actionable career guidance.
    """
    
    response = genai.GenerativeModel('gemini-pro').generate_content(prompt)
    return response.text
```

### Rate Limiting

- Default: 60 requests per minute
- Admin: 1000 requests per hour
- Implements exponential backoff for retries

---

## 🚀 Environment Setup

### Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend)
- MongoDB Atlas account
- Google Gemini API key

### Backend Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/zalakdoshi/Skill2Career.git
   cd Skill2Career/backend
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   
   # Edit .env with your actual values:
   # - MONGODB_URI: MongoDB connection string
   # - JWT_SECRET_KEY: Generate secure random string
   # - GEMINI_API_KEY: Get from aistudio.google.com
   ```

5. **Run Backend**
   ```bash
   python app.py
   # Backend runs on http://localhost:5000
   ```

### Key Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `SECRET_KEY` | `your-secret-key-here` | Flask secret for sessions |
| `JWT_SECRET_KEY` | `jwt-secret-key` | JWT token signing |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | MongoDB connection |
| `MONGO_DB_NAME` | `skill2career` | Database name |
| `GEMINI_API_KEY` | `AIzaSyA...` | Google Gemini API key |
| `FLASK_ENV` | `development` | Environment (development/production) |

**Important**: Never commit `.env` to version control. Use `.env.example` as template.

---

## 🧪 Running Tests

### Prerequisites

```bash
pip install pytest pytest-cov unittest-mock
```

### Test Suite

The project includes comprehensive tests for the recommendation engine.

```bash
# Run all tests
python -m pytest test_recommendation_engine.py -v

# Run with coverage report
python -m pytest test_recommendation_engine.py --cov=recommendation_engine --cov-report=html

# Run specific test class
python -m pytest test_recommendation_engine.py::TestRecommendationEngine -v

# Run specific test
python -m pytest test_recommendation_engine.py::TestRecommendationEngine::test_calculate_skill_match_full_match -v
```

### Test Coverage

**Test Classes**:
1. `TestRecommendationEngine` (15+ test cases)
   - Skill matching (full, partial, case-insensitive, edge cases)
   - Skill gap identification
   - Readiness score calculation
   - Recommendation sorting
   - Suggestion generation

2. `TestRecommendationEngineWithGeminiAI` (2+ test cases)
   - AI integration compatibility
   - Guidance generation

### Test Categories

**Skill Matching Tests**:
- ✅ Full skill match (100%)
- ✅ Partial required skills
- ✅ Preferred skills inclusion
- ✅ Case-insensitive matching
- ✅ No skills scenario
- ✅ Empty required skills

**Readiness Scoring Tests**:
- ✅ Strong candidate profile
- ✅ Weak candidate profile
- ✅ CGPA threshold boundaries
- ✅ Project scoring
- ✅ Internship scoring

**Edge Cases**:
- ✅ Empty user profile
- ✅ Duplicate skills
- ✅ Special characters (C++, C#, etc.)
- ✅ Very long skill lists

### Expected Test Output

```
test_calculate_skill_match_full_match ... ok
test_calculate_skill_match_partial_match ... ok
test_calculate_skill_match_with_preferred_skills ... ok
test_calculate_skill_match_case_insensitive ... ok
test_identify_skill_gaps_with_gaps ... ok
test_calculate_readiness_score_strong_candidate ... ok
...
Ran 25 tests in 0.234s

OK
```

---

## 💾 Local Development

### Development Server

```bash
# Start with auto-reload
python app.py

# Or with Flask development server
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --reload
```

### Testing Endpoints with cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Get profile
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get recommendations
curl -X GET http://localhost:5000/api/recommendations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Database Connection

**MongoDB Atlas Setup**:
1. Create free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a cluster
3. Create database user
4. Get connection string (with credentials)
5. Set `MONGODB_URI` in `.env`

**In-Memory Fallback**:
- If MongoDB connection fails, app runs in-memory mode
- Data persists only during session
- Useful for testing without database

---

## 📝 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/recommendation-improvements
   ```

2. **Make changes**
   - Update relevant files
   - Run tests: `python -m pytest`
   - Check code quality

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: Improve skill matching algorithm"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/recommendation-improvements
   ```

---

## 🔗 Related Documentation

- [Frontend README](../frontend/README.md) - React frontend documentation
- [Careers Data Format](./careers_data.json) - Career role definitions
- [Courses Data Format](./courses_data.json) - Learning resources
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## 📧 Support & Contact

For questions or issues, please open a GitHub issue or contact the development team.

**Repository**: [github.com/zalakdoshi/Skill2Career](https://github.com/zalakdoshi/Skill2Career)

---

## 📄 License

This project is part of Zalak Doshi's portfolio. All rights reserved.

**Last Updated**: October 2024
