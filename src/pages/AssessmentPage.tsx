import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { FileText, PenLine, ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle, X, Plus, Languages } from "lucide-react";
import { AssessmentData, initialAssessmentData, RiskResult } from "@/types/assessment";
import { calculateRiskScore } from "@/lib/riskCalculator";
import Step1Demographics from "@/components/assessment/Step1Demographics";
import Step2Surgery from "@/components/assessment/Step2Surgery";
import Step3MedicalHistory from "@/components/assessment/Step3MedicalHistory";
import Step4PreOperative from "@/components/assessment/Step4PreOperative";
import Step5PostOperative from "@/components/assessment/Step5PostOperative";
import Step6Symptoms from "@/components/assessment/Step6Symptoms";
import Step7FollowUp from "@/components/assessment/Step7FollowUp";
import RiskResultView from "@/components/assessment/RiskResultView";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseDb";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const stepLabels = [
  "Demographics",
  "Surgery Info",
  "Medical History",
  "Pre-operative",
  "Post-operative",
  "Symptoms",
  "Follow-up",
];

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "telugu", label: "Telugu (తెలుగు)" },
  { value: "kannada", label: "Kannada (ಕನ್ನಡ)" },
];

GlobalWorkerOptions.workerSrc = pdfWorker;

const extractPdfText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const pagesToRead = Math.min(pdf.numPages, 10);
  const textChunks: string[] = [];

  for (let pageIndex = 1; pageIndex <= pagesToRead; pageIndex++) {
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (pageText) textChunks.push(pageText);
  }

  return textChunks.join("\n").trim();
};

type UploadedFile = {
  file: File;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
};

type Mode = "entry" | "uploading" | "form" | "result";

