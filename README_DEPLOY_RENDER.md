# TaskFlow — Django REST Framework & Render Deployment Guide

This project contains a full **Python / Django 5 + Django REST Framework** backend alongside the modern **React 19 / Tailwind CSS** frontend.

---

## 📁 Django Project Structure

```text
├── manage.py                   # Django CLI management entry point
├── requirements.txt            # Python dependencies (Django, DRF, SimpleJWT, Gunicorn, psycopg2)
├── build.sh                    # Automated Render build script (pip, collectstatic, migrate)
├── Procfile                    # Render/Gunicorn process entry point
├── render.yaml                 # Infrastructure as Code: Django Service + Free PostgreSQL
│
├── taskmanager/                # Django Core Project
│   ├── __init__.py
│   ├── settings.py             # Configured with DRF, CORS, WhiteNoise, PostgreSQL & SimpleJWT
│   ├── urls.py                 # Root URL routing (/admin/, /api/, and React SPA fallback)
│   ├── wsgi.py                 # WSGI application for Gunicorn
│   └── asgi.py                 # ASGI application
│
└── tasks/                      # Core Tasks & Authentication App
    ├── __init__.py
    ├── apps.py                 # App configuration
    ├── models.py               # Task, RecurringTask, TaskOccurrence, Comment, AuditLog, UserProfile
    ├── serializers.py          # Django REST Framework ModelSerializers
    ├── views.py                # ViewSets & API Views (Tasks, Recurring, Auth, Metrics, AI)
    ├── urls.py                 # API endpoints (/api/tasks/, /api/auth/, /api/recurring/, etc.)
    ├── admin.py                # Django Admin with filters and read-only audit protections
    ├── tests.py                # Unit & API test suite
    └── migrations/             # Database migrations
        ├── __init__.py
        └── 0001_initial.py
```

---

## 🚀 Deploying Django to Render (Step-by-Step)

### Option 1: Automatic 1-Click Blueprint (Recommended)

1. Push this repository to your **GitHub** or **GitLab** account.
2. Go to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select your repository.
5. Render reads `render.yaml` and will automatically provision:
   - **PostgreSQL Database**: Free managed PostgreSQL (`taskflow-db`).
   - **Django Web Service**: Running Python 3.10 with Gunicorn, auto-running `./build.sh` on every deploy.
6. Click **Apply**.

---

### Option 2: Manual Web Service Setup on Render

If you prefer to configure manually without Blueprint:

#### 1. Create a Free PostgreSQL Database on Render
1. Click **New +** → **PostgreSQL**.
2. Name: `taskflow-db`, Database: `taskflow`, User: `taskflow_user`.
3. Select the **Free** tier and click **Create Database**.
4. Copy the **Internal Database URL**.

#### 2. Create the Python Web Service
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `taskflow-api`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     chmod +x build.sh && ./build.sh
     ```
   - **Start Command**:
     ```bash
     gunicorn taskmanager.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Plan**: `Free`

4. Add **Environment Variables**:
   - `PYTHON_VERSION` = `3.10.12`
   - `DEBUG` = `False`
   - `SECRET_KEY` = *(generate any random 50-char string or click generate)*
   - `DATABASE_URL` = *(paste the Internal Database URL from Step 1)*
   - `GEMINI_API_KEY` = *(optional, your Google Gemini API key)*

5. Click **Create Web Service**.

---

## 🧪 Local Django Testing (Optional)

If running locally on your own machine:
```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
python manage.py migrate

# 4. Run tests
python manage.py test

# 5. Start development server
python manage.py runserver 8000
```
