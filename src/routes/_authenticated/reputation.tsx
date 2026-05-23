import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/reputation")({
  component: () => (
    <ModulePlaceholder
      title="Reputación"
      subtitle="Reseñas unificadas con análisis de sentimiento y respuestas IA con aprobación."
      icon={Star}
      features={[
        { title: "Multi-plataforma", description: "Google, Yelp, Trustpilot, Facebook." },
        { title: "Sentimiento", description: "Clasificación positiva/neutra/negativa en tiempo real." },
        { title: "Respuestas IA", description: "Borradores con tono de marca, aprobación previa." },
        { title: "Alertas críticas", description: "Notificación inmediata si rating ≤ 2." },
        { title: "Insights de tema", description: "Temas recurrentes (servicio, precio, producto)." },
        { title: "Exportes", description: "CSV/PDF para reportes ejecutivos." },
      ]}
      todo="Conectar Google Business Profile API. La tabla `reviews` y RLS ya están listas."
    />
  ),
});