const AssessmentPage = () => {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [mode, setMode] = useState<Mode>("entry");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentData>(initialAssessmentData);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [patientName, setPatientName] = useState("");
  const [language, setLanguage] = useState("english");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!patientId || !user) return;
    const loadPatient = async () => {
      const { data: patient } = await db
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .eq("doctor_id", user.id)
        .single();
      if (patient) {
        setPatientName(patient.full_name);
        setData((prev) => ({
          ...prev,
          patientId: patient.id,
          fullName: patient.full_name,
          age: patient.age?.toString() || "",
          gender: patient.gender || "",
          contactNumber: patient.contact_number || "",
        }));
      }
    };
    loadPatient();
  }, [patientId, user]);

  type CategorizedItem = { category: string; points?: string[]; steps?: string[] };

  const generateAIExplanation = async (assessmentData: AssessmentData, riskResult: RiskResult): Promise<{
    flat: string[];
    categorized: CategorizedItem[];
    clinicalStepsCategorized: CategorizedItem[];
    flatSteps: string[];
  }> => {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-risk-explanation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          assessmentData,
          riskScore: riskResult.overallScore,
          riskLevel: riskResult.riskLevel,
          factors: riskResult.factors,
          language,
        }),
      });
      if (!response.ok) return { flat: [], categorized: [], clinicalStepsCategorized: [], flatSteps: [] };
      const data = await response.json();
      return {
        flat: data.explanation || [],
        categorized: data.riskExplanation || [],
        clinicalStepsCategorized: data.clinicalSteps || [],
        flatSteps: data.flatSteps || [],
      };
    } catch {
      return { flat: [], categorized: [], clinicalStepsCategorized: [], flatSteps: [] };
    }
  };

  const saveAssessment = async (assessmentData: AssessmentData, riskResult: RiskResult, explanation: string[] = [], steps: string[] = []) => {
    if (!user) return;
    await db.from("assessments").insert({
      doctor_id: user.id,
      patient_id: patientId || null,
      patient_name: assessmentData.fullName || "Unknown",
      assessment_data: { ...assessmentData, language } as any,
      risk_score: riskResult.overallScore,
      risk_level: riskResult.riskLevel,
      surgery_type: assessmentData.surgeryType || "",
      status: "Completed",
      risk_explanation: explanation.join("\n"),
      clinical_steps: steps.join("\n"),
    });
  };

  const handleChange = (partial: Partial<AssessmentData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const [aiExplanation, setAiExplanation] = useState<string[]>([]);
  const [aiExplanationCategorized, setAiExplanationCategorized] = useState<CategorizedItem[]>([]);
  const [clinicalStepsCategorized, setClinicalStepsCategorized] = useState<CategorizedItem[]>([]);
  const [clinicalStepsFlat, setClinicalStepsFlat] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAnalyze = async () => {
    const r = calculateRiskScore(data);
    setResult(r);
    setMode("result");
    setAiLoading(true);
    const aiResult = await generateAIExplanation(data, r);
    setAiExplanation(aiResult.flat);
    setAiExplanationCategorized(aiResult.categorized);
    setClinicalStepsCategorized(aiResult.clinicalStepsCategorized);
    setClinicalStepsFlat(aiResult.flatSteps);
    setAiLoading(false);
    await saveAssessment(data, r, aiResult.flat, aiResult.flatSteps);
  };

  const handleReset = () => {
    setData(initialAssessmentData);
    setResult(null);
    setStep(0);
    setMode("entry");
    setUploadError("");
    setUploadedFiles([]);
  };

  const handleUploadClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    const valid: UploadedFile[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: `${file.name} is not supported. Use PDF, JPEG, or PNG.`, variant: "destructive" });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 10MB limit.`, variant: "destructive" });
        continue;
      }
      valid.push({ file, status: "pending" });
    }

    if (valid.length > 0) {
      setUploadedFiles((prev) => [...prev, ...valid]);
    }
  };

  const processAllReports = async () => {
    if (uploadedFiles.length === 0) {
      toast({ title: "No files", description: "Please add at least one medical report.", variant: "destructive" });
      return;
    }

    setMode("uploading");
    let mergedData = { ...initialAssessmentData };

    // Keep patient info if pre-filled
    if (patientId) {
      mergedData = {
        ...mergedData,
        patientId,
        fullName: patientName || data.fullName,
        age: data.age,
        gender: data.gender,
        contactNumber: data.contactNumber,
      };
    }

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    let successCount = 0;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const uf = uploadedFiles[i];
      setUploadedFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "processing" } : f));

      try {
        let fileContent: string | undefined;
        let fileText: string | undefined;

        if (uf.file.type === "application/pdf") {
          fileText = await extractPdfText(uf.file);
          if (!fileText || fileText.length < 30) {
            throw new Error("Could not read enough text from this PDF.");
          }
        } else {
          fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(uf.file);
          });
        }

        const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-report`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify({ fileContent, fileText, fileType: uf.file.type, fileName: uf.file.name }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || result.error || "Failed to process report");
        }

        if (result.data) {
          // Merge: non-empty extracted values overwrite previous
          const extracted = result.data;
          for (const [key, value] of Object.entries(extracted)) {
            if (value !== "" && value !== null && value !== undefined && value !== false) {
              (mergedData as any)[key] = value;
            }
          }
          successCount++;
        }

        setUploadedFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        setUploadedFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "error", error: message } : f));
      }
    }

    if (successCount === 0) {
      toast({ title: "No reports processed", description: "None of the uploaded files could be processed. Please try again.", variant: "destructive" });
      setMode("entry");
      return;
    }

    setData(mergedData);
    const riskResult = calculateRiskScore(mergedData as AssessmentData);
    setResult(riskResult);
    setMode("result");
    setAiLoading(true);
    const aiResult = await generateAIExplanation(mergedData as AssessmentData, riskResult);
    setAiExplanation(aiResult.flat);
    setAiExplanationCategorized(aiResult.categorized);
    setClinicalStepsCategorized(aiResult.clinicalStepsCategorized);
    setClinicalStepsFlat(aiResult.flatSteps);
    setAiLoading(false);
    await saveAssessment(mergedData as AssessmentData, riskResult, aiResult.flat, aiResult.flatSteps);

    toast({ title: "Reports processed", description: `${successCount} report(s) extracted and analyzed.` });
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1Demographics data={data} onChange={handleChange} />;
      case 1: return <Step2Surgery data={data} onChange={handleChange} />;
      case 2: return <Step3MedicalHistory data={data} onChange={handleChange} />;
      case 3: return <Step4PreOperative data={data} onChange={handleChange} />;
      case 4: return <Step5PostOperative data={data} onChange={handleChange} />;
      case 5: return <Step6Symptoms data={data} onChange={handleChange} />;
      case 6: return <Step7FollowUp data={data} onChange={handleChange} />;
      default: return null;
    }
  };

  const fileInput = (
    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleFilesSelected} />
  );

  if (mode === "uploading") {
    return (
      <AppLayout>
        {fileInput}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-6 text-xl font-semibold text-foreground">Processing {uploadedFiles.length} Report(s)...</h2>
          <p className="mt-2 text-muted-foreground">AI is extracting clinical values. This may take a moment.</p>
          <div className="mt-8 max-w-md mx-auto space-y-2">
            {uploadedFiles.map((uf, i) => (
              <div key={i} className="flex items-center gap-3 glass-card p-3 rounded-lg text-sm">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1 text-foreground">{uf.file.name}</span>
                {uf.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {uf.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {uf.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                {uf.status === "pending" && <span className="text-xs text-muted-foreground">Waiting</span>}
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (mode === "entry") {
    return (
      <AppLayout>
        {fileInput}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-3xl font-bold text-foreground">Patient Risk Assessment</h1>
          {patientName && <p className="mt-1 text-lg text-primary font-medium">Patient: {patientName}</p>}
          <p className="mt-2 text-muted-foreground">Choose how you'd like to enter clinical data.</p>

          {/* Language selector */}
          <div className="mt-6 flex items-center gap-3">
            <Languages className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">AI Output Language:</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[200px] border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {uploadError && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />{uploadError}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Upload Reports Card */}
            <div className="glass-card glow-border p-8 transition-all">
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Upload Medical Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">Upload one or more PDF/image reports. AI will extract and merge clinical values.</p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  {uploadedFiles.map((uf, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-2 text-sm">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1 text-foreground">{uf.file.name}</span>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={handleUploadClick} className="gap-2 w-full border-border">
                  <Plus className="h-4 w-4" />
                  Add Report{uploadedFiles.length > 0 ? "s" : ""}
                </Button>
                {uploadedFiles.length > 0 && (
                  <Button onClick={processAllReports} className="gap-2 w-full shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                    <CheckCircle2 className="h-4 w-4" />
                    Process {uploadedFiles.length} Report{uploadedFiles.length > 1 ? "s" : ""} & Analyze
                  </Button>
                )}
              </div>
              <p className="mt-3 text-xs text-center text-muted-foreground">Supports PDF, JPEG, PNG · Max 10MB each</p>
            </div>

            {/* Manual Entry Card */}
            <button onClick={() => setMode("form")} className="group glass-card glow-border p-8 text-center transition-all hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <PenLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Manual Data Entry</h3>
              <p className="mt-2 text-sm text-muted-foreground">Enter all clinical data manually using the step-by-step assessment form.</p>
              <p className="mt-4 text-xs text-muted-foreground">7 assessment steps</p>
            </button>
          </div>

          <footer className="mt-16 flex flex-wrap items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <p><strong>Disclaimer:</strong> For demonstration purposes only. Not a medical diagnosis tool.</p>
            <p>Built using AI &amp; Machine Learning concepts</p>
          </footer>
        </div>
      </AppLayout>
    );
  }

  if (mode === "result" && result) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Risk Assessment Results</h1>
          <RiskResultView
            result={result} onReset={handleReset} data={data}
            aiExplanation={aiExplanation} aiExplanationCategorized={aiExplanationCategorized}
            clinicalStepsCategorized={clinicalStepsCategorized} clinicalStepsFlat={clinicalStepsFlat}
            aiLoading={aiLoading} language={language}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {fileInput}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step === 0 ? setMode("entry") : setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Patient Risk Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of 7 — {stepLabels[step]}
              {patientName && <> · <span className="text-primary">{patientName}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-1">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-[10px] text-muted-foreground md:block">{label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card glow-border p-5 sm:p-8">
          {renderStep()}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => step === 0 ? setMode("entry") : setStep(step - 1)} className="gap-2 border-border">
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Back" : "Previous"}
          </Button>

          {step < 6 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleAnalyze} className="gap-2 bg-primary shadow-[0_0_25px_hsl(var(--primary)/0.3)]">
              <CheckCircle2 className="h-4 w-4" />
              Analyze Risk
            </Button>
          )}
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p><strong>Disclaimer:</strong> For demonstration purposes only. Not a medical diagnosis tool.</p>
        </footer>
      </div>
    </AppLayout>
  );
};

export default AssessmentPage;
