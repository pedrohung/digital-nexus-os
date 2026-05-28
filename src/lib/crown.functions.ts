import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fetchCompetitorShadowIntel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const businessId = context.claims?.business_id ?? null;

    const mockShadowLogs = [
      {
        competitor_name: "Competidor Directo Alfa",
        detected_change_type: "pricing" as const,
        severity_level: "high" as const,
        log_details: {
          product: "Servicio Premium",
          old_price: 120,
          new_price: 99,
          action_required: "Activar cupón de retención flash",
        },
      },
      {
        competitor_name: "Agencia Rival Beta",
        detected_change_type: "keywords" as const,
        severity_level: "medium" as const,
        log_details: {
          phrase: "consultoría marketing digital barcelona",
          position_gain: "+4 puestos en Google Maps",
        },
      },
      {
        competitor_name: "Player Local Gamma",
        detected_change_type: "backlink" as const,
        severity_level: "low" as const,
        log_details: {
          source: "blog.localnews.com",
          anchor: "mejor agencia 2026",
        },
      },
    ];

    // Persist the highest-severity log for audit history (RLS scopes to business)
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .maybeSingle();

    const bizId = profile?.business_id ?? businessId;
    if (bizId) {
      await supabase.from("competitor_shadow_logs").insert({
        business_id: bizId,
        competitor_name: mockShadowLogs[0].competitor_name,
        detected_change_type: mockShadowLogs[0].detected_change_type,
        severity_level: mockShadowLogs[0].severity_level,
        log_details: mockShadowLogs[0].log_details,
      });
    }

    return mockShadowLogs;
  });

export const generateOmnichannelContentStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        topic: z.string().trim().min(3).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .maybeSingle();

    if (!profile?.business_id) throw new Error("Business context missing");

    const assets = {
      meta_copy: `🔥 ¿Cansado de estrategias que no convierten? Hablamos sobre ${data.topic}. Descubre el secreto del 2% élite.`,
      seo_blog_post: `# El impacto definitivo de ${data.topic} en la rentabilidad de tu negocio\n\nArtículo optimizado para indexación inmediata en buscadores locales, con estructura H1/H2, schema FAQ y CTA de conversión.`,
      newsletter: `Asunto: Lo que nadie te cuenta sobre ${data.topic}\n\nHola [Name], hoy desglosamos la métrica cuantitativa de ${data.topic}...`,
      tiktok_script: `Hook (0-3s): "Esto cambiará tu visión sobre ${data.topic}". Desarrollo (3-25s): 3 datos shock. CTA: "Comenta NEXUS para la guía completa".`,
    };

    const { data: stream, error } = await supabase
      .from("content_streams")
      .insert({
        business_id: profile.business_id,
        campaign_core_topic: data.topic,
        generated_assets: assets,
        distribution_status: "scheduled",
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return stream;
  });

export const calculateRetentionMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .maybeSingle();

    if (!profile?.business_id) throw new Error("Business context missing");

    const clients = [
      {
        id: "c_1",
        ltv: 4500.5,
        risk: 82.4,
        action: "Enviar oferta de reactivación vía WhatsApp Core",
      },
      {
        id: "c_2",
        ltv: 12300.0,
        risk: 12.1,
        action: "Incentivar sistema de reseñas de 5 estrellas",
      },
      {
        id: "c_3",
        ltv: 780.0,
        risk: 58.7,
        action: "Cross-sell: ofrecer paquete complementario con 15% off",
      },
    ];

    for (const c of clients) {
      await supabase.from("customer_ltv_retention").upsert(
        {
          business_id: profile.business_id,
          customer_identifier: c.id,
          calculated_ltv: c.ltv,
          churn_risk_percent: c.risk,
          next_best_action: c.action,
        },
        { onConflict: "business_id,customer_identifier" },
      );
    }

    return clients;
  });
