from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthRegisterView, AuthLoginView, AuthMeView,
    TaskViewSet, RecurringTaskViewSet, AuditLogListView,
    MetricsView, GeminiAiView
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'recurring', RecurringTaskViewSet, basename='recurring')

urlpatterns = [
    path('auth/register/', AuthRegisterView.as_view(), name='auth-register'),
    path('auth/login/', AuthLoginView.as_view(), name='auth-login'),
    path('auth/me/', AuthMeView.as_view(), name='auth-me'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('metrics/', MetricsView.as_view(), name='metrics'),
    path('ai/task-breakdown/', GeminiAiView.as_view(), name='ai-task-breakdown'),
    path('', include(router.urls)),
]
