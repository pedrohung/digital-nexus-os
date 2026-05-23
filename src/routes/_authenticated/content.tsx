import { createFileRoute } from "@tanstack/react-router";
import { PenSquare } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/content")({
  component: () => (
    <ModulePlaceholder
      title="Contenido"
      subtitle="Calendario editorial multi-canal con generación IA y aprobación."
      icon={PenSquare}
      features={[
        { title: "Calendario", description: "Vista mensual cross-canal (blog, social, email)." },
        { title: "Briefs IA", description: "Generación basada en SEO + tono de marca." },
        { title: "Drafts colaborativos", description: "Revisión y aprobación con roles." },
        { title: "Publicación", description: "Programación directa a redes sociales." },
        { title: "Performance", description: "Engagement por pieza, comparativas." },
        { title: "Repurposing", description: "Convierte 1 blog en 5 posts + 1 email." },
      ]}
      todo="Tabla `content_pieces` + integración con Buffer/Ayrshare para publicación."
    />
  ),
});
