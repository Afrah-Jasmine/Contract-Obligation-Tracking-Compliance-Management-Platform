# ContractIQ – Contract Obligation & Compliance Management Platform

ContractIQ is an enterprise-grade platform for managing the complete contract lifecycle, tracking obligations, monitoring compliance scores, managing automated renewals, sending real-time notifications, and generating analytics reports.


---

## 📅 Sprint-by-Sprint Development Roadmap (Sprints 1 – 14)

### 🔹 Sprint 1: Project Initialization & Architecture Setup
- Initialized FastAPI backend project structure with standard design patterns.
- Configured Angular 21 Single Page Application frontend.
- Established PostgreSQL connection settings and environment configuration (`.env`).

### 🔹 Sprint 2: Database Schema Design & ORM Modeling
- Designed relational database tables for `User`, `Contract`, `Obligation`, `Renewal`, `Compliance`, `Notification`, and `AuditLog`.
- Created SQLAlchemy ORM models and relationships.
- Integrated Alembic for database migrations and schema versioning.

### 🔹 Sprint 3: User Authentication & JWT Security
- Implemented secure password hashing using BCrypt algorithms.
- Developed stateless JSON Web Token (JWT) authentication flow (`/login`).
- Configured user registration endpoint (`/db/users`) and token validation.

### 🔹 Sprint 4: Role-Based Access Control (RBAC)
- Defined user roles: `ADMIN`, `CONTRACT_MANAGER`, `COMPLIANCE_OFFICER`, and `VIEWER`.
- Implemented FastAPI dependency functions (`dependencies.py`) for authorization.
- Added role-based permission checks across API routes.

### 🔹 Sprint 5: Contract Management Module (Core CRUD)
- Developed APIs for contract creation, listing, updating, and deletion (`/contracts`).
- Tracked contract metadata: Title, Type, Vendor/Party details, Contract Value, Start/End Dates.
- Implemented Contract Status lifecycle: `DRAFT`, `ACTIVE`, `UNDER_REVIEW`, `EXPIRED`, `TERMINATED`.

### 🔹 Sprint 6: Document & Attachment Handling
- Added contract file metadata management and document linkage.
- Integrated file storage pathways for contract agreements and legal attachments.
- Configured endpoint download & preview security.

### 🔹 Sprint 7: Obligation Tracking & Assignee Module
- Built Obligation Management engine linked to active contracts (`/obligations`).
- Categorized obligations: `FINANCIAL`, `OPERATIONAL`, `LEGAL`, `REGULATORY`.
- Assigned obligations to team members with designated due dates.

### 🔹 Sprint 8: Obligation Status Lifecycle & Fulfillment
- Managed obligation statuses: `PENDING`, `IN_PROGRESS`, `FULFILLED`, `OVERDUE`.
- Created endpoint for status updates and fulfillment date tracking (`PATCH /obligations/{id}/status`).
- Added automated overdue flag updates for past-due obligations.

### 🔹 Sprint 9: Contract Renewal Management Workflow
- Developed Renewal Tracking module (`/renewals`).
- Configured advance notice periods (30, 60, 90 days) and auto-renewal flags.
- Created renewal action workflows: `UPCOMING`, `PENDING_REVIEW`, `RENEWED`, `TERMINATED`.

### 🔹 Sprint 10: Compliance Evaluation & Audit Trail Engine
- Developed automated compliance score calculation algorithm based on obligation fulfillment rates.
- Created immutable Audit Logging system (`/compliance/audit-logs`) to record user actions, contract edits, and system changes for regulatory compliance.

### 🔹 Sprint 11: Notification Engine & Real-Time Alerts
- Built automated notification triggering engine (`/notifications`).
- Triggered alerts for upcoming due dates, expired contracts, and pending renewals.
- Implemented user notification preferences and read/unread status management.

### 🔹 Sprint 12: Executive Analytics & Custom Reporting
- Created aggregated reporting APIs (`/reports/summary`, `/reports/compliance-breakdown`).
- Developed executive metrics: Total contract value, active contracts, compliance rate %, and overdue task distributions.
- Added data export capabilities (CSV/PDF reports).

### 🔹 Sprint 13: Angular Frontend Component Integration & CORS
- Configured CORS middleware on FastAPI backend for cross-origin requests.
- Integrated Angular HTTP Interceptors for automatic JWT header attachment.
- Built responsive UI components: Login/Register, Dashboard, Contracts, Obligations, Compliance, Notifications, and Reports.

### 🔹 Sprint 14: End-to-End Testing, Optimization & Deployment
- Performed backend API integration tests and frontend verification.
- Optimized database queries, indexed primary foreign keys, and refined exception handling.
- Configured Uvicorn production server execution and environment configurations.

---

## 🛠️ How to Run locally

### Backend (FastAPI):
```bash
cd contractiq_backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
