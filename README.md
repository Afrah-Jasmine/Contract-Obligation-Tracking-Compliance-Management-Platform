Contract-Obligation-Tracking-Compliance-Management-Platform
--Asvitha Chitteti
# ContractIQ – Contract Obligation & Compliance Management Platform

**ContractIQ** is an enterprise-grade web application designed to streamline the lifecycle of corporate contracts, track contractual obligations, automate renewal workflows, evaluate compliance scores, and deliver real-time notifications and analytics reports.


---

## 🚀 Sprint-by-Sprint Implementation Breakdown

### 🔹 Sprint 1: Foundation & User Authentication
- **Project Setup & Architecture:** Initialized FastAPI backend and Angular single-page application structure.
- **Database Infrastructure:** Established PostgreSQL database connection using SQLAlchemy engine and session factory. Integrated Alembic for database versioning and schema migrations.
- **User Authentication & Security:** 
  - Implemented secure password hashing using BCrypt algorithms.
  - Developed JSON Web Token (JWT) based authentication mechanism with stateless bearer token verification.
- **Role-Based Access Control (RBAC):** Configured permission controls for user roles: `ADMIN`, `CONTRACT_MANAGER`, `COMPLIANCE_OFFICER`, and `VIEWER`.
- **API Endpoints:**
  - `POST /db/users` – Register new user accounts.
  - `POST /login` – Authenticate user and issue JWT token.
  - `GET /users/me` – Retrieve authenticated user profile.

---

### 🔹 Sprint 2: Contract Lifecycle & Obligation Management
- **Contract Management Engine:**
  - Full CRUD lifecycle management for corporate contracts.
  - Metadata tracking: Title, Contract Type, Vendor/Party details, Start Date, End Date, Value, and Status (`DRAFT`, `ACTIVE`, `UNDER_REVIEW`, `EXPIRED`, `TERMINATED`).
  - Document attachment handling and metadata linkage.
- **Obligation Tracking Module:**
  - Break down contracts into actionable contractual obligations.
  - Fields tracked: Obligation Description, Category (Financial, Operational, Legal, Regulatory), Due Date, Responsible Assignee, and Status (`PENDING`, `IN_PROGRESS`, `FULFILLED`, `OVERDUE`).
- **API Endpoints:**
  - `GET /contracts`, `POST /contracts`, `GET /contracts/{id}`, `PUT /contracts/{id}`, `DELETE /contracts/{id}`
  - `GET /obligations`, `POST /obligations`, `PUT /obligations/{id}`, `PATCH /obligations/{id}/status`

---

### 🔹 Sprint 3: Renewal Management & Compliance Audit Trail
- **Automated Renewal Workflow:**
  - Renewal status tracking: `UPCOMING`, `PENDING_REVIEW`, `RENEWED`, `TERMINATED`.
  - Configurable advance notice periods (e.g., 30, 60, 90 days before expiration) and auto-renewal flag configuration.
- **Compliance Scoring & Audit Log Engine:**
  - Automated calculation of contract and vendor compliance scores based on fulfilled vs. overdue obligations.
  - Audit logging system recording system activity, contract state modifications, user actions, and timestamps for governance compliance.
- **API Endpoints:**
  - `GET /renewals`, `POST /renewals`, `PUT /renewals/{id}/action`
  - `GET /compliance/score/{contract_id}`, `GET /compliance/audit-logs`

---

### 🔹 Sprint 4: Notification Engine & Analytics Reporting
- **Notification Engine:**
  - Automated alert trigger system monitoring approaching contract expiry dates, overdue obligations, and pending renewal reviews.
  - Notification management endpoints: Mark as Read, Read All, Filter by Priority (`HIGH`, `MEDIUM`, `LOW`).
- **Analytics & Executive Reporting:**
  - Aggregated metrics generation: Total active contracts, total financial commitments, compliance rate percentages, and obligation fulfillment distributions.
  - Export capabilities for audit reports and executive dashboards.
- **API Endpoints:**
  - `GET /notifications`, `PATCH /notifications/{id}/read`
  - `GET /reports/summary`, `GET /reports/compliance-breakdown`, `GET /reports/export`

---

### 🔹 Sprint 5: Frontend Integration, Testing & Deployment
- **Angular UI Integration:**
  - Responsive single-page application built using Angular 21 with modular architecture.
  - Dynamic routing with Route Guards (`AuthGuard`) protecting private pages.
  - HTTP Interceptors automatically attaching JWT authorization headers to outgoing requests.
- **CORS & Middleware Configuration:** Configured cross-origin resource sharing middleware on FastAPI to seamlessly serve the Angular frontend.
- **End-to-End Verification:** Full system validation, API testing, bug resolution, and database optimization.

---

## 🛠️ Installation & Setup Guide

### 1️⃣ Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd contractiq_backend

# Create and activate Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
