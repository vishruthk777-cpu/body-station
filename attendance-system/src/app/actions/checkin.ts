"use server";

import { adminDb } from "@/lib/firebase-admin";
import { decryptToken } from "@/lib/security";
import { Timestamp } from "firebase-admin/firestore";
import { headers } from "next/headers";

export async function getMemberFromToken(token: string) {
  try {
    const uid = decryptToken(token);
    if (!uid) return { success: false, message: "Invalid or corrupted QR token." };

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) return { success: false, message: "Member not found." };

    const data = userDoc.data();
    if (data?.status !== "ACTIVE") {
      return { success: false, message: "Membership is not active." };
    }

    return {
      success: true,
      member: {
        uid,
        fullName: data?.fullName,
        memberId: data?.memberId,
        membershipPlan: data?.membershipPlan,
        membershipExpiry: data?.membershipExpiry ? new Date(data.membershipExpiry.seconds * 1000).toISOString() : null,
        photoUrl: data?.photoUrl || null,
      }
    };
  } catch (error) {
    return { success: false, message: "System error while verifying token." };
  }
}

export async function submitSelfCheckin(token: string) {
  try {
    const uid = decryptToken(token);
    if (!uid) return { success: false, message: "Invalid or corrupted QR token." };

    // Get Device and IP (optional, good for security)
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown Device";
    const ip = headersList.get("x-forwarded-for") || "Unknown IP";

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) return { success: false, message: "Member not found." };
    const userData = userDoc.data();

    // Prevent duplicate attendance for today
    const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
    const recentAttendanceSnap = await adminDb
      .collection("attendance")
      .where("userId", "==", uid)
      .where("checkInTime", ">=", startOfToday)
      .limit(1)
      .get();

    if (!recentAttendanceSnap.empty) {
      return { success: false, message: "Attendance Already Marked Today." };
    }

    const now = Timestamp.now();
    const todayStr = new Date().toISOString().split("T")[0];

    // Create attendance log
    await adminDb.collection("attendance").add({
      userId: uid,
      memberId: userData?.memberId,
      fullName: userData?.fullName,
      checkInTime: now,
      checkOutTime: null, // Self-checkout could be added later, but usually just check-in is fine for self-scan
      date: todayStr,
      status: "VALID",
      deviceInfo: userAgent,
      ipAddress: ip,
      method: "Self-Scan QR"
    });

    return { success: true, message: "Attendance Marked Successfully!" };

  } catch (error) {
    console.error("Self Checkin Error:", error);
    return { success: false, message: "Server error occurred." };
  }
}
