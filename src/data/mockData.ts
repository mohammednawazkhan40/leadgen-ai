import { Lead, Project, OutreachCampaign, Integration, TeamMember, User } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Morgan',
  email: 'alex@leadgen.ai',
  avatar: '',
  role: 'admin',
  company: 'Nexus AI Solutions',
  createdAt: '2024-01-15',
};

export const teamMembers: TeamMember[] = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex@leadgen.ai', avatar: '', role: 'admin' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@leadgen.ai', avatar: '', role: 'manager' },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus@leadgen.ai', avatar: '', role: 'user' },
  { id: 'u4', name: 'Emily Rodriguez', email: 'emily@leadgen.ai', avatar: '', role: 'user' },
];

export const leads: Lead[] = [
  {
    id: 'l1', title: 'AI Agent Developer for Customer Support Automation',
    company: 'TechFlow Inc.', contactName: 'James Mitchell', contactTitle: 'VP of Engineering',
    description: 'We are looking for an experienced AI agent developer to build a conversational AI system that handles customer support queries. The system should integrate with our existing CRM and provide intelligent routing, sentiment analysis, and automated responses. Must have experience with LLMs, RAG architecture, and production deployment.',
    excerpt: 'Looking for an AI agent developer to build a conversational AI system for customer support automation with CRM integration...',
    skills: ['AI Agents', 'LLMs', 'RAG', 'Python', 'LangChain', 'CRM Integration'],
    location: 'San Francisco, CA', remoteType: 'hybrid', projectType: 'contract',
    budgetMin: 75000, budgetMax: 120000, postedDate: '2026-08-10', foundDate: '2026-08-11',
    leadScore: 92, intentScore: 95, budgetConfidence: 85, urgencyScore: 88, technicalFit: 94,
    scoreReasons: ['High intent signals in post', 'Budget range matches our services', 'Urgent timeline mentioned', 'Perfect technical fit with our team capabilities'],
    source: 'LinkedIn', sourceUrl: 'https://linkedin.com', status: 'qualified', aiCategory: 'AI Agents',
    owner: teamMembers[0], tags: ['high-priority', 'enterprise', 'ai-agents'],
    notes: [{ id: 'n1', content: 'James mentioned they need this done by Q4. Budget is flexible for the right candidate.', author: 'Alex Morgan', createdAt: '2026-08-12' }],
    activities: [{ id: 'a1', type: 'discovery', description: 'Lead discovered via LinkedIn API sync', user: 'System', timestamp: '2026-08-11T10:00:00Z' }, { id: 'a2', type: 'qualified', description: 'Lead qualified based on AI scoring', user: 'System', timestamp: '2026-08-11T10:05:00Z' }],
    summary: 'TechFlow Inc. is seeking an AI agent developer for a customer support automation project. The project involves building a conversational AI system with CRM integration, sentiment analysis, and intelligent routing. Budget is $75K-$120K with a hybrid work arrangement in San Francisco.',
  },
  {
    id: 'l2', title: 'LLM Engineer - Enterprise Document Processing',
    company: 'DataVerse Analytics', contactName: 'Priya Patel', contactTitle: 'CTO',
    description: 'Seeking a senior LLM engineer to design and implement an enterprise document processing pipeline using large language models. The system should handle PDFs, spreadsheets, and emails, extracting structured data with high accuracy. Experience with fine-tuning, prompt engineering, and RAG systems required.',
    excerpt: 'Senior LLM engineer needed for enterprise document processing pipeline using large language models and RAG systems...',
    skills: ['LLMs', 'RAG', 'NLP', 'Python', 'Fine-tuning', 'Document AI'],
    location: 'New York, NY', remoteType: 'remote', projectType: 'full_time',
    budgetMin: 150000, budgetMax: 200000, postedDate: '2026-08-08', foundDate: '2026-08-09',
    leadScore: 87, intentScore: 82, budgetConfidence: 90, urgencyScore: 75, technicalFit: 90,
    scoreReasons: ['Strong budget allocation', 'Remote-friendly role', 'Good technical alignment', 'Stable enterprise client'],
    source: 'LinkedIn', status: 'reviewing', aiCategory: 'LLMs',
    owner: teamMembers[1], tags: ['enterprise', 'llm', 'full-time'],
    notes: [], activities: [{ id: 'a3', type: 'discovery', description: 'Lead discovered via LinkedIn', user: 'System', timestamp: '2026-08-09T08:00:00Z' }],
    summary: 'DataVerse Analytics needs a senior LLM engineer for an enterprise document processing pipeline. Full-time role, remote-friendly, $150K-$200K compensation. Requires expertise in fine-tuning, prompt engineering, and RAG systems.',
  },
  {
    id: 'l3', title: 'RAG Chatbot Development for Legal Tech Startup',
    company: 'LexAI Labs', contactName: 'David Kim', contactTitle: 'Founder & CEO',
    description: 'Building a RAG-powered chatbot for legal research and document analysis. Need someone who can architect the retrieval system, implement vector search, and create an intuitive conversational interface. Startup environment, equity available.',
    excerpt: 'RAG chatbot for legal research and document analysis. Startup environment with equity compensation available...',
    skills: ['RAG', 'Vector Search', 'LangChain', 'OpenAI', 'TypeScript', 'PostgreSQL'],
    location: 'Austin, TX', remoteType: 'remote', projectType: 'freelance',
    budgetMin: 40000, budgetMax: 65000, postedDate: '2026-08-12', foundDate: '2026-08-12',
    leadScore: 78, intentScore: 90, budgetConfidence: 60, urgencyScore: 82, technicalFit: 88,
    scoreReasons: ['High urgency from founder', 'Perfect RAG expertise match', 'Lower budget but equity upside', 'Quick decision timeline'],
    source: 'LinkedIn', status: 'new', aiCategory: 'RAG',
    tags: ['startup', 'rag', 'legal-tech'],
    notes: [], activities: [{ id: 'a4', type: 'discovery', description: 'Lead discovered', user: 'System', timestamp: '2026-08-12T14:00:00Z' }],
    summary: 'LexAI Labs, a legal tech startup, is seeking a RAG chatbot developer for legal research and document analysis. Freelance project, $40K-$65K plus equity. Remote-first, fast-paced startup environment.',
  },
  {
    id: 'l4', title: 'AI Automation Consultant for Manufacturing Process',
    company: 'Industrial Dynamics Corp', contactName: 'Robert Chen', contactTitle: 'Director of Innovation',
    description: 'Need an AI automation consultant to evaluate and implement AI-driven process automation for our manufacturing lines. Project includes computer vision for quality control, predictive maintenance, and supply chain optimization. Must have manufacturing domain experience.',
    excerpt: 'AI automation consultant for manufacturing: computer vision quality control, predictive maintenance, supply chain optimization...',
    skills: ['AI Automation', 'Computer Vision', 'Predictive Maintenance', 'IoT', 'Python', 'TensorFlow'],
    location: 'Detroit, MI', remoteType: 'onsite', projectType: 'consulting',
    budgetMin: 100000, budgetMax: 180000, postedDate: '2026-08-05', foundDate: '2026-08-06',
    leadScore: 85, intentScore: 78, budgetConfidence: 92, urgencyScore: 70, technicalFit: 82,
    scoreReasons: ['Large budget allocation', 'Onsite requirement limits competition', 'Strong company profile', 'Good but not perfect technical fit'],
    source: 'LinkedIn', status: 'contacted', aiCategory: 'AI Automation',
    owner: teamMembers[2], tags: ['manufacturing', 'consulting', 'computer-vision'],
    notes: [{ id: 'n2', content: 'Sent initial outreach email. Robert is traveling this week but interested in a call next Tuesday.', author: 'Marcus Johnson', createdAt: '2026-08-10' }],
    activities: [{ id: 'a5', type: 'outreach', description: 'Initial outreach email sent', user: 'Marcus Johnson', timestamp: '2026-08-10T09:00:00Z' }],
    summary: 'Industrial Dynamics Corp needs an AI automation consultant for manufacturing process improvement. $100K-$180K consulting engagement, onsite in Detroit. Computer vision, predictive maintenance, and supply chain optimization.',
  },
  {
    id: 'l5', title: 'Machine Learning Engineer - Fraud Detection Platform',
    company: 'SecurePay Financial', contactName: 'Lisa Wang', contactTitle: 'Head of Data Science',
    description: 'Join our data science team to build and deploy machine learning models for real-time fraud detection. Need experience with streaming data, feature engineering, model monitoring, and A/B testing. Fintech experience preferred.',
    excerpt: 'ML engineer for real-time fraud detection: streaming data, feature engineering, model monitoring in fintech environment...',
    skills: ['Machine Learning', 'Python', 'Spark', 'Kafka', 'MLOps', 'AWS'],
    location: 'Chicago, IL', remoteType: 'hybrid', projectType: 'full_time',
    budgetMin: 140000, budgetMax: 175000, postedDate: '2026-08-11', foundDate: '2026-08-11',
    leadScore: 71, intentScore: 65, budgetConfidence: 88, urgencyScore: 60, technicalFit: 75,
    scoreReasons: ['Good budget', 'Less urgent timeline', 'Partial technical fit', 'Fintech domain knowledge beneficial'],
    source: 'LinkedIn', status: 'reviewing', aiCategory: 'Machine Learning',
    owner: teamMembers[0], tags: ['fintech', 'ml', 'fraud-detection'],
    notes: [], activities: [{ id: 'a6', type: 'discovery', description: 'Lead discovered', user: 'System', timestamp: '2026-08-11T16:00:00Z' }],
    summary: 'SecurePay Financial is hiring a ML engineer for real-time fraud detection. $140K-$175K, hybrid in Chicago. Requires streaming data experience, MLOps, and fintech background preferred.',
  },
  {
    id: 'l6', title: 'Chatbot Development for E-commerce Platform',
    company: 'ShopSmart Global', contactName: 'Maria Garcia', contactTitle: 'VP of Digital Experience',
    description: 'Develop an AI-powered shopping assistant chatbot that provides personalized product recommendations, handles customer queries, and integrates with our e-commerce platform. Must support multiple languages and handle high traffic volumes.',
    excerpt: 'AI shopping assistant chatbot: personalized recommendations, multi-language support, high-traffic e-commerce integration...',
    skills: ['Chatbot Development', 'NLP', 'Python', 'React', 'Microservices', 'Multi-language'],
    location: 'Seattle, WA', remoteType: 'remote', projectType: 'contract',
    budgetMin: 60000, budgetMax: 90000, postedDate: '2026-08-13', foundDate: '2026-08-13',
    leadScore: 82, intentScore: 88, budgetConfidence: 78, urgencyScore: 85, technicalFit: 86,
    scoreReasons: ['High intent from VP', 'Remote project attractive', 'Good technical alignment', 'Moderate budget range'],
    source: 'LinkedIn', status: 'new', aiCategory: 'Chatbot Development',
    tags: ['e-commerce', 'chatbot', 'multilingual'],
    notes: [], activities: [{ id: 'a7', type: 'discovery', description: 'Lead discovered via LinkedIn sync', user: 'System', timestamp: '2026-08-13T11:00:00Z' }],
    summary: 'ShopSmart Global needs an AI shopping assistant chatbot with personalized recommendations and multi-language support. Contract, $60K-$90K, fully remote. High-traffic e-commerce integration required.',
  },
  {
    id: 'l7', title: 'AI Agent Orchestration Platform Build',
    company: 'Autonomous Systems Ltd', contactName: 'Tom Bradley', contactTitle: 'Chief Architect',
    description: 'Design and build an AI agent orchestration platform that can manage multiple AI agents working in parallel. Need deep expertise in agent frameworks, tool use, memory management, and multi-agent coordination patterns.',
    excerpt: 'Build an AI agent orchestration platform for managing parallel agents with tool use, memory, and coordination...',
    skills: ['AI Agents', 'Agent Frameworks', 'Multi-Agent Systems', 'Python', 'System Design', 'Distributed Systems'],
    location: 'London, UK', remoteType: 'remote', projectType: 'consulting',
    budgetMin: 120000, budgetMax: 200000, postedDate: '2026-08-07', foundDate: '2026-08-08',
    leadScore: 94, intentScore: 92, budgetConfidence: 88, urgencyScore: 90, technicalFit: 96,
    scoreReasons: ['Top-tier budget', 'Perfect AI agent specialization match', 'High urgency', 'Excellent technical alignment'],
    source: 'LinkedIn', status: 'qualified', aiCategory: 'AI Agents',
    owner: teamMembers[0], tags: ['high-priority', 'enterprise', 'ai-agents', 'architecture'],
    notes: [{ id: 'n3', content: 'This is a perfect fit for our team. Tom is building a next-gen platform and needs our specific agent orchestration expertise.', author: 'Alex Morgan', createdAt: '2026-08-09' }],
    activities: [{ id: 'a8', type: 'qualified', description: 'Lead qualified as high-priority match', user: 'Alex Morgan', timestamp: '2026-08-09T14:00:00Z' }],
    summary: 'Autonomous Systems Ltd is building an AI agent orchestration platform. Consulting engagement, $120K-$200K, remote from London. Seeking deep expertise in multi-agent systems and orchestration patterns.',
  },
  {
    id: 'l8', title: 'NLP Specialist for Healthcare Records Digitization',
    company: 'MedRecord AI', contactName: 'Dr. Amanda Foster', contactTitle: 'Chief Medical Informatics Officer',
    description: 'Need an NLP specialist to develop models that can extract structured medical information from unstructured clinical notes. Must comply with HIPAA regulations and work with medical ontologies like SNOMED CT and ICD-10.',
    excerpt: 'NLP specialist for healthcare records digitization. HIPAA-compliant medical information extraction from clinical notes...',
    skills: ['NLP', 'Healthcare AI', 'Python', 'HIPAA', 'Medical Ontologies', 'BERT'],
    location: 'Boston, MA', remoteType: 'hybrid', projectType: 'contract',
    budgetMin: 85000, budgetMax: 130000, postedDate: '2026-08-09', foundDate: '2026-08-10',
    leadScore: 76, intentScore: 72, budgetConfidence: 82, urgencyScore: 68, technicalFit: 70,
    scoreReasons: ['Good budget', 'Specialized domain requirements', 'HIPAA expertise needed', 'Moderate urgency'],
    source: 'LinkedIn', status: 'reviewing', aiCategory: 'NLP',
    tags: ['healthcare', 'nlp', 'hipaa'],
    notes: [], activities: [{ id: 'a9', type: 'discovery', description: 'Lead discovered', user: 'System', timestamp: '2026-08-10T09:00:00Z' }],
    summary: 'MedRecord AI needs an NLP specialist for healthcare records digitization. HIPAA-compliant medical information extraction. Contract, $85K-$130K, hybrid in Boston.',
  },
];

