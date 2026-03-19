import { AssessmentData, RiskResult } from "@/types/assessment";

export function calculateRiskScore(data: AssessmentData): RiskResult {
  const factors: { name: string; contribution: number; detail: string }[] = [];
  let totalScore = 0;

  // Age factor
  const age = parseInt(data.age) || 0;
  if (age > 70) {
    factors.push({ name: "Advanced Age", contribution: 15, detail: `Patient age ${age} increases complication risk` });
    totalScore += 15;
  } else if (age > 55) {
    factors.push({ name: "Age Factor", contribution: 8, detail: `Patient age ${age} is a moderate risk factor` });
    totalScore += 8;
  }

  // Diabetes
  if (data.diabetes === "poorly_controlled") {
    factors.push({ name: "Poorly Controlled Diabetes", contribution: 20, detail: "Uncontrolled blood sugar significantly increases infection and healing risks" });
    totalScore += 20;
  } else if (data.diabetes === "controlled") {
    factors.push({ name: "Controlled Diabetes", contribution: 8, detail: "Diabetes present but controlled — moderate risk" });
    totalScore += 8;
  }

  // Immunocompromised
  if (data.immunocompromised) {
    factors.push({ name: "Immunocompromised", contribution: 15, detail: "Weakened immune system increases infection risk" });
    totalScore += 15;
  }

  // Previous eye surgery
  if (data.previousEyeSurgery) {
    factors.push({ name: "Previous Eye Surgery", contribution: 10, detail: "Prior surgical history increases complication risk" });
    totalScore += 10;
  }

  // Hypertension
  if (data.hypertension) {
    factors.push({ name: "Hypertension", contribution: 5, detail: "High blood pressure can affect surgical outcomes" });
    totalScore += 5;
  }

  // Surgery complexity
  if (data.surgeryType === "retinal") {
    factors.push({ name: "Complex Surgery Type", contribution: 12, detail: "Retinal surgery carries higher complication risk" });
    totalScore += 12;
  } else if (data.surgeryType === "glaucoma") {
    factors.push({ name: "Surgery Complexity", contribution: 8, detail: "Glaucoma surgery has moderate complication risk" });
    totalScore += 8;
  }

  // Post-operative indicators
  if (data.cornealEdema === "severe") {
    factors.push({ name: "Severe Corneal Edema", contribution: 12, detail: "Significant corneal swelling post-surgery" });
    totalScore += 12;
  } else if (data.cornealEdema === "moderate") {
    factors.push({ name: "Moderate Corneal Edema", contribution: 6, detail: "Moderate corneal swelling noted" });
    totalScore += 6;
  }

  if (data.anteriorChamberReaction === "severe") {
    factors.push({ name: "Severe Anterior Chamber Reaction", contribution: 15, detail: "Significant inflammatory response detected" });
    totalScore += 15;
  } else if (data.anteriorChamberReaction === "moderate") {
    factors.push({ name: "Moderate AC Reaction", contribution: 8, detail: "Moderate inflammatory response" });
    totalScore += 8;
  }

  if (data.woundIntegrity === "compromised") {
    factors.push({ name: "Wound Integrity Compromised", contribution: 18, detail: "Surgical wound shows signs of dehiscence" });
    totalScore += 18;
  }

  // Pain level
  const pain = parseInt(data.painLevel) || 0;
  if (pain >= 7) {
    factors.push({ name: "High Pain Level", contribution: 10, detail: `Pain level ${pain}/10 is concerning` });
    totalScore += 10;
  } else if (pain >= 4) {
    factors.push({ name: "Moderate Pain", contribution: 5, detail: `Pain level ${pain}/10` });
    totalScore += 5;
  }

  // Symptoms
  const symptomCount = [data.blurredVision, data.eyePain, data.redness, data.discharge, data.photophobia, data.floaters].filter(Boolean).length;
  if (symptomCount >= 4) {
    factors.push({ name: "Multiple Symptoms", contribution: 12, detail: `${symptomCount} concurrent symptoms reported` });
    totalScore += 12;
  } else if (symptomCount >= 2) {
    factors.push({ name: "Multiple Symptoms", contribution: 6, detail: `${symptomCount} concurrent symptoms reported` });
    totalScore += 6;
  }

  // Post IOP
  const iop = parseFloat(data.postIntraocularPressure) || 0;
  if (iop > 25) {
    factors.push({ name: "Elevated IOP", contribution: 10, detail: `Post-operative IOP of ${iop} mmHg is elevated` });
    totalScore += 10;
  }

  // Clamp score
  totalScore = Math.min(totalScore, 100);

  // Determine risk level
  let riskLevel: RiskResult["riskLevel"] = "Low";
  if (totalScore >= 75) riskLevel = "Critical";
  else if (totalScore >= 50) riskLevel = "High";
  else if (totalScore >= 30) riskLevel = "Medium";

  // Generate recommendations
  const recommendations: string[] = [];
  if (totalScore >= 50) {
    recommendations.push("Schedule urgent follow-up within 24 hours");
    recommendations.push("Consider prophylactic antibiotic escalation");
  }
  if (data.diabetes === "poorly_controlled") {
    recommendations.push("Coordinate with endocrinology for glucose management");
  }
  if (iop > 25) {
    recommendations.push("Initiate IOP-lowering medication");
  }
  if (data.woundIntegrity === "compromised") {
    recommendations.push("Evaluate for surgical wound repair");
  }
  if (symptomCount >= 3) {
    recommendations.push("Comprehensive re-examination recommended");
  }
  if (totalScore < 30) {
    recommendations.push("Continue standard post-operative care protocol");
    recommendations.push("Schedule routine follow-up as planned");
  }
  if (recommendations.length === 0) {
    recommendations.push("Monitor patient closely during recovery");
    recommendations.push("Follow standard post-operative protocol");
  }

  const explanation = `Based on analysis of ${factors.length} risk factors, the patient presents with a ${riskLevel.toLowerCase()} risk profile (score: ${totalScore}/100). ${
    factors.length > 0
      ? `Key contributors include ${factors.slice(0, 3).map(f => f.name.toLowerCase()).join(", ")}.`
      : "No significant risk factors identified."
  }`;

  return { overallScore: totalScore, riskLevel, factors: factors.sort((a, b) => b.contribution - a.contribution), recommendations, explanation };
}
