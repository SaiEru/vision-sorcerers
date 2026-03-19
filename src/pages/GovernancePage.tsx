import Navbar from "@/components/Navbar";
import {
  Shield, Users, AlertTriangle, Eye as EyeIcon, Lock, ClipboardCheck, Scale,
  TriangleAlert,
} from "lucide-react";

const principles = [
  { icon: Users, title: "Human-in-the-Loop", desc: "All AI-generated recommendations require explicit clinician confirmation before any clinical action is taken. The system assists but never replaces human judgment." },
  { icon: AlertTriangle, title: "Bias Awareness", desc: "We acknowledge potential biases in training data and model outputs. Regular audits are conducted to identify and mitigate algorithmic bias across demographic groups." },
  { icon: ClipboardCheck, title: "Transparency & Explainability", desc: "Every risk assessment includes detailed explanations of contributing factors, enabling clinicians to understand and validate AI reasoning." },
  { icon: Lock, title: "Data Privacy", desc: "Patient data is processed in compliance with HIPAA and other healthcare regulations. No patient identifiable information is stored permanently." },
  { icon: EyeIcon, title: "Audit Trail", desc: "Complete logging of all system interactions, predictions, and clinical decisions for accountability and quality improvement." },
  { icon: Scale, title: "Regulatory Compliance", desc: "The system is designed to meet FDA guidelines for clinical decision support software and follows IEC 62304 software lifecycle requirements." },
];

const limitations = [
  "AI predictions are based on statistical patterns and may not capture all individual patient nuances",
  "Media analysis accuracy depends on image quality and proper capture technique",
  "The system has not been validated for pediatric populations",
  "Risk scores should be interpreted alongside complete clinical evaluation",
  "Real-time symptom changes may not be reflected until reassessment",
  "Cultural and socioeconomic factors may not be fully represented in the model",
];

const qaSteps = [
  { step: 1, title: "Data Validation", desc: "Input data is validated against clinical standards before processing" },
  { step: 2, title: "Model Inference", desc: "AI models process validated data through ensemble learning approach" },
  { step: 3, title: "Uncertainty Quantification", desc: "Confidence intervals are calculated for all predictions" },
  { step: 4, title: "Clinical Review", desc: "Recommendations are presented for clinician review and confirmation" },
  { step: 5, title: "Outcome Tracking", desc: "Actual outcomes are monitored to continuously improve model accuracy" },
];

const GovernancePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Safety, Ethics & Governance</h1>
            <p className="text-muted-foreground">Our commitment to responsible AI in healthcare</p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mt-10 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-foreground">Core Principles</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Known Limitations */}
        <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <EyeIcon className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Known Limitations</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            We believe in transparent communication about system limitations:
          </p>
          <ul className="space-y-3">
            {limitations.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* QA Process */}
        <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-foreground">Quality Assurance Process</h2>
          <div className="space-y-6">
            {qaSteps.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h3 className="font-semibold text-foreground">Important Disclaimer</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This platform is for demonstration and educational purposes only. It is not intended for actual clinical use
            or medical diagnosis. Always consult qualified healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovernancePage;
