import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { teamMembers as initialMembers, currentUser } from '../data/mockData';
import { TeamMember, UserRole } from '../types';
import {
  Users,
  Target,
  Tag,
  Bell,
  Shield,
  Key,
  CreditCard,
  Plus,
  X,
  Save,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Download,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

type TabId = 'team' | 'scoring' | 'keywords' | 'notifications' | 'privacy' | 'api' | 'billing';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'team', label: 'Team Members', icon: <Users className="w-5 h-5" /> },
  { id: 'scoring', label: 'Lead Scoring Rules', icon: <Target className="w-5 h-5" /> },
  { id: 'keywords', label: 'Target Keywords', icon: <Tag className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'privacy', label: 'Data & Privacy', icon: <Shield className="w-5 h-5" /> },
  { id: 'api', label: 'API Configuration', icon: <Key className="w-5 h-5" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
];

const roleColors: Record<UserRole, string> = {
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  manager: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  user: 'bg-navy-600/30 text-navy-300 border-navy-600/30',
  member: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer: 'bg-navy-600/30 text-navy-400 border-navy-600/30',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function TeamMembersSection() {
  const { addToast } = useApp();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `u${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      avatar: '',
      role: inviteRole,
    };
    setMembers([...members, newMember]);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('user');
    setShowInvite(false);
    addToast('success', `Invitation sent to ${newMember.email}`);
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
    addToast('success', 'Role updated');
  };

  const handleRemove = (id: string) => {
    if (id === currentUser.id) return;
    setMembers(members.filter(m => m.id !== id));
    setConfirmRemoveId(null);
    addToast('success', 'Member removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Team Members</h2>
          <p className="text-navy-400 text-sm mt-1">Manage your team and their roles</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="card border-accent-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Invite Team Member</h3>
            <button onClick={() => setShowInvite(false)} className="text-navy-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                placeholder="Full name"
                className="input-field flex-1"
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="input-field flex-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as UserRole)}
                className="input-field w-full sm:w-40"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} className="btn-primary whitespace-nowrap flex items-center gap-2">
                <Check className="w-4 h-4" />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="card flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-600/20 border border-accent-500/30 flex items-center justify-center text-accent-400 font-semibold text-sm shrink-0">
                {getInitials(member.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{member.name}</p>
                  {member.id === currentUser.id && (
                    <span className="text-navy-500 text-xs">(You)</span>
                  )}
                </div>
                <p className="text-navy-400 text-sm">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={member.role}
                onChange={e => handleRoleChange(member.id, e.target.value as UserRole)}
                className="input-field w-32 text-xs py-1.5"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
              <span className={`badge border text-xs ${roleColors[member.role]}`}>
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
              {member.id !== currentUser.id && (
                confirmRemoveId === member.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/30"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmRemoveId(null)}
                      className="text-xs bg-navy-700 text-navy-300 px-2 py-1 rounded hover:bg-navy-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemoveId(member.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-navy-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadScoringSection() {
  const { addToast } = useApp();
  const savedRules = JSON.parse(localStorage.getItem('leadgen_scoring_rules') || 'null');
  const [intentWeight, setIntentWeight] = useState(savedRules?.intentWeight ?? 30);
  const [budgetWeight, setBudgetWeight] = useState(savedRules?.budgetWeight ?? 25);
  const [urgencyWeight, setUrgencyWeight] = useState(savedRules?.urgencyWeight ?? 20);
  const [technicalWeight, setTechnicalWeight] = useState(savedRules?.technicalWeight ?? 25);
  const [minScore, setMinScore] = useState(savedRules?.minScore ?? 60);
  const [autoQualify, setAutoQualify] = useState(savedRules?.autoQualify ?? true);

  const totalWeight = intentWeight + budgetWeight + urgencyWeight + technicalWeight;

  const previewScore = totalWeight > 0 ? Math.round(
    (85 * intentWeight + 72 * budgetWeight + 68 * urgencyWeight + 90 * technicalWeight) / totalWeight
  ) : 0;

  const handleSave = () => {
    const rules = { intentWeight, budgetWeight, urgencyWeight, technicalWeight, minScore, autoQualify };
    localStorage.setItem('leadgen_scoring_rules', JSON.stringify(rules));
    addToast('success', 'Scoring rules saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Lead Scoring Rules</h2>
        <p className="text-navy-400 text-sm mt-1">Configure how leads are scored and ranked</p>
      </div>

      <div className="card space-y-6">
        <h3 className="font-semibold text-white">Scoring Weights</h3>
        {[
          { label: 'Intent Score', value: intentWeight, set: setIntentWeight, color: 'accent' },
          { label: 'Budget Confidence', value: budgetWeight, set: setBudgetWeight, color: 'emerald' },
          { label: 'Urgency', value: urgencyWeight, set: setUrgencyWeight, color: 'amber' },
          { label: 'Technical Fit', value: technicalWeight, set: setTechnicalWeight, color: 'purple' },
        ].map(item => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-200 text-sm">{item.label}</span>
              <span className="text-white font-medium text-sm">{item.value}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={item.value}
              onChange={e => item.set(Number(e.target.value))}
              className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-accent-500"
            />
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-navy-800">
          <span className="text-navy-400 text-sm">Total Weight</span>
          <span className={`font-medium text-sm ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalWeight}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <label className="text-navy-300 text-sm mb-2 block">Minimum Lead Score Threshold</label>
          <input
            type="number"
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            min={0}
            max={100}
            className="input-field"
          />
          <p className="text-navy-500 text-xs mt-1">Leads below this score won't appear in qualified list</p>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Auto-Qualification</p>
            <p className="text-navy-400 text-sm">Automatically qualify leads above threshold</p>
          </div>
          <button
            onClick={() => setAutoQualify(!autoQualify)}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoQualify ? 'bg-accent-500' : 'bg-navy-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${autoQualify ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Score Preview</h3>
        <p className="text-navy-400 text-sm mb-4">Example: How a lead with Intent 85, Budget 72, Urgency 68, Technical 90 would be scored</p>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-accent-400">{previewScore}</div>
          <div>
            <p className="text-white font-medium">Calculated Score</p>
            <p className="text-navy-400 text-sm">Weighted average using your current rules</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Intent', val: 85, w: intentWeight },
            { label: 'Budget', val: 72, w: budgetWeight },
            { label: 'Urgency', val: 68, w: urgencyWeight },
            { label: 'Technical', val: 90, w: technicalWeight },
          ].map(s => (
            <div key={s.label} className="bg-navy-800/50 rounded-lg p-3 text-center">
              <p className="text-navy-400 text-xs">{s.label}</p>
              <p className="text-white font-semibold">{s.val}</p>
              <p className="text-navy-500 text-xs">×{s.w}%</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" />
        Save Rules
      </button>
    </div>
  );
}

