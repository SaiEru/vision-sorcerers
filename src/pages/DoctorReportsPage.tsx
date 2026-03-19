import AppLayout from "@/components/AppLayout";
import { FileText, Search, Calendar, ChevronDown, ChevronUp, User, Brain, Download, Filter, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/supabaseDb";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { generatePdfReport } from "@/lib/generatePdfReport";

const riskBadgeVariant = (level: string) => {
  if (level === "High" || level === "Critical") return "destructive" as const;
  if (level === "Low") return "secondary" as const;
  return "outline" as const;
};

const DoctorReportsPage = () => {
  const { user, profile } = useAuth();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [surgeryFilter, setSurgeryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: assessData }, { data: patientData }] = await Promise.all([
        db.from("assessments").select("*").eq("doctor_id", user.id).order("created_at", { ascending: false }),
        db.from("patients").select("*").eq("doctor_id", user.id),
      ]);
      setAssessments(assessData || []);
      const pMap: Record<string, any> = {};
      (patientData || []).forEach((p: any) => { pMap[p.id] = p; });
      setPatients(pMap);
      setLoading(false);
    };
    load();
  }, [user]);

  const surgeryTypes = useMemo(() => {
    const types = new Set<string>();
    assessments.forEach((a) => { if (a.surgery_type) types.add(a.surgery_type); });
    return Array.from(types);
  }, [assessments]);

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      if (search && !(a.patient_name || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (riskFilter !== "all" && a.risk_level !== riskFilter) return false;
      if (surgeryFilter !== "all" && a.surgery_type !== surgeryFilter) return false;
      if (dateFilter !== "all") {
        const d = new Date(a.created_at);
        const now = new Date();
        if (dateFilter === "7") { const cutoff = new Date(now.getTime() - 7 * 86400000); if (d < cutoff) return false; }
        if (dateFilter === "30") { const cutoff = new Date(now.getTime() - 30 * 86400000); if (d < cutoff) return false; }
        if (dateFilter === "90") { const cutoff = new Date(now.getTime() - 90 * 86400000); if (d < cutoff) return false; }
      }
      return true;
    });
  }, [assessments, search, riskFilter, surgeryFilter, dateFilter]);

  const handlePdfDownload = (a: any) => {
    const ad = a.assessment_data as any;
    const explanation = a.risk_explanation ? a.risk_explanation.split("\n").filter(Boolean) : [];
    const steps = a.clinical_steps ? a.clinical_steps.split("\n").filter(Boolean) : [];
    generatePdfReport({
      patientName: a.patient_name || "Unknown",
      patientAge: ad?.age || "",
      patientGender: ad?.gender || "",
      patientContact: ad?.contactNumber || "",
      diagnosis: "",
      surgeryType: ad?.surgeryType || a.surgery_type || "",
      eyeSide: ad?.eyeSide || "",
      anesthesiaType: ad?.anesthesiaType || "",
      surgeryDate: ad?.surgeryDate || "",
      surgeonName: ad?.surgeonName || "",
      diabetes: ad?.diabetes || "None",
      hypertension: ad?.hypertension || false,
      immunocompromised: ad?.immunocompromised || false,
      previousEyeSurgery: ad?.previousEyeSurgery || false,
      allergies: ad?.allergies || "",
      currentMedications: ad?.currentMedications || "",
      preVisualAcuity: ad?.preVisualAcuity || "",
      intraocularPressure: ad?.intraocularPressure || "",
      postVisualAcuity: ad?.postVisualAcuity || "",
      postIntraocularPressure: ad?.postIntraocularPressure || "",
      cornealEdema: ad?.cornealEdema || "",
      anteriorChamberReaction: ad?.anteriorChamberReaction || "",
      woundIntegrity: ad?.woundIntegrity || "",
      painLevel: ad?.painLevel || "",
      riskScore: a.risk_score,
      riskLevel: a.risk_level,
      riskExplanation: explanation,
      clinicalSteps: steps,
      followUpDate: ad?.followUpDate || "",
      clinicianNotes: ad?.clinicianNotes || "",
      doctorName: profile?.full_name || "",
      doctorLicense: profile?.license_number || "",
      createdAt: a.created_at,
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">My Assessment Reports</h1>
        <p className="mt-2 text-muted-foreground">Click on a report to view full details. Use filters to narrow results.</p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient name..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={surgeryFilter} onValueChange={setSurgeryFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Surgery Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surgeries</SelectItem>
              {surgeryTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]"><Calendar className="h-3 w-3 mr-1" /><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No reports found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or complete an assessment.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id;
              const ad = a.assessment_data as any;
              const patient = a.patient_id ? patients[a.patient_id] : null;
              const explanation = a.risk_explanation ? a.risk_explanation.split("\n").filter(Boolean) : [];
              const clinicalSteps = a.clinical_steps ? a.clinical_steps.split("\n").filter(Boolean) : [];

              return (
                <div key={a.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all">
                  <button onClick={() => setExpandedId(isExpanded ? null : a.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{a.patient_name || "Unknown Patient"}</span>
                          <Badge variant={riskBadgeVariant(a.risk_level)}>{a.risk_level} Risk — {a.risk_score}%</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3 inline" /> {new Date(a.created_at).toLocaleDateString()} at {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {a.surgery_type && <> · Surgery: <strong>{a.surgery_type}</strong></>}
                          {" · "}{a.status}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border p-5 space-y-5 bg-muted/10">
                      {/* AI Explanation */}
                      {explanation.length > 0 && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />AI Risk Explanation
                          </h4>
                          <ul className="space-y-1">
                            {explanation.map((b: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Clinical Steps */}
                      {clinicalSteps.length > 0 && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-primary" />AI Clinical Steps Prediction
                          </h4>
                          <ul className="space-y-1">
                            {clinicalSteps.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-0 w-0 border-l-[5px] border-t-[4px] border-b-[4px] border-l-primary border-t-transparent border-b-transparent shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" />Patient Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{a.patient_name || ad?.fullName || "—"}</p></div>
                          <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Age</p><p className="text-sm font-medium text-foreground">{ad?.age || patient?.age || "—"}</p></div>
                          <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Gender</p><p className="text-sm font-medium text-foreground">{ad?.gender || patient?.gender || "—"}</p></div>
                          <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Contact</p><p className="text-sm font-medium text-foreground">{ad?.contactNumber || patient?.contact_number || "—"}</p></div>
                        </div>
                      </div>

                      {/* Surgery info */}
                      {ad && (ad.surgeryType || ad.surgeonName || ad.eyeSide) && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Surgery Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ad.surgeryType && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground">{ad.surgeryType}</p></div>}
                            {ad.surgeonName && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Surgeon</p><p className="text-sm font-medium text-foreground">{ad.surgeonName}</p></div>}
                            {ad.eyeSide && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Eye</p><p className="text-sm font-medium text-foreground">{ad.eyeSide}</p></div>}
                            {ad.anesthesiaType && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Anesthesia</p><p className="text-sm font-medium text-foreground">{ad.anesthesiaType}</p></div>}
                          </div>
                        </div>
                      )}

                      {/* Medical history */}
                      {ad && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Medical History</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Diabetes</p><p className="text-sm font-medium text-foreground">{ad.diabetes || "None"}</p></div>
                            <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Hypertension</p><p className="text-sm font-medium text-foreground">{ad.hypertension ? "Yes" : "No"}</p></div>
                            <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Immunocompromised</p><p className="text-sm font-medium text-foreground">{ad.immunocompromised ? "Yes" : "No"}</p></div>
                            <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Previous Eye Surgery</p><p className="text-sm font-medium text-foreground">{ad.previousEyeSurgery ? "Yes" : "No"}</p></div>
                          </div>
                        </div>
                      )}

                      {/* Clinical measurements */}
                      {ad && (ad.preVisualAcuity || ad.postVisualAcuity || ad.intraocularPressure || ad.postIntraocularPressure) && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Clinical Measurements</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ad.preVisualAcuity && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Pre-op VA</p><p className="text-sm font-medium text-foreground">{ad.preVisualAcuity}</p></div>}
                            {ad.postVisualAcuity && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Post-op VA</p><p className="text-sm font-medium text-foreground">{ad.postVisualAcuity}</p></div>}
                            {ad.intraocularPressure && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Pre-op IOP</p><p className="text-sm font-medium text-foreground">{ad.intraocularPressure} mmHg</p></div>}
                            {ad.postIntraocularPressure && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Post-op IOP</p><p className="text-sm font-medium text-foreground">{ad.postIntraocularPressure} mmHg</p></div>}
                            {ad.cornealEdema && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Corneal Edema</p><p className="text-sm font-medium text-foreground">{ad.cornealEdema}</p></div>}
                            {ad.woundIntegrity && <div className="rounded-lg border border-border bg-card p-3"><p className="text-xs text-muted-foreground">Wound Integrity</p><p className="text-sm font-medium text-foreground">{ad.woundIntegrity}</p></div>}
                          </div>
                        </div>
                      )}

                      {/* Symptoms */}
                      {ad && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Symptoms</h4>
                          <div className="flex flex-wrap gap-2">
                            {ad.blurredVision && <Badge variant="outline">Blurred Vision</Badge>}
                            {ad.eyePain && <Badge variant="outline">Eye Pain</Badge>}
                            {ad.redness && <Badge variant="outline">Redness</Badge>}
                            {ad.discharge && <Badge variant="outline">Discharge</Badge>}
                            {ad.photophobia && <Badge variant="outline">Photophobia</Badge>}
                            {ad.floaters && <Badge variant="outline">Floaters</Badge>}
                            {!ad.blurredVision && !ad.eyePain && !ad.redness && !ad.discharge && !ad.photophobia && !ad.floaters && (
                              <span className="text-sm text-muted-foreground">No symptoms reported</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {ad?.clinicianNotes && (
                        <div className="rounded-lg border border-border bg-card p-4">
                          <p className="text-xs text-muted-foreground mb-1">Clinician Notes</p>
                          <p className="text-sm text-foreground">{ad.clinicianNotes}</p>
                        </div>
                      )}

                      {/* Download PDF */}
                      <Button variant="outline" className="gap-2" onClick={() => handlePdfDownload(a)}>
                        <Download className="h-4 w-4" />
                        Download PDF Report
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </AppLayout>
  );
};

export default DoctorReportsPage;
