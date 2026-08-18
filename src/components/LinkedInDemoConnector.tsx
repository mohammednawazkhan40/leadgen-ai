import { useState } from 'react';
import { Linkedin, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface LinkedInDemoConnectorProps {
  onClose: () => void;
}

const sampleLinkedInLeads = [
  { firstName: 'Alex', lastName: 'Thompson', email: 'alex.thompson@datavault.com', company: 'DataVault Corp', jobTitle: 'CTO', linkedinUrl: 'https://linkedin.com/in/alexthompson', location: 'New York, NY', industry: 'Technology' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@medtech.com', company: 'MedTech Solutions', jobTitle: 'VP of Engineering', linkedinUrl: 'https://linkedin.com/in/mariagarcia', location: 'Boston, MA', industry: 'Healthcare' },
  { firstName: 'James', lastName: 'Lee', email: 'james.lee@scaleai.com', company: 'Scale AI', jobTitle: 'ML Engineering Manager', linkedinUrl: 'https://linkedin.com/in/jameslee', location: 'San Francisco, CA', industry: 'Technology' },
  { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@techflow.com', company: 'TechFlow Inc', jobTitle: 'Head of AI', linkedinUrl: 'https://linkedin.com/in/priyasharma', location: 'Seattle, WA', industry: 'Technology' },
  { firstName: 'David', lastName: 'Kim', email: 'david.kim@shopsmart.com', company: 'ShopSmart', jobTitle: 'Product Director', linkedinUrl: 'https://linkedin.com/in/davidkim', location: 'Austin, TX', industry: 'Retail' },
];

export default function LinkedInDemoConnector({ onClose }: LinkedInDemoConnectorProps) {
  const { user } = useAuth();
  const { addToast } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  const handleSyncDemo = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      for (const lead of sampleLinkedInLeads) {
        await supabase.from('leads').insert({
          user_id: user.id,
          first_name: lead.firstName,
          last_name: lead.lastName,
          full_name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          company: lead.company,
          contact_name: `${lead.firstName} ${lead.lastName}`,
          contact_title: lead.jobTitle,
          contact_email: lead.email,
          location: lead.location,
          linkedin_profile_url: lead.linkedinUrl,
          industry: lead.industry,
          description: `LinkedIn lead form submission from ${lead.company}`,
          source: 'linkedin_lead_form',
          status: 'new',
          ai_category: lead.industry || 'LinkedIn',
          tags: ['linkedin', 'lead-form'],
          skills: ['LinkedIn Lead Form'],
          posted_date: new Date().toISOString(),
          consent: true,
        });
      }
      setSyncCount(sampleLinkedInLeads.length);
      setSynced(true);
      addToast('success', `Synced ${sampleLinkedInLeads.length} LinkedIn demo leads`);
    } catch (err: any) {
      addToast('error', err.message || 'Sync failed');
    }
    setSyncing(false);
  };

  if (synced) {
    return (
      <div className="card border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Demo Sync Complete</h3>
          <p className="text-sm text-gray-400 mb-4">{syncCount} LinkedIn demo leads added to your dictionary</p>
          <div className="flex gap-2 justify-center">
            <button onClick={onClose} className="btn-primary text-sm">View Leads</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-blue-500/20 bg-blue-500/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Linkedin className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">LinkedIn Lead Sync Demo</h3>
          <p className="text-sm text-gray-400 mb-3">
            Import sample LinkedIn lead form submissions. In production, this syncs with your LinkedIn Marketing API account.
          </p>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 text-xs text-gray-400 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demo mode: {sampleLinkedInLeads.length} sample leads will be imported</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSyncDemo} disabled={syncing} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
              {syncing ? 'Syncing...' : 'Sync Demo Leads'}
            </button>
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
