"use server";

import { encryptToken } from "@/lib/security";

export async function getSecureToken(uid: string) {
  if (!uid) return null;
  return encryptToken(uid);
}
