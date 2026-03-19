import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const defaultExtraction = {
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
};

function parseJsonContent(content: string) {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  return JSON.parse(jsonMatch[1].trim());
}

function decodeBase64ToReadableText(base64: string) {
  try {
    const binary = atob(base64);
    return binary
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20000);
  } catch {
    return "";
  }
}

function normalizeExtraction(raw: Record<string, unknown>) {
  const normalized = { ...defaultExtraction };

  const stringKeys = [
    "patientId", "fullName", "age", "gender", "contactNumber", "surgeryType", "surgeryDate",
    "surgeonName", "eyeSide", "anesthesiaType", "diabetes", "allergies", "currentMedications",
    "preVisualAcuity", "intraocularPressure", "cornealCondition", "lensStatus", "pupilDilation",
    "postVisualAcuity", "postIntraocularPressure", "cornealEdema", "anteriorChamberReaction",
    "woundIntegrity", "painLevel", "additionalSymptoms", "followUpDate", "clinicianNotes",
  ] as const;

  const booleanKeys = [
    "hypertension", "immunocompromised", "previousEyeSurgery", "blurredVision", "eyePain",
    "redness", "discharge", "photophobia", "floaters",
  ] as const;

  for (const key of stringKeys) {
    const value = raw[key];
    if (typeof value === "string") {
      normalized[key] = value.trim();
    } else if (value !== null && value !== undefined) {
      normalized[key] = String(value).trim();
    }
  }

  for (const key of booleanKeys) {
    const value = raw[key];
    if (typeof value === "boolean") {
      normalized[key] = value;
    }
  }

  if (!["none", "controlled", "poorly_controlled"].includes(normalized.diabetes)) {
    normalized.diabetes = "none";
  }

  return normalized;
}

function countClinicalSignals(data: typeof defaultExtraction) {
  const strongStringFields = [
    data.fullName,
    data.surgeryType,
    data.surgeryDate,
    data.surgeonName,
    data.preVisualAcuity,
    data.intraocularPressure,
    data.postVisualAcuity,
    data.postIntraocularPressure,
    data.cornealEdema,
    data.woundIntegrity,
    data.painLevel,
  ];

  const presentStrings = strongStringFields.filter((v) => Boolean(v && v.trim())).length;
  const presentBooleans = [
    data.hypertension,
    data.immunocompromised,
    data.previousEyeSurgery,
    data.blurredVision,
    data.eyePain,
    data.redness,
    data.discharge,
    data.photophobia,
    data.floaters,
  ].filter(Boolean).length;

  return presentStrings + presentBooleans;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileContent, fileType, fileName, fileText } = await req.json();

    if (!fileType || !fileName) {
      return new Response(JSON.stringify({ error: "Missing file metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isImage = typeof fileType === "string" && fileType.startsWith("image/");

    if (isImage && !fileContent) {
      return new Response(JSON.stringify({ error: "No image content provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const textPayload = typeof fileText === "string" && fileText.trim().length > 0
      ? fileText.trim()
      : (typeof fileContent === "string" ? decodeBase64ToReadableText(fileContent) : "");

    if (!isImage && !textPayload) {
      return new Response(JSON.stringify({
        error: "Could not read text from the document. Please upload a clearer report or image.",
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a medical document analyzer for ophthalmology workflows.

TASK:
1) Determine if the uploaded document is a real medical/clinical report relevant to patient eye assessment.
2) If relevant, extract structured fields for risk scoring.

Return ONLY valid JSON in this exact schema:
{
  "isMedicalReport": true or false,
  "documentType": "short description like 'Eye Surgery Report' or 'Computer Science Resume' or 'Passport Photo'",
  "extracted": {
    "patientId": "string or empty",
    "fullName": "string or empty",
    "age": "number as string or empty",
    "gender": "male" | "female" | "other" | "",
    "contactNumber": "string or empty",
    "surgeryType": "cataract" | "lasik" | "glaucoma" | "retinal" | "",
    "surgeryDate": "YYYY-MM-DD format or empty",
    "surgeonName": "string or empty",
    "eyeSide": "left" | "right" | "both" | "",
    "anesthesiaType": "topical" | "local" | "general" | "",
    "diabetes": "none" | "controlled" | "poorly_controlled",
    "hypertension": true | false,
    "immunocompromised": true | false,
    "previousEyeSurgery": true | false,
    "allergies": "string or empty",
    "currentMedications": "string or empty",
    "preVisualAcuity": "string like 20/40 or empty",
    "intraocularPressure": "number as string or empty",
    "cornealCondition": "clear" | "mild_opacity" | "significant_opacity" | "scarring" | "",
    "lensStatus": "clear" | "early_cataract" | "mature_cataract" | "pseudophakic" | "aphakic" | "",
    "pupilDilation": "good" | "moderate" | "poor" | "",
    "postVisualAcuity": "string or empty",
    "postIntraocularPressure": "number as string or empty",
    "cornealEdema": "none" | "mild" | "moderate" | "severe" | "",
    "anteriorChamberReaction": "none" | "mild" | "moderate" | "severe" | "",
    "woundIntegrity": "intact" | "seidel_negative" | "compromised" | "",
    "painLevel": "0-10 as string or empty",
    "blurredVision": true | false,
    "eyePain": true | false,
    "redness": true | false,
    "discharge": true | false,
    "photophobia": true | false,
    "floaters": true | false,
    "additionalSymptoms": "string or empty",
    "followUpDate": "YYYY-MM-DD or empty",
    "clinicianNotes": "string or empty"
  }
}

STRICT RULES:
- Resume/CV, passport photo, invoice, school document, ID card, non-medical note => isMedicalReport must be false.
- If a field is missing, use empty string or false (diabetes defaults to "none").
- Do NOT output markdown. JSON only.`;

    const userMessage = isImage
      ? [
          { type: "text", text: `Analyze this uploaded document (${fileName}) and extract fields if medically relevant.` },
          { type: "image_url", image_url: { url: `data:${fileType};base64,${fileContent}` } },
        ]
      : `Analyze this uploaded document (${fileName}) and extract fields if medically relevant.\n\nDocument text:\n${textPayload.slice(0, 30000)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = parseJsonContent(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Could not extract data from the report. Please try again." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = normalizeExtraction((parsed?.extracted ?? {}) as Record<string, unknown>);
    const signalCount = countClinicalSignals(extracted);
    const aiSaysMedical = Boolean(parsed?.isMedicalReport);
    const treatAsMedical = aiSaysMedical || signalCount >= 3;

    if (!treatAsMedical) {
      const docType = parsed?.documentType || "non-medical document";
      return new Response(JSON.stringify({
        error: "invalid_document",
        documentType: docType,
        message: `The uploaded file appears to be a "${docType}". Please upload a valid medical or ophthalmological report (e.g., post-operative report, eye exam, clinical notes).`,
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (signalCount === 0) {
      return new Response(JSON.stringify({
        error: "unable_to_extract",
        message: "The file seems medical, but no usable clinical values were found. Please upload a clearer report.",
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
