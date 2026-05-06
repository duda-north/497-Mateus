import { prisma } from "@/lib/prisma";

export async function GET() {
  const administradoras = await prisma.administradora.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(administradoras);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    nome?: string;
    cnpj?: string;
    telefone?: string | null;
    email?: string | null;
    contatoPrincipal?: string | null;
    enderecoLogradouro?: string | null;
    enderecoNumero?: string | null;
    enderecoComplemento?: string | null;
    enderecoBairro?: string | null;
    enderecoCidade?: string | null;
    enderecoUf?: string | null;
    enderecoCep?: string | null;
    regrasOperacionaisJson?: string | null;
  };

  if (!body.nome?.trim()) {
    return Response.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  if (!body.cnpj?.trim()) {
    return Response.json({ error: "CNPJ é obrigatório." }, { status: 400 });
  }

  try {
    const created = await prisma.administradora.create({
      data: {
        nome: body.nome.trim(),
        cnpj: body.cnpj.trim(),
        telefone: body.telefone ?? null,
        email: body.email ?? null,
        contatoPrincipal: body.contatoPrincipal ?? null,
        enderecoLogradouro: body.enderecoLogradouro ?? null,
        enderecoNumero: body.enderecoNumero ?? null,
        enderecoComplemento: body.enderecoComplemento ?? null,
        enderecoBairro: body.enderecoBairro ?? null,
        enderecoCidade: body.enderecoCidade ?? null,
        enderecoUf: body.enderecoUf ?? null,
        enderecoCep: body.enderecoCep ?? null,
        regrasOperacionaisJson: body.regrasOperacionaisJson ?? null,
      },
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Não foi possível cadastrar a administradora." },
      { status: 400 },
    );
  }
}

