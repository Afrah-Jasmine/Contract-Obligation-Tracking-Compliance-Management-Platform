# Contract Workspace

Redesign the entire application from scratch.

Do NOT generate a generic admin dashboard.

Do NOT use a grid of KPI cards as the primary dashboard.

I want the application to feel like an Apple-designed enterprise product.

The design language should take inspiration from:

• Apple Business Manager

• Linear

• Notion

• Vercel

• Stripe Dashboard

• Raycast

• Arc Browser

• Figma

The experience should be calm, spacious, minimal, and premium.

Prioritize typography over decoration.

Use whitespace instead of borders.

Avoid excessive shadows.

Avoid colorful dashboards.

Avoid rainbow charts.

Avoid Bootstrap-style cards.

Avoid AI-generated admin templates.

The application is a Contract Lifecycle Management platform, not a dashboard product.

The homepage should behave like an operational workspace.

Instead of showing only statistics, surface actionable information:

- Contracts requiring approval

- Upcoming renewals

- Overdue obligations

- High-risk compliance issues

- Recent notifications

- Recent activity

- System health

Use large typography, subtle animations, refined spacing, and enterprise-grade tables.

The left navigation should include both icons and labels, support collapse/expand, and match my backend modules:

- Dashboard

- Contracts

- Obligations

- Renewals

- Compliance

- Reports

- Notifications

- Activity Logs

- Profile

- Settings

Build the frontend to match my existing FastAPI project architecture.

Do not invent backend endpoints.

Use only my existing APIs.

Authentication must work with FastAPI OAuth2 JWT Bearer authentication.

Store JWT in sessionStorage by default and localStorage only when "Remember Me" is enabled.

Use Axios services that mirror my backend routers.

My backend already contains modules for:

- Authentication

- Contracts

- Obligations

- Renewals

- Compliance

- Notifications

- Reports

- Dashboard

Generate a modular frontend that maps directly to these backend routes so integration requires minimal changes.

The final product should look like enterprise software that could be demonstrated to government agencies or international clients—not a typical AI-generated CRUD application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/336ee2bd-2e04-4749-902a-25d3d980c612).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
