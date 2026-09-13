# TaskFlow — Enterprise AI Task & Schedule Orchestration Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15%2B-red?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)

> **A mission-critical full-stack task orchestration platform built with Python/Django, Django REST Framework, PostgreSQL, and React 19.** Designed to solve real-world productivity bottlenecks with an **Eisenhower 2×2 Priority Matrix**, an automated **recurring task engine** with occurrence management, **granular Role-Based Access Control (RBAC)**, an immutable **audit trail**, and an integrated **Google Gemini AI Assistant**.

---

## 🌟 Recruiter & Engineering Highlights

| Key Differentiator | Architectural Implementation |
| :--- | :--- |
| **Production-Ready Full-Stack Architecture** | Fully decoupled **Django REST Framework** backend exposing clean, stateless REST APIs coupled with a responsive, zero-latency **React 19 / TypeScript** Single Page Application. |
| **Eisenhower 2×2 Priority Matrix** | High-performance decision-making framework dynamically mapping tasks across *Urgent & Critical (Q1)*, *Strategic Planning (Q2)*, *Operational Delegation (Q3)*, and *Backlog (Q4)* with real-time severity metrics and workload balance analytics. |
| **Recurring Task Engine & Occurrence Lifecycle** | Robust cron-style recurrence engine supporting Daily, Weekly, and Monthly cadences. Each occurrence has independent scheduling, status lifecycle (`PENDING` / `COMPLETED`), custom dates, and audit notes. |
| **Enterprise Security & Audit Compliance** | Strict **Role-Based Access Control (RBAC)** separating `Admin`, `Manager`, `Auditor`, and `Member` privileges, complemented by a write-only **Audit Ledger** recording all task modifications, user logins, and administrative overrides with client IP stamping. |
| **Context-Aware Gemini AI Integration** | Natural language task command parser capable of understanding intent, extracting priority/due dates, executing batch scheduling, and synthesizing complex workflows into structured database entries. |
| **Cloud-Native Deployment on Render** | Fully automated **Infrastructure as Code (`render.yaml`)** provisioning managed PostgreSQL and a gunicorn-powered Python web service with zero-downtime database migrations and automated static bundling. |

---

## 🏗️ System Architecture

```text
                                  +-----------------------------+
                                  |       Web / Mobile Client   |
                                  |  (React 19 + TypeScript)    |
                                  +--------------+--------------+
                                                 |
                                     HTTPS / JSON REST APIs
                                                 |
                                                 v
+-----------------------------------------------------------------------------------------------+
|                               Render Cloud Platform                                           |
|                                                                                               |
|   +---------------------------------------------------------------------------------------+   |
|   |                        Django Web Service (Gunicorn + WhiteNoise)                    |   |
|   |                                                                                       |   |
|   |   +-------------------+  +-------------------+  +---------------------------------+   |   |
|   |   |   Auth & RBAC     |  |   Task ViewSets   |  |   Recurring & Occurrence Engine |   |   |   |
|   |   |  (Session / JWT)  |  |  (CRUD, Filtering)|  |   (Frequency, Intervals, Notes) |   |   |   |
|   |   +---------+---------+  +---------+---------+  +----------------+----------------+   |   |
|   |             |                      |                             |                    |   |
|   |             v                      v                             v                    |   |
|   |   +-------------------------------------------------------------------------------+   |   |
|   |   |                    Django ORM & ModelSerializers                              |   |   |
|   |   |   - Task              - RecurringTask        - TaskOccurrence                 |   |   |
|   |   |   - AuditLog          - UserProfile (RBAC)   - Comment / Metrics              |   |   |
|   |   +---------------------------------------+---------------------------------------+   |   |
|   +-------------------------------------------|-------------------------------------------+   |
|                                               |                                               |
|                                               v                                               |
|   +---------------------------------------------------------------------------------------+   |
|   |                         Managed PostgreSQL Database                                   |   |
|   |                          (Relational Persistence)                                     |   |
|   +---------------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------------+
                                                |
                                                v
                                  +-----------------------------+
                                  |    Google Gemini 2.5 AI     |
                                  | (NLP Task Intent Parsing)   |
                                  +-----------------------------+
```

---

## 📊 Core Features & Capabilities

### 1. 🎯 Dynamic Eisenhower Priority Matrix & Analytics
- **Live Real-Time Reactivity**: Unlike static dashboards, the matrix derives status and counts directly from live task state, instantly updating whenever tasks are edited, reprioritized, or completed.
- **Quadrant Mapping**:
  - **Q1: Urgent & Critical**: Do First (Immediate blockers, critical bugs, production deadlines).
  - **Q2: High Priority**: Schedule & Plan (Strategic features, architecture, milestone goals).
  - **Q3: Medium Priority**: Standard Flow (Routine sprints, operational tasks).
  - **Q4: Low Priority**: Backlog & Minor (Non-urgent polish, backlog housekeeping).
