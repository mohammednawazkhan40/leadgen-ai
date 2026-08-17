import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { teamMembers } from '../data/mockData';
import {
  formatCurrency,
  formatDate,
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  generateId,
} from '../utils/helpers';
import { LeadStatus, Project } from '../types';
import {
  FolderKanban,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  DollarSign,
  ArrowRight,
  GripVertical,
  Filter,
  X,
  ChevronDown,
  Eye,
  List,
  LayoutGrid,
  Minus,
} from 'lucide-react';

const COLUMNS: LeadStatus[] = [
  'new',
  'reviewing',
  'qualified',
  'contacted',
  'discovery_call',
  'proposal_sent',
  'won',
  'lost',
];

const COLUMN_TOP_BORDER: Record<LeadStatus, string> = {
  new: 'border-t-slate-400',
  reviewing: 'border-t-blue-400',
  qualified: 'border-t-emerald-400',
  contacted: 'border-t-amber-400',
  discovery_call: 'border-t-purple-400',
  proposal_sent: 'border-t-cyan-400',
  won: 'border-t-green-400',
  lost: 'border-t-red-400',
};

const OWNER_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

const COMPANY_COLORS = [
  'bg-accent-600/20 border-accent-500/30 text-accent-400',
  'bg-emerald-600/20 border-emerald-500/30 text-emerald-400',
  'bg-purple-600/20 border-purple-500/30 text-purple-400',
  'bg-amber-600/20 border-amber-500/30 text-amber-400',
  'bg-cyan-600/20 border-cyan-500/30 text-cyan-400',
  'bg-rose-600/20 border-rose-500/30 text-rose-400',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getOwnerColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return OWNER_COLORS[Math.abs(hash) % OWNER_COLORS.length];
}

