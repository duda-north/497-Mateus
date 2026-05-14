import { assertPlanoBelongsToAdministradora } from "@/lib/assert-plano-administradora";
import {
  deleteVenda,
  getAdministradora,
  getVenda,
  updateVenda,
  type VendaStatus,
} from "@/lib/firestore-repo";

function toVendaStatus(v: unknown): VendaStatus | null {
  if (v === "RASCUNHO" || v === "ENVIADA" || v === "FECHADA" || v === "CANCELADA") {
    return v;
  }
  return null;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const venda = await getVenda(id);
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
    planoId: string | null;
  }>;

  const existing = await getVenda(id);
  if (!existing) {
    return Response.json({ error: "Venda não encontrada." }, { status: 404 });
  }

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

  const nextAdministradoraId =
    body.administradoraId !== undefined ? body.administradoraId.trim() : existing.administradoraId;

  if (body.administradoraId !== undefined) {
    const adm = await getAdministradora(nextAdministradoraId);
    if (!adm) {
      return Response.json({ error: "Administradora não encontrada." }, { status: 400 });
    }
  }

  const finalPlanoId =
    body.planoId !== undefined
      ? body.planoId === null || body.planoId === ""
        ? null
        : body.planoId.trim()
      : existing.planoId;

  const planoCheck = await assertPlanoBelongsToAdministradora(
    finalPlanoId,
    nextAdministradoraId,
  );
  if (!planoCheck.ok) {
    return Response.json({ error: planoCheck.message }, { status: 400 });
  }

  const dataVenda =
    body.dataVenda === undefined
      ? undefined
      : body.dataVenda === null || body.dataVenda === ""
        ? null
        : new Date(body.dataVenda);

  try {
    const updated = await updateVenda(id, {
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
      ...(body.planoId !== undefined ? { planoId: finalPlanoId } : {}),
    });
    if (!updated) {
      return Response.json({ error: "Venda não encontrada." }, { status: 404 });
    }
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Não foi possível atualizar a venda." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteVenda(id);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Não foi possível excluir a venda." }, { status: 400 });
  }
}
