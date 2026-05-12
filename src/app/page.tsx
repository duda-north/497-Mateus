import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [nAdministradoras, nPlanos, nVendas, nVendasFechadas] = await Promise.all([
    prisma.administradora.count(),
    prisma.plano.count(),
    prisma.venda.count(),
    prisma.venda.count({ where: { status: "FECHADA" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-medium text-zinc-500">Visão geral operacional</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Indicadores rápidos da base cadastrada e atalhos para os módulos principais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/administradoras"
          className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
        >
          <div className="text-xs font-medium text-zinc-500">Administradoras</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{nAdministradoras}</div>
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
          <div className="mt-2 text-2xl font-semibold tabular-nums">{nPlanos}</div>
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
          <div className="mt-2 text-2xl font-semibold tabular-nums">{nVendas}</div>
          <div className="mt-1 text-sm text-zinc-600">
            Fechadas: <span className="font-medium text-zinc-800">{nVendasFechadas}</span>
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
