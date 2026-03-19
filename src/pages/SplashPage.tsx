import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Eye, Brain, Activity, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SplashPage = () => {
  const navigate = useNavigate();
  const [eyePhase, setEyePhase] = useState(0); // 0=closed, 1=opening, 2=open, 3=iris-glow, 4=fade-out
  const [phase, setPhase] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Eye opening sequence
    const t0 = setTimeout(() => setEyePhase(1), 400);   // start opening
    const t1 = setTimeout(() => setEyePhase(2), 1200);   // fully open
    const t2 = setTimeout(() => setEyePhase(3), 1800);   // iris glows
    const t3 = setTimeout(() => setEyePhase(4), 2600);   // fade out eye
    const t4 = setTimeout(() => setShowContent(true), 3000); // show main content

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    if (!showContent) return;
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 500);
    const t3 = setTimeout(() => setPhase(3), 1000);
    const t4 = setTimeout(() => setPhase(4), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [showContent]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[hsl(222,47%,8%)]">
      {/* ===== EYE OPENING INTRO ===== */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
          eyePhase >= 4 ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ background: "hsl(222,47%,8%)" }}
      >
        {/* Eye SVG */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 200 100"
            className="w-[280px] sm:w-[360px]"
            style={{ filter: eyePhase >= 3 ? "drop-shadow(0 0 30px hsl(221 83% 53% / 0.8))" : "none", transition: "filter 0.6s ease" }}
          >
            {/* Upper eyelid */}
            <path
              d={
                eyePhase >= 1
                  ? "M 10 50 Q 100 -10, 190 50"   // open
                  : "M 10 50 Q 100 45, 190 50"      // closed
              }
              fill="hsl(222,47%,8%)"
              stroke="hsl(221,83%,53%)"
              strokeWidth="2"
              style={{ transition: "d 0.8s cubic-bezier(0.4,0,0.2,1)" }}
            />
            {/* Lower eyelid */}
            <path
              d={
                eyePhase >= 1
                  ? "M 10 50 Q 100 110, 190 50"   // open
                  : "M 10 50 Q 100 55, 190 50"      // closed
              }
              fill="hsl(222,47%,8%)"
              stroke="hsl(221,83%,53%)"
              strokeWidth="2"
              style={{ transition: "d 0.8s cubic-bezier(0.4,0,0.2,1)" }}
            />
            {/* Eye white (sclera) */}
            <ellipse
              cx="100" cy="50"
              rx={eyePhase >= 1 ? 60 : 0}
              ry={eyePhase >= 1 ? 28 : 0}
              fill="hsl(220,30%,96%)"
              style={{ transition: "rx 0.8s ease, ry 0.8s ease" }}
            />
            {/* Iris */}
            <circle
              cx="100" cy="50"
              r={eyePhase >= 2 ? 18 : 0}
              fill={eyePhase >= 3 ? "hsl(221,83%,53%)" : "hsl(210,60%,40%)"}
              style={{ transition: "r 0.5s ease 0.2s, fill 0.4s ease" }}
            />
            {/* Pupil */}
            <circle
              cx="100" cy="50"
              r={eyePhase >= 2 ? 8 : 0}
              fill="hsl(222,47%,5%)"
              style={{ transition: "r 0.4s ease 0.3s" }}
            />
            {/* Iris glow ring */}
            <circle
              cx="100" cy="50"
              r={eyePhase >= 3 ? 22 : 0}
              fill="none"
              stroke="hsl(221,83%,53%)"
              strokeWidth="1.5"
              opacity={eyePhase >= 3 ? 0.6 : 0}
              style={{ transition: "r 0.5s ease, opacity 0.5s ease" }}
            />
            {/* Light reflection */}
            <circle
              cx="108" cy="44"
              r={eyePhase >= 2 ? 3 : 0}
              fill="white"
              opacity="0.9"
              style={{ transition: "r 0.3s ease 0.4s" }}
            />
          </svg>

          {/* Scanning line effect */}
          {eyePhase >= 2 && eyePhase < 4 && (
            <div
              className="absolute left-1/2 h-[2px] -translate-x-1/2 animate-[pulse_1.5s_ease-in-out_infinite]"
              style={{
                width: "180px",
                background: "linear-gradient(90deg, transparent, hsl(221 83% 53% / 0.6), transparent)",
                top: "50%",
              }}
            />
          )}
        </div>

        {/* Text under eye */}
        <p
          className={`absolute bottom-[30%] text-xs font-medium uppercase tracking-[0.4em] transition-all duration-700 ${
            eyePhase >= 2 ? "translate-y-0 opacity-60" : "translate-y-4 opacity-0"
          }`}
          style={{ color: "hsl(221,83%,60%)" }}
        >
          Initializing Clinical AI...
        </p>
      </div>

      {/* ===== MAIN SPLASH CONTENT (same as before) ===== */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.4) 0%, hsl(221 83% 53% / 0.1) 40%, transparent 70%)" }} />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
          <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5 animate-[spin_45s_linear_infinite_reverse]" />
          <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 animate-[spin_20s_linear_infinite]" />
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/30 animate-[pulse_3s_ease-in-out_infinite]"
              style={{
                left: `${10 + (i * 4.2) % 80}%`,
                top: `${5 + (i * 7.3) % 90}%`,
                animationDelay: `${i * 0.3}s`,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
              }}
            />
          ))}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(hsl(221 83% 53%) 1px, transparent 1px), linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* DNA helix elements */}
        <div className="pointer-events-none absolute left-8 top-1/4 flex flex-col items-center gap-3 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-2 rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]"
              style={{ width: `${12 + Math.sin(i * 0.8) * 10}px`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <div className="pointer-events-none absolute right-8 bottom-1/4 flex flex-col items-center gap-3 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-2 rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]"
              style={{ width: `${12 + Math.cos(i * 0.8) * 10}px`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          {/* Animated eye icon */}
          <div className={`mb-8 transition-all duration-1000 ${phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-2 rounded-full bg-primary/10 animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-[hsl(222,47%,12%)]">
                <Eye className="h-10 w-10 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Feature icons row */}
          <div className={`mb-8 flex items-center gap-6 transition-all duration-700 ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            {[
              { icon: Brain, label: "AI Analysis" },
              { icon: Activity, label: "Risk Prediction" },
              { icon: Shield, label: "Clinical Safety" },
              { icon: Sparkles, label: "Smart Insights" },
            ].map((item, i) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                  <item.icon className="h-5 w-5 text-primary/70" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-widest text-primary/40">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Title */}
          <h1 className={`mb-4 text-3xl font-bold leading-tight tracking-tight text-white transition-all duration-1000 sm:text-4xl md:text-5xl ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            AI-Based Clinical Intelligence System
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              for Ophthalmology Risk Prediction
            </span>
            <br />
            <span className="text-2xl font-medium text-white/60 sm:text-3xl">
              & Workflow Optimization
            </span>
          </h1>

          {/* Separator */}
          <div className={`my-6 h-px w-48 transition-all duration-700 ${phase >= 3 ? "w-48 opacity-100" : "w-0 opacity-0"}`}
            style={{ background: "linear-gradient(90deg, transparent, hsl(221 83% 53% / 0.5), transparent)" }} />

          {/* Team credit */}
          <p className={`mb-10 text-sm font-medium uppercase tracking-[0.3em] text-white/30 transition-all duration-700 ${phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            Developed by{" "}
            <span className="bg-gradient-to-r from-primary/70 to-cyan-400/70 bg-clip-text text-transparent">
              Team Vision Sorcerers
            </span>
          </p>

          {/* Enter button */}
          <div className={`transition-all duration-700 ${phase >= 4 ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="group relative gap-3 rounded-full border border-primary/30 bg-primary/10 px-10 py-6 text-base font-semibold text-white shadow-[0_0_30px_hsl(221_83%_53%/0.2)] backdrop-blur-sm transition-all hover:bg-primary/20 hover:shadow-[0_0_50px_hsl(221_83%_53%/0.35)]"
            >
              <span className="relative z-10">Enter Platform</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          </div>

          {/* Bottom version tag */}
          <p className={`mt-12 text-xs text-white/15 transition-all duration-700 ${phase >= 4 ? "opacity-100" : "opacity-0"}`}>
            MindEye Spark · AI-Based Eye Clinical Intelligence Platform · v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
