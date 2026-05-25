import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { TrendingUp, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import ROIReceipt from "@/components/roi/ROIReceipt";
import {
  simulateBudgetShift,
  listProjections,
  type SimulationResult,
} from "@/lib/predictive.functions";

export const Route = createFileRoute("/_authenticated/predictive")({
  component: PredictivePage,
});

const CHANNELS = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "linkedin", label: "LinkedIn Ads" },
];

function PredictivePage() {
  const [from, setFrom] = useState("meta");
  const [to, setTo] = useState("google");
  const [amount, setAmount] = useState(500);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulate = useServerFn(simulateBudgetShift);
  const fetchList = useServerFn(listProjections);
  const qc = useQueryClient();

  const history = useQuery({
    queryKey: ["projections"],
    queryFn: () => fetchList(),
  });

  const mutation = useMutation({
    mutationFn: () => simulate({ data: { from, to, amount } }),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["projections"] });
      toast.success("Simulación registrada");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="Simulador Predictivo"
        subtitle="Reasigna presupuesto entre canales y proyecta ROAS antes de ejecutar."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Configurar reasignación
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Canal origen</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1.5 w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Canal destino</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1.5 w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Presupuesto a transferir</span>
              <span className="text-foreground font-medium">${amount.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min={50}
              max={10000}
              step={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || from === to}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-sm transition disabled:opacity-50"
          >
            {mutation.isPending ? "Calculando…" : "Ejecutar simulación"}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/40 p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            Impacto esperado
          </div>
          <div className="text-5xl font-bold text-foreground tracking-tight">
            {result ? `$${result.estimatedROI.toLocaleString()}` : "—"}
          </div>
          {result && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">ROAS</div>
                <div className="text-foreground font-medium mt-0.5">{result.projectedROAS.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-muted-foreground">Confianza</div>
                <div className="text-foreground font-medium mt-0.5">{result.confidence.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Riesgo</div>
                <div className={`font-medium mt-0.5 uppercase ${
                  result.risk === "low" ? "text-emerald-400" : result.risk === "medium" ? "text-amber-400" : "text-rose-400"
                }`}>{result.risk}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <ROIReceipt
          projectionId={result.projectionId}
          estimated={result.estimatedROI}
          roas={result.projectedROAS}
          confidence={result.confidence}
        />
      )}

      <div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          Historial reciente
        </h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Movimiento</th>
                <th className="text-right px-4 py-2.5">Monto</th>
                <th className="text-right px-4 py-2.5">ROAS</th>
                <th className="text-right px-4 py-2.5">Confianza</th>
                <th className="text-right px-4 py-2.5">Riesgo</th>
                <th className="text-right px-4 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(history.data?.projections ?? []).length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Sin simulaciones todavía.</td></tr>
              ) : (
                history.data!.projections.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className="uppercase">{p.from_channel}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="uppercase">{p.to_channel}</span>
                      </span>
                    </td>
                    <td className="text-right px-4 py-2.5">${Number(p.budget_amount).toLocaleString()}</td>
                    <td className="text-right px-4 py-2.5">{Number(p.projected_roas).toFixed(2)}x</td>
                    <td className="text-right px-4 py-2.5">{Number(p.confidence).toFixed(0)}%</td>
                    <td className={`text-right px-4 py-2.5 uppercase text-xs ${
                      p.risk_level === "low" ? "text-emerald-400" : p.risk_level === "medium" ? "text-amber-400" : "text-rose-400"
                    }`}>{p.risk_level}</td>
                    <td className="text-right px-4 py-2.5 uppercase text-xs text-muted-foreground">{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
