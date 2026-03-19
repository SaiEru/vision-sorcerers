import { Sparkles, ArrowRight, LayoutGrid, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "95%", label: "Prediction Accuracy" },
  { value: "40%", label: "Earlier Detection" },
  { value: "1,247", label: "Patients Assessed" },
  { value: "24/7", label: "Real-time Monitoring" },
];

const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "var(--hero-gradient)" }}
    >
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-primary/5" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm animate-fade-up">
          <Eye className="h-4 w-4 text-primary" />
          AI-Powered Clinical Decision Support
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
          AI-Based Eye Clinical{" "}
          <span className="text-primary">Intelligence</span> Platform
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Transform reactive treatment into proactive care. Our multimodal AI system predicts,
          explains, and helps prevent post-operative complications in eye surgery patients.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25" asChild>
            <Link to="/assessment">
              <Sparkles className="h-4 w-4" />
              Start Patient Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8 text-base" asChild>
            <Link to="/dashboard">
              <LayoutGrid className="h-4 w-4" />
              Hospital Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl px-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-primary md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
