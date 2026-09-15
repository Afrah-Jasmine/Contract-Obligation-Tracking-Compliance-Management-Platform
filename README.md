ContractIQ — Contract Obligation Tracking & Compliance Management Platform
ContractIQ is a full-stack platform for managing the entire contract lifecycle — creation, review, approval, activation, obligation tracking, renewals, compliance/risk scoring, notifications, and audit logging — behind a role-based, JWT-secured REST API, with an Angular frontend on top.
This repository contains the FastAPI + PostgreSQL backend (Sprints 3–12) and the Angular 18 frontend (Sprints 14–15) that consumes it.
See `docs/SPRINT14_15_COMPLETION_CHECKLIST.md` for the task-by-task completion map and verification notes.
---
Table of Contents
Overview
Sprint-by-Sprint Breakdown
Tech Stack
Project Structure
Quick Start
Environment Variables
Database Migrations
Running with Docker
Database Design
Roles & Permissions
API Reference
Business Rules Cheat Sheet
Testing
Seed Data
Contributing
License
---
Overview
ContractIQ models the following business flow:
```
User
 │
 ▼
Contract ──┬─────────────────────┐
           │                     │
           ▼                     ▼
   Contract Versions        Obligations ──► Notifications
           │                     │
           ▼                     ▼
       Renewals            Compliance Records
           │
           ▼
     Notifications

User ──► Reports
User ──► Audit Logs
User ──► Activities
```
Each concern — contract data, obligations, renewals, compliance evaluation, notifications, and audit history — lives in its own table and is connected via foreign keys, so the pieces can be extended or queried independently.
Core capabilities:
JWT authentication with six-role RBAC (Administrator, Legal Manager, Compliance Officer, Contract Manager, Department Head, Employee)
Contract lifecycle management with enforced status transitions (Draft → Under Review → Approved → Active → …)
Obligation tracking with automatic overdue detection
Renewal workflow that rolls a completed renewal's new expiry date back onto the parent contract
Live compliance scoring and risk-level classification, persisted as historical records
In-app + email notifications (SMTP, degrades gracefully if unconfigured)
Audit logging and activity history models
Angular frontend with authentication, protected routing, role-aware navigation, dashboard analytics, contracts, obligations, renewals, compliance, notifications, reports, audit/activity, profile, and administrator user management
Sprint-by-Sprint Breakdown
ContractIQ was built incrementally across Sprints 3–15. Each sprint added a self-contained layer on top of the previous one — schema first, then auth, then business modules, then reporting, then the full Angular frontend.
Sprint 3 — Database Design
Identified the nine core tables needed for the platform: `users`, `contracts`, `contract_versions`, `obligations`, `renewals`, `notifications`, `reports`, `audit_logs`, `activities`.
Defined every column, type, and constraint for each table (e.g. `contracts.contract_number` unique, `users.email` unique, enums for `status`/`role`/`category`/`obligation_type`).
Mapped entity relationships: a `User` creates/is assigned many `Contracts`; a `Contract` has many `ContractVersions`, `Obligations`, and `Renewals`; `Obligations` and `Contracts` each generate `Notifications`; `AuditLog`/`Activity` belong to a `User`.
Drew the full entity-relationship diagram (`ContractIQ_ER_Diagram.png`) and documented it as a Mermaid ER diagram.
Implemented every table as a SQLAlchemy model under `app/models/` (`user.py`, `contract.py`, `contract_version.py`, `obligation.py`, `renewal.py`, `notification.py`, `report.py`, `audit_log.py`, `activity.py`).
Wrote up the schema and design decisions in `docs/DATABASE_DESIGN.md` as the Sprint 3 deliverable.
Sprint 4 — Database Migrations
Installed and configured Alembic (`alembic.ini`, `alembic/env.py`).
Wired `alembic/env.py`'s target metadata to `app.database.Base.metadata` so migrations are auto-generated from the SQLAlchemy models, not written by hand.
Pointed Alembic at the `DATABASE_URL` from `.env` so it connects to the same database as the running app.
Generated the initial migration: `alembic revision --autogenerate -m "initial schema"`.
Applied it with `alembic upgrade head` and verified all tables appeared correctly under `contractiq_db → public` in pgAdmin/psql.
Established the repeatable workflow for future model changes: edit a model → `alembic revision --autogenerate -m "..."` → `alembic upgrade head`.
Sprint 5 — Authentication
Added `passlib`/`bcrypt` password hashing utilities in `app/core/security.py`.
Implemented JWT creation and decoding (`python-jose`) with a configurable `SECRET_KEY`, `ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES`.
Built `POST /auth/register` to create a new user with a hashed password.
Built `POST /auth/login` as a form-encoded OAuth2-style endpoint (`username` = email, `password`) returning a bearer `access_token`.
Built `POST /auth/password-reset` for resetting a user's password.
Added `get_current_user` / `get_current_active_user` dependencies (`app/core/deps.py`) so any route can require a valid, active, authenticated user.
Verified the flow end-to-end in Swagger: register → login → copy token → click Authorize → call a protected route.
Sprint 6 — Role-Based Access Control (RBAC)
Defined the six-role `UserRole` enum in `app/core/roles.py`: `Administrator`, `Legal Manager`, `Compliance Officer`, `Contract Manager`, `Department Head`, `Employee`.
Built a reusable `require_roles(*allowed_roles)` FastAPI dependency in `app/core/permissions.py`, layered on top of the Sprint 5 JWT auth.
Defined common role groupings used across multiple routers — `ANY_MANAGER_ROLES`, `COMPLIANCE_VIEW_ROLES`, `APPROVAL_ROLES` — so permission logic isn't repeated per endpoint.
Applied `require_roles(...)` to sensitive endpoints (e.g. `DELETE /users/{user_id}` restricted to Administrator, contract approval restricted to Administrator/Legal Manager).
Verified the enforcement rules: no token → `401 Unauthorized`; valid token but wrong role → `403 Forbidden`; correct role → success.
Sprint 7 — Contract Management (Core)
Built `POST /contracts` to create a contract, always taking `created_by` from the JWT — never trusted from the request body.
Built `GET /contracts` (list) and `GET /contracts/{id}` (retrieve, returning `404` for a bad id).
Built `PUT /contracts/{id}` to update contract fields.
Added `PATCH /contracts/{id}/assign` to reassign a contract's owner.
Implemented `contract_versions` to capture version history whenever a contract's document/content changes.
Wrote Pydantic schemas (`app/schemas/contract.py`) to validate requests and shape responses consistently.
Sprint 8 — Contract Lifecycle
Defined the enforced status flow: `Draft → Under Review → Approved → Active → …`.
Built `POST /contracts/{id}/submit-review` to move a contract from `Draft` to `Under Review`.
Built `POST /contracts/{id}/approve`, restricted to Administrator/Legal Manager, moving `Under Review` to `Approved`.
Built `POST /contracts/{id}/activate` to move `Approved` to `Active`.
Added server-side validation that rejects out-of-order transitions (e.g. approving a still-`Draft` contract) with `400`.
Recorded transition timestamps (`reviewed_at`, `approved_at`, `activated_at`) automatically at each step.
Tested each transition and the rejection path in Swagger.
Sprint 9 — Obligation Tracking
Built `POST /obligations` to create an obligation tied to a valid `contract_id`.
Built `GET /obligations`, `GET /obligations/{id}`, and `GET /contracts/{id}/obligations` for listing/retrieval.
Built `PUT /obligations/{id}` for updates and `PATCH /obligations/{id}/status` for status changes.
Built `POST /obligations/{id}/complete`, with the server (not the client) setting `completion_date`.
Implemented automatic overdue detection: whenever obligations are listed or fetched, any obligation past its `due_date` and not yet `Completed` is flipped to `Overdue` on the spot.
Connected the overdue flip to the Sprint 12 notification system so it fires an alert the moment it's detected.
Sprint 10 — Renewal Management
Built `POST /renewals` to create a renewal record for an existing contract.
Built `GET /renewals`, `GET /renewals/{id}`, and `GET /contracts/{id}/renewals` for listing/retrieval.
Built `PUT /renewals/{id}` for updates and `PATCH /renewals/{id}/status` to move a renewal (e.g. `Upcoming → In Progress`).
Built `POST /renewals/{id}/renew` as the single, authoritative completion action: it sets the renewal to `Renewed`, pushes `new_expiry_date` onto the parent contract, and reactivates the contract if it had previously expired.
Enforced that no other endpoint is allowed to change a contract's expiry date — keeping that logic in one place.
Verified in Swagger that renewing a contract correctly updates the linked `contracts` row.
Sprint 11 — Compliance Monitoring
Designed the compliance scoring and risk-level rules in `app/services/compliance_service.py`.
Built `GET /contracts/{id}/compliance` to compute a live snapshot — re-evaluating the contract's obligations on every call rather than caching a stale result.
Persisted every evaluation as a new row in `compliance_records`, so a full history of scores over time is retained.
Built `GET /compliance` (all records), `GET /compliance/summary` (aggregate view), `GET /compliance/non-compliant`, and `GET /compliance/high-risk`.
Tested that repeated calls after changing obligation statuses produce updated, correctly recalculated scores.
Sprint 12 — Notifications
Built a central `notification_service.py` so every part of the app creates notifications through one function instead of duplicating logic.
Connected obligation overdue events (Sprint 9) and other triggers to automatically generate notifications.
Built `GET /notifications` (scoped to the authenticated user only), `GET /notifications/{id}`, `POST /notifications`, `PATCH /notifications/{id}/read`, and `PATCH /notifications/read-all`.
Built `email_service.py` for optional outbound SMTP email delivery, configured via `SMTP_HOST`/`SMTP_PORT`/`SMTP_USERNAME`/`SMTP_PASSWORD`/`SMTP_FROM`.
Made email delivery fail gracefully: if SMTP isn't configured, the notification is still saved to the database and the email step is skipped and logged rather than raising an error.
Verified both paths: with SMTP configured (real email sent) and without (DB-only, no crash).
Sprint 13 — Reports, Analytics and Dashboard Development
Built contract summary endpoints: total, active, expired, pending-approval contracts, and contracts grouped by status.
Built obligation summary endpoints: total, pending, completed, and overdue obligations, grouped by status.
Built renewal summary endpoints: upcoming renewals, expired contracts, contracts needing attention, and renewals within a selected date range.
Built compliance summary endpoints: compliant contracts, non-compliant contracts, high-risk obligations, and overall compliance statistics.
Implemented all of the above as SQLAlchemy aggregation queries against the existing tables — no duplicate reporting tables were created.
Added filtering by contract status, obligation status, and date range where relevant, plus Pydantic response schemas for each report type.
Handled empty results and invalid inputs cleanly, and tested every endpoint in Swagger.
Prepared the underlying data the Sprint 14 dashboard would need: summary cards, status distributions, upcoming renewals, and compliance stats.
Sprint 14 — Angular Frontend Foundation, Dashboard & Authentication
14A — Frontend Foundation and Dashboard
Created and configured the Angular 18 project, and set up Angular Material.
Learned/applied the Angular project structure: components, services, modules, routing.
Configured a central backend API base URL and confirmed the Angular app runs successfully end to end.
Built the common application layout: header, sidebar navigation, main content area, and a responsive layout for desktop and mobile.
Added navigation placeholders/routes for Dashboard, Contracts, Obligations, Renewals, Compliance, Notifications, Reports, and Audit History.
Built the initial dashboard screen showing total contracts, active contracts, expired contracts, pending obligations, overdue obligations, upcoming renewals, and a compliance summary, using Angular Material cards and charts.
Created an Angular service for API communication and used `HttpClient` to call the Sprint 13 reporting APIs.
Displayed the live API response on the dashboard, with loading states, empty-response handling, and API error handling — verifying the numbers shown matched the database.
14B — Authentication and Frontend–Backend Integration
Built the Login page, Registration page, and a Forgot-Password page/placeholder, plus logout, using Angular reactive forms with validation.
Connected the login form to the FastAPI `/auth/login` endpoint: sent credentials, handled success/failure responses, stored the auth token, and redirected to the dashboard on success.
Displayed meaningful validation and error messages instead of raw API errors.
Implemented route protection (`auth.guard.ts`) so unauthenticated users can't reach protected pages and are redirected to login.
Implemented an HTTP interceptor (`auth.interceptor.ts`) to attach the bearer token to every outgoing request.
Made logout clear the active session and return the user to the login page.
Implemented role-based navigation, showing/hiding menu items (Admin, Contract Manager, Compliance Officer, Viewer, etc.) consistent with backend permissions.
Ran a full integration test of the flow: Login page → FastAPI Auth API → token received → Dashboard → Dashboard APIs → contract/obligation/renewal/compliance data displayed.
Sprint 15 — Full Frontend Integration
Finalized the Angular application structure — components, services, models/interfaces, routing, shared components, guards, forms — with a clean, scalable folder layout.
Completed the application layout and navigation: header, sidebar, nav menu, main content, user/profile section, logout, and responsive navigation across all major modules.
Completed the authentication flow: login, registration (if applicable), logout, token handling, protected routes, session handling, form validation, and role-based permission reflection in the UI.
Completed the main dashboard using the Sprint 13 analytics APIs — summary cards, tables, charts, and status indicators, with everything pulled from the backend (no hardcoded stats).
Built the full Contract Management UI: view, create, edit, view details, delete (where applicable), search, filter, status display, key dates, and approval actions — connected to the Contract APIs.
Built the full Obligation Management UI: view, create, edit, view details, change status, and identify pending/completed/overdue obligations, correctly linked to their parent contract.
Built the full Renewal Management UI: upcoming renewals, renewal dates, expired contracts, renewal status, search/filtering, and date-based filtering.
Built the Compliance section: compliance status, compliant/non-compliant contracts, high-risk obligations, with status indicators and filters — all sourced from the backend.
Integrated Notifications: view notifications, identify unread ones, view details, and mark as read/read-all.
Built the Reports and Analytics screens on top of Sprint 13's APIs: summary info, tables, charts, filters, and date-range selection for contracts, obligations, renewals, and compliance.
Integrated Audit and Activity History, showing who did what and when.
Standardized the API integration architecture throughout: Angular Component → Angular Service → HTTP Request → FastAPI → Service/Router → SQLAlchemy → PostgreSQL → Response → back up through the same chain to the UI — with no API calls placed directly inside components.
Added form validation and error handling across the app: required fields, invalid email/dates, missing values, duplicate records, unauthorized requests, backend errors, and network failures — all surfaced as meaningful messages, not raw errors.
Handled loading and empty states everywhere: loading indicators, empty tables, "no results" messages (e.g. "No contracts found.") instead of blank screens.
Verified the application was fully responsive across desktop, laptop, tablet, and mobile screen sizes.
Ran a complete end-to-end functional walkthrough as a real user: Login → Dashboard → Create Contract → View Contract → Create Obligation → Track Obligation → Check Renewal → Check Compliance → View Notification → View Reports → View Activity History → Logout — confirming data created in one module correctly flows through to the related modules (Contract → Obligation → Renewal → Compliance → Notification → Dashboard).
See `docs/SPRINT14_15_COMPLETION_CHECKLIST.md` for the full Sprint 14–15 deliverable checklist.
Tech Stack
Backend
Technology	Purpose
Python 3.12+	Backend language
FastAPI	REST API framework
SQLAlchemy 2.0	ORM / database models
Pydantic v2	Request/response validation & settings
PostgreSQL 16	Relational database
Alembic	Database migrations
python-jose	JWT issuing/verification
passlib + bcrypt	Password hashing
Uvicorn	ASGI server
Docker / docker-compose	Containerized DB + API
Pytest	Testing
Swagger / OpenAPI	Interactive API docs (`/docs`)
Frontend
Technology	Purpose
Angular 18	SPA framework
Angular Material	UI components
Reactive Forms	Form handling & validation
HttpClient + interceptors	API communication, auth token injection
Project Structure
```
contractiq/
├── requirements.txt
├── alembic.ini
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── seed.py
│
├── app/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                 # Settings loaded from .env (pydantic-settings)
│   ├── database.py                # SQLAlchemy engine / session / Base
│   │
│   ├── core/
│   │   ├── security.py            # password hashing, JWT create/decode
│   │   ├── deps.py                 # get_current_user / get_current_active_user
│   │   ├── permissions.py           # require_roles() RBAC dependency
│   │   └── roles.py                  # UserRole enum
│   │
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── user.py, contract.py, contract_version.py, obligation.py
│   │   ├── renewal.py, notification.py, compliance.py, report.py
│   │   └── audit_log.py, activity.py
│   │
│   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── auth.py, user.py, contract.py, obligation.py
│   │   └── renewal.py, compliance.py, notification.py
│   │
│   ├── services/                  # Business logic
│   │   ├── contract_service.py, obligation_service.py
│   │   ├── compliance_service.py     # scoring + risk-level rules
│   │   ├── notification_service.py   # central notification creation
│   │   └── email_service.py           # SMTP sending
│   │
│   └── api/                       # Routers registered in main.py
│       ├── auth.py                  # /auth
│       ├── users.py                 # /users
│       ├── contracts.py             # /contracts
│       ├── obligations.py           # /obligations, /contracts/{id}/obligations
│       ├── renewals.py              # /renewals, /contracts/{id}/renewals
│       ├── compliance.py            # /compliance
│       └── notifications.py         # /notifications
│
├── alembic/
│   ├── env.py                     # wired to app.database.Base.metadata
│   └── versions/                  # migration history
│
├── docs/
│   ├── DATABASE_DESIGN.md
│   ├── ER_DIAGRAM.md
│   ├── schema.dbml
│   └── SPRINT14_15_COMPLETION_CHECKLIST.md
│
├── tests/
│   └── test_health.py
│
└── frontend/                      # Angular 18 application
    └── src/app/
        ├── core/                   # auth service, guard, interceptor, api base, models
        ├── layout/                 # shell (header, sidebar, main content)
        ├── shared/ui/              # reusable UI components
        └── pages/
            ├── auth/               # login, register, forgot-password
            ├── dashboard/
            ├── contracts/
            ├── obligations/
            ├── renewals/
            ├── compliance/
            ├── notifications/
            ├── reports/
            ├── activity/
            ├── profile/
            └── users/
```
> **Note:** the repository also contains a few superseded/legacy files (`app/api/user_api.py`, `app/api/contract_compliance.py`, `app/database/database.py`, `app/models/audit.py`, `app/routers/*`) left over from earlier sprints. They are **not** imported by `app/main.py` and are not part of the live application. Safe to delete during cleanup.
Quick Start
Prerequisites: Python 3.12+, Node.js + npm, PostgreSQL 16 (or Docker).
Backend
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# edit .env: DATABASE_URL, SECRET_KEY, SMTP_* (optional)

