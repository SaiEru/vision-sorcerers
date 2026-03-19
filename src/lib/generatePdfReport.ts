import jsPDF from "jspdf";
// @ts-ignore
import "jspdf-autotable";

interface ReportData {
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientContact: string;
  diagnosis: string;
  surgeryType: string;
  eyeSide: string;
  anesthesiaType: string;
  surgeryDate: string;
  surgeonName: string;
  diabetes: string;
  hypertension: boolean;
  immunocompromised: boolean;
  previousEyeSurgery: boolean;
  allergies: string;
  currentMedications: string;
  preVisualAcuity: string;
  intraocularPressure: string;
  postVisualAcuity: string;
  postIntraocularPressure: string;
  cornealEdema: string;
  anteriorChamberReaction: string;
  woundIntegrity: string;
  painLevel: string;
  riskScore: number;
  riskLevel: string;
  riskExplanation: string[];
  clinicalSteps?: string[];
  followUpDate: string;
  clinicianNotes: string;
  doctorName: string;
  doctorLicense: string;
  createdAt: string;
}

export function generatePdfReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Hospital Header
  doc.setFillColor(30, 64, 120);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MindEye Spark Hospital", pageWidth / 2, 14, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Department of Ophthalmology", pageWidth / 2, 21, { align: "center" });
  doc.text(`Attending Doctor: Dr. ${data.doctorName || "N/A"}  |  License: ${data.doctorLicense || "N/A"}`, pageWidth / 2, 28, { align: "center" });
  doc.setTextColor(0, 0, 0);
  y = 42;

  // Report date
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date(data.createdAt || Date.now()).toLocaleString()}`, pageWidth - 15, y, { align: "right" });
  y += 8;

  const sectionHeader = (title: string) => {
    if (y > 260) { doc.addPage(); y = 15; }
    doc.setFillColor(240, 243, 248);
    doc.rect(15, y - 4, pageWidth - 30, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 120);
    doc.text(title, 18, y + 1);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 10;
  };

  const addRow = (label: string, value: string) => {
    if (!value || value === "undefined") return;
    if (y > 275) { doc.addPage(); y = 15; }
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label + ":", 18, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(value, 75, y);
    doc.setFont("helvetica", "normal");
    y += 6;
  };

  // Patient Details
  sectionHeader("Patient Details");
  addRow("Name", data.patientName);
  addRow("Age", data.patientAge);
  addRow("Gender", data.patientGender);
  addRow("Contact", data.patientContact);
  if (data.diagnosis) addRow("Diagnosis", data.diagnosis);
  y += 4;

  // Surgery Information
  sectionHeader("Surgery Information");
  addRow("Surgery Type", data.surgeryType);
  addRow("Eye Treated", data.eyeSide);
  addRow("Anesthesia", data.anesthesiaType);
  addRow("Surgery Date", data.surgeryDate);
  addRow("Surgeon", data.surgeonName);
  y += 4;

  // Medical History
  sectionHeader("Medical History");
  addRow("Diabetes", data.diabetes || "None");
  addRow("Hypertension", data.hypertension ? "Yes" : "No");
  addRow("Immunocompromised", data.immunocompromised ? "Yes" : "No");
  addRow("Previous Eye Surgery", data.previousEyeSurgery ? "Yes" : "No");
  if (data.allergies) addRow("Allergies", data.allergies);
  if (data.currentMedications) addRow("Medications", data.currentMedications);
  y += 4;

  // Clinical Measurements
  sectionHeader("Clinical Measurements");
  addRow("Pre-op Visual Acuity", data.preVisualAcuity);
  addRow("Pre-op IOP", data.intraocularPressure ? `${data.intraocularPressure} mmHg` : "");
  addRow("Post-op Visual Acuity", data.postVisualAcuity);
  addRow("Post-op IOP", data.postIntraocularPressure ? `${data.postIntraocularPressure} mmHg` : "");
  addRow("Corneal Edema", data.cornealEdema);
  addRow("AC Reaction", data.anteriorChamberReaction);
  addRow("Wound Integrity", data.woundIntegrity);
  addRow("Pain Level", data.painLevel ? `${data.painLevel}/10` : "");
  y += 4;

  // Assessment Result
  sectionHeader("Assessment Result");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const riskColor = data.riskLevel === "Critical" ? [220, 38, 38] : data.riskLevel === "High" ? [234, 88, 12] : data.riskLevel === "Medium" ? [217, 119, 6] : [22, 163, 74];
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`Risk Score: ${data.riskScore}% — ${data.riskLevel} Risk`, 18, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  y += 10;

  // AI Explanation
  if (data.riskExplanation && data.riskExplanation.length > 0) {
    sectionHeader("AI Risk Explanation");
    doc.setFontSize(9);
    data.riskExplanation.forEach((bullet) => {
      if (y > 275) { doc.addPage(); y = 15; }
      const lines = doc.splitTextToSize(`• ${bullet}`, pageWidth - 40);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  // Clinical Steps Prediction
  if (data.clinicalSteps && data.clinicalSteps.length > 0) {
    sectionHeader("AI Clinical Steps Prediction");
    doc.setFontSize(9);
    data.clinicalSteps.forEach((step) => {
      if (y > 275) { doc.addPage(); y = 15; }
      const lines = doc.splitTextToSize(`▸ ${step}`, pageWidth - 40);
      doc.text(lines, 18, y);
      y += lines.length * 5 + 2;
    });
    y += 4;
  }

  // Follow-up
  sectionHeader("Follow-Up");
  if (data.followUpDate) addRow("Follow-up Date", data.followUpDate);
  if (data.clinicianNotes) {
    addRow("Doctor Notes", "");
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(data.clinicianNotes, pageWidth - 40);
    if (y + noteLines.length * 5 > 275) { doc.addPage(); y = 15; }
    doc.text(noteLines, 18, y);
    y += noteLines.length * 5 + 4;
  }

  // Footer
  y += 6;
  if (y > 270) { doc.addPage(); y = 15; }
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("DISCLAIMER: This report is for demonstration purposes only and should not replace professional medical evaluation.", pageWidth / 2, y, { align: "center" });
  doc.text("Generated by MindEye Spark — AI-Powered Ophthalmic Risk Assessment Platform", pageWidth / 2, y + 4, { align: "center" });

  // Save
  const fileName = `clinical-report-${(data.patientName || "patient").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
