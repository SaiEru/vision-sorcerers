import Navbar from "@/components/Navbar";
import { Activity, AlertTriangle, TrendingUp, Camera, Scissors, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const surgeryData = [
  { name: "Cataract", low: 45, medium: 120, high: 620 },
  { name: "LASIK", low: 30, medium: 80, high: 310 },
  { name: "Glaucoma", low: 20, medium: 60, high: 50 },
  { name: "Retinal", low: 25, medium: 90, high: 180 },
];

const riskFactors = [
  { label: "Poorly controlled diabetes", count: 234, color: "hsl(221, 83%, 53%)" },
  { label: "Previous complications", count: 189, color: "hsl(180, 60%, 50%)" },
  { label: "Advanced age", count: 167, color: "hsl(130, 60%, 45%)" },
  { label: "Immunocompromised", count: 98, color: "hsl(40, 90%, 55%)" },
  { label: "Complex surgery", count: 87, color: "hsl(0, 70%, 55%)" },
];

const monthlyData = [
  { month: "Jan", total: 95, highRisk: 18 },
  { month: "Feb", total: 110, highRisk: 22 },
  { month: "Mar", total: 115, highRisk: 15 },
  { month: "Apr", total: 120, highRisk: 20 },
  { month: "May", total: 130, highRisk: 18 },
  { month: "Jun", total: 140, highRisk: 25 },
];

const pieData = [
  { name: "Cataract", value: 45, color: "hsl(221, 83%, 53%)" },
  { name: "LASIK", value: 25, color: "hsl(221, 83%, 70%)" },
  { name: "Glaucoma", value: 15, color: "hsl(130, 60%, 45%)" },
  { name: "Retinal", value: 15, color: "hsl(40, 90%, 55%)" },
];

const weeklyDetection = [
  { week: "W1", count: 35 },
  { week: "W2", count: 52 },
  { week: "W3", count: 48 },
  { week: "W4", count: 61 },
];

const stats = [
  { label: "Total Assessments", value: "1,247", sub: "All time", icon: Activity, iconColor: "text-primary" },
  { label: "High-Risk Patients", value: "18%", sub: "Of total assessments", icon: AlertTriangle, iconColor: "text-destructive" },
  { label: "Average Risk Score", value: "42", sub: "Across all patients", icon: TrendingUp, iconColor: "text-primary" },
  { label: "Media Detections", value: "196", sub: "Visual AI findings this month", icon: Camera, iconColor: "text-primary" },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">Hospital Analytics Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Aggregated insights from patient risk assessments across the healthcare system.
        </p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-start justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Scissors className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Risk Score by Surgery Type</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={surgeryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="low" stackId="a" fill="hsl(221, 83%, 85%)" />
                <Bar dataKey="medium" stackId="a" fill="hsl(221, 83%, 70%)" />
                <Bar dataKey="high" stackId="a" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Most Influential Risk Factors</h3>
            </div>
            <div className="space-y-5">
              {riskFactors.map((f) => (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{f.label}</span>
                    <span className="text-muted-foreground">{f.count} patients</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${(f.count / 234) * 100}%`, backgroundColor: f.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Monthly Assessment Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="highRisk" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Total Assessments</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> High Risk</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Surgery Type Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              {pieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual AI Detection Trend */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Camera className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Visual AI Detection Trend</h3>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Weekly media-detected abnormalities</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyDetection}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
