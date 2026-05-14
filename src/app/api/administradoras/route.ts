import {
  administradoraCnpjEmConflito,
  createAdministradora,
  listAdministradoras,
} from "@/lib/firestore-repo";

export async function GET() {
  try {
    const administradoras = await listAdministradoras();
    return Response.json(administradoras);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao listar administradoras.";
    const status =
      message.includes("FIREBASE_SERVICE_ACCOUNT_JSON") || message.includes("JSON válido")
        ? 503
        : 502;
    return Response.json({ error: message }, { status });
  }
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Corpo da requisição JSON inválido." }, { status: 400 });
  }

  const nome = typeof body.nome === "string" ? body.nome : "";
  const cnpj = typeof body.cnpj === "string" ? body.cnpj : "";

  if (!nome.trim()) {
    return Response.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  if (!cnpj.trim()) {
    return Response.json({ error: "CNPJ é obrigatório." }, { status: 400 });
  }

  try {
    if (await administradoraCnpjEmConflito(cnpj.trim())) {
      return Response.json({ error: "CNPJ já cadastrado." }, { status: 400 });
    }

    const created = await createAdministradora({
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      telefone: strOrNull(body.telefone),
      email: strOrNull(body.email),
      contatoPrincipal: strOrNull(body.contatoPrincipal),
      enderecoLogradouro: strOrNull(body.enderecoLogradouro),
      enderecoNumero: strOrNull(body.enderecoNumero),
      enderecoComplemento: strOrNull(body.enderecoComplemento),
      enderecoBairro: strOrNull(body.enderecoBairro),
      enderecoCidade: strOrNull(body.enderecoCidade),
      enderecoUf: strOrNull(body.enderecoUf),
      enderecoCep: strOrNull(body.enderecoCep),
      regrasOperacionaisJson: strOrNull(body.regrasOperacionaisJson),
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Não foi possível cadastrar a administradora.";
    const status =
      message.includes("FIREBASE_SERVICE_ACCOUNT_JSON") || message.includes("JSON válido")
        ? 503
        : 502;
    return Response.json({ error: message }, { status });
  }
}
