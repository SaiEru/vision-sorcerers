import { CheckCircle2 } from "lucide-react";

const capabilities = [
  "Adaptive multi-layer patient assessment",
  "Visual AI analysis of post-operative images",
  "Real-time risk scoring (0-100%)",
  "Temporal monitoring across follow-ups",
  "Hospital-wide analytics dashboard",
  "Comprehensive audit trail",
];

const CapabilitiesSection = () => {
  return (
    <section className="border-t border-border bg-card py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
          Comprehensive Platform Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-4"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
