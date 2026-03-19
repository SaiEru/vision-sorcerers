import AppLayout from "@/components/AppLayout";
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
import { motion } from "framer-motion";

interface Bottleneck { location: string; severity: string; description: string; }
interface DetectedObject { object: string; count: number; description: string; }
interface VideoAnalysis {
  patientCount: number; crowdDensity: string; queueLength: number; estimatedWaitTime: string;
  crowdAlerts: string[]; bottlenecks: Bottleneck[]; objectsDetected: DetectedObject[];
  sceneDescription: string; activitySummary: string[]; recommendations: string[];
  overallStatus: string; staffPresence: number; mobilityAids: number;
  sanitationStatus: string; emergencyRisk: string;
}

const severityColor = (s: string) => {
  switch (s) { case "Critical": case "High": return "destructive"; case "Medium": return "secondary"; default: return "outline"; }
};

const statusColor = (s: string) => {
  switch (s) {
    case "Critical": case "Overcrowded": return "bg-destructive/10 text-destructive border-destructive/30";
    case "Busy": case "High": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "Normal": case "Low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
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
    if (file.size > 20 * 1024 * 1024) { toast({ title: "File too large", description: "Maximum file size is 20MB.", variant: "destructive" }); return; }
    setFileName(file.name); setUploading(true); setAnalysis(null);
    const path = `analysis/${Date.now()}_${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage.from("hospital-videos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = await supabase.storage.from("hospital-videos").createSignedUrl(path, 3600);
      if (urlData?.signedUrl) setVideoUrl(urlData.signedUrl);
      setUploading(false); setAnalyzing(true);
      const { data, error } = await supabase.functions.invoke("analyze-video", { body: { videoPath: path } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.analysis);
      toast({ title: "Analysis Complete", description: "Video has been analyzed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to analyze video.", variant: "destructive" });
    } finally { setUploading(false); setAnalyzing(false); }
  };

  const handleReset = () => { setAnalysis(null); setVideoUrl(null); setFileName(""); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const densityPercent = analysis
    ? analysis.crowdDensity === "Critical" ? 100 : analysis.crowdDensity === "High" ? 75 : analysis.crowdDensity === "Medium" ? 50 : 25
    : 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Video className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              AI Video Patient Flow Analyzer
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Upload hospital corridor or waiting room videos to analyze patient flow, crowd density, and operational bottlenecks.
            </p>
          </motion.div>
          {analysis && (
            <Button variant="outline" onClick={handleReset} className="gap-2 border-border hover:bg-primary/10">
              <Trash2 className="h-4 w-4" /> New Analysis
            </Button>
          )}
        </div>

        {/* Upload Section */}
        {!analysis && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 glass-card glow-border p-6 sm:p-8">
            <div
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUploadAndAnalyze(e.target.files[0])} />
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
          </motion.div>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 glass-card glow-border flex flex-col items-center justify-center p-16">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h3 className="mt-6 text-xl font-semibold text-foreground">Analyzing Video with AI...</h3>
            <p className="mt-2 text-muted-foreground">Processing patient flow, detecting objects, and evaluating crowd density.</p>
            <Progress value={65} className="mt-6 w-64" />
          </motion.div>
        )}

        {/* Results Dashboard */}
        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {videoUrl && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card glow-border overflow-hidden">
                  <div className="p-4 border-b border-border"><h3 className="text-base font-semibold text-foreground">Video Preview</h3></div>
                  <div className="p-4"><video src={videoUrl} controls className="w-full rounded-lg" /></div>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card glow-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Scene Overview</h3></div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysis.sceneDescription}</p>
                  <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusColor(analysis.overallStatus)}`}>
                    <Activity className="h-4 w-4" />Overall Status: {analysis.overallStatus}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Patients Detected", value: analysis.patientCount, icon: Users },
                { label: "Queue Length", value: analysis.queueLength, icon: Waypoints },
                { label: "Staff Present", value: analysis.staffPresence, icon: Activity },
                { label: "Mobility Aids", value: analysis.mobilityAids, icon: Accessibility },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card glow-border p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{m.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <m.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Density/Wait/Sanitation/Emergency */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <div className="glass-card p-5">
                <p className="text-sm text-muted-foreground">Crowd Density</p>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant={severityColor(analysis.crowdDensity) as any}>{analysis.crowdDensity}</Badge>
                  <Progress value={densityPercent} className="flex-1" />
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Est. Wait Time</div>
                <p className="mt-1 text-2xl font-bold text-foreground">{analysis.estimatedWaitTime}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><SprayCan className="h-4 w-4" /> Sanitation</div>
                <p className="mt-1 text-lg font-semibold text-foreground">{analysis.sanitationStatus}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Siren className="h-4 w-4" /> Emergency Risk</div>
                <Badge variant={severityColor(analysis.emergencyRisk) as any} className="mt-1">{analysis.emergencyRisk}</Badge>
              </div>
            </div>

            {/* Objects Detected */}
            <div className="glass-card glow-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><PackageSearch className="h-4 w-4 text-primary" /> Objects & Entities Detected</h3>
                <p className="text-sm text-muted-foreground">Items, people, and equipment identified in the video</p>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.objectsDetected?.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">{obj.count}</div>
                      <div><p className="text-sm font-semibold text-foreground">{obj.object}</p><p className="text-xs text-muted-foreground">{obj.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="glass-card glow-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Activity Summary</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {analysis.activitySummary?.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alerts + Bottlenecks */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card glow-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-base font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Crowd Alerts</h3></div>
                <div className="p-4">
                  {analysis.crowdAlerts?.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.crowdAlerts.map((alert, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/20 p-3 text-sm text-foreground">
                          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />{alert}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No crowd alerts detected.</p>}
                </div>
              </div>
              <div className="glass-card glow-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-base font-semibold text-foreground flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> Bottleneck Analysis</h3></div>
                <div className="p-4 space-y-3">
                  {analysis.bottlenecks?.map((b, i) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">{b.location}</p><Badge variant={severityColor(b.severity) as any}>{b.severity}</Badge></div>
                      <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminVideoAnalyzerPage;
