import { supabase } from '../lib/supabase';
import { calculateLeadScore } from '../utils/ai';
import type { Lead } from '../types';

// ============================================
// LEADS
// ============================================
export async function fetchLeads(userId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLead(userId: string, lead: Partial<Lead>) {
  const scores = calculateLeadScore(lead as Lead);
  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: userId,
      title: lead.title,
      company: lead.company,
      description: lead.description,
      budget_min: lead.budgetMin,
      budget_max: lead.budgetMax,
      ai_category: lead.aiCategory,
      skills: lead.skills || [],
      contact_name: lead.contactName,
      contact_title: lead.contactTitle,
      contact_email: lead.contactEmail,
      contact_avatar: lead.contactAvatar,
      source: lead.source,
      location: lead.location,
      remote_type: lead.remoteType || 'remote',
      project_type: lead.projectType || 'contract',
      posted_date: lead.postedDate,
      status: lead.status || 'new',
      score_overall: scores.overall,
      score_intent: scores.intent,
      score_budget: scores.budget,
      score_urgency: scores.urgency,
      score_technical: scores.technical,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(leadId: string, updates: Partial<Lead>) {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.saved !== undefined) dbUpdates.saved = updates.saved;
  if (updates.reminder !== undefined) dbUpdates.reminder = updates.reminder;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.activities !== undefined) dbUpdates.activities = updates.activities;
  if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;

  const { data, error } = await supabase
    .from('leads')
    .update(dbUpdates)
    .eq('id', leadId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(leadId: string) {
  const { error } = await supabase.from('leads').delete().eq('id', leadId);
  if (error) throw error;
}

export async function searchLeads(userId: string, query: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%,contact_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================
// PROJECTS
// ============================================
export async function fetchProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createProject(userId: string, project: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, ...project })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(projectId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
}

// ============================================
// OUTREACH CAMPAIGNS
// ============================================
export async function fetchCampaigns(userId: string) {
  const { data, error } = await supabase
    .from('outreach_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCampaign(userId: string, campaign: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('outreach_campaigns')
    .insert({ user_id: userId, ...campaign })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(campaignId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('outreach_campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCampaign(campaignId: string) {
  const { error } = await supabase.from('outreach_campaigns').delete().eq('id', campaignId);
  if (error) throw error;
}

// ============================================
// OUTREACH MESSAGES
// ============================================
export async function fetchMessages(userId: string) {
  const { data, error } = await supabase
    .from('outreach_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function sendMessage(userId: string, message: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('outreach_messages')
    .insert({ user_id: userId, ...message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// TEAM MEMBERS
// ============================================
export async function fetchTeamMembers(userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addTeamMember(ownerId: string, member: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('team_members')
    .insert({ owner_id: ownerId, ...member })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeTeamMember(memberId: string) {
  const { error } = await supabase.from('team_members').delete().eq('id', memberId);
  if (error) throw error;
}

// ============================================
// USER SETTINGS
// ============================================
export async function fetchSettings(userId: string) {
  const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
  return data;
}

export async function upsertSettings(userId: string, settings: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================
// STATS (aggregate queries)
// ============================================
export async function getStats(userId: string) {
  const [leadsResult, projectsResult, campaignsResult] = await Promise.all([
    supabase.from('leads').select('status, score_overall, budget_min, budget_max').eq('user_id', userId),
    supabase.from('projects').select('status, value').eq('user_id', userId),
    supabase.from('outreach_campaigns').select('total_sent, total_opened, total_replied, total_booked').eq('user_id', userId),
  ]);

  const leads = leadsResult.data || [];
  const projects = projectsResult.data || [];
  const campaigns = campaignsResult.data || [];

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;
  const pipelineValue = projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const totalSent = campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + (c.total_replied || 0), 0);
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score_overall || 0), 0) / totalLeads) : 0;

  return { totalLeads, newLeads, qualifiedLeads, pipelineValue, totalSent, totalReplied, replyRate, avgScore };
}
