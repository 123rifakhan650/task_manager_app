import React from 'react';
import {
  CheckCircle2, Clock, AlertCircle, RefreshCw, BarChart2,
  TrendingUp, Sparkles, Plus, History, ArrowRight, ShieldCheck, Pencil
} from 'lucide-react';
import { DashboardStats, Task, RecurringTask, User } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  tasks: Task[];
  recurringTasks?: RecurringTask[];
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenNewTask: () => void;
  onOpenAiTask: () => void;
  onEditTask?: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  tasks,
  recurringTasks = [],
  currentUser,
  onNavigate,
  onOpenNewTask,
  onOpenAiTask,
  onEditTask,
}) => {
  const recentTasks = tasks.slice(0, 6);
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
              Your task workspace is ready. Manage tasks, create recurring schedules, and track productivity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('recurring')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-white text-sm font-medium transition shadow-sm border border-cyan-600/50"
            >
              <RefreshCw className="w-4 h-4 text-cyan-200" />
              Recurring Tasks
            </button>
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
        <div
          onClick={() => onNavigate('tasks')}
          className="rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-emerald-500/50 transition group"
          title="Click to view all tasks"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider group-hover:text-emerald-400 transition">Total Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{stats?.total_tasks || tasks.length}</span>
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

        <div
          onClick={() => onNavigate('tasks')}
          className="rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-amber-500/50 transition group"
          title="Click to view in progress tasks"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider group-hover:text-amber-400 transition">In Progress</span>
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

        <div
          onClick={() => onNavigate('recurring')}
          className="rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-cyan-500/60 transition group"
          title="Click to view and manage Recurring Tasks"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider group-hover:text-cyan-400 transition">Recurring Tasks</span>
            <RefreshCw className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition duration-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{recurringTasks.length || stats?.active_recurring || 0}</span>
            <span className="text-xs text-cyan-400 font-medium">
              {stats?.pending_occurrences || 0} Scheduled →
            </span>
          </div>
          <p className="text-xs text-cyan-400/80 mt-3 flex items-center justify-between font-medium">
            <span>Daily & weekly repeating cadences</span>
            <span className="text-xs font-semibold">Open View →</span>
          </p>
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
              No tasks recorded yet. Create a task or a recurring schedule to start tracking progress.
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
                            : task.priority === 'LOW'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
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
                      {(task as any).recurring_task_id && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                          Recurring
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
                    {onEditTask && (
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                        title="Edit Task & Priority"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
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
              { label: 'Urgent', count: stats?.priority_breakdown?.URGENT || tasks.filter(t => t.priority === 'URGENT').length, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: stats?.priority_breakdown?.HIGH || tasks.filter(t => t.priority === 'HIGH').length, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: stats?.priority_breakdown?.MEDIUM || tasks.filter(t => t.priority === 'MEDIUM').length, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low', count: stats?.priority_breakdown?.LOW || tasks.filter(t => t.priority === 'LOW').length, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map(p => {
              const total = tasks.length || 1;
              const percent = Math.round((p.count / total) * 100);
              return (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{p.label} Priority</span>
                    <span className={`font-mono font-medium ${p.text}`}>{p.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${p.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recurring Schedules & Cadence Section on Dashboard */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Recurring Schedules & Cadence</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {recurringTasks.length} Active
            </span>
          </div>
          <button
            onClick={() => onNavigate('recurring')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
          >
            Manage in Recurring Tab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recurringTasks.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-lg">
            No recurring schedules configured. Click the "Recurring Tasks" button at the top to create your first schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recurringTasks.slice(0, 6).map(rec => {
              const occurrences = rec.occurrences || [];
              const pendingOcc = occurrences.find(o => o.status === 'PENDING') || occurrences[0];
              return (
                <div key={rec.id} className="p-4 rounded-lg border border-slate-800 bg-slate-950/70 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold uppercase">
                        {rec.frequency}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">{rec.title}</h4>
                      {rec.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{rec.description}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      rec.priority === 'LOW'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : rec.priority === 'URGENT'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-blue-950 text-blue-300 border-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                    <span>Next: <strong className="text-slate-200">{pendingOcc?.scheduled_date || 'Scheduled'}</strong></span>
                    <button
                      onClick={() => onNavigate('recurring')}
                      className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-0.5"
                    >
                      Occurrences →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Audit Trail Snippet - Restricted to Admin only */}
      {isAdmin && stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Recent System Activity</h2>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
            >
              Full Audit Trail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {stats.recent_activity.slice(0, 4).map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

