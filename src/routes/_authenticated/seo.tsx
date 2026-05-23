import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/seo")({
  component: () => (
    <ModulePlaceholder
      title="SEO & Posicionamiento"
      subtitle="Rastreo de keywords, auditoría técnica y briefs optimizados con IA."
      icon={Search}
      features={[
        { title: "Tracking de keywords", description: "Monitoreo diario de posiciones con alertas." },
        { title: "Auditoría técnica", description: "Core Web Vitals, indexación y errores 4xx/5xx." },
        { title: "Quick wins", description: "Detecta páginas en posición 4–10 con potencial." },
        { title: "Briefs con IA", description: "Genera estructuras optimizadas por keyword." },
        { title: "Competidores", description: "Brecha de contenido y backlinks." },
        { title: "Schema markup", description: "Sugerencias de structured data por página." },
      ]}
      todo="Conectar Google Search Console + scraping de SERP. Tabla `seo_keywords` con tracking diario."
    />
  ),
});
