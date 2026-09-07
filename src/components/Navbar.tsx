import React from 'react';
import {
  CheckSquare, LayoutDashboard, Calendar as CalendarIcon, BarChart3,
  Sparkles, History, CheckCheck, RefreshCw, User as UserIcon,
  LogOut, ShieldAlert, Layers, Lock, ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth?: () => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onLogout: () => void;
  onOpenNewTask?: () => void;
  onOpenAiModal?: () => void;
  taskCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenNewTask,
  onOpenAiModal,
  taskCount,
}) => {
  const activeTabId = activeTab || currentTab || 'dashboard';

  const handleTabChange = (tabId: string) => {
    if (onSelectTab) onSelectTab(tabId);
    else if (setCurrentTab) setCurrentTab(tabId);
  };

  const isRifa = Boolean(
    currentUser && (
      (currentUser.email || '').trim().toLowerCase() === 'rifakhanum14@gmail.com' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifakhanum14@gmail.com' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifakhanum' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifa'
    )
  );

  const userFullName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ')
    : '';
  const userDisplayName = userFullName || currentUser?.username || 'User';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'recurring', label: 'Recurring', icon: RefreshCw },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gemini', label: 'Gemini AI', icon: Sparkles, badge: 'Flash' },
    ...(isRifa ? [{ id: 'audit', label: 'Audit Log (Admin)', icon: History }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-md border border-emerald-500/50">
              TF
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">TaskFlow</span>
              <p className="text-xs text-slate-400">Task & Schedule Management</p>
            </div>
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-200">
                      {userDisplayName}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isRifa
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                      title={isRifa ? 'Authorized Audit Access' : 'Audit logs restricted to Rifa Khanum'}
                    >
                      {isRifa ? 'Admin' : 'Member'}
                    </span>
                    {isRifa ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Authorized Audit Access" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" title="Audit Restricted" />
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign Out / Switch"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTabId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-current' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1 rounded bg-indigo-900/80 text-indigo-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
