import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBusiness } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

interface FormState {
  name: string;
  industry: string;
  timezone: string;
  revenue_goal: string;
  primary_channel: string;
}

const STEPS = [
  { id: "business", title: "Tu negocio", desc: "Lo básico para personalizar todo." },
  { id: "goals", title: "Metas & canal", desc: "Para que el Co-Pilot priorice bien." },
  { id: "review", title: "Confirmación", desc: "Revisa y arranca." },
] as const;

const INDUSTRIES = [
  "Tecnología & Software",
  "Ciberseguridad",
  "IA & Automatización",
  "SaaS & Cloud",
  "E-commerce",
  "Servicios profesionales",
  "Consultoría IT",
  "Salud",
  "Educación",
  "Hospitalidad",
  "Otro"
];
const CHANNELS = ["google_ads", "meta", "tiktok", "seo_organico", "email", "referidos"];

function OnboardingPage() {
  const navigate = useNavigate();
  const createBiz = useServerFn(createBusiness);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    industry: INDUSTRIES[0]!,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    revenue_goal: "",
    primary_channel: CHANNELS[0]!,
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const canNext =
    (step === 0 && form.name.trim().length > 0 && form.industry) ||
    (step === 1 && form.primary_channel) ||
    step === 2;

  const finish = async () => {
    setLoading(true);
    try {
      await createBiz({
        data: {
          name: form.name.trim(),
          industry: form.industry,
          timezone: form.timezone,
          revenue_goal: form.revenue_goal ? Number(form.revenue_goal) : undefined,
          primary_channel: form.primary_channel,
        },
      });
      toast.success("¡Listo! Tu Growth OS está configurado.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  i < step ? "bg-success text-success-foreground" :
                  i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated">
          <h1 className="text-2xl font-bold">{STEPS[step]!.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{STEPS[step]!.desc}</p>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <>
                <Field label="Nombre del negocio">
                  <input
                    autoFocus value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    maxLength={120} placeholder="Mi Empresa S.A."
                    className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
                <Field label="Industria">
                  <select value={form.industry} onChange={(e) => update("industry", e.target.value)}
                    className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm">
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Zona horaria">
                  <input value={form.timezone} onChange={(e) => update("timezone", e.target.value)} maxLength={60}
                    className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm" />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Meta de ingresos mensual (USD)">
                  <input type="number" min={0} value={form.revenue_goal}
                    onChange={(e) => update("revenue_goal", e.target.value)}
                    placeholder="50000"
                    className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm" />
                </Field>
                <Field label="Canal principal de adquisición">
                  <select value={form.primary_channel} onChange={(e) => update("primary_channel", e.target.value)}
                    className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm">
                    {CHANNELS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </Field>
              </>
            )}

            {step === 2 && (
              <div className="space-y-2 text-sm">
                <SummaryRow label="Negocio" value={form.name} />
                <SummaryRow label="Industria" value={form.industry} />
                <SummaryRow label="Zona horaria" value={form.timezone} />
                <SummaryRow label="Meta mensual" value={form.revenue_goal ? `$${Number(form.revenue_goal).toLocaleString()}` : "—"} />
                <SummaryRow label="Canal principal" value={form.primary_channel.replace("_", " ")} />
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
              className="flex items-center gap-1 px-4 py-2 rounded-md text-sm hover:bg-accent/10 disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext}
                className="flex items-center gap-1 px-5 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
                Siguiente <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-brand text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
