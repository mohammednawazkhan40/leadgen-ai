import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const toastStyles: Record<string, string> = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/15 border-red-500/30 text-red-400',
  info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
};

const dotStyles: Record<string, string> = {
  success: 'bg-emerald-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useApp();

  return (
    <div className="flex h-screen bg-[#060e1f] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border
              backdrop-blur-sm shadow-lg max-w-sm animate-slide-in
              ${toastStyles[toast.type] || toastStyles.info}
            `}
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotStyles[toast.type] || dotStyles.info}`} />
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
