from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Task, Comment, RecurringTask, TaskOccurrence, AuditLog

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'can_view_audit_logs', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    can_view_audit_logs = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_staff', 'is_superuser', 'can_view_audit_logs', 'date_joined'
        ]

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'admin' if obj.is_superuser else 'member'

    def get_can_view_audit_logs(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.can_view_audit_logs
        return obj.is_superuser or obj.username.lower() == 'rifakhanum' or obj.email.lower() == 'rifakhanum14@gmail.com'


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'username', 'first_name', 'last_name', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    comments_text = serializers.CharField(write_only=True, required=False, allow_blank=True)
    priority = serializers.CharField(required=False, default='MEDIUM')
    recurring_task_id = serializers.PrimaryKeyRelatedField(
        source='recurring_task',
        queryset=RecurringTask.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'user', 'username', 'title', 'description', 'priority',
            'status', 'category', 'start_date', 'due_date', 'estimated_hours',
            'actual_hours', 'tags', 'subtasks', 'is_ai_generated',
            'completed_at', 'created_at', 'updated_at', 'comments', 'comment_count',
            'comments_text', 'recurring_task', 'recurring_task_id'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'completed_at', 'recurring_task']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'priority' in data and data['priority'] is not None:
            raw_p = str(data['priority']).strip().upper()
            if raw_p in ['LOW', 'MEDIUM', 'HIGH', 'URGENT']:
                data['priority'] = raw_p
            elif raw_p.capitalize() in ['Low', 'Medium', 'High', 'Urgent']:
                data['priority'] = raw_p.upper()
        return super().to_internal_value(data)

    def validate_priority(self, value):
        if not value:
            return 'MEDIUM'
        val = str(value).strip().upper()
        if val in ['LOW', 'MEDIUM', 'HIGH', 'URGENT']:
            return val
        raise serializers.ValidationError(f"Invalid priority '{value}'. Must be one of LOW, MEDIUM, HIGH, URGENT.")

    def get_comment_count(self, obj):
        return obj.comments.count()


class TaskOccurrenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskOccurrence
        fields = [
            'id', 'recurring_task', 'recurring_task_title',
            'scheduled_date', 'status', 'completed_at', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RecurringTaskSerializer(serializers.ModelSerializer):
    occurrences = TaskOccurrenceSerializer(many=True, read_only=True)
    priority = serializers.CharField(required=False, default='MEDIUM')
    start_date = serializers.DateField(required=False)

    class Meta:
        model = RecurringTask
        fields = [
            'id', 'user', 'title', 'description', 'frequency',
            'interval', 'days_of_week', 'priority', 'category',
            'start_date', 'end_date', 'is_active', 'created_at', 'occurrences'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'priority' in data and data['priority'] is not None:
            raw_p = str(data['priority']).strip().upper()
            if raw_p in ['LOW', 'MEDIUM', 'HIGH', 'URGENT']:
                data['priority'] = raw_p
            elif raw_p.capitalize() in ['Low', 'Medium', 'High', 'Urgent']:
                data['priority'] = raw_p.upper()
        return super().to_internal_value(data)

    def validate_priority(self, value):
        if not value:
            return 'MEDIUM'
        val = str(value).strip().upper()
        if val in ['LOW', 'MEDIUM', 'HIGH', 'URGENT']:
            return val
        raise serializers.ValidationError(f"Invalid priority '{value}'. Must be one of LOW, MEDIUM, HIGH, URGENT.")


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'username', 'action', 'resource_type',
            'resource_id', 'details', 'ip_address', 'timestamp'
        ]
        read_only_fields = fields
