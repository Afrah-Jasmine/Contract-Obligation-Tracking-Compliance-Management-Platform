import type { LucideIcon } from "lucide-react";

export function ModulePage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-10 flex items-start gap-4">
        <span className="grid size-10 place-items-center rounded-md bg-jade/10 text-jade">
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <section className="border-t border-border py-12">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          This workspace is ready to connect to the corresponding FastAPI router without changing
          its visual structure.
        </p>
      </section>
    </main>
  );
}
