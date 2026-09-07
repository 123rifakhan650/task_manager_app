import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from django.conf import settings

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'framework': 'Django 5 & Django REST Framework',
        'database': 'Connected',
    })

def serve_spa(request):
    dist_index = settings.BASE_DIR / 'dist' / 'index.html'
    if dist_index.exists():
        with open(dist_index, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return JsonResponse({
        'message': 'TaskFlow Django REST API is running. Access /api/ for REST endpoints.'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/health', health_check),
    path('api/', include('tasks.urls')),
    re_path(r'^(?!api/|admin/|static/).*$', serve_spa),
]
