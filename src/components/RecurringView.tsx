import React, { useState } from 'react';
import {
  RefreshCw, Plus, Calendar, CheckCircle2,
  Edit2, Trash2, MessageSquare, X, Check, AlertTriangle
} from 'lucide-react';
import { RecurringTask, RecurrenceFrequency, Priority } from '../types';

interface RecurringViewProps {
  recurringTasks: RecurringTask[];
  onCreateRecurring: (payload: {
    title: string;
    description: string;
    frequency: RecurrenceFrequency;
    interval: number;
    days_of_week: string;
    priority: Priority;
    generate_count?: number;
  }) => Promise<void>;
  onUpdateRecurring: (id: number, payload: Partial<RecurringTask>) => Promise<void>;
  onDeleteRecurring: (id: number) => Promise<void>;
  onDeleteOccurrence?: (occurrenceId: number) => Promise<void>;
  onGenerateOccurrences: (recurringId: number, count: number) => Promise<void>;
  onCompleteOccurrence: (occurrenceId: number) => Promise<void>;
  onUpdateOccurrenceNote: (occurrenceId: number, note: string) => Promise<void>;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  recurringTasks,
  onCreateRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onDeleteOccurrence,
  onGenerateOccurrences,
  onCompleteOccurrence,
  onUpdateOccurrenceNote,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('WEEKLY');
  const [interval, setIntervalVal] = useState<number>(1);
  const [generateCount, setGenerateCount] = useState<number>(4);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-task generation count selector on cards
  const [generateCounts, setGenerateCounts] = useState<{ [id: number]: number }>({});

  // In-app Delete Confirmation state for Recurring Task
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Occurrence delete confirmation state
  const [deleteConfirmOccurrence, setDeleteConfirmOccurrence] = useState<{ id: number; date: string; title: string } | null>(null);
  const [isDeletingOccurrence, setIsDeletingOccurrence] = useState(false);