export const projects: Project[] = [
  { id: 'p1', name: 'TechFlow AI Agent System', company: 'TechFlow Inc.', value: 95000, priority: 'high', status: 'qualified', owner: teamMembers[0], lead: leads[0], nextFollowUp: '2026-08-20', tasks: [{ id: 't1', title: 'Prepare technical proposal', completed: false, dueDate: '2026-08-19' }, { id: 't2', title: 'Schedule discovery call', completed: true, dueDate: '2026-08-18' }], communications: [{ id: 'c1', type: 'email', subject: 'Re: AI Agent Development', content: 'Thanks for reaching out. We are very interested in your capabilities. Can we schedule a call?', date: '2026-08-13', direction: 'inbound' }] },
  { id: 'p2', name: 'Autonomous Systems Orchestration', company: 'Autonomous Systems Ltd', value: 160000, priority: 'urgent', status: 'contacted', owner: teamMembers[0], lead: leads[6], nextFollowUp: '2026-08-19', tasks: [{ id: 't3', title: 'Send portfolio examples', completed: true, dueDate: '2026-08-15' }, { id: 't4', title: 'Draft proposal document', completed: false, dueDate: '2026-08-20' }] },
  { id: 'p3', name: 'Industrial Dynamics AI Automation', company: 'Industrial Dynamics Corp', value: 140000, priority: 'medium', status: 'discovery_call', owner: teamMembers[2], lead: leads[3], nextFollowUp: '2026-08-22' },
  { id: 'p4', name: 'ShopSmart Chatbot', company: 'ShopSmart Global', value: 75000, priority: 'medium', status: 'reviewing', owner: teamMembers[1], lead: leads[5] },
  { id: 'p5', name: 'DataVerse Document Processing', company: 'DataVerse Analytics', value: 175000, priority: 'high', status: 'new', owner: teamMembers[1], lead: leads[1] },
  { id: 'p6', name: 'SecurePay Fraud Detection', company: 'SecurePay Financial', value: 157500, priority: 'medium', status: 'proposal_sent', owner: teamMembers[0], lead: leads[4], nextFollowUp: '2026-08-25' },
];

