/**
 * Firestore só no cliente (sem API routes / sem Admin SDK).
 * Exige Auth anônima ativa + regras que permitam `request.auth != null`.
 */
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

const C = {
  administradoras: "administradoras",
  planos: "planos",
  vendas: "vendas",
} as const;

export type VendaStatus = "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";

function db() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Configure as variáveis NEXT_PUBLIC_FIREBASE_* no Netlify.");
  return getFirestore(app);
}

export async function ensureAnonymousAuth(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Configure as variáveis NEXT_PUBLIC_FIREBASE_*.");
  const auth = getAuth(app);
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

function tsIso(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v && typeof v === "object" && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date(0).toISOString();
}

function dataVendaIso(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return tsIso(v);
}

export type AdministradoraRow = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  contatoPrincipal: string | null;
  enderecoLogradouro: string | null;
  enderecoNumero: string | null;
  enderecoComplemento: string | null;
  enderecoBairro: string | null;
  enderecoCidade: string | null;
  enderecoUf: string | null;
  enderecoCep: string | null;
  regrasOperacionaisJson: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapAdministradora(id: string, d: DocumentData): AdministradoraRow {
  return {
    id,
    nome: d.nome as string,
    cnpj: d.cnpj as string,
    telefone: (d.telefone as string | null) ?? null,
    email: (d.email as string | null) ?? null,
    contatoPrincipal: (d.contatoPrincipal as string | null) ?? null,
    enderecoLogradouro: (d.enderecoLogradouro as string | null) ?? null,
    enderecoNumero: (d.enderecoNumero as string | null) ?? null,
    enderecoComplemento: (d.enderecoComplemento as string | null) ?? null,
    enderecoBairro: (d.enderecoBairro as string | null) ?? null,
    enderecoCidade: (d.enderecoCidade as string | null) ?? null,
    enderecoUf: (d.enderecoUf as string | null) ?? null,
    enderecoCep: (d.enderecoCep as string | null) ?? null,
    regrasOperacionaisJson: (d.regrasOperacionaisJson as string | null) ?? null,
    createdAt: tsIso(d.createdAt),
    updatedAt: tsIso(d.updatedAt),
  };
}

export type AdministradoraMini = { id: string; nome: string; cnpj: string };

export type PlanoRow = {
  id: string;
  administradoraId: string;
  administradora: AdministradoraMini;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
  regrasComissaoJson: string | null;
  regrasRecebimentoJson: string | null;
  regrasEstornoJson: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanoMini = { id: string; nome: string; tipoBem: string };

export type VendaRow = {
  id: string;
  administradoraId: string;
  planoId: string | null;
  administradora: AdministradoraMini;
  plano: PlanoMini | null;
  status: VendaStatus;
  titulo: string;
  descricao: string | null;
  valorCentavos: number | null;
  dataVenda: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

async function admMini(id: string): Promise<AdministradoraMini | null> {
  const s = await getDoc(doc(db(), C.administradoras, id));
  if (!s.exists()) return null;
  const d = s.data()!;
  return { id, nome: d.nome as string, cnpj: d.cnpj as string };
}

async function planoMini(id: string | null | undefined): Promise<PlanoMini | null> {
  if (!id) return null;
  const s = await getDoc(doc(db(), C.planos, id));
  if (!s.exists()) return null;
  const d = s.data()!;
  return { id, nome: d.nome as string, tipoBem: d.tipoBem as string };
}

export async function listAdministradoras(): Promise<AdministradoraRow[]> {
  await ensureAnonymousAuth();
  const snap = await getDocs(collection(db(), C.administradoras));
  const rows = snap.docs.map((x) => mapAdministradora(x.id, x.data()));
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return rows;
}

export async function getAdministradora(id: string): Promise<AdministradoraRow | null> {
  await ensureAnonymousAuth();
  const s = await getDoc(doc(db(), C.administradoras, id));
  if (!s.exists()) return null;
  return mapAdministradora(s.id, s.data());
}

async function cnpjEmUso(cnpj: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db(), C.administradoras), where("cnpj", "==", cnpj.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (!excludeId) return true;
  return snap.docs.some((d) => d.id !== excludeId);
}

export async function createAdministradora(
  data: Omit<AdministradoraRow, "id" | "createdAt" | "updatedAt">,
): Promise<AdministradoraRow> {
  await ensureAnonymousAuth();
  if (await cnpjEmUso(data.cnpj)) throw new Error("CNPJ já cadastrado.");
  const ref = doc(collection(db(), C.administradoras));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const s = await getDoc(ref);
  return mapAdministradora(s.id, s.data()!);
}

export async function updateAdministradora(
  id: string,
  patch: Partial<Omit<AdministradoraRow, "id" | "createdAt" | "updatedAt">>,
): Promise<AdministradoraRow> {
  await ensureAnonymousAuth();
  if (patch.cnpj !== undefined && (await cnpjEmUso(patch.cnpj, id))) {
    throw new Error("CNPJ já cadastrado.");
  }
  const clean: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  await updateDoc(doc(db(), C.administradoras, id), clean);
  const r = await getAdministradora(id);
  if (!r) throw new Error("Administradora não encontrada.");
  return r;
}

export async function deleteAdministradora(id: string): Promise<void> {
  await ensureAnonymousAuth();
  const [pq, vq] = await Promise.all([
    getDocs(query(collection(db(), C.planos), where("administradoraId", "==", id))),
    getDocs(query(collection(db(), C.vendas), where("administradoraId", "==", id))),
  ]);
  if (!pq.empty) throw new Error("Existem planos vinculados a esta administradora.");
  if (!vq.empty) throw new Error("Existem vendas vinculadas a esta administradora.");
  await deleteDoc(doc(db(), C.administradoras, id));
}

export async function listPlanos(): Promise<PlanoRow[]> {
  await ensureAnonymousAuth();
  const snap = await getDocs(collection(db(), C.planos));
  const out: PlanoRow[] = [];
  for (const x of snap.docs) {
    const d = x.data();
    const adm = await admMini(d.administradoraId as string);
    if (!adm) continue;
    out.push({
      id: x.id,
      administradoraId: d.administradoraId as string,
      nome: d.nome as string,
      tipoBem: d.tipoBem as string,
      valorCreditoCentavos: (d.valorCreditoCentavos as number | null) ?? null,
      regrasComissaoJson: (d.regrasComissaoJson as string | null) ?? null,
      regrasRecebimentoJson: (d.regrasRecebimentoJson as string | null) ?? null,
      regrasEstornoJson: (d.regrasEstornoJson as string | null) ?? null,
      createdAt: tsIso(d.createdAt),
      updatedAt: tsIso(d.updatedAt),
      administradora: adm,
    });
  }
  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return out;
}

export async function listPlanosMiniByAdministradora(administradoraId: string): Promise<PlanoMini[]> {
  await ensureAnonymousAuth();
  const snap = await getDocs(
    query(collection(db(), C.planos), where("administradoraId", "==", administradoraId)),
  );
  return snap.docs.map((x) => {
    const d = x.data();
    return { id: x.id, nome: d.nome as string, tipoBem: d.tipoBem as string };
  });
}

export async function getPlano(id: string): Promise<PlanoRow | null> {
  await ensureAnonymousAuth();
  const s = await getDoc(doc(db(), C.planos, id));
  if (!s.exists()) return null;
  const d = s.data()!;
  const adm = await admMini(d.administradoraId as string);
  if (!adm) return null;
  return {
    id: s.id,
    administradoraId: d.administradoraId as string,
    nome: d.nome as string,
    tipoBem: d.tipoBem as string,
    valorCreditoCentavos: (d.valorCreditoCentavos as number | null) ?? null,
    regrasComissaoJson: (d.regrasComissaoJson as string | null) ?? null,
    regrasRecebimentoJson: (d.regrasRecebimentoJson as string | null) ?? null,
    regrasEstornoJson: (d.regrasEstornoJson as string | null) ?? null,
    createdAt: tsIso(d.createdAt),
    updatedAt: tsIso(d.updatedAt),
    administradora: adm,
  };
}

export async function createPlano(data: {
  administradoraId: string;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
  regrasComissaoJson: string | null;
  regrasRecebimentoJson: string | null;
  regrasEstornoJson: string | null;
}): Promise<PlanoRow> {
  await ensureAnonymousAuth();
  const adm = await admMini(data.administradoraId);
  if (!adm) throw new Error("Administradora não encontrada.");
  const ref = doc(collection(db(), C.planos));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return (await getPlano(ref.id))!;
}

export async function updatePlano(
  id: string,
  patch: Partial<{
    administradoraId: string;
    nome: string;
    tipoBem: string;
    valorCreditoCentavos: number | null;
    regrasComissaoJson: string | null;
    regrasRecebimentoJson: string | null;
    regrasEstornoJson: string | null;
  }>,
): Promise<PlanoRow> {
  await ensureAnonymousAuth();
  if (patch.administradoraId) {
    const a = await admMini(patch.administradoraId);
    if (!a) throw new Error("Administradora não encontrada.");
  }
  const clean: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  await updateDoc(doc(db(), C.planos, id), clean);
  const r = await getPlano(id);
  if (!r) throw new Error("Plano não encontrado.");
  return r;
}

export async function deletePlano(id: string): Promise<void> {
  await ensureAnonymousAuth();
  const q = await getDocs(query(collection(db(), C.vendas), where("planoId", "==", id)));
  if (!q.empty) throw new Error("Existem vendas vinculadas a este plano.");
  await deleteDoc(doc(db(), C.planos, id));
}

async function mapVenda(id: string, d: DocumentData): Promise<VendaRow> {
  const adm = await admMini(d.administradoraId as string);
  if (!adm) throw new Error("Dados inconsistentes.");
  const plano = await planoMini(d.planoId as string | null);
  return {
    id,
    administradoraId: d.administradoraId as string,
    planoId: (d.planoId as string | null) ?? null,
    administradora: adm,
    plano,
    status: d.status as VendaStatus,
    titulo: d.titulo as string,
    descricao: (d.descricao as string | null) ?? null,
    valorCentavos: (d.valorCentavos as number | null) ?? null,
    dataVenda: dataVendaIso(d.dataVenda),
    observacoes: (d.observacoes as string | null) ?? null,
    createdAt: tsIso(d.createdAt),
    updatedAt: tsIso(d.updatedAt),
  };
}

export async function listVendas(): Promise<VendaRow[]> {
  await ensureAnonymousAuth();
  const snap = await getDocs(collection(db(), C.vendas));
  const rows: VendaRow[] = [];
  for (const x of snap.docs) {
    rows.push(await mapVenda(x.id, x.data()));
  }
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return rows;
}

export async function getVenda(id: string): Promise<VendaRow | null> {
  await ensureAnonymousAuth();
  const s = await getDoc(doc(db(), C.vendas, id));
  if (!s.exists()) return null;
  return mapVenda(s.id, s.data());
}

async function assertPlanoBelongs(planoId: string | null, administradoraId: string) {
  if (!planoId) return;
  const s = await getDoc(doc(db(), C.planos, planoId));
  if (!s.exists()) throw new Error("Plano não encontrado.");
  if ((s.data()!.administradoraId as string) !== administradoraId) {
    throw new Error("O plano não pertence à administradora selecionada.");
  }
}

export async function createVenda(data: {
  administradoraId: string;
  planoId: string | null;
  status: VendaStatus;
  titulo: string;
  descricao: string | null;
  valorCentavos: number | null;
  dataVenda: Date | null;
  observacoes: string | null;
}): Promise<VendaRow> {
  await ensureAnonymousAuth();
  const adm = await admMini(data.administradoraId);
  if (!adm) throw new Error("Administradora não encontrada.");
  await assertPlanoBelongs(data.planoId, data.administradoraId);
  const ref = doc(collection(db(), C.vendas));
  await setDoc(ref, {
    administradoraId: data.administradoraId,
    planoId: data.planoId,
    status: data.status,
    titulo: data.titulo,
    descricao: data.descricao,
    valorCentavos: data.valorCentavos,
    dataVenda: data.dataVenda ? Timestamp.fromDate(data.dataVenda) : null,
    observacoes: data.observacoes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return (await getVenda(ref.id))!;
}

export async function updateVenda(
  id: string,
  patch: Partial<{
    administradoraId: string;
    planoId: string | null;
    status: VendaStatus;
    titulo: string;
    descricao: string | null;
    valorCentavos: number | null;
    dataVenda: Date | null;
    observacoes: string | null;
  }>,
): Promise<VendaRow> {
  await ensureAnonymousAuth();
  const cur = await getDoc(doc(db(), C.vendas, id));
  if (!cur.exists()) throw new Error("Venda não encontrada.");
  const nextAdm = patch.administradoraId ?? (cur.data()!.administradoraId as string);
  const nextPlano =
    patch.planoId !== undefined ? patch.planoId : (cur.data()!.planoId as string | null);
  await assertPlanoBelongs(nextPlano, nextAdm);
  if (patch.administradoraId) {
    const a = await admMini(patch.administradoraId);
    if (!a) throw new Error("Administradora não encontrada.");
  }
  const clean: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.administradoraId !== undefined) clean.administradoraId = patch.administradoraId;
  if (patch.planoId !== undefined) clean.planoId = patch.planoId;
  if (patch.status !== undefined) clean.status = patch.status;
  if (patch.titulo !== undefined) clean.titulo = patch.titulo;
  if (patch.descricao !== undefined) clean.descricao = patch.descricao;
  if (patch.valorCentavos !== undefined) clean.valorCentavos = patch.valorCentavos;
  if (patch.observacoes !== undefined) clean.observacoes = patch.observacoes;
  if (patch.dataVenda !== undefined) {
    clean.dataVenda = patch.dataVenda ? Timestamp.fromDate(patch.dataVenda) : null;
  }
  await updateDoc(doc(db(), C.vendas, id), clean);
  const r = await getVenda(id);
  if (!r) throw new Error("Venda não encontrada.");
  return r;
}

export async function deleteVenda(id: string): Promise<void> {
  await ensureAnonymousAuth();
  await deleteDoc(doc(db(), C.vendas, id));
}

export async function getDashboardCounts(): Promise<{
  nAdministradoras: number;
  nPlanos: number;
  nVendas: number;
  nVendasFechadas: number;
}> {
  await ensureAnonymousAuth();
  const d = db();
  const [a, p, v, vf] = await Promise.all([
    getDocs(collection(d, C.administradoras)),
    getDocs(collection(d, C.planos)),
    getDocs(collection(d, C.vendas)),
    getDocs(query(collection(d, C.vendas), where("status", "==", "FECHADA"))),
  ]);
  return {
    nAdministradoras: a.size,
    nPlanos: p.size,
    nVendas: v.size,
    nVendasFechadas: vf.size,
  };
}
