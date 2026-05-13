"use server";

import { adminDb } from "@/lib/firebase-admin";


export async function rotateReceptionToken() {
  try {
    const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 15000; // 15 seconds

    await adminDb.collection("config").doc("reception").set({
      currentToken: newToken,
      expiresAt: expiresAt,
      updatedAt: new Date().toISOString()
    });

    return { success: true, token: newToken };
  } catch (error) {
    console.error("Error rotating token:", error);
    return { success: false };
  }
}

export async function getLiveToken() {
  try {
    const doc = await adminDb.collection("config").doc("reception").get();
    if (!doc.exists) return null;
    return doc.data()?.currentToken;
  } catch (error) {
    return null;
  }
}
