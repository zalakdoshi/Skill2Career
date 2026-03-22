import pandas as pd
import os
import json
from config import Config

class DataLoader:
    _instance = None
    _data_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not DataLoader._data_loaded:
            self.languages = []
            self.frameworks = []
            self.databases = []
            self.platforms = []
            self.career_roles = []
            self.job_skills_sample = None
            self._load_data()
            DataLoader._data_loaded = True
    
    def _load_data(self):
        data_dir = Config.DATA_DIR
        
        # Load language skills
        try:
            lang_df = pd.read_csv(os.path.join(data_dir, 'LanguageWorkedWith.csv'), nrows=100)
            self.languages = [col for col in lang_df.columns if col not in ['Unnamed: 0', 'Respondent']]
        except Exception as e:
            print(f"Error loading languages: {e}")
            self.languages = ['Python', 'JavaScript', 'Java', 'C++', 'C', 'TypeScript', 'SQL', 'HTML/CSS', 'Go', 'Rust']
        
        # Load frameworks
        try:
            fw_df = pd.read_csv(os.path.join(data_dir, 'FrameworkWorkedWith.csv'), nrows=100)
            self.frameworks = [col for col in fw_df.columns if col not in ['Unnamed: 0', 'Respondent']]
        except Exception as e:
            print(f"Error loading frameworks: {e}")
            self.frameworks = ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', '.NET Core', 'TensorFlow', 'PyTorch']
        
        # Load databases
        try:
            db_df = pd.read_csv(os.path.join(data_dir, 'DatabaseWorkedWith.csv'), nrows=100)
            self.databases = [col for col in db_df.columns if col not in ['Unnamed: 0', 'Respondent']]
        except Exception as e:
            print(f"Error loading databases: {e}")
            self.databases = ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase']
        
        # Load platforms
        try:
            plt_df = pd.read_csv(os.path.join(data_dir, 'PlatformWorkedWith.csv'), nrows=100)
            self.platforms = [col for col in plt_df.columns if col not in ['Unnamed: 0', 'Respondent']]
        except Exception as e:
            print(f"Error loading platforms: {e}")
            self.platforms = ['Linux', 'Windows', 'AWS', 'Docker', 'Kubernetes', 'Azure', 'Google Cloud', 'Heroku']
        
        # Load sample job skills for recommendations
        try:
            self.job_skills_sample = pd.read_csv(
                os.path.join(data_dir, 'job_skills.csv'), 
                nrows=5000
            )
        except Exception as e:
            print(f"Error loading job skills: {e}")
            self.job_skills_sample = None
        
        # Define career roles with required skills
        self._define_career_roles()
    
    def _define_career_roles(self):
        """Load career roles from careers_data.json (generated from LinkedIn dataset)"""
        json_path = os.path.join(os.path.dirname(__file__), 'careers_data.json')
        
        try:
            with open(json_path, 'r') as f:
                self.career_roles = json.load(f)
            print(f"Loaded {len(self.career_roles)} careers from careers_data.json")
        except FileNotFoundError:
            print(f"Warning: careers_data.json not found, using defaults")
            self._define_default_career_roles()
        except Exception as e:
            print(f"Error loading careers: {e}, using defaults")
            self._define_default_career_roles()
    
    def _define_default_career_roles(self):
        """Fallback default career roles if JSON is not available"""
        self.career_roles = [
            {
                'id': 1,
                'title': 'Software Developer',
                'description': 'Design, develop, and maintain software applications',
                'required_skills': ['Python', 'JavaScript', 'Java', 'SQL', 'Git'],
                'preferred_skills': ['React', 'Node.js', 'Docker', 'AWS'],
                'min_cgpa': 6.5,
                'category': 'Development'
            },
            {
                'id': 2,
                'title': 'Data Scientist',
                'description': 'Analyze complex data to help organizations make better decisions',
                'required_skills': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas'],
                'preferred_skills': ['TensorFlow', 'PyTorch', 'Tableau', 'Spark'],
                'min_cgpa': 7.0,
                'category': 'Data Science'
            },
            {
                'id': 3,
                'title': 'DevOps Engineer',
                'description': 'Manage CI/CD pipelines and cloud infrastructure',
                'required_skills': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Git'],
                'preferred_skills': ['Terraform', 'Jenkins', 'Python', 'Ansible'],
                'min_cgpa': 6.5,
                'category': 'DevOps'
            }
        ]
    
    def get_all_skills(self):
        all_skills = set()
        all_skills.update(self.languages)
        all_skills.update(self.frameworks)
        all_skills.update(self.databases)
        all_skills.update(self.platforms)
        
        # Add common tech skills
        common_skills = [
            'Machine Learning', 'Deep Learning', 'Git', 'API Design', 'Testing',
            'Agile', 'REST API', 'GraphQL', 'Microservices', 'Data Structures',
            'Algorithms', 'System Design', 'Communication', 'Problem Solving',
            'Statistics', 'Mathematics', 'NLP', 'Computer Vision', 'Data Visualization',
            'Project Management', 'Research', 'Technical Writing', 'Mobile Development',
            'Network Security', 'Cryptography', 'Security Tools', 'Penetration Testing',
            'ETL', 'Data Warehousing', 'CI/CD', 'MLOps', 'Networking'
        ]
        all_skills.update(common_skills)
        
        return sorted(list(all_skills))
    
    def get_career_roles(self):
        return self.career_roles
    
    def get_job_market_insights(self):
        if self.job_skills_sample is None:
            return {'top_skills': [], 'job_count': 0}
        
        # Extract top skills from job postings
        skills_count = {}
        for idx, row in self.job_skills_sample.iterrows():
            if pd.notna(row.get('job_skills')):
                skills = str(row['job_skills']).split(',')
                for skill in skills:
                    skill = skill.strip()
                    if skill:
                        skills_count[skill] = skills_count.get(skill, 0) + 1
        
        # Get top 20 skills
        top_skills = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:20]
        
        return {
            'top_skills': [{'skill': s[0], 'count': s[1]} for s in top_skills],
            'job_count': len(self.job_skills_sample)
        }

# Global instance
data_loader = DataLoader()
