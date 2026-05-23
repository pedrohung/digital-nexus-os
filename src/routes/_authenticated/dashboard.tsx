import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ArrowRight, DollarSign, Target, ShoppingBag, TrendingUp, Star, Plug } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getDashboardKpis } from "@/lib/dashboard.functions";
import { PageHeader } from "@/components/layout/PageHeader";

const dashboardQO = queryOptions({
  queryKey: ["dashboard-kpis"],
  queryFn: () => getDashboardKpis(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQO),
  component: DashboardPage,
});

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Inversión → Leads → Ventas → Margen. Tu negocio en una pantalla."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </div>
  );
}

function DashboardBody() {
  const { data } = useSuspenseQuery(dashboardQO);

  if (!data.hasBusiness) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-elevated">
        <h2 className="text-xl font-semibold">Configura tu negocio en 2 minutos</h2>
        <p className="text-muted-foreground text-sm mt-2">Completa el onboarding para empezar a ver tus KPIs.</p>
        <Link to="/onboarding"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
          Iniciar onboarding <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: "Inversión 30d", value: formatMoney(data.investment), icon: DollarSign, tint: "text-primary" },
    { label: "Leads 30d", value: data.leads.toLocaleString("es-MX"), icon: Target, tint: "text-accent" },
    { label: "Ventas 30d", value: formatMoney(data.sales), icon: ShoppingBag, tint: "text-success" },
    {
      label: "Margen 30d", value: formatMoney(data.margin), icon: TrendingUp,
      tint: data.margin >= 0 ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5 shadow-elevated">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
                <Icon className={`h-4 w-4 ${k.tint}`} />
              </div>
              <p className="text-2xl font-bold mt-2">{k.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-elevated">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Tendencia 30 días</h2>
            <p className="text-xs text-muted-foreground">Inversión vs Ventas</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 260)" />
              <XAxis dataKey="date" stroke="oklch(0.68 0.02 255)" fontSize={11}
                tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="oklch(0.68 0.02 255)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid oklch(0.30 0.02 260)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="investment" stroke="oklch(0.72 0.18 240)" strokeWidth={2} dot={false} name="Inversión" />
              <Line type="monotone" dataKey="sales" stroke="oklch(0.78 0.16 165)" strokeWidth={2} dot={false} name="Ventas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-elevated">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-warning" />
            <div>
              <p className="font-semibold">Reputación</p>
              <p className="text-xs text-muted-foreground">{data.reviewsCount} reseñas analizadas</p>
            </div>
          </div>
          <p className="text-3xl font-bold mt-3">
            {data.reviewsAvg ? data.reviewsAvg.toFixed(1) : "—"}
            <span className="text-sm text-muted-foreground font-normal"> / 5</span>
          </p>
          <Link to="/reputation" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Ver módulo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-elevated">
          <div className="flex items-center gap-3">
            <Plug className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Integraciones</p>
              <p className="text-xs text-muted-foreground">{data.integrationsActive} de {data.integrationsTotal} activas</p>
            </div>
          </div>
          <p className="text-3xl font-bold mt-3">
            {data.integrationsActive}
            <span className="text-sm text-muted-foreground font-normal">/{data.integrationsTotal || 6}</span>
          </p>
          <Link to="/settings" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Conectar plataformas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 h-24 animate-pulse" />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 h-80 animate-pulse" />
    </div>
  );
}
