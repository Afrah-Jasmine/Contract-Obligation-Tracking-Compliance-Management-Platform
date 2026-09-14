# ContractIQ — Angular Frontend

Complete Angular 18 standalone frontend for the ContractIQ FastAPI/PostgreSQL application.

## Included

- Angular Material responsive shell: header, sidebar, profile menu and logout
- JWT login/register, token interceptor, protected routes and Administrator-only Users page
- Live dashboard from `/dashboard/summary`
- Contract repository: search/filter, create, edit, details and lifecycle actions
- Obligation register: create, edit, details, filtering, status transitions and completion
- Renewal register: search/date/status filters, create, start and complete renewal
- Compliance: summary, per-contract scores, non-compliant and high-risk data
- Notifications: unread state, read and mark-all-read
- Reports: live summaries, date filters and PDF/Excel export
- Audit/Activity screen
- Shared status, page-header and loading components
- Centralized Angular HTTP services
- User-friendly API/network/validation errors
- Empty/loading/error states and mobile responsive layouts

## Run

From `contractiq/frontend`:

```bash
npm install
npm start
```

Angular runs on `http://localhost:4200`.

The API defaults to `http://localhost:8000`. To override it before loading the app:

```html
<script>
  window.__CONTRACTIQ_API__ = 'http://localhost:8000';
</script>
```

## Backend

From the repository root:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Or:

```bash
docker compose up --build
```

## Full-stack flow

Login → Dashboard → Contracts → Obligations → Renewals → Compliance → Notifications → Reports & Analytics → Audit / Activity → Logout.

The frontend never hardcodes business statistics; it consumes the FastAPI APIs through Angular services.
