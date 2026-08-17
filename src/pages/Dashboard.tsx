import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getGreeting, formatRelativeTime } from '../utils/ai';
import { formatCurrency, getScoreColor, getStatusColor, getStatusLabel } from '../utils/helpers';
import { weeklyLeadData, categoryData } from '../data/mockData';
import { TrendingUp, Target, DollarSign, Reply, Eye, Bookmark, BookmarkCheck, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { leads, projects, stats, loading, addToast, toggleSaveLead, refreshLeads, refreshStats } = useApp();
  const { user, profile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

  const kpis = [
    { label: 'New Leads This Week', value: String(stats.newLeads), change: '+18%', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-emerald-500/10 text-emerald-400', to: '/app/leads' },
    { label: 'Qualified Opportunities', value: String(stats.qualifiedLeads), change: '+8%', icon: <Target className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-400', to: '/app/saved' },
    { label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), change: '+24%', icon: <DollarSign className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-400', to: '/app/analytics' },
    { label: 'Reply Rate', value: `${stats.replyRate}%`, change: '+3.2%', icon: <Reply className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-400', to: '/app/outreach' },
  ];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await Promise.all([refreshLeads(), refreshStats()]);
      addToast('success', 'Sync completed — data refreshed');
    } catch {
      addToast('error', 'Sync failed — please try again');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-800 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-800 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-24 bg-gray-800 rounded mb-3" />
              <div className="h-8 w-20 bg-gray-800 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card animate-pulse"><div className="h-64 bg-gray-800 rounded" /></div>
          <div className="card animate-pulse"><div className="h-64 bg-gray-800 rounded" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">{getGreeting()}, {profile?.full_name || 'Alex'}. Here's your pipeline overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Link
            key={i}
            to={kpi.to}
            className="card hover:shadow-lg hover:border-gray-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{kpi.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{kpi.value}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {kpi.change} from last week
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${kpi.color} group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Lead Activity</h3>
          <div className="h-64">
            {weeklyLeadData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyLeadData}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#leadGrad)" strokeWidth={2} name="Leads" />
                  <Area type="monotone" dataKey="qualified" stroke="#10b981" fill="url(#qualGrad)" strokeWidth={2} name="Qualified" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No activity data yet</div>
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Leads by AI Category</h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No category data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Top Opportunities</h3>
          <Link to="/app/leads" className="text-sm text-blue-400 hover:text-blue-300">View All →</Link>
        </div>
        {leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <p>No leads yet. Start by adding or importing leads.</p>
            <Link to="/app/leads" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">Add Leads →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 font-medium">Company / Person</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 6).map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate('/app/leads/' + lead.id)}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0">
                          {lead.company.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{lead.company}</p>
                          <p className="text-xs text-gray-400 truncate">{lead.contactName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300 max-w-[200px] truncate">{lead.title}</td>
                    <td className="py-3"><span className="badge bg-blue-500/10 text-blue-400">{lead.aiCategory}</span></td>
                    <td className="py-3 text-gray-300">{formatCurrency(lead.budgetMin || 0)}-{formatCurrency(lead.budgetMax || 0)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${getScoreColor(lead.scoreOverall || 0)}`}>
                        <span className={`w-2 h-2 rounded-full ${(lead.scoreOverall || 0) >= 80 ? 'bg-emerald-400' : (lead.scoreOverall || 0) >= 60 ? 'bg-blue-400' : (lead.scoreOverall || 0) >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} />
                        {lead.scoreOverall || 0}
                      </span>
                    </td>
                    <td className="py-3"><span className={`badge text-xs ${getStatusColor(lead.status)}`}>{getStatusLabel(lead.status)}</span></td>
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Link to={`/app/leads/${lead.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => toggleSaveLead(lead.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                          {lead.saved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        {lead.source && <a href={lead.source} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Recent Sync Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Last sync</span><span className="text-white">{formatRelativeTime(lastSyncTime)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">New leads found</span><span className="text-white">{stats.newLeads}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Status</span><span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-4 h-4" /> Success</span></div>
          </div>
          <button onClick={handleSync} disabled={syncing} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            {syncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</> : <><RefreshCw className="w-4 h-4" /> Sync Now</>}
          </button>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-3">API Connection Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">LinkedIn API</span><span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-4 h-4" /> Connected</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">CSV Import</span><span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-4 h-4" /> Connected</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Email Integration</span><span className="flex items-center gap-1.5 text-red-400"><AlertCircle className="w-4 h-4" /> Error</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Last checked</span><span className="text-white flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatRelativeTime(lastSyncTime)}</span></div>
          </div>
          <Link to="/app/integrations" className="btn-secondary w-full mt-4 block text-center">Manage Integrations →</Link>
        </div>
      </div>
    </div>
  );
}
