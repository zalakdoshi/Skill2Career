from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from functools import wraps
from config import Config
from models import User, Profile, Course, Company, Job, Application, MONGO_CONNECTED, applications_collection
from data_loader import data_loader
from recommendation_engine import recommendation_engine
from ai_mentor import ai_mentor
import json
import os

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for React frontend (allow all localhost ports for development)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]}}, supports_credentials=True)

# Initialize JWT
jwt = JWTManager(app)

# Courses are now stored in MongoDB (seeded from courses_data.json)
# COURSES_DATA is kept as fallback only
courses_file = os.path.join(os.path.dirname(__file__), 'courses_data.json')
with open(courses_file, 'r', encoding='utf-8') as f:
    COURSES_DATA = json.load(f)

# Load careers data
careers_file = os.path.join(os.path.dirname(__file__), 'careers_data.json')
with open(careers_file, 'r', encoding='utf-8') as f:
    CAREERS_DATA = json.load(f)

# ============ ADMIN DECORATOR ============

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if user is None or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# ============ AUTH ROUTES ============

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    user = User.create(email, password, name)
    
    if user is None:
        return jsonify({'error': 'Email already registered'}), 409
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.find_by_email(email)
    
    if user is None or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

# ============ PROFILE ROUTES ============

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        # Create empty profile if it doesn't exist (for legacy users)
        profile = Profile(user_id=user_id)
        profile.save()
    
    user = User.find_by_id(user_id)
    
    return jsonify({
        'profile': profile.to_dict(),
        'user': user.to_dict() if user else None
    }), 200

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        # Create empty profile if it doesn't exist (for legacy users)
        profile = Profile(user_id=user_id)
    
    # Update profile fields
    if 'cgpa' in data:
        profile.cgpa = float(data['cgpa'])
    if 'branch' in data:
        profile.branch = data['branch']
    if 'semester' in data:
        profile.semester = int(data['semester'])
    if 'university' in data:
        profile.university = data['university']
    if 'graduation_year' in data:
        profile.graduation_year = int(data['graduation_year']) if data['graduation_year'] else 0
    if 'backlogs' in data:
        profile.backlogs = int(data['backlogs']) if data['backlogs'] else 0
    if 'skills' in data:
        profile.skills = data['skills']
    if 'languages' in data:
        profile.languages = data['languages']
    if 'frameworks' in data:
        profile.frameworks = data['frameworks']
    if 'databases' in data:
        profile.databases = data['databases']
    if 'platforms' in data:
        profile.platforms = data['platforms']
    if 'projects' in data:
        profile.projects = data['projects']
    if 'internships' in data:
        profile.internships = data['internships']
    if 'career_interests' in data:
        profile.career_interests = data['career_interests']
    if 'certifications' in data:
        profile.certifications = data['certifications']
    if 'saved_careers' in data:
        profile.saved_careers = data['saved_careers']
    if 'placement_interest' in data:
        profile.placement_interest = data['placement_interest']
    
    profile.save()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200

# ============ RECOMMENDATION ROUTES ============

