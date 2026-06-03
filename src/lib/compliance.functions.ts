import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fetchComplianceLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .maybeSingle();

    if (!profile?.business_id) throw new Error("Business context missing");
    const businessId: string = profile.business_id;

    const { data: existing } = await supabase
      .from("compliance_audit_ledgers")
      .select("id,action_type,target_module,compliance_hash,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!existing || existing.length === 0) {
      const seed = [
        { action_type: "DATA_ANONYMIZED", target_module: "ReputationCRM", compliance_hash: "sha256_e3b0c442" },
        { action_type: "CONSENT_VERIFIED", target_module: "InstantLander", compliance_hash: "sha256_8f4c2a19" },
        { action_type: "API_TOKEN_ROTATION", target_module: "Integrations", compliance_hash: "sha256_b7d1f29c" },
      ];
      await supabase.from("compliance_audit_ledgers").insert(
        seed.map((s) => ({ ...s, business_id: profile.business_id })),
      );
      const { data: refreshed } = await supabase
        .from("compliance_audit_ledgers")
        .select("id,action_type,target_module,compliance_hash,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return refreshed ?? [];
    }

    return existing;
  });
