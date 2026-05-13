"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { rotateReceptionToken } from "../actions/reception";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

export default function Reception() {
  const [token, setToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  const refreshToken = async () => {
    setLoading(true);
    const result = await rotateReceptionToken();
    if (result.success && result.token) {
      setToken(result.token);
      const url = await QRCode.toDataURL(result.token, {
        width: 600,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
      setCountdown(10);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshToken();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshToken();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Premium Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center text-center max-w-2xl w-full"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-8 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4" />
          SECURE LIVE ATTENDANCE
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Scan to Check-In
        </h1>
        <p className="text-slate-400 text-lg mb-12">
          Point your member scanner at this code to mark your attendance instantly.
        </p>

        <div className="relative p-6 rounded-[40px] bg-white shadow-[0_0_50px_rgba(59,130,246,0.3)] group transition-all duration-500">
          <AnimatePresence mode="wait">
            {loading && !qrDataUrl ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-[280px] h-[280px] flex items-center justify-center"
              >
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </motion.div>
            ) : (
              <motion.div
                key={token}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {qrDataUrl && (
                  <img 
                    src={qrDataUrl} 
                    alt="Attendance QR Code" 
                    className="w-[280px] h-[280px] rounded-2xl"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-[40px]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-[40px]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-[40px]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-[40px]" />
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl backdrop-blur-sm">
            <RefreshCw className={`w-5 h-5 text-blue-400 ${countdown === 10 ? 'animate-spin' : ''}`} />
            <span className="text-slate-300 font-medium">Refreshing in {countdown}s</span>
          </div>
          
          <div className="text-slate-500 text-sm font-medium">
            System Status: <span className="text-green-500">Live & Secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
