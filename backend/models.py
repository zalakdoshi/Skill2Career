from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import bcrypt
import json
import os
from datetime import datetime
from bson import ObjectId
from config import Config

# MongoDB connection with error handling
try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.admin.command('ping')
    db = client[Config.MONGO_DB_NAME]
    MONGO_CONNECTED = True
    print("[OK] MongoDB Atlas connected - Users will be saved to database")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"[WARNING] MongoDB connection failed: {e}")
    print("[WARNING] Users will be stored in memory only (will be lost on restart)")
    MONGO_CONNECTED = False
    db = None

# In-memory storage fallback
_memory_users = {}
_memory_profiles = {}
_user_id_counter = 1

# Collections (if connected)
if MONGO_CONNECTED:
    users_collection = db['users']
    profiles_collection = db['profiles']
    courses_collection = db['courses']
    companies_collection = db['companies']
    jobs_collection = db['jobs']
    applications_collection = db['applications']
    # Create indexes
    users_collection.create_index('email', unique=True)
    profiles_collection.create_index('user_id', unique=True)
    courses_collection.create_index('skill', unique=False)
    companies_collection.create_index('email', unique=True)
    jobs_collection.create_index('company_id', unique=False)
    jobs_collection.create_index('status', unique=False)
    applications_collection.create_index('job_id', unique=False)
    applications_collection.create_index('student_id', unique=False)
    applications_collection.create_index('company_id', unique=False)
else:
    users_collection = None
    profiles_collection = None
    courses_collection = None
    companies_collection = None
    jobs_collection = None
    applications_collection = None

