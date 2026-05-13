"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Target, Shield, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { generateOnboardingAnalysis } from "@/app/actions/ai";

interface OnboardingFormProps {
  userId: string;
  onComplete: (analysis: any) => void;
}

export default function OnboardingForm({ userId, onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    level: "Beginner",
    experience: "Less than 6 months",
    goals: "Muscle Gain",
    medicalLimitations: "",
    dietaryPreference: "Non-Vegetarian",
    activityLevel: "Moderate",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await generateOnboardingAnalysis(userId, formData);
      if (result.success) {
        onComplete(result.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Personal Details", icon: <User className="w-5 h-5" /> },
    { title: "Fitness Goals", icon: <Target className="w-5 h-5" /> },
    { title: "Lifestyle", icon: <Activity className="w-5 h-5" /> },
    { title: "Health Info", icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-between">
        {steps.map((s, i) => (
          <div key={i} className={`flex flex-col items-center gap-2 ${step > i ? 'text-blue-400' : 'text-slate-600'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step > i ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
              {step > i + 1 ? <ArrowRight className="w-5 h-5" /> : s.icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">{s.title}</span>
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Let's get to know <span className="text-blue-400">you</span></h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Age</label>
                <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 25" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Height (cm)</label>
                <input name="height" type="number" value={formData.height} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none" placeholder="175" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Weight (kg)</label>
                <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none" placeholder="70" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">What's your <span className="text-blue-400">mission</span>?</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Primary Goal</label>
                <select name="goals" value={formData.goals} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none">
                  <option>Weight Loss</option>
                  <option>Muscle Gain</option>
                  <option>Fat Loss</option>
                  <option>Strength</option>
                  <option>Endurance</option>
                  <option>Athletic Performance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Fitness Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <button
                      key={l}
                      onClick={() => setFormData({...formData, level: l})}
                      className={`p-3 rounded-xl border transition-all ${formData.level === l ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-800 bg-slate-800/50 text-slate-400'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Your <span className="text-blue-400">Lifestyle</span></h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Dietary Preference</label>
                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none">
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Vegan</option>
                  <option>Eggetarian</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-slate-800 border-none rounded-xl p-3 outline-none">
                  <option value="Sedentary">Sedentary (Office job)</option>
                  <option value="Moderate">Moderate (Active daily)</option>
                  <option value="Active">Active (Heavy exercise)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Safety <span className="text-blue-400">First</span></h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold">Medical Limitations / Injuries</label>
                <textarea 
                  name="medicalLimitations" 
                  value={formData.medicalLimitations} 
                  onChange={handleChange} 
                  className="w-full bg-slate-800 border-none rounded-xl p-4 outline-none min-h-[120px]" 
                  placeholder="e.g. Back pain, Knee injury, Asthma... (Leave blank if none)"
                />
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                ⚠️ Information provided here helps AI suggest safer workouts, but always consult a doctor before starting a new regime.
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex gap-4">
          {step > 1 && (
            <button onClick={prevStep} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={nextStep} className="flex-[2] flex items-center justify-center gap-2 p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generate My Plan</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
