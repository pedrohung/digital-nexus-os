import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, RefreshCw } from "lucide-react";
import { fetchCompetitorShadowIntel } from "@/lib/crown.functions";

export default function CompetitorShadow() {
  const fn = useServerFn(fetchCompetitorShadowIntel);
  const { data: logs, refetch, isFetching } = useQuery({
    queryKey: ["competitorShadow"],
    queryFn: () => fn(),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Shadow AI Competitor Monitor
          </h3>
          <p className="text-xs text-muted-foreground">
            Espionaje legal de ofertas, precios e indexación de competidores directos.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs font-mono hover:bg-accent transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "ESCANEANDO" : "ESCANEAR"}
        </button>
      </div>

      <div className="space-y-2">
        {logs?.map((log, i) => {
          const sev = log.severity_level;
          const sevClass =
            sev === "high"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : sev === "medium"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          return (
            <div key={i} className="rounded-lg border border-border bg-background/40 p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{log.competitor_name}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${sevClass}`}>
                  {sev}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cambio: <span className="font-mono">{log.detected_change_type.toUpperCase()}</span>
              </p>
              <p className="text-xs">
                {log.detected_change_type === "pricing"
                  ? `Bajada de $${(log.log_details as { old_price: number }).old_price} a $${(log.log_details as { new_price: number }).new_price}. ${(log.log_details as { action_required: string }).action_required}`
                  : log.detected_change_type === "keywords"
                    ? `Frase "${(log.log_details as { phrase: string }).phrase}" — ${(log.log_details as { position_gain: string }).position_gain}`
                    : `Nuevo backlink desde ${(log.log_details as { source: string }).source}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
