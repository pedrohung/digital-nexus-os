import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { fetchComplianceLogs } from "@/lib/compliance.functions";

export default function ComplianceLedger() {
  const fetchLogs = useServerFn(fetchComplianceLogs);
  const { data: logs, isFetching } = useQuery({
    queryKey: ["complianceLogs"],
    queryFn: () => fetchLogs(),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Privacy & Compliance Ledger
          </h3>
          <p className="text-xs text-muted-foreground">
            Gobernanza de datos en tiempo real. Hashes inmutables y verificación RGPD.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 whitespace-nowrap">
          {isFetching ? "Sync…" : "Protegido"}
        </span>
      </div>

      <div className="space-y-1.5">
        {logs?.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-border bg-background/40"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{log.action_type}</p>
              <p className="text-[10px] text-muted-foreground truncate">Módulo: {log.target_module}</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[40%]">
              {log.compliance_hash}
            </span>
          </div>
        ))}
        {!isFetching && (!logs || logs.length === 0) && (
          <p className="text-xs text-muted-foreground italic">Sin eventos de auditoría aún.</p>
        )}
      </div>
    </div>
  );
}
