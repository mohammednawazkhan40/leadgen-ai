export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-accent-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 60) return 'bg-accent-500/10 border-accent-500/20';
  if (score >= 40) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

export function getPriorityColor(p: string): string {
  if (p === 'urgent') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (p === 'high') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  if (p === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-navy-700 text-navy-300 border-navy-600';
}

export function getStatusColor(s: string): string {
  const map: Record<string, string> = {
    new: 'bg-navy-600 text-navy-100',
    reviewing: 'bg-accent-500/10 text-accent-400',
    qualified: 'bg-emerald-500/10 text-emerald-400',
    contacted: 'bg-amber-500/10 text-amber-400',
    discovery_call: 'bg-purple-500/10 text-purple-400',
    proposal_sent: 'bg-cyan-500/10 text-cyan-400',
    won: 'bg-emerald-500/15 text-emerald-300',
    lost: 'bg-red-500/10 text-red-400',
  };
  return map[s] || 'bg-navy-700 text-navy-300';
}

export function getStatusLabel(s: string): string {
  const map: Record<string, string> = {
    new: 'New',
    reviewing: 'Reviewing',
    qualified: 'Qualified',
    contacted: 'Contacted',
    discovery_call: 'Discovery Call',
    proposal_sent: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
  };
  return map[s] || s;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
