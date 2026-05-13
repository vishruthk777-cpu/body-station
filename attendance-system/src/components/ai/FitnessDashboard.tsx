"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Dumbbell, Utensils, TrendingUp, Award, Clock, 
  ChevronRight, Brain, Zap, Droplets, Flame 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { getDailyWorkout } from "@/app/actions/ai";

interface FitnessDashboardProps {
  userData: any;
  attendanceLogs: any[];
}

export default function FitnessDashboard({ userData, attendanceLogs }: FitnessDashboardProps) {
  const [workout, setWorkout] = useState<string>("");
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const aiState = userData.aiState || {};

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoadingWorkout(true);
      const res = await getDailyWorkout(userData);
      if (res.success) setWorkout(res.workout || "");
      setLoadingWorkout(false);
    };
    fetchWorkout();
  }, []);

  // Mock data for charts - in real app would come from userData.progress
  const weightData = [
    { name: 'Week 1', weight: 72 },
    { name: 'Week 2', weight: 71.5 },
    { name: 'Week 3', weight: 71 },
    { name: 'Week 4', weight: 70.2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-1 md:col-span-1 p-6 rounded-3xl bg-blue-600 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-2">Fitness Score</h4>
          <div className="text-5xl font-black text-white mb-2">{aiState.fitnessScore || 0}</div>
          <div className="text-[10px] text-blue-100 uppercase tracking-wider font-bold">Elite Status</div>
        </motion.div>

        <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={<Flame className="text-orange-400" />} label="Daily Target" value={`${aiState.dailyCalorieTarget || 0} kcal`} />
          <StatCard icon={<Droplets className="text-blue-400" />} label="Water Goal" value="3.5 Liters" />
          <StatCard icon={<Award className="text-yellow-400" />} label="Current Goal" value={userData.goals} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Workout Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Today's Protocol</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Personalized Training</p>
                </div>
              </div>
              <button className="text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">Full Plan <ChevronRight className="inline w-4 h-4" /></button>
            </div>

            <div className="prose prose-invert max-w-none">
              {loadingWorkout ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
                </div>
              ) : (
                <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {workout}
                </div>
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-green-500/10 text-green-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Transformation Curve</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>

        {/* Sidebar: Nutrition & AI Chat */}
        <div className="space-y-8">
          {/* Nutrition Summary */}
          <div className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-400" />
              Fueling Plan
            </h3>
            
            <div className="space-y-6">
               <MacroBar label="Protein" current="160g" target={`${aiState.macroSplit?.protein || '0'}g`} color="bg-blue-500" />
               <MacroBar label="Carbs" current="220g" target={`${aiState.macroSplit?.carbs || '0'}g`} color="bg-orange-500" />
               <MacroBar label="Fats" current="65g" target={`${aiState.macroSplit?.fats || '0'}g`} color="bg-yellow-500" />
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Next Suggested Meal</p>
              <p className="text-sm font-medium">Grilled Chicken with Quinoa & Steamed Broccoli</p>
            </div>
          </div>

          {/* AI Advisor CTA */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-900/20">
            <Brain className="w-12 h-12 absolute -bottom-2 -right-2 opacity-20 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Speak with Coach</h3>
            <p className="text-sm text-blue-100 mb-4">Get instant answers about your diet, form, or schedule.</p>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 p-2 rounded-lg">
              <Zap className="w-3 h-3 text-yellow-400" /> Always Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col gap-1">
      <div className="mb-2">{icon}</div>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string, current: string, target: string, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-widest">{label}</span>
        <span>{current} <span className="text-slate-600">/ {target}</span></span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}
