import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AgencyConfig {
  white_label_enabled: boolean;
  custom_domain: string | null;
  logo_url: string | null;
  primary_color: string;
}

export interface ClientMapping {
  id: string;
  client_business_id: string;
  client_label: string | null;
  billing_split: number;
  status: string;
}

const ConfigSchema = z.object({
  enabled: z.boolean(),
  domain: z.string().trim().max(255).optional().nullable(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logo_url: z.string().trim().url().max(500).optional().nullable(),
});

const AddClientSchema = z.object({
  client_business_id: z.string().uuid(),
  client_label: z.string().trim().min(1).max(120).optional(),
  billing_split: z.number().min(0).max(100).optional(),
});

const RemoveClientSchema = z.object({ id: z.string().uuid() });

async function resolveBusinessId(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.business_id) throw new Error("No business context. Complete onboarding first.");
  return data.business_id as string;
}

export const getAgencyOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ config: AgencyConfig; clients: ClientMapping[] }> => {
    const { supabase, userId } = context;
    const businessId = await resolveBusinessId(supabase, userId);

    const [{ data: cfg }, { data: clients }] = await Promise.all([
      supabase
        .from("agency_configs")
        .select("white_label_enabled, custom_domain, logo_url, primary_color")
        .eq("agency_business_id", businessId)
        .maybeSingle(),
      supabase
        .from("client_mappings")
        .select("id, client_business_id, client_label, billing_split, status")
        .eq("agency_business_id", businessId)
        .order("created_at", { ascending: false }),
    ]);

    return {
      config: (cfg as AgencyConfig | null) ?? {
        white_label_enabled: false,
        custom_domain: null,
        logo_url: null,
        primary_color: "#3B82F6",
      },
      clients: (clients ?? []) as ClientMapping[],
    };
  });

export const updateAgencyConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ConfigSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const businessId = await resolveBusinessId(supabase, userId);

    const { error } = await supabase.from("agency_configs").upsert(
      {
        agency_business_id: businessId,
        white_label_enabled: data.enabled,
        custom_domain: data.domain || null,
        primary_color: data.color || "#3B82F6",
        logo_url: data.logo_url || null,
      },
      { onConflict: "agency_business_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const addClientMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AddClientSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const businessId = await resolveBusinessId(supabase, userId);
    if (data.client_business_id === businessId) {
      throw new Error("Cannot link an agency to itself");
    }
    const { error } = await supabase.from("client_mappings").insert({
      agency_business_id: businessId,
      client_business_id: data.client_business_id,
      client_label: data.client_label ?? null,
      billing_split: data.billing_split ?? 70,
    });
    if (error) throw error;
    return { ok: true };
  });

export const removeClientMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RemoveClientSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("client_mappings").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
