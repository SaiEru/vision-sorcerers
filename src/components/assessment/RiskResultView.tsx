import { RiskResult, AssessmentData } from "@/types/assessment";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, TrendingUp, Download, FileText, Loader2, Brain, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePdfReport } from "@/lib/generatePdfReport";

type CategorizedItem = { category: string; points?: string[]; steps?: string[] };

type Props = {
  result: RiskResult;
  onReset: () => void;
  data?: AssessmentData;
  aiExplanation?: string[];
  aiExplanationCategorized?: CategorizedItem[];
  clinicalStepsCategorized?: CategorizedItem[];
  clinicalStepsFlat?: string[];
  aiLoading?: boolean;
  doctorName?: string;
  doctorLicense?: string;
};

const riskColors: Record<string, string> = {
  Low: "bg-green-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-destructive",
};

const RiskResultView = ({
  result, onReset, data,
  aiExplanation = [], aiExplanationCategorized = [], clinicalStepsCategorized = [], clinicalStepsFlat = [],
  aiLoading = false, doctorName = "", doctorLicense = ""
}: Props) => {
  const handlePdfDownload = () => {
    generatePdfReport({
      patientName: data?.fullName || "Unknown",
      patientAge: data?.age || "",
      patientGender: data?.gender || "",
      patientContact: data?.contactNumber || "",
      diagnosis: "",
      surgeryType: data?.surgeryType || "",
      eyeSide: data?.eyeSide || "",
      anesthesiaType: data?.anesthesiaType || "",
      surgeryDate: data?.surgeryDate || "",
      surgeonName: data?.surgeonName || "",
      diabetes: data?.diabetes || "None",
      hypertension: data?.hypertension || false,
      immunocompromised: data?.immunocompromised || false,
      previousEyeSurgery: data?.previousEyeSurgery || false,
      allergies: data?.allergies || "",
      currentMedications: data?.currentMedications || "",
      preVisualAcuity: data?.preVisualAcuity || "",
      intraocularPressure: data?.intraocularPressure || "",
      postVisualAcuity: data?.postVisualAcuity || "",
      postIntraocularPressure: data?.postIntraocularPressure || "",
      cornealEdema: data?.cornealEdema || "",
      anteriorChamberReaction: data?.anteriorChamberReaction || "",
      woundIntegrity: data?.woundIntegrity || "",
      painLevel: data?.painLevel || "",
      riskScore: result.overallScore,
      riskLevel: result.riskLevel,
      riskExplanation: aiExplanation,
      clinicalSteps: clinicalStepsFlat,
      followUpDate: data?.followUpDate || "",
      clinicianNotes: data?.clinicianNotes || "",
      doctorName,
      doctorLicense,
      createdAt: new Date().toISOString(),
    });
  };

  const downloadTextReport = () => {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("     EYE COMPLICATION RISK ASSESSMENT REPORT");
    lines.push("═══════════════════════════════════════════════════════");
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push(`Overall Risk Score: ${result.overallScore}/100`);
    lines.push(`Risk Level: ${result.riskLevel}`);
    lines.push("");
    if (aiExplanation.length > 0) {
      lines.push("── AI RISK EXPLANATION ────────────────────────────");
      aiExplanation.forEach((b) => lines.push(`  • ${b}`));
      lines.push("");
    }
    if (clinicalStepsFlat.length > 0) {
      lines.push("── AI CLINICAL STEPS PREDICTION ───────────────────");
      clinicalStepsFlat.forEach((s) => lines.push(`  ▸ ${s}`));
      lines.push("");
    }
    lines.push("═══════════════════════════════════════════════════════");
    lines.push("DISCLAIMER: For demonstration purposes only.");
    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const patientName = data?.fullName || data?.patientId || "patient";
    a.download = `risk-assessment-${patientName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasCategories = aiExplanationCategorized.length > 0;
  const hasClinicalSteps = clinicalStepsCategorized.length > 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Score header */}
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Overall Risk Score</p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="text-6xl font-bold text-foreground">{result.overallScore}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <div className="mx-auto mt-4 max-w-xs">
          <Progress value={result.overallScore} className="h-3" />
        </div>
        <Badge className={`mt-4 ${riskColors[result.riskLevel]} text-primary-foreground px-4 py-1`}>
          {result.riskLevel} Risk
        </Badge>
      </div>

      {/* AI Risk Explanation with categories */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Risk Explanation</h3>
        </div>
        {aiLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI clinical analysis...
          </div>
        ) : hasCategories ? (
          <div className="space-y-4">
            {aiExplanationCategorized.map((cat, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{cat.category}</h4>
                <ul className="space-y-1.5 ml-1">
                  {(cat.points || []).map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : aiExplanation.length > 0 ? (
          <ul className="space-y-2">
            {aiExplanation.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
        )}
      </div>

      {/* AI Clinical Steps Prediction */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Clinical Steps Prediction</h3>
        </div>
        {aiLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating clinical recommendations...
          </div>
        ) : hasClinicalSteps ? (
          <div className="space-y-4">
            {clinicalStepsCategorized.map((cat, idx) => (
              <div key={idx}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{cat.category}</h4>
                <ul className="space-y-1.5 ml-1">
                  {(cat.steps || []).map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-0 w-0 border-l-[5px] border-t-[4px] border-b-[4px] border-l-primary border-t-transparent border-b-transparent shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : clinicalStepsFlat.length > 0 ? (
          <ul className="space-y-2">
            {clinicalStepsFlat.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-0 w-0 border-l-[5px] border-t-[4px] border-b-[4px] border-l-primary border-t-transparent border-b-transparent shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No clinical steps generated yet.</p>
        )}
      </div>

      {/* Risk Factors */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Contributing Risk Factors</h3>
        </div>
        {result.factors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No significant risk factors identified.</p>
        ) : (
          <div className="space-y-4">
            {result.factors.map((f) => (
              <div key={f.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{f.name}</span>
                  <span className="text-muted-foreground">+{f.contribution} pts</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(f.contribution * 5, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {result.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onReset}>New Assessment</Button>
        <Button variant="outline" className="gap-2" onClick={handlePdfDownload}>
          <FileText className="h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="gap-2" onClick={downloadTextReport}>
          <Download className="h-4 w-4" />
          Download TXT
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> This risk assessment is for demonstration purposes only. It should not be used as a substitute for professional medical evaluation.
      </p>
    </div>
  );
};

export default RiskResultView;