function TargetKeywordsSection() {
  const { addToast } = useApp();
  const savedKeywords = JSON.parse(localStorage.getItem('leadgen_keywords') || 'null');
  const defaultKeywords = [
    'AI agent developer',
    'LLM engineer',
    'RAG development',
    'AI automation consultant',
    'machine learning',
    'chatbot development',
    'NLP specialist',
    'computer vision',
  ];
  const [keywords, setKeywords] = useState<string[]>(savedKeywords ?? defaultKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [suggested] = useState(['AI engineer', 'deep learning', 'transformer models', 'vector database', 'fine-tuning']);

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setNewKeyword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      addKeyword(newKeyword);
    }
  };

  const handleSave = () => {
    localStorage.setItem('leadgen_keywords', JSON.stringify(keywords));
    addToast('success', 'Keywords saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Target Keywords</h2>
        <p className="text-navy-400 text-sm mt-1">Define keywords to discover relevant leads</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-3">Current Keywords</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map(kw => (
            <span key={kw} className="inline-flex items-center gap-1.5 bg-accent-500/10 text-accent-400 border border-accent-500/20 px-3 py-1.5 rounded-full text-sm">
              {kw}
              <button onClick={() => removeKeyword(kw)} className="hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {keywords.length === 0 && (
            <p className="text-navy-500 text-sm">No keywords added yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a keyword..."
            className="input-field flex-1"
          />
          <button onClick={() => { if (newKeyword.trim()) addKeyword(newKeyword); }} className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-3">Suggested Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {suggested
            .filter(kw => !keywords.includes(kw))
            .map(kw => (
              <button
                key={kw}
                onClick={() => addKeyword(kw)}
                className="inline-flex items-center gap-1.5 bg-navy-800/60 text-navy-200 border border-navy-700 hover:border-accent-500/50 hover:text-accent-400 px-3 py-1.5 rounded-full text-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {kw}
              </button>
            ))}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" />
        Save Keywords
      </button>
    </div>
  );
}

