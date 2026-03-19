import Navbar from "@/components/Navbar";
import { Activity, AlertTriangle, TrendingUp, Camera, Users, Stethoscope } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAssessments: 0, highRiskCount: 0 });
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [doctorsRes, patientsRes, assessmentsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "doctor"),
        supabase.from("patients").select("id", { count: "exact" }),
        supabase.from("assessments").select("*"),
      ]);

      const allAssessments = assessmentsRes.data || [];
      const highRisk = allAssessments.filter((a: any) => a.risk_level === "High" || a.risk_level === "Critical").length;

      setStats({
        totalDoctors: doctorsRes.count || 0,
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
        >
          Hospital Analytics Dashboard
        </motion.h1>

        <p className="mt-2 text-zinc-400">
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
              whileHover={{ scale: 1.05 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl" />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-zinc-400">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold">{s.value}</p>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                  <s.icon className="h-6 w-6 text-purple-400" />
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
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-purple-300">
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
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-pink-300">
                Risk Level Distribution
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
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
            className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center shadow-xl"
          >
            <Camera className="mx-auto h-12 w-12 text-zinc-500" />
            <h3 className="mt-4 text-lg font-semibold">No assessments yet</h3>
            <p className="mt-2 text-zinc-400">
              Assessments will appear here once doctors start adding patients.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
