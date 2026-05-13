"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { saveOnboardingData } from "../actions/onboarding";
import { 
  User, Phone, Dumbbell, Target, Calendar, 
  ChevronRight, ChevronLeft, Check, Loader2, Sparkles 
} from "lucide-react";

const steps = [
  { id: "personal", title: "Personal Details", icon: User },
  { id: "membership", title: "Choose Plan", icon: Calendar },
  { id: "fitness", title: "Fitness Goals", icon: Target },
];

export default function Onboarding() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    plan: "Elite",
    duration: "1",
    price: "1500",
    fitnessGoal: "Weight Loss",
    experience: "Beginner",
    age: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (!authLoading && userData?.onboarded) {
      router.push("/dashboard");
    }
    if (user?.displayName) {
      setFormData(prev => ({ ...prev, fullName: user.displayName || "" }));
    }
  }, [user, userData, authLoading]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const result = await saveOnboardingData(user.uid, formData);
    if (result.success) {
      router.push("/dashboard");
    } else {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full z-10"
      >
        {/* Progress Header */}
        <div className="flex justify-between mb-12">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-20 ${
                  idx <= currentStep ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                {idx < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-bold ${idx <= currentStep ? "text-blue-400" : "text-slate-500"}`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 ${
                  idx < currentStep ? "bg-blue-600" : "bg-slate-800"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="w-6 h-6 text-blue-500/50" />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
                  <p className="text-slate-400">Let's start with some basics about you.</p>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-colors"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Age"
                      className="bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 focus:border-blue-500 outline-none"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Height (cm)"
                      className="bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 focus:border-blue-500 outline-none"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      className="bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 focus:border-blue-500 outline-none"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Membership Plan</h2>
                  <p className="text-slate-400">Select the plan that fits your lifestyle.</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: "Standard", price: "1200", desc: "Basic gym access" },
                    { name: "Elite", price: "1500", desc: "Access + AI Coaching" },
                    { name: "Pro", price: "2500", desc: "Access + PT + AI" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setFormData({ ...formData, plan: p.name, price: p.price })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        formData.plan === p.name 
                        ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500" 
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-lg">{p.name}</span>
                        <span className="text-blue-400 font-bold">₹{p.price}/mo</span>
                      </div>
                      <p className="text-sm text-slate-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Duration (Months)</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 outline-none"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months (Recommended)</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (Best Value)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2">Fitness Goal</h2>
                  <p className="text-slate-400">Tell us what you want to achieve.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Powerlifting", "General Fitness"].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, fitnessGoal: goal })}
                      className={`p-4 rounded-2xl border transition-all ${
                        formData.fitnessGoal === goal 
                        ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold" 
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Workout Experience</label>
                  <div className="flex gap-4">
                    {["Beginner", "Intermediate", "Advanced"].map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setFormData({ ...formData, experience: exp })}
                        className={`flex-1 p-4 rounded-2xl border transition-all ${
                          formData.experience === exp 
                          ? "bg-purple-600/10 border-purple-500 text-purple-400 font-bold" 
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-8 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {currentStep === steps.length - 1 ? "Complete Profile" : "Continue"}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
