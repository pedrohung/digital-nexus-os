import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/settings")({
  component: () => (
    <ModulePlaceholder
      title="Ajustes"
      subtitle="Integraciones, equipo, facturación y reglas del Co-Pilot."
      icon={SettingsIcon}
      features={[
        { title: "Integraciones", description: "Google Ads, Meta, TikTok, Shopify, HubSpot, Stripe." },
        { title: "Equipo & roles", description: "Owner, admin, editor, viewer, agency." },
        { title: "Reglas IA", description: "Umbrales de aprobación, voz de marca." },
        { title: "Logs auditables", description: "Historial inmutable de acciones IA." },
        { title: "Billing", description: "Plan, uso, próxima factura." },
        { title: "API & Webhooks", description: "Tokens y endpoints para tu stack." },
      ]}
      todo="UI de OAuth para integraciones + sección de billing con Lovable Cloud."
    />
  ),
});
