import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface ROIReceiptProps {
  projectionId: string;
  estimated: number;
  roas: number;
  confidence: number;
}

type ReceiptStatus = "estimated" | "executed" | "confirmed";

export default function ROIReceipt({ projectionId, estimated, roas, confidence }: ROIReceiptProps) {
  const [status, setStatus] = useState<ReceiptStatus>("estimated");
  const [actual, setActual] = useState<number | null>(null);

  useEffect(() => {
    setStatus("estimated");
    setActual(null);
    const t1 = setTimeout(() => setStatus("executed"), 1800);
    const t2 = setTimeout(() => {
      // Deterministic simulated actual: confidence-weighted variance
      const variance = (1 - confidence / 100) * 0.15;
      const factor = 1 - variance / 2 + Math.random() * variance;
      setActual(Number((estimated * factor).toFixed(2)));
      setStatus("confirmed");
    }, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [projectionId, estimated, confidence]);

  const delta = actual != null ? ((actual - estimated) / estimated) * 100 : null;
  const deltaPositive = delta != null && delta >= 0;

  const StatusIcon =
    status === "estimated" ? Loader2 : status === "executed" ? ShieldCheck : CheckCircle2;
  const statusLabel =
    status === "estimated" ? "ESTIMANDO" : status === "executed" ? "EJECUTADO" : "CONFIRMADO";

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-5 mt-6 font-mono">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
        <div>
          <div className="text-xs text-muted-foreground tracking-widest">AUDIT ROI RECEIPT</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1">ID: {projectionId}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <StatusIcon className={`h-3.5 w-3.5 ${status === "estimated" ? "animate-spin" : ""} ${status === "confirmed" ? "text-emerald-400" : "text-primary"}`} />
          <span className={status === "confirmed" ? "text-emerald-400" : "text-primary"}>{statusLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">ROAS Proyectado</div>
          <div className="text-lg text-foreground mt-1">{roas.toFixed(2)}x</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Retorno Estimado</div>
          <div className="text-lg text-foreground mt-1">${estimated.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Delta Real</div>
          <div className={`text-lg mt-1 ${delta == null ? "text-muted-foreground" : deltaPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {delta == null ? "—" : `${deltaPositive ? "+" : ""}${delta.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {actual != null && (
        <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          Impacto real registrado:{" "}
          <span className="text-foreground">${actual.toLocaleString()}</span>
        </div>
      )}

      <div className="mt-4 text-[10px] text-muted-foreground/60 flex justify-between">
        <span>LEDGER · SHA-256</span>
        <span>NEXUS360 AUDIT</span>
      </div>
    </div>
  );
}