class User:
    def __init__(self, id=None, email=None, name=None, password_hash=None, role='user'):
        self.id = id
        self.email = email
        self.name = name
        self.password_hash = password_hash
        self.role = role
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role
        }
    
    @staticmethod
    def create(email, password, name, role='user'):
        global _user_id_counter
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        if MONGO_CONNECTED:
            try:
                user_data = {
                    'email': email,
                    'password_hash': password_hash,
                    'name': name,
                    'role': role,
                    'created_at': datetime.now()
                }
                result = users_collection.insert_one(user_data)
                user_id = str(result.inserted_id)
                
                # Create empty profile
                profile_data = {
                    'user_id': user_id,
                    'cgpa': 0.0,
                    'branch': '',
                    'semester': 1,
                    'university': '',
                    'graduation_year': 0,
                    'backlogs': 0,
                    'skills': [],
                    'languages': [],
                    'frameworks': [],
                    'databases': [],
                    'platforms': [],
                    'projects': [],
                    'internships': [],
                    'career_interests': [],
                    'certifications': [],
                    'saved_careers': [],
                    'updated_at': datetime.now()
                }
                profiles_collection.insert_one(profile_data)
                
                return User(id=user_id, email=email, name=name, password_hash=password_hash, role=role)
            except Exception as e:
                print(f"Error creating user: {e}")
                return None
        else:
            # In-memory fallback
            if email in [u['email'] for u in _memory_users.values()]:
                return None
            
            user_id = str(_user_id_counter)
            _user_id_counter += 1
            
            _memory_users[user_id] = {
                'id': user_id,
                'email': email,
                'password_hash': password_hash,
                'name': name,
                'role': role
            }
            
            _memory_profiles[user_id] = {
                'user_id': user_id,
                'cgpa': 0.0,
                'branch': '',
                'semester': 1,
                'university': '',
                'graduation_year': 0,
                'backlogs': 0,
                'skills': [],
                'languages': [],
                'frameworks': [],
                'databases': [],
                'platforms': [],
                'projects': [],
                'internships': [],
                'career_interests': [],
                'certifications': [],
                'saved_careers': []
            }
            
            return User(id=user_id, email=email, name=name, password_hash=password_hash, role=role)
    
    @staticmethod
    def find_by_email(email):
        if MONGO_CONNECTED:
            user_data = users_collection.find_one({'email': email})
            
            if user_data:
                return User(
                    id=str(user_data['_id']),
                    email=user_data['email'],
                    name=user_data['name'],
                    password_hash=user_data['password_hash'],
                    role=user_data.get('role', 'user')
                )
        else:
            for user_data in _memory_users.values():
                if user_data['email'] == email:
                    return User(
                        id=user_data['id'],
                        email=user_data['email'],
                        name=user_data['name'],
                        password_hash=user_data['password_hash'],
                        role=user_data.get('role', 'user')
                    )
        return None
    
    @staticmethod
    def find_by_id(user_id):
        if MONGO_CONNECTED:
            try:
                user_data = users_collection.find_one({'_id': ObjectId(user_id)})
                
                if user_data:
                    return User(
                        id=str(user_data['_id']),
                        email=user_data['email'],
                        name=user_data['name'],
                        password_hash=user_data['password_hash'],
                        role=user_data.get('role', 'user')
                    )
            except Exception as e:
                print(f"Error finding user: {e}")
        else:
            if user_id in _memory_users:
                user_data = _memory_users[user_id]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    password_hash=user_data['password_hash'],
                    role=user_data.get('role', 'user')
                )
        return None
    
    @staticmethod
    def find_all():
        """Get all users for admin panel"""
        users = []
        if MONGO_CONNECTED:
            for user_data in users_collection.find():
                users.append({
                    'id': str(user_data['_id']),
                    'email': user_data['email'],
                    'name': user_data['name'],
                    'role': user_data.get('role', 'user'),
                    'created_at': str(user_data.get('created_at', ''))
                })
        else:
            for user_data in _memory_users.values():
                users.append({
                    'id': user_data['id'],
                    'email': user_data['email'],
                    'name': user_data['name'],
                    'role': user_data.get('role', 'user'),
                    'created_at': ''
                })
        return users
    
    @staticmethod
    def delete_by_id(user_id):
        """Delete user and their profile"""
        if MONGO_CONNECTED:
            try:
                users_collection.delete_one({'_id': ObjectId(user_id)})
                profiles_collection.delete_one({'user_id': user_id})
                return True
            except Exception as e:
                print(f"Error deleting user: {e}")
                return False
        else:
            if user_id in _memory_users:
                del _memory_users[user_id]
                if user_id in _memory_profiles:
                    del _memory_profiles[user_id]
                return True
        return False
    
    @staticmethod
    def count():
        """Get total user count"""
        if MONGO_CONNECTED:
            return users_collection.count_documents({})
        return len(_memory_users)
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role
        }

