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
