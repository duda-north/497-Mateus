"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getDashboardCounts } from "@/lib/firestore-db";

export function DashboardHome() {
  const [nAdministradoras, setNAdministradoras] = useState(0);
  const [nPlanos, setNPlanos] = useState(0);
  const [nVendas, setNVendas] = useState(0);
  const [nVendasFechadas, setNVendasFechadas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countsError, setCountsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setCountsError(
        "Configure as variáveis NEXT_PUBLIC_FIREBASE_* no Netlify (ou .env.local) e publique as regras do Firestore com autenticação anônima ativa.",
      );
      return;
    }
    let alive = true;
    setLoading(true);
    setCountsError(null);
    void getDashboardCounts()
      .then((c) => {
        if (!alive) return;
        setNAdministradoras(c.nAdministradoras);
        setNPlanos(c.nPlanos);
        setNVendas(c.nVendas);
        setNVendasFechadas(c.nVendasFechadas);
      })
      .catch((e) => {
        if (!alive) return;
        const devDetail = process.env.NODE_ENV === "development" && e instanceof Error ? e.message : null;
        setCountsError(
          devDetail ??
            "Verifique no Firebase: Firestore ativo, login anônimo habilitado (Authentication) e regras que permitam leitura/escrita para usuários autenticados.",
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {countsError ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <strong className="font-medium">Não foi possível carregar os totais do dashboard.</strong>{" "}
          {countsError}
        </div>
      ) : null}
      <PageFlowHeader
        crumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        description="Indicadores da base cadastrada e atalhos para administradoras, planos e vendas."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/administradoras"
          className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <div className="text-xs font-medium text-zinc-500">Administradoras</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {loading ? "…" : nAdministradoras}
          </div>
          <div className="mt-1 text-sm text-zinc-600">Parceiros e regras por administradora.</div>
          <div className="mt-3 text-xs font-medium text-zinc-900 underline-offset-2 hover:underline">
            Abrir cadastro
          </div>
        </Link>

        <Link
          href="/planos"
          className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <div className="text-xs font-medium text-zinc-500">Planos</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{loading ? "…" : nPlanos}</div>
          <div className="mt-1 text-sm text-zinc-600">Produtos vinculados às administradoras.</div>
          <div className="mt-3 text-xs font-medium text-zinc-900 underline-offset-2 hover:underline">
            Abrir cadastro
          </div>
        </Link>

        <Link
          href="/vendas"
          className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <div className="text-xs font-medium text-zinc-500">Vendas</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{loading ? "…" : nVendas}</div>
          <div className="mt-1 text-sm text-zinc-600">
            Fechadas:{" "}
            <span className="font-medium text-zinc-800">
              {loading ? "…" : nVendasFechadas}
            </span>
          </div>
          <div className="mt-3 text-xs font-medium text-zinc-900 underline-offset-2 hover:underline">
            Abrir lista
          </div>
        </Link>

        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5">
          <div className="text-xs font-medium text-zinc-500">Comissões</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-400">—</div>
          <div className="mt-1 text-sm text-zinc-600">
            Próxima etapa: extratos e relatórios a partir dos planos.
          </div>
        </div>
      </div>
    </div>
  );
}
