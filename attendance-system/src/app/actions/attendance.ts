"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { subMinutes } from "date-fns";

export async function markAttendance(qrToken: string, photoBase64?: string) {
  try {
    if (!qrToken) return { success: false, message: "Invalid QR code" };

    // 1. Find user by QR token
    // For now, qrToken is just the uid. In production, this should be decrypted.
    const userDoc = await adminDb.collection("users").doc(qrToken).get();
    
    if (!userDoc.exists) {
      return { success: false, message: "Member not found" };
    }

    const userData = userDoc.data();
    
    if (userData?.status !== "ACTIVE") {
      return { success: false, message: "Membership is not active" };
    }

    // 2. Fetch the most recent attendance log for today
    const startOfToday = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
    
    const recentAttendanceSnap = await adminDb
      .collection("attendance")
      .where("userId", "==", qrToken)
      .where("checkInTime", ">=", startOfToday)
      .orderBy("checkInTime", "desc")
      .limit(1)
      .get();

    const now = Timestamp.now();
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (!recentAttendanceSnap.empty) {
      const lastLog = recentAttendanceSnap.docs[0];
      const lastLogData = lastLog.data();

      // If there's no checkOutTime, the user is currently checked in
      if (!lastLogData.checkOutTime) {
        // Prevent accidental double scan within 2 minutes (120 seconds)
        const secondsSinceCheckIn = now.seconds - lastLogData.checkInTime.seconds;
        if (secondsSinceCheckIn < 120) {
           return { success: false, message: "You just checked in! Please wait before checking out." };
        }

        // Mark checkout
        await lastLog.ref.update({
          checkOutTime: now,
          checkOutPhotoBase64: photoBase64 || null
        });

        return { 
          success: true, 
          message: "Check-out marked successfully!",
          member: {
            name: userData?.fullName,
            memberId: userData?.memberId,
            type: "checkout",
            entryId: lastLog.id
          }
        };
      }
    }

    // 3. Mark check-in (no logs today, or last log is already checked out)
    const newLogRef = await adminDb.collection("attendance").add({
      userId: qrToken,
      memberId: userData?.memberId,
      fullName: userData?.fullName,
      checkInTime: now,
      checkOutTime: null,
      date: todayStr,
      status: "VALID",
      photoBase64: photoBase64 || null,
    });

    return { 
      success: true, 
      message: "Check-in marked successfully!",
      member: {
        name: userData?.fullName,
        memberId: userData?.memberId,
        type: "checkin",
        entryId: newLogRef.id
      }
    };

  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return { success: false, message: "System error: " + error.message };
  }
}
