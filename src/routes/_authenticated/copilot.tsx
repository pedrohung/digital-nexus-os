import { createFileRoute } from "@tanstack/react-router";
import { AIChat } from "@/components/ai/AIChat";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/_authenticated/copilot")({
  component: CopilotPage,
});

function CopilotPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="AI Co-Pilot"
        subtitle="Conversa, analiza y ejecuta — con aprobación obligatoria para acciones financieras."
      />
      <AIChat />
    </div>
  );
}
