"""
Career Data Processor - Optimized Version
Generates careers_data.json with career-skill mappings.
"""

import pandas as pd
import json
from collections import Counter, defaultdict
import os

# Career categories and their keywords
CAREER_MAPPINGS = {
    'Software Developer': ['software developer', 'software engineer', 'application developer', 'full stack', 'backend developer', 'frontend developer', 'web developer'],
    'Data Scientist': ['data scientist', 'machine learning engineer', 'ml engineer', 'ai engineer'],
    'Data Analyst': ['data analyst', 'business analyst', 'analytics analyst', 'bi analyst'],
    'Data Engineer': ['data engineer', 'etl developer', 'big data engineer'],
    'DevOps Engineer': ['devops', 'site reliability', 'sre', 'platform engineer'],
    'Cloud Engineer': ['cloud engineer', 'cloud architect', 'aws architect'],
    'Product Manager': ['product manager', 'product owner', 'technical product manager'],
    'UX Designer': ['ux designer', 'ui designer', 'ux/ui', 'user experience designer'],
    'Mobile Developer': ['mobile developer', 'ios developer', 'android developer'],
    'Security Engineer': ['security engineer', 'cybersecurity', 'information security'],
    'QA Engineer': ['qa engineer', 'quality assurance', 'test engineer', 'sdet'],
    'Database Administrator': ['database administrator', 'dba', 'database engineer'],
    'Network Engineer': ['network engineer', 'network administrator'],
    'Project Manager': ['project manager', 'technical project manager', 'it project manager', 'scrum master'],
    'AI/ML Engineer': ['ai engineer', 'machine learning', 'nlp engineer', 'deep learning engineer'],
    'Blockchain Developer': ['blockchain developer', 'smart contract', 'web3 developer'],
    'Game Developer': ['game developer', 'unity developer', 'game programmer'],
    'Embedded Systems Engineer': ['embedded', 'firmware engineer', 'iot developer']
}

CATEGORY_GROUPS = {
    'Development': ['Software Developer', 'Mobile Developer', 'Game Developer', 'Blockchain Developer', 'Embedded Systems Engineer'],
    'Data & AI': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'AI/ML Engineer'],
    'Infrastructure': ['DevOps Engineer', 'Cloud Engineer', 'Network Engineer', 'Database Administrator'],
    'Security': ['Security Engineer'],
    'Quality': ['QA Engineer'],
    'Design': ['UX Designer'],
    'Management': ['Product Manager', 'Project Manager']
}

