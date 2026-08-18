import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { formatDate } from '../utils/helpers';
import { generateOutreachMessage } from '../utils/ai';
import { Send, Plus, Play, Pause, Trash2, Edit, Eye, Copy, Mail, MessageSquare, Phone, Calendar, Users, TrendingUp, AlertCircle, CheckCircle, Clock, ChevronDown, ChevronUp, Sparkles, Loader2, Wand2, BookOpen, BarChart3 } from 'lucide-react';
import type { OutreachCampaign } from '../types';

interface Campaign extends OutreachCampaign {}

interface DbCampaign {
  id: string;
  name: string;
  subject?: string;
  template: string;
  status: string;
  target_audience?: string;
  total_sent: number;
  total_opened: number;
  total_replied: number;
  total_booked: number;
  total_unsubscribed?: number;
  created_at: string;
  last_updated?: string;
  category?: string;
}

const tokenSamples: Record<string, string> = {
  '{{first_name}}': 'John',
  '{{company}}': 'Acme Corp',
  '{{project_title}}': 'AI Agent Development Project',
  '{{relevant_skill}}': 'RAG Architecture',
};

const categories = ['All', 'AI Agents', 'LLMs & RAG', 'AI Automation', 'Machine Learning', 'Chatbot Dev'];

function dbToCampaign(row: DbCampaign): Campaign {
  return {
    id: row.id,
    name: row.name,
    category: row.category || '',
    template: row.template,
    status: row.status as Campaign['status'],
    sent: row.total_sent || 0,
    opened: row.total_opened || 0,
    replied: row.total_replied || 0,
    bookedCall: row.total_booked || 0,
    unsubscribed: row.total_unsubscribed || 0,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
    subject: row.subject,
    target_audience: row.target_audience,
  };
}

function campaignToDb(c: Partial<Campaign>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (c.name !== undefined) db.name = c.name;
  if (c.category !== undefined) db.category = c.category;
  if (c.template !== undefined) db.template = c.template;
  if (c.status !== undefined) db.status = c.status;
  if (c.subject !== undefined) db.subject = c.subject;
  if (c.target_audience !== undefined) db.target_audience = c.target_audience;
  if (c.sent !== undefined) db.total_sent = c.sent;
  if (c.opened !== undefined) db.total_opened = c.opened;
  if (c.replied !== undefined) db.total_replied = c.replied;
  if (c.bookedCall !== undefined) db.total_booked = c.bookedCall;
  if (c.unsubscribed !== undefined) db.total_unsubscribed = c.unsubscribed;
  db.last_updated = new Date().toISOString();
  return db;
}

