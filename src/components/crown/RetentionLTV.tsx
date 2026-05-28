import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { calculateRetentionMetrics } from "@/lib/crown.functions";

export default function RetentionLTV() {
  const fn = useServerFn(calculateRetentionMetrics);
  const mutation = useMutation({ mutationFn: () => fn() });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Predictive Retention & LTV
          </h3>
          <p className="text-xs text-muted-foreground">
            Monitorea LTV real y predice fugas críticas antes de que ocurran.
          </p>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition disabled:opacity-50"
        >
          {mutation.isPending ? "Auditando…" : "Auditar"}
        </button>
      </div>

      {mutation.data ? (
        <div className="space-y-2">
          {mutation.data.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-border bg-background/40 p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium font-mono">{c.id}</p>
                <p className="text-xs text-muted-foreground">
                  LTV: <span className="font-mono">${c.ltv.toFixed(2)}</span>
                </p>
                <p className="text-xs mt-1 truncate">{c.action}</p>
              </div>
              <span
                className={`shrink-0 text-[10px] font-mono uppercase px-2 py-1 rounded border ${
                  c.risk > 50
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                Churn {c.risk}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-4 text-center">
          Haz clic en "Auditar" para procesar el comportamiento de clientes.
        </p>
      )}
    </div>
  );
}
