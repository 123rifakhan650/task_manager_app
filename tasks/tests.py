from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import UserProfile, Task, RecurringTask, AuditLog

class TaskFlowCoreTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, role='member')

    def test_task_creation_and_defaults(self):
        task = Task.objects.create(
            user=self.user,
            title='Test Task',
            priority='HIGH',
            status='TODO'
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.priority, 'HIGH')
        self.assertEqual(task.status, 'TODO')
        self.assertIsNone(task.completed_at)

    def test_task_completion_lifecycle(self):
        task = Task.objects.create(user=self.user, title='Completable Task')
        task.mark_completed()
        self.assertEqual(task.status, 'COMPLETED')
        self.assertIsNotNone(task.completed_at)
        
        task.reopen()
        self.assertEqual(task.status, 'TODO')
        self.assertIsNone(task.completed_at)

    def test_recurring_task_occurrence_generation(self):
        from datetime import date
        recurring = RecurringTask.objects.create(
            user=self.user,
            title='Daily Standup',
            frequency='DAILY',
            start_date=date.today()
        )
        occurrences = recurring.generate_occurrences(count=3)
        self.assertEqual(len(occurrences), 3)
        self.assertEqual(occurrences[0].status, 'PENDING')


class TaskFlowAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='apiuser', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_task_list_api(self):
        Task.objects.create(user=self.user, title='API Task 1')
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_check_api(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['status'], 'healthy')
