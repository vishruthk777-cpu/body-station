"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getAIFitnessAdvice(prompt: string, memberData: any) {
  try {
    const context = `
      You are a professional Senior Fitness Coach and Nutritionist at Body Station Gym.
      Member Profile:
      - Name: ${memberData.fullName}
      - Goal: ${memberData.fitnessGoal}
      - Experience: ${memberData.experience}
      - Age: ${memberData.age}
      - Weight: ${memberData.weight}kg
      - Height: ${memberData.height}cm
      - Plan: ${memberData.plan}

      Provide professional, motivating, and safe fitness advice. Keep it concise, simple, and human-like.
      Avoid medical diagnoses. Focus on workouts, nutrition, and recovery.
    `;

    const result = await model.generateContent([context, prompt]);
    const response = await result.response;
    return { success: true, text: response.text() };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, message: "Coach is resting right now. Try again later!" };
  }
}

export async function getDailyWorkout(userData: any) {
  try {
    const prompt = `Generate a very short, concise daily workout protocol for ${userData.fullName || 'the user'}. Goal: ${userData.goals || 'General Fitness'}. Keep it to 3-4 bullet points.`;
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return { success: true, workout: response.text() };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, workout: "Warm up: 5m cardio\nStrength: 4x12 compound movements\nCore: 3x15 targeted exercises\nCool down: 5m stretching" };
  }
}

export async function chatWithAdvisor(userId: string, message: string, userData: any) {
  try {
    const context = `You are a professional Senior Fitness Coach and Nutritionist at Body Station Gym. User Profile: Goal is ${userData.goals || 'fitness'}. Keep responses very brief, friendly, and practical.`;
    const result = await model.generateContent([context, message]);
    const response = await result.response;
    return { success: true, response: response.text() };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, response: "Coach is resting right now. Try again later!" };
  }
}

export async function generateAIInsights(attendanceLogs: any[]) {
  try {
    const prompt = `Analyze this attendance data: ${JSON.stringify(attendanceLogs)}. Provide 2-3 brief insights about gym usage patterns or member consistency.`;
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return { success: true, insights: response.text() };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, insights: "Unable to generate insights right now." };
  }
}

export async function generateOnboardingAnalysis(userId: string, formData: any) {
  try {
    const prompt = `Analyze this new member profile: ${JSON.stringify(formData)}. Return a brief, customized 1-month fitness plan overview.`;
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return { success: true, analysis: { planOverview: response.text(), macros: { protein: 150, carbs: 200, fats: 60 } } };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, analysis: null };
  }
}
