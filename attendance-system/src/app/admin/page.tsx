"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Activity, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { generateAIInsights } from "../actions/ai";

export default function AdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userRole !== "ADMIN")) {
      // Temporarily allowing access for demo purposes, normally:
      // router.push("/dashboard");
    }
  }, [user, loading, userRole, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch recent attendance
        const attendanceQuery = query(collection(db, "attendance"), orderBy("checkInTime", "desc"), limit(20));
        const attendanceSnap = await getDocs(attendanceQuery);
        const logs = attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAttendanceLogs(logs);

        // Aggregate data for chart (Last 7 days mock data for now + real data)
        const aggregated = [
          { name: "Mon", attendance: 45 },
          { name: "Tue", attendance: 52 },
          { name: "Wed", attendance: 38 },
          { name: "Thu", attendance: 65 },
          { name: "Fri", attendance: 48 },
          { name: "Sat", attendance: 80 },
          { name: "Sun", attendance: 75 },
        ];
        setChartData(aggregated);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleGenerateInsights = async () => {
    setAiLoading(true);
    try {
      const result = await generateAIInsights(attendanceLogs);
      if (result.success) {
        setInsights(result.insights || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || dataLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Admin Overview
          </h1>
          <p className="text-slate-400 mt-2">Manage attendance, AI insights, and members</p>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Members", value: "1,248", icon: Users, color: "text-blue-400" },
            { label: "Today's Scans", value: "156", icon: Activity, color: "text-green-400" },
            { label: "Active Now", value: "42", icon: TrendingUp, color: "text-purple-400" },
            { label: "Expiring Soon", value: "15", icon: AlertCircle, color: "text-red-400" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-800/50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6">Weekly Attendance Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#60a5fa' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-900/40 to-slate-900/50 border border-indigo-500/30 backdrop-blur-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold text-white">Gemini AI Insights</h3>
            </div>

            <div className="flex-1 relative z-10 text-slate-300 text-sm overflow-y-auto mb-6 p-4 rounded-xl bg-black/20 border border-white/5 whitespace-pre-line">
              {insights ? (
                insights
              ) : (
                <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center">
                  <p>Click below to generate an AI analysis of current attendance patterns and member activity.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={aiLoading}
              className="w-full relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
              ) : (
                "Generate Insights"
              )}
            </button>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-6">Live Attendance Feed</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="py-4 px-4 font-medium">Member</th>
                  <th className="py-4 px-4 font-medium">ID</th>
                  <th className="py-4 px-4 font-medium">Time</th>
                  <th className="py-4 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-500">No recent scans</td></tr>
                ) : (
                  attendanceLogs.map((log, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={log.id} 
                      className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 px-4">{log.fullName || "Unknown"}</td>
                      <td className="py-4 px-4 text-slate-400">{log.memberId}</td>
                      <td className="py-4 px-4">{new Date(log.checkInTime?.seconds * 1000).toLocaleTimeString()}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Success
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
