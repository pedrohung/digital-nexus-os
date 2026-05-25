import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { Settings as SettingsIcon, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const getBusinessIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, full_name, role")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.business_id) {
      return { businessId: null, businessName: null, role: profile?.role ?? "viewer" };
    }
    const { data: biz } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", profile.business_id)
      .maybeSingle();
    return {
      businessId: profile.business_id as string,
      businessName: biz?.name ?? null,
      role: profile.role as string,
    };
  });

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const fetchIdentity = useServerFn(getBusinessIdentity);
  const identity = useQuery({ queryKey: ["business-identity"], queryFn: () => fetchIdentity() });
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!identity.data?.businessId) return;
    await navigator.clipboard.writeText(identity.data.businessId);
    setCopied(true);
    toast.success("ID copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <PageHeader title="Ajustes" subtitle="Identidad del negocio, integraciones y equipo." />

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Identidad del negocio</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Este es el identificador único de tu negocio. Compártelo con tu agencia si quieren
          vincular tu cuenta a su panel.
        </p>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Business ID
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm font-mono break-all">
              {identity.isLoading ? "Cargando…" : identity.data?.businessId ?? "Sin negocio vinculado"}
            </code>
            <button
              onClick={copy}
              disabled={!identity.data?.businessId}
              className="px-3 py-2 border border-input rounded-md hover:bg-accent text-sm transition disabled:opacity-50"
              aria-label="Copiar"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {identity.data?.businessName && (
          <div className="text-xs text-muted-foreground">
            Negocio: <span className="text-foreground">{identity.data.businessName}</span> · Rol:{" "}
            <span className="text-foreground uppercase">{identity.data.role}</span>
          </div>
        )}
        <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Tu sesión está aislada por <strong className="text-foreground">Row Level Security</strong>:
            ningún otro usuario puede leer ni modificar los datos de tu negocio, incluso si conoce tu ID.
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Integraciones</h2>
        <p className="text-sm text-muted-foreground">
          Próximamente: conexión OAuth por cliente con Google Search Console, Meta Ads, Google Ads, TikTok y Shopify.
        </p>
        <div className="text-xs text-muted-foreground">
          Cada cliente conecta sus propias cuentas. Las credenciales se guardan cifradas y
          aisladas por <code className="text-foreground">business_id</code>.
        </div>
      </section>
    </div>
  );
}
