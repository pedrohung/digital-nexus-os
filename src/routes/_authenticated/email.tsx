import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/email")({
  component: () => (
    <ModulePlaceholder
      title="Email & Automatización"
      subtitle="Secuencias, segmentos y triggers — con plantillas optimizadas por IA."
      icon={Mail}
      features={[
        { title: "Segmentos dinámicos", description: "Basados en comportamiento y RFM." },
        { title: "Secuencias", description: "Welcome, carrito abandonado, win-back." },
        { title: "A/B testing", description: "Subject + cuerpo, ganador automático." },
        { title: "Plantillas IA", description: "Tono y CTAs adaptados al segmento." },
        { title: "Deliverability", description: "Monitoreo de SPF/DKIM y reputación." },
        { title: "Reporting", description: "Open/click/conversión por campaña." },
      ]}
      todo="Integrar Resend o Lovable Email + tabla `email_campaigns`."
    />
  ),
});
