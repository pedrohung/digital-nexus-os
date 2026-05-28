import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Factory } from "lucide-react";
import { generateOmnichannelContentStream } from "@/lib/crown.functions";

export default function ContentStream() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(generateOmnichannelContentStream);
  const mutation = useMutation({
    mutationFn: (t: string) => fn({ data: { topic: t } }),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Factory className="h-4 w-4 text-primary" /> Full-Stack Content Factory
        </h3>
        <p className="text-xs text-muted-foreground">
          Genera y programa la matriz mensual: redes, blog SEO, newsletter y guion TikTok.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej. Lanzamiento de consultoría premium"
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary transition"
        />
        <button
          onClick={() => topic && mutation.mutate(topic)}
          disabled={mutation.isPending || !topic}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {mutation.isPending ? "Construyendo…" : "Fabricar"}
        </button>
      </div>

      {mutation.data && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-mono text-emerald-400">➔ PROGRAMADO (ventana óptima)</span>
          </div>
          {Object.entries(mutation.data.generated_assets as Record<string, string>).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background/40 p-3">
              <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{k.replace(/_/g, " ")}</p>
              <pre className="text-xs whitespace-pre-wrap font-sans text-foreground/90">{v}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
