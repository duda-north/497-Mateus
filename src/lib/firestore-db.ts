/**
 * Base operacional só no navegador (localStorage), sem Firebase.
 * Ideal para demo / homologação: dados ficam neste aparelho e navegador.
 */
const STORAGE_KEY = "consorcio-ops-operational-v1";

export type VendaStatus = "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";

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

type PlanoDoc = Omit<PlanoRow, "administradora">;
type VendaDoc = Omit<VendaRow, "administradora" | "plano">;

type DbState = {
  administradoras: AdministradoraRow[];
  planos: PlanoDoc[];
  vendas: VendaDoc[];
};

function emptyDb(): DbState {
  return { administradoras: [], planos: [], vendas: [] };
}

function nowIso(): string {
  return new Date().toISOString();
}

function readDb(): DbState {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as DbState;
    if (!parsed || !Array.isArray(parsed.administradoras)) return emptyDb();
    return {
      administradoras: parsed.administradoras,
      planos: Array.isArray(parsed.planos) ? parsed.planos : [],
      vendas: Array.isArray(parsed.vendas) ? parsed.vendas : [],
    };
  } catch {
    return emptyDb();
  }
}

function writeDb(s: DbState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function newId(): string {
  return crypto.randomUUID();
}

function admMini(db: DbState, id: string): AdministradoraMini | null {
  const a = db.administradoras.find((x) => x.id === id);
  if (!a) return null;
  return { id: a.id, nome: a.nome, cnpj: a.cnpj };
}

function planoMini(db: DbState, id: string | null | undefined): PlanoMini | null {
  if (!id) return null;
  const p = db.planos.find((x) => x.id === id);
  if (!p) return null;
  return { id: p.id, nome: p.nome, tipoBem: p.tipoBem };
}

function toPlanoRow(db: DbState, p: PlanoDoc): PlanoRow | null {
  const adm = admMini(db, p.administradoraId);
  if (!adm) return null;
  return { ...p, administradora: adm };
}

async function mapVenda(db: DbState, v: VendaDoc): Promise<VendaRow> {
  const adm = admMini(db, v.administradoraId);
  if (!adm) throw new Error("Dados inconsistentes.");
  return {
    ...v,
    administradora: adm,
    plano: planoMini(db, v.planoId),
  };
}

/** Mantida para compatibilidade; não faz nada sem Firebase. */
export async function ensureAnonymousAuth(): Promise<void> {
  return;
}

export async function listAdministradoras(): Promise<AdministradoraRow[]> {
  const db = readDb();
  const rows = [...db.administradoras];
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return rows;
}

export async function getAdministradora(id: string): Promise<AdministradoraRow | null> {
  return readDb().administradoras.find((x) => x.id === id) ?? null;
}

async function cnpjEmUso(cnpj: string, excludeId?: string): Promise<boolean> {
  const t = cnpj.trim();
  const db = readDb();
  const hit = db.administradoras.find((a) => a.cnpj.trim() === t && a.id !== excludeId);
  return Boolean(hit);
}

export async function createAdministradora(
  data: Omit<AdministradoraRow, "id" | "createdAt" | "updatedAt">,
): Promise<AdministradoraRow> {
  if (await cnpjEmUso(data.cnpj)) throw new Error("CNPJ já cadastrado.");
  const db = readDb();
  const ts = nowIso();
  const row: AdministradoraRow = { ...data, id: newId(), createdAt: ts, updatedAt: ts };
  db.administradoras.push(row);
  writeDb(db);
  return row;
}

export async function updateAdministradora(
  id: string,
  patch: Partial<Omit<AdministradoraRow, "id" | "createdAt" | "updatedAt">>,
): Promise<AdministradoraRow> {
  if (patch.cnpj !== undefined && (await cnpjEmUso(patch.cnpj, id))) {
    throw new Error("CNPJ já cadastrado.");
  }
  const db = readDb();
  const i = db.administradoras.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("Administradora não encontrada.");
  const cur = db.administradoras[i]!;
  const next: AdministradoraRow = {
    ...cur,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
    id: cur.id,
    createdAt: cur.createdAt,
    updatedAt: nowIso(),
  } as AdministradoraRow;
  db.administradoras[i] = next;
  writeDb(db);
  return next;
}

export async function deleteAdministradora(id: string): Promise<void> {
  const db = readDb();
  if (db.planos.some((p) => p.administradoraId === id)) {
    throw new Error("Existem planos vinculados a esta administradora.");
  }
  if (db.vendas.some((v) => v.administradoraId === id)) {
    throw new Error("Existem vendas vinculadas a esta administradora.");
  }
  db.administradoras = db.administradoras.filter((x) => x.id !== id);
  writeDb(db);
}

export async function listPlanos(): Promise<PlanoRow[]> {
  const db = readDb();
  const out: PlanoRow[] = [];
  for (const p of db.planos) {
    const row = toPlanoRow(db, p);
    if (row) out.push(row);
  }
  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return out;
}

export async function listPlanosMiniByAdministradora(administradoraId: string): Promise<PlanoMini[]> {
  const db = readDb();
  return db.planos
    .filter((p) => p.administradoraId === administradoraId)
    .map((p) => ({ id: p.id, nome: p.nome, tipoBem: p.tipoBem }));
}

export async function getPlano(id: string): Promise<PlanoRow | null> {
  const db = readDb();
  const p = db.planos.find((x) => x.id === id);
  if (!p) return null;
  return toPlanoRow(db, p);
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
  const db = readDb();
  if (!admMini(db, data.administradoraId)) throw new Error("Administradora não encontrada.");
  const ts = nowIso();
  const doc: PlanoDoc = {
    id: newId(),
    administradoraId: data.administradoraId,
    nome: data.nome,
    tipoBem: data.tipoBem,
    valorCreditoCentavos: data.valorCreditoCentavos,
    regrasComissaoJson: data.regrasComissaoJson,
    regrasRecebimentoJson: data.regrasRecebimentoJson,
    regrasEstornoJson: data.regrasEstornoJson,
    createdAt: ts,
    updatedAt: ts,
  };
  db.planos.push(doc);
  writeDb(db);
  return (await getPlano(doc.id))!;
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
  const db = readDb();
  const i = db.planos.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("Plano não encontrado.");
  if (patch.administradoraId && !admMini(db, patch.administradoraId)) {
    throw new Error("Administradora não encontrada.");
  }
  const cur = db.planos[i]!;
  const merged: PlanoDoc = {
    ...cur,
    ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
    id: cur.id,
    createdAt: cur.createdAt,
    updatedAt: nowIso(),
  } as PlanoDoc;
  db.planos[i] = merged;
  writeDb(db);
  return (await getPlano(id))!;
}

export async function deletePlano(id: string): Promise<void> {
  const db = readDb();
  if (db.vendas.some((v) => v.planoId === id)) {
    throw new Error("Existem vendas vinculadas a este plano.");
  }
  db.planos = db.planos.filter((x) => x.id !== id);
  writeDb(db);
}

export async function listVendas(): Promise<VendaRow[]> {
  const db = readDb();
  const rows: VendaRow[] = [];
  for (const v of db.vendas) {
    rows.push(await mapVenda(db, v));
  }
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return rows;
}

export async function getVenda(id: string): Promise<VendaRow | null> {
  const db = readDb();
  const v = db.vendas.find((x) => x.id === id);
  if (!v) return null;
  return mapVenda(db, v);
}

function assertPlanoBelongs(db: DbState, planoId: string | null, administradoraId: string): void {
  if (!planoId) return;
  const p = db.planos.find((x) => x.id === planoId);
  if (!p) throw new Error("Plano não encontrado.");
  if (p.administradoraId !== administradoraId) {
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
  const db = readDb();
  if (!admMini(db, data.administradoraId)) throw new Error("Administradora não encontrada.");
  assertPlanoBelongs(db, data.planoId, data.administradoraId);
  const ts = nowIso();
  const doc: VendaDoc = {
    id: newId(),
    administradoraId: data.administradoraId,
    planoId: data.planoId,
    status: data.status,
    titulo: data.titulo,
    descricao: data.descricao,
    valorCentavos: data.valorCentavos,
    dataVenda: data.dataVenda ? data.dataVenda.toISOString() : null,
    observacoes: data.observacoes,
    createdAt: ts,
    updatedAt: ts,
  };
  db.vendas.push(doc);
  writeDb(db);
  return (await getVenda(doc.id))!;
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
  const db = readDb();
  const i = db.vendas.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("Venda não encontrada.");
  const cur = db.vendas[i]!;
  const nextAdm = patch.administradoraId ?? cur.administradoraId;
  const nextPlano = patch.planoId !== undefined ? patch.planoId : cur.planoId;
  assertPlanoBelongs(db, nextPlano, nextAdm);
  if (patch.administradoraId && !admMini(db, patch.administradoraId)) {
    throw new Error("Administradora não encontrada.");
  }
  const merged: VendaDoc = {
    ...cur,
    administradoraId: patch.administradoraId ?? cur.administradoraId,
    planoId: patch.planoId !== undefined ? patch.planoId : cur.planoId,
    status: patch.status ?? cur.status,
    titulo: patch.titulo ?? cur.titulo,
    descricao: patch.descricao !== undefined ? patch.descricao : cur.descricao,
    valorCentavos: patch.valorCentavos !== undefined ? patch.valorCentavos : cur.valorCentavos,
    observacoes: patch.observacoes !== undefined ? patch.observacoes : cur.observacoes,
    dataVenda:
      patch.dataVenda !== undefined
        ? patch.dataVenda
          ? patch.dataVenda.toISOString()
          : null
        : cur.dataVenda,
    updatedAt: nowIso(),
  };
  db.vendas[i] = merged;
  writeDb(db);
  return (await getVenda(id))!;
}

export async function deleteVenda(id: string): Promise<void> {
  const db = readDb();
  db.vendas = db.vendas.filter((x) => x.id !== id);
  writeDb(db);
}

export async function getDashboardCounts(): Promise<{
  nAdministradoras: number;
  nPlanos: number;
  nVendas: number;
  nVendasFechadas: number;
}> {
  const db = readDb();
  return {
    nAdministradoras: db.administradoras.length,
    nPlanos: db.planos.length,
    nVendas: db.vendas.length,
    nVendasFechadas: db.vendas.filter((v) => v.status === "FECHADA").length,
  };
}
