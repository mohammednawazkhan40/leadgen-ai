import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, Lead, Project, LeadStatus, TeamMember } from '../types';
import { leads as initialLeads, projects as initialProjects } from '../data/mockData';
import { generateId } from '../utils/helpers';

interface AppState {
  leads: Lead[];
  projects: Project[];
  toasts: Toast[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addNote: (leadId: string, content: string, author: string) => void;
  updateProjectStatus: (projectId: string, status: LeadStatus) => void;
  toggleSaveLead: (leadId: string) => void;
  addTag: (leadId: string, tag: string) => void;
  removeTag: (leadId: string, tag: string) => void;
  setReminder: (leadId: string, date: string) => void;
  reassignLead: (leadId: string, owner: TeamMember) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addLeadToProject: (leadId: string, projectId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  }, []);

  const addNote = useCallback((leadId: string, content: string, author: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      notes: [...l.notes, { id: generateId(), content, author, createdAt: new Date().toISOString() }]
    } : l));
  }, []);

  const updateProjectStatus = useCallback((projectId: string, status: LeadStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
  }, []);

  const toggleSaveLead = useCallback((leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, saved: !l.saved } : l));
  }, []);

  const addTag = useCallback((leadId: string, tag: string) => {
    setLeads(prev => prev.map(l => l.id === leadId && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l));
  }, []);

  const removeTag = useCallback((leadId: string, tag: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: l.tags.filter(t => t !== tag) } : l));
  }, []);

  const setReminder = useCallback((leadId: string, date: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, reminder: date } : l));
  }, []);

  const reassignLead = useCallback((leadId: string, owner: TeamMember) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, owner } : l));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...project, id: 'p' + generateId() }]);
  }, []);

  const addLeadToProject = useCallback((leadId: string, projectId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, projectId } : l));
  }, []);

  return (
    <AppContext.Provider value={{ leads, projects, toasts, sidebarOpen, setSidebarOpen, addToast, removeToast, updateLeadStatus, addNote, updateProjectStatus, toggleSaveLead, addTag, removeTag, setReminder, reassignLead, addProject, addLeadToProject }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