function getCompanyColor(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

export default function Projects() {
  const { projects, updateProjectStatus, addToast, addProject } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<LeadStatus>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    value: '',
    priority: 'medium' as Project['priority'],
    status: 'new' as LeadStatus,
    ownerId: teamMembers[0].id,
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setColumnMenuOpen(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || p.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesOwner = filterOwner === 'all' || (p.owner && p.owner.id === filterOwner);
    return matchesSearch && matchesPriority && matchesStatus && matchesOwner;
  });

  const totalValue = filtered.reduce((sum, p) => sum + p.value, 0);
  const wonCount = filtered.filter((p) => p.status === 'won').length;
  const activeCount = filtered.filter((p) => p.status !== 'won' && p.status !== 'lost').length;
  const winRate = wonCount + activeCount > 0 ? Math.round((wonCount / (wonCount + activeCount)) * 100) : 0;

  function handleMove(projectId: string, newStatus: LeadStatus) {
    updateProjectStatus(projectId, newStatus);
    setActiveCardId(null);
  }

  function toggleColumn(status: LeadStatus) {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
    setColumnMenuOpen(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim() || !formData.value) return;
    const owner = teamMembers.find((m) => m.id === formData.ownerId);
    const dummyLead = {
      id: generateId(),
      title: formData.name,
      company: formData.company,
      contactName: '',
      description: '',
      excerpt: '',
      skills: [],
      location: '',
      remoteType: 'remote' as const,
      projectType: 'contract' as const,
      postedDate: new Date().toISOString().slice(0, 10),
      foundDate: new Date().toISOString().slice(0, 10),
      leadScore: 0,
      intentScore: 0,
      budgetConfidence: 0,
      urgencyScore: 0,
      technicalFit: 0,
      scoreReasons: [],
      source: 'Manual',
      status: formData.status,
      aiCategory: '',
      tags: [],
      notes: [],
      activities: [],
      summary: '',
    };
    addProject({
      name: formData.name,
      company: formData.company,
      value: Number(formData.value),
      priority: formData.priority,
      status: formData.status,
      owner: owner,
      lead: dummyLead,
      nextFollowUp: undefined,
    });
    addToast('success', 'Project created');
    setFormData({ name: '', company: '', value: '', priority: 'medium', status: 'new', ownerId: teamMembers[0].id });
    setShowAddModal(false);
  }

  function clearFilters() {
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterOwner('all');
  }

  const activeFilters = (filterPriority !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0) + (filterOwner !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <div className="p-6 lg:p-8 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <FolderKanban className="w-7 h-7 text-accent-400" />
              <h1 className="text-2xl font-bold">Projects</h1>
            </div>
            <p className="text-navy-400 mt-1 text-sm">Pipeline &mdash; Track and manage your sales pipeline</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-navy-400 text-xs">Total Pipeline Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-navy-400 text-xs">Win Rate</p>
                <p className="text-xl font-bold">{winRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-navy-400 text-xs">Active Deals</p>
                <p className="text-xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors border ${
                  activeFilters > 0
                    ? 'bg-accent-600/20 border-accent-500/50 text-accent-400'
                    : 'bg-navy-900 border-navy-700 text-navy-300 hover:bg-navy-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {activeFilters > 0 && (
                  <span className="bg-accent-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeFilters}
                  </span>
                )}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-navy-800 border border-navy-600 rounded-xl shadow-2xl p-4 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">Filters</h4>
                    {activeFilters > 0 && (
                      <button onClick={clearFilters} className="text-xs text-accent-400 hover:text-accent-300">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-navy-400 mb-1 block">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-navy-400 mb-1 block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="all">All Statuses</option>
                      {COLUMNS.map((s) => (
                        <option key={s} value={s}>
                          {getStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-navy-400 mb-1 block">Owner</label>
                    <select
                      value={filterOwner}
                      onChange={(e) => setFilterOwner(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="all">All Owners</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex bg-navy-900 border border-navy-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'board' ? 'bg-accent-600 text-white' : 'text-navy-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-accent-600 text-white' : 'text-navy-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'board' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {COLUMNS.map((status) => {
              const colProjects = filtered.filter((p) => p.status === status);
              const collapsed = collapsedColumns.has(status);
              return (
                <div
                  key={status}
                  className={`flex-shrink-0 ${collapsed ? 'w-12' : 'w-72'} flex flex-col bg-navy-900/50 border border-navy-800 rounded-xl border-t-2 ${COLUMN_TOP_BORDER[status]} transition-all`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-navy-800">
                    {collapsed ? (
                      <button
                        onClick={() => toggleColumn(status)}
                        className="w-full flex items-center justify-center"
                        title={getStatusLabel(status)}
                      >
                        <MoreHorizontal className="w-4 h-4 text-navy-500 rotate-90" />
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-navy-200">{getStatusLabel(status)}</h3>
                          <span className="text-xs bg-navy-800 text-navy-400 px-2 py-0.5 rounded-full font-medium">
                            {colProjects.length}
                          </span>
                        </div>
                        <div className="relative" ref={colMenuRef}>
                          <button
                            onClick={() => setColumnMenuOpen(columnMenuOpen === status ? null : status)}
                            className="p-1 rounded hover:bg-navy-800 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-navy-500 hover:text-navy-300" />
                          </button>
                          {columnMenuOpen === status && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setColumnMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 z-50 bg-navy-800 border border-navy-600 rounded-lg shadow-xl py-1 w-40">
                                <button
                                  onClick={() => toggleColumn(status)}
                                  className="w-full text-left px-3 py-2 text-sm text-navy-300 hover:bg-navy-700 transition-colors flex items-center gap-2"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                  Collapse
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-340px)]">
                      {colProjects.length === 0 && (
                        <p className="text-navy-600 text-xs text-center py-8">No projects</p>
                      )}
                      {colProjects.map((project) => (
                        <div key={project.id} className="relative">
                          <div
                            className="bg-navy-900 border border-navy-700 rounded-lg p-3.5 cursor-pointer hover:border-navy-500 transition-colors"
                            onClick={() => setActiveCardId(activeCardId === project.id ? null : project.id)}
                          >
                            <div className="flex items-start justify-between mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${getCompanyColor(project.company)}`}
                                >
                                  {project.company[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">{project.name}</p>
                                  <p className="text-xs text-navy-400 truncate">{project.company}</p>
                                </div>
                              </div>
                              <GripVertical className="w-4 h-4 text-navy-600 flex-shrink-0 mt-1" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-2.5">
                              <span className="text-sm font-bold text-accent-400">
                                {formatCurrency(project.value)}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(project.priority)}`}
                              >
                                {project.priority}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {project.owner && (
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-5 h-5 rounded-full ${getOwnerColor(project.owner.name)} flex items-center justify-center text-[9px] font-bold text-white`}
                                    >
                                      {getInitials(project.owner.name)}
                                    </div>
                                    <span className="text-[11px] text-navy-400">
                                      {project.owner.name.split(' ')[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {project.nextFollowUp && (
                                <div className="flex items-center gap-1 text-navy-500">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-[10px]">{formatDate(project.nextFollowUp)}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/app/leads/' + project.lead.id);
                              }}
                              className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 bg-accent-600/10 hover:bg-accent-600/20 rounded-md py-1.5 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>

                          {activeCardId === project.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveCardId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-50 bg-navy-800 border border-navy-600 rounded-lg shadow-xl py-1 w-52">
                                <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-navy-500 font-semibold">
                                  Move to
                                </p>
                                {COLUMNS.filter((s) => s !== project.status).map((s) => {
                                  const ci = COLUMNS.indexOf(status);
                                  const ti = COLUMNS.indexOf(s);
                                  const isNext = ti === ci + 1;
                                  const isPrev = ti === ci - 1;
                                  return (
                                    <button
                                      key={s}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMove(project.id, s);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-navy-700 transition-colors ${
                                        isNext ? 'text-emerald-400' : isPrev ? 'text-amber-400' : 'text-navy-300'
                                      }`}
                                    >
                                      {isNext && <ArrowRight className="w-3 h-3" />}
                                      <span
                                        className={`w-2 h-2 rounded-full ${getStatusColor(s).split(' ')[0]}`}
                                      />
                                      {getStatusLabel(s)}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Company</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Value</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Priority</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Owner</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Next Follow-up</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-navy-500">
                        No projects found
                      </td>
                    </tr>
                  )}
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${getCompanyColor(project.company)}`}
                          >
                            {project.company[0]}
                          </div>
                          <span className="font-medium text-white truncate max-w-[200px]">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-navy-300 truncate max-w-[160px]">{project.company}</td>
                      <td className="px-4 py-3 text-right font-bold text-accent-400">{formatCurrency(project.value)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {project.owner && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-5 h-5 rounded-full ${getOwnerColor(project.owner.name)} flex items-center justify-center text-[9px] font-bold text-white`}
                            >
                              {getInitials(project.owner.name)}
                            </div>
                            <span className="text-xs text-navy-400">{project.owner.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {project.nextFollowUp ? (
                          <div className="flex items-center gap-1 text-navy-400">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{formatDate(project.nextFollowUp)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-navy-600">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate('/app/leads/' + project.lead.id)}
                            className="p-1.5 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-accent-400 transition-colors"
                            title="View lead"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActiveCardId(activeCardId === project.id ? null : project.id)}
                              className="p-1.5 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors"
                              title="Move project"
                            >
                              <GripVertical className="w-4 h-4" />
                            </button>
                            {activeCardId === project.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveCardId(null)} />
                                <div className="absolute right-0 bottom-full mb-1 z-50 bg-navy-800 border border-navy-600 rounded-lg shadow-xl py-1 w-48">
                                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-navy-500 font-semibold">
                                    Move to
                                  </p>
                                  {COLUMNS.filter((s) => s !== project.status).map((s) => (
                                    <button
                                      key={s}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMove(project.id, s);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-navy-700 transition-colors text-navy-300"
                                    >
                                      <span className={`w-2 h-2 rounded-full ${getStatusColor(s).split(' ')[0]}`} />
                                      {getStatusLabel(s)}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
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

      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
                <h2 className="text-lg font-bold text-white">Add New Project</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-navy-400 mb-1 block">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. AI Agent Platform Build"
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-navy-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-400 mb-1 block">Company</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. TechFlow Inc."
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-navy-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy-400 mb-1 block">Value ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g. 95000"
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-navy-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-navy-400 mb-1 block">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                      className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-navy-400 mb-1 block">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                      className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
                    >
                      {COLUMNS.map((s) => (
                        <option key={s} value={s}>
                          {getStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-navy-400 mb-1 block">Owner</label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-navy-700 text-navy-300 hover:bg-navy-800 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}