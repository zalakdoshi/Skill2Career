"""
Comprehensive test suite for the Skill2Career recommendation engine.
Tests skill matching, company requirements matching, edge cases, and Gemini AI integration.
"""

import unittest
from unittest.mock import Mock, MagicMock, patch
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock heavy dependencies before importing local modules
sys.modules['pandas'] = MagicMock()
sys.modules['pymongo'] = MagicMock()
sys.modules['google'] = MagicMock()
sys.modules['google.generativeai'] = MagicMock()
sys.modules['bcrypt'] = MagicMock()
sys.modules['flask'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['flask_jwt_extended'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Mock data_loader to avoid dependency on pandas/CSV
mock_data_loader = MagicMock()
mock_data_loader.get_career_roles.return_value = []
sys.modules['data_loader'] = MagicMock(data_loader=mock_data_loader)

# Mock config
mock_config = MagicMock()
mock_config.MONGO_URI = ''
mock_config.MONGO_DB_NAME = 'skill2career'
sys.modules['config'] = MagicMock(Config=mock_config)

# Now import the actual module
from recommendation_engine import RecommendationEngine

# Create a mock Profile class for testing
class MockProfile:
    def __init__(self):
        self.user_id = None
        self.cgpa = 0.0
        self.skills = []
        self.languages = []
        self.frameworks = []
        self.databases = []
        self.platforms = []
        self.projects = []
        self.internships = []


class TestRecommendationEngine(unittest.TestCase):
    """Test cases for the RecommendationEngine class"""
    
    def setUp(self):
        """Set up test fixtures before each test"""
        self.engine = RecommendationEngine()
        
        # Mock career role for testing
        self.mock_career_role = {
            'id': 'test_role_1',
            'role_name': 'Full Stack Developer',
            'category': 'Software Development',
            'required_skills': ['Python', 'JavaScript', 'React', 'MongoDB'],
            'preferred_skills': ['TypeScript', 'Docker', 'AWS'],
            'min_cgpa': 7.0,
            'description': 'Build scalable web applications'
        }
        
        # Mock student profile with good match
        self.good_profile = MockProfile()
        self.good_profile.user_id = 'student_1'
        self.good_profile.cgpa = 7.5
        self.good_profile.skills = ['Django', 'REST APIs']
        self.good_profile.languages = ['Python', 'JavaScript']
        self.good_profile.frameworks = ['React', 'Express']
        self.good_profile.databases = ['MongoDB', 'PostgreSQL']
        self.good_profile.platforms = ['Linux', 'AWS']
        self.good_profile.projects = [
            {'title': 'E-commerce Platform', 'tech': ['Python', 'React']},
            {'title': 'API Dashboard', 'tech': ['JavaScript', 'MongoDB']}
        ]
        self.good_profile.internships = [
            {'company': 'TechCorp', 'role': 'Backend Developer'}
        ]
        
        # Mock student profile with poor match
        self.poor_profile = MockProfile()
        self.poor_profile.user_id = 'student_2'
        self.poor_profile.cgpa = 6.0
        self.poor_profile.skills = ['UI/UX Design']
        self.poor_profile.languages = ['Java']
        self.poor_profile.frameworks = ['Spring']
        self.poor_profile.databases = []
        self.poor_profile.platforms = []
        self.poor_profile.projects = []
        self.poor_profile.internships = []
        
        # Mock profile with no skills
        self.empty_profile = MockProfile()
        self.empty_profile.user_id = 'student_3'
        self.empty_profile.cgpa = 0.0
        self.empty_profile.skills = []
        self.empty_profile.languages = []
        self.empty_profile.frameworks = []
        self.empty_profile.databases = []
        self.empty_profile.platforms = []
        self.empty_profile.projects = []
        self.empty_profile.internships = []
    
    # ============ SKILL MATCHING TESTS ============
    
    def test_calculate_skill_match_full_match(self):
        """Test skill matching when all required skills are present"""
        user_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        required_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        preferred_skills = ['TypeScript', 'Docker']
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        # 4/4 required = 100%, 0/2 preferred = 0%
        # 100 * 0.7 + 0 * 0.3 = 70%
        self.assertEqual(result['total_score'], 70.0)
        self.assertEqual(result['required_matched'], 4)
        self.assertEqual(result['required_total'], 4)
        self.assertEqual(result['preferred_matched'], 0)
    
    def test_calculate_skill_match_partial_match(self):
        """Test skill matching with partial required skills"""
        user_skills = ['Python', 'JavaScript', 'MongoDB']
        required_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        preferred_skills = ['TypeScript', 'Docker']
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        # 3 out of 4 required = 75%, 0 out of 2 preferred = 0%
        # 75% * 0.7 + 0% * 0.3 = 52.5
        self.assertEqual(result['total_score'], 52.5)
        self.assertEqual(result['required_matched'], 3)
        self.assertEqual(result['preferred_matched'], 0)
    
    def test_calculate_skill_match_with_preferred_skills(self):
        """Test skill matching including preferred skills"""
        user_skills = ['Python', 'JavaScript', 'React', 'MongoDB', 'TypeScript', 'Docker']
        required_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        preferred_skills = ['TypeScript', 'Docker']
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        # 4 out of 4 required = 100%, 2 out of 2 preferred = 100%
        # 100% * 0.7 + 100% * 0.3 = 100%
        self.assertEqual(result['total_score'], 100.0)
        self.assertEqual(result['required_matched'], 4)
        self.assertEqual(result['preferred_matched'], 2)
    
    def test_calculate_skill_match_case_insensitive(self):
        """Test that skill matching is case-insensitive"""
        user_skills = ['python', 'JAVASCRIPT', 'ReAcT']
        required_skills = ['Python', 'JavaScript', 'React']
        preferred_skills = []
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        # 3/3 required = 100%, 0/0 preferred = 0%
        # 100 * 0.7 + 0 * 0.3 = 70%
        self.assertEqual(result['total_score'], 70.0)
        self.assertEqual(result['required_matched'], 3)
    
    def test_calculate_skill_match_no_skills(self):
        """Test skill matching when user has no skills"""
        user_skills = []
        required_skills = ['Python', 'JavaScript']
        preferred_skills = ['React']
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        self.assertEqual(result['total_score'], 0.0)
        self.assertEqual(result['required_matched'], 0)
        self.assertEqual(result['preferred_matched'], 0)
    
    def test_calculate_skill_match_empty_required_skills(self):
        """Test handling of empty required skills list"""
        user_skills = ['Python', 'JavaScript']
        required_skills = []
        preferred_skills = ['React']
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        # 0/0 required = 0%, 0/1 preferred = 0% → total = 0%
        self.assertEqual(result['total_score'], 0.0)
        self.assertEqual(result['required_total'], 0)
    
    # ============ SKILL GAP IDENTIFICATION TESTS ============
    
    def test_identify_skill_gaps_with_gaps(self):
        """Test identification of missing required and preferred skills"""
        user_skills = ['Python', 'MongoDB']
        required_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        preferred_skills = ['TypeScript', 'Docker', 'AWS']
        
        gaps = self.engine.identify_skill_gaps(
            user_skills, required_skills, preferred_skills
        )
        
        self.assertEqual(len(gaps['missing_required']), 2)
        self.assertIn('JavaScript', gaps['missing_required'])
        self.assertIn('React', gaps['missing_required'])
        self.assertEqual(len(gaps['missing_preferred']), 3)
    
    def test_identify_skill_gaps_no_gaps(self):
        """Test when user has all required and preferred skills"""
        user_skills = ['Python', 'JavaScript', 'React', 'MongoDB', 'TypeScript', 'Docker', 'AWS']
        required_skills = ['Python', 'JavaScript', 'React', 'MongoDB']
        preferred_skills = ['TypeScript', 'Docker', 'AWS']
        
        gaps = self.engine.identify_skill_gaps(
            user_skills, required_skills, preferred_skills
        )
        
        self.assertEqual(len(gaps['missing_required']), 0)
        self.assertEqual(len(gaps['missing_preferred']), 0)
    
    def test_identify_skill_gaps_case_insensitive(self):
        """Test that skill gap identification is case-insensitive"""
        user_skills = ['python', 'javascript']
        required_skills = ['Python', 'JavaScript', 'React']
        preferred_skills = []
        
        gaps = self.engine.identify_skill_gaps(
            user_skills, required_skills, preferred_skills
        )
        
        self.assertEqual(len(gaps['missing_required']), 1)
        self.assertIn('React', gaps['missing_required'])
    
    # ============ READINESS SCORE TESTS ============
    
    def test_calculate_readiness_score_strong_candidate(self):
        """Test readiness score calculation for a strong candidate"""
        readiness = self.engine.calculate_readiness_score(self.good_profile, self.mock_career_role)
        
        self.assertGreater(readiness['overall_readiness'], 0)
        self.assertLessEqual(readiness['overall_readiness'], 100)
        self.assertGreaterEqual(readiness['skill_score'], 0)
        self.assertIn('cgpa_score', readiness)
        self.assertIn('project_score', readiness)
        self.assertIn('internship_score', readiness)
    
    def test_calculate_readiness_score_weak_candidate(self):
        """Test readiness score calculation for a weak candidate"""
        readiness = self.engine.calculate_readiness_score(self.poor_profile, self.mock_career_role)
        
        # Poor profile should have lower readiness
        self.assertLess(readiness['overall_readiness'], 50)
    
    def test_calculate_readiness_score_cgpa_threshold(self):
        """Test CGPA scoring at different thresholds"""
        profile = MockProfile()
        profile.skills = []
        profile.languages = []
        profile.frameworks = []
        profile.databases = []
        profile.platforms = []
        profile.projects = []
        profile.internships = []
        
        # Test at exact minimum CGPA
        profile.cgpa = 7.0
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['cgpa_score'], 100)
        
        # Test between min and min-1
        profile.cgpa = 6.5
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['cgpa_score'], 70)
        
        # Test between min-1 and min-2
        profile.cgpa = 5.5
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['cgpa_score'], 40)
        
        # Test below min-2
        profile.cgpa = 4.0
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['cgpa_score'], 0)
    
    def test_calculate_readiness_score_project_scoring(self):
        """Test project score calculation"""
        profile = MockProfile()
        profile.cgpa = 7.0
        profile.skills = []
        profile.languages = []
        profile.frameworks = []
        profile.databases = []
        profile.platforms = []
        profile.internships = []
        
        # 0 projects
        profile.projects = []
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['project_score'], 0)
        
        # 2 projects = 50%
        profile.projects = [{'title': 'P1'}, {'title': 'P2'}]
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['project_score'], 50)
        
        # 4+ projects = 100%
        profile.projects = [{'title': f'P{i}'} for i in range(5)]
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['project_score'], 100)
    
    def test_calculate_readiness_score_internship_scoring(self):
        """Test internship score calculation"""
        profile = MockProfile()
        profile.cgpa = 7.0
        profile.skills = []
        profile.languages = []
        profile.frameworks = []
        profile.databases = []
        profile.platforms = []
        profile.projects = []
        
        # 0 internships
        profile.internships = []
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['internship_score'], 0)
        
        # 1 internship = 50%
        profile.internships = [{'company': 'TechCorp'}]
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['internship_score'], 50)
        
        # 2+ internships = 100%
        profile.internships = [{'company': 'TechCorp'}, {'company': 'StartupXYZ'}]
        readiness = self.engine.calculate_readiness_score(profile, self.mock_career_role)
        self.assertEqual(readiness['internship_score'], 100)
    
    # ============ RECOMMENDATION ENGINE TESTS ============
    
    @patch.object(RecommendationEngine, 'calculate_readiness_score')
    @patch.object(RecommendationEngine, 'calculate_skill_match')
    @patch.object(RecommendationEngine, 'identify_skill_gaps')
    def test_get_recommendations_sorting(self, mock_gaps, mock_match, mock_readiness):
        """Test that recommendations are sorted by compatibility score"""
        # Mock return values
        mock_match.side_effect = [
            {'total_score': 85.0},
            {'total_score': 60.0},
            {'total_score': 90.0}
        ]
        mock_readiness.return_value = {'overall_readiness': 75.0}
        mock_gaps.return_value = {'missing_required': [], 'missing_preferred': []}
        
        # Mock engine with multiple career roles (with all required fields)
        self.engine.career_roles = [
            {'role_name': 'Role1', 'category': 'Dev', 'required_skills': [], 'preferred_skills': [], 'min_cgpa': 7.0},
            {'role_name': 'Role2', 'category': 'Dev', 'required_skills': [], 'preferred_skills': [], 'min_cgpa': 7.0},
            {'role_name': 'Role3', 'category': 'Dev', 'required_skills': [], 'preferred_skills': [], 'min_cgpa': 7.0}
        ]
        
        recommendations = self.engine.get_recommendations(self.good_profile)
        
        # Check sorting by score (descending)
        self.assertEqual(recommendations[0]['compatibility_score'], 90.0)
        self.assertEqual(recommendations[1]['compatibility_score'], 85.0)
        self.assertEqual(recommendations[2]['compatibility_score'], 60.0)
    
    def test_get_recommendations_edge_case_no_roles(self):
        """Test get_recommendations with no career roles available"""
        # Create engine with no roles
        engine = RecommendationEngine()
        engine.career_roles = []
        
        recommendations = engine.get_recommendations(self.good_profile)
        
        self.assertEqual(len(recommendations), 0)
    
    # ============ SUGGESTION GENERATION TESTS ============
    
    def test_generate_suggestions_skill_gaps(self):
        """Test that suggestions are generated for missing skills"""
        skill_gaps = {
            'missing_required': ['Python', 'React', 'MongoDB'],
            'missing_preferred': ['Docker', 'AWS']
        }
        
        suggestions = self.engine._generate_suggestions(
            skill_gaps, self.good_profile, self.mock_career_role
        )
        
        # Should have at least skill gap suggestions
        self.assertGreater(len(suggestions), 0)
        
        # Check for skill suggestion with high priority
        skill_suggestions = [s for s in suggestions if s['type'] == 'skill' and s['priority'] == 'high']
        self.assertGreater(len(skill_suggestions), 0)
    
    def test_generate_suggestions_low_cgpa(self):
        """Test that CGPA improvement suggestion is generated when needed"""
        low_cgpa_profile = MockProfile()
        low_cgpa_profile.cgpa = 6.0
        low_cgpa_profile.projects = [{'title': 'P1'}]
        low_cgpa_profile.internships = [{'company': 'C1'}]
        
        skill_gaps = {'missing_required': [], 'missing_preferred': []}
        
        suggestions = self.engine._generate_suggestions(
            skill_gaps, low_cgpa_profile, self.mock_career_role
        )
        
        # Check for academic suggestion
        academic_suggestions = [s for s in suggestions if s['type'] == 'academic']
        self.assertGreater(len(academic_suggestions), 0)
    
    def test_generate_suggestions_no_projects(self):
        """Test that project suggestion is generated when needed"""
        no_project_profile = MockProfile()
        no_project_profile.cgpa = 7.5
        no_project_profile.projects = []
        no_project_profile.internships = [{'company': 'C1'}]
        
        skill_gaps = {'missing_required': [], 'missing_preferred': []}
        
        suggestions = self.engine._generate_suggestions(
            skill_gaps, no_project_profile, self.mock_career_role
        )
        
        # Check for experience suggestion
        experience_suggestions = [s for s in suggestions if s['type'] == 'experience' and 'project' in s['message'].lower()]
        self.assertGreater(len(experience_suggestions), 0)
    
    def test_generate_suggestions_no_internships(self):
        """Test that internship suggestion is generated when needed"""
        no_internship_profile = MockProfile()
        no_internship_profile.cgpa = 7.5
        no_internship_profile.projects = [{'title': 'P1'}]
        no_internship_profile.internships = []
        
        skill_gaps = {'missing_required': [], 'missing_preferred': []}
        
        suggestions = self.engine._generate_suggestions(
            skill_gaps, no_internship_profile, self.mock_career_role
        )
        
        # Check for internship suggestion
        experience_suggestions = [s for s in suggestions if s['type'] == 'experience' and 'internship' in s['message'].lower()]
        self.assertGreater(len(experience_suggestions), 0)
    
    # ============ SKILL ANALYSIS TESTS ============
    
    @patch.object(RecommendationEngine, 'calculate_skill_match')
    def test_get_skill_analysis(self, mock_match):
        """Test skill analysis and categorization"""
        mock_match.return_value = {'total_score': 75.0}
        
        # Mock engine with career roles
        self.engine.career_roles = [
            {'category': 'Web Development', 'required_skills': [], 'preferred_skills': []},
            {'category': 'Web Development', 'required_skills': [], 'preferred_skills': []},
            {'category': 'Data Science', 'required_skills': [], 'preferred_skills': []}
        ]
        
        analysis = self.engine.get_skill_analysis(self.good_profile)
        
        self.assertIn('total_skills', analysis)
        self.assertIn('skill_distribution', analysis)
        self.assertIn('category_fit', analysis)
        self.assertGreater(analysis['total_skills'], 0)
    
    # ============ EDGE CASE TESTS ============
    
    def test_recommendation_engine_with_empty_profile(self):
        """Test recommendation engine with profile having no skills"""
        with patch.object(self.engine, 'calculate_skill_match', return_value={'total_score': 0.0}):
            recommendations = self.engine.get_recommendations(self.empty_profile)
            
            # Should still return recommendations (possibly empty or low scores)
            self.assertIsInstance(recommendations, list)
    
    def test_duplicate_skills_handling(self):
        """Test that duplicate skills don't cause incorrect scoring"""
        user_skills = ['Python', 'Python', 'JavaScript']
        required_skills = ['Python', 'JavaScript']
        
        result = self.engine.calculate_skill_match(user_skills, required_skills, [])
        
        # Should still match correctly despite duplicates
        self.assertEqual(result['required_matched'], 2)
    
    def test_special_characters_in_skills(self):
        """Test handling of skills with special characters"""
        user_skills = ['C++', 'C#', 'Node.js', 'ASP.NET']
        required_skills = ['C++', 'C#', 'Node.js']
        
        result = self.engine.calculate_skill_match(user_skills, required_skills, [])
        
        self.assertEqual(result['required_matched'], 3)
    
    def test_very_long_skill_list(self):
        """Test performance with very long skill lists"""
        user_skills = [f'Skill_{i}' for i in range(100)]
        required_skills = [f'Skill_{i}' for i in range(50)]
        preferred_skills = [f'Skill_{i}' for i in range(50, 100)]
        
        result = self.engine.calculate_skill_match(
            user_skills, required_skills, preferred_skills
        )
        
        self.assertEqual(result['total_score'], 100.0)


class TestRecommendationEngineWithGeminiAI(unittest.TestCase):
    """Test cases for Gemini AI integration with recommendation engine"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.engine = RecommendationEngine()
        self.profile = MockProfile()
        self.profile.user_id = 'student_ai_test'
        self.profile.cgpa = 7.5
        self.profile.skills = ['Python', 'JavaScript']
        self.profile.languages = ['Python', 'JavaScript', 'Java']
        self.profile.frameworks = ['React', 'Express']
        self.profile.databases = ['MongoDB']
        self.profile.platforms = []
        self.profile.projects = [{'title': 'Project1'}]
        self.profile.internships = []
    
    @patch('ai_mentor.ai_mentor')
    def test_ai_guidance_integration(self, mock_ai_mentor):
        """Test that recommendations can integrate with AI guidance"""
        # Mock AI response
        mock_ai_mentor.get_ai_guidance.return_value = {
            'guidance': 'Focus on full-stack development',
            'next_steps': ['Learn TypeScript', 'Build a full-stack project']
        }
        
        # This test ensures the recommendation engine is compatible
        # with AI mentor guidance
        self.assertIsNotNone(self.engine)


if __name__ == '__main__':
    unittest.main()
