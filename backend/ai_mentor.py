import os
from config import Config

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class AIMentor:
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        self.model = None
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Use gemini-2.0-flash for fast responses
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                print("[OK] Gemini AI initialized successfully")
            except Exception as e:
                print(f"[WARNING] Failed to initialize Gemini: {e}")
                self.model = None
        else:
            if not GENAI_AVAILABLE:
                print("[WARNING] google-generativeai package not installed")
            if not self.api_key:
                print("[WARNING] No Gemini API key configured")
    
    def get_response(self, message, profile_context=None):
        """Get AI response for any query"""
        
        # Build context
        system_prompt = """You are a helpful AI assistant and career mentor for engineering students. 
You can answer ANY question the user asks - whether it's about:
- Career guidance and path selection
- Technical questions about programming, algorithms, or technology
- General knowledge and educational topics
- Study tips and learning strategies
- Interview preparation and job market insights
- Or anything else they need help with

Be helpful, accurate, and friendly. Keep responses clear and practical.
If the question is career-related, tailor your advice to engineering students."""
        
        if profile_context:
            context = f"""
Student Profile:
- CGPA: {profile_context.get('cgpa', 'Not specified')}
- Branch: {profile_context.get('branch', 'Not specified')}
- Skills: {', '.join(profile_context.get('skills', []) + profile_context.get('languages', []))}
- Projects: {len(profile_context.get('projects', []))} projects
- Internships: {len(profile_context.get('internships', []))} internships
- Career Interests: {', '.join(profile_context.get('career_interests', []))}
"""
            full_prompt = f"{system_prompt}\n\n{context}\n\nStudent Question: {message}"
        else:
            full_prompt = f"{system_prompt}\n\nStudent Question: {message}"
        
        # Try AI response
        if self.model:
            try:
                response = self.model.generate_content(full_prompt)
                return {
                    'success': True,
                    'response': response.text,
                    'source': 'ai'
                }
            except Exception as e:
                print(f"AI Error: {e}")
        
        # Fallback to rule-based responses
        return self._fallback_response(message)
    
    def _fallback_response(self, message):
        """Provide helpful responses when AI is not available"""
        message_lower = message.lower()
        
        responses = {
            'skills': """**Essential Skills for Engineering Careers:**

1. **Technical Skills**: Programming (Python, JavaScript), Data Structures, Algorithms
2. **Soft Skills**: Communication, Problem-solving, Teamwork
3. **Tools**: Git, Docker, Cloud platforms (AWS/GCP/Azure)

**Tip**: Focus on building practical projects to demonstrate your skills!""",

            'interview': """**Interview Preparation Tips:**

1. Practice coding problems on LeetCode/HackerRank
2. Review Data Structures & Algorithms concepts
3. Prepare behavioral questions using STAR method
4. Research the company and role thoroughly
5. Practice mock interviews with peers

**Remember**: Confidence and clear communication matter as much as technical skills!""",

            'resume': """**Resume Building Tips:**

1. Keep it to 1 page for freshers
2. Lead with Education and Skills
3. List projects with technologies used and impact
4. Quantify achievements where possible
5. Include GitHub and LinkedIn links
6. Tailor resume for each application

**Pro tip**: Use action verbs like 'Developed', 'Implemented', 'Led'""",

            'project': """**Project Ideas for Your Portfolio:**

1. **Web Development**: Full-stack CRUD application
2. **Data Science**: Data analysis dashboard
3. **ML/AI**: Image classification or chatbot
4. **Mobile**: Cross-platform app with React Native
5. **DevOps**: CI/CD pipeline setup

**Key**: Choose projects that align with your career goals!""",

            'internship': """**Internship Search Tips:**

1. Start applying 3-4 months before your preferred start date
2. Use LinkedIn, Internshala, AngelList, company career pages
3. Network with alumni and attend career fairs
4. Build strong GitHub profile with projects
5. Prepare for technical interviews

**Don't give up**: Apply to multiple companies and keep learning!""",

            'default': """I'd be happy to help you with that! While my AI features are currently limited, I can provide guidance on:

**Technical Topics**: Programming concepts, algorithms, frameworks, databases, and more.

**Career Support**: Career paths, skill development, resume tips, interview prep, and job market insights.

Could you please rephrase your question or ask about a specific topic? I'll do my best to assist you!"""
        }
        
        # Match keywords
        if any(word in message_lower for word in ['skill', 'learn', 'technology', 'programming']):
            response = responses['skills']
        elif any(word in message_lower for word in ['interview', 'prepare', 'preparation', 'hiring', 'placement']):
            response = responses['interview']
        elif any(word in message_lower for word in ['resume', 'cv', 'portfolio']):
            response = responses['resume']
        elif any(word in message_lower for word in ['project', 'build', 'create', 'idea']):
            response = responses['project']
        elif any(word in message_lower for word in ['internship', 'job', 'apply', 'company']):
            response = responses['internship']
        else:
            response = responses['default']
        
        return {
            'success': True,
            'response': response,
            'source': 'rules'
        }

ai_mentor = AIMentor()
