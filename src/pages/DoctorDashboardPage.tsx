import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseDb";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Activity, Loader2, Search, ClipboardList, Eye } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

type Patient = {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  contact_number: string | null;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
};

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessmentCounts, setAssessmentCounts] = useState<Record<string, number>>({});
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [patientAssessments, setPatientAssessments] = useState<any[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ full_name: "", age: "", gender: "", contact_number: "", diagnosis: "", notes: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadPatients = async () => {
    if (!user) return;
    const { data } = await db
      .from("patients")
      .select("*")
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false });
    setPatients((data as Patient[]) || []);
    setLoading(false);
  };

  const loadAssessmentCounts = async () => {
    if (!user) return;
    const { data } = await db
      .from("assessments")
      .select("id, patient_id")
      .eq("doctor_id", user.id);
    if (data) {
      setTotalAssessments(data.length);
      const counts: Record<string, number> = {};
      data.forEach((a) => {
        if (a.patient_id) {
          counts[a.patient_id] = (counts[a.patient_id] || 0) + 1;
        }
      });
      setAssessmentCounts(counts);
    }
  };

  useEffect(() => {
    loadPatients();
    loadAssessmentCounts();
  }, [user]);

  const handleCreate = async () => {
    if (!form.full_name || !user) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await db.from("patients").insert({
      doctor_id: user.id,
      full_name: form.full_name,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      contact_number: form.contact_number || null,
      diagnosis: form.diagnosis || null,
      notes: form.notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Patient added" });
      setForm({ full_name: "", age: "", gender: "", contact_number: "", diagnosis: "", notes: "" });
      setOpen(false);
      loadPatients();
    }
  };

  const handleViewPatient = async (patient: Patient) => {
    setDetailPatient(patient);
    setLoadingAssessments(true);
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("doctor_id", user!.id)
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false });
    setPatientAssessments(data || []);
    setLoadingAssessments(false);
  };

  const handleStartAssessment = (patient: Patient) => {
    navigate(`/doctor/assessment?patientId=${patient.id}`);
  };

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const riskBadgeVariant = (level: string) => {
    if (level === "High" || level === "Critical") return "destructive" as const;
    if (level === "Low") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
            <p className="mt-2 text-muted-foreground">Manage your patient records.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><UserPlus className="h-4 w-4" />Add Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Patient</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                  <div><Label>Gender</Label><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Male/Female/Other" /></div>
                </div>
                <div><Label>Contact Number</Label><Input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} /></div>
                <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={handleCreate} disabled={submitting} className="w-full gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
            <div><p className="text-sm text-muted-foreground">Total Patients</p><p className="mt-1 text-3xl font-bold text-foreground">{patients.length}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="flex items-start justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
            <div><p className="text-sm text-muted-foreground">Assessments Done</p><p className="mt-1 text-3xl font-bold text-foreground">{totalAssessments}</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Activity className="h-5 w-5 text-primary" /></div>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">{search ? "No patients found" : "No patients yet"}</h3>
            <p className="mt-2 text-muted-foreground">Click "Add Patient" to add your first patient.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => handleViewPatient(p)}>{p.full_name}</h3>
                      {assessmentCounts[p.id] && (
                        <Badge variant="secondary" className="text-xs">{assessmentCounts[p.id]} assessment{assessmentCounts[p.id] > 1 ? "s" : ""}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.age && `Age: ${p.age}`} {p.gender && `· ${p.gender}`} {p.contact_number && `· ${p.contact_number}`}
                    </p>
                    {p.diagnosis && <Badge variant="outline" className="mt-2">{p.diagnosis}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleViewPatient(p)}>
                      <Eye className="h-3.5 w-3.5" />View
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => handleStartAssessment(p)}>
                      <ClipboardList className="h-3.5 w-3.5" />Assess
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient Detail Dialog */}
        <Dialog open={!!detailPatient} onOpenChange={(v) => { if (!v) setDetailPatient(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {detailPatient && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{detailPatient.full_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-medium text-foreground">{detailPatient.age || "—"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium text-foreground">{detailPatient.gender || "—"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="font-medium text-foreground">{detailPatient.contact_number || "—"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Added</p>
                      <p className="font-medium text-foreground">{new Date(detailPatient.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {detailPatient.diagnosis && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Diagnosis</p>
                      <p className="font-medium text-foreground">{detailPatient.diagnosis}</p>
                    </div>
                  )}
                  {detailPatient.notes && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="font-medium text-foreground">{detailPatient.notes}</p>
                    </div>
                  )}

                  {/* Assessments */}
                  <div>
                    <h4 className="mb-3 font-semibold text-foreground flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Assessment History
                    </h4>
                    {loadingAssessments ? (
                      <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : patientAssessments.length === 0 ? (
                      <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
                        <p className="text-sm text-muted-foreground">No assessments yet for this patient.</p>
                        <Button size="sm" className="mt-3 gap-1.5" onClick={() => { setDetailPatient(null); handleStartAssessment(detailPatient); }}>
                          <ClipboardList className="h-3.5 w-3.5" />Start Assessment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {patientAssessments.map((a: any) => {
                          const ad = a.assessment_data as any;
                          return (
                            <div key={a.id} className="rounded-lg border border-border bg-card p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={riskBadgeVariant(a.risk_level)}>{a.risk_level} Risk — {a.risk_score}%</Badge>
                                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">{a.status}</Badge>
                              </div>
                              {a.surgery_type && <p className="text-sm text-muted-foreground">Surgery: <strong>{a.surgery_type}</strong></p>}
                              {/* Additional assessment details */}
                              {ad && (
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                  {ad.surgeonName && <p><span className="text-muted-foreground">Surgeon:</span> {ad.surgeonName}</p>}
                                  {ad.eyeSide && <p><span className="text-muted-foreground">Eye:</span> {ad.eyeSide}</p>}
                                  {ad.preVisualAcuity && <p><span className="text-muted-foreground">Pre-op VA:</span> {ad.preVisualAcuity}</p>}
                                  {ad.postVisualAcuity && <p><span className="text-muted-foreground">Post-op VA:</span> {ad.postVisualAcuity}</p>}
                                  {ad.intraocularPressure && <p><span className="text-muted-foreground">Pre-op IOP:</span> {ad.intraocularPressure} mmHg</p>}
                                  {ad.postIntraocularPressure && <p><span className="text-muted-foreground">Post-op IOP:</span> {ad.postIntraocularPressure} mmHg</p>}
                                  {ad.cornealEdema && <p><span className="text-muted-foreground">Corneal Edema:</span> {ad.cornealEdema}</p>}
                                  {ad.painLevel && <p><span className="text-muted-foreground">Pain:</span> {ad.painLevel}/10</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button className="gap-1.5" onClick={() => { setDetailPatient(null); handleStartAssessment(detailPatient); }}>
                    <ClipboardList className="h-4 w-4" />New Assessment
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
