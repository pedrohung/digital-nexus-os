import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Target, Trash2, Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { listKeywords, addKeyword, deleteKeyword } from "@/lib/seo.functions";

export const Route = createFileRoute("/_authenticated/seo")({
  component: SeoPage,
});

function SeoPage() {
  const qc = useQueryClient();
  const list = useServerFn(listKeywords);
  const add = useServerFn(addKeyword);
  const del = useServerFn(deleteKeyword);

  const { data, isLoading } = useQuery({ queryKey: ["seo-keywords"], queryFn: () => list() });

  const [keyword, setKeyword] = useState("");
  const [url, setUrl] = useState("");
  const [intent, setIntent] = useState<"informational" | "commercial" | "transactional" | "navigational">("commercial");

  const addMut = useMutation({
    mutationFn: () => add({ data: { keyword, target_url: url || undefined, intent } }),
    onSuccess: () => {
      toast.success("Keyword añadida");
      setKeyword(""); setUrl("");
      qc.invalidateQueries({ queryKey: ["seo-keywords"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo-keywords"] }),
  });

  const summary = data?.summary;
  const keywords = data?.keywords ?? [];

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader title="SEO & Posicionamiento" subtitle="Rastreo de keywords con quick wins detectados por IA." />

      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <Kpi label="Keywords activas" value={summary?.total ?? 0} icon={Search} />
        <Kpi label="Top 10" value={summary?.topTen ?? 0} icon={Target} tone="success" />
        <Kpi label="Quick wins (4–10)" value={summary?.quickWins ?? 0} icon={TrendingUp} tone="warning" />
        <Kpi label="Posición media" value={summary?.avgPosition ?? 0} icon={TrendingDown} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="font-semibold mb-3 text-sm">Añadir keyword</h2>
        <div className="grid gap-3 md:grid-cols-[2fr_2fr_1fr_auto]">
          <Input placeholder="ej. mejor crm para pymes" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Input placeholder="URL objetivo (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Select value={intent} onValueChange={(v) => setIntent(v as typeof intent)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="informational">Informativa</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
              <SelectItem value="transactional">Transaccional</SelectItem>
              <SelectItem value="navigational">Navegacional</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => addMut.mutate()} disabled={!keyword.trim() || addMut.isPending}>
            {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Añadir
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          TODO: integrar Google Search Console + scraping de SERP. Por ahora las métricas son estimadas.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Δ</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Intención</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando…</TableCell></TableRow>
            )}
            {!isLoading && keywords.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin keywords aún. Añade la primera arriba.</TableCell></TableRow>
            )}
            {keywords.map((k) => {
              const delta = k.position != null && k.previous_position != null ? k.previous_position - k.position : 0;
              return (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">
                    {k.keyword}
                    {k.target_url && <div className="text-xs text-muted-foreground truncate max-w-[280px]">{k.target_url}</div>}
                  </TableCell>
                  <TableCell>
                    {k.position != null ? (
                      <Badge variant={k.position <= 3 ? "default" : k.position <= 10 ? "secondary" : "outline"}>
                        #{k.position}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {delta > 0 && <span className="text-success text-xs flex items-center gap-1"><TrendingUp className="h-3 w-3" />+{delta}</span>}
                    {delta < 0 && <span className="text-destructive text-xs flex items-center gap-1"><TrendingDown className="h-3 w-3" />{delta}</span>}
                    {delta === 0 && <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">{k.search_volume?.toLocaleString() ?? "—"}</TableCell>
                  <TableCell className="text-sm">{k.difficulty ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{k.intent ?? "—"}</Badge></TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => delMut.mutate(k.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Search; tone?: "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}
