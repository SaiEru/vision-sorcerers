import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, PenLine, ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useSearchParams } from "react-router-dom";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Pre-fill patient info if patientId is provided
  useEffect(() => {
    if (!patientId || !user) return;
    const loadPatient = async () => {
      const { data: patient } = await supabase
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
    await supabase.from("assessments").insert({
      doctor_id: user.id,
      patient_id: patientId || null,
      patient_name: assessmentData.fullName || "Unknown",
      assessment_data: assessmentData as any,
      risk_score: riskResult.overallScore,
      risk_level: riskResult.riskLevel,
      surgery_type: assessmentData.surgeryType || "",
      status: "Completed",
      risk_explanation: explanation.join("\n"),
      clinical_steps: steps.join("\n"),
    } as any);
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
  };

  const handleUploadClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Unsupported file type. Please upload a PDF, JPEG, or PNG file.");
      toast({ title: "Invalid file type", description: "Please upload a PDF, JPEG, or PNG medical report.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setUploadError("");
    setMode("uploading");

    try {
      let fileContent: string | undefined;
      let fileText: string | undefined;

      if (file.type === "application/pdf") {
        fileText = await extractPdfText(file);
        if (!fileText || fileText.length < 30) {
          throw new Error("Could not read enough text from this PDF. Please upload a clearer report or image.");
        }
      } else {
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/extract-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ fileContent, fileText, fileType: file.type, fileName: file.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "invalid_document") {
          const docType = result.documentType || "non-medical document";
          const invalidMessage = result.message || `The uploaded file appears to be a "${docType}". Please upload a valid medical or ophthalmological report.`;
          setUploadError(invalidMessage);
          toast({ title: `Invalid document: ${docType}`, description: "Please upload a medical report to proceed.", variant: "destructive" });
          setMode("entry");
          return;
        }
        throw new Error(result.message || result.error || "Failed to process report");
      }

      if (result.data) {
        const extracted = result.data;
        const newData = {
          ...initialAssessmentData,
          // Keep patient info if pre-filled
          ...(patientId ? { patientId, fullName: patientName || data.fullName, age: data.age, gender: data.gender, contactNumber: data.contactNumber } : {}),
          ...Object.fromEntries(
            Object.entries(extracted).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
          ),
        };
        setData(newData);

        const riskResult = calculateRiskScore(newData as AssessmentData);
        setResult(riskResult);
        setMode("result");
        setAiLoading(true);
        const aiResult = await generateAIExplanation(newData as AssessmentData, riskResult);
        setAiExplanation(aiResult.flat);
        setAiExplanationCategorized(aiResult.categorized);
        setClinicalStepsCategorized(aiResult.clinicalStepsCategorized);
        setClinicalStepsFlat(aiResult.flatSteps);
        setAiLoading(false);
        await saveAssessment(newData as AssessmentData, riskResult, aiResult.flat, aiResult.flatSteps);

        toast({ title: "Report processed successfully", description: "Clinical values extracted and risk score calculated." });
      }
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Failed to process the report";
      setUploadError(message);
      toast({ title: "Processing failed", description: message + " Please try again or use manual entry.", variant: "destructive" });
      setMode("entry");
    }
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
    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelected} />
  );

  if (mode === "uploading") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        {fileInput}
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-6 text-xl font-semibold text-foreground">Processing Medical Report...</h2>
          <p className="mt-2 text-muted-foreground">AI is extracting clinical values from your report. This may take a moment.</p>
        </div>
      </div>
    );
  }

  if (mode === "entry") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        {fileInput}
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-3xl font-bold text-foreground">Patient Risk Assessment</h1>
          {patientName && (
            <p className="mt-1 text-lg text-primary font-medium">Patient: {patientName}</p>
          )}
          <p className="mt-2 text-muted-foreground">Choose how you'd like to enter clinical data.</p>

          {uploadError && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {uploadError}
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <button onClick={handleUploadClick} className="group rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Upload Medical Report</h3>
              <p className="mt-2 text-sm text-muted-foreground">Upload a PDF or image-based post-operative report. AI will extract clinical values and pre-fill the form.</p>
              <p className="mt-4 text-xs text-muted-foreground">Supports PDF, JPEG, PNG</p>
            </button>

            <button onClick={() => setMode("form")} className="group rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
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
      </div>
    );
  }

  if (mode === "result" && result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Risk Assessment Results</h1>
          <RiskResultView result={result} onReset={handleReset} data={data} aiExplanation={aiExplanation} aiExplanationCategorized={aiExplanationCategorized} clinicalStepsCategorized={clinicalStepsCategorized} clinicalStepsFlat={clinicalStepsFlat} aiLoading={aiLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {fileInput}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step === 0 ? setMode("entry") : setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Risk Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of 7 — {stepLabels[step]}
              {patientName && <> · <span className="text-primary">{patientName}</span></>}
            </p>
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

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          {renderStep()}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => step === 0 ? setMode("entry") : setStep(step - 1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Back" : "Previous"}
          </Button>

          {step < 6 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleAnalyze} className="gap-2 bg-primary shadow-lg shadow-primary/25">
              <CheckCircle2 className="h-4 w-4" />
              Analyze Risk
            </Button>
          )}
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          <p><strong>Disclaimer:</strong> For demonstration purposes only. Not a medical diagnosis tool.</p>
        </footer>
      </div>
    </div>
  );
};

export default AssessmentPage;
