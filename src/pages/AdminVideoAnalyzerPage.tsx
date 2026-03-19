import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, Video, Users, AlertTriangle, Clock, Eye, Activity,
  ShieldAlert, Loader2, BarChart3, Waypoints, Accessibility,
  SprayCan, Siren, PackageSearch, MapPin, Trash2
} from "lucide-react";

interface Bottleneck {
  location: string;
  severity: string;
  description: string;
}

interface DetectedObject {
  object: string;
  count: number;
  description: string;
}

interface VideoAnalysis {
  patientCount: number;
  crowdDensity: string;
  queueLength: number;
  estimatedWaitTime: string;
  crowdAlerts: string[];
  bottlenecks: Bottleneck[];
  objectsDetected: DetectedObject[];
  sceneDescription: string;
  activitySummary: string[];
  recommendations: string[];
  overallStatus: string;
  staffPresence: number;
  mobilityAids: number;
  sanitationStatus: string;
  emergencyRisk: string;
}

const severityColor = (s: string) => {
  switch (s) {
    case "Critical": case "High": return "destructive";
    case "Medium": return "secondary";
    default: return "outline";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "Critical": case "Overcrowded": return "bg-destructive/10 text-destructive border-destructive/30";
    case "Busy": case "High": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    case "Normal": case "Low": return "bg-green-500/10 text-green-600 border-green-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const AdminVideoAnalyzerPage = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadAndAnalyze = async (file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setAnalysis(null);

    const path = `analysis/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("hospital-videos")
        .upload(path, file);

      if (uploadError) throw uploadError;

      // Get a temporary URL for preview
      const { data: urlData } = await supabase.storage
        .from("hospital-videos")
        .createSignedUrl(path, 3600);

      if (urlData?.signedUrl) setVideoUrl(urlData.signedUrl);

      setUploading(false);
      setAnalyzing(true);

      const { data, error } = await supabase.functions.invoke("analyze-video", {
        body: { videoPath: path },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast({ title: "Analysis Complete", description: "Video has been analyzed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to analyze video.", variant: "destructive" });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setVideoUrl(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const densityPercent = analysis
    ? analysis.crowdDensity === "Critical" ? 100
    : analysis.crowdDensity === "High" ? 75
    : analysis.crowdDensity === "Medium" ? 50 : 25
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Video className="h-8 w-8 text-primary" />
              AI Video Patient Flow Analyzer
            </h1>
            <p className="mt-2 text-muted-foreground">
              Upload hospital corridor or waiting room videos to analyze patient flow, crowd density, and operational bottlenecks.
            </p>
          </div>
          {analysis && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <Trash2 className="h-4 w-4" /> New Analysis
            </Button>
          )}
        </div>

        {/* Upload Section */}
        {!analysis && !analyzing && (
          <Card className="mt-8">
            <CardContent className="p-8">
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadAndAnalyze(e.target.files[0])}
                />
                {uploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="mt-4 text-lg font-semibold text-foreground">Uploading {fileName}...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-lg font-semibold text-foreground">Click to upload a hospital video</p>
                    <p className="mt-1 text-sm text-muted-foreground">MP4, WebM, MOV, AVI — Max 20MB</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center p-16">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <h3 className="mt-6 text-xl font-semibold text-foreground">Analyzing Video with AI...</h3>
              <p className="mt-2 text-muted-foreground">Processing patient flow, detecting objects, and evaluating crowd density.</p>
              <Progress value={65} className="mt-6 w-64" />
            </CardContent>
          </Card>
        )}

        {/* Results Dashboard */}
        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Video Preview + Scene Description */}
            <div className="grid gap-6 lg:grid-cols-2">
              {videoUrl && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Video Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video src={videoUrl} controls className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> Scene Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysis.sceneDescription}</p>
                  <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusColor(analysis.overallStatus)}`}>
                    <Activity className="h-4 w-4" />
                    Overall Status: {analysis.overallStatus}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Patients Detected", value: analysis.patientCount, icon: Users, color: "text-primary" },
                { label: "Queue Length", value: analysis.queueLength, icon: Waypoints, color: "text-primary" },
                { label: "Staff Present", value: analysis.staffPresence, icon: Activity, color: "text-primary" },
                { label: "Mobility Aids", value: analysis.mobilityAids, icon: Accessibility, color: "text-primary" },
              ].map((m) => (
                <Card key={m.label}>
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{m.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <m.icon className={`h-5 w-5 ${m.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Crowd Density + Wait Time + Status Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Crowd Density</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge variant={severityColor(analysis.crowdDensity)}>{analysis.crowdDensity}</Badge>
                    <Progress value={densityPercent} className="flex-1" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> Est. Wait Time
                  </div>
                  <p className="mt-1 text-2xl font-bold text-foreground">{analysis.estimatedWaitTime}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SprayCan className="h-4 w-4" /> Sanitation
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">{analysis.sanitationStatus}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Siren className="h-4 w-4" /> Emergency Risk
                  </div>
                  <Badge variant={severityColor(analysis.emergencyRisk)} className="mt-1">{analysis.emergencyRisk}</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Objects Detected */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageSearch className="h-4 w-4 text-primary" /> Objects & Entities Detected
                </CardTitle>
                <CardDescription>Items, people, and equipment identified in the video</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.objectsDetected?.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                        {obj.count}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{obj.object}</p>
                        <p className="text-xs text-muted-foreground">{obj.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Activity Summary
                </CardTitle>
                <CardDescription>What's happening in the scene</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.activitySummary?.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {a}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Crowd Alerts + Bottlenecks */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Crowd Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.crowdAlerts?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.crowdAlerts.map((alert, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-md bg-destructive/5 p-3 text-sm text-foreground">
                          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          {alert}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No crowd alerts detected.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" /> Bottleneck Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.bottlenecks?.map((b, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">{b.location}</p>
                          <Badge variant={severityColor(b.severity)}>{b.severity}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideoAnalyzerPage;
