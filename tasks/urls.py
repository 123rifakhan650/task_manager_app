from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthRegisterView, AuthLoginView, AuthMeView,
    TaskViewSet, RecurringTaskViewSet, AuditLogListView,
    MetricsView, GeminiAiView, GeminiConfirmTaskView, GeminiAssistantView,
    CommentListCreateView, TaskOccurrenceListView, CompleteOccurrenceView,
    AnalyticsDashboardView, UsersListView, UserPermissionsView,
    SystemTestsView, DeploymentInfoView
)

router = DefaultRouter(trailing_slash=False)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'recurring', RecurringTaskViewSet, basename='recurring')
router.register(r'recurring-tasks', RecurringTaskViewSet, basename='recurring-tasks')

router_slash = DefaultRouter(trailing_slash=True)
router_slash.register(r'tasks', TaskViewSet, basename='task-slash')
router_slash.register(r'recurring', RecurringTaskViewSet, basename='recurring-slash')
router_slash.register(r'recurring-tasks', RecurringTaskViewSet, basename='recurring-tasks-slash')

urlpatterns = [
    # Authentication endpoints (both with and without trailing slash)
    re_path(r'^auth/register/?$', AuthRegisterView.as_view(), name='auth-register'),
    re_path(r'^auth/login/?$', AuthLoginView.as_view(), name='auth-login'),
    re_path(r'^auth/me/?$', AuthMeView.as_view(), name='auth-me'),

    # Standalone Comments & Occurrences endpoints
    re_path(r'^comments/?$', CommentListCreateView.as_view(), name='comments-list-create'),
    re_path(r'^occurrences/?$', TaskOccurrenceListView.as_view(), name='occurrences-list'),
    re_path(r'^occurrences/(?P<pk>\d+)/complete/?$', CompleteOccurrenceView.as_view(), name='occurrence-complete'),

    # Metrics, Analytics & Audit logs
    re_path(r'^audit-logs/?$', AuditLogListView.as_view(), name='audit-logs'),
    re_path(r'^metrics/?$', MetricsView.as_view(), name='metrics'),
    re_path(r'^analytics/dashboard/?$', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),

    # Users & Permissions
    re_path(r'^users/?$', UsersListView.as_view(), name='users-list'),
    re_path(r'^users/(?P<pk>\d+)/permissions/?$', UserPermissionsView.as_view(), name='user-permissions'),

    # Gemini AI Endpoints (Full Node.js Parity)
    re_path(r'^gemini/generate-task/?$', GeminiAiView.as_view(), name='gemini-generate-task'),
    re_path(r'^gemini/confirm-task/?$', GeminiConfirmTaskView.as_view(), name='gemini-confirm-task'),
    re_path(r'^gemini/assistant/?$', GeminiAssistantView.as_view(), name='gemini-assistant'),
    re_path(r'^ai/task-breakdown/?$', GeminiAiView.as_view(), name='ai-task-breakdown'),

    # System & Tests
    re_path(r'^system/run-backend-tests/?$', SystemTestsView.as_view(), name='system-tests'),
    re_path(r'^system/deployment-info/?$', DeploymentInfoView.as_view(), name='deployment-info'),

    # DRF Routers for Tasks & Recurring
    path('', include(router.urls)),
    path('', include(router_slash.urls)),
]
