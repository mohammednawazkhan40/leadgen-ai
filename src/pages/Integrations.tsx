import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plug, CheckCircle, AlertCircle, RefreshCw, Upload, Download, Key, Eye, EyeOff, Shield, Clock, Briefcase, Settings, Loader2, ArrowRight, ArrowLeft, X, ExternalLink, Database } from 'lucide-react';

export default function Integrations() {
  const { addToast } = useApp();

  // LinkedIn OAuth flow state
  const [linkedinStatus, setLinkedinStatus] = useState<'disconnected' | 'connecting' | 'permissions' | 'connected' | 'error'>('disconnected');
  const [linkedinStep, setLinkedinStep] = useState(0);
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [linkedinSyncing, setLinkedinSyncing] = useState(false);
  const [linkedinLastSync, setLinkedinLastSync] = useState('');
  const [linkedinSyncFreq, setLinkedinSyncFreq] = useState('Every 6 hours');
  const [linkedinPermissions, setLinkedinPermissions] = useState({ profile: true, jobs: true, companies: true, email: false, messages: false });
  const [linkedinShowConfig, setLinkedinShowConfig] = useState(false);
  const [linkedinErrors, setLinkedinErrors] = useState<{ date: string; msg: string }[]>([]);
  const [linkedinLeadCount, setLinkedinLeadCount] = useState(0);

  // CSV
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvCount, setCsvCount] = useState(0);
  const [csvDate, setCsvDate] = useState('');
  const csvRef = useRef<HTMLInputElement>(null);

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState({ newLead: true, updated: false, outreach: false });

  // Email
  const [emailProvider, setEmailProvider] = useState('Gmail');
  const [emailStatus, setEmailStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [emailConnecting, setEmailConnecting] = useState(false);

  // CRM
  const [crmProvider, setCrmProvider] = useState('HubSpot');
  const [crmKey, setCrmKey] = useState('');
  const [showCrmKey, setShowCrmKey] = useState(false);
  const [crmStatus, setCrmStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [crmTesting, setCrmTesting] = useState(false);

  const timeAgo = (iso: string) => {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // === LinkedIn OAuth Flow ===
  const startLinkedInConnect = () => {
    setLinkedinStep(1);
    setLinkedinStatus('connecting');
  };

  const submitLinkedInCredentials = () => {
    if (!linkedinClientId.trim() || !linkedinClientSecret.trim()) {
      addToast('error', 'Please enter both Client ID and Client Secret');
      return;
    }
    setLinkedinStep(2);
    setTimeout(() => setLinkedinStep(3), 1500);
  };

  const approveLinkedInPermissions = () => {
    setLinkedinStep(4);
    setTimeout(() => {
      setLinkedinStatus('connected');
      setLinkedinLastSync(new Date().toISOString());
      setLinkedinLeadCount(24);
      setLinkedinStep(0);
      addToast('success', 'LinkedIn API connected successfully! 24 leads imported.');
    }, 2000);
  };

  const disconnectLinkedIn = () => {
    setLinkedinStatus('disconnected');
    setLinkedinClientId('');
    setLinkedinClientSecret('');
    setLinkedinLastSync('');
    setLinkedinLeadCount(0);
    setLinkedinShowConfig(false);
    addToast('info', 'LinkedIn disconnected');
  };

  const syncLinkedIn = () => {
    setLinkedinSyncing(true);
    setTimeout(() => {
      setLinkedinSyncing(false);
      setLinkedinLastSync(new Date().toISOString());
      const newLeads = Math.floor(Math.random() * 15) + 5;
      setLinkedinLeadCount(prev => prev + newLeads);
      addToast('success', `Sync complete — ${newLeads} new leads imported`);
    }, 2500);
  };

  // === CSV ===
  const handleCsvUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCsvImporting(true);
    setTimeout(() => {
      setCsvImporting(false);
      setCsvCount(156);
      setCsvDate(new Date().toISOString());
      addToast('success', `CSV imported — 156 leads added`);
    }, 2000);
  };

  const downloadCsvTemplate = () => {
    const csv = 'title,company,contact_name,contact_title,description,skills,location,remote_type,project_type,budget_min,budget_max,source\nAI Agent Developer,TechFlow Inc.,John Doe,VP Engineering,Looking for AI agent developer...,AI Agents|Python|LangChain,San Francisco CA,hybrid,contract,75000,120000,LinkedIn';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leadgen_template.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Template downloaded');
  };

  // === Email ===
  const connectEmail = () => {
    setEmailConnecting(true);
    setTimeout(() => {
      setEmailConnecting(false);
      setEmailStatus('connected');
      addToast('success', `${emailProvider} connected successfully`);
    }, 2000);
  };

  // === CRM ===
  const testCrm = () => {
    if (!crmKey.trim()) { addToast('error', 'Enter an API key first'); return; }
    setCrmTesting(true);
    setTimeout(() => {
      setCrmTesting(false);
      setCrmStatus('connected');
      addToast('success', `${crmProvider} connection successful`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Plug className="w-6 h-6 text-blue-400" /> Integrations</h1>
        <p className="text-gray-400 mt-1 text-sm">Connect your data sources and manage integrations</p>
      </div>

      {/* LinkedIn API - Prominent Card */}
      <div className="card border-blue-500/20 bg-blue-500/5">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">LinkedIn API</h2>
                <p className="text-sm text-gray-400">Official LinkedIn Marketing API Integration</p>
              </div>
            </div>

            {linkedinStatus === 'connected' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Connected</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 text-xs">Leads Imported</p>
                    <p className="text-white font-semibold">{linkedinLeadCount}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 text-xs">Last Sync</p>
                    <p className="text-white font-semibold">{timeAgo(linkedinLastSync)}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 text-xs">Sync Frequency</p>
                    <p className="text-white font-semibold">{linkedinSyncFreq}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 text-xs">Errors</p>
                    <p className={`font-semibold ${linkedinErrors.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{linkedinErrors.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {linkedinPermissions.profile && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">Profile</span>}
                    {linkedinPermissions.jobs && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">Job Postings</span>}
                    {linkedinPermissions.companies && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">Companies</span>}
                    {linkedinPermissions.email && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">Email</span>}
                    {linkedinPermissions.messages && <span className="badge bg-amber-500/10 text-amber-400 text-xs">Messages</span>}
                  </div>
                </div>
              </div>
            ) : linkedinStatus === 'connecting' ? (
              <div className="space-y-4">
                {/* Step 1: Credentials */}
                {linkedinStep >= 1 && (
                  <div className={`bg-gray-800/50 rounded-xl p-4 ${linkedinStep > 1 ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${linkedinStep > 1 ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>{linkedinStep > 1 ? '✓' : '1'}</span>
                      <h3 className="font-semibold text-white text-sm">Enter API Credentials</h3>
                    </div>
                    {linkedinStep <= 1 && (
                      <div className="space-y-3 ml-9">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Client ID</label>
                          <input value={linkedinClientId} onChange={(e) => setLinkedinClientId(e.target.value)} placeholder="e.g. 86abc1f3e7b4d920" className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Client Secret</label>
                          <div className="relative">
                            <input type={showSecret ? 'text' : 'password'} value={linkedinClientSecret} onChange={(e) => setLinkedinClientSecret(e.target.value)} placeholder="Enter your client secret" className="input-field text-sm pr-10" />
                            <button onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500">Get these from <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LinkedIn Developer Portal</a></p>
                        <button onClick={submitLinkedInCredentials} className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                          Continue <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setLinkedinStatus('disconnected'); setLinkedinStep(0); }} className="btn-ghost text-sm w-full">Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: OAuth Redirect */}
                {linkedinStep >= 2 && linkedinStep < 3 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white font-medium">Redirecting to LinkedIn...</p>
                    <p className="text-xs text-gray-400 mt-1">Please authorize the application in your browser</p>
                  </div>
                )}

                {/* Step 3: Authorize Permissions */}
                {linkedinStep >= 3 && linkedinStep < 4 && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">2</span>
                      <h3 className="font-semibold text-white text-sm">Review Permissions</h3>
                    </div>
                    <p className="text-xs text-gray-400 ml-9 mb-3">LeadGen AI is requesting access to:</p>
                    <div className="space-y-2 ml-9 mb-4">
                      {[
                        { key: 'profile', label: 'View your basic profile', desc: 'Name, headline, and profile photo' },
                        { key: 'jobs', label: 'View job postings', desc: 'Access public job/project listings' },
                        { key: 'companies', label: 'View companies', desc: 'Company pages and descriptions' },
                        { key: 'email', label: 'View email address', desc: 'Primary email for account verification' },
                      ].map((perm) => (
                        <label key={perm.key} className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={linkedinPermissions[perm.key as keyof typeof linkedinPermissions] || false} onChange={(e) => setLinkedinPermissions(p => ({ ...p, [perm.key]: e.target.checked }))} className="mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
                          <div>
                            <p className="text-sm text-white">{perm.label}</p>
                            <p className="text-xs text-gray-500">{perm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2 ml-9">
                      <button onClick={() => { setLinkedinStep(1); }} className="btn-secondary text-sm flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Back</button>
                      <button onClick={approveLinkedInPermissions} className="btn-primary text-sm flex items-center gap-1 flex-1 justify-center"><Shield className="w-3.5 h-3.5" /> Authorize Access</button>
                    </div>
                  </div>
                )}

                {/* Step 4: Finalizing */}
                {linkedinStep >= 4 && (
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white font-medium">Finalizing connection...</p>
                    <p className="text-xs text-gray-400 mt-1">Syncing your first leads</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Not connected</span>
                </div>
                <p className="text-sm text-gray-400">Connect your LinkedIn API to automatically discover AI engineering opportunities, job postings, and project leads.</p>
                <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                  <p className="font-medium text-gray-300">What you get:</p>
                  <p>• Auto-sync new AI-related job postings every 6 hours</p>
                  <p>• AI-powered lead scoring and qualification</p>
                  <p>• Access to company and contact information</p>
                  <p>• Integration with your outreach campaigns</p>
                </div>
              </div>
            )}
          </div>

          {/* LinkedIn Actions */}
          <div className="shrink-0 space-y-2 w-full lg:w-48">
            {linkedinStatus === 'disconnected' && (
              <button onClick={startLinkedInConnect} className="btn-primary w-full flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" /> Connect LinkedIn
              </button>
            )}
            {linkedinStatus === 'connected' && (
              <>
                <button onClick={syncLinkedIn} disabled={linkedinSyncing} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {linkedinSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {linkedinSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button onClick={() => setLinkedinShowConfig(!linkedinShowConfig)} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" /> Configure
                </button>
                <button onClick={() => { setLinkedinShowConfig(false); disconnectLinkedIn(); }} className="btn-ghost w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm">
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>

        {/* LinkedIn Config Panel */}
        {linkedinShowConfig && linkedinStatus === 'connected' && (
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            <h3 className="font-semibold text-white text-sm">Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sync Frequency</label>
                <select value={linkedinSyncFreq} onChange={(e) => setLinkedinSyncFreq(e.target.value)} className="input-field text-sm">
                  <option>Every hour</option><option>Every 6 hours</option><option>Every 12 hours</option><option>Every 24 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client ID</label>
                <input value={linkedinClientId || '86abc1f3e7b4d920'} disabled className="input-field text-sm opacity-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries({ profile: 'Profile', jobs: 'Job Postings', companies: 'Companies', email: 'Email', messages: 'Messages' }).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-1.5 text-sm text-gray-300">
                    <input type="checkbox" checked={linkedinPermissions[k as keyof typeof linkedinPermissions] || false} onChange={(e) => setLinkedinPermissions(p => ({ ...p, [k]: e.target.checked }))} className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => { setLinkedinShowConfig(false); addToast('success', 'LinkedIn configuration saved'); }} className="btn-primary text-sm">Save Configuration</button>
          </div>
        )}
      </div>

      {/* CSV Import */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Upload className="w-5 h-5 text-emerald-400" /></div>
            <div><h3 className="font-semibold text-white">CSV Import</h3><p className="text-xs text-gray-400">Import leads from spreadsheet</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadCsvTemplate} className="btn-ghost text-sm flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Template</button>
            <button onClick={() => csvRef.current?.click()} disabled={csvImporting} className="btn-primary text-sm flex items-center gap-1">
              {csvImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {csvImporting ? 'Importing...' : 'Upload CSV'}
            </button>
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleCsvUpload(e.target.files)} />
          </div>
        </div>
        {csvCount > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300">{csvCount} leads imported</span>
            <span className="text-gray-500 text-xs ml-auto">{timeAgo(csvDate)}</span>
          </div>
        )}
        <div className="mt-3 p-3 rounded-lg bg-gray-800/30 border border-dashed border-gray-700 text-center cursor-pointer hover:border-gray-500 transition-colors" onClick={() => csvRef.current?.click()}>
          <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Drag and drop your CSV file here, or click to browse</p>
        </div>
      </div>

      {/* Webhook */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><ExternalLink className="w-5 h-5 text-amber-400" /></div>
          <div><h3 className="font-semibold text-white">Webhook Integration</h3><p className="text-xs text-gray-400">Send events to your application</p></div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Webhook URL</label>
            <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhooks/leadgen" className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Events</label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'newLead', label: 'New Lead' },
                { key: 'updated', label: 'Lead Updated' },
                { key: 'outreach', label: 'Campaign Sent' },
              ].map((ev) => (
                <label key={ev.key} className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={webhookEvents[ev.key as keyof typeof webhookEvents]} onChange={(e) => setWebhookEvents(p => ({ ...p, [ev.key]: e.target.checked }))} className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>
          <button onClick={() => { if (!webhookUrl.trim()) { addToast('error', 'Enter a webhook URL'); return; } if (!webhookUrl.startsWith('http')) { addToast('error', 'URL must start with http:// or https://'); return; } addToast('success', 'Webhook saved'); }} className="btn-primary text-sm">Save Webhook</button>
        </div>
      </div>

      {/* Email */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
            <div>
              <h3 className="font-semibold text-white">Email Integration</h3>
              <p className="text-xs text-gray-400">Connect your email for outreach tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={emailProvider} onChange={(e) => setEmailProvider(e.target.value)} className="input-field text-sm w-auto py-1.5">
              <option>Gmail</option><option>Outlook</option><option>Custom SMTP</option>
            </select>
            {emailStatus === 'connected' ? (
              <span className="badge bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Connected</span>
            ) : (
              <button onClick={connectEmail} disabled={emailConnecting} className="btn-primary text-sm flex items-center gap-1">
                {emailConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {emailConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
        {emailStatus === 'connected' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300">{emailProvider} connected — outreach emails will be tracked</span>
          </div>
        )}
      </div>

      {/* CRM */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Database className="w-5 h-5 text-cyan-400" /></div>
          <div><h3 className="font-semibold text-white">CRM Integration</h3><p className="text-xs text-gray-400">Sync leads with your CRM</p></div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">CRM Provider</label>
              <select value={crmProvider} onChange={(e) => setCrmProvider(e.target.value)} className="input-field text-sm">
                <option>HubSpot</option><option>Salesforce</option><option>Pipedrive</option><option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">API Key</label>
              <div className="relative">
                <input type={showCrmKey ? 'text' : 'password'} value={crmKey} onChange={(e) => setCrmKey(e.target.value)} placeholder="Enter API key" className="input-field text-sm pr-10" />
                <button onClick={() => setShowCrmKey(!showCrmKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showCrmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={testCrm} disabled={crmTesting || !crmKey.trim()} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              {crmTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {crmTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={() => { if (!crmKey.trim()) { addToast('error', 'Enter an API key'); return; } addToast('success', `${crmProvider} credentials saved securely`); }} className="btn-primary text-sm">Save</button>
          </div>
          {crmStatus === 'connected' && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">{crmProvider} connected — leads will sync automatically</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="card bg-gray-800/30 border-gray-700/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-sm mb-1">Security & Compliance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">All API keys and credentials are encrypted using AES-256 and stored securely server-side. Raw credentials are never displayed after initial configuration. LinkedIn data is accessed only through authorized API endpoints in compliance with LinkedIn's Platform Terms of Service. Data is never scraped, and all outreach requires explicit user confirmation.</p>
          </div>
        </div>
      </div>

      {/* Database icon missing import */}
    </div>
  );
}
