import { useState } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, Globe, Tag, DollarSign, Briefcase, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types';

interface AddLeadModalProps {
  lead?: Lead | null;
  onClose: () => void;
}

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Manufacturing',
  'Real Estate', 'Media', 'Energy', 'Transportation', 'Legal', 'Consulting',
  'Agriculture', 'Telecommunications', 'Non-Profit', 'Government'
];

const sources: { value: string; label: string }[] = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'linkedin_lead_form', label: 'LinkedIn Lead Form' },
  { value: 'csv_import', label: 'CSV Import' },
];

export default function AddLeadModal({ lead, onClose }: AddLeadModalProps) {
  const { user } = useAuth();
  const { addToast } = useApp();
  const isEditing = !!lead;

  const [firstName, setFirstName] = useState(lead?.firstName || lead?.contactName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(lead?.lastName || lead?.contactName?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(lead?.email || lead?.contactEmail || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [company, setCompany] = useState(lead?.company || '');
  const [jobTitle, setJobTitle] = useState(lead?.contactTitle || '');
  const [industry, setIndustry] = useState(lead?.industry || '');
  const [location, setLocation] = useState(lead?.location || '');
  const [linkedinUrl, setLinkedinUrl] = useState(lead?.linkedinProfileUrl || '');
  const [description, setDescription] = useState(lead?.description || '');
  const [source, setSource] = useState(lead?.source || 'manual');
  const [status, setStatus] = useState(lead?.status || 'new');
  const [budgetMin, setBudgetMin] = useState(String(lead?.budgetMin || ''));
  const [budgetMax, setBudgetMax] = useState(String(lead?.budgetMax || ''));
  const [tags, setTags] = useState((lead?.tags || []).join(', '));
  const [consent, setConsent] = useState(lead?.consent ?? false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Required';
    if (!lastName.trim()) errs.lastName = 'Required';
    if (!email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!company.trim()) errs.company = 'Required';
    if (!description.trim()) errs.description = 'Required';
    if (!location.trim()) errs.location = 'Required';
    if (linkedinUrl && !linkedinUrl.includes('linkedin.com')) errs.linkedinUrl = 'Must be a LinkedIn URL';
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) errs.budgetMax = 'Must be >= min';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!user) return;
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: jobTitle || `${industry || 'AI'} Lead`,
        company: company.trim(),
        contact_name: fullName,
        contact_title: jobTitle.trim() || null,
        contact_email: email.trim(),
        description: description.trim(),
        location: location.trim(),
        source: source,
        status: status,
        ai_category: industry || 'General',
        skills: tagsArray,
        tags: tagsArray,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        email: email.trim(),
        phone: phone.trim() || null,
        industry: industry || null,
        linkedin_profile_url: linkedinUrl.trim() || null,
        consent: consent,
        posted_date: new Date().toISOString(),
      };
      if (isEditing) {
        const { error } = await supabase.from('leads').update(payload).eq('id', lead.id);
        if (error) throw error;
        addToast('success', 'Lead updated');
      } else {
        const { error } = await supabase.from('leads').insert({ ...payload, user_id: user.id });
        if (error) throw error;
        addToast('success', 'Lead created');
      }
      onClose();
      window.location.reload();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save lead');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-[5vh] p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Lead' : 'Add New Lead'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{isEditing ? 'Update lead information' : 'Add a lead to your dictionary'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.firstName ? 'border-red-500' : ''}`} placeholder="John" />
              </div>
              {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Last Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={lastName} onChange={e => setLastName(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Smith" />
              </div>
              {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.email ? 'border-red-500' : ''}`} placeholder="john@company.com" />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field w-full pl-9 pr-3 py-2.5 text-sm" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>

          {/* Company + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Company *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={company} onChange={e => setCompany(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.company ? 'border-red-500' : ''}`} placeholder="Acme Corp" />
              </div>
              {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-field w-full pl-9 pr-3 py-2.5 text-sm" placeholder="VP of Engineering" />
              </div>
            </div>
          </div>

          {/* Industry + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} className="input-field w-full py-2.5 text-sm">
                <option value="">Select industry...</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={location} onChange={e => setLocation(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.location ? 'border-red-500' : ''}`} placeholder="San Francisco, CA" />
              </div>
              {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">LinkedIn Profile URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.linkedinUrl ? 'border-red-500' : ''}`} placeholder="https://linkedin.com/in/johnsmith" />
            </div>
            {errors.linkedinUrl && <p className="text-xs text-red-400 mt-1">{errors.linkedinUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`input-field w-full px-3 py-2.5 text-sm resize-none ${errors.description ? 'border-red-500' : ''}`} placeholder="Describe the lead context..." />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Source + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Source</label>
              <select value={source} onChange={e => setSource(e.target.value)} className="input-field w-full py-2.5 text-sm">
                {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Lead['status'])} className="input-field w-full py-2.5 text-sm">
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow-up</option>
                <option value="discovery_call">Discovery Call</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Min Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="number" min="0" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="input-field w-full pl-9 pr-3 py-2.5 text-sm" placeholder="50000" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Max Budget ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="number" min="0" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className={`input-field w-full pl-9 pr-3 py-2.5 text-sm ${errors.budgetMax ? 'border-red-500' : ''}`} placeholder="100000" />
              </div>
              {errors.budgetMax && <p className="text-xs text-red-400 mt-1">{errors.budgetMax}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Tags</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={tags} onChange={e => setTags(e.target.value)} className="input-field w-full pl-9 pr-3 py-2.5 text-sm" placeholder="AI Agents, Python, LangChain (comma-separated)" />
            </div>
          </div>

          {/* Consent */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-blue-500" />
            <span className="text-sm text-gray-300">Contact has consented to being contacted</span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-50">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckCircle2 className="w-4 h-4" /> {isEditing ? 'Update Lead' : 'Add Lead'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
