import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { assessmentData, riskScore, riskLevel, factors } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a clinical ophthalmology AI assistant. Given patient assessment data, risk score, and risk factors, generate TWO outputs:

1. **Categorized Risk Explanation** — A detailed clinical risk explanation organized into categories with subheadings. Each category should have multiple bullet points. Categories:
   - Demographics & General Health
   - Surgery & Anesthesia
   - Medical History & Comorbidities
   - Pre-Operative Assessment
   - Post-Operative Findings
   - Symptoms & Complaints

2. **Clinical Steps Prediction** — Based on the risk level and clinical data, suggest actionable next medical steps the doctor should take. Categories:
   - Immediate Actions (urgent interventions if any)
   - Monitoring Plan (what parameters to monitor, how often)
   - Follow-Up Schedule (recommended visit timing)
   - Recommended Examinations (additional tests or imaging)
   - Medication Adjustments (if applicable)
   - Patient Education (counseling points)

Provide 15-25 detailed bullet points for the risk explanation (across all categories, at least 2-4 per category) and 12-20 bullet points for clinical steps (across all categories, at least 2-3 per category). Each bullet should be a detailed, multi-sentence clinical statement explaining the reasoning. For clinical steps, use actionable and specific language with timelines and parameters (e.g., "Monitor IOP every 2 hours for 24 hours post-surgery to detect pressure spikes early", "Schedule comprehensive follow-up examination within 48 hours including slit-lamp biomicroscopy and fundoscopy").`;

    const userPrompt = `Patient Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Calculated Risk Score: ${riskScore}/100
Risk Level: ${riskLevel}
Contributing Factors: ${JSON.stringify(factors)}

Generate categorized risk explanation and clinical steps prediction.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return the categorized risk explanation and clinical steps",
              parameters: {
                type: "object",
                properties: {
                  riskExplanation: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Category heading e.g. Demographics & General Health" },
                        points: { type: "array", items: { type: "string" }, description: "Bullet points for this category" }
                      },
                      required: ["category", "points"],
                      additionalProperties: false
                    },
                    description: "Categorized risk explanation with subheadings"
                  },
                  clinicalSteps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", description: "Category heading e.g. Immediate Actions" },
                        steps: { type: "array", items: { type: "string" }, description: "Action steps for this category" }
                      },
                      required: ["category", "steps"],
                      additionalProperties: false
                    },
                    description: "Clinical steps prediction with categories"
                  }
                },
                required: ["riskExplanation", "clinicalSteps"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let riskExplanation: { category: string; points: string[] }[] = [];
    let clinicalSteps: { category: string; steps: string[] }[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        riskExplanation = parsed.riskExplanation || [];
        clinicalSteps = parsed.clinicalSteps || [];
      } catch {
        const content = result.choices?.[0]?.message?.content || "{}";
        try {
          const parsed = JSON.parse(content);
          riskExplanation = parsed.riskExplanation || [];
          clinicalSteps = parsed.clinicalSteps || [];
        } catch {
          riskExplanation = [{ category: "General", points: [content] }];
        }
      }
    } else {
      const content = result.choices?.[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        riskExplanation = parsed.riskExplanation || [];
        clinicalSteps = parsed.clinicalSteps || [];
      } catch {
        riskExplanation = [{ category: "General", points: [content] }];
      }
    }

    // Flatten for backward compatibility storage
    const flatExplanation = riskExplanation.flatMap(c => c.points);
    const flatSteps = clinicalSteps.flatMap(c => c.steps);

    return new Response(JSON.stringify({ 
      explanation: flatExplanation,
      riskExplanation,
      clinicalSteps,
      flatSteps,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
