import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  Search, Filter, Grid, List, MapPin, DollarSign, Bookmark, Eye, Plus, X, Briefcase,
  Loader2, Sparkles, Upload, Download, Trash2, Archive, RotateCcw, ChevronLeft, ChevronRight,
  ArrowUpDown, UserCheck, Tag, Building2, Mail, Phone, Linkedin, Calendar, AlertTriangle, CheckCircle2
} from 'lucide-react';
import type { Lead, LeadStatus, LeadSource } from '../types';
import AddLeadModal from '../components/AddLeadModal';
import CsvImportModal from '../components/CsvImportModal';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reviewing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  follow_up: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  won: 'bg-green-500/10 text-green-400 border-green-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  discovery_call: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  proposal_sent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  responded: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  proposal: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const statusLabels: Record<string, string> = {
  new: 'New', reviewing: 'Reviewing', qualified: 'Qualified', contacted: 'Contacted',
  follow_up: 'Follow-up', won: 'Won', lost: 'Lost', discovery_call: 'Discovery Call',
  proposal_sent: 'Proposal Sent', responded: 'Responded', proposal: 'Proposal',
};

const sourceLabels: Record<string, string> = {
  manual: 'Manual', ai_generated: 'AI Generated', linkedin_lead_form: 'LinkedIn Form', csv_import: 'CSV Import',
};

const ITEMS_PER_PAGE = 15;

