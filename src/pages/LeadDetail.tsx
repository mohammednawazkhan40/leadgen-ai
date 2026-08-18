import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fetchTeamMembers } from '../services/api';
import { formatCurrency, formatDate, getScoreColor, getStatusColor, getStatusLabel } from '../utils/helpers';
import { generateOutreachMessage, generateLeadSummary, calculateLeadScore, formatRelativeTime } from '../utils/ai';
import type { TeamMember } from '../types';
import { ArrowLeft, MapPin, Calendar, DollarSign, Bookmark, BookmarkCheck, FolderPlus, ExternalLink, Download, Send, Brain, CheckCircle, Tag, User, Clock, Sparkles, Plus, X, Briefcase, Building2, Globe, Loader2 } from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, projects, addToast, updateLeadStatus, addNote, toggleSaveLead, addTag, removeTag, setReminder, reassignLead, addLeadToProject } = useApp();
  const { user, profile } = useAuth();
  const lead = leads.find(l => l.id === id);
  const senderName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const companyName = profile?.company || 'LeadGen AI';

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (user) {
      fetchTeamMembers(user.id).then(setTeamMembers).catch(() => {});
    }
  }, [user]);

  const [noteContent, setNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [showReassign, setShowReassign] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  if (!lead) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold text-white mb-2">Lead not found</h2>
      <p className="text-gray-400 mb-4">This lead may have been removed.</p>
      <Link to="/app/leads" className="btn-primary">Back to Leads</Link>
    </div>
  );

  const scores = calculateLeadScore(lead);
  const aiSummary = generateLeadSummary(lead);

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNote(lead.id, noteContent.trim(), senderName);
    setNoteContent('');
    setShowNoteForm(false);
    addToast('success', 'Note added');
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(lead.id, newTag.trim());
      addToast('success', `Tag "${newTag.trim()}" added`);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleSetReminder = () => {
    if (!reminderDate) return;
    setReminder(lead.id, reminderDate);
    addToast('success', `Reminder set for ${formatDate(reminderDate)}`);
  };

  const handleExport = () => {
    const csv = `Title,Company,Contact,Score,Status,Budget,Location,Category\n"${lead.title}","${lead.company}","${lead.contactName}",${lead.leadScore},${lead.status},"${lead.budgetMin}-${lead.budgetMax}","${lead.location}","${lead.aiCategory}"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${lead.company}_lead.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Lead exported as CSV');
  };

  const handleGenerateAI = () => {
    setGenerating(true);
    setTimeout(() => {
      const message = generateOutreachMessage(lead, senderName, companyName);
      setMessageDraft(message);
      setGenerating(false);
      addToast('success', 'AI message generated — review and edit before sending');
    }, 2000);
  };

  const handleSendForReview = () => {
    if (!messageDraft.trim()) { addToast('error', 'Please write or generate a message first'); return; }
    setSending(true);
    setTimeout(() => {
      addNote(lead.id, messageDraft.trim(), senderName);
      setMessageDraft('');
      setSending(false);
      addToast('success', 'Message sent for review. You will be notified before it is sent to the recipient.');
    }, 1500);
  };

  const scoreColor = scores.overall >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30' : scores.overall >= 60 ? 'bg-blue-500/10 text-blue-400 border-2 border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border-2 border-amber-500/30';

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/app/leads')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 space-y-5 min-w-0">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`badge ${getStatusColor(lead.status)}`}>{getStatusLabel(lead.status)}</span>
                  <span className="badge bg-blue-500/10 text-blue-400">{lead.aiCategory}</span>
                  <span className="badge bg-gray-800 text-gray-400">{lead.source}</span>
                </div>
                <h1 className="text-xl font-bold text-white mb-1">{lead.title}</h1>
                <p className="text-gray-400">{lead.company} · {lead.contactName}{lead.contactTitle ? ` · ${lead.contactTitle}` : ''}</p>
              </div>
              <select value={lead.status} onChange={(e) => { updateLeadStatus(lead.id, e.target.value as any); addToast('success', 'Status updated'); }} className="input-field w-full sm:w-auto text-sm shrink-0">
                <option value="new">New</option><option value="reviewing">Reviewing</option><option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option><option value="discovery_call">Discovery Call</option>
                <option value="proposal_sent">Proposal Sent</option><option value="won">Won</option><option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-2">Project Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{lead.description}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {lead.skills.map((s) => <span key={s} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-sm">{s}</span>)}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Project Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Location</p><p className="text-white">{lead.location}</p></div></div>
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Work Type</p><p className="text-white capitalize">{lead.remoteType}</p></div></div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Project Type</p><p className="text-white capitalize">{lead.projectType.replace('_', ' ')}</p></div></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Budget</p><p className="text-white">{formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</p></div></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Posted</p><p className="text-white">{formatDate(lead.postedDate)}</p></div></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Found</p><p className="text-white">{formatDate(lead.foundDate || lead.postedDate)}</p></div></div>
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Category</p><p className="text-white">{lead.aiCategory}</p></div></div>
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /><div><p className="text-gray-500 text-xs">Owner</p><p className="text-white">{lead.owner?.name || 'Unassigned'}</p></div></div>
            </div>
          </div>

          <div className="card bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">AI-Generated Summary</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{aiSummary}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Activity Timeline</h3>
            <div className="space-y-3 relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-800" />
              {lead.activities.map((a) => (
                <div key={a.id} className="relative flex gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-[#111827] shrink-0 mt-1 z-10" />
                  <div>
                    <p className="text-sm text-white">{a.description}</p>
                    <p className="text-xs text-gray-500">{a.user} · {formatRelativeTime(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Notes ({lead.notes.length})</h3>
              <button onClick={() => setShowNoteForm(!showNoteForm)} className="btn-ghost text-blue-400 flex items-center gap-1 text-xs">
                {showNoteForm ? 'Cancel' : <><Plus className="w-3 h-3" /> Add Note</>}
              </button>
            </div>
            {showNoteForm && (
              <div className="mb-3 space-y-2">
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="input-field min-h-[80px] text-sm" placeholder="Write a note..." />
                <button onClick={handleAddNote} disabled={!noteContent.trim()} className="btn-primary text-sm disabled:opacity-50">Save Note</button>
              </div>
            )}
            <div className="space-y-3">
              {lead.notes.length === 0 ? <p className="text-sm text-gray-500">No notes yet.</p> : lead.notes.map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-sm text-gray-300">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.author} · {formatRelativeTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-5 shrink-0">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Lead Score Analysis</h3>
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold ${scoreColor}`}>
                {scores.overall}
              </div>
              <p className="text-xs text-gray-400 mt-2">Overall Score</p>
            </div>
            {[
              { label: 'Intent', value: scores.intent, color: 'bg-blue-500' },
              { label: 'Budget Confidence', value: scores.budget, color: 'bg-emerald-500' },
              { label: 'Urgency', value: scores.urgency, color: 'bg-amber-500' },
              { label: 'Technical Fit', value: scores.technical, color: 'bg-purple-500' },
            ].map((s) => (
              <div key={s.label} className="mb-2">
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{s.label}</span><span className="text-white">{s.value}%</span></div>
                <div className="h-1.5 rounded-full bg-gray-800"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} /></div>
              </div>
            ))}
            <div className="mt-3 space-y-1">
              {scores.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span className="text-gray-300">{r}</span></div>
              ))}
            </div>
          </div>

          <div className="card space-y-2">
            <h3 className="font-semibold text-white mb-2">Quick Actions</h3>
            <button onClick={() => { toggleSaveLead(lead.id); addToast('success', lead.saved ? 'Lead unsaved' : 'Lead saved'); }} className="btn-secondary w-full flex items-center gap-2 text-sm">
              {lead.saved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
              {lead.saved ? 'Unsave Lead' : 'Save Lead'}
            </button>
            <button onClick={() => setShowProjectPicker(!showProjectPicker)} className="btn-secondary w-full flex items-center gap-2 text-sm"><FolderPlus className="w-4 h-4" /> Add to Project</button>
            {showProjectPicker && (
              <div className="bg-gray-800 rounded-lg p-2 space-y-1">
                {projects.map((p) => (
                  <button key={p.id} onClick={() => { addLeadToProject(lead.id, p.id); addToast('success', `Added to ${p.name}`); setShowProjectPicker(false); navigate('/app/projects'); }} className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700">{p.name}</button>
                ))}
              </div>
            )}
            {lead.sourceUrl && <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4" /> Open Source</a>}
            <button onClick={handleExport} className="btn-secondary w-full flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Export CSV</button>
            <button onClick={() => navigate('/app/outreach')} className="btn-primary w-full flex items-center gap-2 text-sm"><Send className="w-4 h-4" /> Start Outreach</button>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm">Tags</h3>
              <button onClick={() => setShowTagInput(!showTagInput)} className="text-xs text-blue-400 hover:text-blue-300"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            {showTagInput && (
              <div className="flex gap-1 mb-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} className="input-field text-xs py-1.5 flex-1" placeholder="Tag name" />
                <button onClick={handleAddTag} className="btn-primary text-xs px-2 py-1">Add</button>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">
                  {t}
                  <button onClick={() => { removeTag(lead.id, t); addToast('info', `Tag "${t}" removed`); }} className="text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {lead.tags.length === 0 && <p className="text-xs text-gray-500">No tags</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white text-sm mb-2">Assigned To</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold">{lead.owner?.name?.charAt(0) || '?'}</div>
                <span className="text-sm text-white">{lead.owner?.name || 'Unassigned'}</span>
              </div>
              <button onClick={() => setShowReassign(!showReassign)} className="text-xs text-blue-400 hover:text-blue-300">Reassign</button>
            </div>
            {showReassign && (
              <div className="mt-2 bg-gray-800 rounded-lg p-2 space-y-1">
                {teamMembers.map((m) => (
                  <button key={m.id} onClick={() => { reassignLead(lead.id, m); addToast('success', `Reassigned to ${m.name}`); setShowReassign(false); }} className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-[10px]">{m.name.charAt(0)}</div>
                    {m.name} <span className="text-gray-500 text-xs ml-auto">{m.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-white text-sm mb-2">Follow-up Reminder</h3>
            {lead.reminder && <p className="text-xs text-emerald-400 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Set for {formatDate(lead.reminder)}</p>}
            <div className="flex gap-2">
              <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="input-field text-sm flex-1" />
              <button onClick={handleSetReminder} disabled={!reminderDate} className="btn-primary text-xs px-3 disabled:opacity-50">Set</button>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-2">Draft Outreach</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {['{{first_name}}', '{{company}}', '{{project_title}}', '{{relevant_skill}}'].map((t) => (
                <button key={t} onClick={() => setMessageDraft(prev => prev + t)} className="px-1.5 py-0.5 rounded bg-gray-800 text-blue-300 text-[10px] font-mono hover:bg-gray-700">{t}</button>
              ))}
            </div>
            <textarea value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} className="input-field min-h-[120px] text-xs font-mono" placeholder="Write your outreach message..." />
            <p className="text-[10px] text-gray-500 mt-1">{messageDraft.length} characters</p>
            <div className="flex gap-2 mt-2">
              <button onClick={handleGenerateAI} disabled={generating} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs">
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
              <button onClick={handleSendForReview} disabled={sending || !messageDraft.trim()} className="btn-primary flex-1 flex items-center justify-center gap-1 text-xs disabled:opacity-50">
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {sending ? 'Sending...' : 'Send for Review'}
              </button>
            </div>
            <p className="text-[10px] text-amber-400/70 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> All messages require your review and explicit confirmation before sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