SKILLS_DATABASE = {
    'Software Developer': {
        'required': ['Python', 'JavaScript', 'Java', 'SQL', 'Git', 'React', 'Node.js', 'Docker'],
        'preferred': ['TypeScript', 'AWS', 'Microservices', 'GraphQL', 'MongoDB', 'Redis']
    },
    'Data Scientist': {
        'required': ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics', 'Pandas', 'R', 'Deep Learning'],
        'preferred': ['MLflow', 'AWS SageMaker', 'NLP', 'Computer Vision', 'A/B Testing', 'Spark']
    },
    'Data Analyst': {
        'required': ['SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Statistics', 'Data Visualization'],
        'preferred': ['R', 'Google Analytics', 'Looker', 'A/B Testing', 'Storytelling']
    },
    'Data Engineer': {
        'required': ['Python', 'SQL', 'Apache Spark', 'AWS', 'Airflow', 'Kafka', 'ETL', 'Data Warehousing'],
        'preferred': ['Snowflake', 'dbt', 'Databricks', 'Azure', 'Redshift']
    },
    'DevOps Engineer': {
        'required': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Linux', 'CI/CD', 'Python'],
        'preferred': ['Ansible', 'ArgoCD', 'Prometheus', 'Grafana', 'GitLab CI']
    },
    'Cloud Engineer': {
        'required': ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'Linux', 'Networking'],
        'preferred': ['Serverless', 'CDN', 'Security', 'Cost Optimization']
    },
    'Product Manager': {
        'required': ['Agile', 'Scrum', 'JIRA', 'Product Strategy', 'Data Analysis', 'User Research', 'Roadmapping'],
        'preferred': ['SQL', 'Figma', 'A/B Testing', 'Product Analytics']
    },
    'UX Designer': {
        'required': ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'CSS', 'HTML', 'Design Thinking'],
        'preferred': ['Illustration', 'Animation', 'Accessibility', 'Design Systems']
    },
    'Mobile Developer': {
        'required': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'JavaScript', 'REST APIs'],
        'preferred': ['Firebase', 'GraphQL', 'App Store Optimization']
    },
    'Security Engineer': {
        'required': ['Network Security', 'Penetration Testing', 'SIEM', 'Python', 'Linux', 'Cryptography', 'Firewalls'],
        'preferred': ['Cloud Security', 'SOC 2', 'Bug Bounty', 'Threat Modeling']
    },
    'QA Engineer': {
        'required': ['Selenium', 'Python', 'Java', 'API Testing', 'Automation', 'JIRA', 'Agile', 'Test Planning'],
        'preferred': ['Cypress', 'Performance Testing', 'Security Testing']
    },
    'Database Administrator': {
        'required': ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Oracle', 'Performance Tuning', 'Backup', 'Linux'],
        'preferred': ['Cloud Databases', 'NoSQL', 'Data Modeling']
    },
    'Network Engineer': {
        'required': ['Cisco', 'Networking', 'TCP/IP', 'Firewalls', 'VPN', 'Linux', 'Routing', 'Switching'],
        'preferred': ['SDN', 'Cloud Networking', 'Automation']
    },
    'Project Manager': {
        'required': ['Agile', 'Scrum', 'JIRA', 'MS Project', 'Stakeholder Management', 'Risk Management', 'Budgeting'],
        'preferred': ['PMP', 'SAFe', 'Confluence', 'Budget Management']
    },
    'AI/ML Engineer': {
        'required': ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Mathematics'],
        'preferred': ['Kubernetes', 'AWS', 'Model Deployment', 'AutoML']
    },
    'Blockchain Developer': {
        'required': ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'JavaScript', 'Cryptography', 'DeFi'],
        'preferred': ['Rust', 'Layer 2', 'NFT', 'Cross-chain']
    },
    'Game Developer': {
        'required': ['Unity', 'C#', 'Unreal Engine', 'C++', '3D Graphics', 'Physics', 'Game Design', 'Animation'],
        'preferred': ['VR/AR', 'Networking', 'AI', 'Shaders']
    },
    'Embedded Systems Engineer': {
        'required': ['C', 'C++', 'Embedded Linux', 'RTOS', 'Microcontrollers', 'Hardware', 'IoT', 'Assembly'],
        'preferred': ['PCB Design', 'Wireless', 'Security']
    }
}

DESCRIPTIONS = {
    'Software Developer': 'Design, develop, and maintain software applications using various programming languages and frameworks.',
    'Data Scientist': 'Apply machine learning and statistical analysis to extract insights from data and build predictive models.',
    'Data Analyst': 'Analyze data to identify trends, create reports, and support data-driven business decisions.',
    'Data Engineer': 'Build and maintain data pipelines, warehouses, and infrastructure for data processing at scale.',
    'DevOps Engineer': 'Bridge development and operations through automation, CI/CD pipelines, and infrastructure management.',
    'Cloud Engineer': 'Design and manage cloud infrastructure, ensuring scalability, security, and cost optimization.',
    'Product Manager': 'Define product vision, prioritize features, and collaborate with teams to deliver user value.',
    'UX Designer': 'Create intuitive user experiences through research, wireframing, and visual design.',
    'Mobile Developer': 'Build native or cross-platform mobile applications for iOS and Android platforms.',
    'Security Engineer': 'Protect systems and data through security assessments, monitoring, and implementing safeguards.',
    'QA Engineer': 'Ensure software quality through manual and automated testing, bug tracking, and process improvement.',
    'Database Administrator': 'Manage database systems, optimize performance, and ensure data integrity and availability.',
    'Network Engineer': 'Design, implement, and maintain network infrastructure for optimal performance and security.',
    'Project Manager': 'Lead project planning, execution, and delivery while managing stakeholders and resources.',
    'AI/ML Engineer': 'Build and deploy machine learning models and AI systems for production applications.',
    'Blockchain Developer': 'Develop decentralized applications and smart contracts on blockchain platforms.',
    'Game Developer': 'Create interactive games using game engines, programming, and creative design skills.',
    'Embedded Systems Engineer': 'Develop software for embedded devices, IoT systems, and hardware interfaces.'
}

