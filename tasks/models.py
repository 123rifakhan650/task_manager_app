from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('member', 'Team Member'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    can_view_audit_logs = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('REVIEW', 'Review'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    category = models.CharField(max_length=100, default='General')
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    estimated_hours = models.FloatField(default=1.0)
    actual_hours = models.FloatField(default=0.0)
    tags = models.JSONField(default=list, blank=True)
    subtasks = models.JSONField(default=list, blank=True)
    is_ai_generated = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def mark_completed(self):
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        self.save()

    def reopen(self):
        self.status = 'TODO'
        self.completed_at = None
        self.save()

    def __str__(self):
        return f"[{self.priority}] {self.title} ({self.status})"


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on Task {self.task_id}"


class RecurringTask(models.Model):
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='DAILY')
    interval = models.PositiveIntegerField(default=1)
    days_of_week = models.CharField(max_length=100, blank=True, default='')
    priority = models.CharField(max_length=20, choices=Task.PRIORITY_CHOICES, default='MEDIUM')
    category = models.CharField(max_length=100, default='Routine')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_occurrences(self, count=5):
        """Generates the next upcoming occurrences."""
        curr_date = self.start_date
        created = []
        for i in range(count):
            if self.frequency == 'DAILY':
                curr_date = curr_date + timedelta(days=self.interval)
            elif self.frequency == 'WEEKLY':
                curr_date = curr_date + timedelta(weeks=self.interval)
            elif self.frequency == 'MONTHLY':
                curr_date = curr_date + timedelta(days=30 * self.interval)
            
            if self.end_date and curr_date > self.end_date:
                break

            occ, _ = TaskOccurrence.objects.get_or_create(
                recurring_task=self,
                scheduled_date=curr_date,
                defaults={
                    'recurring_task_title': self.title,
                    'status': 'PENDING',
                    'notes': f"Generated occurrence {i+1}",
                }
            )
            created.append(occ)
        return created

    def __str__(self):
        return f"Recurring: {self.title} ({self.frequency})"


class TaskOccurrence(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('SKIPPED', 'Skipped'),
    ]

    recurring_task = models.ForeignKey(RecurringTask, on_delete=models.CASCADE, related_name='occurrences')
    recurring_task_title = models.CharField(max_length=255, blank=True)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_date']

    def complete(self, notes=""):
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        if notes:
            self.notes = notes
        self.save()

    def __str__(self):
        return f"Occurrence for {self.recurring_task.title} on {self.scheduled_date}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, default='system')
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100, blank=True, default='')
    details = models.TextField(blank=True, default='')
    ip_address = models.CharField(max_length=50, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.username} -> {self.action} on {self.resource_type}"
