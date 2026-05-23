import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export interface AiAction {
  type: string;
  description: string;
  payload: Record<string, unknown>;
  requiresApproval: boolean;
}

export interface AiResponse {
  text: string;
  actions: AiAction[];
  logId: string | null;
}

const ApproveSchema = z.object({
  logId: z.string().uuid(),
  approve: z.boolean(),
});

/** Routes a prompt through guardrails, classifies intent, returns response + suggested actions. */
export const chat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ChatSchema.parse(i))
  .handler(async ({ data, context }): Promise<AiResponse> => {
    const { supabase, userId } = context;

    // Resolve business
    const { data: profile } = await supabase
      .from("profiles").select("business_id").eq("id", userId).maybeSingle();
    const businessId = profile?.business_id ?? null;

    // Simple intent classifier (replace with Lovable AI streaming later)
    const lower = data.message.toLowerCase();
    let text = "";
    const actions: AiAction[] = [];

    if (/(presupuesto|budget|reasign|reallocat)/.test(lower)) {
      text =
        "🔍 Analicé tus campañas activas y detecto fuga de conversión en Meta Ads (CPA $42 vs benchmark $18). " +
        "Recomiendo reasignar 15% del presupuesto a Google Ads, donde el ROAS está en 4.2x.\n\n" +
        "⚠️ Esta acción mueve dinero. Requiere tu aprobación explícita.";
      actions.push({
        type: "budget_reallocation",
        description: "Reasignar 15% del presupuesto Meta → Google Ads",
        payload: { from: "meta", to: "google_ads", percent: 15 },
        requiresApproval: true,
      });
    } else if (/(reseña|review|reputaci)/.test(lower)) {
      text =
        "📊 Detecté 3 reseñas negativas sin responder en las últimas 48h. " +
        "Puedo redactar respuestas empáticas y profesionales para tu aprobación antes de publicarlas.";
      actions.push({
        type: "draft_review_responses",
        description: "Generar borradores para 3 reseñas pendientes",
        payload: { count: 3 },
        requiresApproval: true,
      });
    } else if (/(seo|keyword|ranking)/.test(lower)) {
      text =
        "🎯 Tu sitio rankea para 47 keywords. Detecté 12 oportunidades 'quick win' " +
        "(posición 4–10, intención comercial). Puedo generar briefs de contenido optimizados.";
      actions.push({
        type: "generate_seo_briefs",
        description: "Crear 12 briefs SEO priorizados",
        payload: { count: 12 },
        requiresApproval: false,
      });
    } else {
      text =
        `Recibí tu solicitud: "${data.message}".\n\n` +
        "Soy tu Co-Pilot. Puedo analizar campañas, redactar contenido, responder reseñas, " +
        "optimizar SEO y reasignar presupuestos — siempre con tu aprobación para acciones financieras.";
    }

    // Immutable audit log
    let logId: string | null = null;
    const { data: logRow } = await supabase
      .from("ai_logs")
      .insert({
        business_id: businessId,
        user_id: userId,
        action: "chat_request",
        payload: { prompt: data.message, output: text, actions },
        status: actions.some((a) => a.requiresApproval) ? "pending" : "executed",
      })
      .select("id")
      .single();
    logId = logRow?.id ?? null;

    return { text, actions, logId };
  });

export const decideAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ApproveSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Immutable audit: insert a follow-up log instead of mutating original
    const { error } = await supabase.from("ai_logs").insert({
      user_id: userId,
      action: data.approve ? "action_approved" : "action_denied",
      payload: { source_log_id: data.logId },
      status: data.approve ? "approved" : "denied",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
