"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Administradora = { id: string; nome: string; cnpj: string };
type PlanoMini = { id: string; nome: string; tipoBem: string };

type Venda = {
  id: string;
  administradoraId: string;
  planoId: string | null;
  status: "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";
  titulo: string;
  descricao: string | null;
  valorCentavos: number | null;
  dataVenda: string | null;
  observacoes: string | null;
  plano: { id: string; nome: string; tipoBem: string } | null;
};

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Erro inesperado.");
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function centavosToValorInput(v: number | null) {
  if (v === null) return "";
  return (v / 100).toFixed(2).replace(".", ",");
}

function parseValorToCentavos(input: string): number | null | undefined {
  const t = input.trim();
  if (!t) return null;
  const normalized = t.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

function dateToInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditarVendaForm() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [planos, setPlanos] = useState<PlanoMini[]>([]);
  const [item, setItem] = useState<Venda | null>(null);

  const [form, setForm] = useState({
    administradoraId: "",
    planoId: "",
    titulo: "",
    status: "RASCUNHO" as Venda["status"],
    valor: "",
    dataVenda: "",
    descricao: "",
    observacoes: "",
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([api<Administradora[]>("/api/administradoras"), api<Venda>(`/api/vendas/${id}`)])
      .then(([adms, venda]) => {
        if (!alive) return;
        setAdministradoras(adms);
        setItem(venda);
        setForm({
          administradoraId: venda.administradoraId ?? "",
          planoId: venda.planoId ?? "",
          titulo: venda.titulo ?? "",
          status: venda.status ?? "RASCUNHO",
          valor: centavosToValorInput(venda.valorCentavos),
          dataVenda: dateToInputValue(venda.dataVenda),
          descricao: venda.descricao ?? "",
          observacoes: venda.observacoes ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."))
      .finally(() => setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!form.administradoraId) {
      setPlanos([]);
      return;
    }
    let alive = true;
    void api<PlanoMini[]>(
      `/api/planos?administradoraId=${encodeURIComponent(form.administradoraId)}`,
    )
      .then((data) => {
        if (!alive) return;
        setPlanos(data);
        setForm((p) => {
          if (!p.planoId) return p;
          const still = data.some((x) => x.id === p.planoId);
          return still ? p : { ...p, planoId: "" };
        });
      })
      .catch(() => {
        if (!alive) return;
        setPlanos([]);
      });
    return () => {
      alive = false;
    };
  }, [form.administradoraId]);

  const payload = useMemo(() => {
    const trimOrNull = (s: string) => {
      const t = s.trim();
      return t ? t : null;
    };

    const valorParsed = parseValorToCentavos(form.valor);
    const valorCentavos =
      typeof valorParsed === "number" ? valorParsed : null;

    return {
      administradoraId: form.administradoraId.trim(),
      planoId: form.planoId.trim() ? form.planoId.trim() : null,
      titulo: form.titulo.trim(),
      status: form.status,
      valorCentavos,
      dataVenda: form.dataVenda ? `${form.dataVenda}T00:00:00.000Z` : null,
      descricao: trimOrNull(form.descricao),
      observacoes: trimOrNull(form.observacoes),
    };
  }, [form]);

  const valorError =
    parseValorToCentavos(form.valor) === undefined ? "Valor inválido." : null;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (valorError) {
      setSaving(false);
      setError(valorError);
      return;
    }

    try {
      await api(`/api/vendas/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push("/vendas");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
        Carregando dados da venda…
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Venda</div>
          <div className="mt-2 text-sm text-zinc-600">{error ?? "Não encontrada."}</div>
        </div>
        <Link className="text-sm font-medium underline" href="/vendas">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-medium text-zinc-500">Vendas</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Editar venda</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Atualize administradora, status, valores e detalhes.
          </p>
        </div>
        <Link
          href="/vendas"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>

      <form
        onSubmit={(e) => void onSave(e)}
        className="rounded-2xl border border-zinc-200 bg-white p-5"
      >
        <div className="text-sm font-medium">Dados da venda</div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-medium text-zinc-600">
              Administradora <span className="text-red-600"> *</span>
            </div>
            <select
              value={form.administradoraId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  administradoraId: e.target.value,
                  planoId: "",
                }))
              }
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            >
              {administradoras.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.cnpj})
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-medium text-zinc-600">Plano (opcional)</div>
            <select
              value={form.planoId}
              onChange={(e) => setForm((p) => ({ ...p, planoId: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
              disabled={!form.administradoraId || planos.length === 0}
            >
              <option value="">Nenhum</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.tipoBem}
                </option>
              ))}
            </select>
            {form.administradoraId && planos.length === 0 ? (
              <div className="mt-2 text-xs text-zinc-500">
                Nenhum plano para esta administradora.
              </div>
            ) : null}
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">
              Título <span className="text-red-600">*</span>
            </div>
            <input
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Status</div>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value as Venda["status"] }))
              }
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADA">Enviada</option>
              <option value="FECHADA">Fechada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Valor (R$)</div>
            <input
              value={form.valor}
              onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
              placeholder="Ex.: 1.234,56"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Data da venda</div>
            <input
              type="date"
              value={form.dataVenda}
              onChange={(e) => setForm((p) => ({ ...p, dataVenda: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
        </div>

        <div className="mt-8 text-sm font-medium">Detalhes</div>
        <div className="mt-3 grid gap-4">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Descrição</div>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Observações</div>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

