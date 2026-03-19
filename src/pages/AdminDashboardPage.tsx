import AppLayout from "@/components/AppLayout";
import { Activity, AlertTriangle, TrendingUp, Camera, Users, Stethoscope } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
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

  const pieData = Object.entries(surgeryBreakdown).map(([name, value], i) => ({
    name, value,
    color: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"][i % 4],
  }));

  const riskBreakdown = assessments.reduce((acc: Record<string, number>, a: any) => {
    acc[a.risk_level || "Low"] = (acc[a.risk_level || "Low"] || 0) + 1;
    return acc;
  }, {});

  const riskData = Object.entries(riskBreakdown).map(([name, count]) => ({ name, count }));

  const statCards = [
    { label: "Total Doctors", value: stats.totalDoctors.toString(), icon: Stethoscope },
    { label: "Total Patients", value: stats.totalPatients.toString(), icon: Users },
    { label: "Total Assessments", value: stats.totalAssessments.toString(), icon: Activity },
    { label: "High-Risk Cases", value: stats.highRiskCount.toString(), icon: AlertTriangle },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">

      <div className="mx-auto max-w-7xl px-6 py-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-foreground"
        >
          Hospital Analytics Dashboard
        </motion.h1>

        <p className="mt-2 text-muted-foreground">
          Overview of all doctors, patients, and assessments.
        </p>

        {/* STAT CARDS */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
                </div>

                <div className="p-3 rounded-xl bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {pieData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Surgery Type Distribution
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {riskData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Risk Level Distribution
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
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
            className="mt-10 rounded-2xl border border-border bg-card p-12 text-center shadow-sm"
          >
            <Camera className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No assessments yet</h3>
            <p className="mt-2 text-muted-foreground">
              Assessments will appear here once doctors start adding patients.
            </p>
          </motion.div>
        )}
      </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