function NotificationsSection() {
  const { addToast } = useApp();
  const savedPrefs = JSON.parse(localStorage.getItem('leadgen_notifications') || 'null');
  const [prefs, setPrefs] = useState({
    newLeads: savedPrefs?.newLeads ?? true,
    dailyDigest: savedPrefs?.dailyDigest ?? true,
    weeklySummary: savedPrefs?.weeklySummary ?? false,
    outreachReplies: savedPrefs?.outreachReplies ?? true,
    pipelineUpdates: savedPrefs?.pipelineUpdates ?? true,
    teamActivity: savedPrefs?.teamActivity ?? false,
    emailEnabled: savedPrefs?.emailEnabled ?? true,
    inAppEnabled: savedPrefs?.inAppEnabled ?? true,
    quietStart: savedPrefs?.quietStart ?? '22:00',
    quietEnd: savedPrefs?.quietEnd ?? '07:00',
  });

  const toggle = (key: keyof typeof prefs) => {
    if (typeof prefs[key] === 'boolean') {
      setPrefs({ ...prefs, [key]: !prefs[key] });
    }
  };

  const handleSave = () => {
    localStorage.setItem('leadgen_notifications', JSON.stringify(prefs));
    addToast('success', 'Notification preferences saved');
  };

  const notifications = [
    { key: 'newLeads' as const, label: 'New Lead Alerts', desc: 'When a new lead matching your criteria is found' },
    { key: 'dailyDigest' as const, label: 'Daily Digest', desc: 'Summary of daily lead activity and metrics' },
    { key: 'weeklySummary' as const, label: 'Weekly Summary', desc: 'Comprehensive weekly performance report' },
    { key: 'outreachReplies' as const, label: 'Outreach Replies', desc: 'When someone replies to your outreach' },
    { key: 'pipelineUpdates' as const, label: 'Pipeline Updates', desc: 'When leads move between pipeline stages' },
    { key: 'teamActivity' as const, label: 'Team Activity', desc: 'Updates from team members on assigned leads' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
        <p className="text-navy-400 text-sm mt-1">Choose what you want to be notified about</p>
      </div>

      <div className="card space-y-1">
        <h3 className="font-semibold text-white mb-3">Alerts</h3>
        {notifications.map(n => (
          <div key={n.key} className="flex items-center justify-between py-3 border-b border-navy-800/50 last:border-0">
            <div>
              <p className="text-white text-sm font-medium">{n.label}</p>
              <p className="text-navy-500 text-xs">{n.desc}</p>
            </div>
            <button onClick={() => toggle(n.key)} className={`relative w-12 h-6 rounded-full transition-colors ${prefs[n.key] ? 'bg-accent-500' : 'bg-navy-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${prefs[n.key] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Email Notifications</p>
            <p className="text-navy-400 text-sm">Receive alerts via email</p>
          </div>
          <button onClick={() => toggle('emailEnabled')} className={`relative w-12 h-6 rounded-full transition-colors ${prefs.emailEnabled ? 'bg-accent-500' : 'bg-navy-700'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${prefs.emailEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-white font-medium">In-App Notifications</p>
            <p className="text-navy-400 text-sm">Show notifications in the dashboard</p>
          </div>
          <button onClick={() => toggle('inAppEnabled')} className={`relative w-12 h-6 rounded-full transition-colors ${prefs.inAppEnabled ? 'bg-accent-500' : 'bg-navy-700'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${prefs.inAppEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Quiet Hours</h3>
        <p className="text-navy-400 text-sm mb-4">No notifications during these hours</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-navy-300 text-xs mb-1 block">Start Time</label>
            <input
              type="time"
              value={prefs.quietStart}
              onChange={e => setPrefs({ ...prefs, quietStart: e.target.value })}
              className="input-field"
            />
          </div>
          <span className="text-navy-500 mt-5">to</span>
          <div className="flex-1">
            <label className="text-navy-300 text-xs mb-1 block">End Time</label>
            <input
              type="time"
              value={prefs.quietEnd}
              onChange={e => setPrefs({ ...prefs, quietEnd: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" />
        Save Preferences
      </button>
    </div>
  );
}

function DataPrivacySection() {
  const { addToast, leads, projects } = useApp();
  const [retention, setRetention] = useState('90');
  const [autoDelete, setAutoDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify({ leads, projects }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadgen_export.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Data export downloaded');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    addToast('info', 'Account scheduled for deletion');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Data & Privacy</h2>
        <p className="text-navy-400 text-sm mt-1">Manage data retention and privacy settings</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Data Retention</h3>
        <label className="text-navy-300 text-sm mb-2 block">Retention Period</label>
        <select
          value={retention}
          onChange={e => setRetention(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
          <option value="180">180 days</option>
          <option value="365">365 days</option>
        </select>
        <p className="text-navy-500 text-xs mt-1">Leads older than this period will be eligible for deletion</p>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Auto-Delete Unqualified Leads</p>
          <p className="text-navy-400 text-sm">Automatically remove leads marked as unqualified after retention period</p>
        </div>
        <button onClick={() => setAutoDelete(!autoDelete)} className={`relative w-12 h-6 rounded-full transition-colors ${autoDelete ? 'bg-accent-500' : 'bg-navy-700'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${autoDelete ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Export Data</h3>
        <p className="text-navy-400 text-sm mb-4">Download all your lead data, outreach history, and project information</p>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export All Data
        </button>
      </div>

      <div className="card border-red-500/30">
        <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-navy-400 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
            <p className="text-red-400 text-sm font-medium">Are you absolutely sure? This will permanently delete:</p>
            <ul className="text-navy-400 text-sm list-disc list-inside space-y-1">
              <li>All lead data and history</li>
              <li>All projects and communications</li>
              <li>All team member data</li>
              <li>All API configurations</li>
            </ul>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); addToast('info', 'Account deletion cancelled'); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card bg-navy-800/30">
        <p className="text-navy-400 text-sm">
          Data collected through authorized integrations only. See our{' '}
          <span className="text-accent-400 cursor-pointer hover:text-accent-300">API Compliance</span> and{' '}
          <span className="text-accent-400 cursor-pointer hover:text-accent-300">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function ApiConfigSection() {
  const { addToast } = useApp();
  const savedWebhook = localStorage.getItem('leadgen_webhook_url') || '';
  const savedApiKey = localStorage.getItem('leadgen_api_key') || '';
  const [webhookUrl, setWebhookUrl] = useState(savedWebhook);
  const [apiKey, setApiKey] = useState(savedApiKey);
  const [keyShown, setKeyShown] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(!!savedApiKey);

  const usage = 45;
  const limit = 100;

  const generateKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const key = `lg_${Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
    setApiKey(key);
    setKeyShown(true);
    setKeyGenerated(true);
    localStorage.setItem('leadgen_api_key', key);
    addToast('success', 'New API key generated');
  };

  const saveWebhook = () => {
    localStorage.setItem('leadgen_webhook_url', webhookUrl);
    addToast('success', 'Webhook URL saved');
  };

  const usageStats = [
    { label: 'API Calls Today', value: '312' },
    { label: 'Webhooks Delivered', value: '89' },
    { label: 'Failed Requests', value: '3' },
    { label: 'Avg Response Time', value: '145ms' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">API Configuration</h2>
        <p className="text-navy-400 text-sm mt-1">Manage API access and integrations</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-3">Rate Limit Status</h3>
        <p className="text-navy-400 text-sm mb-4">LinkedIn API: {limit} requests/hour</p>
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-navy-300">Current Usage</span>
            <span className="text-white font-medium">{usage}/{limit}</span>
          </div>
          <div className="w-full bg-navy-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${usage / limit > 0.8 ? 'bg-red-500' : usage / limit > 0.5 ? 'bg-amber-500' : 'bg-accent-500'}`}
              style={{ width: `${(usage / limit) * 100}%` }}
            />
          </div>
        </div>
        <p className="text-navy-500 text-xs">Resets in 42 minutes</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-3">Webhook Configuration</h3>
        <label className="text-navy-300 text-sm mb-2 block">Webhook URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            className="input-field flex-1"
          />
          <button onClick={saveWebhook} className="btn-secondary whitespace-nowrap flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
        <p className="text-navy-500 text-xs mt-1">POST requests will be sent to this URL for lead events</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">API Key</h3>
          <button onClick={generateKey} className="btn-secondary flex items-center gap-2 text-xs">
            <Key className="w-3.5 h-3.5" />
            {keyGenerated ? 'Regenerate Key' : 'Generate New Key'}
          </button>
        </div>
        {keyGenerated ? (
          <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-3 flex items-center justify-between">
            <code className="text-navy-200 text-sm font-mono truncate">
              {keyShown ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}
            </code>
            <button
              onClick={() => setKeyShown(!keyShown)}
              className="text-navy-400 hover:text-white ml-2 shrink-0"
            >
              {keyShown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <p className="text-navy-500 text-sm">No API key generated yet</p>
        )}
        {keyShown && keyGenerated && (
          <p className="text-amber-400/80 text-xs mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Copy this key now. It won't be shown again.
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {usageStats.map(stat => (
            <div key={stat.label} className="bg-navy-800/50 rounded-lg p-3 text-center">
              <p className="text-white font-semibold text-lg">{stat.value}</p>
              <p className="text-navy-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSection() {
  const { addToast } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Billing</h2>
        <p className="text-navy-400 text-sm mt-1">Manage your subscription and billing</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-navy-400 text-sm">Current Plan</p>
            <p className="text-2xl font-bold text-white">Professional</p>
          </div>
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm px-3 py-1">Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-navy-800/50 rounded-lg p-4">
            <p className="text-navy-400 text-sm">Leads Used</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-white text-2xl font-bold">1,247</p>
              <p className="text-navy-500 text-sm mb-1">/ 2,500</p>
            </div>
            <div className="w-full bg-navy-700 rounded-full h-2 mt-3">
              <div className="bg-accent-500 h-2 rounded-full" style={{ width: '49.9%' }} />
            </div>
          </div>
          <div className="bg-navy-800/50 rounded-lg p-4">
            <p className="text-navy-400 text-sm">Next Billing Date</p>
            <p className="text-white text-2xl font-bold mt-1">Sep 15, 2026</p>
            <p className="text-navy-500 text-sm mt-1">$49/month</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Plan Comparison</h3>
        <div className="space-y-3">
          {[
            { plan: 'Starter', price: '$19/mo', leads: '500 leads', active: false },
            { plan: 'Professional', price: '$49/mo', leads: '2,500 leads', active: true },
            { plan: 'Enterprise', price: '$149/mo', leads: 'Unlimited leads', active: false },
          ].map(p => (
            <div key={p.plan} className={`flex items-center justify-between p-3 rounded-lg border ${p.active ? 'border-accent-500/30 bg-accent-500/5' : 'border-navy-700 bg-navy-800/30'}`}>
              <div className="flex items-center gap-3">
                {p.active && <Check className="w-4 h-4 text-accent-400" />}
                <div>
                  <p className="text-white font-medium text-sm">{p.plan}</p>
                  <p className="text-navy-400 text-xs">{p.leads}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-sm">{p.price}</span>
                {p.active && <span className="badge bg-accent-500/10 text-accent-400 border border-accent-500/20 text-xs">Current</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => addToast('info', 'Stripe integration coming soon')} className="btn-primary flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Upgrade Plan
        </button>
        <button onClick={() => addToast('info', 'Billing portal coming soon')} className="btn-secondary flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          Manage Billing
        </button>
      </div>

      <div className="card bg-navy-800/30 border-amber-500/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-navy-300 text-sm">Stripe integration coming soon</p>
        </div>
      </div>
    </div>
  );
}

const sectionComponents: Record<TabId, React.FC> = {
  team: TeamMembersSection,
  scoring: LeadScoringSection,
  keywords: TargetKeywordsSection,
  notifications: NotificationsSection,
  privacy: DataPrivacySection,
  api: ApiConfigSection,
  billing: BillingSection,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('team');
  const ActiveSection = sectionComponents[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-navy-400 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0">
          <div className="flex overflow-x-auto lg:flex-col gap-1 pb-2 lg:pb-0 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-600/10 text-accent-400 border border-accent-500/20'
                    : 'text-navy-400 hover:text-white hover:bg-navy-800/60 border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}
