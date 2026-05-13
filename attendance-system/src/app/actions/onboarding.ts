"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function saveOnboardingData(userId: string, data: any) {
  try {
    const expiryDate = new Date();
    const duration = parseInt(data.duration) || 1;
    expiryDate.setMonth(expiryDate.getMonth() + duration);

    await adminDb.collection("users").doc(userId).set({
      ...data,
      onboarded: true,
      role: "MEMBER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return { success: false, message: "Failed to save data." };
  }
}
