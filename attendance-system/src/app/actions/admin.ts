"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function getAdminStats() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));

    // Get Total Members
    const membersSnap = await adminDb.collection("users").get();
    const totalMembers = membersSnap.size;

    // Get Present Today
    const todayAttendanceSnap = await adminDb
      .collection("attendance")
      .where("date", "==", todayStr)
      .where("status", "==", "VALID")
      .get();
      
    // Count unique userIds who are present today
    const presentUserIds = new Set();
    todayAttendanceSnap.docs.forEach(doc => {
      presentUserIds.add(doc.data().userId);
    });
    
    const presentToday = presentUserIds.size;
    const absentToday = totalMembers - presentToday;

    // Get Recent Logs
    const recentLogsSnap = await adminDb
      .collection("attendance")
      .orderBy("checkInTime", "desc")
      .limit(20)
      .get();

    const recentLogs = recentLogsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || "Unknown",
        memberId: data.memberId || "N/A",
        checkInTime: data.checkInTime ? new Date(data.checkInTime.seconds * 1000).toISOString() : null,
        method: data.method || "QR Scan",
        status: data.status
      };
    });

    return {
      success: true,
      stats: {
        totalMembers,
        presentToday,
        absentToday
      },
      recentLogs
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, message: "Failed to fetch admin stats" };
  }
}
