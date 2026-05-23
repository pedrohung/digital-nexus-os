import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Send, ShieldCheck, User, X } from "lucide-react";
import { toast } from "sonner";
import { chat, decideAction, type AiAction } from "@/lib/ai.functions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  actions?: AiAction[];
  logId?: string | null;
}

const SUGGESTIONS = [
  "Reasigna $200 a la campaña con mejor ROAS",
  "Resume las reseñas negativas de esta semana",
  "Encuentra 10 keywords SEO con quick win",
];

export function AIChat() {
  const chatFn = useServerFn(chat);
  const decideFn = useServerFn(decideAction);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy tu Co-Pilot NEXUS360. Puedo analizar tu marketing y proponer acciones. Las decisiones financieras siempre pasan por tu aprobación.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = (await chatFn({ data: { message: text } })) as { text: string; actions: AiAction[]; logId: string | null };
      setMessages((m) => [...m, { role: "assistant", content: res.text, actions: res.actions, logId: res.logId }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "system", content: `⚠️ ${err instanceof Error ? err.message : "Error procesando solicitud"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (logId: string | null, approve: boolean, type: string) => {
    if (!logId) return;
    try {
      await decideFn({ data: { logId, approve } });
      toast.success(approve ? `Acción "${type}" aprobada y registrada` : `Acción "${type}" denegada`);
      setMessages((m) => [
        ...m,
        { role: "system", content: approve ? `✅ Acción "${type}" aprobada.` : `❌ Acción "${type}" denegada.` },
      ]);
    } catch {
      toast.error("No se pudo registrar la decisión");
    }
  };

  return (
    <div className="flex flex-col h-[680px] bg-card border border-border rounded-xl overflow-hidden shadow-elevated">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm">Co-Pilot</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Guardrails activos
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role !== "user" && (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                {m.role === "system" ? <ShieldCheck className="h-4 w-4 text-warning" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : m.role === "system"
                  ? "bg-warning/10 text-warning border border-warning/30"
                  : "bg-muted"
              }`}
            >
              <p>{m.content}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.actions.map((a, idx) => (
                    <div key={idx} className="rounded-md bg-background/50 border border-border p-2">
                      <p className="text-xs font-medium">{a.description}</p>
                      {a.requiresApproval ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => decide(m.logId ?? null, true, a.type)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-success text-success-foreground hover:opacity-90"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => decide(m.logId ?? null, false, a.type)}
                            className="flex-1 text-xs px-2 py-1 rounded bg-muted hover:bg-destructive/20 flex items-center justify-center gap-1"
                          >
                            <X className="h-3 w-3" /> Denegar
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-1">Acción segura — ejecutada automáticamente.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Analizando…
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="p-3 border-t border-border flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: Reasigna $200 a la campaña con mejor ROAS…"
          disabled={loading}
          className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
