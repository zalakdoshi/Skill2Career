<div align="center">

# 🎯 Skill2Career

### An AI-Powered Career Guidance & Placement Platform for Engineering Students

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-orange?logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

*B.Tech Mini Project — Computer Engineering | Semester 6 | 2025–26*

</div>

---

## 📖 About Skill2Career

**Skill2Career** bridges the gap between engineering students and their dream careers. It analyzes your complete technical profile — skills, CGPA, projects, internships — and uses a weighted recommendation engine to map you to the most compatible career roles, while telling you exactly what you need to learn next.

---

## ✨ Features

| Module | Features |
|---|---|
| 🎓 **Student** | Profile builder, Career recommendations, Skill gap analysis, Course suggestions, AI Mentor chat, Job listings, Application tracking |
| 🏢 **Company** | Job posting, Candidate discovery by skill match, Application management (shortlist/reject) |
| 🛡️ **Admin** | User management, Career CRUD, Course catalog, Company management, Analytics |
| 🤖 **AI Mentor** | Powered by Google Gemini 2.0 Flash — personalized career Q&A with your profile as context |

---

## 🏗️ Tech Stack

```
Frontend  →  React.js · React Router DOM · Context API · Axios · Vanilla CSS
Backend   →  Python · Flask · Flask-JWT-Extended · bcrypt · Flask-CORS
Database  →  MongoDB Atlas (PyMongo)
AI        →  Google Gemini 2.0 Flash
Data      →  Stack Overflow Developer Survey CSVs · LinkedIn Job Skills CSV · Pandas
```

---

## 🧮 Recommendation Algorithm

The engine computes a **Readiness Score** for every career role:

```
Readiness = Skill Match (40%) + CGPA Score (20%) + Projects (20%) + Internships (20%)

Skill Match = Required Skills Match (70%) + Preferred Skills Match (30%)
```

---

## 📁 Project Structure

```
Skill2Career/
├── backend/
│   ├── app.py                  # Flask REST API (all routes)
│   ├── models.py               # MongoDB models: User, Profile, Company, Job, Application, Course
│   ├── recommendation_engine.py # Multi-factor career recommendation algorithm
│   ├── ai_mentor.py            # Google Gemini 2.0 Flash integration
│   ├── data_loader.py          # CSV dataset loader (Singleton)
│   ├── config.py               # App configuration (reads from .env)
│   ├── careers_data.json       # Career roles database
│   ├── courses_data.json       # Course catalog (seeded to MongoDB)
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variable template
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.js              # Routes + auth guards
│       ├── context/
│       │   └── AuthContext.js  # Global auth state
│       ├── pages/              # All page components
│       │   ├── LandingPage.js
│       │   ├── Dashboard.js
│       │   ├── Profile.js
│       │   ├── Recommendations.js
│       │   ├── SkillAnalysis.js
│       │   ├── Mentor.js
│       │   ├── Jobs.js
│       │   ├── MyApplications.js
│       │   ├── Admin*.js       # Admin pages
│       │   └── Company*.js     # Company pages
│       ├── components/         # Reusable components
│       └── services/
│           └── api.js          # Axios API client
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([Get here](https://aistudio.google.com/app/apikey))

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Skill2Career.git
cd Skill2Career
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux

# Edit .env and fill in your MongoDB URI and Gemini API key
```

**Edit `backend/.env`:**
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/
MONGO_DB_NAME=skill2career
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=any-random-string
JWT_SECRET_KEY=another-random-string
```

```bash
# Run the backend
python app.py
# ✅ Backend runs on http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
# ✅ Frontend runs on http://localhost:3000
```

---

### 4️⃣ Dataset Files (Optional)

The large CSV files are **not included** in the repository due to GitHub's file size limits. The app works without them (fallback skill lists are built in). To enable full functionality:

1. Download from [Stack Overflow Developer Survey](https://survey.stackoverflow.co/2023)
2. Place `LanguageWorkedWith.csv`, `FrameworkWorkedWith.csv`, `DatabaseWorkedWith.csv`, `PlatformWorkedWith.csv`, and `job_skills.csv` in the project root.

---

## 🔑 Default Admin Account

To create an admin account, register normally and then update the `role` field in MongoDB Atlas:

```
Database: skill2career → Collection: users → Find your user → Set role: "admin"
```

---

## 📡 API Overview

| Category | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Profile | `GET /api/profile`, `PUT /api/profile` |
| Recommendations | `GET /api/recommendations`, `GET /api/skills/analysis` |
| Courses | `GET /api/courses/recommend` |
| AI Mentor | `POST /api/mentor/chat` |
| Jobs | `GET /api/jobs`, `POST /api/jobs/<id>/apply` |
| Applications | `GET /api/applications/my` |
| Company | `/api/company/*` (register, login, jobs, candidates, applications) |
| Admin | `/api/admin/*` (stats, users, careers, courses, companies) |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 👩‍💻 Team

| Name | Role | GitHub |
|---|---|---|
| **Zalak Doshi** | Full Stack Developer — Backend, AI Integration, Database Design | [@zalakdoshi](https://github.com/zalakdoshi) |
| **Twisha Patel** | Full Stack Developer — Frontend, UI/UX, Recommendation Engine | — |

> B.Tech — Computer Engineering | Semester 6 | Academic Year 2025–26

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Made with ❤️ by <b>Zalak Doshi</b> & <b>Twisha Patel</b> | Computer Engineering | 2025–26
</div>
