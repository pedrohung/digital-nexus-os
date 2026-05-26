import { createFileRoute } from "@tanstack/react-router";
import LocalSEOAudit from "@/components/elite/LocalSEOAudit";
import ReputationCRM from "@/components/elite/ReputationCRM";
import BudgetSwarm from "@/components/elite/BudgetSwarm";
import DealCloserPitch from "@/components/elite/DealCloserPitch";

export const Route = createFileRoute("/_authenticated/nexus-elite")({
  component: NexusEliteDashboard,
});

function NexusEliteDashboard() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          NEXUS360 ÉLITE OPERATIONAL CORE
        </h1>
        <p className="text-sm text-muted-foreground">
          Epicentro de automatización estratégica y crecimiento de alta conversión.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <LocalSEOAudit />
        <ReputationCRM />
        <BudgetSwarm />
        <DealCloserPitch />
      </div>
    </div>
  );
}
