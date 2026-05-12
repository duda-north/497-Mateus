"use client";

import { getFirebaseApp } from "@/lib/firebase";
import { useEffect } from "react";

/**
 * Inicializa o app e o Analytics no cliente (evita import estático de `firebase/analytics` no SSR).
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    const app = getFirebaseApp();
    void import("firebase/analytics").then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) {
        getAnalytics(app);
      }
    });
  }, []);

  return null;
}
