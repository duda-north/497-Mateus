import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const administradora = await prisma.administradora.findUnique({ where: { id } });
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

  try {
    const updated = await prisma.administradora.update({
      where: { id },
      data: {
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
        ...(body.enderecoNumero !== undefined
          ? { enderecoNumero: body.enderecoNumero }
          : {}),
        ...(body.enderecoComplemento !== undefined
          ? { enderecoComplemento: body.enderecoComplemento }
          : {}),
        ...(body.enderecoBairro !== undefined
          ? { enderecoBairro: body.enderecoBairro }
          : {}),
        ...(body.enderecoCidade !== undefined
          ? { enderecoCidade: body.enderecoCidade }
          : {}),
        ...(body.enderecoUf !== undefined ? { enderecoUf: body.enderecoUf } : {}),
        ...(body.enderecoCep !== undefined ? { enderecoCep: body.enderecoCep } : {}),
        ...(body.regrasOperacionaisJson !== undefined
          ? { regrasOperacionaisJson: body.regrasOperacionaisJson }
          : {}),
      },
    });
    return Response.json(updated);
  } catch (e) {
    return Response.json(
      { error: "Não foi possível atualizar a administradora." },
      { status: 400 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.administradora.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return Response.json(
      { error: "Não foi possível excluir a administradora." },
      { status: 400 },
    );
  }
}

