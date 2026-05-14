import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

const C = {
  administradoras: "administradoras",
  planos: "planos",
  vendas: "vendas",
} as const;

export type VendaStatus = "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";

function newId(): string {
  return globalThis.crypto.randomUUID();
}

function tsToIso(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (
    v &&
    typeof v === "object" &&
    "toDate" in v &&
    typeof (v as { toDate: () => Date }).toDate === "function"
  ) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  return new Date(0).toISOString();
}

function dataVendaToIso(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Timestamp) return v.toDate().toISOString();
  return tsToIso(v);
}

type AdmDoc = {
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
  createdAt: unknown;
  updatedAt: unknown;
};

export type AdministradoraRow = Omit<AdmDoc, "createdAt" | "updatedAt"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeAdministradora(id: string, d: DocumentData): AdministradoraRow {
  const x = d as AdmDoc;
  return {
    id,
    nome: x.nome,
    cnpj: x.cnpj,
    telefone: x.telefone ?? null,
    email: x.email ?? null,
    contatoPrincipal: x.contatoPrincipal ?? null,
    enderecoLogradouro: x.enderecoLogradouro ?? null,
    enderecoNumero: x.enderecoNumero ?? null,
    enderecoComplemento: x.enderecoComplemento ?? null,
    enderecoBairro: x.enderecoBairro ?? null,
    enderecoCidade: x.enderecoCidade ?? null,
    enderecoUf: x.enderecoUf ?? null,
    enderecoCep: x.enderecoCep ?? null,
    regrasOperacionaisJson: x.regrasOperacionaisJson ?? null,
    createdAt: tsToIso(x.createdAt),
    updatedAt: tsToIso(x.updatedAt),
  };
}

type AdmRef = { id: string; nome: string; cnpj: string };

async function admRef(id: string): Promise<AdmRef | null> {
  const snap = await getAdminDb().collection(C.administradoras).doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return { id, nome: d.nome as string, cnpj: d.cnpj as string };
}

