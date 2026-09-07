import {
  Task, RecurringTask, TaskOccurrence, Metric, Comment,
  AuditLog, DashboardStats, GeminiTaskPreview, AiTaskActionResponse,
  BackendTestSuiteResponse, DeploymentInfo, User
} from './types';

let currentToken: string | null = localStorage.getItem('djangotask_token');

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (token) {
    localStorage.setItem('djangotask_token', token);
  } else {
    localStorage.removeItem('djangotask_token');
  }
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('djangotask_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem('djangotask_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('djangotask_user');
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errMessage = `Request failed: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errMessage = data.error;
      else if (data.message) errMessage = data.message;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }
  return response.json();
}

export const api = {
  // Auth
  register: async (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => {
    const res = await request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },
  login: async (payload: string | { username: string; password?: string }) => {
    const body = typeof payload === 'string'
      ? { username: payload, password: 'password123' }
      : { username: payload.username, password: payload.password || 'password123' };
    const res = await request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },
  getCurrentUser: () => request<User>('/api/auth/me'),
  getAuthToken: () => getAuthToken(),
  getStoredUser: () => getStoredUser(),
  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },
  setToken: (token: string | null) => {
    setAuthToken(token);
  },

  // Tasks
  getTasks: (params?: { search?: string; status?: string; priority?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.priority && params.priority !== 'ALL') q.set('priority', params.priority);
    if (params?.category && params.category !== 'ALL') q.set('category', params.category);
    return request<Task[]>(`/api/tasks?${q.toString()}`);
  },
  getTaskById: (id: number) => request<Task>(`/api/tasks/${id}`),
  createTask: (payload: Partial<Task>) =>
    request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTask: (id: number, payload: Partial<Task>) =>
    request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  changePriority: (id: number, priority: string) =>
    request<Task>(`/api/tasks/${id}/change-priority`, {
      method: 'POST',
      body: JSON.stringify({ priority }),
    }),
  changeStatus: (id: number, status: string) =>
    request<Task>(`/api/tasks/${id}/change-status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  completeTask: (id: number) =>
    request<Task>(`/api/tasks/${id}/complete`, {
      method: 'POST',
    }),
  reopenTask: (id: number) =>
    request<Task>(`/api/tasks/${id}/reopen`, {
      method: 'POST',
    }),
  deleteTask: (id: number) =>
    request<{ message: string; id: number }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (taskId?: number) =>
    request<Comment[]>(`/api/comments${taskId ? `?task_id=${taskId}` : ''}`),
  addComment: (taskId: number, content: string) =>
    request<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, content }),
    }),

  // Recurring & Occurrences
  getRecurring: () => request<RecurringTask[]>('/api/recurring'),
  createRecurring: (payload: Partial<RecurringTask>) =>
    request<RecurringTask>('/api/recurring', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRecurring: (id: number, payload: Partial<RecurringTask>) =>
    request<RecurringTask>(`/api/recurring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteRecurring: (id: number) =>
    request<{ message: string; deleted_id: number }>(`/api/recurring/${id}`, {
      method: 'DELETE',
    }),
  generateOccurrences: (recurringId: number, count = 4) =>
    request<{ message: string; created_count: number; occurrences: TaskOccurrence[] }>(
      `/api/recurring/${recurringId}/generate-occurrences`,
      {
        method: 'POST',
        body: JSON.stringify({ count }),
      }
    ),
  getOccurrences: (recurringId?: number) =>
    request<TaskOccurrence[]>(`/api/occurrences${recurringId ? `?recurring_task_id=${recurringId}` : ''}`),
  completeOccurrence: (occurrenceId: number) =>
    request<TaskOccurrence>(`/api/occurrences/${occurrenceId}/complete`, {
      method: 'POST',
    }),
  deleteOccurrence: (occurrenceId: number) =>
    request<{ message: string; deleted_id: number }>(`/api/occurrences/${occurrenceId}`, {
      method: 'DELETE',
    }),
  updateOccurrenceNote: (occurrenceId: number, notes: string) =>
    request<TaskOccurrence>(`/api/occurrences/${occurrenceId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  // Metrics
  getMetrics: () => request<Metric[]>('/api/metrics'),
  addMetric: (payload: { name: string; value: number; unit?: string; recorded_date?: string; notes?: string }) =>
    request<Metric>('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Audit Logs & Permissions
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),
  toggleAuditPermission: () =>
    request<{ message: string; can_view_audit_logs: boolean; user: User }>('/api/auth/toggle-audit-permission', {
      method: 'POST',
    }),
  getUsers: () =>
    request<Array<{ id: number; username: string; email: string; role: string; can_view_audit_logs: boolean; is_staff: boolean }>>('/api/users'),
  updateUserPermissions: (userId: number, payload: { role?: string; can_view_audit_logs?: boolean }) =>
    request<User>(`/api/users/${userId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Analytics
  getDashboardAnalytics: () => request<DashboardStats>('/api/analytics/dashboard'),

  // Gemini AI
  generateAiTask: (prompt: string, category?: string, priority?: string) =>
    request<{ preview: GeminiTaskPreview; model: string; prompt: string }>('/api/gemini/generate-task', {
      method: 'POST',
      body: JSON.stringify({ prompt, category, priority }),
    }),
  confirmAiTask: (payload: Omit<Partial<Task>, 'comments'> & { ai_prompt?: string; comments?: string | Comment[] }) =>
    request<{ message: string; task: Task }>('/api/gemini/confirm-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  askAiAssistant: (message: string) =>
    request<AiTaskActionResponse>('/api/gemini/assistant', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // System & Acceptance
  runBackendTests: () => request<BackendTestSuiteResponse>('/api/system/run-backend-tests'),
  getDeploymentInfo: () => request<DeploymentInfo>('/api/system/deployment-info'),
};
