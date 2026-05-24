import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SeoKeyword {
  id: string;
  keyword: string;
  position: number | null;
  previous_position: number | null;
  search_volume: number | null;
  difficulty: number | null;
  target_url: string | null;
  intent: string | null;
  last_checked_at: string | null;
}

export interface SeoSummary {
  total: number;
  topTen: number;
  quickWins: number; // positions 4–10
  avgPosition: number;
  improving: number;
  declining: number;
}

const AddSchema = z.object({
  keyword: z.string().trim().min(2).max(120),
  target_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]).optional(),
});

const DeleteSchema = z.object({ id: z.string().uuid() });

async function resolveBusiness(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("business_id").eq("id", userId).maybeSingle();
  return data?.business_id ?? null;
}

export const listKeywords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ keywords: SeoKeyword[]; summary: SeoSummary }> => {
    const { supabase } = context;
    const { data } = await supabase
      .from("seo_keywords")
      .select("id, keyword, position, previous_position, search_volume, difficulty, target_url, intent, last_checked_at")
      .order("position", { ascending: true, nullsFirst: false });

    const keywords: SeoKeyword[] = (data ?? []) as SeoKeyword[];
    const ranked = keywords.filter((k) => k.position != null);
    const summary: SeoSummary = {
      total: keywords.length,
      topTen: ranked.filter((k) => (k.position ?? 999) <= 10).length,
      quickWins: ranked.filter((k) => (k.position ?? 999) >= 4 && (k.position ?? 999) <= 10).length,
      avgPosition: ranked.length
        ? Math.round((ranked.reduce((s, k) => s + (k.position ?? 0), 0) / ranked.length) * 10) / 10
        : 0,
      improving: keywords.filter((k) => k.position != null && k.previous_position != null && k.position < k.previous_position).length,
      declining: keywords.filter((k) => k.position != null && k.previous_position != null && k.position > k.previous_position).length,
    };
    return { keywords, summary };
  });

export const addKeyword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => AddSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const businessId = await resolveBusiness(supabase, userId);
    if (!businessId) throw new Error("Completa el onboarding antes de añadir keywords.");

    // Deterministic mock metrics (TODO: replace with Google Search Console + SERP scrape)
    const seed = Array.from(data.keyword).reduce((s, c) => s + c.charCodeAt(0), 0);
    const mockPosition = (seed % 40) + 1;
    const mockVolume = ((seed * 37) % 9500) + 100;
    const mockDifficulty = (seed % 80) + 10;

    const { error } = await supabase.from("seo_keywords").insert({
      business_id: businessId,
      keyword: data.keyword.toLowerCase(),
      target_url: data.target_url || null,
      intent: data.intent ?? "informational",
      position: mockPosition,
      previous_position: mockPosition + ((seed % 7) - 3),
      search_volume: mockVolume,
      difficulty: mockDifficulty,
      last_checked_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteKeyword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => DeleteSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("seo_keywords").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