class Profile:
    def __init__(self, user_id, cgpa=0.0, branch='', semester=1, 
                 university='', graduation_year=0, backlogs=0,
                 skills=None, languages=None, frameworks=None, databases=None, platforms=None,
                 projects=None, internships=None, career_interests=None, certifications=None,
                 saved_careers=None, placement_interest=True):
        self.user_id = user_id
        self.cgpa = cgpa
        self.branch = branch
        self.semester = semester
        self.university = university
        self.graduation_year = graduation_year
        self.backlogs = backlogs
        self.skills = skills or []
        self.languages = languages or []
        self.frameworks = frameworks or []
        self.databases = databases or []
        self.platforms = platforms or []
        self.projects = projects or []
        self.internships = internships or []
        self.career_interests = career_interests or []
        self.certifications = certifications or []
        self.saved_careers = saved_careers or []
        self.placement_interest = placement_interest
    
    @staticmethod
    def get_by_user_id(user_id):
        if MONGO_CONNECTED:
            profile_data = profiles_collection.find_one({'user_id': user_id})
            
            if profile_data:
                return Profile(
                    user_id=profile_data['user_id'],
                    cgpa=profile_data.get('cgpa', 0.0),
                    branch=profile_data.get('branch', ''),
                    semester=profile_data.get('semester', 1),
                    university=profile_data.get('university', ''),
                    graduation_year=profile_data.get('graduation_year', 0),
                    backlogs=profile_data.get('backlogs', 0),
                    skills=profile_data.get('skills', []),
                    languages=profile_data.get('languages', []),
                    frameworks=profile_data.get('frameworks', []),
                    databases=profile_data.get('databases', []),
                    platforms=profile_data.get('platforms', []),
                    projects=profile_data.get('projects', []),
                    internships=profile_data.get('internships', []),
                    career_interests=profile_data.get('career_interests', []),
                    certifications=profile_data.get('certifications', []),
                    saved_careers=profile_data.get('saved_careers', []),
                    placement_interest=profile_data.get('placement_interest', True)
                )
        else:
            if user_id in _memory_profiles:
                profile_data = _memory_profiles[user_id]
                return Profile(
                    user_id=profile_data['user_id'],
                    cgpa=profile_data.get('cgpa', 0.0),
                    branch=profile_data.get('branch', ''),
                    semester=profile_data.get('semester', 1),
                    university=profile_data.get('university', ''),
                    graduation_year=profile_data.get('graduation_year', 0),
                    backlogs=profile_data.get('backlogs', 0),
                    skills=profile_data.get('skills', []),
                    languages=profile_data.get('languages', []),
                    frameworks=profile_data.get('frameworks', []),
                    databases=profile_data.get('databases', []),
                    platforms=profile_data.get('platforms', []),
                    projects=profile_data.get('projects', []),
                    internships=profile_data.get('internships', []),
                    career_interests=profile_data.get('career_interests', []),
                    certifications=profile_data.get('certifications', []),
                    saved_careers=profile_data.get('saved_careers', []),
                    placement_interest=profile_data.get('placement_interest', True)
                )
        return None
    
    def save(self):
        data = {
            'cgpa': self.cgpa,
            'branch': self.branch,
            'semester': self.semester,
            'university': self.university,
            'graduation_year': self.graduation_year,
            'backlogs': self.backlogs,
            'skills': self.skills,
            'languages': self.languages,
            'frameworks': self.frameworks,
            'databases': self.databases,
            'platforms': self.platforms,
            'projects': self.projects,
            'internships': self.internships,
            'career_interests': self.career_interests,
            'certifications': self.certifications,
            'saved_careers': self.saved_careers,
            'placement_interest': self.placement_interest
        }
        
        if MONGO_CONNECTED:
            data['updated_at'] = datetime.now()
            # Use upsert=True to create the profile if it doesn't exist
            profiles_collection.update_one(
                {'user_id': self.user_id},
                {'$set': data},
                upsert=True
            )
        else:
            if self.user_id not in _memory_profiles:
                _memory_profiles[self.user_id] = {'user_id': self.user_id}
            _memory_profiles[self.user_id].update(data)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'cgpa': self.cgpa,
            'branch': self.branch,
            'semester': self.semester,
            'university': self.university,
            'graduation_year': self.graduation_year,
            'backlogs': self.backlogs,
            'skills': self.skills,
            'languages': self.languages,
            'frameworks': self.frameworks,
            'databases': self.databases,
            'platforms': self.platforms,
            'projects': self.projects,
            'internships': self.internships,
            'career_interests': self.career_interests,
            'certifications': self.certifications,
            'saved_careers': self.saved_careers,
            'placement_interest': self.placement_interest
        }


