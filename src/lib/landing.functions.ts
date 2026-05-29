import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateInstantLander = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().trim().min(3).max(120),
        targetOffer: z.string().trim().min(3).max(500),
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

    const baseSlug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${data.title}</title><style>body{font-family:system-ui,sans-serif;margin:0;background:#0B0F19;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}.card{max-width:560px;text-align:center}h1{font-size:2rem;margin:0 0 16px}p{opacity:.8;line-height:1.6}a{display:inline-block;margin-top:24px;background:#3B82F6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600}</style></head><body><div class="card"><h1>${data.title}</h1><p>${data.targetOffer}</p><a href="#cta">Obtener Oferta</a></div></body></html>`;

    const { data: landing, error } = await supabase
      .from("marketing_landings")
      .insert({
        business_id: profile.business_id,
        title: data.title,
        slug: uniqueSlug,
        html_content: html,
        target_offer: data.targetOffer,
        performance_score: 100,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return landing;
  });

export const listInstantLanders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("marketing_landings")
      .select("id,title,slug,performance_score,conversion_count,created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
