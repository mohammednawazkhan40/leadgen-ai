import { supabase } from '../lib/supabase';

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';

function getRedirectUri(): string {
  const base = window.location.origin;
  if (base.includes('localhost')) {
    return 'http://localhost:5173/linkedin-callback';
  }
  return `${base}/leadgen-ai/linkedin-callback`;
}

const LINKEDIN_REDIRECT_URI = getRedirectUri();

export function getLinkedInAuthUrl(): string {
  const scopes = ['openid', 'profile', 'email'].join(' ');
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${Date.now()}`;
}

export async function exchangeLinkedInCode(code: string): Promise<{ access_token?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('linkedin-auth', {
      body: { code, redirect_uri: LINKEDIN_REDIRECT_URI },
    });
    if (error) return { error: error.message };
    return data;
  } catch {
    return { error: 'Edge function not deployed. Run: supabase functions deploy linkedin-auth' };
  }
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profilePicture?: string;
  email?: string;
  location?: string;
  industry?: string;
}

export async function fetchLinkedInProfile(accessToken: string): Promise<{ profile?: LinkedInProfile; error?: string }> {
  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', { headers });
    if (!profileRes.ok) return { error: 'Failed to fetch LinkedIn profile' };
    const d = await profileRes.json();
    return {
      profile: {
        id: d.sub || '',
        firstName: d.given_name || '',
        lastName: d.family_name || '',
        headline: d.headline || '',
        profilePicture: d.picture || '',
        email: d.email || '',
      },
    };
  } catch {
    return { error: 'Failed to fetch LinkedIn profile' };
  }
}

export async function storeLinkedInConnection(userId: string, profile: LinkedInProfile) {
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    integrations: {
      linkedin: {
        connected: true,
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        headline: profile.headline,
        connectedAt: new Date().toISOString(),
      },
    },
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export function parseLinkedInCSV(text: string): Array<Record<string, string>> {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^,]+)/g) || [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').replace(/"/g, '').trim(); });
    return row;
  });
}

export function linkedinRowToLead(row: Record<string, string>) {
  const firstName = row['First Name'] || row['firstName'] || '';
  const lastName = row['Last Name'] || row['lastName'] || '';
  return {
    contactName: `${firstName} ${lastName}`.trim(),
    title: row['Title'] || row['Position'] || row['headline'] || '',
    company: row['Company'] || row['Organisation'] || '',
    location: row['Location'] || row['City'] || '',
    contactEmail: row['Email Address'] || row['Email'] || '',
    source: 'linkedin' as const,
    status: 'new' as const,
    description: `${row['Title'] || row['headline'] || ''} at ${row['Company'] || ''}. ${row['Description'] || ''}`.trim(),
    skills: [],
    tags: ['linkedin-import'],
    notes: [],
    activities: [],
  };
}
