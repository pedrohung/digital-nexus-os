import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface DashboardKpis {
  hasBusiness: boolean;
  businessName: string | null;
  investment: number;
  leads: number;
  sales: number;
  margin: number;
  reviewsAvg: number;
  reviewsCount: number;
  integrationsActive: number;
  integrationsTotal: number;
  trend: { date: string; investment: number; sales: number }[];
}

export const getDashboardKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardKpis> => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, businesses(name)")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.business_id) {
      return {
        hasBusiness: false, businessName: null,
        investment: 0, leads: 0, sales: 0, margin: 0,
        reviewsAvg: 0, reviewsCount: 0,
        integrationsActive: 0, integrationsTotal: 0,
        trend: [],
      };
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().slice(0, 10);

    const [metricsRes, reviewsRes, integrationsRes] = await Promise.all([
      supabase.from("metrics").select("metric_key, metric_value, date").gte("date", sinceStr),
      supabase.from("reviews").select("rating"),
      supabase.from("integrations").select("status"),
    ]);

    const metrics = metricsRes.data ?? [];
    const sum = (key: string) =>
      metrics.filter((m) => m.metric_key === key).reduce((s, m) => s + Number(m.metric_value ?? 0), 0);

    const investment = sum("investment");
    const leads = sum("leads");
    const sales = sum("sales");
    const margin = sales - investment;

    const reviews = reviewsRes.data ?? [];
    const reviewsAvg = reviews.length
      ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
      : 0;

    const integrations = integrationsRes.data ?? [];
    const integrationsActive = integrations.filter((i) => i.status === "active").length;

    // Build 30-day trend (zero-fill)
    const trendMap = new Map<string, { investment: number; sales: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap.set(d.toISOString().slice(0, 10), { investment: 0, sales: 0 });
    }
    for (const m of metrics) {
      const entry = trendMap.get(m.date);
      if (!entry) continue;
      if (m.metric_key === "investment") entry.investment += Number(m.metric_value ?? 0);
      if (m.metric_key === "sales") entry.sales += Number(m.metric_value ?? 0);
    }

    return {
      hasBusiness: true,
      businessName: (profile.businesses as unknown as { name: string } | null)?.name ?? null,
      investment, leads, sales, margin,
      reviewsAvg, reviewsCount: reviews.length,
      integrationsActive, integrationsTotal: integrations.length,
      trend: Array.from(trendMap.entries()).map(([date, v]) => ({ date, ...v })),
    };
  });
