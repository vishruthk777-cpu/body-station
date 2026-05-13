"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, QrCode, ShieldCheck, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-sm font-medium text-blue-400 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            AI-Powered Smart System
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Next-Gen Gym <br /> Attendance
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience seamless entry with our smart QR system, AI-driven analytics, and premium membership management platform.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/auth/login"
                className="px-8 py-4 rounded-full bg-white text-slate-950 font-semibold flex items-center gap-2 w-full sm:w-auto justify-center transition-shadow hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Member Portal
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/scanner"
                className="px-8 py-4 rounded-full bg-slate-900 border border-slate-800 text-white font-semibold flex items-center gap-2 w-full sm:w-auto justify-center hover:bg-slate-800 transition-colors"
              >
                Reception Scanner
                <QrCode className="w-5 h-5" />
              </Link>
            </motion.div>


          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
        >
          {[
            {
              icon: QrCode,
              title: "Smart QR Access",
              desc: "Instant scan, unique encrypted tokens, and auto-attendance marking.",
            },
            {
              icon: Activity,
              title: "AI Analytics",
              desc: "Predictive insights on gym crowdedness and member retention.",
            },
            {
              icon: ShieldCheck,
              title: "Secure & Scalable",
              desc: "Anti-fake entry protection, role-based access, and fast.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
