"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AdministradoraMini = {
  id: string;
  nome: string;
  cnpj: string;
};

type Plano = {
  id: string;
  administradoraId: string;
  administradora: AdministradoraMini;
  nome: string;
  tipoBem: string;
  valorCreditoCentavos: number | null;
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

export default function PlanosClient() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Plano[]>([]);
  const [administradoras, setAdministradoras] = useState<Administradora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [administradoraId, setAdministradoraId] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("administradoraId");
    if (fromUrl) setAdministradoraId(fromUrl);
  }, [searchParams]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [adms, planos] = await Promise.all([
        api<Administradora[]>("/api/administradoras"),
        api<Plano[]>("/api/planos"),
      ]);
      setAdministradoras(adms);
      setItems(planos);
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
    return items.filter((p) => {
      if (administradoraId && p.administradoraId !== administradoraId) return false;
      if (!q) return true;
      const hay = `${p.nome} ${p.tipoBem} ${p.administradora?.nome ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, administradoraId]);

  async function onDelete(id: string) {
    if (!confirm("Excluir este plano?")) return;
    try {
      await api<void>(`/api/planos/${id}`, { method: "DELETE" });
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
            placeholder="Buscar por nome, tipo de bem, administradora..."
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
          <Link
            href="/planos/nova"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Novo plano
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void reload()}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr className="border-b border-zinc-200">
              <th className="py-3 pr-4 font-medium">Nome</th>
              <th className="py-3 pr-4 font-medium">Administradora</th>
              <th className="py-3 pr-4 font-medium">Tipo de bem</th>
              <th className="py-3 pr-4 font-medium">Crédito</th>
              <th className="py-3 pr-4 font-medium">Criado em</th>
              <th className="py-3 pr-0 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-zinc-600" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-600" colSpan={6}>
                  {items.length === 0
                    ? "Nenhum plano cadastrado."
                    : "Nenhum resultado para os filtros atuais."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-4 font-medium text-zinc-900">{p.nome}</td>
                  <td className="py-3 pr-4 text-zinc-700">
                    <div className="leading-5">
                      <Link
                        href={`/administradoras/${p.administradoraId}`}
                        className="font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-sm"
                      >
                        {p.administradora?.nome ?? "—"}
                      </Link>
                      <div className="text-xs text-zinc-500">{p.administradora?.cnpj ?? ""}</div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">{p.tipoBem}</td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {formatMoneyPtBrFromCentavos(p.valorCreditoCentavos)}
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/planos/${p.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(p.id)}
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
