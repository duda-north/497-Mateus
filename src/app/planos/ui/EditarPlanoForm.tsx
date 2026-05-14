"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backLinkClass } from "@/components/page-flow/button-classes";
import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import { getPlano, listAdministradoras, updatePlano } from "@/lib/firestore-db";

type Administradora = { id: string; nome: string; cnpj: string };

type Plano = {
  id: string;
  administradoraId: string;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
  regrasComissaoJson: string | null;
  regrasRecebimentoJson: string | null;
  regrasEstornoJson: string | null;
};

function centavosToValorInput(v: number | null) {
  if (v === null) return "";
  return (v / 100).toFixed(2).replace(".", ",");
}

function parseValorToCentavos(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  const normalized = t.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

export default function EditarPlanoForm() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [item, setItem] = useState<Plano | null>(null);

  const [form, setForm] = useState({
    administradoraId: "",
    nome: "",
    tipoBem: "",
    valorCredito: "",
    regrasComissaoJson: "",
    regrasRecebimentoJson: "",
    regrasEstornoJson: "",
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.all([listAdministradoras(), getPlano(id)])
      .then(([adms, plano]) => {
        if (!alive) return;
        setAdministradoras(adms.map((a) => ({ id: a.id, nome: a.nome, cnpj: a.cnpj })));
        if (!plano) {
          setError("Plano não encontrado.");
          setItem(null);
          return;
        }
        setItem(plano);
        setForm({
          administradoraId: plano.administradoraId ?? "",
          nome: plano.nome ?? "",
          tipoBem: plano.tipoBem ?? "",
          valorCredito: centavosToValorInput(plano.valorCreditoCentavos),
          regrasComissaoJson: plano.regrasComissaoJson ?? "",
          regrasRecebimentoJson: plano.regrasRecebimentoJson ?? "",
          regrasEstornoJson: plano.regrasEstornoJson ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar."))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

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
      await updatePlano(id, {
        administradoraId: payload.administradoraId,
        nome: payload.nome,
        tipoBem: payload.tipoBem,
        valorCreditoCentavos:
          payload.valorCreditoCentavos !== null && Number.isNaN(payload.valorCreditoCentavos)
            ? null
            : payload.valorCreditoCentavos,
        regrasComissaoJson: payload.regrasComissaoJson,
        regrasRecebimentoJson: payload.regrasRecebimentoJson,
        regrasEstornoJson: payload.regrasEstornoJson,
      });
      router.push("/planos");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageFlowHeader
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Planos", href: "/planos" },
            { label: "…" },
          ]}
          title="Carregando plano…"
        />
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
          Aguarde enquanto buscamos os dados.
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <PageFlowHeader
          crumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Planos", href: "/planos" },
            { label: "Erro" },
          ]}
          title="Plano não encontrado"
          description={error ?? "Não foi possível carregar este registro."}
          actions={
            <Link href="/planos" className={backLinkClass()}>
              Voltar à lista
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Planos", href: "/planos" },
          { label: "Editar" },
        ]}
        title={item.nome}
        description="Ajuste administradora, dados do plano e regras em JSON."
        actions={
          <Link href="/planos" className={backLinkClass()}>
            Voltar à lista
          </Link>
        }
      />

      <form
        onSubmit={(e) => void onSave(e)}
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
            >
              {administradoras.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.cnpj})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">
              Nome <span className="text-red-600">*</span>
            </div>
            <input
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">
              Tipo de bem <span className="text-red-600">*</span>
            </div>
            <input
              value={form.tipoBem}
              onChange={(e) => setForm((p) => ({ ...p, tipoBem: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-medium text-zinc-600">Valor do crédito (R$)</div>
            <input
              value={form.valorCredito}
              onChange={(e) => setForm((p) => ({ ...p, valorCredito: e.target.value }))}
              placeholder="Ex.: 150.000,00"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
        </div>

        <div className="mt-8 text-sm font-medium">Regras (JSON)</div>
        <div className="mt-4 grid gap-4">
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Comissão</div>
            <textarea
              value={form.regrasComissaoJson}
              onChange={(e) =>
                setForm((p) => ({ ...p, regrasComissaoJson: e.target.value }))
              }
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
              className="min-h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Estorno</div>
            <textarea
              value={form.regrasEstornoJson}
              onChange={(e) =>
                setForm((p) => ({ ...p, regrasEstornoJson: e.target.value }))
              }
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
