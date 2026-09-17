# Roadmap

## Workspace redesign (in progress)

- [x] Design tokens: Ink + Jade palette, Space Grotesk / DM Sans
- [x] Collapsible icon+label navigation for all 10 modules
- [x] Operational dashboard (approvals, renewals, obligations, compliance, notifications, activity, system health)
- [x] Module route pages with per-route metadata
- [x] Axios services mirroring FastAPI routers
- [ ] Visual verification in preview

## Authentication module (requested 2026-09-13)

- [ ] `src/routes/login.tsx` — split enterprise login, remember me, show/hide password
- [ ] `src/routes/forgot-password.tsx` — isolated API call, mock until backend exists
- [ ] `src/routes/reset-password.tsx` — strength meter, success screen, isolated API call
- [ ] Auth context + TanStack route guards, redirect unauthenticated to `/login`
- [ ] Logout: clear token + cached data, redirect to `/login`
- [ ] 401 interceptor: clear token, redirect, "Your session has expired."
- [ ] Only `POST /auth/login` is treated as a real endpoint
