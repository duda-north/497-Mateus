"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Administradora = { id: string; nome: string; cnpj: string };

type FormState = {
  administradoraId: string;
  titulo: string;
  status: "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";
  valor: string; // entrada em R$, ex: 1234,56
  dataVenda: string; // yyyy-mm-dd
  descricao: string;
  observacoes: string;
};

const initialState: FormState = {
  administradoraId: "",
  titulo: "",
  status: "RASCUNHO",
  valor: "",
  dataVenda: "",
  descricao: "",
  observacoes: "",
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

function parseValorToCentavos(input: string): number | null {
  const t = input.trim();
  if (!t) return null;

  // Aceita formatos comuns: "1234,56", "1.234,56", "1234.56"
  const normalized = t.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return NaN;
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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
      />
    </label>
  );
}

export default function NovaVendaForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [loadingAdms, setLoadingAdms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingAdms(true);
    api<Administradora[]>("/api/administradoras")
      .then((data) => {
        if (!alive) return;
        setAdministradoras(data);
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

  const payload = useMemo(() => {
    const trimOrNull = (s: string) => {
      const t = s.trim();
      return t ? t : null;
    };

    const valorCentavos = parseValorToCentavos(form.valor);

    return {
      administradoraId: form.administradoraId.trim(),
      titulo: form.titulo.trim(),
      status: form.status,
      valorCentavos: valorCentavos === null ? null : valorCentavos,
      dataVenda: form.dataVenda ? `${form.dataVenda}T00:00:00.000Z` : null,
      descricao: trimOrNull(form.descricao),
      observacoes: trimOrNull(form.observacoes),
    };
  }, [form]);

  const valorError =
    payload.valorCentavos !== null && Number.isNaN(payload.valorCentavos)
      ? "Valor inválido."
      : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (valorError) {
      setError(valorError);
      return;
    }

    setSaving(true);
    try {
      await api("/api/vendas", {
        method: "POST",
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
            onChange={(e) => setForm((p) => ({ ...p, administradoraId: e.target.value }))}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
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
              Você precisa cadastrar uma administradora antes.
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
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
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
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-400"
          />
        </label>
        <label className="block md:col-span-2">
          <div className="mb-1 text-xs font-medium text-zinc-600">Observações</div>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-400"
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

