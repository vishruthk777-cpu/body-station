"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { generateQRCodeDataURL } from "@/lib/qr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  LogOut, Calendar, Activity, CheckCircle, Clock, 
  Sparkles, Brain, ChevronRight, LayoutDashboard, 
  User, Dumbbell, History, RefreshCcw, AlertCircle
} from "lucide-react";
import { signOut } from "firebase/auth";
import { getSecureToken } from "../actions/token";
import OnboardingForm from "@/components/ai/OnboardingForm";
import FitnessDashboard from "@/components/ai/FitnessDashboard";
import ChatAssistant from "@/components/ai/ChatAssistant";

type TabType = "overview" | "attendance" | "performance" | "coach";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userData, setUserData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [dataLoading, setDataLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Fetch Core User Data
  const fetchUserData = async () => {
    if (!user) return;
    
    setError(null);
    setIsRetrying(true);
    
    try {
      // 1. Fetch Profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("Member profile not found. Please contact administration.");
        setDataLoading(false);
        setIsRetrying(false);
        return;
      }
      
      const data = userDoc.data();
      setUserData(data);

      // 2. Generate Secure QR
      try {
        const secureToken = await getSecureToken(user.uid);
        if (secureToken) {
          let baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          
          // Local development IP support
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            try {
              const ipRes = await fetch('/api/ip');
              const ipData = await ipRes.json();
              if (ipData.ip && ipData.ip !== 'localhost') {
                baseUrl = `http://${ipData.ip}:${window.location.port || 3000}`;
              }
            } catch (e) {
              console.warn("Using localhost origin as fallback for QR.");
            }
          }
          
          const checkinUrl = `${baseUrl}/attendance/checkin/${secureToken}`;
          const url = await generateQRCodeDataURL(checkinUrl);
          setQrCodeUrl(url);
        }
      } catch (qrErr) {
        console.error("QR Generation Error:", qrErr);
      }

      setDataLoading(false);
      setIsRetrying(false);
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load dashboard data. Check your connection.");
      setDataLoading(false);
      setIsRetrying(false);
    }
  };

  // Profile Fetch Effect
  useEffect(() => {
    if (user && !loading) {
      fetchUserData();
    }
  }, [user, loading]);

  // Real-time Attendance Listener
  useEffect(() => {
    if (!user) return;

    const attQuery = query(
      collection(db, "attendance"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(attQuery, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort client-side
      logs.sort((a: any, b: any) => {
        const timeA = a.checkInTime?.seconds || 0;
        const timeB = b.checkInTime?.seconds || 0;
        return timeB - timeA;
      });
      
      setAttendanceLogs(logs);
    }, (err) => {
      console.error("Attendance Listener Error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Analytics Helpers
  const consistencyScore = useMemo(() => {
    if (attendanceLogs.length === 0) return 0;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const sessionsLastMonth = attendanceLogs.filter(log => {
      const logDate = new Date((log.checkInTime?.seconds || 0) * 1000);
      return logDate >= last30Days;
    }).length;
    
    // Simple score: 20 sessions = 100%
    return Math.min(100, Math.round((sessionsLastMonth / 20) * 100));
  }, [attendanceLogs]);

  // Loading View
  if (loading || (dataLoading && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Biology...</p>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full p-8 rounded-[2.5rem] bg-slate-900/50 border border-red-500/20 backdrop-blur-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Dashboard Sync Failed</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={fetchUserData}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Premium Sidebar / Nav */}
      <div className="max-w-6xl mx-auto w-full p-6 md:p-12 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
               <Activity className="w-8 h-8 text-white" />
             </div>
             <div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                  {userData.fullName?.split(" ")[0] || "Athlete"}
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                  Tier: {userData.membershipPlan || "Standard"} • ID: {userData.memberId}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest hidden sm:block">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/5"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md mb-12 sticky top-6 z-50 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
          <TabButton active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} icon={<History className="w-4 h-4" />} label="Logs" />
          <TabButton active={activeTab === "performance"} onClick={() => setActiveTab("performance")} icon={<Dumbbell className="w-4 h-4" />} label="Elite Plan" />
          <TabButton active={activeTab === "coach"} onClick={() => setActiveTab("coach")} icon={<Brain className="w-4 h-4" />} label="AI Coach" />
        </nav>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QR Access Card */}
                <div className="lg:col-span-1">
                   <div className="rounded-[2.5rem] bg-gradient-to-b from-blue-600 to-indigo-900 p-px relative overflow-hidden shadow-2xl shadow-blue-900/20">
                     <div className="h-full w-full bg-slate-950/90 backdrop-blur-xl rounded-[2.45rem] p-8 flex flex-col items-center text-center">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Secure Access</h2>
                        <div className="p-6 bg-white rounded-[2rem] mb-8 shadow-[0_0_50px_rgba(59,130,246,0.3)] group hover:scale-[1.02] transition-transform duration-500">
                          {qrCodeUrl ? (
                            <Image src={qrCodeUrl} alt="Access QR" width={200} height={200} className="rounded-lg" />
                          ) : (
                            <div className="w-[200px] h-[200px] bg-slate-800 rounded-lg animate-pulse" />
                          )}
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase border border-green-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Status: {userData.status}
                        </div>
                     </div>
                   </div>
                </div>

                {/* Stats Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <StatsCard 
                      icon={<Calendar className="text-blue-400" />} 
                      label="Monthly Consistency" 
                      value={`${consistencyScore}%`}
                      sub={attendanceLogs.length > 0 ? "Trending Up" : "Start Training"} 
                    />
                    <StatsCard 
                      icon={<Clock className="text-purple-400" />} 
                      label="Last Session" 
                      value={attendanceLogs[0] ? new Date(attendanceLogs[0].checkInTime?.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "None"} 
                      sub={attendanceLogs[0] ? "Validated" : "Welcome!"}
                    />
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-yellow-500" />
                       Trainer's Insight
                    </h3>
                    <p className="text-slate-400 leading-relaxed italic">
                      {consistencyScore > 80 
                        ? "Your consistency is elite. Keep pushing your recovery protocols to match this intensity."
                        : "Focus on hitting at least 3 sessions this week to build metabolic momentum."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Training History</h2>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                      Total: {attendanceLogs.length} Sessions
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {attendanceLogs.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[2rem]">
                        <p className="text-slate-500">No logs detected yet. Start your journey today!</p>
                      </div>
                    ) : (
                      attendanceLogs.slice(0, 15).map((log, idx) => (
                        <div key={log.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                {new Date(log.checkInTime?.seconds * 1000).getDate()}
                              </div>
                              <div>
                                <p className="font-bold">{new Date(log.checkInTime?.seconds * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.checkInTime?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  {log.method && <span>• {log.method}</span>}
                                </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">
                                Verified
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-8">
                {!userData.isOnboarded ? (
                  <div className="p-12 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-2xl text-center">
                    <Brain className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-4 text-white">Initialize Your AI Coach</h2>
                    <p className="text-slate-400 max-w-lg mx-auto mb-8">To unlock personalized protocols and performance tracking, our AI needs to understand your biology and goals.</p>
                    <OnboardingForm 
                      userId={user.uid} 
                      onComplete={(analysis) => setUserData({ ...userData, isOnboarded: true, aiState: analysis })} 
                    />
                  </div>
                ) : (
                  <FitnessDashboard userData={userData} attendanceLogs={attendanceLogs} />
                )}
              </div>
            )}

            {activeTab === "coach" && (
              <div className="h-[600px] p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center">
                <Brain className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold mb-4">Elite Chat Interface</h2>
                <p className="text-slate-400 mb-8 max-w-md">The Coach is available 24/7 to adjust your plan, explain form, or give nutritional advice.</p>
                <ChatAssistant userData={userData} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatsCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm group hover:border-blue-500/20 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-slate-800 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</h3>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
