from django.contrib import admin
from .models import UserProfile, Task, Comment, RecurringTask, TaskOccurrence, AuditLog

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'can_view_audit_logs', 'created_at')
    list_filter = ('role', 'can_view_audit_logs')
    search_fields = ('user__username', 'user__email')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'priority', 'status', 'category', 'due_date', 'completed_at')
    list_filter = ('status', 'priority', 'category', 'is_ai_generated')
    search_fields = ('title', 'description', 'user__username')
    ordering = ('-created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'user', 'created_at')
    search_fields = ('content', 'user__username', 'task__title')


@admin.register(RecurringTask)
class RecurringTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'frequency', 'interval', 'is_active', 'start_date')
    list_filter = ('frequency', 'is_active')
    search_fields = ('title', 'user__username')


@admin.register(TaskOccurrence)
class TaskOccurrenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'recurring_task_title', 'scheduled_date', 'status', 'completed_at')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('recurring_task_title', 'notes')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'timestamp', 'username', 'action', 'resource_type', 'resource_id', 'ip_address')
    list_filter = ('action', 'resource_type')
    search_fields = ('username', 'details', 'resource_id')
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
