import AppLayout from "@/components/AppLayout";
import { Activity, AlertTriangle, TrendingUp, Camera, Users, Stethoscope } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { db } from "@/lib/supabaseDb";
import { motion } from "framer-motion";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAssessments: 0, highRiskCount: 0 });
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [doctorRolesRes, patientsRes, assessmentsRes] = await Promise.all([
        db.from("user_roles").select("user_id").eq("role", "doctor"),
        db.from("patients").select("id", { count: "exact" }),
        db.from("assessments").select("*"),
      ]);

      const allAssessments = assessmentsRes.data || [];
      const highRisk = allAssessments.filter((a: any) => a.risk_level === "High" || a.risk_level === "Critical").length;

      setStats({
        totalDoctors: doctorRolesRes.data?.length || 0,
        totalPatients: patientsRes.count || 0,
        totalAssessments: allAssessments.length,
        highRiskCount: highRisk,
      });
      setAssessments(allAssessments);
    };
    load();
  }, []);

  const surgeryBreakdown = assessments.reduce((acc: Record<string, number>, a: any) => {
    const type = a.surgery_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieColors = [
    "hsl(199, 89%, 58%)",  // bright cyan
    "hsl(145, 80%, 50%)",  // vivid green
    "hsl(35, 95%, 60%)",   // bright amber
    "hsl(330, 80%, 60%)",  // hot pink
    "hsl(265, 80%, 65%)",  // vivid purple
    "hsl(15, 90%, 58%)",   // bright orange
  ];
  const pieData = Object.entries(surgeryBreakdown).map(([name, value], i) => ({
    name, value,
    color: pieColors[i % pieColors.length],
  }));

  const riskBreakdown = assessments.reduce((acc: Record<string, number>, a: any) => {
    acc[a.risk_level || "Low"] = (acc[a.risk_level || "Low"] || 0) + 1;
    return acc;
  }, {});

  const riskData = Object.entries(riskBreakdown).map(([name, count]) => ({ name, count }));

  const statCards = [
    { label: "Total Doctors", value: stats.totalDoctors.toString(), icon: Stethoscope, color: "from-primary/20 to-primary/5" },
    { label: "Total Patients", value: stats.totalPatients.toString(), icon: Users, color: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Total Assessments", value: stats.totalAssessments.toString(), icon: Activity, color: "from-amber-500/20 to-amber-500/5" },
    { label: "High-Risk Cases", value: stats.highRiskCount.toString(), icon: AlertTriangle, color: "from-destructive/20 to-destructive/5" },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-foreground"
        >
          Hospital Analytics Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-muted-foreground"
        >
          Overview of all doctors, patients, and assessments.
        </motion.p>

        {/* STAT CARDS */}
        <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="glass-card glow-border p-5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color}`}>
                  <s.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 lg:grid-cols-2">
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card glow-border p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">Surgery Type Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {riskData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card glow-border p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }}
                  />
                  <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* EMPTY STATE */}
        {assessments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 glass-card glow-border p-12 text-center"
          >
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No assessments yet</h3>
            <p className="mt-2 text-muted-foreground">
              Assessments will appear here once doctors start adding patients.
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
