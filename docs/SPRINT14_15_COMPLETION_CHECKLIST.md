# ContractIQ Sprint 14–15 Completion Checklist

This implementation follows the supplied Sprint 14 / Sprint 14A / Sprint 14B requirements.

## Frontend foundation
- Angular 18 standalone application
- Angular Material
- Responsive shell with header, sidebar, profile menu and logout
- Routing for Dashboard, Contracts, Obligations, Renewals, Compliance, Notifications, Reports, Audit/Activity, Profile and Users
- Central API base URL
- Reusable page-header, status-chip and loading-state components

## Authentication
- Login using FastAPI OAuth2 form endpoint
- Registration
- Forgot-password/reset-password screen using the existing FastAPI endpoint
- JWT stored in localStorage
- HTTP interceptor sends Bearer token
- 401 responses return the user to login
- Protected application routes
- Administrator-only Users route and role-aware navigation
- Logout/session clearing

## Dashboard and analytics
- Live `/dashboard/summary` integration
- Total, active and expired contracts
- Pending/in-progress and overdue obligations
- Upcoming renewals
- Compliance and risk indicators
- Contract and obligation status distribution
- Approaching expiry and high-risk contract lists
- Loading, empty and API error states
- No hardcoded business statistics

## Business modules
- Contracts: list, search, filter, create, edit, details, lifecycle/status actions, assignment and compliance
- Obligations: list, search, filter, create, edit, details, status changes and completion
- Renewals: list, search, date/status filtering, create, edit, status changes and renewal action
- Compliance: summary, per-contract scores, non-compliant and high-risk views
- Notifications: list, details, unread count, mark read and mark all read
- Reports: contract/obligation/renewal/compliance summaries, date filters and PDF/Excel export
- Audit/Activity: recent activity and audit history
- Profile: update current user's name
- Users: administrator role management and deactivation

## Integration architecture
Angular component -> Angular service -> HTTP request -> FastAPI -> service/router -> SQLAlchemy -> PostgreSQL -> response -> Angular service -> UI.

API calls are kept in `frontend/src/app/core/data.service.ts` and `auth.service.ts`, rather than embedded throughout components.

## Verification performed in this environment
- Python source syntax check: PASS (`python -m compileall`)
- Angular source/component/route file consistency checks: PASS
- Full Angular build could not be executed because this environment could not finish `npm ci` within the available execution window; run `npm ci && npm run build` locally before pushing.
- Backend pytest collection requires the project's Python dependencies (for example `python-jose`) to be installed locally.

## GitHub submission
Use the GitHub repository provided by the mentor as the remote. Do not push to a personal repository.

```bash
cd contractiq
git init
git add .
git commit -m "Complete ContractIQ Sprint 14-15 Angular frontend integration"
git branch -M main
git remote add origin <MENTOR_REPOSITORY_URL>
git push -u origin main
```

If the mentor repository already has history, clone that repository first, copy these project files into it, then commit and push rather than force-pushing.
