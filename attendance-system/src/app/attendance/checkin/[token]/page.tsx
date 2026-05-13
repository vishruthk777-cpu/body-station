"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMemberFromToken, submitSelfCheckin } from "@/app/actions/checkin";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, User, Loader2, Calendar } from "lucide-react";

export default function MemberCheckin() {
  const { token } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    async function fetchMember() {
      const res = await getMemberFromToken(token as string);
      if (res.success) {
        setMember(res.member);
      } else {
        setError(res.message || "Failed to verify token.");
      }
      setLoading(false);
    }
    
    fetchMember();
  }, [token]);

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    setError(null);
    
    const res = await submitSelfCheckin(token as string);
    
    if (res.success) {
      setSuccessMsg(res.message || "Attendance Marked Successfully!");
    } else {
      setError(res.message || "Failed to mark attendance.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            SRK FITNESS CLUB
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Self Check-in Portal</p>
        </div>

        {error && !member && (
          <div className="py-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {member && (
          <div className="space-y-6">
            <div className="relative inline-block">
              {member.photoUrl ? (
                <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 overflow-hidden mx-auto shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <img src={member.photoUrl} alt="Member" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {member.memberId}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome, {member.fullName?.split(" ")[0]}!</h2>
              <p className="text-slate-400 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Plan: <span className="text-white font-medium">{member.membershipPlan || "Standard"}</span>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {successMsg ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mt-8"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-6">Attendance Recorded Successfully!</h3>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all transform active:scale-95"
                  >
                    DONE
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-4"
                >
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleMarkAttendance}
                    disabled={submitting}
                    className="w-full relative group overflow-hidden rounded-2xl bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-gradient" />
                    <div className="relative px-8 py-4 flex items-center justify-center gap-3 font-bold text-lg text-white">
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                      ) : (
                        "MARK ATTENDANCE"
                      )}
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
