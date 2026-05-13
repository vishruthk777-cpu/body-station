"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your member portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-white text-slate-950 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative mt-6 flex items-center justify-center">
            <div className="absolute border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900/50 relative px-4 text-sm text-slate-500">Or continue with</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
                const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");
                
                const provider = new GoogleAuthProvider();
                const userCredential = await signInWithPopup(auth, provider);
                const user = userCredential.user;

                // Check if user already exists in Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) {
                  // New user, register them in db
                  const memberId = `MEM-${Math.floor(10000 + Math.random() * 90000)}`;
                  await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    memberId,
                    fullName: user.displayName || "New Member",
                    email: user.email,
                    phone: user.phoneNumber || "",
                    role: "MEMBER",
                    status: "ACTIVE",
                    qrToken: user.uid,
                    createdAt: serverTimestamp(),
                  });
                }
                
                router.push("/dashboard");
              } catch (err: any) {
                setError(err.message || "Failed to sign in with Google");
              } finally {
                setLoading(false);
              }
            }}
            type="button"
            className="w-full bg-slate-950 border border-slate-800 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.69 17.6V20.35H19.26C21.36 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.26 20.35L15.69 17.6C14.71 18.26 13.45 18.66 12 18.66C9.18 18.66 6.79 16.76 5.88 14.21H2.21V17.06C4.01 20.63 7.71 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.21C5.65 13.51 5.51 12.77 5.51 12C5.51 11.23 5.65 10.49 5.88 9.79V6.94H2.21C1.47 8.42 1.04 10.15 1.04 12C1.04 13.85 1.47 15.58 2.21 17.06L5.88 14.21Z" fill="#FBBC05"/>
              <path d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.98L19.34 3.84C17.45 2.08 14.97 1 12 1C7.71 1 4.01 3.37 2.21 6.94L5.88 9.79C6.79 7.24 9.18 5.34 12 5.34Z" fill="#EA4335"/>
            </svg>
            Sign In with Google
          </motion.button>

          <p className="text-center text-slate-400 text-sm mt-8">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-white hover:text-blue-400 transition-colors font-medium">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