export const outreachCampaigns: OutreachCampaign[] = [
  { id: 'oc1', name: 'AI Agent Development Outreach', category: 'AI Agents', status: 'active', template: 'Hi {{first_name}},\n\nI noticed your post about needing an AI agent developer for {{project_title}}. At {{company}}, we specialize in building production-grade AI agent systems with deep expertise in orchestration and tool use.\n\nWe recently delivered a similar project that reduced customer support costs by 60% while improving response quality.\n\nWould you be open to a quick 15-minute call to discuss how we could help?\n\nBest,\n{{sender_name}}', sent: 47, opened: 32, replied: 14, bookedCall: 8, unsubscribed: 1, createdAt: '2026-08-01', lastUpdated: '2026-08-14' },
  { id: 'oc2', name: 'LLM/RAG Development Outreach', category: 'LLMs & RAG', status: 'active', template: 'Hi {{first_name}},\n\nSaw your search for {{relevant_skill}} expertise for {{project_title}}. Our team has built RAG systems processing millions of documents with 95%+ accuracy.\n\nHappy to share relevant case studies.\n\n{{sender_name}}', sent: 35, opened: 24, replied: 10, bookedCall: 5, unsubscribed: 0, createdAt: '2026-08-05', lastUpdated: '2026-08-14' },
  { id: 'oc3', name: 'AI Automation Consulting', category: 'AI Automation', status: 'paused', template: 'Hi {{first_name}},\n\nYour project {{project_title}} caught our attention. We help organizations automate complex workflows using cutting-edge AI.\n\nWould love to learn more about your specific needs.\n\n{{sender_name}}', sent: 22, opened: 15, replied: 6, bookedCall: 3, unsubscribed: 1, createdAt: '2026-08-08', lastUpdated: '2026-08-12' },
];

