export type UserRole = 'admin' | 'manager' | 'user' | 'member' | 'viewer';

export type LeadStatus = 'new' | 'reviewing' | 'qualified' | 'contacted' | 'follow_up' | 'won' | 'lost' | 'discovery_call' | 'proposal_sent' | 'responded' | 'proposal';

export type ProjectType = 'full_time' | 'contract' | 'freelance' | 'consulting';

export type RemoteType = 'remote' | 'hybrid' | 'onsite';

export type OutreachStatus = 'draft' | 'sent' | 'opened' | 'replied' | 'booked_call' | 'unsubscribed' | 'active' | 'paused' | 'completed';

export type LeadSource = 'manual' | 'ai_generated' | 'linkedin_lead_form' | 'csv_import';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  company: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user?: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title: string;
  company: string;
  companyLogo?: string;
  contactName: string;
  contactTitle?: string;
  contactEmail?: string;
  contactAvatar?: string;
  email?: string;
  phone?: string;
  description: string;
  excerpt?: string;
  skills: string[];
  location: string;
  industry?: string;
  remoteType: RemoteType;
  projectType: ProjectType;
  budgetMin?: number;
  budgetMax?: number;
  postedDate: string;
  foundDate?: string;
  scoreOverall?: number;
  scoreIntent?: number;
  scoreBudget?: number;
  scoreUrgency?: number;
  scoreTechnical?: number;
  leadScore?: number;
  intentScore?: number;
  budgetConfidence?: number;
  urgencyScore?: number;
  technicalFit?: number;
  scoreReasons?: string[];
  source: string;
  sourceUrl?: string;
  sourceReference?: string;
  linkedinProfileUrl?: string;
  status: LeadStatus;
  aiCategory: string;
  owner?: TeamMember;
  assignedTo?: string;
  tags: string[];
  notes: Note[];
  activities: Activity[];
  summary?: string;
  saved?: boolean;
  archived?: boolean;
  archivedAt?: string;
  reminder?: string;
  projectId?: string;
  lastSyncedAt?: string;
  consent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  company?: string;
  description?: string;
  value: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  owner?: TeamMember;
  lead?: Lead;
  leadId?: string;
  clientName?: string;
  clientEmail?: string;
  deadline?: string;
  teamMembers?: string[];
  tags?: string[];
  nextFollowUp?: string;
  proposalNotes?: string;
  files?: string[];
  tasks?: Task[];
  communications?: Communication[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Communication {
  id: string;
  type: 'email' | 'linkedin' | 'call' | 'meeting';
  subject: string;
  content: string;
  date: string;
  direction: 'inbound' | 'outbound';
}

export interface OutreachCampaign {
  id: string;
  name: string;
  template: string;
  category?: string;
  subject?: string;
  target_audience?: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  sent: number;
  opened: number;
  replied: number;
  bookedCall: number;
  unsubscribed: number;
  createdAt: string;
  lastUpdated?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'linkedin' | 'csv' | 'webhook' | 'email' | 'crm';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  syncFrequency?: string;
  permissions?: string[];
  errorHistory?: { date: string; message: string }[];
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  value: number;
  date: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  type: string;
  impressions: number;
  leads: number;
  spend: number;
  formName?: string;
}

export interface LinkedInForm {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: 'active' | 'inactive';
  leadsCount: number;
  createdAt: string;
}
