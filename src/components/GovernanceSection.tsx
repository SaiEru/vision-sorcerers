import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { forwardRef } from "react";

const badges = ["Human-in-the-loop", "Bias Awareness", "Audit Trail", "HIPAA Compliant"];

const GovernanceSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          AI Safety, Ethics & Governance
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
          Our platform is built with patient safety and ethical AI principles at its core. All
          recommendations require human-in-the-loop confirmation, with transparent explanations and
          comprehensive audit trails.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <Badge
              key={badge}
              variant="secondary"
              className="px-4 py-2 text-sm font-medium"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
});

GovernanceSection.displayName = "GovernanceSection";

export default GovernanceSection;