type PlanoDoc = {
  administradoraId: string;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
  regrasComissaoJson: string | null;
  regrasRecebimentoJson: string | null;
  regrasEstornoJson: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

export type PlanoRow = {
  id: string;
  administradoraId: string;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
  regrasComissaoJson: string | null;
  regrasRecebimentoJson: string | null;
  regrasEstornoJson: string | null;
  createdAt: string;
  updatedAt: string;
  administradora: AdmRef;
};

function serializePlano(id: string, d: DocumentData, administradora: AdmRef): PlanoRow {
  const x = d as PlanoDoc;
  return {
    id,
    administradoraId: x.administradoraId,
    nome: x.nome,
    tipoBem: x.tipoBem,
    valorCreditoCentavos: x.valorCreditoCentavos ?? null,
    regrasComissaoJson: x.regrasComissaoJson ?? null,
    regrasRecebimentoJson: x.regrasRecebimentoJson ?? null,
    regrasEstornoJson: x.regrasEstornoJson ?? null,
    createdAt: tsToIso(x.createdAt),
    updatedAt: tsToIso(x.updatedAt),
    administradora,
  };
}

type PlanoLite = { id: string; nome: string; tipoBem: string };

async function planoLite(id: string | null | undefined): Promise<PlanoLite | null> {
  if (!id) return null;
  const snap = await getAdminDb().collection(C.planos).doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  return { id, nome: d.nome as string, tipoBem: d.tipoBem as string };
}

type VendaDoc = {
  administradoraId: string;
  planoId: string | null;
  status: VendaStatus;
  titulo: string;
  descricao: string | null;
  valorCentavos: number | null;
  dataVenda: unknown;
  observacoes: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

export type VendaRow = Omit<VendaDoc, "dataVenda" | "createdAt" | "updatedAt"> & {
  id: string;
  dataVenda: string | null;
  createdAt: string;
  updatedAt: string;
  administradora: AdmRef;
  plano: PlanoLite | null;
};

async function serializeVenda(id: string, d: DocumentData): Promise<VendaRow> {
  const x = d as VendaDoc;
  const [adm, plano] = await Promise.all([
    admRef(x.administradoraId),
    planoLite(x.planoId),
  ]);
  if (!adm) throw new Error("Administradora órfã na venda.");
  return {
    id,
    administradoraId: x.administradoraId,
    planoId: x.planoId ?? null,
    status: x.status,
    titulo: x.titulo,
    descricao: x.descricao ?? null,
    valorCentavos: x.valorCentavos ?? null,
    dataVenda: dataVendaToIso(x.dataVenda),
    observacoes: x.observacoes ?? null,
    createdAt: tsToIso(x.createdAt),
    updatedAt: tsToIso(x.updatedAt),
    administradora: adm,
    plano: plano,
  };
}

export async function listAdministradoras(): Promise<AdministradoraRow[]> {
  const snap = await getAdminDb().collection(C.administradoras).get();
  const rows = snap.docs.map((doc) => serializeAdministradora(doc.id, doc.data()));
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return rows;
}

export async function getAdministradora(id: string): Promise<AdministradoraRow | null> {
  const snap = await getAdminDb().collection(C.administradoras).doc(id).get();
  if (!snap.exists) return null;
  return serializeAdministradora(snap.id, snap.data()!);
}

/** `true` se já existir outra administradora com o mesmo CNPJ (ignorando `excludeId` no update). */
export async function administradoraCnpjEmConflito(cnpj: string, excludeId?: string): Promise<boolean> {
  const trimmed = cnpj.trim();
  const q = await getAdminDb().collection(C.administradoras).where("cnpj", "==", trimmed).limit(2).get();
  if (q.empty) return false;
  if (excludeId) return q.docs.some((d) => d.id !== excludeId);
  return true;
}

export async function createAdministradora(
  data: Omit<AdmDoc, "createdAt" | "updatedAt">,
): Promise<AdministradoraRow> {
  const id = newId();
  const ref = getAdminDb().collection(C.administradoras).doc(id);
  await ref.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  return serializeAdministradora(snap.id, snap.data()!);
}

export async function updateAdministradora(
  id: string,
  patch: Partial<AdmDoc>,
): Promise<AdministradoraRow | null> {
  const ref = getAdminDb().collection(C.administradoras).doc(id);
  const cur = await ref.get();
  if (!cur.exists) return null;
  const clean: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  await ref.update(clean);
  const snap = await ref.get();
  return serializeAdministradora(snap.id, snap.data()!);
}

export async function deleteAdministradora(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getAdminDb();
  const [p, v] = await Promise.all([
    db.collection(C.planos).where("administradoraId", "==", id).limit(1).get(),
    db.collection(C.vendas).where("administradoraId", "==", id).limit(1).get(),
  ]);
  if (!p.empty) return { ok: false, reason: "Existem planos vinculados a esta administradora." };
  if (!v.empty) return { ok: false, reason: "Existem vendas vinculadas a esta administradora." };
  await db.collection(C.administradoras).doc(id).delete();
  return { ok: true };
}

export async function listPlanos(administradoraId: string | null): Promise<PlanoRow[]> {
  const db = getAdminDb();
  let snap;
  if (administradoraId) {
    snap = await db.collection(C.planos).where("administradoraId", "==", administradoraId).get();
    const rows: PlanoRow[] = [];
    for (const doc of snap.docs) {
      const adm = await admRef(doc.data()!.administradoraId as string);
      if (!adm) continue;
      rows.push(serializePlano(doc.id, doc.data()!, adm));
    }
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return rows;
  }
  snap = await db.collection(C.planos).get();
  const out: PlanoRow[] = [];
  for (const doc of snap.docs) {
    const adm = await admRef(doc.data()!.administradoraId as string);
    if (!adm) continue;
    out.push(serializePlano(doc.id, doc.data()!, adm));
  }
  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return out;
}

export async function getPlano(id: string): Promise<PlanoRow | null> {
  const snap = await getAdminDb().collection(C.planos).doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  const adm = await admRef(d.administradoraId as string);
  if (!adm) return null;
  return serializePlano(snap.id, d, adm);
}

export async function getPlanoAdministradoraId(planoId: string): Promise<string | null> {
  const snap = await getAdminDb().collection(C.planos).doc(planoId).get();
  if (!snap.exists) return null;
  return (snap.data()!.administradoraId as string) ?? null;
}

export async function createPlano(
  data: Omit<PlanoDoc, "createdAt" | "updatedAt">,
): Promise<PlanoRow> {
  const id = newId();
  const ref = getAdminDb().collection(C.planos).doc(id);
  await ref.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  const adm = await admRef(data.administradoraId);
  if (!adm) throw new Error("Administradora não encontrada.");
  return serializePlano(snap.id, snap.data()!, adm);
}

export async function updatePlano(
  id: string,
  patch: Partial<PlanoDoc>,
): Promise<PlanoRow | null> {
  const ref = getAdminDb().collection(C.planos).doc(id);
  const cur = await ref.get();
  if (!cur.exists) return null;
  const clean: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) clean[k] = v;
  }
  await ref.update(clean);
  return getPlano(id);
}

