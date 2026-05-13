import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    // 1. Basic security validation
    // Normally you'd want a secret token here that only your Cron service knows
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 2. Fetch all Active Members
    const membersSnap = await adminDb.collection("users").where("status", "==", "ACTIVE").get();
    const allMembers = membersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

    // 3. Fetch all Attendance for today
    const attendanceSnap = await adminDb
      .collection("attendance")
      .where("date", "==", todayStr)
      .get();
      
    // Set of UIDs who checked in today
    const presentUIDs = new Set();
    attendanceSnap.docs.forEach(doc => presentUIDs.add(doc.data().userId));

    // 4. Find members who are NOT in the present set
    const batch = adminDb.batch();
    let absentCount = 0;

    for (const member of allMembers) {
      if (!presentUIDs.has(member.uid)) {
        const newLogRef = adminDb.collection("attendance").doc();
        batch.set(newLogRef, {
          userId: member.uid,
          memberId: member.memberId || "N/A",
          fullName: member.fullName || "Unknown",
          date: todayStr,
          status: "ABSENT",
          method: "System Auto-Cron",
          timestamp: new Date().toISOString()
        });
        absentCount++;
      }
    }

    // 5. Commit all Absent logs at once
    if (absentCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Marked ${absentCount} members as ABSENT for ${todayStr}.` 
    });

  } catch (error) {
    console.error("Cron Error marking absent:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