  // Occurrence comment state
  const [editingNoteOccurrenceId, setEditingNoteOccurrenceId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [generatingForId, setGeneratingForId] = useState<number | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setFrequency('WEEKLY');
    setIntervalVal(1);
    setGenerateCount(4);
    setPriority('MEDIUM');
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (task: RecurringTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setFrequency(task.frequency);
    setIntervalVal(task.interval || 1);
    setPriority(task.priority);
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalError('Please enter a recurring task title');
      return;
    }
    setModalError(null);
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await onUpdateRecurring(editingTask.id, {
          title: title.trim(),
          description: description.trim(),
          frequency,
          interval: Math.max(1, Number(interval) || 1),
          priority,
        });
      } else {
        await onCreateRecurring({
          title: title.trim(),
          description: description.trim(),
          frequency,
          interval: Math.max(1, Number(interval) || 1),
          days_of_week: 'Mon,Wed,Fri',
          priority,
          generate_count: Math.max(1, Number(generateCount) || 1),
        });
      }
      setShowModal(false);
    } catch (err: any) {
      console.error('Failed to save recurring task:', err);
      setModalError(err.message || 'Failed to save recurring task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTask) return;
    setIsDeleting(true);
    try {
      await onDeleteRecurring(deleteConfirmTask.id);
      setDeleteConfirmTask(null);
    } catch (err) {
      console.error('Failed to delete recurring task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteOccurrence = async () => {
    if (!deleteConfirmOccurrence || !onDeleteOccurrence) return;
    setIsDeletingOccurrence(true);
    try {
      await onDeleteOccurrence(deleteConfirmOccurrence.id);
      setDeleteConfirmOccurrence(null);
    } catch (err) {
      console.error('Failed to delete occurrence:', err);
    } finally {
      setIsDeletingOccurrence(false);
    }
  };

  const handleGenerate = async (id: number) => {
    setGeneratingForId(id);
    const count = generateCounts[id] || 4;
    try {
      await onGenerateOccurrences(id, count);
    } finally {
      setGeneratingForId(null);
    }
  };

  const handleSaveNote = async (occurrenceId: number) => {
    setIsSavingNote(true);
    try {
      await onUpdateOccurrenceNote(occurrenceId, noteText.trim());
      setEditingNoteOccurrenceId(null);
      setNoteText('');
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Recurring Tasks
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recurring Schedules</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your repeating schedules, generate custom occurrences, and delete schedules or specific dates anytime.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" />
          Create Recurring Task
        </button>
      </div>

      {/* Recurring Tasks List */}
      {recurringTasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 p-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No recurring tasks yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Create recurring schedules to track repeating routines and generate occurrences.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Create Recurring Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recurringTasks.map(rec => {
            const occurrences = rec.occurrences || [];
            const sortedOccurrences = [...occurrences].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
            const firstDate = sortedOccurrences[0]?.scheduled_date;
            const lastDate = sortedOccurrences[sortedOccurrences.length - 1]?.scheduled_date;
            const pendingOccurrences = occurrences.filter(o => o.status === 'PENDING');
            const completedOccurrences = occurrences.filter(o => o.status === 'COMPLETED');
            const selectedCount = generateCounts[rec.id] || 4;

            // Project how many days and till what date additional occurrences will be generated
            const baseDate = lastDate ? new Date(lastDate) : new Date();
            const projectedDate = new Date(baseDate);
            for (let i = 0; i < selectedCount; i++) {
              if (rec.frequency === 'DAILY') {
                projectedDate.setDate(projectedDate.getDate() + (rec.interval || 1));
              } else if (rec.frequency === 'WEEKLY') {
                projectedDate.setDate(projectedDate.getDate() + (rec.interval || 1) * 7);
              } else if (rec.frequency === 'MONTHLY') {
                projectedDate.setMonth(projectedDate.getMonth() + (rec.interval || 1));
              }
            }
            const projectedDateStr = projectedDate.toISOString().split('T')[0];
            const additionalDays = Math.max(1, Math.round((projectedDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)));

            return (
              <div key={rec.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-sm">
                {/* Recurring Task Header & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {rec.frequency === 'DAILY'
                          ? `Repeats Every ${rec.interval > 1 ? `${rec.interval} Days` : 'Day'}`
                          : rec.frequency === 'WEEKLY'
                          ? `Repeats Every ${rec.interval > 1 ? `${rec.interval} Weeks` : 'Week'}`
                          : `Repeats Every ${rec.interval > 1 ? `${rec.interval} Months` : 'Month'}`}
                      </span>

                      {lastDate ? (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Scheduled till: <strong className="font-semibold text-white">{lastDate}</strong></span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          No dates generated yet
                        </span>
                      )}

                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.priority}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{rec.title}</h3>
                    {rec.description && (
                      <p className="text-xs text-slate-400">{rec.description}</p>
                    )}
                  </div>

                  {/* Actions: Generate with Interval/Count, Edit Button, Delete Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    {/* Occurrences count selector and Generate button */}
                    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
                      <select
                        value={selectedCount}
                        onChange={(e) => setGenerateCounts(prev => ({ ...prev, [rec.id]: parseInt(e.target.value, 10) }))}
                        className="bg-transparent text-xs text-slate-200 px-2 py-1 font-medium focus:outline-none cursor-pointer"
                        title="Select number of occurrences to generate"
                      >
                        <option value={1} className="bg-slate-900 text-white">1 occurrence</option>
                        <option value={2} className="bg-slate-900 text-white">2 occurrences</option>
                        <option value={3} className="bg-slate-900 text-white">3 occurrences</option>
                        <option value={4} className="bg-slate-900 text-white">4 occurrences</option>
                        <option value={5} className="bg-slate-900 text-white">5 occurrences</option>
                        <option value={7} className="bg-slate-900 text-white">7 occurrences</option>
                        <option value={10} className="bg-slate-900 text-white">10 occurrences</option>
                        <option value={14} className="bg-slate-900 text-white">14 occurrences</option>
                        <option value={30} className="bg-slate-900 text-white">30 occurrences</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleGenerate(rec.id)}
                        disabled={generatingForId === rec.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
                        title="Generate selected number of occurrences"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${generatingForId === rec.id ? 'animate-spin' : ''}`} />
                        <span>Generate</span>
                      </button>
                    </div>

                    {/* Edit Option */}
                    <button
                      type="button"
                      onClick={() => openEditModal(rec)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                      title="Edit recurring task details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Option - prominent and accessible */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmTask({ id: rec.id, title: rec.title })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900/90 border border-rose-800/80 text-rose-300 hover:text-rose-100 text-xs font-semibold transition shadow-sm"
                      title="Delete this recurring task and all its occurrences"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Clear Generation & Schedule Timeline Info Banner */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-indigo-400 font-semibold">Generate Preview:</span>
                    <span>
                      Clicking <strong>Generate</strong> adds <strong>{selectedCount} dates</strong> extending schedule till <strong className="text-emerald-400 font-semibold">{projectedDateStr}</strong> (+{additionalDays} days forward).
                    </span>
                  </div>
                  {lastDate && (
                    <div className="text-slate-400 font-mono text-[11px] shrink-0">
                      Window: {firstDate} → {lastDate}
                    </div>
                  )}
                </div>

                {/* Occurrences Section */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[11px]">
                      <span>Scheduled Dates ({occurrences.length} total • {pendingOccurrences.length} pending)</span>
                      {lastDate && (
                        <span className="text-emerald-400 lowercase font-normal">
                          (scheduled through {lastDate})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {completedOccurrences.length} completed
                    </span>
                  </div>

                  {occurrences.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No occurrences scheduled yet. Select a count above and click "Generate" to schedule dates.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {occurrences.map(occ => {
                        const isDone = occ.status === 'COMPLETED';
                        const isEditingThisNote = editingNoteOccurrenceId === occ.id;

                        return (
                          <div
                            key={occ.id}
                            className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between space-y-3 transition ${
                              isDone
                                ? 'bg-slate-950/60 border-emerald-950/80 text-slate-300'
                                : 'bg-slate-800/70 border-slate-700/80 text-slate-200'
                            }`}
                          >
                            {/* Top row: Date, Status, and Delete button for this particular occurrence */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] flex items-center gap-1.5 text-slate-200 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                                {occ.scheduled_date}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                    isDone
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                                  }`}
                                >
                                  {occ.status}
                                </span>

                                {/* Delete option for this particular occurrence */}
                                {onDeleteOccurrence && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmOccurrence({ id: occ.id, date: occ.scheduled_date, title: rec.title })}
                                    className="p-1 rounded bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-transparent hover:border-rose-800 transition"
                                    title="Delete this particular occurrence date"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Comment / Note section */}
                            <div className="space-y-1.5 border-t border-slate-700/50 pt-2">
                              {isEditingThisNote ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    rows={2}
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add comment or update for this occurrence..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setEditingNoteOccurrenceId(null)}
                                      className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSavingNote}
                                      onClick={() => handleSaveNote(occ.id)}
                                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-semibold"
                                    >
                                      {isSavingNote ? 'Saving...' : 'Save Note'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    {occ.notes ? (
                                      <p className="text-[11px] text-amber-300/90 italic bg-amber-950/20 p-1.5 rounded border border-amber-900/30 truncate">
                                        "{occ.notes}"
                                      </p>
                                    ) : (
                                      <p className="text-[11px] text-slate-500 italic">No notes added</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNoteOccurrenceId(occ.id);
                                      setNoteText(occ.notes || '');
                                    }}
                                    className="text-slate-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 shrink-0 p-1 rounded bg-slate-800 hover:bg-slate-700"
                                    title="Add or update comment on this occurrence"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{occ.notes ? 'Edit' : 'Comment'}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Complete or Status & Delete */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/40">
                              {isDone ? (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                  <Check className="w-3 h-3" /> Completed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onCompleteOccurrence(occ.id)}
                                  className="py-1 px-2.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark Done</span>
                                </button>
                              )}

                              {onDeleteOccurrence && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmOccurrence({ id: occ.id, date: occ.scheduled_date, title: rec.title })}
                                  className="text-[11px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1 hover:underline ml-auto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal for Recurring Task */}
      {deleteConfirmTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Recurring Task</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirmTask.title}"</span>?
                </p>
                <p className="text-[11px] text-slate-400">
                  This will completely remove the recurring schedule and all its associated scheduled dates from your workspace.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTask(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Single Occurrence */}
      {deleteConfirmOccurrence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-slate-900 border border-rose-800/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Occurrence</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Delete occurrence on <span className="font-mono font-semibold text-white">{deleteConfirmOccurrence.date}</span> for <span className="font-semibold text-white">"{deleteConfirmOccurrence.title}"</span>?
                </p>
                <p className="text-[11px] text-slate-400">
                  This removes only this specific scheduled date. The main recurring schedule remains intact.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeletingOccurrence}
                onClick={() => setDeleteConfirmOccurrence(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOccurrence}
                onClick={handleConfirmDeleteOccurrence}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                {isDeletingOccurrence ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Occurrence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Recurring Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingTask ? 'Edit Recurring Task' : 'Create Recurring Task'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && (
                <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-xs text-red-300">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Team Sync, Monthly Server Backup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Add details, instructions or checklists..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Repeat Interval
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={interval}
                      onChange={(e) => setIntervalVal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <span className="text-xs text-slate-400">
                      {frequency === 'DAILY' ? 'day(s)' : frequency === 'WEEKLY' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {!editingTask && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Occurrences to Generate
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={generateCount}
                        onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      <span className="text-xs text-slate-400">scheduled dates</span>
                    </div>
                  </div>
                )}
              </div>

              {!editingTask && (() => {
                const modalProjectedDate = new Date();
                for (let i = 0; i < (generateCount || 1); i++) {
                  if (frequency === 'DAILY') {
                    modalProjectedDate.setDate(modalProjectedDate.getDate() + (interval || 1));
                  } else if (frequency === 'WEEKLY') {
                    modalProjectedDate.setDate(modalProjectedDate.getDate() + (interval || 1) * 7);
                  } else if (frequency === 'MONTHLY') {
                    modalProjectedDate.setMonth(modalProjectedDate.getMonth() + (interval || 1));
                  }
                }
                const modalTargetDate = modalProjectedDate.toISOString().split('T')[0];
                const modalSpanDays = Math.max(1, Math.round((modalProjectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                return (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 space-y-1">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Schedule Coverage Preview:</span>
                    </div>
                    <p className="text-[11px] text-cyan-200/90 leading-relaxed">
                      Will create <strong>{generateCount} dates</strong> repeating every <strong>{interval} {frequency === 'DAILY' ? 'day(s)' : frequency === 'WEEKLY' ? 'week(s)' : 'month(s)'}</strong>, covering from <strong>today</strong> till <strong className="text-white underline">{modalTargetDate}</strong> ({modalSpanDays} days span).
                    </p>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
                >
                  {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Recurring Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
