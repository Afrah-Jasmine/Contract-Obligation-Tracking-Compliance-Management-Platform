import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

import {
  compliance,
  contracts,
  obligations,
  renewals,
} from "@/lib/api/resources";

import { apiErrorMessage } from "@/lib/api/errors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const Route = createFileRoute("/compliance")({
  component: CompliancePage,
});

const colors = [
  "#0f766e",
  "#f59e0b",
  "#dc2626",
  "#2563eb",
  "#7c3aed",
  "#64748b",
];

function CompliancePage() {
  const records = useQuery({ queryKey: ["compliance"], queryFn: () => loggedRequest("compliance records", compliance.list) });
  const summary = useQuery({ queryKey: ["compliance", "summary"], queryFn: () => loggedRequest("compliance summary", compliance.summary) });
  const timeline = useQuery({ queryKey: ["compliance", "timeline"], queryFn: () => loggedRequest("compliance timeline", compliance.timeline) });
  const contractsQuery = useQuery({ queryKey: ["contracts"], queryFn: () => loggedRequest("contracts", contracts.list) });
  const obligationsQuery = useQuery({ queryKey: ["obligations"], queryFn: () => loggedRequest("obligations", obligations.list) });
  const renewalsQuery = useQuery({ queryKey: ["renewals"], queryFn: () => loggedRequest("renewals", renewals.list) });
  const queries = [records, summary, timeline, contractsQuery, obligationsQuery, renewalsQuery];
  const isLoading = queries.some((query) => query.isLoading);
  const firstError = queries.find((query) => query.isError)?.error;
  if (isLoading) return <main className="grid min-h-[50vh] place-items-center"><Loader2 className="size-8 animate-spin text-jade" /></main>;
  if (firstError) return <main className="mx-auto max-w-3xl px-5 py-16 text-center"><ShieldX className="mx-auto size-10 text-destructive" /><h1 className="mt-4 font-display text-xl font-semibold">Unable to load compliance data</h1><p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(firstError, "Please try again later.")}</p></main>;
  const items = records.data ?? [];
  const statusCounts = countBy(items, (item) => item.status);
  const riskCounts = countBy(items, (item) => item.risk_level);
  const departmentCounts = countBy(
    contractsQuery.data ?? [],
    (item) => item.department || "Unassigned",
  );
  const contractStatuses = countBy(contractsQuery.data ?? [], (item) => item.status);
  const obligationStatuses = countBy(obligationsQuery.data ?? [], (item) => item.status);
  const renewalStatuses = countBy(renewalsQuery.data ?? [], (item) => item.status);
  const cards = [
    { label: "High Risk", value: riskCounts["HIGH"]?? 0, icon: ShieldX, tone: "text-destructive" },
    {
      label: "Pending",
      value: items.reduce((sum, item) => sum + (item.pending ?? 0), 0),
      icon: Clock3,
      tone: "text-amber-600",
    },
    {
      label: "Compliant",
      value: summary.data?.compliant ?? 0,
      icon: CheckCircle2,
      tone: "text-jade",
    },
    {
      label: "Delayed",
      value: items.reduce((sum, item) => sum + item.overdue, 0),
      icon: AlertTriangle,
      tone: "text-amber-600",
    },
    {
      label: "Non-Compliant",
      value: summary.data?.non_compliant ?? 0,
      icon: ShieldX,
      tone: "text-destructive",
    },
  ];
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8 lg:px-8">
      <header>
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7 text-jade" />
          <h1 className="font-display text-2xl font-semibold">Compliance dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor contract risk, obligation health, and compliance history.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-card p-4 shadow-hairline">
            <card.icon className={`size-5 ${card.tone}`} />
            <p className="mt-4 text-xs text-muted-foreground">{card.label}</p>
            <p className="font-display text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-lg bg-card p-5 shadow-hairline">
        <h2 className="mb-4 font-display text-sm font-semibold">Contract risk</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.contract_id} className="rounded-md border border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.contract_title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.status}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${item.risk_level === "High" ? "bg-destructive/10 text-destructive" : item.risk_level === "Medium" ? "bg-amber-100 text-amber-700" : "bg-jade/10 text-jade"}`}
                >
                  {(item.risk_level || "Unknown").toUpperCase()}
                </span>
              </div>
              <p className="mt-4 font-display text-3xl font-semibold">{item.compliance_score}%</p>
              <p className="text-xs text-muted-foreground">Risk score</p>
            </div>
          ))}
        </div>
        {!items.length ? (
          <p className="text-sm text-muted-foreground">No compliance records yet.</p>
        ) : null}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Contract status">
          <Chart data={chartData(contractStatuses)} options={chartOptions} type="bar" />
        </ChartCard>
        <ChartCard title="Compliance status">
          <Chart data={chartData(statusCounts)} options={doughnutOptions} type="doughnut" />
        </ChartCard>
        <ChartCard title="Renewals">
          <Chart data={chartData(renewalStatuses)} options={chartOptions} type="bar" />
        </ChartCard>
        <ChartCard title="Obligations">
          <Chart data={chartData(obligationStatuses)} options={chartOptions} type="bar" />
        </ChartCard>
        <ChartCard title="Risk">
          <Chart data={chartData(riskCounts)} options={doughnutOptions} type="doughnut" />
        </ChartCard>
        <ChartCard title="Department">
          <Chart data={chartData(departmentCounts)} options={chartOptions} type="bar" />
        </ChartCard>
      </section>
      <section className="rounded-lg bg-card p-5 shadow-hairline">
        <h2 className="mb-5 font-display text-sm font-semibold">Compliance timeline</h2>
        {timeline.data?.length ? (
          <div className="space-y-3">
            {timeline.data.map((event, index) => (
              <div
                key={`${event.date}-${index}`}
                className="grid gap-2 border-l-2 border-jade/40 pl-4 text-sm sm:grid-cols-[120px_1fr_140px]"
              >
                <span className="text-muted-foreground">{event.date}</span>
                <span>{event.reason}</span>
                <span className="font-medium">{event.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No compliance history yet.</p>
        )}
      </section>
    </main>
  );
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
async function loggedRequest<T>(label: string, request: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    console.error(`Compliance request failed: ${label}`, error);
    throw error;
  }
}
function chartData(counts: Record<string, number>) {
  const labels = Object.keys(counts);
  return {
    labels,
    datasets: [
      {
        data: labels.map((label) => counts[label]),
        backgroundColor: labels.map((_, index) => colors[index % colors.length]),
        borderColor: "transparent",
      },
    ],
  };
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-card p-5 shadow-hairline">
      <h2 className="mb-4 font-display text-sm font-semibold">{title}</h2>
      <div className="h-64">{children}</div>
    </section>
  );
}
function Chart({ data, options, type }: { data: ReturnType<typeof chartData>; options: object; type: "bar" | "doughnut" }) {
  if (!data.labels?.length || !data.datasets?.[0]?.data?.length) return <div className="grid h-full place-items-center text-sm text-muted-foreground">No compliance data available</div>;
  if (type === "bar") return <Bar data={data} options={options} />;
  return <Doughnut data={data} options={options} />;
}
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" as const } },
};
