"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdministradoraMini = {
  id: string;
  nome: string;
  cnpj: string;
};

type Venda = {
  id: string;
  administradoraId: string;
  administradora: AdministradoraMini;
  plano: { id: string; nome: string; tipoBem: string } | null;
  status: "RASCUNHO" | "ENVIADA" | "FECHADA" | "CANCELADA";
  titulo: string;
  descricao: string | null;
  valorCentavos: number | null;
  dataVenda: string | null;
  createdAt: string;
};

type Administradora = {
  id: string;
  nome: string;
  cnpj: string;
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

const controlClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60";

function formatMoneyPtBrFromCentavos(v: number | null) {
  if (v === null) return "—";
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatusBadge({ status }: { status: Venda["status"] }) {
  const style =
    status === "FECHADA"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "CANCELADA"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "ENVIADA"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-700";

  const label =
    status === "RASCUNHO"
      ? "Rascunho"
      : status === "ENVIADA"
        ? "Enviada"
        : status === "FECHADA"
          ? "Fechada"
          : "Cancelada";

  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-full border px-2 text-xs font-medium",
        style,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function VendasClient() {
  const [items, setItems] = useState<Venda[]>([]);
  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | Venda["status"]>("");
  const [administradoraId, setAdministradoraId] = useState("");

  async function reload() {
    setLoading(true);
    setError(null);

    try {
      const [adms, vendas] = await Promise.all([
        api<Administradora[]>("/api/administradoras"),
        api<Venda[]>("/api/vendas"),
      ]);
      setAdministradoras(adms);
      setItems(vendas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      if (status && v.status !== status) return false;
      if (administradoraId && v.administradoraId !== administradoraId) return false;
      if (!q) return true;
      const hay = `${v.titulo} ${v.administradora?.nome ?? ""} ${v.plano?.nome ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, status, administradoraId]);

  async function onDelete(id: string) {
    if (!confirm("Excluir venda?")) return;
    try {
      await api<void>(`/api/vendas/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="text-sm font-medium">Lista</div>

        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou administradora..."
            className={`${controlClass} lg:w-72`}
          />

          <select
            value={administradoraId}
            onChange={(e) => setAdministradoraId(e.target.value)}
            className={`${controlClass} lg:w-64`}
          >
            <option value="">Todas administradoras</option>
            {administradoras.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={`${controlClass} lg:w-44`}
          >
            <option value="">Todos status</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADA">Enviada</option>
            <option value="FECHADA">Fechada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <Link
            href="/vendas/nova"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova venda
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr className="border-b border-zinc-200">
              <th className="py-3 pr-4 font-medium">Título</th>
              <th className="py-3 pr-4 font-medium">Administradora</th>
              <th className="py-3 pr-4 font-medium">Plano</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Valor</th>
              <th className="py-3 pr-4 font-medium">Data da venda</th>
              <th className="py-3 pr-4 font-medium">Criado em</th>
              <th className="py-3 pr-0 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-zinc-600" colSpan={8}>
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-600" colSpan={8}>
                  {items.length === 0
                    ? "Nenhuma venda cadastrada."
                    : "Nenhum resultado para os filtros atuais."}
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-4 font-medium text-zinc-900">{v.titulo}</td>
                  <td className="py-3 pr-4 text-zinc-700">
                    <div className="leading-5">
                      <Link
                        href={`/administradoras/${v.administradoraId}`}
                        className="font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-sm"
                      >
                        {v.administradora?.nome ?? "—"}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        {v.administradora?.cnpj ?? ""}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    <div className="leading-5">
                      {v.plano ? (
                        <Link
                          href={`/planos/${v.plano.id}`}
                          className="font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-sm"
                        >
                          {v.plano.nome}
                        </Link>
                      ) : (
                        <div className="text-zinc-800">—</div>
                      )}
                      {v.plano?.tipoBem ? (
                        <div className="text-xs text-zinc-500">{v.plano.tipoBem}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {formatMoneyPtBrFromCentavos(v.valorCentavos)}
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {v.dataVenda ? new Date(v.dataVenda).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/vendas/${v.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(v.id)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