export default function LeadDictionary() {
  const navigate = useNavigate();
  const { leads, projects, addToast, toggleSaveLead, createLead, deleteLead } = useApp();
  const { user } = useAuth();
  const csvExportRef = useRef<HTMLAnchorElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score' | 'company' | 'status'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [showDiscovering, setShowDiscovering] = useState(false);

  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);

  const activeLeads = leads.filter(l => !l.archived);
  const archivedLeads = leads.filter(l => l.archived);
  const [showArchived, setShowArchived] = useState(false);
  const baseLeads = showArchived ? archivedLeads : activeLeads;

  const industries = useMemo(() => {
    const set = new Set<string>();
    baseLeads.forEach(l => { if (l.industry) set.add(l.industry); });
    return ['all', ...Array.from(set).sort()];
  }, [baseLeads]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    baseLeads.forEach(l => set.add(l.company));
    return ['all', ...Array.from(set).sort()];
  }, [baseLeads]);

  const filteredLeads = useMemo(() => {
    let result = [...baseLeads];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        (l.contactName || '').toLowerCase().includes(q) ||
        (l.fullName || '').toLowerCase().includes(q) ||
        (l.firstName || '').toLowerCase().includes(q) ||
        (l.lastName || '').toLowerCase().includes(q) ||
        (l.company || '').toLowerCase().includes(q) ||
        (l.email || l.contactEmail || '').toLowerCase().includes(q) ||
        (l.contactTitle || '').toLowerCase().includes(q) ||
        (l.location || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (l.industry || '').toLowerCase().includes(q) ||
        (l.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterSource !== 'all') result = result.filter(l => l.source === filterSource);
    if (filterStatus !== 'all') result = result.filter(l => l.status === filterStatus);
    if (filterIndustry !== 'all') result = result.filter(l => l.industry === filterIndustry);
    if (filterCompany !== 'all') result = result.filter(l => l.company === filterCompany);
    if (dateFrom) result = result.filter(l => new Date(l.postedDate) >= new Date(dateFrom));
    if (dateTo) result = result.filter(l => new Date(l.postedDate) <= new Date(dateTo));

    if (sortBy === 'newest') result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
    else if (sortBy === 'score') result.sort((a, b) => (b.scoreOverall || b.leadScore || 0) - (a.scoreOverall || a.leadScore || 0));
    else if (sortBy === 'company') result.sort((a, b) => a.company.localeCompare(b.company));
    else if (sortBy === 'status') result.sort((a, b) => a.status.localeCompare(b.status));
    return result;
  }, [baseLeads, searchQuery, filterSource, filterStatus, filterIndustry, filterCompany, dateFrom, dateTo, sortBy]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: activeLeads.length,
    new: activeLeads.filter(l => l.status === 'new').length,
    qualified: activeLeads.filter(l => l.status === 'qualified').length,
    contacted: activeLeads.filter(l => l.status === 'contacted' || l.status === 'follow_up').length,
    linkedin: activeLeads.filter(l => l.source === 'linkedin_lead_form').length,
    aiGenerated: activeLeads.filter(l => l.source === 'ai_generated').length,
  }), [activeLeads]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginatedLeads.map(l => l.id)));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (bulkAction === 'export') { exportCsv(filteredLeads.filter(l => selectedIds.has(l.id))); setShowBulkConfirm(false); setSelectedIds(new Set()); setBulkAction(''); return; }
    for (const id of ids) {
      if (bulkAction === 'delete') { await supabase.from('leads').delete().eq('id', id); }
      else if (bulkAction === 'archive') { await supabase.from('leads').update({ archived: true, archived_at: new Date().toISOString() }).eq('id', id); }
      else if (bulkAction === 'restore') { await supabase.from('leads').update({ archived: false, archived_at: null }).eq('id', id); }
      else if (bulkAction.startsWith('status:')) { await supabase.from('leads').update({ status: bulkAction.replace('status:', '') }).eq('id', id); }
    }
    addToast('success', `Bulk action completed on ${ids.length} leads`);
    setShowBulkConfirm(false); setSelectedIds(new Set()); setBulkAction('');
    window.location.reload();
  };

  const handleDeleteLead = async (id: string) => {
    await deleteLead(id);
    setDeleteConfirmId(null);
  };

  const handleRestoreLead = async (id: string) => {
    await supabase.from('leads').update({ archived: false, archived_at: null }).eq('id', id);
    setRestoreConfirmId(null);
    addToast('success', 'Lead restored');
    window.location.reload();
  };

  const exportCsv = (data: Lead[]) => {
    const headers = ['Full Name','Email','Phone','Company','Job Title','Industry','Location','Source','Status','Score','Tags','LinkedIn URL','Created At'];
    const rows = data.map(l => [
      l.fullName || l.contactName, l.email || l.contactEmail || '', l.phone || '', l.company,
      l.contactTitle || '', l.industry || '', l.location, sourceLabels[l.source] || l.source,
      statusLabels[l.status] || l.status, String(l.scoreOverall || l.leadScore || 0),
      (l.tags || []).join('; '), l.linkedinProfileUrl || '', l.postedDate
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `leads-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    addToast('success', `Exported ${data.length} leads`);
  };

  const handleDiscoverLeads = async () => {
    if (!user) return;
    setShowDiscovering(true);
    try {
      const sampleLeads = [
        { title: 'AI Agent Developer for Customer Support', company: 'TechFlow Inc', contactName: 'Sarah Chen', contactTitle: 'VP of Engineering', description: 'Looking for AI agent developer to build autonomous customer support system.', skills: ['AI Agents', 'LangChain', 'Python'], location: 'San Francisco, CA', remoteType: 'remote' as const, projectType: 'contract' as const, budgetMin: 80000, budgetMax: 120000, postedDate: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'ai_generated', aiCategory: 'AI Agents', industry: 'Technology' },
        { title: 'LLM Integration for Enterprise Search', company: 'DataVault Corp', contactName: 'James Wilson', contactTitle: 'CTO', description: 'Enterprise search needs LLM integration for intelligent document retrieval.', skills: ['LLMs', 'RAG', 'Python'], location: 'New York, NY', remoteType: 'hybrid' as const, projectType: 'contract' as const, budgetMin: 150000, budgetMax: 250000, postedDate: new Date(Date.now() - 86400000).toISOString(), source: 'ai_generated', aiCategory: 'RAG', industry: 'Technology' },
        { title: 'NLP Pipeline for Healthcare Analytics', company: 'MedTech Solutions', contactName: 'Dr. Priya Patel', contactTitle: 'Chief Data Officer', description: 'Build NLP pipeline to extract insights from clinical notes.', skills: ['NLP', 'Python', 'spaCy'], location: 'Boston, MA', remoteType: 'remote' as const, projectType: 'contract' as const, budgetMin: 200000, budgetMax: 350000, postedDate: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'ai_generated', aiCategory: 'NLP', industry: 'Healthcare' },
        { title: 'Chatbot Development for E-Commerce', company: 'ShopSmart', contactName: 'Mike Rodriguez', contactTitle: 'Head of Product', description: 'Conversational AI chatbot for e-commerce product recommendations.', skills: ['Chatbot Development', 'NLP', 'Python'], location: 'Austin, TX', remoteType: 'remote' as const, projectType: 'freelance' as const, budgetMin: 40000, budgetMax: 60000, postedDate: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'ai_generated', aiCategory: 'Chatbot Development', industry: 'Retail' },
        { title: 'ML Model Deployment Pipeline', company: 'Scale AI', contactName: 'Alex Kim', contactTitle: 'ML Engineering Manager', description: 'Build end-to-end MLOps pipeline for training and deploying ML models.', skills: ['MLOps', 'Kubernetes', 'Python'], location: 'San Francisco, CA', remoteType: 'hybrid' as const, projectType: 'contract' as const, budgetMin: 120000, budgetMax: 180000, postedDate: new Date(Date.now() - 86400000).toISOString(), source: 'ai_generated', aiCategory: 'Machine Learning', industry: 'Technology' },
      ];
      for (const lead of sampleLeads) { await createLead(lead); }
      addToast('success', `Discovered ${sampleLeads.length} AI leads!`);
    } catch { addToast('error', 'Failed to discover leads'); }
    setShowDiscovering(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Dictionary</h1>
          <p className="text-gray-400 mt-1 text-sm">{activeLeads.length} active leads {archivedLeads.length > 0 ? `| ${archivedLeads.length} archived` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
          <button onClick={() => setShowCsvImport(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => exportCsv(filteredLeads)} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-white' },
          { label: 'New', value: stats.new, color: 'text-blue-400' },
          { label: 'Qualified', value: stats.qualified, color: 'text-emerald-400' },
          { label: 'Contacted', value: stats.contacted, color: 'text-amber-400' },
          { label: 'LinkedIn', value: stats.linkedin, color: 'text-blue-500' },
          { label: 'AI Generated', value: stats.aiGenerated, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="card p-3">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, company, email, title, location, tags..."
            className="input-field w-full pl-10 pr-4 py-3"
          />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary flex items-center gap-2 text-sm ${showFilters ? 'border-blue-500/50 text-blue-400' : ''}`}>
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button onClick={handleDiscoverLeads} disabled={showDiscovering} className="btn-secondary flex items-center gap-2 text-sm text-purple-400 border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50">
          {showDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Discover
        </button>
        <button onClick={() => setShowArchived(!showArchived)} className={`btn-secondary flex items-center gap-2 text-sm ${showArchived ? 'border-amber-500/50 text-amber-400' : ''}`}>
          <Archive className="w-4 h-4" /> {showArchived ? 'Active' : 'Archived'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Source</label>
              <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full">
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="ai_generated">AI Generated</option>
                <option value="linkedin_lead_form">LinkedIn Form</option>
                <option value="csv_import">CSV Import</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full">
                <option value="all">All Statuses</option>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Industry</label>
              <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full">
                {industries.map(i => <option key={i} value={i}>{i === 'all' ? 'All Industries' : i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Company</label>
              <select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full">
                {companies.map(c => <option key={c} value={c}>{c === 'all' ? 'All Companies' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} className="input-field text-sm w-full" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { setFilterSource('all'); setFilterStatus('all'); setFilterIndustry('all'); setFilterCompany('all'); setDateFrom(''); setDateTo(''); setCurrentPage(1); }} className="text-xs text-gray-400 hover:text-white">Clear all filters</button>
          </div>
        </div>
      )}

      {/* Sort + View + Bulk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</p>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400">{selectedIds.size} selected</span>
              <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="input-field text-xs py-1">
                <option value="">Bulk action...</option>
                <option value="export">Export Selected</option>
                <option value="archive">Archive</option>
                <option value="restore">Restore</option>
                <option value="delete">Delete</option>
                <option value="status:qualified">Set Qualified</option>
                <option value="status:contacted">Set Contacted</option>
                <option value="status:follow_up">Set Follow-up</option>
              </select>
              {bulkAction && (
                <button onClick={() => setShowBulkConfirm(true)} className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Apply</button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="input-field text-sm py-1.5">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score">Lead Score</option>
            <option value="company">Company</option>
            <option value="status">Status</option>
          </select>
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="card overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="pb-3 w-8"><input type="checkbox" checked={selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0} onChange={toggleSelectAll} className="rounded border-gray-600 bg-gray-800 text-blue-500" /></th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3"><input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded border-gray-600 bg-gray-800 text-blue-500" /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">{(lead.contactName || '??')[0]}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm truncate max-w-[180px]">{lead.contactName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{lead.contactTitle || lead.industry || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-300 text-sm">{lead.company}</td>
                  <td className="py-3"><span className={`badge text-xs border ${lead.source === 'ai_generated' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : lead.source === 'linkedin_lead_form' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : lead.source === 'csv_import' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{sourceLabels[lead.source] || lead.source}</span></td>
                  <td className="py-3"><span className={`badge text-xs border ${statusColors[lead.status] || 'bg-gray-700 text-gray-300'}`}>{statusLabels[lead.status] || lead.status}</span></td>
                  <td className="py-3"><span className={`font-medium ${(lead.scoreOverall || lead.leadScore || 0) >= 80 ? 'text-emerald-400' : (lead.scoreOverall || lead.leadScore || 0) >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{lead.scoreOverall || lead.leadScore || 0}</span></td>
                  <td className="py-3 text-gray-400 text-xs">{formatDate(lead.postedDate)}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => navigate('/app/leads/' + lead.id)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingLead(lead); setShowAddModal(true); }} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700" title="Edit"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      {showArchived ? (
                        <button onClick={() => setRestoreConfirmId(lead.id)} className="p-1.5 rounded text-gray-400 hover:text-emerald-400 hover:bg-gray-700" title="Restore"><RotateCcw className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(lead.id)} className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedLeads.map(lead => (
            <div key={lead.id} className="card hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">{(lead.contactName || '??')[0]}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{lead.contactName}</h3>
                    <p className="text-xs text-gray-400 truncate">{lead.contactTitle || ''} {lead.company}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${(lead.scoreOverall || lead.leadScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400' : (lead.scoreOverall || lead.leadScore || 0) >= 60 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{lead.scoreOverall || lead.leadScore || 0}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{lead.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className={`badge text-xs border ${statusColors[lead.status] || ''}`}>{statusLabels[lead.status] || lead.status}</span>
                <span className={`badge text-xs border ${lead.source === 'ai_generated' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : lead.source === 'linkedin_lead_form' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>{sourceLabels[lead.source] || lead.source}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.location}</span>
                {lead.industry && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {lead.industry}</span>}
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</span>
              </div>
              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-800">
                <button onClick={() => navigate('/app/leads/' + lead.id)} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2"><Eye className="w-3.5 h-3.5" /> View</button>
                <button onClick={() => { setEditingLead(lead); setShowAddModal(true); }} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-2">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary px-3 py-2 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary px-3 py-2 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="card text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">{baseLeads.length === 0 ? 'No leads yet' : 'No leads match your search'}</h3>
          <p className="text-sm text-gray-400 mb-6">Add leads manually, import CSV, or discover AI-generated leads.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Lead</button>
            <button onClick={handleDiscoverLeads} disabled={showDiscovering} className="btn-secondary flex items-center gap-2 text-purple-400">
              {showDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Discover AI Leads
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-6 h-6 text-red-400" /><h3 className="text-lg font-semibold text-white">Delete Lead</h3></div>
            <p className="text-sm text-gray-400 mb-6">This lead will be permanently deleted. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleDeleteLead(deleteConfirmId)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirm */}
      {restoreConfirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRestoreConfirmId(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4"><RotateCcw className="w-6 h-6 text-emerald-400" /><h3 className="text-lg font-semibold text-white">Restore Lead</h3></div>
            <p className="text-sm text-gray-400 mb-6">This lead will be restored to your active lead dictionary.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRestoreConfirmId(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => handleRestoreLead(restoreConfirmId)} className="btn-primary text-sm">Restore</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Confirm */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowBulkConfirm(false)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Bulk Action</h3>
            <p className="text-sm text-gray-400 mb-6">Apply "{bulkAction}" to {selectedIds.size} selected leads?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBulkConfirm(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleBulkAction} className="btn-primary text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddLeadModal lead={editingLead} onClose={() => { setShowAddModal(false); setEditingLead(null); }} />}
      {showCsvImport && <CsvImportModal onClose={() => setShowCsvImport(false)} />}
    </div>
  );
}
