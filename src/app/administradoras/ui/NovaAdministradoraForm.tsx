"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FormState = {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  contatoPrincipal: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoComplemento: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoUf: string;
  enderecoCep: string;
  regrasOperacionaisJson: string;
};

const initialState: FormState = {
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
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Erro inesperado.");
  }
  return (await res.json()) as T;
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

export default function NovaAdministradoraForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await postJson("/api/administradoras", payload);
      router.push("/administradoras");
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
      <div className="text-sm font-medium">Dados cadastrais</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Nome"
          required
          value={form.nome}
          onChange={(v) => setForm((p) => ({ ...p, nome: v }))}
          placeholder="Ex.: Administradora XYZ"
        />
        <Field
          label="CNPJ"
          required
          value={form.cnpj}
          onChange={(v) => setForm((p) => ({ ...p, cnpj: v }))}
          placeholder="00.000.000/0000-00"
        />
        <Field
          label="Telefone"
          value={form.telefone}
          onChange={(v) => setForm((p) => ({ ...p, telefone: v }))}
          placeholder="(00) 00000-0000"
        />
        <Field
          label="E-mail"
          value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
          placeholder="contato@empresa.com"
        />
        <Field
          label="Contato principal"
          value={form.contatoPrincipal}
          onChange={(v) => setForm((p) => ({ ...p, contatoPrincipal: v }))}
          placeholder="Nome do responsável"
        />
      </div>

      <div className="mt-8 text-sm font-medium">Endereço</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Logradouro"
          value={form.enderecoLogradouro}
          onChange={(v) => setForm((p) => ({ ...p, enderecoLogradouro: v }))}
          placeholder="Rua / Av."
        />
        <Field
          label="Número"
          value={form.enderecoNumero}
          onChange={(v) => setForm((p) => ({ ...p, enderecoNumero: v }))}
          placeholder="123"
        />
        <Field
          label="Complemento"
          value={form.enderecoComplemento}
          onChange={(v) => setForm((p) => ({ ...p, enderecoComplemento: v }))}
          placeholder="Sala, Andar..."
        />
        <Field
          label="Bairro"
          value={form.enderecoBairro}
          onChange={(v) => setForm((p) => ({ ...p, enderecoBairro: v }))}
          placeholder="Centro"
        />
        <Field
          label="Cidade"
          value={form.enderecoCidade}
          onChange={(v) => setForm((p) => ({ ...p, enderecoCidade: v }))}
          placeholder="São Paulo"
        />
        <Field
          label="UF"
          value={form.enderecoUf}
          onChange={(v) => setForm((p) => ({ ...p, enderecoUf: v }))}
          placeholder="SP"
        />
        <Field
          label="CEP"
          value={form.enderecoCep}
          onChange={(v) => setForm((p) => ({ ...p, enderecoCep: v }))}
          placeholder="00000-000"
        />
      </div>

      <div className="mt-8 text-sm font-medium">Regras operacionais</div>
      <div className="mt-2 text-xs text-zinc-500">
        Por enquanto é um campo livre (texto/JSON). Depois a gente transforma em
        regras estruturadas.
      </div>
      <textarea
        value={form.regrasOperacionaisJson}
        onChange={(e) =>
          setForm((p) => ({ ...p, regrasOperacionaisJson: e.target.value }))
        }
        placeholder='Ex.: {"comissaoPadrao": 0.02}'
        className="mt-3 min-h-28 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300/60"
      />

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/administradoras")}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

