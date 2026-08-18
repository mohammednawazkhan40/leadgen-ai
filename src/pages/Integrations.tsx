import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getLinkedInAuthUrl, parseLinkedInCSV, linkedinRowToLead } from '../services/linkedin'
import { Upload, Download, CheckCircle, AlertCircle, Loader2, Link as LinkIcon, Settings, RefreshCw, FileText, ArrowRight, ExternalLink, Copy, X, Save, Linkedin } from 'lucide-react'
import LinkedInDemoConnector from '../components/LinkedInDemoConnector'

interface IntegrationSettings {
  webhook?: { url: string; secret: string; events: string[]; connected: boolean }
  email?: { host: string; port: string; user: string; pass: string; connected: boolean }
  hubspot?: { apiKey: string; connected: boolean }
  salesforce?: { apiKey: string; connected: boolean }
  linkedin?: { connected: boolean; firstName?: string; lastName?: string; email?: string; headline?: string }
}

export default function Integrations() {
  const { addToast, createLead } = useApp()
  const { user } = useAuth()

  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [linkedinProfile, setLinkedinProfile] = useState<{ firstName: string; lastName: string; headline: string; email?: string; picture?: string } | null>(null)
  const [linkedinConnecting, setLinkedinConnecting] = useState(false)
  const [linkedinManualFirst, setLinkedinManualFirst] = useState('')
  const [linkedinManualLast, setLinkedinManualLast] = useState('')
  const [linkedinManualHeadline, setLinkedinManualHeadline] = useState('')
  const [linkedinManualEmail, setLinkedinManualEmail] = useState('')
  const [linkedinManualUrl, setLinkedinManualUrl] = useState('')

  const [linkedinText, setLinkedinText] = useState('')
  const [linkedinCsvFile, setLinkedinCsvFile] = useState<File | null>(null)
  const [linkedinPreview, setLinkedinPreview] = useState<Array<Record<string, string>>>([])
  const [linkedinParsedLeads, setLinkedinParsedLeads] = useState<Array<Partial<import('../types').Lead>>>([])
  const [linkedinImporting, setLinkedinImporting] = useState(false)
  const linkedinFileRef = useRef<HTMLInputElement>(null)
  const linkedinTextAreaRef = useRef<HTMLTextAreaElement>(null)

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>>>([])
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvDragOver, setCsvDragOver] = useState(false)
  const csvFileRef = useRef<HTMLInputElement>(null)

  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['new_lead', 'lead_updated', 'campaign_sent'])
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [webhookSaving, setWebhookSaving] = useState(false)
  const [webhookConnected, setWebhookConnected] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpTesting, setSmtpTesting] = useState(false)
  const [smtpConnected, setSmtpConnected] = useState(false)
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [showSmtpPass, setShowSmtpPass] = useState(false)

  const [hubspotConnected, setHubspotConnected] = useState(false)
  const [hubspotKey, setHubspotKey] = useState('')
  const [hubspotTesting, setHubspotTesting] = useState(false)
  const [hubspotSaving, setHubspotSaving] = useState(false)
  const [salesforceConnected, setSalesforceConnected] = useState(false)
  const [salesforceKey, setSalesforceKey] = useState('')
  const [salesforceTesting, setSalesforceTesting] = useState(false)
  const [salesforceSaving, setSalesforceSaving] = useState(false)
  const [showHubspotKey, setShowHubspotKey] = useState(false)
  const [showSalesforceKey, setShowSalesforceKey] = useState(false)
  const [showLinkedInDemo, setShowLinkedInDemo] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('user_settings').select('integrations').eq('user_id', user.id).single()
      if (!data?.integrations) return
      const integ = data.integrations as IntegrationSettings

      if (integ.webhook) {
        setWebhookUrl(integ.webhook.url || '')
        setWebhookSecret(integ.webhook.secret || '')
        setWebhookEvents(integ.webhook.events || ['new_lead', 'lead_updated', 'campaign_sent'])
        setWebhookConnected(integ.webhook.connected || false)
      }
      if (integ.email) {
        setSmtpHost(integ.email.host || '')
        setSmtpPort(integ.email.port || '587')
        setSmtpUser(integ.email.user || '')
        setSmtpPass(integ.email.pass || '')
        setSmtpConnected(integ.email.connected || false)
      }
      if (integ.hubspot) {
        setHubspotKey(integ.hubspot.apiKey || '')
        setHubspotConnected(integ.hubspot.connected || false)
      }
      if (integ.salesforce) {
        setSalesforceKey(integ.salesforce.apiKey || '')
        setSalesforceConnected(integ.salesforce.connected || false)
      }
      if (integ.linkedin) {
        setLinkedinConnected(integ.linkedin.connected || false)
        setLinkedinProfile({
          firstName: integ.linkedin.firstName || '',
          lastName: integ.linkedin.lastName || '',
          headline: integ.linkedin.headline || '',
          email: integ.linkedin.email,
        })
      }
    } catch { /* settings row may not exist yet */ }
  }, [user])

  useEffect(() => { loadSettings() }, [loadSettings])

  const saveIntegrations = async (patch: Partial<IntegrationSettings>) => {
    if (!user) return
    const { data: existing } = await supabase.from('user_settings').select('integrations').eq('user_id', user.id).single()
    const current = (existing?.integrations as IntegrationSettings) || {}
    const merged = { ...current, ...patch }
    const { error } = await supabase.from('user_settings').upsert({ user_id: user.id, integrations: merged }, { onConflict: 'user_id' })
    if (error) throw error
  }

  const handleLinkedInConnect = () => {
    setLinkedinConnecting(true)
    window.location.href = getLinkedInAuthUrl()
  }

  const handleLinkedInManualConnect = async () => {
    if (!linkedinManualFirst.trim() || !linkedinManualLast.trim()) return
    const profile = { firstName: linkedinManualFirst.trim(), lastName: linkedinManualLast.trim(), headline: linkedinManualHeadline.trim(), email: linkedinManualEmail.trim() }
    setLinkedinProfile(profile)
    setLinkedinConnected(true)
    localStorage.setItem('linkedin_connected', 'true')
    localStorage.setItem('linkedin_profile', JSON.stringify(profile))
    await saveIntegrations({ linkedin: { connected: true, ...profile } }).catch(() => {})
    addToast('success', `LinkedIn connected as ${profile.firstName} ${profile.lastName}`)
    setLinkedinManualFirst(''); setLinkedinManualLast(''); setLinkedinManualHeadline(''); setLinkedinManualEmail(''); setLinkedinManualUrl('')
  }

  const handleLinkedInDisconnect = () => {
    localStorage.removeItem('linkedin_connected')
    localStorage.removeItem('linkedin_profile')
    setLinkedinConnected(false)
    setLinkedinProfile(null)
    saveIntegrations({ linkedin: { connected: false } }).catch(() => {})
    addToast('info', 'LinkedIn disconnected')
  }

  const handleLinkedInTextParse = () => {
    if (!linkedinText.trim()) { addToast('error', 'Paste profile data first'); return }
    const rows = parseLinkedInCSV(linkedinText)
    if (rows.length === 0) { addToast('error', 'No valid rows found. Use: Name, Title, Company, Location'); return }
    const leads = rows.map(r => {
      const lead = linkedinRowToLead(r)
      return { ...lead, contactTitle: lead.title || '', title: lead.title || 'Imported Lead', company: lead.company || '', aiCategory: '', remoteType: 'remote' as const, projectType: 'contract' as const, postedDate: new Date().toISOString(), scoreOverall: 0, scoreIntent: 0, scoreBudget: 0, scoreUrgency: 0, scoreTechnical: 0 }
    })
    setLinkedinPreview(rows)
    setLinkedinParsedLeads(leads)
    addToast('success', `Parsed ${leads.length} leads from text`)
  }

  const handleLinkedInCsvUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setLinkedinCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseLinkedInCSV(text)
      if (rows.length === 0) { addToast('error', 'No valid rows found in CSV'); return }
      const leads = rows.map(r => {
        const lead = linkedinRowToLead(r)
        return { ...lead, contactTitle: lead.title || '', title: lead.title || 'Imported Lead', company: lead.company || '', aiCategory: '', remoteType: 'remote' as const, projectType: 'contract' as const, postedDate: new Date().toISOString(), scoreOverall: 0, scoreIntent: 0, scoreBudget: 0, scoreUrgency: 0, scoreTechnical: 0 }
      })
      setLinkedinPreview(rows)
      setLinkedinParsedLeads(leads)
      addToast('success', `Parsed ${leads.length} leads from CSV`)
    }
    reader.readAsText(file)
  }

  const handleLinkedInImport = async () => {
    if (linkedinParsedLeads.length === 0) return
    setLinkedinImporting(true)
    try {
      for (const lead of linkedinParsedLeads) { await createLead(lead) }
      addToast('success', `Imported ${linkedinParsedLeads.length} LinkedIn leads`)
      setLinkedinText(''); setLinkedinCsvFile(null); setLinkedinPreview([]); setLinkedinParsedLeads([])
    } catch { addToast('error', 'Some leads failed to import') }
    finally { setLinkedinImporting(false) }
  }

  const handleCsvFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseLinkedInCSV(text)
      if (rows.length === 0) { addToast('error', 'No valid rows found in CSV'); return }
      setCsvPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleCsvDragOver = (e: React.DragEvent) => { e.preventDefault(); setCsvDragOver(true) }
  const handleCsvDragLeave = () => setCsvDragOver(false)
  const handleCsvDrop = (e: React.DragEvent) => { e.preventDefault(); setCsvDragOver(false); handleCsvFileUpload(e.dataTransfer.files) }

  const handleCsvImport = async () => {
    if (csvPreview.length === 0) return
    setCsvImporting(true)
    try {
      for (const row of csvPreview) {
        const lead = linkedinRowToLead(row)
        await createLead({ ...lead, contactTitle: lead.title || '', title: lead.title || 'Imported Lead', company: lead.company || '', aiCategory: '', remoteType: 'remote', projectType: 'contract', postedDate: new Date().toISOString(), scoreOverall: 0, scoreIntent: 0, scoreBudget: 0, scoreUrgency: 0, scoreTechnical: 0 })
      }
      addToast('success', `Imported ${csvPreview.length} leads from CSV`)
      setCsvFile(null); setCsvPreview([])
    } catch { addToast('error', 'Some leads failed to import') }
    finally { setCsvImporting(false) }
  }

  const downloadCsvTemplate = () => {
    const csv = 'First Name,Last Name,Title,Company,Location,Email Address,Description\nJohn,Doe,VP Engineering,TechFlow Inc,San Francisco CA,john@example.com,Looking for AI agent development\nJane,Smith,CTO,DataCorp,New York NY,jane@example.com,Building ML pipelines'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'leadgen_template.csv'; a.click(); URL.revokeObjectURL(url)
    addToast('success', 'Template downloaded')
  }

  const handleWebhookTest = async () => {
    if (!webhookUrl.trim()) { addToast('error', 'Enter a webhook URL first'); return }
    if (!webhookUrl.startsWith('http')) { addToast('error', 'URL must start with http:// or https://'); return }
    setWebhookTesting(true)
    try {
      const payload = { event: 'test', timestamp: new Date().toISOString(), data: { message: 'LeadGen AI webhook test', app: 'LeadGen AI' } }
      const res = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(webhookSecret ? { 'X-Webhook-Secret': webhookSecret } : {}) }, body: JSON.stringify(payload), mode: 'no-cors' })
      addToast('success', 'Webhook test sent (response hidden due to CORS — check your webhook endpoint)')
    } catch (e) { addToast('error', `Webhook test failed: ${(e as Error).message}`) }
    finally { setWebhookTesting(false) }
  }

  const handleWebhookSave = async () => {
    if (!webhookUrl.trim()) { addToast('error', 'Enter a webhook URL'); return }
    setWebhookSaving(true)
    try {
      await saveIntegrations({ webhook: { url: webhookUrl, secret: webhookSecret, events: webhookEvents, connected: true } })
      setWebhookConnected(true)
      addToast('success', 'Webhook configuration saved')
    } catch { addToast('error', 'Failed to save webhook config') }
    finally { setWebhookSaving(false) }
  }

  const handleSmtpTest = async () => {
    if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) { addToast('error', 'Fill in all SMTP fields'); return }
    setSmtpTesting(true)
    try {
      await saveIntegrations({ email: { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass, connected: true } })
      setSmtpConnected(true)
      addToast('success', 'Email configuration saved')
    } catch { addToast('error', 'Failed to save email config') }
    finally { setSmtpTesting(false) }
  }

  const handleSmtpSave = async () => {
    setSmtpSaving(true)
    try {
      await saveIntegrations({ email: { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass, connected: smtpConnected } })
      addToast('success', 'Email settings saved')
    } catch { addToast('error', 'Failed to save') }
    finally { setSmtpSaving(false) }
  }

  const handleHubspotTest = async () => {
    if (!hubspotKey.trim()) { addToast('error', 'Enter HubSpot API key'); return }
    setHubspotTesting(true)
    try {
      const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', { headers: { Authorization: `Bearer ${hubspotKey}` } })
      if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.message || `HTTP ${res.status}`) }
      await saveIntegrations({ hubspot: { apiKey: hubspotKey, connected: true } })
      setHubspotConnected(true)
      addToast('success', 'HubSpot connected — contacts accessible')
    } catch (e) { addToast('error', `HubSpot test failed: ${(e as Error).message}`) }
    finally { setHubspotTesting(false) }
  }

  const handleHubspotSave = async () => {
    setHubspotSaving(true)
    try {
      await saveIntegrations({ hubspot: { apiKey: hubspotKey, connected: hubspotConnected } })
      addToast('success', 'HubSpot settings saved')
    } catch { addToast('error', 'Failed to save') }
    finally { setHubspotSaving(false) }
  }

  const handleSalesforceTest = async () => {
    if (!salesforceKey.trim()) { addToast('error', 'Enter Salesforce API key'); return }
    setSalesforceTesting(true)
    try {
      const res = await fetch('https://login.salesforce.com/services/data/v59.0/sobjects', { headers: { Authorization: `Bearer ${salesforceKey}` } })
      if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body[0]?.message || `HTTP ${res.status}`) }
      await saveIntegrations({ salesforce: { apiKey: salesforceKey, connected: true } })
      setSalesforceConnected(true)
      addToast('success', 'Salesforce connected')
    } catch (e) { addToast('error', `Salesforce test failed: ${(e as Error).message}`) }
    finally { setSalesforceTesting(false) }
  }

  const handleSalesforceSave = async () => {
    setSalesforceSaving(true)
    try {
      await saveIntegrations({ salesforce: { apiKey: salesforceKey, connected: salesforceConnected } })
      addToast('success', 'Salesforce settings saved')
    } catch { addToast('error', 'Failed to save') }
    finally { setSalesforceSaving(false) }
  }

  const webhookEventOptions = [
    { key: 'new_lead', label: 'New Lead' },
    { key: 'lead_updated', label: 'Lead Updated' },
    { key: 'campaign_sent', label: 'Campaign Sent' },
    { key: 'lead_qualified', label: 'Lead Qualified' },
    { key: 'proposal_sent', label: 'Proposal Sent' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LinkIcon className="w-6 h-6 text-accent-400" />
          Integrations
        </h1>
        <p className="text-navy-400 mt-1 text-sm">Connect your data sources and manage integrations</p>
      </div>

      {/* LinkedIn Hero Card */}
      <div className={`card relative overflow-hidden ${linkedinConnected ? 'border-[#0A66C2]/30' : 'border-navy-800'}`}>
        {linkedinConnected && <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2]/10 via-[#004182]/5 to-transparent pointer-events-none" />}
        <div className="relative flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${linkedinConnected ? 'bg-gradient-to-br from-[#0A66C2] to-[#004182]' : 'bg-[#0A66C2]/20'}`}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">LinkedIn</h2>
                <p className="text-sm text-navy-400">OAuth connection & lead import</p>
              </div>
            </div>
            {linkedinConnected && linkedinProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400"><CheckCircle className="w-5 h-5" /><span className="font-semibold text-sm">Connected</span></div>
                <div className="bg-navy-800/50 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] font-bold text-lg">{linkedinProfile.firstName?.[0]}{linkedinProfile.lastName?.[0]}</div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{linkedinProfile.firstName} {linkedinProfile.lastName}</p>
                    {linkedinProfile.headline && <p className="text-navy-400 text-xs truncate">{linkedinProfile.headline}</p>}
                    {linkedinProfile.email && <p className="text-navy-500 text-xs truncate">{linkedinProfile.email}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-navy-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">Not connected</span></div>
                <p className="text-sm text-navy-400">Enter your LinkedIn details to connect instantly.</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={linkedinManualFirst} onChange={e => setLinkedinManualFirst(e.target.value)} placeholder="First name" className="input-field text-sm" />
                    <input value={linkedinManualLast} onChange={e => setLinkedinManualLast(e.target.value)} placeholder="Last name" className="input-field text-sm" />
                  </div>
                  <input value={linkedinManualHeadline} onChange={e => setLinkedinManualHeadline(e.target.value)} placeholder="Headline (e.g. Software Engineer at Google)" className="input-field text-sm w-full" />
                  <input value={linkedinManualEmail} onChange={e => setLinkedinManualEmail(e.target.value)} placeholder="Email (optional)" className="input-field text-sm w-full" />
                  <input value={linkedinManualUrl} onChange={e => setLinkedinManualUrl(e.target.value)} placeholder="LinkedIn profile URL (optional)" className="input-field text-sm w-full" />
                </div>
              </div>
            )}
          </div>
          <div className="shrink-0 w-full lg:w-48 space-y-2">
            {linkedinConnected ? (
              <button onClick={handleLinkedInDisconnect} className="w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Disconnect
              </button>
            ) : (
              <button onClick={handleLinkedInManualConnect} disabled={!linkedinManualFirst.trim() || !linkedinManualLast.trim()} className="w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 text-white shadow-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ backgroundColor: '#0A66C2' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect LinkedIn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LinkedIn Profile Import */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[#0A66C2]" /></div>
          <div>
            <h3 className="font-semibold text-white">LinkedIn Profile Import</h3>
            <p className="text-xs text-navy-400">Paste profile data or upload a LinkedIn Sales Navigator CSV</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-navy-400 mb-1.5">Paste LinkedIn profile data (comma-separated)</label>
            <textarea ref={linkedinTextAreaRef} value={linkedinText} onChange={(e) => setLinkedinText(e.target.value)} placeholder={"John,Doe,VP Engineering,TechFlow Inc,San Francisco CA\nJane,Smith,CTO,DataCorp,New York NY"} className="input-field text-sm min-h-[100px] resize-y font-mono" rows={4} />
            <p className="text-[11px] text-navy-500 mt-1">Format: First Name, Last Name, Title, Company, Location</p>
          </div>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-navy-800" /><span className="text-xs text-navy-500">or upload CSV</span><div className="flex-1 h-px bg-navy-800" /></div>
          <div>
            <label className="block text-xs text-navy-400 mb-1.5">Upload LinkedIn CSV</label>
            <div className="border-2 border-dashed border-navy-700 rounded-lg p-4 text-center cursor-pointer hover:border-[#0A66C2]/40 transition-colors" onClick={() => linkedinFileRef.current?.click()}>
              <Upload className="w-6 h-6 text-navy-500 mx-auto mb-1.5" />
              {linkedinCsvFile ? <p className="text-sm text-white">{linkedinCsvFile.name}</p> : <p className="text-xs text-navy-400">Click to browse or drag CSV file here</p>}
            </div>
            <input ref={linkedinFileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleLinkedInCsvUpload(e.target.files)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleLinkedInTextParse} className="btn-primary text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Parse Data</button>
            {linkedinText && <button onClick={() => { setLinkedinText(''); setLinkedinPreview([]); setLinkedinParsedLeads([]) }} className="btn-ghost text-sm flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
          </div>
          {linkedinPreview.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-navy-300">Preview — <span className="text-white font-medium">{linkedinPreview.length} leads</span> found</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-navy-800">{Object.keys(linkedinPreview[0]).map((key) => (<th key={key} className="text-left py-2 px-3 text-xs font-medium text-navy-400 uppercase tracking-wider">{key}</th>))}</tr></thead>
                  <tbody>{linkedinPreview.slice(0, 5).map((row, i) => (<tr key={i} className="border-b border-navy-800/50 hover:bg-navy-800/30">{Object.values(row).map((val, j) => (<td key={j} className="py-2 px-3 text-navy-300 text-xs max-w-[200px] truncate">{val as string}</td>))}</tr>))}</tbody>
                </table>
                {linkedinPreview.length > 5 && <p className="text-xs text-navy-500 mt-2 text-center">Showing 5 of {linkedinPreview.length} rows</p>}
              </div>
              <button onClick={handleLinkedInImport} disabled={linkedinImporting} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50" style={{ backgroundColor: '#0A66C2' }}>
                {linkedinImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {linkedinImporting ? 'Importing...' : `Import ${linkedinParsedLeads.length} Leads`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LinkedIn Lead Sync Demo */}
      {!showLinkedInDemo ? (
        <div className="card border-blue-500/10 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center"><Linkedin className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="font-semibold text-white">LinkedIn Lead Sync</h3>
                <p className="text-xs text-gray-400">Import LinkedIn lead form submissions directly (demo mode)</p>
              </div>
            </div>
            <button onClick={() => setShowLinkedInDemo(true)} className="btn-primary text-sm flex items-center gap-1.5">
              <Linkedin className="w-4 h-4" /> Sync Demo Leads
            </button>
          </div>
        </div>
      ) : (
        <LinkedInDemoConnector onClose={() => setShowLinkedInDemo(false)} />
      )}

      {/* CSV Import */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Upload className="w-5 h-5 text-emerald-400" /></div>
            <div><h3 className="font-semibold text-white">CSV Import</h3><p className="text-xs text-navy-400">Import leads from any spreadsheet</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadCsvTemplate} className="btn-ghost text-sm flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Template</button>
            <button onClick={() => csvFileRef.current?.click()} disabled={csvImporting} className="btn-primary text-sm flex items-center gap-1">{csvImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}{csvImporting ? 'Importing...' : 'Upload CSV'}</button>
            <input ref={csvFileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleCsvFileUpload(e.target.files)} />
          </div>
        </div>
        <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${csvDragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-navy-700 hover:border-navy-600'}`} onDragOver={handleCsvDragOver} onDragLeave={handleCsvDragLeave} onDrop={handleCsvDrop} onClick={() => csvFileRef.current?.click()}>
          <Upload className="w-8 h-8 text-navy-500 mx-auto mb-2" />
          {csvFile ? <div><p className="text-sm text-white font-medium">{csvFile.name}</p><p className="text-xs text-navy-500 mt-1">{csvPreview.length} rows detected</p></div> : <div><p className="text-sm text-navy-400">Drag and drop your CSV file here</p><p className="text-xs text-navy-500 mt-1">or click to browse</p></div>}
        </div>
        {csvPreview.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-navy-800">{Object.keys(csvPreview[0]).map((key) => (<th key={key} className="text-left py-2 px-3 text-xs font-medium text-navy-400 uppercase tracking-wider">{key}</th>))}</tr></thead>
                <tbody>{csvPreview.slice(0, 5).map((row, i) => (<tr key={i} className="border-b border-navy-800/50 hover:bg-navy-800/30">{Object.values(row).map((val, j) => (<td key={j} className="py-2 px-3 text-navy-300 text-xs max-w-[200px] truncate">{val as string}</td>))}</tr>))}</tbody>
              </table>
              {csvPreview.length > 5 && <p className="text-xs text-navy-500 mt-2 text-center">Showing 5 of {csvPreview.length} rows</p>}
            </div>
            <button onClick={handleCsvImport} disabled={csvImporting} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {csvImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {csvImporting ? 'Importing...' : `Import ${csvPreview.length} Leads`}
            </button>
          </div>
        )}
      </div>

      {/* Webhook Configuration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><ExternalLink className="w-5 h-5 text-amber-400" /></div>
          <div className="flex-1"><h3 className="font-semibold text-white">Webhook Integration</h3><p className="text-xs text-navy-400">Send events to your application</p></div>
          {webhookConnected && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>}
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-navy-400 mb-1">Webhook URL</label>
            <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhooks/leadgen" className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs text-navy-400 mb-1">Secret</label>
            <div className="relative">
              <input type={showWebhookSecret ? 'text' : 'password'} value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="Webhook signing secret" className="input-field text-sm pr-10" />
              <button onClick={() => setShowWebhookSecret(!showWebhookSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
                {showWebhookSecret ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-navy-400 mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {webhookEventOptions.map((evt) => (
                <button key={evt.key} onClick={() => setWebhookEvents(prev => prev.includes(evt.key) ? prev.filter(e => e !== evt.key) : [...prev, evt.key])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${webhookEvents.includes(evt.key) ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-navy-800/30 text-navy-400 border-navy-700 hover:border-navy-600'}`}>
                  {evt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleWebhookTest} disabled={webhookTesting} className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50">
              {webhookTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {webhookTesting ? 'Testing...' : 'Test'}
            </button>
            <button onClick={handleWebhookSave} disabled={webhookSaving} className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50">
              {webhookSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {webhookSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Email Integration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div className="flex-1"><h3 className="font-semibold text-white">Email Integration</h3><p className="text-xs text-navy-400">SMTP settings for outreach tracking</p></div>
          {smtpConnected && <span className="badge bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Connected</span>}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs text-navy-400 mb-1">SMTP Host</label><input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="input-field text-sm" /></div>
            <div><label className="block text-xs text-navy-400 mb-1">Port</label><input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" className="input-field text-sm" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs text-navy-400 mb-1">Username</label><input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="your@email.com" className="input-field text-sm" /></div>
            <div><label className="block text-xs text-navy-400 mb-1">Password</label>
              <div className="relative">
                <input type={showSmtpPass ? 'text' : 'password'} value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="App password" className="input-field text-sm pr-10" />
                <button onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">{showSmtpPass ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSmtpTest} disabled={smtpTesting} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {smtpTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {smtpTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={handleSmtpSave} disabled={smtpSaving} className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50">
              {smtpSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {smtpSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* CRM Integration */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Settings className="w-5 h-5 text-cyan-400" /></div>
          <div><h3 className="font-semibold text-white">CRM Integration</h3><p className="text-xs text-navy-400">Sync leads with your CRM</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* HubSpot */}
          <div className="bg-navy-800/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><span className="text-orange-400 font-bold text-xs">HS</span></div>
              <div><p className="text-white font-medium text-sm">HubSpot</p>{hubspotConnected && <p className="text-emerald-400 text-[11px]">Connected</p>}</div>
            </div>
            <div><label className="block text-xs text-navy-400 mb-1">API Key</label>
              <div className="relative">
                <input type={showHubspotKey ? 'text' : 'password'} value={hubspotKey} onChange={(e) => setHubspotKey(e.target.value)} placeholder="Enter HubSpot API key" className="input-field text-sm pr-10" />
                <button onClick={() => setShowHubspotKey(!showHubspotKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">{showHubspotKey ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleHubspotTest} disabled={hubspotTesting || !hubspotKey.trim()} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {hubspotTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {hubspotTesting ? 'Testing...' : hubspotConnected ? 'Reconnect' : 'Test Connection'}
              </button>
              <button onClick={handleHubspotSave} disabled={hubspotSaving} className="btn-secondary text-sm flex items-center justify-center gap-1 disabled:opacity-50">
                {hubspotSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Salesforce */}
          <div className="bg-navy-800/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><span className="text-blue-400 font-bold text-xs">SF</span></div>
              <div><p className="text-white font-medium text-sm">Salesforce</p>{salesforceConnected && <p className="text-emerald-400 text-[11px]">Connected</p>}</div>
            </div>
            <div><label className="block text-xs text-navy-400 mb-1">Access Token</label>
              <div className="relative">
                <input type={showSalesforceKey ? 'text' : 'password'} value={salesforceKey} onChange={(e) => setSalesforceKey(e.target.value)} placeholder="Enter Salesforce access token" className="input-field text-sm pr-10" />
                <button onClick={() => setShowSalesforceKey(!showSalesforceKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">{showSalesforceKey ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSalesforceTest} disabled={salesforceTesting || !salesforceKey.trim()} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {salesforceTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {salesforceTesting ? 'Testing...' : salesforceConnected ? 'Reconnect' : 'Test Connection'}
              </button>
              <button onClick={handleSalesforceSave} disabled={salesforceSaving} className="btn-secondary text-sm flex items-center justify-center gap-1 disabled:opacity-50">
                {salesforceSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
