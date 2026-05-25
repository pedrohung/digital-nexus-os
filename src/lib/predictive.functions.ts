import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SimulationResult {
  projectionId: string;
  projectedROAS: number;
  estimatedROI: number;
  confidence: number;
  risk: "low" | "medium" | "high";
}

export interface ProjectionRow {
  id: string;
  from_channel: string;
  to_channel: string;
  budget_amount: number;
  projected_roas: number;
  confidence: number;
  risk_level: string;
  status: string;
  created_at: string;
}

const ChannelEnum = z.enum(["meta", "google", "tiktok", "linkedin"]);

const SimSchema = z.object({
  from: ChannelEnum,
  to: ChannelEnum,
  amount: z.number().min(10).max(1_000_000),
});

async function resolveBusinessId(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.business_id) throw new Error("No business context. Complete onboarding first.");
  return data.business_id as string;
}

// Channel baseline ROAS (deterministic, then small bounded volatility)
const BASE_ROAS: Record<string, number> = {
  google: 3.8,
  meta: 3.1,
  tiktok: 2.4,
  linkedin: 2.2,
};

export const simulateBudgetShift = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SimSchema.parse(d))
  .handler(async ({ data, context }): Promise<SimulationResult> => {
    const { supabase, userId } = context;
    const businessId = await resolveBusinessId(supabase, userId);

    if (data.from === data.to) throw new Error("Origin and destination must differ");

    const base = BASE_ROAS[data.to] ?? 2.5;
    const volatility = 0.12;
    const projectedROAS = Math.max(1.0, base + (Math.random() * volatility * 2 - volatility));
    // Confidence decays with budget size (larger bets = more uncertainty)
    const sizePenalty = Math.min(25, Math.log10(Math.max(10, data.amount)) * 6);
    const confidence = Math.max(55, 95 - sizePenalty);
    const risk: "low" | "medium" | "high" =
      confidence >= 80 ? "low" : confidence >= 65 ? "medium" : "high";

    const { data: proj, error: projErr } = await supabase
      .from("projections")
      .insert({
        business_id: businessId,
        from_channel: data.from,
        to_channel: data.to,
        budget_amount: data.amount,
        projected_roas: Number(projectedROAS.toFixed(2)),
        confidence: Number(confidence.toFixed(2)),
        risk_level: risk,
        status: "pending",
      })
      .select("id, projected_roas, confidence, risk_level")
      .single();
    if (projErr || !proj) throw projErr ?? new Error("Failed to create projection");

    const estimatedImpact = Number((data.amount * projectedROAS).toFixed(2));

    const { error: roiErr } = await supabase.from("roi_receipts").insert({
      business_id: businessId,
      projection_id: proj.id,
      estimated_impact: estimatedImpact,
      status: "estimated",
    });
    if (roiErr) throw roiErr;

    return {
      projectionId: proj.id,
      projectedROAS: Number(proj.projected_roas),
      estimatedROI: estimatedImpact,
      confidence: Number(proj.confidence),
      risk,
    };
  });

export const listProjections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ projections: ProjectionRow[] }> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("projections")
      .select("id, from_channel, to_channel, budget_amount, projected_roas, confidence, risk_level, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return { projections: (data ?? []) as ProjectionRow[] };
  });
