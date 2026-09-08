from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthRegisterView, AuthLoginView, AuthMeView,
    TaskViewSet, RecurringTaskViewSet, AuditLogListView,
    MetricsView, GeminiAiView, CommentListCreateView,
    TaskOccurrenceListView, CompleteOccurrenceView
)

router = DefaultRouter(trailing_slash=False)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'recurring', RecurringTaskViewSet, basename='recurring')

router_slash = DefaultRouter(trailing_slash=True)
router_slash.register(r'tasks', TaskViewSet, basename='task-slash')
router_slash.register(r'recurring', RecurringTaskViewSet, basename='recurring-slash')

urlpatterns = [
    # Authentication endpoints (both with and without trailing slash)
    re_path(r'^auth/register/?$', AuthRegisterView.as_view(), name='auth-register'),
    re_path(r'^auth/login/?$', AuthLoginView.as_view(), name='auth-login'),
    re_path(r'^auth/me/?$', AuthMeView.as_view(), name='auth-me'),

    # Standalone Comments & Occurrences endpoints
    re_path(r'^comments/?$', CommentListCreateView.as_view(), name='comments-list-create'),
    re_path(r'^occurrences/?$', TaskOccurrenceListView.as_view(), name='occurrences-list'),
    re_path(r'^occurrences/(?P<pk>\d+)/complete/?$', CompleteOccurrenceView.as_view(), name='occurrence-complete'),

    # Metrics, Audit logs, and AI Assistant
    re_path(r'^audit-logs/?$', AuditLogListView.as_view(), name='audit-logs'),
    re_path(r'^metrics/?$', MetricsView.as_view(), name='metrics'),
    re_path(r'^ai/task-breakdown/?$', GeminiAiView.as_view(), name='ai-task-breakdown'),

    # DRF Routers for Tasks & Recurring
    path('', include(router.urls)),
    path('', include(router_slash.urls)),
]