export async function deletePlano(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const q = await getAdminDb().collection(C.vendas).where("planoId", "==", id).limit(1).get();
  if (!q.empty) return { ok: false, reason: "Existem vendas vinculadas a este plano." };
  await getAdminDb().collection(C.planos).doc(id).delete();
  return { ok: true };
}

export async function listVendas(filters: {
  administradoraId: string | null;
  status: VendaStatus | null;
}): Promise<VendaRow[]> {
  const snap = await getAdminDb().collection(C.vendas).get();
  let docs = [...snap.docs];
  docs.sort(
    (a, b) =>
      new Date(tsToIso(b.data().createdAt)).getTime() -
      new Date(tsToIso(a.data().createdAt)).getTime(),
  );
  docs = docs.slice(0, 2000);
  if (filters.administradoraId) {
    docs = docs.filter((d) => d.data().administradoraId === filters.administradoraId);
  }
  if (filters.status) {
    docs = docs.filter((d) => d.data().status === filters.status);
  }
  const out: VendaRow[] = [];
  for (const doc of docs) {
    out.push(await serializeVenda(doc.id, doc.data()!));
  }
  return out;
}

export async function getVenda(id: string): Promise<VendaRow | null> {
  const snap = await getAdminDb().collection(C.vendas).doc(id).get();
  if (!snap.exists) return null;
  return serializeVenda(snap.id, snap.data()!);
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
  const id = newId();
  const ref = getAdminDb().collection(C.vendas).doc(id);
  await ref.set({
    administradoraId: data.administradoraId,
    planoId: data.planoId ?? null,
    status: data.status,
    titulo: data.titulo,
    descricao: data.descricao ?? null,
    valorCentavos: data.valorCentavos ?? null,
    dataVenda: data.dataVenda ? Timestamp.fromDate(data.dataVenda) : null,
    observacoes: data.observacoes ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  return serializeVenda(snap.id, snap.data()!);
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
): Promise<VendaRow | null> {
  const ref = getAdminDb().collection(C.vendas).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  const firePatch: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (patch.administradoraId !== undefined) firePatch.administradoraId = patch.administradoraId;
  if (patch.planoId !== undefined) firePatch.planoId = patch.planoId;
  if (patch.status !== undefined) firePatch.status = patch.status;
  if (patch.titulo !== undefined) firePatch.titulo = patch.titulo;
  if (patch.descricao !== undefined) firePatch.descricao = patch.descricao;
  if (patch.valorCentavos !== undefined) firePatch.valorCentavos = patch.valorCentavos;
  if (patch.observacoes !== undefined) firePatch.observacoes = patch.observacoes;
  if (patch.dataVenda !== undefined) {
    firePatch.dataVenda =
      patch.dataVenda === null ? null : Timestamp.fromDate(patch.dataVenda);
  }

  await ref.update(firePatch);
  return getVenda(id);
}

export async function deleteVenda(id: string): Promise<void> {
  await getAdminDb().collection(C.vendas).doc(id).delete();
}

export async function getDashboardCounts(): Promise<{
  nAdministradoras: number;
  nPlanos: number;
  nVendas: number;
  nVendasFechadas: number;
}> {
  const db = getAdminDb();
  const [a, p, v, vf] = await Promise.all([
    db.collection(C.administradoras).count().get(),
    db.collection(C.planos).count().get(),
    db.collection(C.vendas).count().get(),
    db.collection(C.vendas).where("status", "==", "FECHADA").count().get(),
  ]);
  return {
    nAdministradoras: a.data().count,
    nPlanos: p.data().count,
    nVendas: v.data().count,
    nVendasFechadas: vf.data().count,
  };
}