@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        return jsonify({'error': 'Profile not found'}), 404
    
    recommendations = recommendation_engine.get_recommendations(profile)
    
    # Add course recommendations for each career role
    user_skills = set()
    user_skills.update(profile.skills)
    user_skills.update(profile.languages)
    user_skills.update(profile.frameworks)
    user_skills.update(profile.databases)
    user_skills.update(profile.platforms)
    user_skills_lower = {s.lower() for s in user_skills}
    
    # PRE-LOAD all courses from MongoDB in ONE query (optimization)
    all_courses = Course.find_all() if MONGO_CONNECTED else []
    # Build skill -> courses lookup dict for fast in-memory matching
    courses_by_skill = {}
    for c in all_courses:
        skill_key = (c.get('skill') or '').lower()
        if skill_key not in courses_by_skill:
            courses_by_skill[skill_key] = []
        courses_by_skill[skill_key].append(c)
    
    def fast_find_courses(skill):
        """Fast in-memory course lookup instead of per-skill MongoDB query"""
        skill_lower = skill.lower()
        # Exact match
        if skill_lower in courses_by_skill:
            return courses_by_skill[skill_lower]
        # Partial match
        for cat, courses in courses_by_skill.items():
            if skill_lower in cat or cat in skill_lower:
                return courses
        # Word match
        skill_words = skill_lower.split()
        for cat, courses in courses_by_skill.items():
            cat_words = cat.split()
            if any(w in cat_words for w in skill_words) or any(w in skill_words for w in cat_words):
                return courses
        return []
    
    for rec in recommendations:
        role = rec.get('role', {})
        required_skills = role.get('required_skills', []) + role.get('preferred_skills', [])
        missing_skills = []
        for skill in required_skills:
            if skill.lower() not in user_skills_lower:
                missing_skills.append(skill)
        
        # Find courses for missing skills (fast in-memory lookup)
        suggested_courses = []
        for skill in missing_skills[:5]:  # Limit to top 5 missing skills
            courses = fast_find_courses(skill)
            if courses:
                suggested_courses.append({
                    'skill': skill,
                    'courses': courses[:3]  # Top 3 courses per skill
                })
        
        rec['suggested_courses'] = suggested_courses
        rec['missing_skills'] = missing_skills
    
    return jsonify({
        'recommendations': recommendations,
        'total_roles': len(recommendations)
    }), 200

@app.route('/api/recommendations/<int:role_id>', methods=['GET'])
@jwt_required()
def get_role_details(role_id):
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        return jsonify({'error': 'Profile not found'}), 404
    
    recommendations = recommendation_engine.get_recommendations(profile)
    
    for rec in recommendations:
        if rec['role']['id'] == role_id:
            return jsonify(rec), 200
    
    return jsonify({'error': 'Role not found'}), 404

@app.route('/api/skills/analysis', methods=['GET'])
@jwt_required()
def get_skill_analysis():
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        return jsonify({'error': 'Profile not found'}), 404
    
    analysis = recommendation_engine.get_skill_analysis(profile)
    
    return jsonify({'analysis': analysis}), 200

# ============ COURSE RECOMMENDATION HELPERS ============

def find_courses_for_skill(skill):
    """Find courses matching a skill — from MongoDB dynamically"""
    # Try MongoDB first
    courses = Course.find_by_skill(skill)
    if courses:
        return courses
    
    # Fallback to static JSON
    skill_lower = skill.lower()
    for category, cat_courses in COURSES_DATA.items():
        if skill_lower in category.lower() or category.lower() in skill_lower:
            return cat_courses
    for category, cat_courses in COURSES_DATA.items():
        category_words = category.lower().split()
        skill_words = skill_lower.split()
        if any(w in category_words for w in skill_words) or any(w in skill_words for w in category_words):
            return cat_courses
    return []

@app.route('/api/courses/recommend', methods=['GET'])
@jwt_required()
def get_course_recommendations():
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Get all user skills
    user_skills = set()
    user_skills.update(profile.skills)
    user_skills.update(profile.languages)
    user_skills.update(profile.frameworks)
    user_skills.update(profile.databases)
    user_skills.update(profile.platforms)
    user_skills_lower = {s.lower() for s in user_skills}
    
    # Get recommendations to find missing skills
    recommendations = recommendation_engine.get_recommendations(profile)
    
    all_missing_skills = set()
    for rec in recommendations[:5]:  # Top 5 career matches
        role = rec.get('role', {})
        for skill in role.get('key_skills', []):
            if skill.lower() not in user_skills_lower:
                all_missing_skills.add(skill)
    
    # Find courses for all missing skills
    course_recommendations = []
    for skill in list(all_missing_skills)[:10]:
        courses = find_courses_for_skill(skill)
        if courses:
            course_recommendations.append({
                'skill': skill,
                'courses': courses
            })
    
    return jsonify({
        'course_recommendations': course_recommendations,
        'total_missing_skills': len(all_missing_skills)
    }), 200

# ============ SAVED CAREERS ROUTES ============

