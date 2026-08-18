import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { searchLeads } from '../services/api';
import { formatCurrency, formatDate, getScoreColor } from '../utils/helpers';
import { Search, Filter, Grid, List, MapPin, Calendar, DollarSign, Bookmark, Eye, Plus, X, Briefcase, Loader2, Sparkles } from 'lucide-react';
import type { Lead } from '../types';

const aiCategories = ['All', 'AI Agents', 'LLMs', 'RAG', 'AI Automation', 'Machine Learning', 'Chatbot Development', 'NLP'];
const industries = ['All', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education'];
const workTypes = ['Any', 'Remote', 'Hybrid', 'Onsite'];

const sampleLeads: Array<Omit<Lead, 'id' | 'status' | 'saved' | 'notes' | 'activities' | 'scoreOverall' | 'scoreIntent' | 'scoreBudget' | 'scoreUrgency' | 'scoreTechnical' | 'tags'>> = [
  { title: 'AI Agent Developer for Customer Support', company: 'TechFlow Inc', contactName: 'Sarah Chen', contactTitle: 'VP of Engineering', description: 'Looking for an experienced AI agent developer to build an autonomous customer support system using LLMs. Must have experience with tool-calling, memory systems, and production deployment. The system should handle 10K+ daily queries with sub-second response times.', skills: ['AI Agents', 'LangChain', 'Python', 'RAG', 'OpenAI'], location: 'San Francisco, CA', remoteType: 'remote', projectType: 'contract', budgetMin: 80000, budgetMax: 120000, postedDate: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'LinkedIn', aiCategory: 'AI Agents', contactEmail: 'sarah@techflow.io' },
  { title: 'LLM Integration for Enterprise Search', company: 'DataVault Corp', contactName: 'James Wilson', contactTitle: 'CTO', description: 'Enterprise search platform needs LLM integration to provide intelligent document retrieval and summarization. Current system processes 5M+ documents. Need RAG architecture with vector embeddings and real-time indexing.', skills: ['LLMs', 'RAG', 'Vector Databases', 'Elasticsearch', 'Python'], location: 'New York, NY', remoteType: 'hybrid', projectType: 'contract', budgetMin: 150000, budgetMax: 250000, postedDate: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'LinkedIn', aiCategory: 'RAG' },
  { title: 'NLP Pipeline for Healthcare Analytics', company: 'MedTech Solutions', contactName: 'Dr. Priya Patel', contactTitle: 'Chief Data Officer', description: 'Build NLP pipeline to extract insights from clinical notes and medical records. Must comply with HIPAA. Processing unstructured text from 500K+ patient records to identify treatment patterns and outcomes.', skills: ['NLP', 'Python', 'spaCy', 'BERT', 'Healthcare AI'], location: 'Boston, MA', remoteType: 'remote', projectType: 'contract', budgetMin: 200000, budgetMax: 350000, postedDate: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'LinkedIn', aiCategory: 'NLP' },
  { title: 'Chatbot Development for E-Commerce', company: 'ShopSmart', contactName: 'Mike Rodriguez', contactTitle: 'Head of Product', description: 'Need a conversational AI chatbot for e-commerce that can handle product recommendations, order tracking, and returns. Must integrate with Shopify and support multi-language.', skills: ['Chatbot Development', 'NLP', 'Python', 'Shopify API', 'Rasa'], location: 'Austin, TX', remoteType: 'remote', projectType: 'freelance', budgetMin: 40000, budgetMax: 60000, postedDate: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'LinkedIn', aiCategory: 'Chatbot Development' },
  { title: 'ML Model Deployment Pipeline (MLOps)', company: 'Scale AI', contactName: 'Alex Kim', contactTitle: 'ML Engineering Manager', description: 'Build end-to-end MLOps pipeline for training, deploying, and monitoring ML models at scale. Need experience with Kubernetes, MLflow, and real-time model serving. Models process 1M+ predictions/day.', skills: ['MLOps', 'Kubernetes', 'Docker', 'Python', 'MLflow', 'Terraform'], location: 'San Francisco, CA', remoteType: 'hybrid', projectType: 'contract', budgetMin: 120000, budgetMax: 180000, postedDate: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'LinkedIn', aiCategory: 'Machine Learning' },
  { title: 'AI-Powered Document Processing System', company: 'LegalTech Pro', contactName: 'Emma Thompson', contactTitle: 'CEO', description: 'Develop AI system to automatically parse, classify, and extract key information from legal contracts. Must handle PDFs, scanned documents, and complex table structures with 95%+ accuracy.', skills: ['Computer Vision', 'OCR', 'NLP', 'Python', 'LLMs'], location: 'London, UK', remoteType: 'remote', projectType: 'contract', budgetMin: 90000, budgetMax: 140000, postedDate: new Date(Date.now() - 86400000 * 4).toISOString(), source: 'LinkedIn', aiCategory: 'AI Automation' },
  { title: 'Recommendation Engine for Streaming Platform', company: 'StreamVibe', contactName: 'David Park', contactTitle: 'VP of Engineering', description: 'Build a real-time recommendation engine using collaborative filtering and content-based approaches. Must handle 50M+ users with sub-100ms latency. Experience with embedding models preferred.', skills: ['Machine Learning', 'Python', 'TensorFlow', 'Redis', 'Spark'], location: 'Los Angeles, CA', remoteType: 'hybrid', projectType: 'contract', budgetMin: 130000, budgetMax: 200000, postedDate: new Date(Date.now() - 86400000 * 6).toISOString(), source: 'LinkedIn', aiCategory: 'Machine Learning' },
  { title: 'Autonomous Trading Bot with LLM Analysis', company: 'FinEdge Capital', contactName: 'Robert Chang', contactTitle: 'Managing Director', description: 'Need developer to build autonomous trading system that combines quantitative analysis with LLM-powered market sentiment analysis from news and social media. Must include risk management guardrails.', skills: ['AI Agents', 'LLMs', 'Python', 'FinTech', 'Quantitative Analysis'], location: 'Chicago, IL', remoteType: 'remote', projectType: 'consulting', budgetMin: 200000, budgetMax: 350000, postedDate: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'LinkedIn', aiCategory: 'AI Agents' },
  { title: 'Voice AI Assistant for Call Center', company: 'TelCom Solutions', contactName: 'Lisa Johnson', contactTitle: 'Director of Innovation', description: 'Build voice AI assistant to handle inbound customer calls. Must support real-time speech-to-text, intent recognition, and natural conversation flow. Target: handle 60% of calls without human agent.', skills: ['Voice AI', 'NLP', 'Python', 'Speech Recognition', 'LLMs'], location: 'Dallas, TX', remoteType: 'remote', projectType: 'contract', budgetMin: 100000, budgetMax: 160000, postedDate: new Date(Date.now() - 86400000 * 7).toISOString(), source: 'LinkedIn', aiCategory: 'NLP' },
  { title: 'RAG System for Internal Knowledge Base', company: 'CloudNine SaaS', contactName: 'Tom Anderson', contactTitle: 'Head of Engineering', description: 'Build RAG system for internal documentation search across Confluence, Slack, and Google Drive. Need semantic search, citation tracking, and permission-aware retrieval. 100K+ internal documents.', skills: ['RAG', 'Vector Databases', 'LangChain', 'Python', 'OpenAI'], location: 'Seattle, WA', remoteType: 'remote', projectType: 'contract', budgetMin: 70000, budgetMax: 110000, postedDate: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'LinkedIn', aiCategory: 'RAG' },
  { title: 'Computer Vision for Quality Inspection', company: 'ManufactureAI', contactName: 'Hans Mueller', contactTitle: 'CTO', description: 'Develop computer vision system for automated quality inspection on manufacturing line. Must detect defects with 99.5% accuracy at production speed. Edge deployment required.', skills: ['Computer Vision', 'PyTorch', 'Python', 'Edge AI', 'OpenCV'], location: 'Detroit, MI', remoteType: 'onsite', projectType: 'contract', budgetMin: 85000, budgetMax: 130000, postedDate: new Date(Date.now() - 86400000 * 8).toISOString(), source: 'LinkedIn', aiCategory: 'Machine Learning' },
  { title: 'AI Content Generation Platform', company: 'ContentScale', contactName: 'Nina Williams', contactTitle: 'Product Lead', description: 'Build AI-powered content generation platform that creates blog posts, social media content, and marketing copy. Must support brand voice customization, SEO optimization, and multi-format output.', skills: ['LLMs', 'Python', 'Prompt Engineering', 'FastAPI', 'React'], location: 'Remote', remoteType: 'remote', projectType: 'freelance', budgetMin: 50000, budgetMax: 80000, postedDate: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'LinkedIn', aiCategory: 'LLMs' },
  { title: 'Fraud Detection ML System', company: 'SecurePay', contactName: 'Ahmed Hassan', contactTitle: 'Chief Security Officer', description: 'Build real-time fraud detection system using ensemble ML models. Must process 50K transactions/second with less than 10ms latency. Need explainability features for compliance team.', skills: ['Machine Learning', 'Python', 'XGBoost', 'Kafka', 'Real-time ML'], location: 'Miami, FL', remoteType: 'hybrid', projectType: 'contract', budgetMin: 150000, budgetMax: 220000, postedDate: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'LinkedIn', aiCategory: 'Machine Learning' },
  { title: 'Multi-Agent AI System for Supply Chain', company: 'LogiChain', contactName: 'Rachel Green', contactTitle: 'VP of Operations', description: 'Design multi-agent AI system for supply chain optimization. Agents must handle procurement, inventory management, and logistics routing autonomously. Must integrate with SAP and Oracle.', skills: ['AI Agents', 'Multi-Agent Systems', 'Python', 'Operations Research', 'SAP'], location: 'Atlanta, GA', remoteType: 'hybrid', projectType: 'contract', budgetMin: 180000, budgetMax: 280000, postedDate: new Date(Date.now() - 86400000 * 4).toISOString(), source: 'LinkedIn', aiCategory: 'AI Agents' },
  { title: 'AI Tutoring Platform for Education', company: 'EduAI', contactName: 'Chris Martinez', contactTitle: 'Founder & CEO', description: 'Build adaptive AI tutoring platform that personalizes learning paths for K-12 students. Must include progress tracking, parent dashboard, and curriculum alignment. ASAP timeline.', skills: ['LLMs', 'Python', 'React', 'Education AI', 'Adaptive Learning'], location: 'Denver, CO', remoteType: 'remote', projectType: 'freelance', budgetMin: 60000, budgetMax: 95000, postedDate: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'LinkedIn', aiCategory: 'AI Automation' },
];

export default function LeadDiscovery() {
  const navigate = useNavigate();
  const { leads, projects, addToast, toggleSaveLead, addLeadToProject, createLead } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [serverResults, setServerResults] = useState<Lead[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('Any');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [minScore, setMinScore] = useState('');
  const [projectDropdownLeadId, setProjectDropdownLeadId] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);

  const displayLeads = serverResults !== null ? serverResults : leads;

  const filteredLeads = useMemo(() => {
    let result = [...displayLeads];
    if (serverResults === null && searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.skills.some(s => s.toLowerCase().includes(q)) || l.aiCategory.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'All') result = result.filter(l => l.aiCategory === selectedCategory);
    if (selectedWorkType !== 'Any') result = result.filter(l => l.remoteType === selectedWorkType.toLowerCase());
    if (selectedIndustry !== 'All') result = result.filter(l => l.description.toLowerCase().includes(selectedIndustry.toLowerCase()));
    if (locationFilter) result = result.filter(l => l.location.toLowerCase().includes(locationFilter.toLowerCase()));
    if (budgetMin) result = result.filter(l => (l.budgetMax || 0) >= Number(budgetMin));
    if (budgetMax) result = result.filter(l => (l.budgetMin || 0) <= Number(budgetMax));
    if (minScore) result = result.filter(l => (l.scoreOverall || l.leadScore || 0) >= Number(minScore));
    if (sortBy === 'score') result.sort((a, b) => (b.scoreOverall || b.leadScore || 0) - (a.scoreOverall || a.leadScore || 0));
    else if (sortBy === 'budget') result.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0));
    else if (sortBy === 'date') result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    return result;
  }, [displayLeads, searchQuery, serverResults, selectedCategory, selectedWorkType, selectedIndustry, locationFilter, budgetMin, budgetMax, minScore, sortBy]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    try {
      const results = await searchLeads(user.id, searchQuery);
      setServerResults(results as Lead[]);
    } catch { addToast('error', 'Search failed'); }
    setSearching(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setServerResults(null);
  };

  const handleDiscoverLeads = async () => {
    if (!user) return;
    setDiscovering(true);
    try {
      const shuffled = [...sampleLeads].sort(() => 0.5 - Math.random());
      const batch = shuffled.slice(0, Math.min(10, shuffled.length));
      for (const lead of batch) { await createLead(lead); }
      addToast('success', `Discovered ${batch.length} new AI leads!`);
    } catch { addToast('error', 'Failed to discover leads'); }
    setDiscovering(false);
  };

  const clearFilters = () => {
    setSearchQuery(''); setServerResults(null);
    setSelectedCategory('All'); setSelectedWorkType('Any'); setSelectedIndustry('All');
    setLocationFilter(''); setBudgetMin(''); setBudgetMax(''); setMinScore('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Discovery</h1>
        <p className="text-gray-400 mt-1 text-sm">Find AI engineering opportunities that match your expertise</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (serverResults) setServerResults(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search AI projects, skills, companies, or contacts..."
            className="input-field w-full pl-10 pr-4 py-3"
          />
          {searchQuery && (
            <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={handleSearch} disabled={searching || !searchQuery.trim()} className="btn-primary px-6 shrink-0 flex items-center gap-2 disabled:opacity-40">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
        </button>
        <div className="h-4 w-px bg-gray-700" />
        <button onClick={handleDiscoverLeads} disabled={discovering} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50">
          {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {discovering ? 'Discovering...' : 'Discover AI Leads'}
        </button>
        <button onClick={() => navigate('/app/integrations')} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
          Import CSV
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">AI Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field text-sm">
                {aiCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Work Type</label>
              <select value={selectedWorkType} onChange={(e) => setSelectedWorkType(e.target.value)} className="input-field text-sm">
                {workTypes.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Industry</label>
              <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="input-field text-sm">
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Location</label>
              <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="Any location" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Budget</label>
              <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="$0" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Budget</label>
              <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="No limit" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Lead Score</label>
              <input type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} placeholder="0" min="0" max="100" className="input-field text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={clearFilters} className="btn-secondary text-sm flex-1">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-400">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} {serverResults ? 'found' : 'available'}</p>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm w-auto py-1.5">
            <option value="score">Sort by Score</option>
            <option value="budget">Sort by Budget</option>
            <option value="date">Sort by Date</option>
          </select>
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{lead.company.charAt(0)}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{lead.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{lead.company} · {lead.contactName}</p>
                  </div>
                </div>
                <span className={`badge text-xs shrink-0 ${(lead.scoreOverall || lead.leadScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400' : (lead.scoreOverall || lead.leadScore || 0) >= 60 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{lead.scoreOverall || lead.leadScore || 0}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{lead.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {lead.skills.slice(0, 3).map((s) => <span key={s} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">{s}</span>)}
                {lead.skills.length > 3 && <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-500 text-xs">+{lead.skills.length - 3}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {lead.remoteType}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(lead.postedDate)}</span>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-800">
                <span className="badge bg-blue-500/10 text-blue-400 text-xs">{lead.aiCategory}</span>
                <span className="badge bg-gray-800 text-gray-400 text-xs">{lead.source}</span>
                {lead.saved && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">Saved</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Lead unsaved' : 'Lead saved'); }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5">
                  {lead.saved ? <><Bookmark className="w-3.5 h-3.5 text-blue-400" /> Saved</> : <><Bookmark className="w-3.5 h-3.5" /> Save</>}
                </button>
                <button onClick={() => navigate('/app/leads/' + lead.id)} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5"><Eye className="w-3.5 h-3.5" /> View Details</button>
                <div className="relative">
                  <button onClick={() => setProjectDropdownLeadId(projectDropdownLeadId === lead.id ? null : lead.id)} className="btn-secondary px-2.5 py-2.5"><Plus className="w-3.5 h-3.5" /></button>
                  {projectDropdownLeadId === lead.id && (
                    <div className="absolute bottom-full mb-1 right-0 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-30 py-1 min-w-[180px]">
                      {projects.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-navy-400">No projects</p>
                      ) : (
                        projects.map(p => (
                          <button key={p.id} onClick={() => { addLeadToProject(lead.id, p.id); setProjectDropdownLeadId(null); addToast('success', `Added to ${p.name}`); }} className="w-full text-left px-3 py-2 text-xs text-navy-200 hover:bg-navy-700 hover:text-white transition-colors">
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <>
          <div className="hidden md:block card overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3">
                      <p className="font-medium text-white truncate max-w-[200px]">{lead.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{lead.skills.slice(0, 2).join(', ')}</p>
                    </td>
                    <td className="py-3 text-gray-300">{lead.company}</td>
                    <td className="py-3"><span className="badge bg-blue-500/10 text-blue-400 text-xs">{lead.aiCategory}</span></td>
                    <td className="py-3 text-gray-400 text-xs">{lead.location}</td>
                    <td className="py-3 text-gray-300 text-xs">{formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</td>
                    <td className="py-3"><span className={`font-medium ${getScoreColor(lead.scoreOverall || lead.leadScore || 0)}`}>{lead.scoreOverall || lead.leadScore || 0}</span></td>
                    <td className="py-3 text-gray-400 text-xs">{formatDate(lead.postedDate)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Unsaved' : 'Saved'); }} className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700">
                          <Bookmark className={`w-4 h-4 ${lead.saved ? 'text-blue-400 fill-blue-400' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/app/leads/' + lead.id)} className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Eye className="w-4 h-4" /></button>
                        <div className="relative">
                          <button onClick={() => setProjectDropdownLeadId(projectDropdownLeadId === lead.id ? null : lead.id)} className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Plus className="w-4 h-4" /></button>
                        {projectDropdownLeadId === lead.id && (
                          <div className="absolute top-full right-0 mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-30 py-1 min-w-[180px]">
                            {projects.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-navy-400">No projects</p>
                            ) : (
                              projects.map(p => (
                                <button key={p.id} onClick={() => { addLeadToProject(lead.id, p.id); setProjectDropdownLeadId(null); addToast('success', `Added to ${p.name}`); }} className="w-full text-left px-3 py-2 text-xs text-navy-200 hover:bg-navy-700 hover:text-white transition-colors">
                                  {p.name}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{lead.company.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{lead.title}</p>
                      <p className="text-xs text-gray-400 truncate">{lead.company} · {lead.contactName}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${(lead.scoreOverall || lead.leadScore || 0) >= 80 ? 'text-emerald-400' : (lead.scoreOverall || lead.leadScore || 0) >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{lead.scoreOverall || lead.leadScore || 0}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge bg-blue-500/10 text-blue-400 text-xs">{lead.aiCategory}</span>
                  <span className="badge bg-gray-800 text-gray-400 text-xs">{lead.source}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Unsaved' : 'Saved'); }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5">
                    <Bookmark className={`w-3.5 h-3.5 ${lead.saved ? 'text-blue-400' : ''}`} /> {lead.saved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={() => navigate('/app/leads/' + lead.id)} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5"><Eye className="w-3.5 h-3.5" /> View</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="card text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">{leads.length === 0 ? 'No leads yet' : 'No leads match your search'}</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            {leads.length === 0
              ? 'Discover AI engineering leads instantly or import your own from LinkedIn CSV.'
              : 'Try adjusting your search or filters.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {leads.length === 0 && (
              <button onClick={handleDiscoverLeads} disabled={discovering} className="btn-primary flex items-center gap-2">
                {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {discovering ? 'Discovering...' : 'Discover AI Leads'}
              </button>
            )}
            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}
