import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { RecurringView } from './components/RecurringView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { GeminiAiView } from './components/GeminiAiView';
import { AuditLogView } from './components/AuditLogView';
import { TaskModal } from './components/TaskModal';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { api, getStoredUser } from './api';
import {
  Task, RecurringTask, TaskOccurrence, Metric,
  DashboardStats, AuditLog, User, Priority, Status,
  GeminiTaskPreview
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);

  // Core domain state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Verify authentication on startup
  useEffect(() => {
    const verifyAuth = async () => {
      const token = api.getAuthToken ? api.getAuthToken() : localStorage.getItem('djangotask_token');
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        } catch {
          // Token invalid or session expired; try stored user
          const stored = api.getStoredUser ? api.getStoredUser() : null;
          if (stored) {
            try {
              const res = await api.login(stored.username || stored.email);
              setCurrentUser(res.user);
            } catch {
              api.logout();
              setCurrentUser(null);
            }
          } else {
            api.logout();
            setCurrentUser(null);
          }
        }
      } else {
        // No token in localStorage - attempt to restore active session or stored user
        const stored = api.getStoredUser ? api.getStoredUser() : null;
        if (stored) {
          try {
            const res = await api.login(stored.username || stored.email);
            setCurrentUser(res.user);
          } catch {
            const res = await api.login('sairabanu');
            setCurrentUser(res.user);
          }
        } else {
          try {
            // Auto login to active workspace session so saved/completed tasks are immediately visible
            const res = await api.login('sairabanu');
            setCurrentUser(res.user);
          } catch {
            // fallback
          }
        }
      }
      setIsInitializing(false);
    };
    verifyAuth();
  }, []);

  // Data fetching
  const refreshAllData = useCallback(async (userOverride?: User) => {
    const activeUser = userOverride || currentUser;
    if (!activeUser) return;
    try {
      const [
        tasksData,
        recurringData,
        occurrencesData,
        metricsData,
        statsData,
      ] = await Promise.all([
        api.getTasks({
          search: searchQuery,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
        }),
        api.getRecurring(),
        api.getOccurrences(),
        api.getMetrics(),
        api.getDashboardAnalytics(),
      ]);
      setTasks(tasksData);
      setRecurringTasks(recurringData);
      setOccurrences(occurrencesData);
      setMetrics(metricsData);
      setStats(statsData);

      try {
        const auditData = await api.getAuditLogs();
        setAuditLogs(auditData);
      } catch (auditErr) {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [currentUser, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    if (currentUser) {
      refreshAllData(currentUser);
    }
  }, [currentUser, refreshAllData]);

  // Task Actions
  const handleCreateOrUpdateTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
      showToast('Task updated successfully');
    } else {
      await api.createTask(taskData);
      showToast('Task created successfully');
    }
    setEditingTask(null);
    await refreshAllData();
  };

  const handleChangePriority = async (taskId: number, newPriority: Priority) => {
    await api.changePriority(taskId, newPriority);
    showToast(`Priority updated to ${newPriority}`);
    await refreshAllData();
  };

  const handleChangeStatus = async (taskId: number, newStatus: Status) => {
    await api.changeStatus(taskId, newStatus);
    showToast(`Status updated to ${newStatus}`);
    await refreshAllData();
  };

  const handleCompleteTask = async (taskId: number) => {
    await api.completeTask(taskId);
    showToast('Task marked completed');
    await refreshAllData();
  };

  const handleReopenTask = async (taskId: number) => {
    await api.reopenTask(taskId);
    showToast('Task reopened into In Progress');
    await refreshAllData();
  };

  const handleDeleteTask = async (taskId: number) => {
    // Optimistic deletion
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await api.deleteTask(taskId);
    showToast('Task deleted successfully');
    await refreshAllData();
  };

  const handleAddComment = async (taskId: number, content: string) => {
    await api.addComment(taskId, content);
    showToast('Comment added successfully');
    await refreshAllData();
  };

  // Recurring Tasks Actions
  const handleCreateRecurring = async (payload: any) => {
    await api.createRecurring(payload);
    showToast('Recurring task created successfully');
    await refreshAllData();
  };

  const handleUpdateRecurring = async (id: number, payload: any) => {
    await api.updateRecurring(id, payload);
    showToast('Recurring task updated successfully');
    await refreshAllData();
  };

  const handleDeleteRecurring = async (id: number) => {
    // Immediately remove from UI and calendar
    setRecurringTasks(prev => prev.filter(r => r.id !== id));
    setOccurrences(prev => prev.filter(o => o.recurring_task_id !== id));
    await api.deleteRecurring(id);
    showToast('Recurring task deleted successfully');
    await refreshAllData();
  };

  const handleGenerateOccurrences = async (recurringId: number, count: number) => {
    await api.generateOccurrences(recurringId, count);
    showToast('Occurrences generated successfully');
    await refreshAllData();
  };

  const handleCompleteOccurrence = async (occurrenceId: number) => {
    setOccurrences(prev => prev.map(o => o.id === occurrenceId ? { ...o, status: 'COMPLETED' } : o));
    await api.completeOccurrence(occurrenceId);
    showToast('Occurrence marked completed');
    await refreshAllData();
  };

  const handleDeleteOccurrence = async (occurrenceId: number) => {
    // Immediately remove from UI and calendar
    setOccurrences(prev => prev.filter(o => o.id !== occurrenceId));
    setRecurringTasks(prev => prev.map(r => ({
      ...r,
      occurrences: (r.occurrences || []).filter(o => o.id !== occurrenceId),
    })));
    await api.deleteOccurrence(occurrenceId);
    showToast('Occurrence deleted successfully');
    await refreshAllData();
  };

  const handleUpdateOccurrenceNote = async (occurrenceId: number, note: string) => {
    await api.updateOccurrenceNote(occurrenceId, note);
    showToast('Note updated successfully');
    await refreshAllData();
  };

  // Gemini AI Actions
  const handleGenerateAiTask = async (prompt: string, category: string, priority: Priority): Promise<GeminiTaskPreview> => {
    const res = await api.generateAiTask(prompt, category, priority);
    if (res.model && res.model.toLowerCase().includes('gemini')) {
      showToast('Task plan synthesized with Gemini AI', 'info');
    } else {
      showToast('Task plan generated from prompt', 'info');
    }
    return res.preview;
  };

  const handleConfirmAiTask = async (preview: GeminiTaskPreview, originalPrompt: string) => {
    await api.confirmAiTask({
      title: preview.title,
      description: preview.description,
      start_date: preview.start_date,
      due_date: preview.due_date,
      priority: preview.priority,
      category: preview.category,
      comments: preview.comments,
      ai_prompt: originalPrompt,
    });
    showToast(`Task "${preview.title}" added to your tracker!`);
    await refreshAllData();
  };

  const handleAskAssistant = async (message: string): Promise<string> => {
    const res = await api.askAiAssistant(message);
    if (res.action === 'CREATE' || res.action === 'EDIT' || res.action === 'DELETE' || res.action === 'CREATE_RECURRING' || res.action === 'DELETE_RECURRING') {
      await refreshAllData();
    }
    return res.reply;
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Authenticated as ${user.username} (${user.email})`);
    refreshAllData(user);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setTasks([]);
    setRecurringTasks([]);
    setOccurrences([]);
    setMetrics([]);
    setStats(null);
    showToast('Signed out of session', 'info');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
              toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : toast.type === 'info'
                ? 'bg-indigo-950 text-indigo-200 border-indigo-800'
                : 'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{toast.message}</span>
          </div>
        )}
        <AuthGateway onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : toast.type === 'info'
              ? 'bg-indigo-950 text-indigo-200 border-indigo-800'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
        onOpenLogin={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
        onOpenRegister={() => { setAuthModalMode('register'); setIsAuthModalOpen(true); }}
        onLogout={handleLogout}
        taskCount={tasks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            tasks={tasks}
            currentUser={currentUser}
            onNavigate={setActiveTab}
            onOpenNewTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            onOpenAiTask={() => setActiveTab('gemini')}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onSearchChange={setSearchQuery}
            onFilterChange={({ status, priority, category }) => {
              setStatusFilter(status);
              setPriorityFilter(priority);
              setCategoryFilter(category);
            }}
            onOpenCreateModal={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            onEditTask={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
            onChangePriority={handleChangePriority}
            onChangeStatus={handleChangeStatus}
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            onDeleteTask={handleDeleteTask}
            onAddComment={handleAddComment}
            currentSearch={searchQuery}
            currentStatus={statusFilter}
            currentPriority={priorityFilter}
            currentCategory={categoryFilter}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringView
            recurringTasks={recurringTasks}
            onCreateRecurring={handleCreateRecurring}
            onUpdateRecurring={handleUpdateRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onDeleteOccurrence={handleDeleteOccurrence}
            onGenerateOccurrences={handleGenerateOccurrences}
            onCompleteOccurrence={handleCompleteOccurrence}
            onUpdateOccurrenceNote={handleUpdateOccurrenceNote}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            occurrences={occurrences}
            onSelectTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            tasks={tasks}
          />
        )}

        {activeTab === 'gemini' && (
          <GeminiAiView
            tasks={tasks}
            onDeleteTask={handleDeleteTask}
            onGenerateTask={handleGenerateAiTask}
            onConfirmTask={handleConfirmAiTask}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView
            auditLogs={auditLogs}
            currentUser={currentUser}
            onUserUpdated={(updated) => {
              setCurrentUser(updated);
              refreshAllData();
            }}
            onRefreshLogs={async () => {
              try {
                const logs = await api.getAuditLogs();
                setAuditLogs(logs);
              } catch (e) {
                setAuditLogs([]);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-400">
        TaskFlow Task Manager • Created by <span className="text-emerald-400 font-semibold">Rifa Khanum</span>
      </footer>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
