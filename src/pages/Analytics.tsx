import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import {
  BarChart3,
  Download,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Target,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const dateRanges = ['This Week', 'This Month', 'Last Quarter', 'This Year', 'Custom'] as const;

const funnelColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#059669'];
const pieColors = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-navy-300 text-xs mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<string>('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { leads, projects, stats, addToast } = useApp();
  const { user, profile } = useAuth();

  const weeklyLeadData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; leads: number; qualified: number }[] = [];
    const qualifiedStatuses = new Set(['qualified', 'contacted', 'discovery_call', 'proposal_sent', 'won']);

    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const leadsInWeek = leads.filter(l => {
        const d = new Date(l.postedDate);
        return d >= weekStart && d <= weekEnd;
      });

      weeks.push({
        week: label,
        leads: leadsInWeek.length,
        qualified: leadsInWeek.filter(l => qualifiedStatuses.has(l.status)).length,
      });
    }
    return weeks;
  }, [leads]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      const cat = l.aiCategory || 'Uncategorized';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const conversionData = useMemo(() => {
    const statusOrder = ['new', 'reviewing', 'qualified', 'contacted', 'discovery_call', 'proposal_sent', 'won'];
    const statusLabels: Record<string, string> = {
      new: 'New', reviewing: 'Reviewing', qualified: 'Qualified',
      contacted: 'Contacted', discovery_call: 'Discovery Call',
      proposal_sent: 'Proposal Sent', won: 'Won',
    };
    return statusOrder
      .map(s => ({ stage: statusLabels[s], count: leads.filter(l => l.status === s).length }))
      .filter(d => d.count > 0);
  }, [leads]);

  const pipelineByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      const cat = l.aiCategory || 'Uncategorized';
      const avg = ((l.budgetMin || 0) + (l.budgetMax || 0)) / 2;
      map[cat] = (map[cat] || 0) + avg;
    });
    return Object.entries(map)
      .map(([category, value]) => ({ category, value: Math.round(value) }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const teamPerformance = useMemo(() => {
    const qualifiedStatuses = ['qualified', 'contacted', 'discovery_call', 'proposal_sent', 'won'];
    const qualifiedCount = leads.filter(l => qualifiedStatuses.includes(l.status)).length;
    const wonCount = leads.filter(l => l.status === 'won').length;
    const pipeline = leads.reduce((s, l) => s + ((l.budgetMin || 0) + (l.budgetMax || 0)) / 2, 0);
    return [{
      name: profile?.full_name || 'You',
      leads: leads.length,
      qualified: qualifiedCount,
      won: wonCount,
      pipeline: Math.round(pipeline),
    }];
  }, [leads, user]);

  const keywordPerformance = useMemo(() => {
    const skillCounts: Record<string, { leads: number; qualified: number }> = {};
    const qualifiedStatuses = ['qualified', 'contacted', 'discovery_call', 'proposal_sent', 'won'];
    leads.forEach(l => {
      (l.skills || []).forEach(skill => {
        if (!skillCounts[skill]) skillCounts[skill] = { leads: 0, qualified: 0 };
        skillCounts[skill].leads++;
        if (qualifiedStatuses.includes(l.status)) {
          skillCounts[skill].qualified++;
        }
      });
    });
    return Object.entries(skillCounts)
      .map(([keyword, data]) => ({
        keyword,
        leads: data.leads,
        conversion: data.leads > 0 ? Math.round((data.qualified / data.leads) * 100) : 0,
      }))
      .sort((a, b) => b.conversion - a.conversion)
      .slice(0, 10);
  }, [leads]);

  const leadSources = useMemo(() => {
    const map: Record<string, number> = {};
    const total = leads.length || 1;
    leads.forEach(l => {
      const src = l.source || 'Unknown';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map)
      .map(([source, count]) => ({ source, value: Math.round((count / total) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const kpiCards = useMemo(() => {
    const wonCount = leads.filter(l => l.status === 'won').length;
    const conversionRate = leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(1) : '0';
    const budgets = leads.filter(l => l.budgetMin || l.budgetMax);
    const avgDeal = budgets.length > 0
      ? formatCurrency(Math.round(budgets.reduce((s, l) => s + ((l.budgetMin || 0) + (l.budgetMax || 0)) / 2, 0) / budgets.length))
      : '$0';

    return [
      { title: 'Total Leads', value: String(stats.totalLeads), icon: Users, iconBg: 'bg-accent-500/10', iconColor: 'text-accent-400' },
      { title: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
      { title: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), icon: DollarSign, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
      { title: 'Avg Deal Size', value: avgDeal, icon: TrendingUp, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
    ];
  }, [leads, stats]);

  const handleExport = (format: string) => {
    setExportOpen(false);
    if (format === 'CSV') {
      const csv = [
        'Stage,Count',
        ...conversionData.map(d => `${d.stage},${d.count}`),
        '',
        'Category,Value',
        ...pipelineByCategory.map(d => `${d.category},${d.value}`),
        '',
        'Team Member,Leads,Qualified,Won,Pipeline',
        ...teamPerformance.map(t => `${t.name},${t.leads},${t.qualified},${t.won},${t.pipeline}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leadgen_analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Analytics report exported as CSV');
    } else {
      addToast('info', 'PDF export will be available in the next update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent-500/10 p-2.5 rounded-lg">
            <BarChart3 className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-navy-400 text-sm">Track your lead generation performance</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-navy-200 hover:border-navy-600 transition-colors text-sm"
          >
            <Calendar className="w-4 h-4 text-navy-400" />
            {selectedRange}
            <ChevronDown className="w-4 h-4 text-navy-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 py-1">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => { setSelectedRange(range); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-navy-700 transition-colors ${
                    selectedRange === range ? 'text-accent-400 bg-navy-700/50' : 'text-navy-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-navy-400 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Lead Acquisition Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={weeklyLeadData}>
            <defs>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#142248" />
            <XAxis dataKey="week" stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#6783c1', fontSize: 12 }} />
            <Area type="monotone" dataKey="leads" name="New Leads" stroke="#3b82f6" fill="url(#leadsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="qualified" name="Qualified" stroke="#10b981" fill="url(#qualGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={conversionData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#142248" horizontal={false} />
              <XAxis type="number" stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="stage" stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#6783c1', fontSize: 12, formatter: (v: number) => `${v} (${leads.length > 0 ? ((v / leads.length) * 100).toFixed(1) : 0}%)` }}>
                {conversionData.map((_, index) => (
                  <Cell key={index} fill={funnelColors[index % funnelColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Pipeline by AI Category</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={350}>
              <PieChart>
                <Pie
                  data={pipelineByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pipelineByCategory.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {pipelineByCategory.map((item, index) => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-200 text-sm truncate">{item.category}</p>
                    <p className="text-navy-400 text-xs">{formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Lead Sources</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={leadSources} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#142248" />
              <XAxis dataKey="source" stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Percentage" radius={[4, 4, 0, 0]}>
                {leadSources.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Most Effective Keywords</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={keywordPerformance} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#142248" horizontal={false} />
              <XAxis type="number" stroke="#6783c1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="keyword" stroke="#6783c1" fontSize={11} tickLine={false} axisLine={false} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversion" name="Conversion %" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Team Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-navy-400 text-left border-b border-navy-800">
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Team Member</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Leads</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Qualified</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Won</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Pipeline Value</th>
                <th className="pb-3 font-medium cursor-pointer hover:text-navy-200 transition-colors">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member) => (
                <tr key={member.name} className="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-navy-300 text-xs font-medium">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-white font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-navy-200">{member.leads}</td>
                  <td className="py-3 pr-4 text-navy-200">{member.qualified}</td>
                  <td className="py-3 pr-4">
                    <span className="text-emerald-400 font-medium">{member.won}</span>
                  </td>
                  <td className="py-3 pr-4 text-navy-200">{formatCurrency(member.pipeline)}</td>
                  <td className="py-3 pr-4">
                    <span className="text-accent-400 font-medium">
                      {member.leads > 0 ? ((member.won / member.leads) * 100).toFixed(1) : '0'}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Export Report</h2>
            <p className="text-navy-400 text-sm mt-1">Download your analytics data</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => handleExport('CSV')}
                  className="w-full text-left px-4 py-2 text-sm text-navy-300 hover:bg-navy-700 hover:text-white transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('PDF')}
                  className="w-full text-left px-4 py-2 text-sm text-navy-300 hover:bg-navy-700 hover:text-white transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
