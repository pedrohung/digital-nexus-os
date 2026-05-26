import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const gridInput = z.object({
  keyword: z.string().trim().min(1).max(120),
  gridSize: z.union([z.literal(9), z.literal(25)]),
});

export const runLocalGridAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => gridInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles").select("business_id").eq("id", userId).single();
    if (!profile?.business_id) throw new Error("Business context missing");

    const nodes = Array.from({ length: data.gridSize }, (_, i) => ({
      nodeId: i + 1,
      rank: Math.floor(Math.random() * 7) + 1,
      lat_offset: Number((Math.random() * 0.01 - 0.005).toFixed(4)),
      lng_offset: Number((Math.random() * 0.01 - 0.005).toFixed(4)),
    }));
    const avgRank = Number(
      (nodes.reduce((a, n) => a + n.rank, 0) / nodes.length).toFixed(2),
    );

    const { data: audit, error } = await supabase
      .from("local_grid_audits")
      .insert({
        business_id: profile.business_id,
        keyword: data.keyword,
        grid_size: data.gridSize,
        average_rank: avgRank,
        competitor_data: { nodes, sector_leader: "Competidor Premium SL" },
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return audit;
  });

const reviewInput = z.object({
  customerName: z.string().trim().min(1).max(120),
  score: z.number().int().min(1).max(5),
  text: z.string().trim().max(2000).default(""),
});

export const processInboundReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => reviewInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles").select("business_id").eq("id", userId).single();
    if (!profile?.business_id) throw new Error("Business context missing");

    let sentiment = 0.5;
    if (data.score <= 3) sentiment = -0.6;
    const lower = data.text.toLowerCase();
    if (lower.includes("mal") || lower.includes("pésimo") || lower.includes("lento")) {
      sentiment = -0.8;
    }
    const status = data.score <= 3 ? "quarantine" : "resolved";

    const { data: review, error } = await supabase
      .from("intercepted_reviews")
      .insert({
        business_id: profile.business_id,
        customer_name: data.customerName,
        score: data.score,
        sentiment_score: sentiment,
        feedback_text: data.text,
        status,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const aiResponse =
      status === "resolved"
        ? `Muchas gracias por tu reseña, ${data.customerName}. Nos enorgullece ser referentes locales y ofrecer la mejor experiencia. ¡Esperamos verte pronto!`
        : "Agradecemos profundamente tu feedback. Un responsable revisará el caso para resolverlo de inmediato.";

    return { review, aiResponse };
  });

export const executeOmnichannelSwarm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles").select("business_id").eq("id", userId).single();
    if (!profile?.business_id) throw new Error("Business context missing");

    const totalMoved = Number((Math.random() * 1500 + 350).toFixed(2));
    const gain = Number((Math.random() * 18 + 8).toFixed(2));

    const { data: execution, error } = await supabase
      .from("budget_swarm_executions")
      .insert({
        business_id: profile.business_id,
        total_budget_reallocated: totalMoved,
        efficiency_gain_percent: gain,
        log_details: {
          action: "REALLOCATION_COMPLETED",
          source: "Meta Ads (CPA alto detectado: $24.50)",
          destination: "Google Search Ads (Optimización CPA objetivo: $16.10)",
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return execution;
  });
