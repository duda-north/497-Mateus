import { prisma } from "@/lib/prisma";

function toVendaStatus(v: unknown) {
  if (v === "RASCUNHO" || v === "ENVIADA" || v === "FECHADA" || v === "CANCELADA") {
    return v;
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const administradoraId = url.searchParams.get("administradoraId")?.trim() || null;
  const status = toVendaStatus(url.searchParams.get("status"));

  const vendas = await prisma.venda.findMany({
    where: {
      ...(administradoraId ? { administradoraId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      administradora: {
        select: { id: true, nome: true, cnpj: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(vendas);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    administradoraId?: string;
    status?: string;
    titulo?: string;
    descricao?: string | null;
    valorCentavos?: number | null;
    dataVenda?: string | null;
    observacoes?: string | null;
  };

  const administradoraId = body.administradoraId?.trim();
  if (!administradoraId) {
    return Response.json({ error: "Administradora é obrigatória." }, { status: 400 });
  }

  const titulo = body.titulo?.trim();
  if (!titulo) {
    return Response.json({ error: "Título é obrigatório." }, { status: 400 });
  }

  const status = body.status ? toVendaStatus(body.status) : "RASCUNHO";
  if (!status) {
    return Response.json({ error: "Status inválido." }, { status: 400 });
  }

  const valorCentavos =
    body.valorCentavos === null || body.valorCentavos === undefined
      ? null
      : Number.isFinite(body.valorCentavos) && body.valorCentavos >= 0
        ? Math.trunc(body.valorCentavos)
        : NaN;
  if (Number.isNaN(valorCentavos as number)) {
    return Response.json({ error: "Valor inválido." }, { status: 400 });
  }

  const dataVenda =
    body.dataVenda === null || body.dataVenda === undefined || body.dataVenda === ""
      ? null
      : new Date(body.dataVenda);
  if (dataVenda && Number.isNaN(dataVenda.getTime())) {
    return Response.json({ error: "Data inválida." }, { status: 400 });
  }

  try {
    const created = await prisma.venda.create({
      data: {
        administradoraId,
        status,
        titulo,
        descricao: body.descricao?.trim() ? body.descricao.trim() : null,
        valorCentavos: valorCentavos === null ? null : (valorCentavos as number),
        dataVenda,
        observacoes: body.observacoes?.trim() ? body.observacoes.trim() : null,
      },
      include: {
        administradora: {
          select: { id: true, nome: true, cnpj: true },
        },
      },
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    return Response.json({ error: "Não foi possível cadastrar a venda." }, { status: 400 });
  }
}

