import { AlertTriangle, CheckCircle2 } from "lucide-react";

const challenges = [
  "Delayed detection of endophthalmitis and infection",
  "Inconsistent risk stratification across patients",
  "Reactive rather than preventive care approaches",
];

const solutions = [
  "Continuous multimodal risk monitoring",
  "Explainable AI for transparent decisions",
  "Personalized, evidence-based interventions",
];

const ChallengeSection = () => {
  return (
    <section className="border-t border-border bg-card py-20">
      <div className="mx-auto grid max-w-5xl gap-16 px-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">The Challenge</h2>
          <p className="mb-6 text-muted-foreground">
            Post-operative complications in eye surgery can lead to vision loss, extended recovery,
            and increased healthcare costs. Traditional monitoring relies on scheduled follow-ups,
            often detecting complications too late for optimal intervention.
          </p>
          <ul className="space-y-3">
            {challenges.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Our Solution</h2>
          <p className="mb-6 text-muted-foreground">
            Our AI platform integrates clinical data, patient history, and visual analysis to provide
            real-time risk assessment and personalized care recommendations, enabling early
            intervention before complications escalate.
          </p>
          <ul className="space-y-3">
            {solutions.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ChallengeSection;
