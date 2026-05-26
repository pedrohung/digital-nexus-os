import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { runLocalGridAudit } from "@/lib/elite.functions";
import { toast } from "sonner";

interface GridNode {
  nodeId: number;
  rank: number;
  lat_offset: number;
  lng_offset: number;
}

export default function LocalSEOAudit() {
  const [keyword, setKeyword] = useState("");
  const [gridSize, setGridSize] = useState<9 | 25>(9);
  const fn = useServerFn(runLocalGridAudit);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { keyword, gridSize } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const nodes = (mutation.data?.competitor_data as { nodes?: GridNode[]; sector_leader?: string } | null)?.nodes ?? [];
  const leader = (mutation.data?.competitor_data as { sector_leader?: string } | null)?.sector_leader ?? "—";
  const cols = gridSize === 9 ? "grid-cols-3" : "grid-cols-5";

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <header>
        <h3 className="text-base font-bold text-foreground">🎯 Local SEO Geo-Hijack Simulator</h3>
        <p className="text-xs text-muted-foreground">Escanea visibilidad geográfica real con matrices 3×3 o 5×5.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ej. Taller mecánico centro"
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono outline-none focus:border-primary transition"
        />
        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value) as 9 | 25)}
          className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-primary text-foreground"
        >
          <option value={9}>Matriz 3×3 (9 nodos)</option>
          <option value={25}>Matriz 5×5 (25 nodos)</option>
        </select>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !keyword.trim()}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition disabled:opacity-40"
        >
          {mutation.isPending ? "Escaneando…" : "Ejecutar asalto geo-local"}
        </button>
      </div>

      {mutation.data && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/60 border border-border rounded-lg p-3">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Average Local Rank</p>
              <p className="text-2xl font-mono text-primary">#{mutation.data.average_rank}</p>
            </div>
            <div className="bg-background/60 border border-border rounded-lg p-3">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Líder del sector</p>
              <p className="text-sm font-mono text-foreground truncate">{leader}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-semibold">Cobertura de grid</p>
          <div className={`grid ${cols} gap-1.5`}>
            {nodes.map((n) => {
              const tone =
                n.rank <= 3
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : n.rank <= 6
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-400";
              return (
                <div
                  key={n.nodeId}
                  className={`aspect-square flex flex-col items-center justify-center rounded border font-mono text-[10px] ${tone}`}
                >
                  <span className="opacity-60">N{n.nodeId}</span>
                  <span className="text-sm font-bold">#{n.rank}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
