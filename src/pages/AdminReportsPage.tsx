import AppLayout from "@/components/AppLayout";
import { FileText, Search, Calendar, ChevronDown, ChevronUp, Stethoscope, Brain, Download, Filter, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/supabaseDb";
import { Loader2 } from "lucide-react";
import { generatePdfReport } from "@/lib/generatePdfReport";

const riskBadgeVariant = (level: string) => {
  if (level === "High" || level === "Critical") return "destructive" as const;
  if (level === "Low") return "secondary" as const;
  return "outline" as const;
};

const AdminReportsPage = () => {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [surgeryFilter, setSurgeryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: assessData }, { data: doctorRoleRows }] = await Promise.all([
        db.from("assessments").select("*").order("created_at", { ascending: false }),
        db.from("user_roles").select("user_id").eq("role", "doctor"),
      ]);

      const doctorIds = (doctorRoleRows || []).map((r: any) => r.user_id);
      const { data: profileData } = doctorIds.length
        ? await db.from("profiles").select("*").in("id", doctorIds)
        : { data: [] as any[] };

      setAssessments(assessData || []);
      const map: Record<string, any> = {};
      (profileData || []).forEach((p: any) => { map[p.id] = p; });
      setDoctors(map);
      setLoading(false);
    };
    load();
  }, []);

  const doctorList = useMemo(() => Object.entries(doctors).map(([id, d]) => ({ id, name: (d as any).full_name })), [doctors]);
  const surgeryTypes = useMemo(() => {
    const types = new Set<string>();
    assessments.forEach((a) => { if (a.surgery_type) types.add(a.surgery_type); });
    return Array.from(types);
  }, [assessments]);

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      if (search && !(a.patient_name || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (doctorFilter !== "all" && a.doctor_id !== doctorFilter) return false;
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
  }, [assessments, search, doctorFilter, riskFilter, surgeryFilter, dateFilter]);

  const handlePdfDownload = (a: any) => {
    const ad = a.assessment_data as any;
    const doc = doctors[a.doctor_id] as any;
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
      doctorName: doc?.full_name || "",
      doctorLicense: doc?.license_number || "",
      createdAt: a.created_at,
    });
  };

  const renderAssessmentData = (data: any) => {
    if (!data || typeof data !== "object") return <p className="text-xs text-muted-foreground">No assessment data available.</p>;
    const renderDetail = (label: string, value: any) => {
      if (value === undefined || value === null || value === "") return null;
      return (
        <div className="flex justify-between border-b border-border py-2 last:border-0">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{String(value)}</span>
        </div>
      );
    };
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Demographics</h4>
          {renderDetail("Name", data.fullName)}
          {renderDetail("Age", data.age)}
          {renderDetail("Gender", data.gender)}
          {renderDetail("Contact", data.contactNumber)}
          {renderDetail("Diabetes", data.diabetes)}
          {renderDetail("Hypertension", data.hypertension ? "Yes" : "No")}
        </div>
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Surgery Details</h4>
          {renderDetail("Surgery Type", data.surgeryType)}
          {renderDetail("Eye", data.eyeSide)}
          {renderDetail("Anesthesia", data.anesthesiaType)}
          {renderDetail("Surgeon", data.surgeonName)}
          {renderDetail("Surgery Date", data.surgeryDate)}
        </div>
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Medical History</h4>
          {renderDetail("Immunocompromised", data.immunocompromised ? "Yes" : "No")}
          {renderDetail("Previous Eye Surgery", data.previousEyeSurgery ? "Yes" : "No")}
          {renderDetail("Allergies", data.allergies)}
          {renderDetail("Medications", data.currentMedications)}
        </div>
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">Clinical Measurements</h4>
          {renderDetail("Pre-op VA", data.preVisualAcuity)}
          {renderDetail("Pre-op IOP", data.intraocularPressure)}
          {renderDetail("Post-op VA", data.postVisualAcuity)}
          {renderDetail("Post-op IOP", data.postIntraocularPressure)}
          {renderDetail("Corneal Edema", data.cornealEdema)}
          {renderDetail("AC Reaction", data.anteriorChamberReaction)}
          {renderDetail("Wound Integrity", data.woundIntegrity)}
          {renderDetail("Pain Level", data.painLevel)}
        </div>
        <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 sm:col-span-2">
          <h4 className="text-xs font-semibold text-foreground mb-2">Symptoms & Follow-Up</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.blurredVision && <Badge variant="outline" className="text-xs">Blurred Vision</Badge>}
            {data.eyePain && <Badge variant="outline" className="text-xs">Eye Pain</Badge>}
            {data.redness && <Badge variant="outline" className="text-xs">Redness</Badge>}
            {data.discharge && <Badge variant="outline" className="text-xs">Discharge</Badge>}
            {data.photophobia && <Badge variant="outline" className="text-xs">Photophobia</Badge>}
            {data.floaters && <Badge variant="outline" className="text-xs">Floaters</Badge>}
          </div>
          {renderDetail("Follow-Up Date", data.followUpDate)}
          {renderDetail("Notes", data.clinicianNotes)}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">All Assessment Reports</h1>
        <p className="mt-2 text-muted-foreground">Hospital-wide patient assessment reports with advanced filtering.</p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient name..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-[160px]"><Stethoscope className="h-3 w-3 mr-1" /><SelectValue placeholder="Doctor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctorList.map((d) => <SelectItem key={d.id} value={d.id}>Dr. {d.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
            <p className="mt-2 text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((a) => {
              const isExpanded = expandedId === a.id;
              const explanation = a.risk_explanation ? a.risk_explanation.split("\n").filter(Boolean) : [];
              const clinicalSteps = a.clinical_steps ? a.clinical_steps.split("\n").filter(Boolean) : [];
              return (
                <div key={a.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{a.patient_name || "Unknown"}</span>
                          <Badge variant={riskBadgeVariant(a.risk_level)}>{a.risk_level} Risk — {a.risk_score}%</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(a.created_at).toLocaleDateString()} at {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {a.surgery_type && <span>· Surgery: <strong>{a.surgery_type}</strong></span>}
                          <span>· {a.status}</span>
                          <span className="flex items-center gap-1">· <Stethoscope className="h-3 w-3" /> Dr. {(doctors[a.doctor_id] as any)?.full_name || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
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
                            <ClipboardList className="h-4 w-4 text-primary" />AI Clinical Steps Prediction
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

                      <h3 className="text-sm font-semibold text-foreground">Full Assessment Details</h3>
                      {renderAssessmentData(a.assessment_data)}

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
  );
};

export default AdminReportsPage;
