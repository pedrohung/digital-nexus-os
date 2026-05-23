import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateBusinessSchema = z.object({
  name: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(80),
  timezone: z.string().trim().min(1).max(60).default("UTC"),
  revenue_goal: z.number().min(0).max(1_000_000_000).optional(),
  primary_channel: z.string().trim().min(1).max(40).optional(),
});

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateBusinessSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: business, error: bizErr } = await supabase
      .from("businesses")
      .insert({
        name: data.name,
        industry: data.industry,
        timezone: data.timezone,
        revenue_goal: data.revenue_goal ?? null,
        primary_channel: data.primary_channel ?? null,
      })
      .select()
      .single();

    if (bizErr || !business) {
      throw new Error(bizErr?.message ?? "No se pudo crear el negocio");
    }

    const { error: profErr } = await supabase
      .from("profiles")
      .update({ business_id: business.id, role: "owner", onboarded: true })
      .eq("id", userId);

    if (profErr) throw new Error(profErr.message);

    return { id: business.id, name: business.name };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, business_id, role, full_name, onboarded")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
