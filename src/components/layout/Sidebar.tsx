import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, BookOpen, Bookmark, FolderKanban, Send, BarChart3, Plug, Settings, Zap, X, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/dictionary', label: 'Lead Dictionary', icon: BookOpen },
  { to: '/app/leads', label: 'AI Discovery', icon: Search },
  { to: '/app/saved', label: 'Saved Leads', icon: Bookmark },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  { to: '/app/outreach', label: 'Outreach', icon: Send },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/integrations', label: 'Integrations', icon: Plug },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

function downloadLogo(format: 'svg' | 'png') {
  if (format === 'svg') {
    const link = document.createElement('a');
    link.href = '/logo.svg';
    link.download = 'leadgen-ai-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
      <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0f172a"/><stop offset="100%" style="stop-color:#1e293b"/></linearGradient>
      <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs>
      <rect width="400" height="100" rx="16" fill="url(#bg)"/>
      <rect x="16" y="18" width="64" height="64" rx="14" fill="url(#blue)"/>
      <path d="M36 62V34 L48 48 L48 34 L60 48 L60 62 L48 48" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="48" cy="28" r="4" fill="white"/>
      <text x="96" y="58" font-family="Inter, system-ui, sans-serif" font-size="40" font-weight="800" fill="white">Lead</text>
      <text x="212" y="58" font-family="Inter, system-ui, sans-serif" font-size="40" font-weight="800" fill="#60a5fa">Gen</text>
      <text x="308" y="58" font-family="Inter, system-ui, sans-serif" font-size="40" font-weight="800" fill="white"> AI</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 200);
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = 'leadgen-ai-logo.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, addToast } = useApp();
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-[#0a1628] border-r border-white/5
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Lead<span className="text-blue-400">Gen</span> AI
            </span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/5 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => { downloadLogo('svg'); addToast('success', 'Logo downloaded as SVG'); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-400 hover:text-white transition-colors border border-white/5"
            >
              <Download className="w-3 h-3" /> SVG
            </button>
            <button
              onClick={() => { downloadLogo('png'); addToast('success', 'Logo downloaded as PNG'); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-400 hover:text-white transition-colors border border-white/5"
            >
              <Download className="w-3 h-3" /> PNG
            </button>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            LinkedIn data usage complies with platform ToS. Lead data is processed securely and never shared with third parties.
          </p>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
