"use client";

import { useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { ensureAnonymousAuth } from "@/lib/firestore-db";

/** Garante sessão anônima cedo para leituras/escritas no Firestore pelo SDK web. */
export function FirebaseAuthBootstrap() {
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    void ensureAnonymousAuth().catch(() => {});
  }, []);
  return null;
}
