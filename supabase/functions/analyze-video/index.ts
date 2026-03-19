import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { videoPath } = await req.json();
    if (!videoPath) throw new Error("videoPath is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the video file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("hospital-videos")
      .download(videoPath);

    if (downloadError || !fileData) throw new Error("Failed to download video: " + downloadError?.message);

    // Convert to base64 in chunks to avoid stack overflow
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Video = btoa(binary);
    const mimeType = videoPath.endsWith(".webm") ? "video/webm" : videoPath.endsWith(".mov") ? "video/quicktime" : "video/mp4";

    const systemPrompt = `You are a hospital operations AI analyst. Analyze the provided video from a hospital corridor, waiting room, or clinical area. Provide a comprehensive JSON analysis.

Return ONLY valid JSON with this exact structure:
{
  "patientCount": <number of people/patients visible>,
  "crowdDensity": "<Low|Medium|High|Critical>",
  "queueLength": <estimated number of people in queues>,
  "estimatedWaitTime": "<estimated wait time string e.g. '15-25 minutes'>",
  "crowdAlerts": [
    "<alert string about crowd concerns>"
  ],
  "bottlenecks": [
    {
      "location": "<area description>",
      "severity": "<Low|Medium|High>",
      "description": "<what is causing the bottleneck>"
    }
  ],
  "objectsDetected": [
    {
      "object": "<name of object or person type>",
      "count": <number detected>,
      "description": "<brief context about its presence>"
    }
  ],
  "sceneDescription": "<2-3 sentence description of what is happening in the video>",
  "activitySummary": [
    "<point about activity or movement observed>"
  ],
  "recommendations": [
    "<actionable recommendation for improving patient flow>"
  ],
  "overallStatus": "<Normal|Busy|Overcrowded|Critical>",
  "staffPresence": <estimated staff/non-patient count>,
  "mobilityAids": <number of wheelchairs/stretchers/walkers visible>,
  "sanitationStatus": "<Clean|Moderate|Needs Attention>",
  "emergencyRisk": "<None|Low|Medium|High>"
}

Be thorough and analytical. If the video is not from a hospital, still analyze the scene but note it does not appear to be a medical facility. Provide at least 5 objects detected, 3 activity points, 4 recommendations, and 2 bottleneck assessments.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this hospital video for patient flow, crowd density, objects present, and operational insights." },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Video}` },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
