import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type RecordItem = Record<string, unknown> & { id: number };

export function ResourcePage<T extends RecordItem>({
  title,
  description,
  icon: Icon,
  queryKey,
  load,
  columns,
  actions,
  actionError,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  queryKey: string[];
  load: () => Promise<T[]>;
  columns: Array<{ label: string; value: (item: T) => string | number | null | undefined }>;
  actions?: (item: T) => ReactNode;
  actionError?: string | null;
}) {
  const [search, setSearch] = useState("");
  const { data = [], isLoading, isError, error } = useQuery({ queryKey, queryFn: load, retry: 2 });
  const items = useMemo(
    () => data.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-10 place-items-center rounded-md bg-jade/10 text-jade">
            <Icon className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <label className="flex h-9 items-center gap-2 rounded-md bg-secondary px-3 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="w-56 bg-transparent outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
          />
        </label>
      </header>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-14 w-full" />
          ))}
        </div>
      ) : null}
      {isError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error).message || `Unable to load ${title.toLowerCase()}.`}
        </p>
      ) : null}
      {actionError ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </p>
      ) : null}
      {!isLoading && !isError ? (
        <section className="overflow-x-auto rounded-lg bg-card shadow-hairline">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                {columns.map((column) => (
                  <th key={column.label} className="px-4 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
                {actions ? <th className="px-4 py-3 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0">
                  {columns.map((column) => (
                    <td key={column.label} className="px-4 py-3">
                      {String(column.value(item) ?? "—")}
                    </td>
                  ))}
                  {actions ? <td className="px-4 py-3">{actions(item)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No {title.toLowerCase()} found.
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
