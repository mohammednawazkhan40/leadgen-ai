import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getScoreColor, truncate } from '../utils/helpers';
import { Search, Filter, Grid, List, MapPin, Calendar, DollarSign, Bookmark, Eye, Plus, X, ExternalLink, Building2, Briefcase, Loader2 } from 'lucide-react';

const suggestions = ['AI agent developer needed', 'LLM engineer for enterprise', 'RAG system architect', 'Chatbot development project', 'Machine learning consultant', 'NLP specialist for healthcare'];
const aiCategories = ['All', 'AI Agents', 'LLMs', 'RAG', 'AI Automation', 'Machine Learning', 'Chatbot Development', 'NLP'];
const industries = ['All', 'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education'];
const workTypes = ['Any', 'Remote', 'Hybrid', 'Onsite'];

export default function LeadDiscovery() {
  const navigate = useNavigate();
  const { leads, projects, addToast, toggleSaveLead, addLeadToProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('Any');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [minScore, setMinScore] = useState('');
  const [searched, setSearched] = useState(false);
  const [projectDropdownLeadId, setProjectDropdownLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.skills.some(s => s.toLowerCase().includes(q)));
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
  }, [leads, searchQuery, selectedCategory, selectedWorkType, selectedIndustry, locationFilter, budgetMin, budgetMax, minScore, sortBy]);

  const handleSearch = () => { setSearched(true); setShowSuggestions(false); };
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('All'); setSelectedWorkType('Any'); setSelectedIndustry('All'); setLocationFilter(''); setBudgetMin(''); setBudgetMax(''); setMinScore(''); setSearched(false); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Discovery</h1>
        <p className="text-gray-400 mt-1 text-sm">Find AI engineering opportunities that match your expertise</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search AI projects, skills, or opportunities..."
              className="input-field w-full pl-10 pr-4 py-3"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary px-6 shrink-0">Search</button>
        </div>
        {showSuggestions && !searchQuery && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-[#111827] border border-gray-700 rounded-lg shadow-xl z-20 p-2">
            <p className="text-xs text-gray-500 px-2 py-1">Popular searches</p>
            {suggestions.map((s) => (
              <button key={s} onMouseDown={() => { setSearchQuery(s); setShowSuggestions(false); handleSearch(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Toggle */}
      <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
      </button>

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
        <p className="text-sm text-gray-400">{searched ? `${filteredLeads.length} results found` : `${filteredLeads.length} available leads`}</p>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm w-auto py-1.5">
            <option value="score">Sort by Score</option>
            <option value="budget">Sort by Budget</option>
            <option value="date">Sort by Date</option>
          </select>
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
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
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{lead.excerpt}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {lead.skills.slice(0, 3).map((s) => <span key={s} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px]">{s}</span>)}
                {lead.skills.length > 3 && <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-500 text-[10px]">+{lead.skills.length - 3}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {lead.remoteType}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(lead.postedDate)}</span>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-800">
                <span className="badge bg-blue-500/10 text-blue-400 text-[10px]">{lead.aiCategory}</span>
                <span className="badge bg-gray-800 text-gray-400 text-[10px]">{lead.source}</span>
                {lead.saved && <span className="badge bg-emerald-500/10 text-emerald-400 text-[10px]">Saved</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Lead unsaved' : 'Lead saved'); }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2">
                  {lead.saved ? <><Bookmark className="w-3.5 h-3.5 text-blue-400" /> Saved</> : <><Bookmark className="w-3.5 h-3.5" /> Save</>}
                </button>
                <button onClick={() => navigate('/app/leads/' + lead.id)} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2"><Eye className="w-3.5 h-3.5" /> View Details</button>
                <div className="relative">
                  <button onClick={() => setProjectDropdownLeadId(projectDropdownLeadId === lead.id ? null : lead.id)} className="btn-secondary px-2 py-2"><Plus className="w-3.5 h-3.5" /></button>
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
        <div className="card overflow-x-auto -mx-5 px-5">
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
                      <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Unsaved' : 'Saved'); }} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700">
                        <Bookmark className={`w-4 h-4 ${lead.saved ? 'text-blue-400 fill-blue-400' : ''}`} />
                      </button>
                      <button onClick={() => navigate('/app/leads/' + lead.id)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Eye className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={() => setProjectDropdownLeadId(projectDropdownLeadId === lead.id ? null : lead.id)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Plus className="w-4 h-4" /></button>
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
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="card text-center py-12">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No leads found</h3>
          <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
        </div>
      )}
    </div>
  );
}
