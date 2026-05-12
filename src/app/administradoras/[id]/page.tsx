"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Administradora = {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  contatoPrincipal: string | null;
  enderecoLogradouro: string | null;
  enderecoNumero: string | null;
  enderecoComplemento: string | null;
  enderecoBairro: string | null;
  enderecoCidade: string | null;
  enderecoUf: string | null;
  enderecoCep: string | null;
  regrasOperacionaisJson: string | null;
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

export default function EditarAdministradoraPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<Administradora | null>(null);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    contatoPrincipal: "",
    enderecoLogradouro: "",
    enderecoNumero: "",
    enderecoComplemento: "",
    enderecoBairro: "",
    enderecoCidade: "",
    enderecoUf: "",
    enderecoCep: "",
    regrasOperacionaisJson: "",
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api<Administradora>(`/api/administradoras/${id}`)
      .then((data) => {
        if (!alive) return;
        setItem(data);
        setForm({
          nome: data.nome ?? "",
          cnpj: data.cnpj ?? "",
          telefone: data.telefone ?? "",
          email: data.email ?? "",
          contatoPrincipal: data.contatoPrincipal ?? "",
          enderecoLogradouro: data.enderecoLogradouro ?? "",
          enderecoNumero: data.enderecoNumero ?? "",
          enderecoComplemento: data.enderecoComplemento ?? "",
          enderecoBairro: data.enderecoBairro ?? "",
          enderecoCidade: data.enderecoCidade ?? "",
          enderecoUf: data.enderecoUf ?? "",
          enderecoCep: data.enderecoCep ?? "",
          regrasOperacionaisJson: data.regrasOperacionaisJson ?? "",
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
    return {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      telefone: trimOrNull(form.telefone),
      email: trimOrNull(form.email),
      contatoPrincipal: trimOrNull(form.contatoPrincipal),
      enderecoLogradouro: trimOrNull(form.enderecoLogradouro),
      enderecoNumero: trimOrNull(form.enderecoNumero),
      enderecoComplemento: trimOrNull(form.enderecoComplemento),
      enderecoBairro: trimOrNull(form.enderecoBairro),
      enderecoCidade: trimOrNull(form.enderecoCidade),
      enderecoUf: trimOrNull(form.enderecoUf),
      enderecoCep: trimOrNull(form.enderecoCep),
      regrasOperacionaisJson: trimOrNull(form.regrasOperacionaisJson),
    };
  }, [form]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api(`/api/administradoras/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push("/administradoras");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-zinc-600">Carregando...</div>;
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Administradora</div>
          <div className="mt-2 text-sm text-zinc-600">
            {error ?? "Não encontrada."}
          </div>
        </div>
        <Link className="text-sm font-medium underline" href="/administradoras">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-medium text-zinc-500">Administradoras</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Editar administradora
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Atualize dados cadastrais, contato e regras operacionais.
          </p>
        </div>
        <Link
          href="/administradoras"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>

      <form
        onSubmit={(e) => void onSave(e)}
        className="rounded-2xl border border-zinc-200 bg-white p-5"
      >
        <div className="text-sm font-medium">Dados cadastrais</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              CNPJ <span className="text-red-600">*</span>
            </div>
            <input
              value={form.cnpj}
              onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">Telefone</div>
            <input
              value={form.telefone}
              onChange={(e) =>
                setForm((p) => ({ ...p, telefone: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-zinc-600">E-mail</div>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>

          <label className="block md:col-span-2">
            <div className="mb-1 text-xs font-medium text-zinc-600">
              Contato principal
            </div>
            <input
              value={form.contatoPrincipal}
              onChange={(e) =>
                setForm((p) => ({ ...p, contatoPrincipal: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            />
          </label>
        </div>

        <div className="mt-8 text-sm font-medium">Endereço</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(
            [
              ["Logradouro", "enderecoLogradouro"],
              ["Número", "enderecoNumero"],
              ["Complemento", "enderecoComplemento"],
              ["Bairro", "enderecoBairro"],
              ["Cidade", "enderecoCidade"],
              ["UF", "enderecoUf"],
              ["CEP", "enderecoCep"],
            ] as const
          ).map(([label, key]) => (
            <label className="block" key={key}>
              <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
              />
            </label>
          ))}
        </div>

        <div className="mt-8 text-sm font-medium">Regras operacionais</div>
        <textarea
          value={form.regrasOperacionaisJson}
          onChange={(e) =>
            setForm((p) => ({ ...p, regrasOperacionaisJson: e.target.value }))
          }
          className="mt-3 min-h-28 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
        />

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

