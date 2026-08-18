import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast, Lead, Project, LeadStatus, TeamMember } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../services/api';
import { calculateLeadScore } from '../utils/ai';
import { generateId } from '../utils/helpers';

interface AppState {
  leads: Lead[];
  projects: Project[];
  toasts: Toast[];
  sidebarOpen: boolean;
  stats: { totalLeads: number; newLeads: number; qualifiedLeads: number; pipelineValue: number; totalSent: number; totalReplied: number; replyRate: number; avgScore: number };
  loading: boolean;
  setSidebarOpen: (open: boolean) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  refreshLeads: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addNote: (leadId: string, content: string, author: string) => void;
  updateProjectStatus: (projectId: string, status: string) => void;
  toggleSaveLead: (leadId: string) => void;
  addTag: (leadId: string, tag: string) => void;
  removeTag: (leadId: string, tag: string) => void;
  setReminder: (leadId: string, date: string) => void;
  reassignLead: (leadId: string, owner: TeamMember) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addLeadToProject: (leadId: string, projectId: string) => void;
  createLead: (lead: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const defaultStats = { totalLeads: 0, newLeads: 0, qualifiedLeads: 0, pipelineValue: 0, totalSent: 0, totalReplied: 0, replyRate: 0, avgScore: 0 };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  const dbLeadToLead = useCallback((row: Record<string, unknown>): Lead => ({
    id: row.id as string,
    title: row.title as string,
    company: row.company as string,
    description: (row.description as string) || '',
    budgetMin: (row.budget_min as number) || undefined,
    budgetMax: (row.budget_max as number) || undefined,
    aiCategory: (row.ai_category as string) || '',
    skills: (row.skills as string[]) || [],
    contactName: (row.contact_name as string) || '',
    contactTitle: (row.contact_title as string) || '',
    contactEmail: (row.contact_email as string) || undefined,
    contactAvatar: (row.contact_avatar as string) || undefined,
    source: (row.source as string) || 'linkedin',
    location: (row.location as string) || '',
    remoteType: (row.remote_type as 'remote' | 'hybrid' | 'onsite') || 'remote',
    projectType: (row.project_type as 'contract' | 'freelance' | 'full_time') || 'contract',
    postedDate: (row.posted_date as string) || new Date().toISOString(),
    status: (row.status as LeadStatus) || 'new',
    saved: (row.saved as boolean) || false,
    scoreOverall: (row.score_overall as number) || 0,
    scoreIntent: (row.score_intent as number) || 0,
    scoreBudget: (row.score_budget as number) || 0,
    scoreUrgency: (row.score_urgency as number) || 0,
    scoreTechnical: (row.score_technical as number) || 0,
    reminder: row.reminder as string | undefined,
    tags: (row.tags as string[]) || [],
    notes: (row.notes as Array<{ id: string; content: string; author: string; createdAt: string }>) || [],
    activities: (row.activities as Array<{ id: string; type: string; description: string; timestamp: string }>) || [],
    projectId: (row.project_id as string) || undefined,
  }), []);

  const dbProjectToProject = useCallback((row: Record<string, unknown>): Project => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    value: (row.value as number) || 0,
    status: (row.status as string) || 'discovery',
    priority: (row.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
    clientName: (row.client_name as string) || '',
    clientEmail: (row.client_email as string) || '',
    deadline: row.deadline as string | undefined,
    teamMembers: (row.team_members as string[]) || [],
    tags: (row.tags as string[]) || [],
    leadId: (row.lead_id as string) || undefined,
  }), []);