@app.route('/api/careers/saved', methods=['GET'])
@jwt_required()
def get_saved_careers():
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        # Create empty profile if it doesn't exist (for legacy users)
        profile = Profile(user_id=user_id)
        profile.save()
    
    return jsonify({
        'saved_careers': profile.saved_careers,
        'count': len(profile.saved_careers)
    }), 200

@app.route('/api/careers/save', methods=['POST'])
@jwt_required()
def save_career():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'career_id' not in data:
        return jsonify({'error': 'Career ID is required'}), 400
    
    career_id = data['career_id']
    career_title = data.get('career_title', '')
    
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        # Create empty profile if it doesn't exist (for legacy users)
        profile = Profile(user_id=user_id)
        profile.save()
    
    # Create saved career entry
    saved_entry = {
        'career_id': career_id,
        'career_title': career_title,
        'saved_at': str(datetime.now())
    }
    
    # Check if already saved
    existing_ids = [c.get('career_id') for c in profile.saved_careers]
    if career_id in existing_ids:
        return jsonify({'message': 'Career already saved', 'saved_careers': profile.saved_careers}), 200
    
    profile.saved_careers.append(saved_entry)
    profile.save()
    
    return jsonify({
        'message': 'Career saved successfully',
        'saved_careers': profile.saved_careers
    }), 201

@app.route('/api/careers/unsave/<int:career_id>', methods=['DELETE'])
@jwt_required()
def unsave_career(career_id):
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        # Create empty profile if it doesn't exist (for legacy users)
        profile = Profile(user_id=user_id)
        profile.save()
    
    # Remove career from saved list
    profile.saved_careers = [c for c in profile.saved_careers if c.get('career_id') != career_id]
    profile.save()
    
    return jsonify({
        'message': 'Career removed from saved list',
        'saved_careers': profile.saved_careers
    }), 200

# ============ DATA ROUTES ============

@app.route('/api/data/skills', methods=['GET'])
def get_skills_list():
    return jsonify({
        'skills': data_loader.get_all_skills(),
        'languages': data_loader.languages,
        'frameworks': data_loader.frameworks,
        'databases': data_loader.databases,
        'platforms': data_loader.platforms
    }), 200

@app.route('/api/data/careers', methods=['GET'])
def get_career_roles():
    return jsonify({
        'careers': data_loader.get_career_roles()
    }), 200

@app.route('/api/data/market-insights', methods=['GET'])
def get_market_insights():
    insights = data_loader.get_job_market_insights()
    return jsonify(insights), 200

# ============ AI MENTOR ROUTES ============

@app.route('/api/mentor/chat', methods=['POST'])
@jwt_required()
def mentor_chat():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    message = data['message'].strip()
    
    if not message:
        return jsonify({'error': 'Empty message'}), 400
    
    # Get profile context for personalized responses
    profile = Profile.get_by_user_id(user_id)
    profile_context = profile.to_dict() if profile else None
    
    response = ai_mentor.get_response(message, profile_context)
    
    return jsonify(response), 200

# ============ DASHBOARD ROUTES ============

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    profile = Profile.get_by_user_id(user_id)
    
    if profile is None:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Get recommendations
    recommendations = recommendation_engine.get_recommendations(profile)
    top_recommendations = recommendations[:5]
    
    # Get skill analysis
    skill_analysis = recommendation_engine.get_skill_analysis(profile)
    
    # Calculate overall readiness
    if recommendations:
        avg_readiness = sum(r['readiness']['overall_readiness'] for r in top_recommendations) / len(top_recommendations)
    else:
        avg_readiness = 0
    
    return jsonify({
        'user': user.to_dict() if user else None,
        'profile': profile.to_dict(),
        'top_recommendations': top_recommendations,
        'skill_analysis': skill_analysis,
        'average_readiness': round(avg_readiness, 1),
        'profile_completion': calculate_profile_completion(profile)
    }), 200

