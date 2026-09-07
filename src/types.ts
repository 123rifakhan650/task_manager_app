export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type UserRole = 'admin' | 'manager' | 'auditor' | 'member';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_staff?: boolean;
  is_superuser?: boolean;
  can_view_audit_logs?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  user_id: number;
  username: string;
  title: string;
  start_date?: string;
  due_date: string;
  description: string;
  priority: Priority;
  status: Status;
  category: string;
  estimated_hours: number;
  actual_hours: number;
  tags: string[];
  is_ai_generated: boolean;
  ai_prompt?: string;
  subtasks?: Subtask[];
  comments?: Comment[];
  comments_text?: string;
  comment_count?: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface RecurringTask {
  id: number;
  user_id: number;
  title: string;
  description: string;
  frequency: RecurrenceFrequency;
  interval: number;
  days_of_week: string;
  priority: Priority;
  category: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  occurrences?: TaskOccurrence[];
}

export interface TaskOccurrence {
  id: number;
  recurring_task_id: number;
  recurring_task_title: string;
  scheduled_date: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completed_at: string | null;
  notes: string;
  created_at: string;
}

export interface Metric {
  id: number;
  user_id: number;
  name: string;
  value: number;
  unit: string;
  recorded_date: string;
  notes: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  review_tasks: number;
  completion_rate: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  priority_breakdown: Record<Priority, number>;
  status_breakdown: Record<Status, number>;
  category_breakdown: Record<string, number>;
  active_recurring: number;
  pending_occurrences: number;
  completed_occurrences: number;
  metrics_count: number;
  recent_activity: AuditLog[];
}

export interface GeminiTaskPreview {
  title: string;
  start_date?: string;
  due_date?: string;
  description: string;
  priority: Priority;
  category?: string;
  comments?: string;
  status?: Status;
  estimated_hours?: number;
  tags?: string[];
  subtasks?: Subtask[];
}

export interface AiTaskActionResponse {
  reply: string;
  action?: 'CREATE' | 'CREATE_RECURRING' | 'EDIT' | 'DELETE' | 'DELETE_RECURRING' | 'INFO';
  task?: Task;
  deletedId?: number;
  timestamp?: string;
  model?: string;
}

export interface BackendTestResult {
  name: string;
  category: string;
  passed: boolean;
  duration_ms: number;
  message: string;
}

export interface BackendTestSuiteResponse {
  status: 'PASSED' | 'FAILED';
  total_tests: number;
  passed: number;
  failed: number;
  duration_ms: number;
  results: BackendTestResult[];
  timestamp: string;
}

export interface DeploymentInfo {
  framework: string;
  port: number;
  container_port_compliance: boolean;
  docker: {
    dockerfile_present: boolean;
    docker_compose_present: boolean;
    multi_stage: boolean;
    services: string[];
  };
  render: {
    render_yaml_present: boolean;
    blueprint_version: string;
    build_command: string;
    start_command: string;
    health_check_path: string;
    region: string;
  };
  django: {
    manage_py_present: boolean;
    settings_present: boolean;
    models_present: boolean;
    serializers_present: boolean;
    views_present: boolean;
    tests_present: boolean;
    requirements_present: boolean;
  };
  environment_variables: {
    NODE_ENV: string;
    GEMINI_API_KEY_CONFIGURED: boolean;
    APP_URL: string;
  };
  acceptance_checklist_steps_covered: number;
}
