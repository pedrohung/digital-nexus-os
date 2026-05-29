import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Rocket, ExternalLink } from "lucide-react";
import { generateInstantLander, listInstantLanders } from "@/lib/landing.functions";

export default function InstantLander() {
  const [title, setTitle] = useState("");
  const [offer, setOffer] = useState("");
  const qc = useQueryClient();
  const generate = useServerFn(generateInstantLander);
  const list = useServerFn(listInstantLanders);

  const { data: landings } = useQuery({
    queryKey: ["instantLanders"],
    queryFn: () => list(),
  });

  const mutation = useMutation({
    mutationFn: () => generate({ data: { title, targetOffer: offer } }),
    onSuccess: () => {
      setTitle("");
      setOffer("");
      qc.invalidateQueries({ queryKey: ["instantLanders"] });
    },
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" /> Instant-Lander Engine
        </h3>
        <p className="text-xs text-muted-foreground">
          Compila páginas de aterrizaje optimizadas para conversión con score Lighthouse perfecto.
        </p>
      </div>

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ej: Oferta Exclusiva Mayo)"
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <textarea
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          rows={2}
          placeholder="Describe la oferta o gancho comercial..."
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary resize-none"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || title.length < 3 || offer.length < 3}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {mutation.isPending ? "Compilando estáticos..." : "Desplegar Landing Élite"}
        </button>
      </div>

      {mutation.data && (
        <div className="p-3 bg-background/40 border border-border rounded-md font-mono text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ruta:</span>
            <span className="text-emerald-400">/landing/{mutation.data.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Core Web Vitals:</span>
            <span className="text-emerald-400 font-bold">{mutation.data.performance_score}% Perfect</span>
          </div>
        </div>
      )}

      {landings && landings.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border">
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Últimas landings</p>
          {landings.slice(0, 4).map((l) => (
            <div key={l.id} className="flex items-center justify-between text-xs py-1">
              <span className="truncate">{l.title}</span>
              <span className="flex items-center gap-2 text-muted-foreground font-mono">
                {l.conversion_count} conv.
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