def calculate_profile_completion(profile):
    """Calculate profile completion percentage"""
    total_fields = 10
    completed = 0
    
    if profile.cgpa > 0:
        completed += 1
    if profile.branch:
        completed += 1
    if profile.semester > 0:
        completed += 1
    if len(profile.skills) > 0:
        completed += 1
    if len(profile.languages) > 0:
        completed += 1
    if len(profile.frameworks) > 0:
        completed += 1
    if len(profile.databases) > 0 or len(profile.platforms) > 0:
        completed += 1
    if len(profile.projects) > 0:
        completed += 1
    if len(profile.internships) > 0:
        completed += 1
    if len(profile.career_interests) > 0:
        completed += 1
    
    return round((completed / total_fields) * 100)

# ============ ADMIN ROUTES ============

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    total_users = User.count()
    
    # Get all careers
    careers = data_loader.get_career_roles()
    
    # Get available skills count
    all_skills = data_loader.get_all_skills()
    
    return jsonify({
        'total_users': total_users,
        'total_careers': len(careers),
        'total_skills': len(all_skills),
        'total_courses': Course.count() or sum(len(courses) for courses in COURSES_DATA.values()),
        'total_companies': Company.count(),
        'total_jobs': Job.count(),
        'total_applications': Application.count()
    }), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    users = User.find_all()
    
    # Attach profile info
    enriched_users = []
    for u in users:
        profile = Profile.get_by_user_id(u['id'])
        user_info = {**u}
        if profile:
            p = profile.to_dict()
            user_info['branch'] = p.get('branch', '')
            all_skills = (p.get('skills', []) + p.get('languages', []) +
                          p.get('frameworks', []) + p.get('databases', []) +
                          p.get('platforms', []))
            user_info['skills_count'] = len(all_skills)
            user_info['skills'] = all_skills
            user_info['projects_count'] = len(p.get('projects', []))
            user_info['placement_interest'] = p.get('placement_interest', True)
        else:
            user_info['branch'] = ''
            user_info['skills_count'] = 0
            user_info['skills'] = []
            user_info['projects_count'] = 0
            user_info['placement_interest'] = True
        enriched_users.append(user_info)
    
    return jsonify({
        'users': enriched_users,
        'total': len(enriched_users)
    }), 200

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    # Prevent deleting yourself
    current_user_id = get_jwt_identity()
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    success = User.delete_by_id(user_id)
    if success:
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'error': 'Failed to delete user'}), 500

@app.route('/api/admin/careers', methods=['GET'])
@admin_required
def admin_get_careers():
    return jsonify({
        'careers': CAREERS_DATA,
        'total': len(CAREERS_DATA)
    }), 200

@app.route('/api/admin/careers', methods=['POST'])
@admin_required
def admin_add_career():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Career title is required'}), 400
    
    new_career = {
        'id': max([c.get('id', 0) for c in CAREERS_DATA] + [0]) + 1,
        'title': data['title'],
        'category': data.get('category', 'General'),
        'description': data.get('description', ''),
        'key_skills': data.get('key_skills', []),
        'min_cgpa': data.get('min_cgpa', 6.0),
        'growth_rate': data.get('growth_rate', 'Medium')
    }
    
    CAREERS_DATA.append(new_career)
    
    # Save to file
    with open(careers_file, 'w', encoding='utf-8') as f:
        json.dump(CAREERS_DATA, f, indent=2, ensure_ascii=False)
    
    return jsonify({
        'message': 'Career added successfully',
        'career': new_career
    }), 201