# ============ COURSE MODEL ============
class Course:
    """Course model stored in MongoDB"""
    
    @staticmethod
    def find_by_skill(skill):
        """Find courses matching a skill (case-insensitive partial match)"""
        if not MONGO_CONNECTED:
            return []
        skill_lower = skill.lower()
        # Try exact category match first
        results = list(courses_collection.find(
            {'skill': {'$regex': f'^{skill_lower}$', '$options': 'i'}},
            {'_id': 0, 'title': 1, 'platform': 1, 'url': 1, 'type': 1, 'skill': 1}
        ))
        if results:
            return results
        # Partial match
        results = list(courses_collection.find(
            {'skill': {'$regex': skill_lower, '$options': 'i'}},
            {'_id': 0, 'title': 1, 'platform': 1, 'url': 1, 'type': 1, 'skill': 1}
        ))
        if results:
            return results
        # Search in title too
        results = list(courses_collection.find(
            {'title': {'$regex': skill_lower, '$options': 'i'}},
            {'_id': 0, 'title': 1, 'platform': 1, 'url': 1, 'type': 1, 'skill': 1}
        ))
        return results
    
    @staticmethod
    def find_all(skill_filter=None, platform_filter=None, type_filter=None):
        """Get all courses with optional filters"""
        if not MONGO_CONNECTED:
            return []
        query = {}
        if skill_filter:
            query['skill'] = {'$regex': skill_filter, '$options': 'i'}
        if platform_filter:
            query['platform'] = {'$regex': platform_filter, '$options': 'i'}
        if type_filter:
            query['type'] = type_filter
        return list(courses_collection.find(query, {'_id': 0}))
    
    @staticmethod
    def create(skill, title, platform, url, course_type='free'):
        """Add a new course"""
        if not MONGO_CONNECTED:
            return None
        doc = {
            'skill': skill,
            'title': title,
            'platform': platform,
            'url': url,
            'type': course_type,
            'created_at': datetime.utcnow()
        }
        result = courses_collection.insert_one(doc)
        doc['_id'] = str(result.inserted_id)
        return doc
    
    @staticmethod
    def update(course_id, updates):
        """Update a course"""
        if not MONGO_CONNECTED:
            return False
        result = courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': updates}
        )
        return result.modified_count > 0
    
    @staticmethod
    def delete(course_id):
        """Delete a course"""
        if not MONGO_CONNECTED:
            return False
        result = courses_collection.delete_one({'_id': ObjectId(course_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def count():
        if not MONGO_CONNECTED:
            return 0
        return courses_collection.count_documents({})
    
    @staticmethod
    def get_all_skills():
        """Get distinct skill categories"""
        if not MONGO_CONNECTED:
            return []
        return courses_collection.distinct('skill')
    
    @staticmethod
    def seed_from_json():
        """Seed courses from courses_data.json if collection is empty"""
        if not MONGO_CONNECTED:
            return
        if courses_collection.count_documents({}) > 0:
            print(f"[OK] Courses already in DB: {courses_collection.count_documents({})} courses")
            return
        
        courses_file = os.path.join(os.path.dirname(__file__), 'courses_data.json')
        if not os.path.exists(courses_file):
            print("[WARNING] courses_data.json not found, skipping seed")
            return
        
        with open(courses_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        docs = []
        for skill, courses in data.items():
            for course in courses:
                docs.append({
                    'skill': skill,
                    'title': course['title'],
                    'platform': course['platform'],
                    'url': course['url'],
                    'type': course.get('type', 'free'),
                    'created_at': datetime.utcnow()
                })
        
        if docs:
            courses_collection.insert_many(docs)
            print(f"[OK] Seeded {len(docs)} courses into MongoDB")


# ============ COMPANY MODEL ============
class Company:
    def __init__(self, id=None, name=None, email=None, password_hash=None,
                 industry='', website='', logo_url='', description='', created_at=None):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.industry = industry
        self.website = website
        self.logo_url = logo_url
        self.description = description
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'industry': self.industry,
            'website': self.website,
            'logo_url': self.logo_url,
            'description': self.description,
            'created_at': str(self.created_at),
            'role': 'company'
        }

    @staticmethod
    def create(name, email, password, industry='', website='', logo_url='', description=''):
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if MONGO_CONNECTED:
            try:
                # Check if email already exists in users or companies
                if users_collection.find_one({'email': email}):
                    return None
                doc = {
                    'name': name,
                    'email': email,
                    'password_hash': password_hash,
                    'industry': industry,
                    'website': website,
                    'logo_url': logo_url,
                    'description': description,
                    'role': 'company',
                    'created_at': datetime.now()
                }
                result = companies_collection.insert_one(doc)
                return Company(id=str(result.inserted_id), name=name, email=email,
                               password_hash=password_hash, industry=industry,
                               website=website, logo_url=logo_url, description=description)
            except Exception as e:
                print(f"Error creating company: {e}")
                return None
        return None

    @staticmethod
    def find_by_email(email):
        if MONGO_CONNECTED:
            doc = companies_collection.find_one({'email': email})
            if doc:
                return Company(
                    id=str(doc['_id']), name=doc['name'], email=doc['email'],
                    password_hash=doc['password_hash'], industry=doc.get('industry', ''),
                    website=doc.get('website', ''), logo_url=doc.get('logo_url', ''),
                    description=doc.get('description', ''), created_at=doc.get('created_at')
                )
        return None

    @staticmethod
    def find_by_id(company_id):
        if MONGO_CONNECTED:
            try:
                doc = companies_collection.find_one({'_id': ObjectId(company_id)})
                if doc:
                    return Company(
                        id=str(doc['_id']), name=doc['name'], email=doc['email'],
                        password_hash=doc['password_hash'], industry=doc.get('industry', ''),
                        website=doc.get('website', ''), logo_url=doc.get('logo_url', ''),
                        description=doc.get('description', ''), created_at=doc.get('created_at')
                    )
            except Exception as e:
                print(f"Error finding company: {e}")
        return None

    @staticmethod
    def find_all():
        companies = []
        if MONGO_CONNECTED:
            for doc in companies_collection.find():
                companies.append({
                    'id': str(doc['_id']),
                    'name': doc['name'],
                    'email': doc['email'],
                    'industry': doc.get('industry', ''),
                    'website': doc.get('website', ''),
                    'logo_url': doc.get('logo_url', ''),
                    'description': doc.get('description', ''),
                    'created_at': str(doc.get('created_at', ''))
                })
        return companies

    @staticmethod
    def delete_by_id(company_id):
        if MONGO_CONNECTED:
            try:
                companies_collection.delete_one({'_id': ObjectId(company_id)})
                # Also delete all jobs and applications for this company
                jobs_collection.delete_many({'company_id': company_id})
                applications_collection.delete_many({'company_id': company_id})
                return True
            except Exception as e:
                print(f"Error deleting company: {e}")
        return False

    @staticmethod
    def count():
        if MONGO_CONNECTED:
            return companies_collection.count_documents({})
        return 0

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def update(self, updates):
        if MONGO_CONNECTED:
            companies_collection.update_one(
                {'_id': ObjectId(self.id)},
                {'$set': updates}
            )
            return True
        return False


# ============ JOB MODEL ============
class Job:
    def __init__(self, id=None, company_id=None, title='', description='',
                 required_skills=None, salary_min=0, salary_max=0,
                 location='', job_type='full-time', status='active', created_at=None):
        self.id = id
        self.company_id = company_id
        self.title = title
        self.description = description
        self.required_skills = required_skills or []
        self.salary_min = salary_min
        self.salary_max = salary_max
        self.location = location
        self.job_type = job_type
        self.status = status
        self.created_at = created_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'title': self.title,
            'description': self.description,
            'required_skills': self.required_skills,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'location': self.location,
            'job_type': self.job_type,
            'status': self.status,
            'created_at': str(self.created_at)
        }

    @staticmethod
    def create(company_id, title, description='', required_skills=None,
               salary_min=0, salary_max=0, location='', job_type='full-time'):
        if MONGO_CONNECTED:
            try:
                doc = {
                    'company_id': company_id,
                    'title': title,
                    'description': description,
                    'required_skills': required_skills or [],
                    'salary_min': salary_min,
                    'salary_max': salary_max,
                    'location': location,
                    'job_type': job_type,
                    'status': 'active',
                    'created_at': datetime.now()
                }
                result = jobs_collection.insert_one(doc)
                doc['_id'] = str(result.inserted_id)
                return Job(id=str(result.inserted_id), company_id=company_id,
                           title=title, description=description,
                           required_skills=required_skills or [],
                           salary_min=salary_min, salary_max=salary_max,
                           location=location, job_type=job_type)
            except Exception as e:
                print(f"Error creating job: {e}")
        return None

    @staticmethod
    def find_by_id(job_id):
        if MONGO_CONNECTED:
            try:
                doc = jobs_collection.find_one({'_id': ObjectId(job_id)})
                if doc:
                    return Job(
                        id=str(doc['_id']), company_id=doc['company_id'],
                        title=doc['title'], description=doc.get('description', ''),
                        required_skills=doc.get('required_skills', []),
                        salary_min=doc.get('salary_min', 0), salary_max=doc.get('salary_max', 0),
                        location=doc.get('location', ''), job_type=doc.get('job_type', 'full-time'),
                        status=doc.get('status', 'active'), created_at=doc.get('created_at')
                    )
            except Exception as e:
                print(f"Error finding job: {e}")
        return None

    @staticmethod
    def find_by_company(company_id):
        jobs = []
        if MONGO_CONNECTED:
            for doc in jobs_collection.find({'company_id': company_id}).sort('created_at', -1):
                jobs.append({
                    'id': str(doc['_id']),
                    'company_id': doc['company_id'],
                    'title': doc['title'],
                    'description': doc.get('description', ''),
                    'required_skills': doc.get('required_skills', []),
                    'salary_min': doc.get('salary_min', 0),
                    'salary_max': doc.get('salary_max', 0),
                    'location': doc.get('location', ''),
                    'job_type': doc.get('job_type', 'full-time'),
                    'status': doc.get('status', 'active'),
                    'created_at': str(doc.get('created_at', ''))
                })
        return jobs

    @staticmethod
    def find_all_active():
        jobs = []
        if MONGO_CONNECTED:
            for doc in jobs_collection.find({'status': 'active'}).sort('created_at', -1):
                # Attach company info
                company = companies_collection.find_one({'_id': ObjectId(doc['company_id'])})
                company_name = company['name'] if company else 'Unknown'
                company_industry = company.get('industry', '') if company else ''
                jobs.append({
                    'id': str(doc['_id']),
                    'company_id': doc['company_id'],
                    'company_name': company_name,
                    'company_industry': company_industry,
                    'title': doc['title'],
                    'description': doc.get('description', ''),
                    'required_skills': doc.get('required_skills', []),
                    'salary_min': doc.get('salary_min', 0),
                    'salary_max': doc.get('salary_max', 0),
                    'location': doc.get('location', ''),
                    'job_type': doc.get('job_type', 'full-time'),
                    'status': doc.get('status', 'active'),
                    'created_at': str(doc.get('created_at', ''))
                })
        return jobs

    @staticmethod
    def update(job_id, updates):
        if MONGO_CONNECTED:
            result = jobs_collection.update_one(
                {'_id': ObjectId(job_id)},
                {'$set': updates}
            )
            return result.modified_count > 0
        return False

    @staticmethod
    def delete(job_id):
        if MONGO_CONNECTED:
            try:
                jobs_collection.delete_one({'_id': ObjectId(job_id)})
                applications_collection.delete_many({'job_id': job_id})
                return True
            except Exception as e:
                print(f"Error deleting job: {e}")
        return False

    @staticmethod
    def count():
        if MONGO_CONNECTED:
            return jobs_collection.count_documents({})
        return 0

    @staticmethod
    def count_active():
        if MONGO_CONNECTED:
            return jobs_collection.count_documents({'status': 'active'})
        return 0


# ============ APPLICATION MODEL ============
class Application:
    STATUSES = ['applied', 'shortlisted', 'interviewed', 'hired', 'rejected']

    def __init__(self, id=None, job_id=None, student_id=None, company_id=None,
                 status='applied', applied_at=None, updated_at=None):
        self.id = id
        self.job_id = job_id
        self.student_id = student_id
        self.company_id = company_id
        self.status = status
        self.applied_at = applied_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'student_id': self.student_id,
            'company_id': self.company_id,
            'status': self.status,
            'applied_at': str(self.applied_at),
            'updated_at': str(self.updated_at)
        }

    @staticmethod
    def create(job_id, student_id, company_id):
        if MONGO_CONNECTED:
            try:
                # Check if already applied
                existing = applications_collection.find_one({
                    'job_id': job_id, 'student_id': student_id
                })
                if existing:
                    return None  # Already applied
                doc = {
                    'job_id': job_id,
                    'student_id': student_id,
                    'company_id': company_id,
                    'status': 'applied',
                    'applied_at': datetime.now(),
                    'updated_at': datetime.now()
                }
                result = applications_collection.insert_one(doc)
                return Application(id=str(result.inserted_id), job_id=job_id,
                                   student_id=student_id, company_id=company_id)
            except Exception as e:
                print(f"Error creating application: {e}")
        return None

    @staticmethod
    def find_by_job(job_id):
        apps = []
        if MONGO_CONNECTED:
            for doc in applications_collection.find({'job_id': job_id}).sort('applied_at', -1):
                # Attach student info
                student = users_collection.find_one({'_id': ObjectId(doc['student_id'])})
                student_name = student['name'] if student else 'Unknown'
                student_email = student['email'] if student else ''
                # Attach student profile for skills
                profile = profiles_collection.find_one({'user_id': doc['student_id']})
                student_skills = []
                if profile:
                    student_skills = (profile.get('skills', []) + profile.get('languages', []) +
                                     profile.get('frameworks', []) + profile.get('databases', []) +
                                     profile.get('platforms', []))
                apps.append({
                    'id': str(doc['_id']),
                    'job_id': doc['job_id'],
                    'student_id': doc['student_id'],
                    'student_name': student_name,
                    'student_email': student_email,
                    'student_skills': student_skills,
                    'company_id': doc['company_id'],
                    'status': doc['status'],
                    'applied_at': str(doc.get('applied_at', '')),
                    'updated_at': str(doc.get('updated_at', ''))
                })
        return apps

    @staticmethod
    def find_by_student(student_id):
        apps = []
        if MONGO_CONNECTED:
            for doc in applications_collection.find({'student_id': student_id}).sort('applied_at', -1):
                # Attach job + company info
                job = jobs_collection.find_one({'_id': ObjectId(doc['job_id'])})
                job_title = job['title'] if job else 'Unknown'
                job_skills = job.get('required_skills', []) if job else []
                company_name = 'Unknown'
                if job:
                    company = companies_collection.find_one({'_id': ObjectId(job['company_id'])})
                    company_name = company['name'] if company else 'Unknown'
                apps.append({
                    'id': str(doc['_id']),
                    'job_id': doc['job_id'],
                    'job_title': job_title,
                    'job_skills': job_skills,
                    'company_name': company_name,
                    'student_id': doc['student_id'],
                    'company_id': doc['company_id'],
                    'status': doc['status'],
                    'applied_at': str(doc.get('applied_at', '')),
                    'updated_at': str(doc.get('updated_at', ''))
                })
        return apps

    @staticmethod
    def find_by_company(company_id):
        apps = []
        if MONGO_CONNECTED:
            for doc in applications_collection.find({'company_id': company_id}).sort('applied_at', -1):
                student = users_collection.find_one({'_id': ObjectId(doc['student_id'])})
                student_name = student['name'] if student else 'Unknown'
                student_email = student['email'] if student else ''
                job = jobs_collection.find_one({'_id': ObjectId(doc['job_id'])})
                job_title = job['title'] if job else 'Unknown'
                profile = profiles_collection.find_one({'user_id': doc['student_id']})
                student_skills = []
                branch = ''
                if profile:
                    student_skills = (profile.get('skills', []) + profile.get('languages', []) +
                                     profile.get('frameworks', []) + profile.get('databases', []) +
                                     profile.get('platforms', []))
                    branch = profile.get('branch', '')
                apps.append({
                    'id': str(doc['_id']),
                    'job_id': doc['job_id'],
                    'job_title': job_title,
                    'student_id': doc['student_id'],
                    'student_name': student_name,
                    'student_email': student_email,
                    'student_skills': student_skills,
                    'student_branch': branch,
                    'company_id': doc['company_id'],
                    'status': doc['status'],
                    'applied_at': str(doc.get('applied_at', '')),
                    'updated_at': str(doc.get('updated_at', ''))
                })
        return apps

    @staticmethod
    def update_status(app_id, new_status):
        if new_status not in Application.STATUSES:
            return False
        if MONGO_CONNECTED:
            result = applications_collection.update_one(
                {'_id': ObjectId(app_id)},
                {'$set': {'status': new_status, 'updated_at': datetime.now()}}
            )
            return result.modified_count > 0
        return False

    @staticmethod
    def count():
        if MONGO_CONNECTED:
            return applications_collection.count_documents({})
        return 0

    @staticmethod
    def count_by_company(company_id):
        if MONGO_CONNECTED:
            return applications_collection.count_documents({'company_id': company_id})
        return 0

    @staticmethod
    def count_by_status(company_id, status):
        if MONGO_CONNECTED:
            return applications_collection.count_documents({'company_id': company_id, 'status': status})
        return 0


# ============ SEED ADMIN ============
def seed_admin():
    """Create default admin user if not exists"""
    admin = User.find_by_email('admin@skill2career.com')
    if admin is None:
        admin = User.create('admin@skill2career.com', 'admin123', 'Admin', role='admin')
        if admin:
            print("[OK] Default admin seeded: admin@skill2career.com / admin123")
    else:
        # Ensure existing admin has role set
        if MONGO_CONNECTED:
            users_collection.update_one(
                {'email': 'admin@skill2career.com'},
                {'$set': {'role': 'admin'}}
            )

def seed_default_company():
    """Create default ARTZ Solutions company if not exists"""
    existing = Company.find_by_email('artz@skill2career.com')
    if existing is None:
        company = Company.create(
            name='ARTZ Solutions',
            email='artz@skill2career.com',
            password='artz123',
            industry='Technology',
            website='https://artzsolutions.com',
            description='Leading technology company specializing in AI, cloud computing, and enterprise software solutions.'
        )
        if company:
            print("[OK] Default company seeded: artz@skill2career.com / artz123")
            # Add sample jobs
            Job.create(company_id=company.id, title='Frontend Developer',
                       description='Build responsive web apps using React, collaborate with design team, and optimize UI performance.',
                       required_skills=['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
                       salary_min=400000, salary_max=900000, location='Bangalore', job_type='full-time')
            Job.create(company_id=company.id, title='Data Science Intern',
                       description='Work on ML models, data analysis, and AI research projects with our data science team.',
                       required_skills=['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'SQL'],
                       salary_min=150000, salary_max=300000, location='Remote', job_type='internship')
            Job.create(company_id=company.id, title='Full Stack Developer',
                       description='Design and develop scalable web applications. Work on both frontend and backend systems.',
                       required_skills=['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript', 'Git'],
                       salary_min=600000, salary_max=1200000, location='Hyderabad', job_type='full-time')
            print("[OK] 3 sample jobs created for ARTZ Solutions")

seed_admin()
seed_default_company()
Course.seed_from_json()
