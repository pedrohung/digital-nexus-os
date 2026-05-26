import { useState } from "react";

interface PitchReport {
  score: number;
  lostRevenue: number;
  leaks: string[];
}

export default function DealCloserPitch() {
  const [targetUrl, setTargetUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<PitchReport | null>(null);

  const processPitch = () => {
    if (!targetUrl.trim()) return;
    setIsGenerating(true);
    setReport(null);
    setTimeout(() => {
      setReport({
        score: Math.floor(Math.random() * 35) + 30,
        lostRevenue: Number((Math.random() * 3000 + 2100).toFixed(2)),
        leaks: [
          "Ficha de Google Maps sin indexar en 4 coordenadas clave de la ciudad.",
          "7 reseñas críticas sin respuesta semántica en los últimos 30 días.",
          "Fuga de presupuesto Meta por solapamiento de audiencias locales.",
        ],
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <header>
        <h3 className="text-base font-bold text-foreground">🏢 White-Label Deal Closer</h3>
        <p className="text-xs text-muted-foreground">Auditoría de captación para agencias. Pitch listo en 2s.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="www.negociocompetidor.com"
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm font-mono outline-none focus:border-primary text-foreground"
        />
        <button
          onClick={processPitch}
          disabled={isGenerating || !targetUrl.trim()}
          className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition disabled:opacity-40"
        >
          {isGenerating ? "Auditando…" : "Generar pitch"}
        </button>
      </div>

      {report && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/60 border border-border rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Salud digital</p>
              <p className="text-2xl font-mono text-rose-400">{report.score}%</p>
            </div>
            <div className="bg-background/60 border border-border rounded-lg p-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Fuga mensual</p>
              <p className="text-2xl font-mono text-amber-400">${report.lostRevenue}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Brechas críticas detectadas</p>
            <ul className="space-y-1.5">
              {report.leaks.map((leak, i) => (
                <li key={i} className="text-xs text-muted-foreground font-mono flex gap-2">
                  <span className="text-rose-400">▸</span>
                  <span>{leak}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-primary font-semibold">
            ➔ Exportar PDF de marca blanca listo para enviar (próximamente).
          </p>
        </div>
      )}
    </div>
  );
}
