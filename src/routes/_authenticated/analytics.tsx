import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: () => (
    <ModulePlaceholder
      title="ROI & Analítica"
      subtitle="Atribución, forecasting y cohortes — modo CEO vs Operativo."
      icon={BarChart3}
      features={[
        { title: "Atribución multi-touch", description: "First/last/linear/data-driven." },
        { title: "Forecasting", description: "Proyección de ingresos a 30/60/90 días." },
        { title: "Cohortes", description: "LTV y retención por canal de adquisición." },
        { title: "Margen real", description: "Inversión total vs ingresos netos." },
        { title: "Modo CEO", description: "Vista ejecutiva: 4 KPIs, 1 gráfica, 1 alerta." },
        { title: "Exportes PDF", description: "Reportes mensuales auto-generados." },
      ]}
      todo="Pipeline de métricas: cron job que agrega de `integrations` → `metrics` diariamente."
    />
  ),
});
