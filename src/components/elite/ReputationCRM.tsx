import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { processInboundReview } from "@/lib/elite.functions";
import { toast } from "sonner";

export default function ReputationCRM() {
  const [customerName, setCustomerName] = useState("");
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");
  const fn = useServerFn(processInboundReview);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { customerName, score, text } }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <header>
        <h3 className="text-base font-bold text-foreground">🛡️ Cortafuegos de Reputación + IA Semántica</h3>
        <p className="text-xs text-muted-foreground">Intercepta crisis antes de que impacten el algoritmo público.</p>
      </header>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Cliente</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary text-foreground"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Valoración</label>
            <select
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary text-foreground"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3 — alerta)</option>
              <option value={2}>⭐⭐ (2 — cuarentena)</option>
              <option value={1}>⭐ (1 — cuarentena)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Comentario</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Escribe la opinión aquí…"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary text-foreground resize-none"
          />
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !customerName.trim()}
          className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition disabled:opacity-40"
        >
          {mutation.isPending ? "Analizando semántica…" : "Procesar entrada"}
        </button>
      </div>

      {mutation.data && (
        <div className="pt-4 border-t border-border space-y-3 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className={`font-bold ${mutation.data.review.status === "quarantine" ? "text-rose-400" : "text-emerald-400"}`}>
              {mutation.data.review.status === "quarantine"
                ? "⛔ RETENIDO EN CUARENTENA"
                : "✅ VALIDADO Y PUBLICADO"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sentimiento:</span>
            <span className={Number(mutation.data.review.sentiment_score) < 0 ? "text-rose-400" : "text-emerald-400"}>
              {mutation.data.review.sentiment_score}
            </span>
          </div>
          <div className="bg-background/60 p-3 border border-border rounded-lg space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Respuesta sugerida por Nexus AI</p>
            <p className="text-foreground/90 leading-relaxed italic">"{mutation.data.aiResponse}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
