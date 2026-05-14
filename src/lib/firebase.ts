import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

function readFirebaseOptions(): FirebaseOptions | null {
  const apiKey = process.env["NEXT_PUBLIC_FIREBASE_API_KEY"];
  const authDomain = process.env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"];
  const projectId = process.env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"];
  const storageBucket = process.env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"];
  const messagingSenderId = process.env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"];
  const appId = process.env["NEXT_PUBLIC_FIREBASE_APP_ID"];
  const measurementId = process.env["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"];

  if (
    !apiKey?.trim() ||
    !authDomain?.trim() ||
    !projectId?.trim() ||
    !storageBucket?.trim() ||
    !messagingSenderId?.trim() ||
    !appId?.trim()
  ) {
    return null;
  }

  return {
    apiKey: apiKey.trim(),
    authDomain: authDomain.trim(),
    projectId: projectId.trim(),
    storageBucket: storageBucket.trim(),
    messagingSenderId: messagingSenderId.trim(),
    appId: appId.trim(),
    ...(measurementId?.trim() ? { measurementId: measurementId.trim() } : {}),
  };
}

/** True quando todas as variáveis obrigatórias do Firebase Web estão definidas. */
export function isFirebaseConfigured(): boolean {
  return readFirebaseOptions() !== null;
}

let cachedApp: FirebaseApp | undefined;

/**
 * Retorna o app Firebase ou `null` se as variáveis de ambiente não estiverem completas.
 * Não lança erro: o app Next funciona sem Firebase até você preencher `.env.local`.
 */
export function getFirebaseApp(): FirebaseApp | null {
  const opts = readFirebaseOptions();
  if (!opts) return null;
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }
  cachedApp = initializeApp(opts);
  return cachedApp;
}