- **Workload Balance & Risk Scoring**: Automated algorithm calculates critical load ratio (Urgent + High %) and advises when team workload is over-concentrated in crisis mode.
- **Interactive Quadrant Inspection**: Users can click any quadrant to filter, preview task titles, status badges, and launch edit modals directly.

### 2. 🔁 Advanced Recurring Task Engine
- **Flexible Cadence Options**: Configure recurrence on Daily, Weekly, or Monthly intervals with custom days-of-week selection (`Mon,Wed,Fri`).
- **Granular Occurrence Tracking**: Generate up to 12 scheduled occurrences into the future.
- **Individual Occurrence Modals & Comments**: Complete an occurrence independently, delete a specific occurrence without breaking the parent schedule, or append dated occurrence notes.

### 3. 🛡️ Role-Based Access Control (RBAC) & Audit Ledger
- **Role Hierarchy**:
  - `Admin`: Full system authority, user role promotion, system tests, and access to the confidential audit feed.
  - `Manager`: Team-wide task assignment, metrics review, and recurring schedule administration.
  - `Auditor`: Read-only compliance access to system logs, historical metrics, and activity trails.
  - `Member`: Personal task management and collaborative comment contribution.
- **Tamper-Resistant Audit Log**: All state transitions (`CREATE`, `UPDATE`, `DELETE`, `PRIORITY_CHANGE`, `OCCURRENCE_NOTE`) are written to an append-only ledger capturing actor, target, timestamp, and IP address.

### 4. 🤖 AI-Powered Productivity with Google Gemini
- **Natural Language Command Processing**: Commands like *"create urgent presentation task due tomorrow"* or *"edit task to low priority"* are parsed and executed automatically.
- **Structured Schema Enforcement**: Validates user intent against strict system constraints, defaulting reasonable priorities, time estimates, and tags.

---

## 🚀 How to Run & Deploy the App on Render

The repository is pre-configured with **Infrastructure as Code (`render.yaml`)**, an automated build script (`build.sh`), and production WSGI settings for zero-friction deployment on [Render](https://render.com/).

### Method 1: Automated 1-Click Blueprint (Recommended)

1. **Fork or Push** this repository to your GitHub or GitLab account.
2. Sign in to your **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** → **Blueprint**.
4. Connect your repository.
5. Render reads `render.yaml` and will automatically configure:
   - **PostgreSQL Database** (`taskflow-db`): Free managed relational database.
   - **Django Web Service** (`taskflow-django-api`): Python 3.10 environment with Gunicorn.
   - **Environment Variables**: Automatic linking of `DATABASE_URL`, generation of `SECRET_KEY`, and setting of `PYTHON_VERSION`.
6. Click **Apply**. Render will automatically run `./build.sh` and launch your application.

---

### Method 2: Manual Web Service & Database Setup on Render

If you prefer configuring individual services via the Render web dashboard:

#### Step 1: Provision Managed PostgreSQL
1. On Render, click **New +** → **PostgreSQL**.
2. Set the following:
   - **Name**: `taskflow-db`
   - **Database**: `taskflow`
   - **User**: `taskflow_user`
   - **Region**: Choose the region closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Plan**: `Free`
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g., `postgres://taskflow_user:password@dpg-xxxx:5432/taskflow`).

#### Step 2: Create the Django Web Service
1. Click **New +** → **Web Service** and select your GitHub repository.
2. Set configuration fields:
   - **Name**: `taskflow-api`
   - **Runtime**: `Python 3`
   - **Region**: Same region as your database
   - **Branch**: `main` (or `master`)
   - **Build Command**:
     ```bash
     chmod +x build.sh && ./build.sh
     ```
   - **Start Command**:
     ```bash
     python manage.py migrate --no-input && gunicorn taskmanager.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Plan**: `Free`

3. Add **Environment Variables** under the Environment tab:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.10.12` | Python version for Render runtime |
   | `DEBUG` | `False` | Disables debug mode for production security |
   | `SECRET_KEY` | *(Click "Generate" or enter 50+ chars)* | Cryptographic signing key for Django |
   | `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | PostgreSQL connection string |
   | `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Allowed hosts for Django |
   | `GEMINI_API_KEY` | *(Your Google Gemini API key, optional)* | Enables AI conversational assistant features |

4. Click **Create Web Service**.

---

## ⚙️ How the Render Build Script Works (`build.sh`)

When deploying on Render, the automated `./build.sh` script executes the entire build lifecycle seamlessly:

```bash
#!/usr/bin/env bash
set -o errexit

# 1. Upgrade pip and install all Python production dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 2. Build the React 19 / Tailwind SPA bundle
# (Downloads portable Node.js if missing in the Python container environment)
if ! command -v npm &> /dev/null; then
    NODE_VERSION="v20.12.2"
    mkdir -p /tmp/node
    curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" | tar -xJ -C /tmp/node --strip-components=1
    export PATH="/tmp/node/bin:$PATH"
fi

npm install
npm run build

# 3. Collect static files for high-speed WhiteNoise delivery
python manage.py collectstatic --no-input

# 4. Apply database schema migrations to PostgreSQL
python manage.py makemigrations --no-input || true
python manage.py migrate --no-input
```

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 20+** & **npm**
- **PostgreSQL** (or SQLite for local dev)

