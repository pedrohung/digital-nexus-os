import { type LucideIcon, Sparkles, Wrench } from "lucide-react";
import { PageHeader } from "./PageHeader";

interface Feature {
  title: string;
  description: string;
}

interface Props {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  features: Feature[];
  todo: string;
}

export function ModulePlaceholder({ title, subtitle, icon: Icon, features, todo }: Props) {
  return (
    <div className="p-8 max-w-6xl">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="rounded-xl border border-border bg-card p-8 shadow-elevated mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Módulo en construcción <Sparkles className="h-4 w-4 text-primary" />
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Esta sección está conectada al schema seguro de Lovable Cloud con RLS estricto.
              La UI funcional se desbloquea en la próxima iteración.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border border-border bg-card p-4">
            <p className="font-medium text-sm">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex gap-3 text-sm">
        <Wrench className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-warning">Próxima iteración</p>
          <p className="text-muted-foreground text-xs mt-1">{todo}</p>
        </div>
      </div>
    </div>
  );
}
