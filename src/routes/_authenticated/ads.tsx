import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/ads")({
  component: () => (
    <ModulePlaceholder
      title="Publicidad"
      subtitle="Google, Meta y TikTok Ads en una sola vista, con reasignación inteligente."
      icon={Megaphone}
      features={[
        { title: "ROAS por campaña", description: "Ranking en tiempo real con benchmarks." },
        { title: "Reasignación IA", description: "El Co-Pilot sugiere movimientos — tú apruebas." },
        { title: "Anomalías", description: "Detección de spikes/drops en CPA o CTR." },
        { title: "Creative library", description: "Performance por creatividad y duración." },
        { title: "Audiencias", description: "Lookalikes y segmentos con mejor LTV." },
        { title: "Forecast", description: "Proyección de inversión vs ingresos a 30/90 días." },
      ]}
      todo="OAuth con Google Ads + Meta Marketing API. Tabla `integrations` ya soporta tokens."
    />
  ),
});