# create the database if running Postgres locally (skip if using Docker)
psql -U postgres -c "CREATE DATABASE contractiq_db;"

alembic upgrade head
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs for interactive Swagger docs, or http://127.0.0.1:8000/redoc for ReDoc.
Health check: `GET /` → `{"status": "ok", "service": "ContractIQ API"}`
Frontend
```bash
cd frontend
npm ci
npm start
```
Open http://localhost:4200. The frontend uses `http://localhost:8000` as the default API base.
Environment Variables
Set in `.env` (see `.env.example`):
Variable	Default	Description
`DATABASE_URL`	`postgresql+psycopg2://postgres:postgres@localhost:5432/contractiq_db`	SQLAlchemy connection string
`SECRET_KEY`	(dev placeholder — change in production)	JWT signing secret
`ALGORITHM`	`HS256`	JWT signing algorithm
`ACCESS_TOKEN_EXPIRE_MINUTES`	`60`	JWT lifetime
`SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD`	—	Outbound email for notifications
`SMTP_FROM`	`ContractIQ <no-reply@contractiq.com>`	From-address for emails
`RENEWAL_REMINDER_DAYS`	`90,60,30,7`	Days-before-expiry thresholds for renewal reminders
If `SMTP_*` is left blank, notifications are still written to the database — email sending is simply skipped and logged rather than raising an error.
Database Migrations
Alembic (`alembic/env.py`) is wired to `app.database.Base.metadata` and reads `DATABASE_URL` from `.env`, so autogenerate picks up every model under `app/models/`.
```bash
# generate a migration after changing a model
alembic revision --autogenerate -m "describe your change"

# apply all pending migrations
alembic upgrade head
```
After migrating, you should see all 10 tables under `contractiq_db → public`: `users`, `contracts`, `contract_versions`, `obligations`, `renewals`, `notifications`, `reports`, `compliance_records`, `audit_logs`, `activities`.
Running with Docker
```bash
docker compose up --build
```
This starts a `postgres:16` container plus the API container, running migrations automatically on boot (`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`). The API is then available at http://localhost:8000.
> The default `docker-compose.yml` uses hardcoded dev credentials (`postgres` / `postgres`, a placeholder `SECRET_KEY`). Override these via environment variables or a `.env` file for anything beyond local development.
Database Design
The schema has 10 tables, matching the original Sprint 3 design plus `compliance_records`, which retains a history of compliance evaluations.
Table	Purpose	Key columns
`users`	Accounts, credentials, roles	`id`, `full_name`, `email`, `hashed_password`, `role`, `is_active`
`contracts`	Master contract record	`id`, `title`, `contract_number`, `category`, `status`, `start_date`, `end_date`, `created_by`, `assigned_to`, `reviewed_at`, `approved_at`, `activated_at`
`contract_versions`	Version history of a contract's document/content	`id`, `contract_id`, `version_number`, `file_url`, `changed_by`, `change_summary`
`obligations`	Tasks/deliverables tied to a contract	`id`, `contract_id`, `title`, `obligation_type`, `due_date`, `assigned_to`, `status`, `completion_date`
`renewals`	Renewal cycle tracking	`id`, `contract_id`, `renewal_date`, `previous_expiry_date`, `new_expiry_date`, `status`, `assigned_to`, `notes`
`notifications`	In-app/email notices	`id`, `user_id`, `contract_id`, `obligation_id`, `notification_type`, `title`, `message`, `status`, `sent_at`, `read_at`
`compliance_records`	Historical compliance evaluations	`id`, `contract_id`, `status`, `compliance_score`, `risk_level`, `evaluated_at`, `notes`
`reports`	Generated report metadata	`id`, `report_type`, `report_format`, `generated_by`, `file_url`, `parameters`
`audit_logs`	Security/action audit trail	`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`
`activities`	General user activity feed	`id`, `user_id`, `description`, `entity_type`, `entity_id`
Relationships: a `User` creates/is assigned many `Contracts`; a `Contract` has many `ContractVersions`, `Obligations`, and `Renewals` (all cascade-deleted with the contract); `Obligations` and `Contracts` each generate `Notifications`; `ComplianceRecord` and `Report` reference a `Contract`/`User` respectively; `AuditLog` and `Activity` both belong to a `User`.
See `docs/DATABASE_DESIGN.md` and `docs/schema.dbml` for full column-level detail, and `ContractIQ_ER_Diagram.png` for the entity-relationship diagram.
Roles & Permissions
Six roles, defined in `app/core/roles.py`:
`ADMINISTRATOR`
`LEGAL_MANAGER`
`COMPLIANCE_OFFICER`
`CONTRACT_MANAGER`
`DEPARTMENT_HEAD`
`EMPLOYEE`
Authorization is enforced with a reusable `require_roles(*allowed_roles)` FastAPI dependency (`app/core/permissions.py`), layered on top of JWT auth: a missing/invalid token returns `401`, a valid token with an insufficient role returns `403`.
Common groupings used across routers:
Group	Roles
`ANY_MANAGER_ROLES`	Administrator, Legal Manager, Contract Manager
`COMPLIANCE_VIEW_ROLES`	Administrator, Legal Manager, Compliance Officer, Contract Manager
`APPROVAL_ROLES`	Administrator, Legal Manager
The Angular frontend mirrors this: navigation options are shown/hidden based on the logged-in user's role, and protected routes redirect unauthenticated users to the login page.
API Reference
All endpoints except `/auth/register` and `/auth/login` require a `Bearer` JWT (obtained from `/auth/login`, form-encoded with `username`=email).
Auth — `/auth`
Method	Path	Description
POST	`/auth/register`	Create a new user
POST	`/auth/login`	Obtain a JWT access token
POST	`/auth/password-reset`	Reset a password
Users — `/users`
Method	Path	Description
GET	`/users/me`	Current user's profile
PUT	`/users/me`	Update current user's profile
GET	`/users`	List users
GET	`/users/{user_id}`	Get a user
PATCH	`/users/{user_id}/role`	Change a user's role
DELETE	`/users/{user_id}`	Delete a user (Administrator only)
Contracts — `/contracts`
Method	Path	Description
POST	`/contracts`	Create a contract (`created_by` taken from JWT)
GET	`/contracts`	List contracts
GET	`/contracts/{id}`	Get a contract
PUT	`/contracts/{id}`	Update a contract
PATCH	`/contracts/{id}/status`	Change status directly
POST	`/contracts/{id}/submit-review`	Draft → Under Review
POST	`/contracts/{id}/approve`	Under Review → Approved (Administrator/Legal Manager)
POST	`/contracts/{id}/activate`	Approved → Active
PATCH	`/contracts/{id}/assign`	Reassign owner
GET	`/contracts/{id}/compliance`	Live compliance snapshot for the contract
Obligations — `/obligations`, `/contracts/{id}/obligations`
Method	Path	Description
POST	`/obligations`	Create an obligation
GET	`/obligations`	List obligations
GET	`/obligations/{id}`	Get an obligation
GET	`/contracts/{id}/obligations`	List a contract's obligations
PUT	`/obligations/{id}`	Update an obligation
PATCH	`/obligations/{id}/status`	Change status
POST	`/obligations/{id}/complete`	Mark complete (server sets `completion_date`)
Overdue detection runs automatically whenever obligations are listed/fetched — any obligation past `due_date` and not `Completed` flips to `Overdue` and fires a notification.
Renewals — `/renewals`, `/contracts/{id}/renewals`
Method	Path	Description
POST	`/renewals`	Create a renewal for a contract
GET	`/renewals`	List renewals
GET	`/renewals/{id}`	Get a renewal
GET	`/contracts/{id}/renewals`	List a contract's renewals
PUT	`/renewals/{id}`	Update a renewal
PATCH	`/renewals/{id}/status`	Upcoming → In Progress, etc.
POST	`/renewals/{id}/renew`	Complete renewal — sets `Renewed`, pushes `new_expiry_date` to the contract, reactivates it if expired
Compliance — `/compliance`
Method	Path	Description
GET	`/compliance`	List all compliance records
GET	`/compliance/summary`	Aggregate compliance summary
GET	`/compliance/non-compliant`	Contracts currently non-compliant
GET	`/compliance/high-risk`	Contracts flagged high risk
Scoring rules live in `app/services/compliance_service.py`; each evaluation is persisted to `compliance_records` for history.
Notifications — `/notifications`
Method	Path	Description
GET	`/notifications`	Current user's notifications only
GET	`/notifications/{id}`	Get a notification
POST	`/notifications`	Create a notification
PATCH	`/notifications/{id}/read`	Mark as read
PATCH	`/notifications/read-all`	Mark all as read
Business Rules Cheat Sheet
Contract status transitions are enforced server-side — out-of-order transitions (e.g. approving a `Draft` contract) return `400`.
`created_by` / `completion_date` / other server-derived fields are always taken from the JWT or computed server-side, never trusted from the request body.
Obligation overdue flips happen lazily on read, not via a background job — no obligation is marked `Overdue` until it's next fetched or listed after its `due_date` has passed.
Renewal completion (`POST /renewals/{id}/renew`) is the only way a contract's expiry date and active status get updated as a result of a renewal.
Compliance is computed live, not cached — each call to `GET /contracts/{id}/compliance` re-evaluates the contract's obligations and writes a fresh `compliance_records` row.
Testing
```bash
pytest
```
`tests/test_health.py` covers the health-check endpoint; extend this directory as coverage grows.
Seed Data
```bash
python seed.py
```
Populates the database with sample users, contracts, obligations, and renewals for manual testing against Swagger UI.
Contributing
```bash
git add .
git commit -m "describe your change"
git push
```
`.env` is already excluded via `.gitignore` — never commit real credentials or a production `SECRET_KEY`.
License
MIT — see `LICENSE`.
