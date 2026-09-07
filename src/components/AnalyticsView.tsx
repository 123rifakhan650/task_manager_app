import React from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { DashboardStats, Task } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats | null;
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  tasks,
}) => {
  const total = stats?.total_tasks || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          Task Analytics
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Task Performance & Distribution</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Overview of task completion status, priority allocations, and recurring schedule progress.
        </p>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Status Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across workflow states</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Completed', count: stats?.completed_tasks || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'In Progress', count: stats?.in_progress_tasks || 0, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'In Review', count: stats?.review_tasks || 0, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'To Do', count: stats?.todo_tasks || 0, color: 'bg-slate-600', text: 'text-slate-400' },
            ].map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">
                      <span className={item.text}>{item.count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Overall Completion Rate</span>
            <span className="font-bold text-emerald-400">{stats?.completion_rate || 0}%</span>
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Priority Matrix</h3>
              <p className="text-xs text-slate-400">Priority and urgency distribution</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Urgent', count: stats?.priority_breakdown?.URGENT || 0, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: stats?.priority_breakdown?.HIGH || 0, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Medium', count: stats?.priority_breakdown?.MEDIUM || 0, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low', count: stats?.priority_breakdown?.LOW || 0, color: 'bg-slate-500', text: 'text-slate-400' },
            ].map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">
                      <span className={item.text}>{item.count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Critical Items (High + Urgent)</span>
            <span className="font-bold text-amber-400">
              {(stats?.priority_breakdown?.URGENT || 0) + (stats?.priority_breakdown?.HIGH || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