export const integrations: Integration[] = [
  { id: 'int1', name: 'LinkedIn API', type: 'linkedin', status: 'connected', lastSync: '2026-08-14T08:00:00Z', syncFrequency: 'Every 6 hours', permissions: ['Read profile data', 'Read job postings', 'Read company data'], errorHistory: [] },
  { id: 'int2', name: 'CSV Import', type: 'csv', status: 'connected', lastSync: '2026-08-13T14:30:00Z', syncFrequency: 'Manual', permissions: ['Import lead data'] },
  { id: 'int3', name: 'Webhook Integration', type: 'webhook', status: 'disconnected' },
  { id: 'int4', name: 'Email Integration', type: 'email', status: 'error', lastSync: '2026-08-12T10:00:00Z', errorHistory: [{ date: '2026-08-12', message: 'Authentication token expired. Please reconnect.' }] },
];

export const kpiData = {
  newLeadsThisWeek: 24,
  qualifiedOpportunities: 12,
  estimatedPipelineValue: 1850000,
  outreachReplyRate: 28.5,
};

export const weeklyLeadData = [
  { week: 'Jul 21', leads: 12, qualified: 4 }, { week: 'Jul 28', leads: 18, qualified: 6 },
  { week: 'Aug 4', leads: 15, qualified: 8 }, { week: 'Aug 11', leads: 24, qualified: 12 },
];

