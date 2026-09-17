import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-sidebar px-12 py-14 text-sidebar-foreground lg:flex">
        <Link to="/login" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary font-display text-sm font-semibold text-sidebar-primary-foreground">
            C
          </span>
          <span className="font-display text-sm font-semibold">ContractIQ</span>
        </Link>
        <div className="max-w-md">
          <p className="text-[11px] uppercase tracking-[0.2em] text-sidebar-foreground/40">
            Enterprise Contract Intelligence Platform
          </p>
          <p className="mt-5 font-display text-3xl leading-tight">
            Approvals, obligations and renewals in one considered workspace.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/40">
          Secured with OAuth2 bearer authentication
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-14">
        <div className="rise w-full max-w-sm">
          <div className="mb-9 lg:hidden">
            <span className="grid size-9 place-items-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
              C
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