@app.route('/api/admin/careers/<int:career_id>', methods=['PUT'])
@admin_required
def admin_update_career(career_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    for i, career in enumerate(CAREERS_DATA):
        if career.get('id') == career_id:
            if 'title' in data:
                CAREERS_DATA[i]['title'] = data['title']
            if 'category' in data:
                CAREERS_DATA[i]['category'] = data['category']
            if 'description' in data:
                CAREERS_DATA[i]['description'] = data['description']
            if 'key_skills' in data:
                CAREERS_DATA[i]['key_skills'] = data['key_skills']
            if 'min_cgpa' in data:
                CAREERS_DATA[i]['min_cgpa'] = data['min_cgpa']
            if 'growth_rate' in data:
                CAREERS_DATA[i]['growth_rate'] = data['growth_rate']
            
            # Save to file
            with open(careers_file, 'w', encoding='utf-8') as f:
                json.dump(CAREERS_DATA, f, indent=2, ensure_ascii=False)
            
            return jsonify({
                'message': 'Career updated successfully',
                'career': CAREERS_DATA[i]
            }), 200
    
    return jsonify({'error': 'Career not found'}), 404

@app.route('/api/admin/careers/<int:career_id>', methods=['DELETE'])
@admin_required
def admin_delete_career(career_id):
    for i, career in enumerate(CAREERS_DATA):
        if career.get('id') == career_id:
            deleted = CAREERS_DATA.pop(i)
            
            # Save to file
            with open(careers_file, 'w', encoding='utf-8') as f:
                json.dump(CAREERS_DATA, f, indent=2, ensure_ascii=False)
            
            return jsonify({
                'message': 'Career deleted successfully',
                'career': deleted
            }), 200
    
    return jsonify({'error': 'Career not found'}), 404

# ============ ADMIN COURSE ROUTES ============

@app.route('/api/admin/courses', methods=['GET'])
@admin_required
def admin_get_courses():
    """Get all courses with optional filters"""
    skill = request.args.get('skill', '')
    platform = request.args.get('platform', '')
    course_type = request.args.get('type', '')
    
    courses = Course.find_all(
        skill_filter=skill if skill else None,
        platform_filter=platform if platform else None,
        type_filter=course_type if course_type else None
    )
    
    # If no MongoDB courses, fall back to JSON
    if not courses:
        for cat, cat_courses in COURSES_DATA.items():
            for c in cat_courses:
                c_copy = {**c, 'skill': cat}
                if skill and skill.lower() not in cat.lower():
                    continue
                if platform and platform.lower() not in c.get('platform', '').lower():
                    continue
                if course_type and c.get('type', '') != course_type:
                    continue
                courses.append(c_copy)
    
    skills = Course.get_all_skills() or list(COURSES_DATA.keys())
    
    return jsonify({
        'courses': courses,
        'total': len(courses),
        'skills': sorted(skills)
    }), 200

@app.route('/api/admin/courses', methods=['POST'])
@admin_required
def admin_add_course():
    """Add a new course"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required = ['skill', 'title', 'platform', 'url']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400
    
    course = Course.create(
        skill=data['skill'],
        title=data['title'],
        platform=data['platform'],
        url=data['url'],
        course_type=data.get('type', 'free')
    )
    
    if course:
        return jsonify({'message': 'Course added', 'course': course}), 201
    return jsonify({'error': 'Failed to add course'}), 500

@app.route('/api/admin/courses/<course_id>', methods=['DELETE'])
@admin_required
def admin_delete_course(course_id):
    """Delete a course"""
    success = Course.delete(course_id)
    if success:
        return jsonify({'message': 'Course deleted'}), 200
    return jsonify({'error': 'Failed to delete course'}), 500

# ============ COMPANY AUTH DECORATOR ============

def company_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        company = Company.find_by_id(identity)
        if company is None:
            return jsonify({'error': 'Company access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# ============ COMPANY AUTH ROUTES ============

@app.route('/api/company/register', methods=['POST'])
def company_register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    industry = data.get('industry', '').strip()
    website = data.get('website', '').strip()
    description = data.get('description', '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Company name, email, and password are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    company = Company.create(name, email, password, industry=industry, website=website, description=description)
    if company is None:
        return jsonify({'error': 'Email already registered'}), 409

    access_token = create_access_token(identity=company.id)
    return jsonify({
        'message': 'Company registered successfully',
        'user': company.to_dict(),
        'access_token': access_token
    }), 201

@app.route('/api/company/login', methods=['POST'])
def company_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    company = Company.find_by_email(email)
    if company is None or not company.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=company.id)
    return jsonify({
        'message': 'Login successful',
        'user': company.to_dict(),
        'access_token': access_token
    }), 200

@app.route('/api/company/me', methods=['GET'])
@company_required
def company_me():
    company_id = get_jwt_identity()
    company = Company.find_by_id(company_id)
    if company is None:
        return jsonify({'error': 'Company not found'}), 404
    return jsonify({'user': company.to_dict()}), 200

# ============ COMPANY DASHBOARD ============

@app.route('/api/company/stats', methods=['GET'])
@company_required
def company_stats():
    company_id = get_jwt_identity()
    jobs = Job.find_by_company(company_id)
    total_jobs = len(jobs)
    active_jobs = len([j for j in jobs if j['status'] == 'active'])
    total_applications = Application.count_by_company(company_id)
    shortlisted = Application.count_by_status(company_id, 'shortlisted')
    hired = Application.count_by_status(company_id, 'hired')

    return jsonify({
        'total_jobs': total_jobs,
        'active_jobs': active_jobs,
        'total_applications': total_applications,
        'shortlisted': shortlisted,
        'hired': hired
    }), 200

# ============ COMPANY JOB ROUTES ============

@app.route('/api/company/jobs', methods=['GET'])
@company_required
def company_get_jobs():
    company_id = get_jwt_identity()
    jobs = Job.find_by_company(company_id)
    # Attach application count for each job
    for job in jobs:
        apps = Application.find_by_job(job['id'])
        job['application_count'] = len(apps)
    return jsonify({'jobs': jobs, 'total': len(jobs)}), 200

@app.route('/api/company/jobs', methods=['POST'])
@company_required
def company_create_job():
    company_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Job title is required'}), 400

    job = Job.create(
        company_id=company_id,
        title=data['title'],
        description=data.get('description', ''),
        required_skills=data.get('required_skills', []),
        salary_min=data.get('salary_min', 0),
        salary_max=data.get('salary_max', 0),
        location=data.get('location', ''),
        job_type=data.get('job_type', 'full-time')
    )
    if job:
        return jsonify({'message': 'Job posted successfully', 'job': job.to_dict()}), 201
    return jsonify({'error': 'Failed to create job'}), 500

@app.route('/api/company/jobs/<job_id>', methods=['PUT'])
@company_required
def company_update_job(job_id):
    company_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    # Verify job belongs to this company
    job = Job.find_by_id(job_id)
    if not job or job.company_id != company_id:
        return jsonify({'error': 'Job not found'}), 404

    updates = {}
    for field in ['title', 'description', 'required_skills', 'salary_min', 'salary_max', 'location', 'job_type', 'status']:
        if field in data:
            updates[field] = data[field]

    Job.update(job_id, updates)
    return jsonify({'message': 'Job updated successfully'}), 200

@app.route('/api/company/jobs/<job_id>', methods=['DELETE'])
@company_required
def company_delete_job(job_id):
    company_id = get_jwt_identity()
    job = Job.find_by_id(job_id)
    if not job or job.company_id != company_id:
        return jsonify({'error': 'Job not found'}), 404
    Job.delete(job_id)
    return jsonify({'message': 'Job deleted successfully'}), 200

# ============ COMPANY CANDIDATE ROUTES ============

@app.route('/api/company/candidates', methods=['GET'])
@company_required
def company_search_candidates():
    skills_query = request.args.get('skills', '')
    company_id = get_jwt_identity()

    # If no skills query, auto-collect from all company jobs
    if not skills_query:
        company_jobs = Job.find_by_company(company_id)
        all_required = set()
        for j in company_jobs:
            for s in j.get('required_skills', []):
                all_required.add(s)
        if not all_required:
            return jsonify({'candidates': [], 'total': 0}), 200
        search_skills = [s.lower() for s in all_required]
    else:
        search_skills = [s.strip().lower() for s in skills_query.split(',') if s.strip()]

    all_users = User.find_all()
    candidates = []
    for u in all_users:
        if u.get('role') != 'user':
            continue
        profile = Profile.get_by_user_id(u['id'])
        if not profile:
            continue
        p = profile.to_dict()
        # Filter out users who opted out of placement
        if p.get('placement_interest') is False:
            continue
        all_student_skills = (p.get('skills', []) + p.get('languages', []) +
                              p.get('frameworks', []) + p.get('databases', []) +
                              p.get('platforms', []))
        student_skills_lower = [s.lower() for s in all_student_skills]
        matched = [s for s in search_skills if s in student_skills_lower]
        if matched:
            match_pct = round((len(matched) / len(search_skills)) * 100)
            candidates.append({
                'id': u['id'],
                'name': u['name'],
                'email': u['email'],
                'branch': p.get('branch', ''),
                'skills': all_student_skills,
                'match_percentage': match_pct,
                'projects_count': len(p.get('projects', [])),
                'cgpa': p.get('cgpa', 0),
                'placement_interest': p.get('placement_interest', True)
            })
    candidates.sort(key=lambda x: x['match_percentage'], reverse=True)
    return jsonify({'candidates': candidates, 'total': len(candidates)}), 200

@app.route('/api/company/all-candidates', methods=['GET'])
@company_required
def company_all_candidates():
    """Return ALL users with profiles — no skill filter"""
    company_id = get_jwt_identity()
    company_jobs = Job.find_by_company(company_id)
    # Collect all required skills from company jobs
    all_required = set()
    for j in company_jobs:
        for s in j.get('required_skills', []):
            all_required.add(s.lower())

    all_users = User.find_all()
    candidates = []
    for u in all_users:
        if u.get('role') != 'user':
            continue
        profile = Profile.get_by_user_id(u['id'])
        if not profile:
            continue
        p = profile.to_dict()
        all_student_skills = (p.get('skills', []) + p.get('languages', []) +
                              p.get('frameworks', []) + p.get('databases', []) +
                              p.get('platforms', []))
        student_skills_lower = [s.lower() for s in all_student_skills]
        # Calculate match % based on all company job skills
        if all_required:
            matched = [s for s in all_required if s in student_skills_lower]
            match_pct = round((len(matched) / len(all_required)) * 100)
        else:
            match_pct = 0
        candidates.append({
            'id': u['id'],
            'name': u['name'],
            'email': u['email'],
            'branch': p.get('branch', ''),
            'skills': all_student_skills,
            'match_percentage': match_pct,
            'projects_count': len(p.get('projects', [])),
            'cgpa': p.get('cgpa', 0),
            'placement_interest': p.get('placement_interest', True)
        })
    candidates.sort(key=lambda x: x['match_percentage'], reverse=True)
    return jsonify({'candidates': candidates, 'total': len(candidates)}), 200

@app.route('/api/company/invite', methods=['POST'])
@company_required
def company_invite_candidate():
    """Company sends an invite/request to a candidate for a job"""
    data = request.get_json()
    if not data or 'student_id' not in data or 'job_id' not in data:
        return jsonify({'error': 'student_id and job_id are required'}), 400

    company_id = get_jwt_identity()
    student_id = data['student_id']
    job_id = data['job_id']

    # Get job info
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    # Check if already invited
    if MONGO_CONNECTED:
        existing = applications_collection.find_one({
            'job_id': job_id, 'student_id': student_id, 'type': 'invite'
        })
        if existing:
            return jsonify({'error': 'Already invited this candidate'}), 400

        # Create an invite entry
        invite = {
            'id': str(uuid.uuid4()),
            'job_id': job_id,
            'job_title': job.get('title', ''),
            'company_id': company_id,
            'company_name': job.get('company_name', ''),
            'student_id': student_id,
            'type': 'invite',
            'status': 'invited',
            'created_at': datetime.utcnow().isoformat()
        }
        applications_collection.insert_one(invite)
        return jsonify({'message': 'Invite sent successfully', 'invite': invite}), 201
    return jsonify({'error': 'Database not connected'}), 500

@app.route('/api/company/applications', methods=['GET'])
@company_required
def company_get_applications():
    company_id = get_jwt_identity()
    apps = Application.find_by_company(company_id)
    return jsonify({'applications': apps, 'total': len(apps)}), 200

@app.route('/api/company/applications/<app_id>', methods=['PUT'])
@company_required
def company_update_application(app_id):
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    success = Application.update_status(app_id, data['status'])
    if success:
        return jsonify({'message': f"Application status updated to {data['status']}"}), 200
    return jsonify({'error': 'Failed to update application'}), 400

# ============ STUDENT JOB ROUTES ============

@app.route('/api/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    """Get all active jobs with skill match % for the current student"""
    user_id = get_jwt_identity()
    profile = Profile.get_by_user_id(user_id)

    user_skills = set()
    if profile:
        user_skills.update(profile.skills)
        user_skills.update(profile.languages)
        user_skills.update(profile.frameworks)
        user_skills.update(profile.databases)
        user_skills.update(profile.platforms)
    user_skills_lower = {s.lower() for s in user_skills}

    jobs = Job.find_all_active()

    # Calculate skill match % and matched/missing skills for each job
    for job in jobs:
        required = job.get('required_skills', [])
        if required:
            matched_skills = [s for s in required if s.lower() in user_skills_lower]
            missing_skills = [s for s in required if s.lower() not in user_skills_lower]
            job['skill_match'] = round((len(matched_skills) / len(required)) * 100)
            job['matched_skills'] = matched_skills
            job['missing_skills'] = missing_skills
        else:
            job['skill_match'] = 0
            job['matched_skills'] = []
            job['missing_skills'] = []
        # Check if student already applied
        if MONGO_CONNECTED:
            from models import applications_collection
            existing = applications_collection.find_one({
                'job_id': job['id'], 'student_id': user_id
            })
            job['already_applied'] = existing is not None
        else:
            job['already_applied'] = False

    # Sort by skill match descending
    jobs.sort(key=lambda x: x['skill_match'], reverse=True)
    return jsonify({'jobs': jobs, 'total': len(jobs)}), 200

@app.route('/api/jobs/<job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    user_id = get_jwt_identity()
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job.status != 'active':
        return jsonify({'error': 'Job is no longer active'}), 400

    application = Application.create(job_id, user_id, job.company_id)
    if application is None:
        return jsonify({'error': 'You have already applied to this job'}), 409
    return jsonify({'message': 'Application submitted successfully', 'application': application.to_dict()}), 201

@app.route('/api/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    user_id = get_jwt_identity()
    apps = Application.find_by_student(user_id)
    return jsonify({'applications': apps, 'total': len(apps)}), 200

# ============ ADMIN COMPANY ROUTES ============

@app.route('/api/admin/companies', methods=['GET'])
@admin_required
def admin_get_companies():
    companies = Company.find_all()
    # Attach job count for each company
    for c in companies:
        jobs = Job.find_by_company(c['id'])
        c['jobs_count'] = len(jobs)
        c['applications_count'] = Application.count_by_company(c['id'])
    return jsonify({'companies': companies, 'total': len(companies)}), 200

@app.route('/api/admin/companies/<company_id>', methods=['DELETE'])
@admin_required
def admin_delete_company(company_id):
    success = Company.delete_by_id(company_id)
    if success:
        return jsonify({'message': 'Company deleted successfully'}), 200
    return jsonify({'error': 'Failed to delete company'}), 500

# ============ MAIN ============

if __name__ == '__main__':
    import logging
    import sys
    
    # Suppress Flask/Werkzeug default logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    
    # Suppress Flask startup messages
    cli = sys.modules.get('flask.cli')
    if cli:
        cli.show_server_banner = lambda *args: None
    
    print("\n" + "="*50)
    print("   Skill2Career Backend Server")
    print("="*50)
    print("   Server running at: http://localhost:5000")
    if MONGO_CONNECTED:
        print("   Database: MongoDB Atlas (connected)")
    else:
        print("   Database: In-memory only (NOT SAVED!)")
    print("   Admin: admin@skill2career.com / admin123")
    print("="*50 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=False)

