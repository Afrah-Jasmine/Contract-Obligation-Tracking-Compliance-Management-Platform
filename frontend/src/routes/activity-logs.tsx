import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { activities } from "@/lib/api/resources";

export const Route = createFileRoute("/activity-logs")({ component: ActivityLogs });
function ActivityLogs() {
  const query = useQuery({ queryKey: ["activities"], queryFn: activities.list }); const items = [...(query.data ?? [])].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
  return <main className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 lg:px-8"><header className="flex items-center gap-4"><span className="grid size-10 place-items-center rounded-md bg-jade/10 text-jade"><Activity className="size-5" /></span><div><h1 className="font-display text-2xl font-semibold">Activity timeline</h1><p className="mt-1 text-sm text-muted-foreground">A chronological record of contract workspace activity.</p></div></header><section className="rounded-lg bg-card p-6 shadow-hairline">{query.isLoading ? <div className="space-y-4">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : items.length ? <ol className="space-y-6 border-l-2 border-jade/30 pl-6">{items.map((item) => <li key={item.id} className="relative"><span className="absolute -left-[34px] grid size-5 place-items-center rounded-full border-2 border-background bg-jade text-white"><CheckCircle2 className="size-3" /></span><p className="text-xs text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</p><p className="mt-1 font-medium">{item.activity}</p><div className="mt-1 flex gap-2"><Badge variant="outline">Contract {item.contract_id}</Badge><Badge variant="secondary">User {item.user_id}</Badge></div></li>)}</ol> : <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}</section></main>;
}
