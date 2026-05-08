import { prisma } from "@/lib/prisma";

function toVendaStatus(v: unknown) {
  if (v === "RASCUNHO" || v === "ENVIADA" || v === "FECHADA" || v === "CANCELADA") {
    return v;
  }
  return null;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const venda = await prisma.venda.findUnique({
    where: { id },
    include: {
      administradora: {
        select: { id: true, nome: true, cnpj: true },
      },
    },
  });
  if (!venda) {
    return Response.json({ error: "Venda não encontrada." }, { status: 404 });
  }

  return Response.json(venda);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as Partial<{
    administradoraId: string;
    status: string;
    titulo: string;
    descricao: string | null;
    valorCentavos: number | null;
    dataVenda: string | null;
    observacoes: string | null;
  }>;

  if (body.administradoraId !== undefined && !body.administradoraId.trim()) {
    return Response.json({ error: "Administradora não pode ser vazia." }, { status: 400 });
  }
  if (body.titulo !== undefined && !body.titulo.trim()) {
    return Response.json({ error: "Título não pode ser vazio." }, { status: 400 });
  }
  if (body.status !== undefined && !toVendaStatus(body.status)) {
    return Response.json({ error: "Status inválido." }, { status: 400 });
  }
  if (
    body.valorCentavos !== undefined &&
    body.valorCentavos !== null &&
    (!Number.isFinite(body.valorCentavos) || body.valorCentavos < 0)
  ) {
    return Response.json({ error: "Valor inválido." }, { status: 400 });
  }
  if (body.dataVenda !== undefined && body.dataVenda !== null && body.dataVenda !== "") {
    const d = new Date(body.dataVenda);
    if (Number.isNaN(d.getTime())) {
      return Response.json({ error: "Data inválida." }, { status: 400 });
    }
  }

  const dataVenda =
    body.dataVenda === undefined
      ? undefined
      : body.dataVenda === null || body.dataVenda === ""
        ? null
        : new Date(body.dataVenda);

  try {
    const updated = await prisma.venda.update({
      where: { id },
      data: {
        ...(body.administradoraId !== undefined
          ? { administradoraId: body.administradoraId.trim() }
          : {}),
        ...(body.status !== undefined ? { status: toVendaStatus(body.status)! } : {}),
        ...(body.titulo !== undefined ? { titulo: body.titulo.trim() } : {}),
        ...(body.descricao !== undefined
          ? { descricao: body.descricao?.trim() ? body.descricao.trim() : null }
          : {}),
        ...(body.valorCentavos !== undefined
          ? { valorCentavos: body.valorCentavos === null ? null : Math.trunc(body.valorCentavos) }
          : {}),
        ...(body.dataVenda !== undefined ? { dataVenda } : {}),
        ...(body.observacoes !== undefined
          ? { observacoes: body.observacoes?.trim() ? body.observacoes.trim() : null }
          : {}),
      },
      include: {
        administradora: {
          select: { id: true, nome: true, cnpj: true },
        },
      },
    });
    return Response.json(updated);
  } catch (e) {
    return Response.json({ error: "Não foi possível atualizar a venda." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.venda.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (e) {
    return Response.json({ error: "Não foi possível excluir a venda." }, { status: 400 });
  }
}

