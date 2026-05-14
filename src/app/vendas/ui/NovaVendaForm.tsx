"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createVenda,
  listAdministradoras,
  listPlanosMiniByAdministradora,
} from "@/lib/firestore-db";

type Administradora = { id: string; nome: string; cnpj: string };
type PlanoMini = { id: string; nome: string; tipoBem: string };

type FormState = {
  administradoraId: string;
  planoId: string;
  titulo: string;
  status: "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";
  valor: string; // entrada em R$, ex: 1234,56
  dataVenda: string; // yyyy-mm-dd
  descricao: string;
  observacoes: string;
};

const initialState: FormState = {
  administradoraId: "",
  planoId: "",
  titulo: "",
  status: "RASCUNHO",
  valor: "",
  dataVenda: "",
  descricao: "",
  observacoes: "",
};

function parseValorToCentavos(input: string): number | null | undefined {
  const t = input.trim();
  if (!t) return null;

  // Aceita formatos comuns: "1234,56", "1.234,56", "1234.56"
  const normalized = t.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-zinc-600">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </div>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
      />
    </label>
  );
}

export default function NovaVendaForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [planos, setPlanos] = useState<PlanoMini[]>([]);
  const [loadingAdms, setLoadingAdms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingAdms(true);
    listAdministradoras()
      .then((data) => {
        if (!alive) return;
        setAdministradoras(data.map((a) => ({ id: a.id, nome: a.nome, cnpj: a.cnpj })));
        if (!form.administradoraId && data[0]?.id) {
          setForm((p) => ({ ...p, administradoraId: data[0].id }));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."))
      .finally(() => setLoadingAdms(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.administradoraId) {
      setPlanos([]);
      return;
    }
    let alive = true;
    void listPlanosMiniByAdministradora(form.administradoraId)
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (valorError) {
      setError(valorError);
      return;
    }

    setSaving(true);
    try {
      await createVenda({
        administradoraId: payload.administradoraId,
        planoId: payload.planoId,
        titulo: payload.titulo,
        status: payload.status,
        valorCentavos: payload.valorCentavos,
        dataVenda: form.dataVenda ? new Date(`${form.dataVenda}T00:00:00.000Z`) : null,
        descricao: payload.descricao,
        observacoes: payload.observacoes,
      });
      router.push("/vendas");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
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
            disabled={loadingAdms}
          >
            {administradoras.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} ({a.cnpj})
              </option>
            ))}
          </select>
          {administradoras.length === 0 && !loadingAdms ? (
            <div className="mt-2 text-xs text-zinc-500">
              Você precisa cadastrar uma administradora antes.{" "}
              <Link
                href="/administradoras/nova"
                className="font-medium text-zinc-800 underline-offset-2 hover:underline"
              >
                Nova administradora
              </Link>
            </div>
          ) : null}
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
              Nenhum plano para esta administradora.{" "}
              <Link
                href={`/planos/nova?administradoraId=${encodeURIComponent(form.administradoraId)}`}
                className="font-medium text-zinc-800 underline-offset-2 hover:underline"
              >
                Cadastrar plano
              </Link>{" "}
              ou{" "}
              <Link
                href={`/planos?administradoraId=${encodeURIComponent(form.administradoraId)}`}
                className="font-medium text-zinc-800 underline-offset-2 hover:underline"
              >
                ver planos
              </Link>
              .
            </div>
          ) : null}
        </label>

        <Field
          label="Título"
          required
          value={form.titulo}
          onChange={(v) => setForm((p) => ({ ...p, titulo: v }))}
          placeholder="Ex.: Venda consórcio Auto"
        />

        <label className="block">
          <div className="mb-1 text-xs font-medium text-zinc-600">Status</div>
          <select
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FormState["status"] }))}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
          >
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADA">Enviada</option>
            <option value="FECHADA">Fechada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </label>

        <Field
          label="Valor (R$)"
          value={form.valor}
          onChange={(v) => setForm((p) => ({ ...p, valor: v }))}
          placeholder="Ex.: 1.234,56"
        />

        <Field
          label="Data da venda"
          type="date"
          value={form.dataVenda}
          onChange={(v) => setForm((p) => ({ ...p, dataVenda: v }))}
        />
      </div>

      <div className="mt-8 text-sm font-medium">Detalhes</div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <div className="mb-1 text-xs font-medium text-zinc-600">Descrição</div>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
          />
        </label>
        <label className="block md:col-span-2">
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
          type="button"
          onClick={() => router.push("/vendas")}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          disabled={saving || administradoras.length === 0}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

