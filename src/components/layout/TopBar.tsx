import { useState } from 'react';
import { Search, Bell, RefreshCw, Menu, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { currentUser } from '../../data/mockData';

export default function TopBar() {
  const { setSidebarOpen, addToast } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

  const syncToast = () => {
    addToast('info', 'Syncing leads from LinkedIn...');
    setTimeout(() => addToast('success', 'Leads synced successfully! 24 new leads found.'), 2000);
  };

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <header className="h-16 bg-[#0a1628] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          className={`relative hidden sm:flex items-center transition-all duration-200 ${
            searchFocused ? 'w-80' : 'w-64'
          }`}
        >
          <Search className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, projects, contacts..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={syncToast}
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Leads</span>
        </button>

        <button className="sm:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>

        <button className="relative text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0a1628]" />
        </button>

        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white leading-none">{currentUser.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{currentUser.company}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
