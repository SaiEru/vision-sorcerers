export type AssessmentData = {
  // Step 1: Patient Demographics
  patientId: string;
  fullName: string;
  age: string;
  gender: string;
  contactNumber: string;

  // Step 2: Surgery Information
  surgeryType: string;
  surgeryDate: string;
  surgeonName: string;
  eyeSide: string;
  anesthesiaType: string;

  // Step 3: Medical History
  diabetes: string;
  hypertension: boolean;
  immunocompromised: boolean;
  previousEyeSurgery: boolean;
  allergies: string;
  currentMedications: string;

  // Step 4: Pre-operative Assessment
  preVisualAcuity: string;
  intraocularPressure: string;
  cornealCondition: string;
  lensStatus: string;
  pupilDilation: string;

  // Step 5: Post-operative Observations
  postVisualAcuity: string;
  postIntraocularPressure: string;
  cornealEdema: string;
  anteriorChamberReaction: string;
  woundIntegrity: string;
  painLevel: string;

  // Step 6: Symptoms & Complaints
  blurredVision: boolean;
  eyePain: boolean;
  redness: boolean;
  discharge: boolean;
  photophobia: boolean;
  floaters: boolean;
  additionalSymptoms: string;

  // Step 7: Follow-up & Media
  followUpDate: string;
  clinicianNotes: string;
  mediaUpload: File | null;
};

export const initialAssessmentData: AssessmentData = {
  patientId: "",
  fullName: "",
  age: "",
  gender: "",
  contactNumber: "",
  surgeryType: "",
  surgeryDate: "",
  surgeonName: "",
  eyeSide: "",
  anesthesiaType: "",
  diabetes: "none",
  hypertension: false,
  immunocompromised: false,
  previousEyeSurgery: false,
  allergies: "",
  currentMedications: "",
  preVisualAcuity: "",
  intraocularPressure: "",
  cornealCondition: "",
  lensStatus: "",
  pupilDilation: "",
  postVisualAcuity: "",
  postIntraocularPressure: "",
  cornealEdema: "",
  anteriorChamberReaction: "",
  woundIntegrity: "",
  painLevel: "",
  blurredVision: false,
  eyePain: false,
  redness: false,
  discharge: false,
  photophobia: false,
  floaters: false,
  additionalSymptoms: "",
  followUpDate: "",
  clinicianNotes: "",
  mediaUpload: null,
};

export type RiskResult = {
  overallScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  factors: { name: string; contribution: number; detail: string }[];
  recommendations: string[];
  explanation: string;
};
