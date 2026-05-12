"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Administradora = { id: string; nome: string; cnpj: string };

type FormState = {
  administradoraId: string;
  nome: string;
  tipoBem: string;
  valorCredito: string;
  regrasComissaoJson: string;
  regrasRecebimentoJson: string;
  regrasEstornoJson: string;
};

const initialState: FormState = {
  administradoraId: "",
  nome: "",
  tipoBem: "",
  valorCredito: "",
  regrasComissaoJson: "",
  regrasRecebimentoJson: "",
  regrasEstornoJson: "",
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-zinc-600">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
      />
    </label>
  );
}

export default function NovoPlanoForm() {
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
    const valorCreditoCentavos = parseValorToCentavos(form.valorCredito);
    return {
      administradoraId: form.administradoraId.trim(),
      nome: form.nome.trim(),
      tipoBem: form.tipoBem.trim(),
      valorCreditoCentavos: valorCreditoCentavos === null ? null : valorCreditoCentavos,
      regrasComissaoJson: trimOrNull(form.regrasComissaoJson),
      regrasRecebimentoJson: trimOrNull(form.regrasRecebimentoJson),
      regrasEstornoJson: trimOrNull(form.regrasEstornoJson),
    };
  }, [form]);

  const valorError =
    payload.valorCreditoCentavos !== null && Number.isNaN(payload.valorCreditoCentavos)
      ? "Valor do crédito inválido."
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
      await api("/api/planos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push("/planos");
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
      <div className="text-sm font-medium">Dados do plano</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <div className="mb-1 text-xs font-medium text-zinc-600">
            Administradora <span className="text-red-600"> *</span>
          </div>
          <select
            value={form.administradoraId}
            onChange={(e) => setForm((p) => ({ ...p, administradoraId: e.target.value }))}
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
              Cadastre uma administradora antes de criar um plano.
            </div>
          ) : null}
        </label>

        <Field
          label="Nome do plano"
          required
          value={form.nome}
          onChange={(v) => setForm((p) => ({ ...p, nome: v }))}
          placeholder="Ex.: Consórcio Imóvel 120x"
        />
        <Field
          label="Tipo de bem"
          required
          value={form.tipoBem}
          onChange={(v) => setForm((p) => ({ ...p, tipoBem: v }))}
          placeholder="Ex.: Imóvel, Veículo, Serviço"
        />
        <Field
          label="Valor do crédito (R$)"
          value={form.valorCredito}
          onChange={(v) => setForm((p) => ({ ...p, valorCredito: v }))}
          placeholder="Ex.: 150.000,00"
        />
      </div>

      <div className="mt-8 text-sm font-medium">Regras (JSON)</div>
      <p className="mt-2 text-xs text-zinc-500">
        Por enquanto use JSON livre; depois viramos em campos e validações específicas.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-1">
        <label className="block">
          <div className="mb-1 text-xs font-medium text-zinc-600">Comissão</div>
          <textarea
            value={form.regrasComissaoJson}
            onChange={(e) => setForm((p) => ({ ...p, regrasComissaoJson: e.target.value }))}
            placeholder='Ex.: {"percentual": 0.02}'
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
          />
        </label>
        <label className="block">
          <div className="mb-1 text-xs font-medium text-zinc-600">Recebimento</div>
          <textarea
            value={form.regrasRecebimentoJson}
            onChange={(e) =>
              setForm((p) => ({ ...p, regrasRecebimentoJson: e.target.value }))
            }
            placeholder='Ex.: {"parcelas": 12}'
            className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
          />
        </label>
        <label className="block">
          <div className="mb-1 text-xs font-medium text-zinc-600">Estorno</div>
          <textarea
            value={form.regrasEstornoJson}
            onChange={(e) => setForm((p) => ({ ...p, regrasEstornoJson: e.target.value }))}
            placeholder='Ex.: {"prazoDias": 7}'
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
          onClick={() => router.push("/planos")}
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
