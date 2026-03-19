import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Shield, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [mode, setMode] = useState<"choose" | "admin" | "doctor">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard");
    }
  }, [user, profile, loading, navigate]);

  // Seed admin on mount
  useEffect(() => {
    const seedAdmin = async () => {
      setSeeding(true);
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        await fetch(`${url}/functions/v1/seed-admin`, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        });
      } catch {
        // ignore
      }
      setSeeding(false);
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

  if (loading || seeding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
            <Eye className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Eye Complication Risk</h1>
            <p className="text-xs text-muted-foreground">Intelligence Platform</p>
          </div>
        </div>

        <h2 className="mb-8 text-2xl font-bold text-foreground">Sign In As</h2>

        <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
          <button
            onClick={() => { setMode("admin"); setEmail("erukullasai0@gmail.com"); setPassword(""); }}
            className="group rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Admin</h3>
            <p className="mt-2 text-sm text-muted-foreground">Manage doctors, view hospital analytics</p>
          </button>

          <button
            onClick={() => { setMode("doctor"); setEmail(""); setPassword(""); }}
            className="group rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Doctor</h3>
            <p className="mt-2 text-sm text-muted-foreground">Patient assessments, reports & analytics</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          {mode === "admin" ? <Shield className="h-6 w-6 text-primary-foreground" /> : <Stethoscope className="h-6 w-6 text-primary-foreground" />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{mode === "admin" ? "Admin" : "Doctor"} Sign In</h1>
          <p className="text-xs text-muted-foreground">Eye Complication Risk Intelligence Platform</p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              readOnly={mode === "admin"}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>
          <Button onClick={handleSignIn} disabled={submitting} className="w-full gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </div>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => setMode("choose")}>
          ← Back to role selection
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
