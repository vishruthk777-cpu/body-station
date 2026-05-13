"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { markAttendance } from "../actions/attendance";
import Link from "next/link";

export default function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize Scanner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const capturePhoto = (): string | null => {
    try {
      const videoElement = document.querySelector("#qr-reader video") as HTMLVideoElement;
      if (!videoElement) return null;
      
      const canvas = document.createElement("canvas");
      // Downscale to save space for Firestore document
      canvas.width = 320;
      canvas.height = (videoElement.videoHeight / videoElement.videoWidth) * 320 || 240;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.5); // 0.5 quality JPEG
      }
    } catch (e) {
      console.error("Failed to capture photo:", e);
    }
    return null;
  };

  const onScanSuccess = async (decodedText: string) => {
    if (loading || scanResult === decodedText) return;
    
    setScanResult(decodedText);
    setLoading(true);
    setMessage(null);

    // Capture photo BEFORE pausing the scanner
    const photoBase64 = capturePhoto();

    // Pause scanner to prevent multiple scans
    if (scannerRef.current) {
      scannerRef.current.pause(true);
    }

    try {
      // Play scan sound
      const audio = new Audio('/scan-sound.mp3'); 
      audio.play().catch(() => {});

      // Extract token if the decoded text is a full URL
      let tokenToVerify = decodedText;
      const urlMatch = decodedText.match(/\/attendance\/checkin\/([^/]+)$/);
      if (urlMatch) {
        tokenToVerify = urlMatch[1];
      }

      const result = await markAttendance(tokenToVerify, photoBase64 || undefined);
      
      if (result.success) {
        const action = result.member?.type === "checkout" ? "Checked Out" : "Checked In";
        setMessage({ type: "success", text: `${result.member?.name} ${action} Successfully!` });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Try again." });
    } finally {
      setLoading(false);
      // Removed auto-resume; wait for user to click 'Done'
    }
  };

  const onScanFailure = (error: any) => {
    // ignore
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reception Scanner</h1>
          <p className="text-slate-400">Scan member QR codes for auto-attendance</p>
        </div>

        <div className="relative rounded-3xl bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Scanner Container */}
          <div className="relative z-10 w-full overflow-hidden rounded-2xl bg-black">
            <div id="qr-reader" className="w-full [&>div]:border-none [&_video]:rounded-2xl" />
          </div>

          {/* Overlay Status */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-3xl"
              >
                <div className="flex flex-col items-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <p className="text-lg font-medium">Verifying member...</p>
                </div>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 z-30 flex items-center justify-center backdrop-blur-md rounded-3xl ${
                  message.type === "success" ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <div className={`p-8 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-2xl ${
                  message.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}>
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-20 h-20 text-white mb-4" />
                  ) : (
                    <XCircle className="w-20 h-20 text-white mb-4" />
                  )}
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {message.type === "success" ? "Success!" : "Failed"}
                  </h2>
                  <p className="text-white/90 text-lg mb-6">{message.text}</p>
                  
                  <button 
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-200 transition-colors text-lg"
                  >
                    Done
                  </button>

                  {message.type === "error" && (
                    <button 
                      onClick={() => {
                        setScanResult(null);
                        setMessage(null);
                        if (scannerRef.current) scannerRef.current.resume();
                      }}
                      className="mt-4 text-white/80 hover:text-white underline text-sm"
                    >
                      Scan Again
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Global styles specifically to override html5-qrcode's ugly defaults */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: black; }
        #qr-reader__dashboard_section_csr span, #qr-reader__dashboard_section_csr button { color: white !important; }
        #qr-reader button { 
          background: #3b82f6 !important; 
          border: none !important; 
          padding: 8px 16px !important; 
          border-radius: 8px !important; 
          font-weight: 600 !important;
          margin-top: 10px !important;
        }
        #qr-reader__dashboard_section_swaplink { color: #60a5fa !important; }
      `}} />
    </div>
  );
}
