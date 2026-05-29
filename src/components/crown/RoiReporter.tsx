import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3 } from "lucide-react";
import { generateExecutiveRoiReport } from "@/lib/reports.functions";

const PERIODS = ["Mayo 2026", "Q2 2026", "YTD 2026"];

export default function RoiReporter() {
  const [period, setPeriod] = useState(PERIODS[0]);
  const generate = useServerFn(generateExecutiveRoiReport);

  const mutation = useMutation({
    mutationFn: () => generate({ data: { period } }),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" /> Autonomous ROI Reporter
        </h3>
        <p className="text-xs text-muted-foreground">
          Consolida la atribución financiera en auditorías ejecutivas listas para el cliente.
        </p>
      </div>

      <div className="flex gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-semibold disabled:opacity-50 transition"
        >
          {mutation.isPending ? "Analizando inversión..." : "Compilar auditoría"}
        </button>
      </div>

      {mutation.data && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">Inversión</p>
              <p className="text-sm font-bold mt-1">${Number(mutation.data.total_spend).toLocaleString("en-US")}</p>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">Retorno</p>
              <p className="text-sm font-bold mt-1 text-emerald-400">${Number(mutation.data.revenue_generated).toLocaleString("en-US")}</p>
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3">
              <p className="text-[10px] uppercase font-mono text-muted-foreground">ROAS</p>
              <p className="text-sm font-bold mt-1 text-primary">{mutation.data.calculated_roas}x</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-background/40 p-3">
            <p className="text-[10px] uppercase font-mono text-muted-foreground mb-1.5">Resumen ejecutivo</p>
            <p className="text-xs leading-relaxed text-foreground/90">{mutation.data.executive_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