export const categoryData = [
  { name: 'AI Agents', value: 35 }, { name: 'LLMs', value: 25 }, { name: 'RAG', value: 20 },
  { name: 'AI Automation', value: 15 }, { name: 'Machine Learning', value: 12 }, { name: 'Chatbot Dev', value: 18 },
];

export const conversionData = [
  { stage: 'Discovered', count: 156 }, { stage: 'Qualified', count: 84 },
  { stage: 'Contacted', count: 52 }, { stage: 'Discovery Call', count: 28 },
  { stage: 'Proposal Sent', count: 15 }, { stage: 'Won', count: 8 },
];

export const teamPerformance = [
  { name: 'Alex M.', leads: 32, qualified: 18, won: 4, pipeline: 620000 },
  { name: 'Sarah C.', leads: 28, qualified: 14, won: 2, pipeline: 445000 },
  { name: 'Marcus J.', leads: 22, qualified: 10, won: 1, pipeline: 380000 },
  { name: 'Emily R.', leads: 18, qualified: 8, won: 1, pipeline: 405000 },
];

export const keywordPerformance = [
  { keyword: 'AI agent developer', leads: 42, conversion: 34 }, { keyword: 'LLM engineer', leads: 38, conversion: 29 },
  { keyword: 'RAG development', leads: 31, conversion: 38 }, { keyword: 'AI automation', leads: 28, conversion: 25 },
  { keyword: 'machine learning', leads: 25, conversion: 20 }, { keyword: 'chatbot development', leads: 22, conversion: 32 },
];

export const pipelineByCategory = [
  { category: 'AI Agents', value: 620000 }, { category: 'LLMs', value: 445000 },
  { category: 'RAG', value: 280000 }, { category: 'AI Automation', value: 310000 },
  { category: 'Machine Learning', value: 195000 }, { category: 'Chatbot Dev', value: 180000 },
];
