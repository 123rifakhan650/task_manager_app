import React, { useState } from 'react';
import {
  Plus, Activity,
  Calendar, CheckCircle
} from 'lucide-react';
import { Metric } from '../types';

interface MetricsViewProps {
  metrics: Metric[];
  onAddMetric: (payload: {
    name: string;
    value: number;
    unit: string;
    recorded_date: string;
    notes: string;
  }) => Promise<void>;
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  metrics,
  onAddMetric,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('points');
  const [notes, setNotes] = useState('');
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value) return;
    setIsSubmitting(true);
    try {
      await onAddMetric({
        name: name.trim(),
        value: Number(value),
        unit: unit.trim(),
        recorded_date: recordedDate,
        notes: notes.trim(),
      });
      setName('');
      setValue('');
      setNotes('');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5" />
            Engineering Metrics & KPI Registry
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Velocity & Performance Metrics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log sprint velocities, test coverage percentages, PR cycle times, and custom engineering milestones.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" />
          Add Metric
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-300">{metric.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{metric.value}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono">
                {metric.unit}
              </span>
            </div>
            {metric.notes && (
              <p className="text-xs text-slate-400 leading-relaxed">{metric.notes}</p>
            )}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-600" />
                {metric.recorded_date}
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3 h-3" /> Validated
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Add Metric</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Metric Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sprint Velocity, Code Coverage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numeric Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g., 48.5"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="points, %, hours"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recorded Date</label>
                <input
                  type="date"
                  value={recordedDate}
                  onChange={(e) => setRecordedDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Context, team observations, or milestone details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
                >
                  {isSubmitting ? 'Recording...' : 'Add Metric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