GROWTH_RATES = {
    'AI/ML Engineer': '+35%', 'Data Engineer': '+28%', 'Cloud Engineer': '+25%', 'Security Engineer': '+22%',
    'Data Scientist': '+20%', 'DevOps Engineer': '+18%', 'Blockchain Developer': '+15%', 'Mobile Developer': '+12%',
    'Software Developer': '+10%', 'Product Manager': '+10%', 'UX Designer': '+8%', 'Data Analyst': '+8%',
    'QA Engineer': '+5%', 'Project Manager': '+5%', 'Database Administrator': '+3%', 'Network Engineer': '+3%',
    'Game Developer': '+2%', 'Embedded Systems Engineer': '+5%'
}


def get_category(career):
    for category, careers in CATEGORY_GROUPS.items():
        if career in careers:
            return category
    return 'Other'


def process_data():
    print("=" * 60)
    print("Career Data Processor - Processing LinkedIn Data")
    print("=" * 60)
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    # Find CSV files
    postings_path = None
    for path in [root_dir, script_dir, os.getcwd()]:
        p = os.path.join(path, 'postings.csv')
        if os.path.exists(p):
            postings_path = p
            break
    
    career_counts = defaultdict(int)
    
    if postings_path:
        print(f"\nProcessing: {postings_path}")
        
        # Process in chunks to save memory
        chunk_size = 10000
        for chunk in pd.read_csv(postings_path, chunksize=chunk_size, usecols=['title']):
            for title in chunk['title'].dropna():
                title_lower = title.lower()
                for career, keywords in CAREER_MAPPINGS.items():
                    for keyword in keywords:
                        if keyword in title_lower:
                            career_counts[career] += 1
                            break
                    else:
                        continue
                    break
        
        print(f"Classified jobs into {len(career_counts)} career categories")
    else:
        print("\nNo postings.csv found, using default job counts")
        career_counts = {
            'Software Developer': 25000, 'Data Scientist': 4500, 'Data Analyst': 8000, 'Data Engineer': 3500,
            'DevOps Engineer': 3000, 'Cloud Engineer': 2500, 'Product Manager': 5000, 'UX Designer': 2000,
            'Mobile Developer': 1500, 'Security Engineer': 1200, 'QA Engineer': 2200, 'Database Administrator': 800,
            'Network Engineer': 600, 'Project Manager': 4000, 'AI/ML Engineer': 2800, 'Blockchain Developer': 400,
            'Game Developer': 300, 'Embedded Systems Engineer': 500
        }
    
    # Build careers data
    careers_data = []
    for career, skills in SKILLS_DATABASE.items():
        career_data = {
            'id': len(careers_data) + 1,
            'title': career,
            'category': get_category(career),
            'description': DESCRIPTIONS.get(career, ''),
            'required_skills': skills['required'],
            'preferred_skills': skills['preferred'],
            'job_count': career_counts.get(career, 100),
            'min_cgpa': 6.5,
            'growth_rate': GROWTH_RATES.get(career, '+5%')
        }
        careers_data.append(career_data)
    
    # Sort by job count
    careers_data.sort(key=lambda x: x['job_count'], reverse=True)
    for i, career in enumerate(careers_data, 1):
        career['id'] = i
    
    # Save to JSON
    output_path = os.path.join(script_dir, 'careers_data.json')
    with open(output_path, 'w') as f:
        json.dump(careers_data, f, indent=2)
    
    print(f"\n{'=' * 60}")
    print(f"SUCCESS! Generated careers_data.json")
    print(f"Output: {output_path}")
    print(f"Careers: {len(careers_data)}")
    print(f"{'=' * 60}")
    
    # Summary
    print("\nTop Careers by Job Count:")
    for career in careers_data[:6]:
        print(f"  {career['title']}: {career['job_count']:,} jobs")
        print(f"    Skills: {', '.join(career['required_skills'][:4])}...")
    
    return careers_data


if __name__ == '__main__':
    process_data()
