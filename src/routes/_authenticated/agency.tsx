import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import WhiteLabelToggle from "@/components/agency/WhiteLabelToggle";
import {
  getAgencyOverview,
  updateAgencyConfig,
  addClientMapping,
  removeClientMapping,
} from "@/lib/agency.functions";

export const Route = createFileRoute("/_authenticated/agency")({
  component: AgencyPage,
});

function AgencyPage() {
  const fetchOverview = useServerFn(getAgencyOverview);
  const saveConfig = useServerFn(updateAgencyConfig);
  const addClient = useServerFn(addClientMapping);
  const removeClient = useServerFn(removeClientMapping);
  const qc = useQueryClient();

  const overview = useQuery({
    queryKey: ["agency-overview"],
    queryFn: () => fetchOverview(),
  });

  const [enabled, setEnabled] = useState(false);
  const [domain, setDomain] = useState("");
  const [color, setColor] = useState("#3B82F6");

  useEffect(() => {
    if (overview.data?.config) {
      setEnabled(overview.data.config.white_label_enabled);
      setDomain(overview.data.config.custom_domain ?? "");
      setColor(overview.data.config.primary_color);
    }
  }, [overview.data]);

  const saveMutation = useMutation({
    mutationFn: () => saveConfig({ data: { enabled, domain: domain || null, color } }),
    onSuccess: () => {
      toast.success("Configuración guardada");
      qc.invalidateQueries({ queryKey: ["agency-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [newClientId, setNewClientId] = useState("");
  const [newClientLabel, setNewClientLabel] = useState("");
  const [newSplit, setNewSplit] = useState(70);

  const addMutation = useMutation({
    mutationFn: () =>
      addClient({
        data: {
          client_business_id: newClientId,
          client_label: newClientLabel || undefined,
          billing_split: newSplit,
        },
      }),
    onSuccess: () => {
      toast.success("Cliente vinculado");
      setNewClientId("");
      setNewClientLabel("");
      setNewSplit(70);
      qc.invalidateQueries({ queryKey: ["agency-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeClient({ data: { id } }),
    onSuccess: () => {
      toast.success("Cliente removido");
      qc.invalidateQueries({ queryKey: ["agency-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clients = overview.data?.clients ?? [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="Consola de Agencia"
        subtitle="Marca blanca y administración de clientes vinculados."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <WhiteLabelToggle
          enabled={enabled}
          setEnabled={setEnabled}
          domain={domain}
          setDomain={setDomain}
          color={color}
          setColor={setColor}
          onSave={() => saveMutation.mutate()}
          isSaving={saveMutation.isPending}
        />

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Vincular cliente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pega el ID de negocio del cliente. Lo obtienes en{" "}
              <span className="text-foreground font-mono">Ajustes → Negocio</span> de su cuenta.
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              placeholder="UUID del negocio del cliente"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              value={newClientLabel}
              onChange={(e) => setNewClientLabel(e.target.value)}
              placeholder="Etiqueta (ej. Acme Corp)"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Split de comisión</span>
                <span className="text-foreground">{newSplit}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={newSplit}
                onChange={(e) => setNewSplit(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !newClientId}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {addMutation.isPending ? "Vinculando…" : "Vincular cliente"}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          Clientes vinculados ({clients.length})
        </h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {clients.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Aún no has vinculado ningún cliente.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5">Cliente</th>
                  <th className="text-left px-4 py-2.5">ID</th>
                  <th className="text-right px-4 py-2.5">Split</th>
                  <th className="text-right px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-2.5">{c.client_label ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {c.client_business_id.slice(0, 8)}…{c.client_business_id.slice(-4)}
                    </td>
                    <td className="text-right px-4 py-2.5">{Number(c.billing_split).toFixed(0)}%</td>
                    <td className="text-right px-4 py-2.5 uppercase text-xs">{c.status}</td>
                    <td className="text-right px-4 py-2.5">
                      <button
                        onClick={() => removeMutation.mutate(c.id)}
                        className="text-muted-foreground hover:text-destructive transition"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
