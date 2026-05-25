import { Info } from "lucide-react";

interface WhiteLabelToggleProps {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  domain: string;
  setDomain: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function WhiteLabelToggle({
  enabled,
  setEnabled,
  domain,
  setDomain,
  color,
  setColor,
  onSave,
  isSaving,
}: WhiteLabelToggleProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Marca Blanca</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sirve la plataforma bajo tu dominio y colores corporativos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`w-11 h-6 rounded-full transition relative shrink-0 ${enabled ? "bg-primary" : "bg-muted"}`}
          aria-pressed={enabled}
        >
          <span
            className={`absolute top-0.5 ${enabled ? "left-5" : "left-0.5"} w-5 h-5 bg-white rounded-full shadow transition-all`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dominio personalizado (CNAME)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="portal.tuagencia.com"
              className="mt-1.5 w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Configura un registro <code className="text-foreground">CNAME</code> en tu DNS apuntando a{" "}
                <code className="text-foreground">cname.lovable.app</code>. La propagación tarda 5–30 min.
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Color primario
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 bg-transparent border border-input rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-sm transition disabled:opacity-50"
      >
        {isSaving ? "Guardando…" : "Guardar configuración"}
      </button>
    </div>
  );
}
