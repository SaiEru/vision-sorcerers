import { Brain, TrendingUp, MessageSquare, HeartPulse } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Multimodal AI Analysis",
    description: "Combines clinical data, behavioral inputs, and visual analysis for comprehensive risk assessment.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Intelligence",
    description: "Advanced algorithms predict post-operative complications before they manifest clinically.",
  },
  {
    icon: MessageSquare,
    title: "Explainable Decisions",
    description: "Transparent AI explanations help clinicians understand and trust the recommendations.",
  },
  {
    icon: HeartPulse,
    title: "Personalized Care Plans",
    description: "AI-generated, patient-specific care guidance and medication category suggestions.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-3 text-center text-2xl font-bold text-foreground">
          Intelligent Clinical Decision Support
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Powered by advanced machine learning models trained on comprehensive ophthalmological data.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
