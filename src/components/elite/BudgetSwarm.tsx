import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { executeOmnichannelSwarm } from "@/lib/elite.functions";
import { toast } from "sonner";

export default function BudgetSwarm() {
  const fn = useServerFn(executeOmnichannelSwarm);
  const mutation = useMutation({
    mutationFn: () => fn(),
    onError: (e: Error) => toast.error(e.message),
  });

  const log = mutation.data?.log_details as
    | { source?: string; destination?: string; action?: string }
    | undefined;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">⚡ Omnichannel Budget Swarm</h3>
          <p className="text-xs text-muted-foreground">Arbitraje algorítmico de CPA entre Meta y Google.</p>
        </div>
        <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          AUTÓNOMO
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/60 border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Capital activo</p>
          <p className="text-xl font-mono text-foreground">$3,420.00</p>
        </div>
        <div className="bg-background/60 border border-border rounded-lg p-3">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Eficiencia MTD</p>
          <p className="text-xl font-mono text-emerald-400">+14.2%</p>
        </div>
      </div>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-600/10 disabled:opacity-40"
      >
        {mutation.isPending ? "Ejecutando enjambre…" : "Forzar re-balanceo de presupuesto"}
      </button>

      {mutation.data && (
        <div className="pt-4 border-t border-border space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">LOG RE-ROUTING</span>
            <span className="text-emerald-400 font-bold">SUCCESS</span>
          </div>
          <p className="text-foreground">
            Transferido: <span className="text-emerald-400">${mutation.data.total_budget_reallocated}</span> USD
          </p>
          <p className="text-foreground">
            Ahorro CPA: <span className="text-emerald-400">+{mutation.data.efficiency_gain_percent}%</span>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {log?.source} ➔ {log?.destination}
          </p>
        </div>
      )}
    </div>
  );
}
