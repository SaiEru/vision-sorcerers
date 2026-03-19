import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { forwardRef } from "react";

const CTASection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="border-t border-border bg-primary py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
          Ready to Transform Post-Operative Care?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
          Begin your first patient assessment and experience the power of predictive AI in
          ophthalmology.
        </p>
        <Button size="lg" variant="secondary" className="gap-2 px-8 text-base font-semibold" asChild>
          <Link to="/assessment">
            Start Patient Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
