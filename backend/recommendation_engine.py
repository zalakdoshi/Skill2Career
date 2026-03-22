from data_loader import data_loader

class RecommendationEngine:
    def __init__(self):
        self.career_roles = data_loader.get_career_roles()
    
    def calculate_skill_match(self, user_skills, required_skills, preferred_skills):
        """Calculate skill match percentage"""
        user_skills_lower = [s.lower() for s in user_skills]
        
        # Required skills match
        required_matched = sum(1 for skill in required_skills if skill.lower() in user_skills_lower)
        required_score = (required_matched / len(required_skills)) * 100 if required_skills else 0
        
        # Preferred skills match
        preferred_matched = sum(1 for skill in preferred_skills if skill.lower() in user_skills_lower)
        preferred_score = (preferred_matched / len(preferred_skills)) * 100 if preferred_skills else 0
        
        # Weighted average (70% required, 30% preferred)
        total_score = (required_score * 0.7) + (preferred_score * 0.3)
        
        return {
            'total_score': round(total_score, 1),
            'required_matched': required_matched,
            'required_total': len(required_skills),
            'preferred_matched': preferred_matched,
            'preferred_total': len(preferred_skills)
        }
    
    def identify_skill_gaps(self, user_skills, required_skills, preferred_skills):
        """Identify missing skills"""
        user_skills_lower = [s.lower() for s in user_skills]
        
        missing_required = [s for s in required_skills if s.lower() not in user_skills_lower]
        missing_preferred = [s for s in preferred_skills if s.lower() not in user_skills_lower]
        
        return {
            'missing_required': missing_required,
            'missing_preferred': missing_preferred
        }
    
    def calculate_readiness_score(self, profile, career_role):
        """Calculate overall readiness for a career role"""
        # Combine all user skills
        all_user_skills = (
            profile.skills + 
            profile.languages + 
            profile.frameworks + 
            profile.databases + 
            profile.platforms
        )
        
        # Skill match score (40%)
        skill_match = self.calculate_skill_match(
            all_user_skills,
            career_role['required_skills'],
            career_role['preferred_skills']
        )
        skill_score = skill_match['total_score']
        
        # CGPA score (20%)
        cgpa_score = 0
        if profile.cgpa >= career_role['min_cgpa']:
            cgpa_score = 100
        elif profile.cgpa >= career_role['min_cgpa'] - 1:
            cgpa_score = 70
        elif profile.cgpa >= career_role['min_cgpa'] - 2:
            cgpa_score = 40
        
        # Projects score (20%)
        project_count = len(profile.projects)
        project_score = min(project_count * 25, 100)  # Max 4 projects = 100%
        
        # Internship score (20%)
        internship_count = len(profile.internships)
        internship_score = min(internship_count * 50, 100)  # Max 2 internships = 100%
        
        # Weighted total
        readiness = (
            skill_score * 0.40 +
            cgpa_score * 0.20 +
            project_score * 0.20 +
            internship_score * 0.20
        )
        
        return {
            'overall_readiness': round(readiness, 1),
            'skill_score': round(skill_score, 1),
            'cgpa_score': cgpa_score,
            'project_score': project_score,
            'internship_score': internship_score
        }
    
    def get_recommendations(self, profile):
        """Get career recommendations for a user profile"""
        all_user_skills = (
            profile.skills + 
            profile.languages + 
            profile.frameworks + 
            profile.databases + 
            profile.platforms
        )
        
        recommendations = []
        
        for role in self.career_roles:
            # Calculate scores
            skill_match = self.calculate_skill_match(
                all_user_skills,
                role['required_skills'],
                role['preferred_skills']
            )
            
            readiness = self.calculate_readiness_score(profile, role)
            
            skill_gaps = self.identify_skill_gaps(
                all_user_skills,
                role['required_skills'],
                role['preferred_skills']
            )
            
            # Generate improvement suggestions
            suggestions = self._generate_suggestions(skill_gaps, profile, role)
            
            recommendations.append({
                'role': role,
                'compatibility_score': skill_match['total_score'],
                'readiness': readiness,
                'skill_gaps': skill_gaps,
                'suggestions': suggestions
            })
        
        # Sort by compatibility score
        recommendations.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        return recommendations
    
    def _generate_suggestions(self, skill_gaps, profile, role):
        """Generate improvement suggestions"""
        suggestions = []
        
        # Skill suggestions
        if skill_gaps['missing_required']:
            top_missing = skill_gaps['missing_required'][:3]
            suggestions.append({
                'type': 'skill',
                'priority': 'high',
                'message': f"Learn these critical skills: {', '.join(top_missing)}",
                'skills': top_missing
            })
        
        if skill_gaps['missing_preferred']:
            top_preferred = skill_gaps['missing_preferred'][:2]
            suggestions.append({
                'type': 'skill',
                'priority': 'medium',
                'message': f"Consider learning: {', '.join(top_preferred)}",
                'skills': top_preferred
            })
        
        # CGPA suggestion
        if profile.cgpa < role['min_cgpa']:
            suggestions.append({
                'type': 'academic',
                'priority': 'medium',
                'message': f"Improve CGPA to at least {role['min_cgpa']} for better chances"
            })
        
        # Project suggestion
        if len(profile.projects) < 2:
            suggestions.append({
                'type': 'experience',
                'priority': 'high',
                'message': f"Build more projects related to {role['category']}"
            })
        
        # Internship suggestion
        if len(profile.internships) == 0:
            suggestions.append({
                'type': 'experience',
                'priority': 'high',
                'message': "Gain industry experience through internships"
            })
        
        return suggestions
    
    def get_skill_analysis(self, profile):
        """Analyze user's skill distribution and strengths"""
        all_skills = (
            profile.skills + 
            profile.languages + 
            profile.frameworks + 
            profile.databases + 
            profile.platforms
        )
        
        # Categorize skills
        skill_categories = {
            'Programming Languages': len(profile.languages),
            'Frameworks': len(profile.frameworks),
            'Databases': len(profile.databases),
            'Platforms & Tools': len(profile.platforms),
            'Other Skills': len(profile.skills)
        }
        
        # Find matching career categories
        category_scores = {}
        for role in self.career_roles:
            category = role['category']
            if category not in category_scores:
                category_scores[category] = []
            
            match = self.calculate_skill_match(
                all_skills,
                role['required_skills'],
                role['preferred_skills']
            )
            category_scores[category].append(match['total_score'])
        
        # Average scores per category
        category_averages = {
            cat: round(sum(scores) / len(scores), 1)
            for cat, scores in category_scores.items()
        }
        
        return {
            'total_skills': len(all_skills),
            'skill_distribution': skill_categories,
            'category_fit': category_averages,
            'top_category': max(category_averages, key=category_averages.get) if category_averages else None
        }

recommendation_engine = RecommendationEngine()
