import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getScoreColor, getStatusColor, getStatusLabel } from '../utils/helpers';
import { Lead } from '../types';
import {
  Bookmark,
  Search,
  Eye,
  Trash2,
  ExternalLink,
  FolderPlus,
  Download,
  Filter,
  SortAsc,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

const sortOptions = [
  { label: 'Score (High to Low)', value: 'score_desc' },
  { label: 'Score (Low to High)', value: 'score_asc' },
  { label: 'Date (Newest)', value: 'date_desc' },
  { label: 'Date (Oldest)', value: 'date_asc' },
  { label: 'Company (A-Z)', value: 'company_asc' },
  { label: 'Company (Z-A)', value: 'company_desc' },
  { label: 'Value (High to Low)', value: 'value_desc' },
  { label: 'Value (Low to High)', value: 'value_asc' },
];

const aiCategories = [
  'All',
  'AI Agents',
  'LLMs',
  'RAG',
  'AI Automation',
  'Machine Learning',
  'Chatbot Development',
  'NLP',
  'Computer Vision',
];

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Reviewing', value: 'reviewing' },
];

export default function SavedLeads() {
  const { leads, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removedLeads, setRemovedLeads] = useState<Set<string>>(new Set());

  const savedLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        (l.status === 'qualified' || l.status === 'reviewing') &&
        !removedLeads.has(l.id)
    );
  }, [leads, removedLeads]);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = savedLeads.filter((lead) => {
      if (query) {
        const searchable = `${lead.title} ${lead.company} ${lead.contactName} ${lead.description} ${lead.aiCategory} ${lead.source}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      if (categoryFilter !== 'All' && lead.aiCategory !== categoryFilter) return false;
      if (statusFilter && lead.status !== statusFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'score_desc': return b.leadScore - a.leadScore;
        case 'score_asc': return a.leadScore - b.leadScore;
        case 'date_desc': return new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime();
        case 'date_asc': return new Date(a.foundDate).getTime() - new Date(b.foundDate).getTime();
        case 'company_asc': return a.company.localeCompare(b.company);
        case 'company_desc': return b.company.localeCompare(a.company);
        case 'value_desc': return (b.budgetMax || 0) - (a.budgetMax || 0);
        case 'value_asc': return (a.budgetMin || 0) - (b.budgetMin || 0);
        default: return 0;
      }
    });

    return result;
  }, [savedLeads, searchQuery, sortBy, categoryFilter, statusFilter]);

  const totalCount = savedLeads.length;
  const highPriorityCount = savedLeads.filter((l) => l.leadScore > 80).length;
  const needsFollowUpCount = savedLeads.filter(
    (l) => l.status === 'reviewing'
  ).length;

  const formatBudgetRange = (lead: Lead) => {
    if (lead.budgetMin && lead.budgetMax) return `${formatCurrency(lead.budgetMin)} - ${formatCurrency(lead.budgetMax)}`;
    if (lead.budgetMin) return `From ${formatCurrency(lead.budgetMin)}`;
    if (lead.budgetMax) return `Up to ${formatCurrency(lead.budgetMax)}`;
    return 'Not specified';
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredLeads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleRemove = (id: string) => {
    setRemovedLeads((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addToast('info', 'Lead removed from saved list');
  };

  const handleBulkRemove = () => {
    setRemovedLeads((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      return next;
    });
    addToast('info', `${selected.size} lead(s) removed from saved list`);
    setSelected(new Set());
  };

  const handleBulkExport = () => {
    const selectedLeads = filteredLeads.filter(l => selected.has(l.id));
    const csv = [
      'Title,Company,Contact,Score,Status,Budget',
      ...selectedLeads.map(l => `"${l.title}","${l.company}","${l.contactName}",${l.leadScore},${l.status},"${l.budgetMin}-${l.budgetMax}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved_leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `${selected.size} leads exported to CSV`);
    setSelected(new Set());
  };

  const handleBulkAddToProject = () => {
    addToast('success', `${selected.size} lead(s) added to project`);
    setSelected(new Set());
  };

  const stats = [
    {
      label: 'Total Saved',
      value: totalCount,
      icon: Bookmark,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      label: 'High Priority',
      value: highPriorityCount,
      icon: AlertCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Needs Follow-up',
      value: needsFollowUpCount,
      icon: SortAsc,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Leads</h1>
          <p className="text-navy-400 text-sm">Manage your bookmarked leads and opportunities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-navy-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved leads..."
            className="input-field pl-10 py-2.5"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto min-w-[160px] py-2.5"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-auto min-w-[140px] py-2.5"
          >
            {aiCategories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[140px] py-2.5"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="glass rounded-xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm text-navy-300">
            <span className="text-white font-medium">{selected.size}</span> lead(s) selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleBulkAddToProject} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-600/20 text-accent-400 border border-accent-500/30 hover:bg-accent-600/30 transition-colors">
              <FolderPlus className="w-3.5 h-3.5" />
              Add to Project
            </button>
            <button onClick={handleBulkExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-700 text-navy-200 border border-navy-600 hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button onClick={handleBulkRemove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
            <button onClick={() => setSelected(new Set())} className="text-navy-400 hover:text-white text-xs ml-2 transition-colors">
              Clear selection
            </button>
          </div>
        </div>
      )}

      {filteredLeads.length === 0 ? (
        <div className="glass rounded-xl py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-navy-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No saved leads yet</h3>
          <p className="text-navy-400 text-sm max-w-md">
            Discover opportunities in the Lead Discovery page.
          </p>
          <Link
            to="/app/leads"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Go to Lead Discovery
          </Link>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-800">
                  <th className="text-left px-5 py-3">
                    <button onClick={toggleSelectAll} className="text-navy-400 hover:text-white transition-colors">
                      {selected.size === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-accent-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Company / Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Project</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Budget</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Date Found</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors ${
                      selected.has(lead.id) ? 'bg-accent-500/5' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <button onClick={() => toggleSelect(lead.id)} className="text-navy-400 hover:text-white transition-colors">
                        {selected.has(lead.id) ? (
                          <CheckSquare className="w-4 h-4 text-accent-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-white text-sm">{lead.company}</p>
                        <p className="text-xs text-navy-400">{lead.contactName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-navy-200 text-sm max-w-[200px] truncate">{lead.title}</td>
                    <td className="px-5 py-3">
                      <span className="badge bg-accent-500/10 text-accent-400 border border-accent-500/20 text-[10px]">
                        {lead.aiCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${getScoreColor(lead.leadScore)}`}>
                        {lead.leadScore}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy-300 text-sm">{formatBudgetRange(lead)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-[10px] ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy-400 text-xs">{lead.source}</td>
                    <td className="px-5 py-3 text-navy-400 text-xs">{formatDate(lead.foundDate)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/app/leads/${lead.id}`}
                          className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemove(lead.id)}
                          className="p-1.5 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove from saved"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => addToast('info', 'Added to project. Visit Projects to manage.')}
                          className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
                          title="Add to project"
                        >
                          <FolderPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
