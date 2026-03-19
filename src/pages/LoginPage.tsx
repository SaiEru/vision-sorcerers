import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Shield, Stethoscope, Loader2, Lock, Mail, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{ duration: 3 + delay, repeat: Infinity, delay }}
  />
);

const LoginPage = () => {
  const [mode, setMode] = useState<"choose" | "admin" | "doctor">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    const seedAdmin = async () => {
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        await fetch(`${url}/functions/v1/seed-admin`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        });
      } catch {}
    };
    seedAdmin();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Sign in failed", description: error, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,8%)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(222,47%,8%)]">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial glow */}
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, hsl(221 83% 53% / 0.35) 0%, hsl(221 83% 53% / 0.08) 45%, transparent 70%)" }} />
        
        {/* Rotating rings */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(221 83% 53%) 1px, transparent 1px), linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        {/* Floating particles */}
        {[
          { delay: 0, x: "10%", y: "20%", size: 4 },
          { delay: 0.5, x: "80%", y: "15%", size: 3 },
          { delay: 1, x: "25%", y: "70%", size: 5 },
          { delay: 1.5, x: "70%", y: "60%", size: 3 },
          { delay: 2, x: "50%", y: "85%", size: 4 },
          { delay: 0.8, x: "90%", y: "40%", size: 3 },
          { delay: 1.2, x: "15%", y: "50%", size: 4 },
          { delay: 0.3, x: "60%", y: "30%", size: 5 },
          { delay: 1.8, x: "35%", y: "90%", size: 3 },
          { delay: 2.2, x: "85%", y: "75%", size: 4 },
        ].map((p, i) => <FloatingParticle key={i} {...p} />)}

        {/* DNA helix left */}
        <div className="absolute left-6 top-1/4 hidden flex-col items-center gap-3 opacity-15 md:flex">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="h-2 rounded-full bg-primary"
              style={{ width: `${12 + Math.sin(i * 0.8) * 10}px` }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        {/* DNA helix right */}
        <div className="absolute right-6 bottom-1/4 hidden flex-col items-center gap-3 opacity-15 md:flex">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="h-2 rounded-full bg-primary"
              style={{ width: `${12 + Math.cos(i * 0.8) * 10}px` }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {mode === "choose" ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="mb-8"
              >
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-2 rounded-full bg-primary/10 animate-[pulse_3s_ease-in-out_infinite]" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-[hsl(222,47%,12%)]">
                    <Eye className="h-8 w-8 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-2 text-2xl font-bold text-white sm:text-3xl"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-10 text-sm text-white/40"
              >
                Eye Complication Risk Intelligence Platform
              </motion.p>

              <div className="grid w-full gap-4 sm:grid-cols-2">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMode("admin"); setEmail("erukullasai0@gmail.com"); setPassword(""); }}
                  className="group rounded-2xl border border-primary/20 bg-[hsl(222,47%,12%)] p-6 text-center backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-[hsl(222,47%,15%)] hover:shadow-[0_0_30px_hsl(221_83%_53%/0.15)]"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Shield className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Admin</h3>
                  <p className="mt-2 text-xs text-white/40">Hospital analytics & doctor management</p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMode("doctor"); setEmail(""); setPassword(""); }}
                  className="group rounded-2xl border border-primary/20 bg-[hsl(222,47%,12%)] p-6 text-center backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-[hsl(222,47%,15%)] hover:shadow-[0_0_30px_hsl(221_83%_53%/0.15)]"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Stethoscope className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Doctor</h3>
                  <p className="mt-2 text-xs text-white/40">Assessments, reports & patient care</p>
                </motion.button>
              </div>

              {/* Bottom sparkle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-10 flex items-center gap-2 text-xs text-white/20"
              >
                <Sparkles className="h-3 w-3" />
                Powered by Clinical AI · v2.0
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="mb-6"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-[hsl(222,47%,12%)]">
                  {mode === "admin" ? (
                    <Shield className="h-7 w-7 text-primary" />
                  ) : (
                    <Stethoscope className="h-7 w-7 text-primary" />
                  )}
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-[hsl(222,47%,10%)]">
                    <Lock className="h-3 w-3 text-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-1 text-xl font-bold text-white"
              >
                {mode === "admin" ? "Admin" : "Doctor"} Sign In
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-8 text-sm text-white/40"
              >
                Enter your credentials to continue
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full rounded-2xl border border-primary/15 bg-[hsl(222,47%,10%)] p-6 shadow-[0_0_40px_hsl(221_83%_53%/0.08)] backdrop-blur-sm sm:p-8"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-white/60">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        readOnly={mode === "admin"}
                        className="border-primary/15 bg-[hsl(222,47%,14%)] pl-10 text-white placeholder:text-white/20 focus:border-primary/40 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-white/60">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                        className="border-primary/15 bg-[hsl(222,47%,14%)] pl-10 text-white placeholder:text-white/20 focus:border-primary/40 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSignIn}
                    disabled={submitting}
                    className="w-full gap-2 rounded-xl bg-primary py-5 text-base font-semibold shadow-[0_0_20px_hsl(221_83%_53%/0.3)] hover:shadow-[0_0_30px_hsl(221_83%_53%/0.5)]"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  variant="ghost"
                  className="mt-4 gap-2 text-white/40 hover:bg-white/5 hover:text-white/60"
                  onClick={() => setMode("choose")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to role selection
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;