  const refreshLeads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.fetchLeads(user.id);
      setLeads(data.map(dbLeadToLead));
    } catch (e) { console.error('Failed to fetch leads:', e); }
  }, [user, dbLeadToLead]);

  const refreshProjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.fetchProjects(user.id);
      setProjects(data.map(dbProjectToProject));
    } catch (e) { console.error('Failed to fetch projects:', e); }
  }, [user, dbProjectToProject]);

  const refreshStats = useCallback(async () => {
    if (!user) return;
    try {
      const s = await api.getStats(user.id);
      setStats(s);
    } catch (e) { console.error('Failed to fetch stats:', e); }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([refreshLeads(), refreshProjects(), refreshStats()]).finally(() => setLoading(false));
    } else {
      setLeads([]);
      setProjects([]);
      setStats(defaultStats);
      setLoading(false);
    }
  }, [user, refreshLeads, refreshProjects, refreshStats]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateLeadStatus = useCallback((leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    api.updateLead(leadId, { status }).catch(() => addToast('error', 'Failed to update lead status'));
  }, [addToast]);

  const addNote = useCallback((leadId: string, content: string, author: string) => {
    const note = { id: generateId(), content, author, createdAt: new Date().toISOString() };
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: [...l.notes, note] } : l));
    const lead = leads.find(l => l.id === leadId);
    if (lead) api.updateLead(leadId, { notes: [...lead.notes, note] }).catch(() => addToast('error', 'Failed to save note'));
  }, [leads, addToast]);

  const updateProjectStatus = useCallback((projectId: string, status: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
    api.updateProject(projectId, { status }).catch(() => addToast('error', 'Failed to update project'));
  }, [addToast]);

  const toggleSaveLead = useCallback((leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, saved: !l.saved } : l));
    const lead = leads.find(l => l.id === leadId);
    if (lead) api.updateLead(leadId, { saved: !lead.saved }).catch(() => addToast('error', 'Failed to save lead'));
  }, [leads, addToast]);

  const addTag = useCallback((leadId: string, tag: string) => {
    setLeads(prev => prev.map(l => l.id === leadId && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l));
    const lead = leads.find(l => l.id === leadId);
    if (lead) api.updateLead(leadId, { tags: [...lead.tags, tag] }).catch(() => addToast('error', 'Failed to add tag'));
  }, [leads, addToast]);

  const removeTag = useCallback((leadId: string, tag: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: l.tags.filter(t => t !== tag) } : l));
    const lead = leads.find(l => l.id === leadId);
    if (lead) api.updateLead(leadId, { tags: lead.tags.filter(t => t !== tag) }).catch(() => addToast('error', 'Failed to remove tag'));
  }, [leads, addToast]);

  const setReminder = useCallback((leadId: string, date: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, reminder: date } : l));
    api.updateLead(leadId, { reminder: date }).catch(() => addToast('error', 'Failed to set reminder'));
  }, [addToast]);

  const reassignLead = useCallback((leadId: string, owner: TeamMember) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const activity = { id: generateId(), type: 'reassigned', description: `Lead reassigned to ${owner.name}`, timestamp: new Date().toISOString() };
      const newActivities = [...lead.activities, activity];
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, activities: newActivities } : l));
      api.updateLead(leadId, { activities: newActivities }).catch(() => addToast('error', 'Failed to reassign lead'));
    }
    addToast('success', `Lead reassigned to ${owner.name}`);
  }, [leads, addToast]);

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    if (!user) return;
    try {
      const data = await api.createProject(user.id, {
        name: project.name,
        description: project.description,
        value: project.value,
        status: project.status || 'discovery',
        priority: project.priority || 'medium',
        client_name: project.clientName,
        client_email: project.clientEmail,
        deadline: project.deadline,
        team_members: project.teamMembers || [],
        tags: project.tags || [],
      });
      setProjects(prev => [{ ...project, id: data.id }, ...prev]);
      addToast('success', `Project "${project.name}" created`);
    } catch { addToast('error', 'Failed to create project'); }
  }, [user, addToast]);

  const addLeadToProject = useCallback((leadId: string, projectId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, projectId } : l));
    api.updateLead(leadId, { projectId }).catch(() => addToast('error', 'Failed to add lead to project'));
  }, [addToast]);

  const createLead = useCallback(async (lead: Partial<Lead>) => {
    if (!user) return;
    try {
      const data = await api.createLead(user.id, lead);
      setLeads(prev => [dbLeadToLead(data), ...prev]);
      addToast('success', 'Lead created successfully');
    } catch { addToast('error', 'Failed to create lead'); }
  }, [user, addToast, dbLeadToLead]);

  const deleteLead = useCallback(async (leadId: string) => {
    try {
      await api.deleteLead(leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      addToast('success', 'Lead deleted');
    } catch { addToast('error', 'Failed to delete lead'); }
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      leads, projects, toasts, sidebarOpen, stats, loading,
      setSidebarOpen, addToast, removeToast,
      refreshLeads, refreshProjects, refreshStats,
      updateLeadStatus, addNote, updateProjectStatus,
      toggleSaveLead, addTag, removeTag, setReminder,
      reassignLead, addProject, addLeadToProject,
      createLead, deleteLead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