export default function Outreach() {
  const { addToast, leads: contextLeads } = useApp();
  const { user, profile } = useAuth();
  const senderName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const companyName = profile?.company || 'LeadGen AI';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'AI Agents', template: '' });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.fetchCampaigns(user.id)
      .then(data => setCampaigns(data.map(dbToCampaign)))
      .catch(() => addToast('error', 'Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, [user, addToast]);

  const insertToken = (token: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = form.template.substring(0, start) + token + form.template.substring(end);
    setForm(p => ({ ...p, template: val }));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + token.length;
      ta.focus();
    }, 0);
  };

  const previewText = Object.entries(tokenSamples).reduce(
    (t, [k, v]) => t.replaceAll(k, v),
    form.template
  );

  const handleAiGenerate = () => {
    if (contextLeads.length === 0) {
      addToast('error', 'No leads available for AI generation');
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      const message = generateOutreachMessage(contextLeads[0], senderName, companyName);
      setForm(p => ({ ...p, template: message }));
      setAiGenerating(false);
      addToast('success', 'AI outreach message generated');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }, 1500);
  };

  const save = async (activate: boolean) => {
    if (!form.name.trim()) {
      addToast('error', 'Campaign name is required');
      return;
    }
    if (!user) return;
    const now = new Date().toISOString();
    if (editing) {
      const updates = campaignToDb({ name: form.name, category: form.category, template: form.template, status: activate ? 'active' : undefined });
      const updated = await api.updateCampaign(editing, updates);
      setCampaigns(prev => prev.map(c => c.id === editing ? { ...dbToCampaign(updated as DbCampaign) } : c));
    } else {
      const newDb = await api.createCampaign(user.id, campaignToDb({
        name: form.name,
        category: form.category,
        template: form.template,
        status: activate ? 'active' : 'draft',
        sent: 0,
        opened: 0,
        replied: 0,
        bookedCall: 0,
        unsubscribed: 0,
      }));
      setCampaigns(prev => [dbToCampaign({ ...newDb, category: form.category } as DbCampaign), ...prev]);
    }
    setForm({ name: '', category: 'AI Agents', template: '' });
    setEditing(null);
    setShowNew(false);
    setPreview(false);
    addToast('success', activate ? 'Campaign activated' : 'Campaign saved as draft');
  };

  const toggleStatus = async (id: string) => {
    const c = campaigns.find(c => c.id === id);
    if (!c) return;
    const newStatus = c.status === 'active' ? 'paused' : 'active';
    await api.updateCampaign(id, campaignToDb({ status: newStatus }));
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, lastUpdated: new Date().toISOString() } : c));
    addToast('success', 'Campaign status updated');
  };

  const deleteCampaign = async (id: string) => {
    await api.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    addToast('info', 'Campaign deleted');
  };

  const startEdit = (c: Campaign) => {
    setForm({ name: c.name, category: c.category || '', template: c.template });
    setEditing(c.id);
    setShowNew(true);
    setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadTemplate = (t: string) => {
    setForm(p => ({ ...p, template: t }));
    setShowNew(true);
    setPreview(false);
    setEditing(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
  const totalBooked = campaigns.reduce((s, c) => s + c.bookedCall, 0);
  const totalUnsubscribed = campaigns.reduce((s, c) => s + c.unsubscribed, 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0';
  const bookedRate = totalSent > 0 ? ((totalBooked / totalSent) * 100).toFixed(1) : '0';
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;

  const filteredCampaigns = catFilter === 'All' ? campaigns : campaigns.filter(c => c.category === catFilter);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'paused': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'completed': return 'bg-accent-500/10 text-accent-400 border border-accent-500/20';
      case 'draft': return 'bg-navy-700 text-navy-300 border border-navy-600';
      default: return 'bg-navy-700 text-navy-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Send className="w-6 h-6 text-accent-400" /> Outreach
          </h1>
          <p className="text-navy-400 mt-1">Manage outreach sequences, craft AI-powered templates, and track engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Mail className="w-5 h-5" />, label: 'Total Sent', value: totalSent.toString(), color: 'bg-accent-500/10 text-accent-400' },
          { icon: <Eye className="w-5 h-5" />, label: 'Open Rate', value: openRate + '%', color: 'bg-emerald-500/10 text-emerald-400' },
          { icon: <MessageSquare className="w-5 h-5" />, label: 'Reply Rate', value: replyRate + '%', color: 'bg-amber-500/10 text-amber-400' },
          { icon: <Calendar className="w-5 h-5" />, label: 'Meetings Booked', value: totalBooked.toString(), color: 'bg-purple-500/10 text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-navy-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: activeCampaigns, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10' },
          { label: 'Paused', value: pausedCampaigns, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10' },
          { label: 'Drafts', value: draftCampaigns, color: 'text-navy-300', bg: 'bg-navy-800/50 border-navy-700' },
          { label: 'Booked Rate', value: parseFloat(bookedRate), color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-500/10', suffix: '%' },
        ].map((s, i) => (
          <div key={i} className={`rounded-lg border p-3 ${s.bg}`}>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}{s.suffix || ''}</p>
            <p className="text-xs text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                catFilter === c ? 'bg-accent-600 text-white' : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setShowNew(!showNew);
            setEditing(null);
            setForm({ name: '', category: 'AI Agents', template: '' });
            setPreview(false);
          }}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {showNew && (
        <div className="card space-y-4 border border-accent-500/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              {editing ? <Edit className="w-4 h-4 text-accent-400" /> : <Plus className="w-4 h-4 text-accent-400" />}
              {editing ? 'Edit Campaign' : 'New Campaign'}
            </h3>
            <button onClick={() => { setShowNew(false); setEditing(null); }} className="text-navy-400 hover:text-white">
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-400 mb-1">Campaign Name</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field"
                placeholder="e.g., AI Agent Outreach Q3"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="input-field"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-navy-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Template
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-accent-600 text-white text-xs font-medium hover:from-purple-500 hover:to-accent-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> AI Generate
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPreview(!preview)}
                  className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
                >
                  {preview ? <><Edit className="w-3 h-3" /> Edit</> : <><Eye className="w-3 h-3" /> Preview</>}
                </button>
              </div>
            </div>

            {preview ? (
              <div className="input-field min-h-[180px] whitespace-pre-wrap text-navy-200 leading-relaxed">
                {previewText || (
                  <span className="text-navy-500 italic">Nothing to preview. Write a template or click AI Generate.</span>
                )}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={form.template}
                onChange={e => setForm(p => ({ ...p, template: e.target.value }))}
                className="input-field min-h-[180px] font-mono text-sm leading-relaxed resize-y"
                placeholder="Write your outreach template here...&#10;&#10;Use tokens like {{first_name}}, {{company}}, {{project_title}} for personalization.&#10;&#10;Or click AI Generate to create a template automatically."
                spellCheck={false}
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-3.5 h-3.5 text-navy-500" />
              <span className="text-xs text-navy-500 font-medium">Insert Tokens</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tokenSamples).map(([token, sample]) => (
                <button
                  key={token}
                  onClick={() => insertToken(token)}
                  className="group px-2.5 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-accent-300 text-xs font-mono hover:bg-accent-600/10 hover:border-accent-500/30 hover:text-accent-300 transition-all"
                  title={`Inserts ${token} → "${sample}"`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {aiGenerating && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-300 font-medium">AI is crafting your outreach message...</p>
                <p className="text-xs text-purple-400/60 mt-0.5">Analyzing lead data and generating personalized content</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300/80">All messages require your review and explicit confirmation before sending to recipients. No outreach is automated without approval.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => save(false)} className="btn-secondary">
              Save as Draft
            </button>
            <button onClick={() => save(true)} className="btn-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-navy-400 border-b border-navy-800">
              <th className="pb-3 font-medium">Campaign</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Sent</th>
              <th className="pb-3 font-medium text-right">Open Rate</th>
              <th className="pb-3 font-medium text-right">Reply Rate</th>
              <th className="pb-3 font-medium text-right">Booked</th>
              <th className="pb-3 font-medium">Last Updated</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map(c => {
              const or = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : '0';
              const rr = c.sent > 0 ? ((c.replied / c.sent) * 100).toFixed(1) : '0';
              return (
                <tr key={c.id} className="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 text-navy-400">{c.category}</td>
                  <td className="py-3"><span className={`badge ${statusColor(c.status)}`}>{c.status}</span></td>
                  <td className="py-3 text-right">{c.sent}</td>
                  <td className="py-3 text-right">{or}%</td>
                  <td className="py-3 text-right">{rr}%</td>
                  <td className="py-3 text-right">{c.bookedCall}</td>
                  <td className="py-3 text-navy-400">{formatDate(c.lastUpdated || '')}</td>
                  <td className="py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-white transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleStatus(c.id)} className="p-2 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-white transition-colors" title={c.status === 'active' ? 'Pause' : 'Resume'}>
                        {c.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteCampaign(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-navy-500">
            <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No campaigns found for this category</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filteredCampaigns.map(c => {
          const or = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : '0';
          const rr = c.sent > 0 ? ((c.replied / c.sent) * 100).toFixed(1) : '0';
          const isExpanded = expandedCampaign === c.id;
          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{c.name}</h4>
                    <span className={`badge text-xs flex-shrink-0 ${statusColor(c.status)}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-navy-400">{c.category} · {formatDate(c.lastUpdated || '')}</p>
                </div>
                <button
                  onClick={() => setExpandedCampaign(isExpanded ? null : c.id)}
                  className="p-1.5 rounded-lg hover:bg-navy-700 text-navy-400 transition-colors flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 rounded-lg bg-navy-800/50">
                  <p className="text-sm font-bold">{c.sent}</p>
                  <p className="text-xs text-navy-500">Sent</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-navy-800/50">
                  <p className="text-sm font-bold text-emerald-400">{or}%</p>
                  <p className="text-xs text-navy-500">Opened</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-navy-800/50">
                  <p className="text-sm font-bold text-amber-400">{rr}%</p>
                  <p className="text-xs text-navy-500">Replied</p>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-navy-800 space-y-3">
                  <div className="p-2 rounded-lg bg-navy-800/30">
                    <p className="text-xs text-navy-500 mb-1">Template Preview</p>
                    <p className="text-xs text-navy-300 whitespace-pre-wrap line-clamp-4">{c.template}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => toggleStatus(c.id)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                      {c.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                    </button>
                    <button onClick={() => deleteCampaign(c.id)} className="btn-secondary text-xs py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredCampaigns.length === 0 && (
          <div className="card text-center py-8 text-navy-500">
            <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No campaigns found for this category</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold">Template Library</h3>
          <span className="badge bg-accent-500/10 text-accent-400 text-xs">{campaigns.length} templates</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="card-hover group">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm group-hover:text-accent-300 transition-colors">{c.name}</span>
                <span className={`badge text-xs ${statusColor(c.status)}`}>{c.status}</span>
              </div>
              <p className="text-xs text-navy-400 mb-1">{c.category}</p>
              <div className="bg-navy-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-navy-300 line-clamp-4 whitespace-pre-wrap font-mono leading-relaxed">{c.template}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-navy-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.sent}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(0) : 0}%</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.bookedCall}</span>
                </div>
                <button
                  onClick={() => loadTemplate(c.template)}
                  className="flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 transition-colors"
                >
                  <Copy className="w-3 h-3" /> Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold">Campaign Performance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Sent', value: totalSent, color: 'text-accent-400' },
            { label: 'Total Opened', value: totalOpened, color: 'text-emerald-400' },
            { label: 'Total Replied', value: totalReplied, color: 'text-amber-400' },
            { label: 'Meetings Booked', value: totalBooked, color: 'text-purple-400' },
            { label: 'Unsubscribed', value: totalUnsubscribed, color: 'text-red-400' },
            { label: 'Conversion', value: totalSent > 0 ? ((totalBooked / totalSent) * 100).toFixed(1) + '%' : '0%', color: 'text-cyan-400' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-navy-800/30">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-navy-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
