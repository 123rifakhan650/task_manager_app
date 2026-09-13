import React, { useState, useMemo } from 'react';
import {
  BarChart3, CheckCircle2, AlertTriangle, Flame,
  Clock, ShieldAlert, Zap, Layers, Filter, Check,
  ArrowUpRight, Target, Activity, Sparkles, PieChart
} from 'lucide-react';
import { DashboardStats, Task, Priority } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats | null;
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  tasks,
  onSelectTask,
}) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<Priority | 'ALL'>('ALL');

  // Compute live priority breakdown directly from current tasks for 100% real-time reactivity
  const priorityData = useMemo(() => {
    const total = tasks.length > 0 ? tasks.length : (stats?.total_tasks || 0);

    const urgentTasks = tasks.filter(t => t.priority === 'URGENT');
    const highTasks = tasks.filter(t => t.priority === 'HIGH');
    const mediumTasks = tasks.filter(t => t.priority === 'MEDIUM');
    const lowTasks = tasks.filter(t => t.priority === 'LOW');

    const urgentCount = tasks.length > 0 ? urgentTasks.length : (stats?.priority_breakdown?.URGENT ?? (stats as any)?.by_priority?.URGENT ?? 0);
    const highCount = tasks.length > 0 ? highTasks.length : (stats?.priority_breakdown?.HIGH ?? (stats as any)?.by_priority?.HIGH ?? 0);
    const mediumCount = tasks.length > 0 ? mediumTasks.length : (stats?.priority_breakdown?.MEDIUM ?? (stats as any)?.by_priority?.MEDIUM ?? 0);
    const lowCount = tasks.length > 0 ? lowTasks.length : (stats?.priority_breakdown?.LOW ?? (stats as any)?.by_priority?.LOW ?? 0);

    const completed = tasks.length > 0 ? tasks.filter(t => t.status === 'COMPLETED').length : (stats?.completed_tasks || 0);
    const inProgress = tasks.length > 0 ? tasks.filter(t => t.status === 'IN_PROGRESS').length : (stats?.in_progress_tasks || 0);
    const inReview = tasks.length > 0 ? tasks.filter(t => t.status === 'REVIEW').length : (stats?.review_tasks || 0);
    const todo = tasks.length > 0 ? tasks.filter(t => t.status === 'TODO').length : (stats?.todo_tasks || 0);

    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0) || (stats?.total_estimated_hours || 0);
    const totalActHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0) || (stats?.total_actual_hours || 0);

    const criticalCount = urgentCount + highCount;
    const criticalPct = total > 0 ? Math.round((criticalCount / total) * 100) : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : (stats?.completion_rate || 0);

    return {
      total,
      urgent: {
        count: urgentCount,
        pct: total > 0 ? Math.round((urgentCount / total) * 100) : 0,
        tasks: urgentTasks,
        completed: urgentTasks.filter(t => t.status === 'COMPLETED').length,
        estHours: urgentTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
      },
      high: {
        count: highCount,
        pct: total > 0 ? Math.round((highCount / total) * 100) : 0,
        tasks: highTasks,
        completed: highTasks.filter(t => t.status === 'COMPLETED').length,
        estHours: highTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
      },
      medium: {
        count: mediumCount,
        pct: total > 0 ? Math.round((mediumCount / total) * 100) : 0,
        tasks: mediumTasks,
        completed: mediumTasks.filter(t => t.status === 'COMPLETED').length,
        estHours: mediumTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
      },
      low: {
        count: lowCount,
        pct: total > 0 ? Math.round((lowCount / total) * 100) : 0,
        tasks: lowTasks,
        completed: lowTasks.filter(t => t.status === 'COMPLETED').length,
        estHours: lowTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
      },
      status: {
        completed,
        inProgress,
        inReview,
        todo,
      },
      totalEstHours,
      totalActHours,
      criticalCount,
      criticalPct,
      completionRate,
    };
  }, [tasks, stats]);

  // Quadrants configuration for Eisenhower Priority Matrix
  const quadrants: Array<{
    priority: Priority;
    quadrantNumber: string;
    title: string;
    subtitle: string;
    actionLabel: string;
    description: string;
    colorBadge: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    icon: React.ReactNode;
    data: typeof priorityData.urgent;
  }> = [
    {
      priority: 'URGENT',
      quadrantNumber: 'Q1',
      title: 'Urgent & Critical',
      subtitle: 'Do First (Immediate Execution)',
      actionLabel: 'Immediate Action',
      description: 'Pressing deadlines, production issues, and blocker tasks requiring immediate attention.',
      colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderClass: 'border-rose-500/30 hover:border-rose-500/70',
      bgClass: 'bg-rose-950/20',
      textClass: 'text-rose-400',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      data: priorityData.urgent,
    },
    {
      priority: 'HIGH',
      quadrantNumber: 'Q2',
      title: 'High Priority',
      subtitle: 'Schedule & Plan (Strategic Value)',
      actionLabel: 'Plan & Dedicate Time',
      description: 'Major milestones, architecture design, and strategic features with significant impact.',
      colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderClass: 'border-amber-500/30 hover:border-amber-500/70',
      bgClass: 'bg-amber-950/20',
      textClass: 'text-amber-400',
      icon: <Target className="w-4 h-4 text-amber-400" />,
      data: priorityData.high,
    },
    {
      priority: 'MEDIUM',
      quadrantNumber: 'Q3',
      title: 'Medium Priority',
      subtitle: 'Standard Flow (Operational)',
      actionLabel: 'Batch & Execute',
      description: 'Routine maintenance, feature enhancements, and standard sprint requirements.',
      colorBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderClass: 'border-blue-500/30 hover:border-blue-500/70',
      bgClass: 'bg-blue-950/20',
      textClass: 'text-blue-400',
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      data: priorityData.medium,
    },
    {
      priority: 'LOW',
      quadrantNumber: 'Q4',
      title: 'Low Priority',
      subtitle: 'Backlog & Nice-to-Have',
      actionLabel: 'Review / Backlog',
      description: 'Non-critical polish, documentation cleanup, and low-friction exploratory tasks.',
      colorBadge: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
      borderClass: 'border-slate-700/60 hover:border-slate-600',
      bgClass: 'bg-slate-900/60',
      textClass: 'text-slate-400',
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      data: priorityData.low,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>Task Intelligence & Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Priority Matrix & Performance</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time Eisenhower priority matrix, workload severity distribution, and milestone velocity tracking powered by live task state.
          </p>
        </div>

        {/* Live Summary Quick Stat */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-slate-400">Total Analyzed: </span>
            <span className="font-bold text-white">{priorityData.total} Tasks</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Tasks</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{priorityData.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {priorityData.status.completed} completed ({priorityData.completionRate}%)
          </div>
        </div>

        {/* Critical Load */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Critical Load</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {priorityData.criticalCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">({priorityData.criticalPct}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Urgent + High severity tasks
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {priorityData.completionRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${priorityData.completionRate}%` }}
            />
          </div>
        </div>

        {/* Estimated Hours */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Allocated Effort</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {priorityData.totalEstHours}h
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {priorityData.totalActHours}h logged actual effort
          </div>
        </div>
      </div>

      {/* ==================== EISENHOWER PRIORITY MATRIX (2x2 GRID) ==================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Decision Framework
              </span>
              <h3 className="text-base font-bold text-white">Eisenhower 2×2 Priority Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quadrant mapping based on urgency and strategic importance. Click any quadrant to inspect tasks.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedQuadrant('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                selectedQuadrant === 'ALL'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({priorityData.total})
            </button>
            {quadrants.map(q => (
              <button
                key={q.priority}
                type="button"
                onClick={() => setSelectedQuadrant(q.priority)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition flex items-center gap-1 ${
                  selectedQuadrant === q.priority
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{q.quadrantNumber}</span>
                <span>({q.data.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2x2 Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quadrants.map(q => {
            const isSelected = selectedQuadrant === 'ALL' || selectedQuadrant === q.priority;
            return (
              <div
                key={q.priority}
                onClick={() => setSelectedQuadrant(selectedQuadrant === q.priority ? 'ALL' : q.priority)}
                className={`rounded-xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${q.bgClass} ${q.borderClass} ${
                  isSelected ? 'opacity-100 ring-1 ring-cyan-500/30' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <div>
                  {/* Top Bar with Badge & Count */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {q.quadrantNumber}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${q.colorBadge}`}>
                        {q.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-right font-mono">
                      <span className={`text-xl font-bold ${q.textClass}`}>{q.data.count}</span>
                      <span className="text-xs text-slate-400">({q.data.pct}%)</span>
                    </div>
                  </div>

                  {/* Subtitle & Description */}
                  <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mt-1">
                    {q.icon}
                    <span>{q.subtitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {q.description}
                  </p>
                </div>

                {/* Progress bar inside quadrant */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progress ({q.data.completed}/{q.data.count} completed)</span>
                    <span className="font-mono text-slate-300">
                      {q.data.count > 0 ? Math.round((q.data.completed / q.data.count) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        q.priority === 'URGENT' ? 'bg-rose-500' :
                        q.priority === 'HIGH' ? 'bg-amber-500' :
                        q.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}
                      style={{
                        width: `${q.data.count > 0 ? Math.round((q.data.completed / q.data.count) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Task List Preview in Quadrant */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  {q.data.tasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic py-1">No tasks in this quadrant</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {q.data.tasks.map(t => (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectTask) onSelectTask(t);
                          }}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition text-xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              t.status === 'COMPLETED' ? 'bg-emerald-400' :
                              t.status === 'IN_PROGRESS' ? 'bg-amber-400' :
                              t.status === 'REVIEW' ? 'bg-indigo-400' : 'bg-slate-500'
                            }`} />
                            <span className={`truncate font-medium ${t.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                              {t.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                              {t.status.replace('_', ' ')}
                            </span>
                            {onSelectTask && (
                              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== LOWER DETAILED BREAKDOWN (2 COLUMNS) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Severity Distribution Progress Bars */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6 space-y-4 shadow-sm">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Priority Severity Breakdown</h3>
              <p className="text-xs text-slate-400">Relative allocation of tasks by urgency level</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-4">
            {[
              { label: 'Urgent Priority', key: 'URGENT', data: priorityData.urgent, color: 'bg-rose-500', text: 'text-rose-400', badge: 'Critical' },
              { label: 'High Priority', key: 'HIGH', data: priorityData.high, color: 'bg-amber-500', text: 'text-amber-400', badge: 'High Impact' },
              { label: 'Medium Priority', key: 'MEDIUM', data: priorityData.medium, color: 'bg-blue-500', text: 'text-blue-400', badge: 'Routine' },
              { label: 'Low Priority', key: 'LOW', data: priorityData.low, color: 'bg-slate-500', text: 'text-slate-400', badge: 'Backlog' },
            ].map(item => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className={`font-bold ${item.text}`}>{item.data.count} tasks</span>
                    <span className="text-slate-400 ml-1.5">({item.data.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.data.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{item.data.completed} of {item.data.count} completed</span>
                  <span>{item.data.estHours}h planned</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Critical Severity (High + Urgent)</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
              {priorityData.criticalCount} tasks ({priorityData.criticalPct}%)
            </span>
          </div>
        </div>

        {/* Workflow State Distribution & Health */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6 space-y-4 shadow-sm">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Workflow Status & Velocity</h3>
              <p className="text-xs text-slate-400">Distribution across task lifecycle stages</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-4">
            {[
              { label: 'Completed', count: priorityData.status.completed, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'In Progress', count: priorityData.status.inProgress, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'In Review', count: priorityData.status.inReview, color: 'bg-indigo-500', text: 'text-indigo-400' },
              { label: 'To Do (Pending)', count: priorityData.status.todo, color: 'bg-slate-600', text: 'text-slate-400' },
            ].map(item => {
              const pct = priorityData.total > 0 ? Math.round((item.count / priorityData.total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="font-mono text-xs">
                      <span className={`font-bold ${item.text}`}>{item.count}</span>
                      <span className="text-slate-400 ml-1.5">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Health & Balance Diagnostic Box */}
          <div className="pt-3 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-semibold text-slate-200">Workload Assessment: </span>
                {priorityData.criticalPct > 60 ? (
                  <span className="text-amber-300">
                    High concentration of critical tasks ({priorityData.criticalPct}%). Prioritize clearing Urgent items before taking on new backlog items.
                  </span>
                ) : priorityData.completionRate >= 50 ? (
                  <span className="text-emerald-300">
                    Healthy workload balance with strong completion momentum ({priorityData.completionRate}% completion rate).
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Balanced priority distribution across operational and backlog tasks with {priorityData.status.todo} pending items.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
