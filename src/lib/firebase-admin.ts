import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let firestore: Firestore | undefined;

/**
 * Inicializa o Firebase Admin uma vez. Exige `FIREBASE_SERVICE_ACCOUNT_JSON`
 * (JSON minificado da conta de serviço do mesmo projeto do app web).
 */
export function getFirebaseAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"]?.trim();
  if (!raw) {
    throw new Error(
      "Defina FIREBASE_SERVICE_ACCOUNT_JSON com o JSON da conta de serviço (Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada).",
    );
  }

  let parsed: ServiceAccount;
  try {
    parsed = JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não é um JSON válido.");
  }

  app = initializeApp({ credential: cert(parsed) });
  return app;
}

export function getAdminDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseAdminApp());
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}
