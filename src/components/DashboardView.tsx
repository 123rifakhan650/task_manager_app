import React from 'react';
import {
  CheckCircle2, Clock, AlertCircle, RefreshCw, BarChart2,
  TrendingUp, Sparkles, Plus, History, ArrowRight, ShieldCheck
} from 'lucide-react';
import { DashboardStats, Task, User } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  tasks: Task[];
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenNewTask: () => void;
  onOpenAiTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  tasks,
  currentUser,
  onNavigate,
  onOpenNewTask,
  onOpenAiTask,
}) => {
  const recentTasks = tasks.slice(0, 5);
  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.is_superuser ||
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              TaskFlow Workspace Active
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {userDisplayName}!
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Your task workspace is ready. Manage your tasks, schedule recurring jobs, and track your progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiTask}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Generate Task with AI
            </button>
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats?.total_tasks || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {stats?.completion_rate || 0}% Completed
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats?.completion_rate || 0}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats?.in_progress_tasks || 0}</span>
            <span className="text-xs text-slate-400 font-medium">
              Review: {stats?.review_tasks || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Active tasks in progress</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Recurring Tasks</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats?.active_recurring || 0}</span>
            <span className="text-xs text-cyan-400 font-medium">
              {stats?.pending_occurrences || 0} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Daily & weekly automated cadences</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Tasks & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Active & Recent Tasks</h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
            >
              View All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-lg">
              No tasks recorded yet. Create a task to start tracking progress.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentTasks.map(task => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <h3 className={`text-sm font-medium truncate ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {task.title}
                      </h3>
                      {task.is_ai_generated && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {task.status === 'COMPLETED' && task.completed_at
                        ? `Completed on ${task.completed_at.slice(0, 10)}`
                        : `Due: ${task.due_date || 'No deadline'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : task.status === 'REVIEW'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority & Status Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Priority Distribution</h2>
            <p className="text-xs text-slate-400">Current workload severity</p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Urgent', count: stats?.priority_breakdown?.URGENT || 0, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: stats?.priority_breakdown?.HIGH || 0, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: stats?.priority_breakdown?.MEDIUM || 0, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low', count: stats?.priority_breakdown?.LOW || 0, color: 'bg-slate-500', text: 'text-slate-400' },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{p.label} Priority</span>
                  <span className={`font-mono font-medium ${p.text}`}>{p.count}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${p.color} h-full rounded-full`}
                    style={{
                      width: `${stats?.total_tasks ? ((p.count / stats.total_tasks) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Trail Snippet - Restricted to Admin only */}
      {isAdmin && stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">System Audit Trail Feed</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                Admin Only
              </span>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              View Complete Log →
            </button>
          </div>
          <div className="space-y-2">
            {stats.recent_activity.slice(0, 4).map(log => (
              <div key={log.id} className="text-xs flex items-center justify-between text-slate-300 py-1.5 px-2.5 rounded bg-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {log.action}
                  </span>
                  <span className="truncate">{log.details}</span>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap ml-2">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
