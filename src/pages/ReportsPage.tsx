import Navbar from "@/components/Navbar";
import { FileText, Download, Search, Filter, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type Report = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  riskScore: number;
  surgeryType: string;
  status: string;
};

const reports: Report[] = [
  { id: "RPT-001", patientId: "P-2024-0156", date: "1/24/2024", time: "10:30:00 AM", riskLevel: "High Risk", riskScore: 72, surgeryType: "Cataract", status: "Clinician Confirmed" },
  { id: "RPT-002", patientId: "P-2024-0157", date: "1/24/2024", time: "9:15:00 AM", riskLevel: "Low Risk", riskScore: 28, surgeryType: "LASIK", status: "Clinician Confirmed" },
  { id: "RPT-003", patientId: "P-2024-0158", date: "1/23/2024", time: "4:45:00 PM", riskLevel: "Medium Risk", riskScore: 55, surgeryType: "Glaucoma", status: "Pending Review" },
  { id: "RPT-004", patientId: "P-2024-0159", date: "1/23/2024", time: "2:20:00 PM", riskLevel: "High Risk", riskScore: 81, surgeryType: "Retinal", status: "Clinician Confirmed" },
  { id: "RPT-005", patientId: "P-2024-0160", date: "1/23/2024", time: "11:00:00 AM", riskLevel: "Medium Risk", riskScore: 35, surgeryType: "Cataract", status: "Clinician Confirmed" },
];

const riskBadgeVariant = (level: string) => {
  if (level === "High Risk") return "destructive" as const;
  if (level === "Low Risk") return "secondary" as const;
  return "outline" as const;
};

const ReportsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = reports.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">Assessment Reports</h1>
        <p className="mt-2 text-muted-foreground">
          View and download patient risk assessment reports.
        </p>

        {/* Search & filter */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Patient ID or Report ID..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            All Risk Levels
          </Button>
        </div>

        {/* Report list */}
        <div className="mt-6 space-y-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{report.id}</span>
                    <Badge variant={riskBadgeVariant(report.riskLevel)}>
                      {report.riskLevel} {report.riskScore}%
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{report.patientId}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{report.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{report.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Surgery Type: <strong className="text-foreground">{report.surgeryType}</strong> · Status:{" "}
                    <span className={report.status === "Clinician Confirmed" ? "text-primary" : "text-destructive"}>
                      {report.status}
                    </span>
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 self-start">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
