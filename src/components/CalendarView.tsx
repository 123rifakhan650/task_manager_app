import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Clock, CheckCircle, AlertCircle, RefreshCw, Tag
} from 'lucide-react';
import { Task, TaskOccurrence } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  occurrences: TaskOccurrence[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  occurrences,
  onSelectTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group items by date YYYY-MM-DD
  const itemsByDate: Record<string, { tasks: Task[]; occurrences: TaskOccurrence[] }> = {};

  tasks.forEach(t => {
    if (t.due_date) {
      if (!itemsByDate[t.due_date]) itemsByDate[t.due_date] = { tasks: [], occurrences: [] };
      itemsByDate[t.due_date].tasks.push(t);
    }
  });

  occurrences.forEach(occ => {
    if (occ.scheduled_date) {
      if (!itemsByDate[occ.scheduled_date]) itemsByDate[occ.scheduled_date] = { tasks: [], occurrences: [] };
      itemsByDate[occ.scheduled_date].occurrences.push(occ);
    }
  });

  const selectedItems = selectedDay ? itemsByDate[selectedDay] : null;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar Schedule
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View and manage scheduled tasks and recurring occurrences by date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:text-white text-slate-400 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:text-white text-slate-400 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 pb-3 border-b border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Blank days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] p-1 rounded-lg bg-slate-950/30 opacity-40"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayData = itemsByDate[dateStr];
              const isSelected = selectedDay === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`min-h-[84px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                      : isToday
                      ? 'bg-slate-800/80 border-slate-600'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayData && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {dayData.tasks.length + dayData.occurrences.length}
                      </span>
                    )}
                  </div>

                  {/* Day Pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayData?.tasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-300'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayData?.occurrences.slice(0, 1).map(occ => (
                      <div
                        key={occ.id}
                        className="text-[9px] px-1 py-0.5 rounded truncate bg-cyan-950 text-cyan-300 font-medium flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-2 h-2 shrink-0" />
                        <span className="truncate">{occ.recurring_task_title}</span>
                      </div>
                    ))}
                    {dayData && (dayData.tasks.length + dayData.occurrences.length > 3) && (
                      <span className="text-[8px] text-slate-500 block">
                        +{dayData.tasks.length + dayData.occurrences.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">
              Deliverables for {selectedDay || 'Selected Day'}
            </h3>
            <p className="text-xs text-slate-400">Scheduled tasks & occurrences</p>
          </div>

          {!selectedItems || (selectedItems.tasks.length === 0 && selectedItems.occurrences.length === 0) ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No tasks or recurring occurrences scheduled on this date.
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {/* Tasks on this day */}
              {selectedItems.tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-800/60 hover:border-slate-700 cursor-pointer text-xs space-y-1.5 transition"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-950 text-rose-300'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.status}</span>
                  </div>
                  <h4 className="font-semibold text-slate-100">{t.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{t.description}</p>
                </div>
              ))}

              {/* Recurring Occurrences on this day */}
              {selectedItems.occurrences.map(occ => (
                <div
                  key={occ.id}
                  className="p-3 rounded-lg border border-cyan-900/60 bg-cyan-950/20 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Recurring Cadence
                    </span>
                    <span className="text-[10px] uppercase font-mono">{occ.status}</span>
                  </div>
                  <h4 className="text-slate-200">{occ.recurring_task_title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