### 1. Backend (Django) Setup

```bash
# Clone the repository
git clone https://github.com/your-username/taskflow.git
cd taskflow

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure local environment variables
cp .env.example .env

# Run database migrations
python manage.py migrate

# Create an administrator account
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver 8000
```
*The Django REST API is now live at `http://localhost:8000/api/` and Django Admin at `http://localhost:8000/admin/`.*

### 2. Frontend (React + Vite) Setup

```bash
# Open a new terminal tab in the project root
npm install

# Start the frontend development server
npm run dev
```
*The web interface is accessible at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 📁 Project Directory Structure

```text
├── build.sh                    # Automated Render CI/CD build script
├── Procfile                    # Render / Heroku process declaration (Gunicorn)
├── render.yaml                 # Infrastructure as Code specification for Render
├── requirements.txt            # Python dependencies (Django 5, DRF, Gunicorn, psycopg2)
├── package.json                # Frontend dependencies (React 19, TypeScript, Tailwind CSS)
├── manage.py                   # Django command-line execution entry point
├── server.ts                   # Full-stack dev proxy & unified server
│
├── taskmanager/                # Django Core Project Configuration
│   ├── settings.py             # DRF, CORS, WhiteNoise, PostgreSQL, Security settings
│   ├── urls.py                 # Root URL routing (/admin/, /api/, and SPA fallback)
│   ├── wsgi.py                 # Production WSGI application for Gunicorn
│   └── asgi.py                 # ASGI application entry point
│
├── tasks/                      # Core Django Application
│   ├── models.py               # Data Models: Task, RecurringTask, TaskOccurrence, AuditLog
│   ├── serializers.py          # DRF ModelSerializers with validation logic
│   ├── views.py                # ViewSets, AnalyticsDashboardView, Gemini AI Views
│   ├── urls.py                 # REST endpoint routing (/api/tasks, /api/recurring, etc.)
│   ├── admin.py                # Customized Django Admin interfaces
│   └── tests.py                # Automated Django test suite
│
└── src/                        # React 19 Frontend Application
    ├── main.tsx                # Client application root
    ├── App.tsx                 # Main layout, routing, modal coordinator
    ├── api.ts                  # Typed client-side API communication layer
    ├── types.ts                # Shared TypeScript models and interfaces
    └── components/
        ├── AnalyticsView.tsx   # Eisenhower 2×2 Priority Matrix & Performance Analytics
        ├── DashboardView.tsx   # Main task overview and priority breakdown
        ├── TaskListView.tsx    # Interactive task table, status toggles, filters
        ├── RecurringView.tsx   # Recurrence schedule & occurrence manager
        ├── GeminiAiView.tsx    # Interactive AI Assistant conversation panel
        └── AuditLogView.tsx    # Security audit trail feed (Admin role)
```

---

## 🔌 API Reference Overview

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/tasks/` | `GET`, `POST` | List and create tasks with priority, status, and tags | Authenticated |
| `/api/tasks/<id>/` | `GET`, `PUT`, `PATCH`, `DELETE` | Retrieve, update, or remove a specific task | Task Owner / Admin |
| `/api/recurring/` | `GET`, `POST` | Manage recurring task definitions (frequency, cadence) | Authenticated |
| `/api/recurring/<id>/generate/` | `POST` | Batch-generate future occurrences (1–12 instances) | Task Owner / Admin |
| `/api/occurrences/` | `GET` | Retrieve scheduled occurrences across all recurring tasks | Authenticated |
| `/api/occurrences/<id>/complete/` | `PATCH`, `POST` | Mark a scheduled occurrence as completed | Task Owner / Admin |
| `/api/occurrences/<id>/notes/` | `PATCH`, `POST` | Attach or update notes on a specific scheduled date | Task Owner / Admin |
| `/api/analytics/dashboard/` | `GET` | Aggregated analytics, completion rates, and priority breakdown | Authenticated |
| `/api/gemini/assistant/` | `POST` | Process natural language AI requests and task actions | Authenticated |
| `/api/audit-logs/` | `GET` | Query immutable audit log records and security events | Admin Only |
| `/api/health/` | `GET` | Health check endpoint for uptime monitoring and Render | Public |

---

## 🧪 Testing & Quality Assurance

```bash
# Run Django backend test suite
python manage.py test tasks

# Run TypeScript compile-time linting
npm run lint

# Run production build verification
npm run build
```

---

## 👤 Author & Acknowledgments

- **Lead Engineer**: Rifa Khanum
- **Architecture**: Python / Django REST Framework + React 19 + TypeScript
- **Deployment**: Render Cloud Platform with Managed PostgreSQL

---

*This application is production-ready, featuring clean code principles, full type safety, and scalable cloud deployment.*
