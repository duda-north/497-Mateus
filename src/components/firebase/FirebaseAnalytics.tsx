"use client";

import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase";
import { useEffect } from "react";

/**
 * Inicializa o app e o Analytics no cliente (evita import estático de `firebase/analytics` no SSR).
 * Se `NEXT_PUBLIC_FIREBASE_*` não estiverem definidas, não faz nada.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const app = getFirebaseApp();
    if (!app) return;
    void import("firebase/analytics").then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) {
        getAnalytics(app);
      }
    });
  }, []);

  return null;
}
