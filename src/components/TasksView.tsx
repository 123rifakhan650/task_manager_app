import React, { useState } from 'react';
import {
  Search, Filter, Plus, Edit2, CheckCircle, CheckCircle2, RotateCcw,
  MessageSquare, Trash2, Tag, Calendar, Clock, Sparkles, Send, X
} from 'lucide-react';
import { Task, Priority, Status, Comment } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: { status: string; priority: string; category: string }) => void;
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
  onChangePriority: (taskId: number, newPriority: Priority) => Promise<void>;
  onChangeStatus: (taskId: number, newStatus: Status) => Promise<void>;
  onCompleteTask: (taskId: number) => Promise<void>;
  onReopenTask: (taskId: number) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddComment: (taskId: number, content: string) => Promise<void>;
  currentSearch: string;
  currentStatus: string;
  currentPriority: string;
  currentCategory: string;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSearchChange,
  onFilterChange,
  onOpenCreateModal,
  onEditTask,
  onChangePriority,
  onChangeStatus,
  onCompleteTask,
  onReopenTask,
  onDeleteTask,
  onAddComment,
  currentSearch,
  currentStatus,
  currentPriority,
  currentCategory,
}) => {
  const [activeCommentTaskId, setActiveCommentTaskId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  const handleCommentSubmit = async (taskId: number) => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await onAddComment(taskId, commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => onFilterChange({ status: e.target.value, priority: currentPriority, category: currentCategory })}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={currentPriority}
            onChange={(e) => onFilterChange({ status: currentStatus, priority: e.target.value, category: currentCategory })}
            className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Create Button */}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition ml-auto"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Status Segment Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Tasks', value: 'ALL' },
          { label: 'To Do', value: 'TODO' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Review', value: 'REVIEW' },
          { label: 'Completed Tasks', value: 'COMPLETED' },
        ].map(tab => {
          const isActive = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange({ status: tab.value, priority: currentPriority, category: currentCategory })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.value === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Task Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Completed: {tasks.filter(t => t.status === 'COMPLETED').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            In Progress: {tasks.filter(t => t.status === 'IN_PROGRESS').length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 p-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No tasks matched your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or create a new manual task to begin.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => {
            const isCompleted = task.status === 'COMPLETED';
            const isCommentsOpen = activeCommentTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`rounded-xl border bg-slate-900 transition-all p-5 shadow-sm ${
                  isCompleted
                    ? 'border-emerald-900/40 bg-slate-900/60'
                    : task.priority === 'URGENT'
                    ? 'border-rose-900/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Title, Description, Metadata */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Selector */}
                      <select
                        value={task.priority}
                        onChange={(e) => onChangePriority(task.id, e.target.value as Priority)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded font-mono border uppercase cursor-pointer transition ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : task.priority === 'MEDIUM'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                        title="Change priority"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>

                      {/* Status Selector */}
                      <select
                        value={task.status}
                        onChange={(e) => onChangeStatus(task.id, e.target.value as Status)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer transition ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : task.status === 'REVIEW'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                        title="Change status"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">In Review</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      {task.is_ai_generated && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-medium">
                          <Sparkles className="w-3 h-3" /> Gemini AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-base font-semibold text-white ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Completed {task.completed_at ? `on ${task.completed_at.slice(0, 10)}` : ''}</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks if present */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Checklist & Milestones:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {task.subtasks.map(st => (
                            <div key={st.id} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 px-2.5 py-1 rounded border border-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{st.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments or Pending Note if provided directly on task */}
                    {task.comments_text && (
                      <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg text-xs text-amber-200/90 flex items-start gap-2 max-w-2xl">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-amber-300 mr-1">Note:</span>
                          <span>{task.comments_text}</span>
                        </div>
                      </div>
                    )}

                    {/* Tags & Dates */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      {task.start_date && (
                        <div className="flex items-center gap-1 text-emerald-400/90">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Start: {task.start_date}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due: {task.due_date || 'No deadline'}</span>
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag className="w-3.5 h-3.5 text-slate-500" />
                          {task.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[11px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {isCompleted ? (
                      <button
                        onClick={() => onReopenTask(task.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-semibold transition"
                        title="Reopen task"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reopen Task
                      </button>
                    ) : (
                      <button
                        onClick={() => onCompleteTask(task.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition"
                        title="Complete task"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete Task
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition flex items-center gap-1"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentTaskId(isCommentsOpen ? null : task.id)}
                        className={`p-1.5 rounded text-xs transition flex items-center gap-1 ${
                          isCommentsOpen
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{task.comment_count || task.comments?.length || 0}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Drawer / Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/60 -mx-5 -mb-5 p-5 rounded-b-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        Comments & Discussion
                      </h4>
                      <button
                        onClick={() => setActiveCommentTaskId(null)}
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Existing Comments */}
                    {task.comments && task.comments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {task.comments.map(c => (
                          <div key={c.id} className="text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1">
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="font-semibold text-slate-200">@{c.username}</span>
                              <span>{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-300">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No comments yet. Post the first comment below.</p>
                    )}

                    {/* Add Comment Input Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment or status update..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(task.id);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(task.id)}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
