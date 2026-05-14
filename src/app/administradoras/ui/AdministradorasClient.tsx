"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Administradora = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  contatoPrincipal: string | null;
  enderecoCidade: string | null;
  enderecoUf: string | null;
  createdAt: string;
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

export default function AdministradorasClient() {
  const [items, setItems] = useState<Administradora[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Administradora[]>("/api/administradoras");
      setItems(data);
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
    if (!q) return items;
    return items.filter((a) => {
      const hay = `${a.nome} ${a.cnpj} ${a.email ?? ""} ${a.telefone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  async function onDelete(id: string) {
    if (!confirm("Excluir administradora?")) return;
    try {
      await api<void>(`/api/administradoras/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm font-medium">Lista</div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, CNPJ, e-mail..."
            className={`${controlClass} sm:w-72`}
          />
          <Link
            href="/administradoras/nova"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nova administradora
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
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr className="border-b border-zinc-200">
              <th className="py-3 pr-4 font-medium">Nome</th>
              <th className="py-3 pr-4 font-medium">CNPJ</th>
              <th className="py-3 pr-4 font-medium">Contato</th>
              <th className="py-3 pr-4 font-medium">Cidade/UF</th>
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
                    ? "Nenhuma administradora cadastrada."
                    : "Nenhum resultado para a busca atual."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-4 font-medium text-zinc-900">{a.nome}</td>
                  <td className="py-3 pr-4 text-zinc-700">{a.cnpj}</td>
                  <td className="py-3 pr-4 text-zinc-700">
                    <div className="leading-5">
                      <div className="text-zinc-800">
                        {a.contatoPrincipal || "—"}
                      </div>
                      <div className="text-xs text-zinc-500">{a.email || "—"}</div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {a.enderecoCidade || "—"}
                    {a.enderecoUf ? `/${a.enderecoUf}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-zinc-700">
                    {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 pr-0 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/planos?administradoraId=${encodeURIComponent(a.id)}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Planos
                      </Link>
                      <Link
                        href={`/administradoras/${a.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(a.id)}
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

