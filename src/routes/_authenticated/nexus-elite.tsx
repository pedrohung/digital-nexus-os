import { createFileRoute } from "@tanstack/react-router";
import LocalSEOAudit from "@/components/elite/LocalSEOAudit";
import ReputationCRM from "@/components/elite/ReputationCRM";
import BudgetSwarm from "@/components/elite/BudgetSwarm";
import DealCloserPitch from "@/components/elite/DealCloserPitch";
import CompetitorShadow from "@/components/crown/CompetitorShadow";
import ContentStream from "@/components/crown/ContentStream";
import RetentionLTV from "@/components/crown/RetentionLTV";
import InstantLander from "@/components/crown/InstantLander";
import RoiReporter from "@/components/crown/RoiReporter";
import ComplianceLedger from "@/components/crown/ComplianceLedger";
import Footer from "@/components/branding/Footer";

export const Route = createFileRoute("/_authenticated/nexus-elite")({
  component: NexusEliteDashboard,
});

function NexusEliteDashboard() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            NEXUS360 OMNIPOTENT MARKETING HUB
          </h1>
          <p className="text-sm text-muted-foreground">
            Inteligencia competitiva, automatización omnicanal y crecimiento de valor perpetuo.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Engine Core · powered by{" "}
          <span className="lowercase text-emerald-400">astrumshielda</span>
        </span>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Élite Operational Core
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <LocalSEOAudit />
          <ReputationCRM />
          <BudgetSwarm />
          <DealCloserPitch />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Crown Jewels — Intelligence & Retention
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <CompetitorShadow />
          <RetentionLTV />
          <div className="xl:col-span-2">
            <ContentStream />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Conversion & Executive Finance
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <InstantLander />
          <RoiReporter />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Governance & Compliance
        </h2>
        <ComplianceLedger />
      </section>

      <Footer />
    </div>
  );
}
