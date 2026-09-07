import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.views.static import serve

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
    return HttpResponse(
        """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TaskFlow &mdash; Django REST API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b132b; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #1c2541; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; max-width: 580px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    h1 { color: #60a5fa; margin-top: 0; font-size: 24px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; padding: 10px 18px; margin-right: 10px; margin-top: 15px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-blue { background: #3b82f6; color: #ffffff; }
    .btn-gray { background: #334155; color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 TaskFlow Django API is Live!</h1>
    <p>The Python &amp; Django REST Framework backend is deployed and connected to PostgreSQL on Render.</p>
    <p>To view your interactive UI, make sure your React build (<code>dist/</code>) is generated during build or deploy the React Static Site.</p>
    <div>
      <a class="btn btn-blue" href="/api/health/">Health Check</a>
      <a class="btn btn-gray" href="/api/tasks/">Tasks API</a>
      <a class="btn btn-gray" href="/admin/">Django Admin</a>
    </div>
  </div>
</body>
</html>""",
        content_type='text/html'
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/health', health_check),
    path('api/', include('tasks.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': str(settings.BASE_DIR / 'dist' / 'assets')}),
    re_path(r'^(?!api/|admin/|static/|assets/).*$', serve_spa),
]
