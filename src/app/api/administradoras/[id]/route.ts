import {
  administradoraCnpjEmConflito,
  deleteAdministradora,
  getAdministradora,
  updateAdministradora,
} from "@/lib/firestore-repo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const administradora = await getAdministradora(id);
  if (!administradora) {
    return Response.json({ error: "Administradora não encontrada." }, { status: 404 });
  }
  return Response.json(administradora);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as Partial<{
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
  }>;

  if (body.nome !== undefined && !body.nome.trim()) {
    return Response.json({ error: "Nome não pode ser vazio." }, { status: 400 });
  }
  if (body.cnpj !== undefined && !body.cnpj.trim()) {
    return Response.json({ error: "CNPJ não pode ser vazio." }, { status: 400 });
  }

  if (body.cnpj !== undefined && (await administradoraCnpjEmConflito(body.cnpj.trim(), id))) {
    return Response.json({ error: "CNPJ já cadastrado." }, { status: 400 });
  }

  try {
    const updated = await updateAdministradora(id, {
      ...(body.nome !== undefined ? { nome: body.nome.trim() } : {}),
      ...(body.cnpj !== undefined ? { cnpj: body.cnpj.trim() } : {}),
      ...(body.telefone !== undefined ? { telefone: body.telefone } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.contatoPrincipal !== undefined
        ? { contatoPrincipal: body.contatoPrincipal }
        : {}),
      ...(body.enderecoLogradouro !== undefined
        ? { enderecoLogradouro: body.enderecoLogradouro }
        : {}),
      ...(body.enderecoNumero !== undefined ? { enderecoNumero: body.enderecoNumero } : {}),
      ...(body.enderecoComplemento !== undefined
        ? { enderecoComplemento: body.enderecoComplemento }
        : {}),
      ...(body.enderecoBairro !== undefined ? { enderecoBairro: body.enderecoBairro } : {}),
      ...(body.enderecoCidade !== undefined ? { enderecoCidade: body.enderecoCidade } : {}),
      ...(body.enderecoUf !== undefined ? { enderecoUf: body.enderecoUf } : {}),
      ...(body.enderecoCep !== undefined ? { enderecoCep: body.enderecoCep } : {}),
      ...(body.regrasOperacionaisJson !== undefined
        ? { regrasOperacionaisJson: body.regrasOperacionaisJson }
        : {}),
    });
    if (!updated) {
      return Response.json({ error: "Administradora não encontrada." }, { status: 404 });
    }
    return Response.json(updated);
  } catch {
    return Response.json(
      { error: "Não foi possível atualizar a administradora." },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await deleteAdministradora(id);
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
