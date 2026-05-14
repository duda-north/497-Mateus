import { deletePlano, getAdministradora, getPlano, updatePlano } from "@/lib/firestore-repo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const plano = await getPlano(id);
  if (!plano) {
    return Response.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  return Response.json(plano);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as Partial<{
    administradoraId: string;
    nome: string;
    tipoBem: string;
    valorCreditoCentavos: number | null;
    regrasComissaoJson: string | null;
    regrasRecebimentoJson: string | null;
    regrasEstornoJson: string | null;
  }>;

  if (body.administradoraId !== undefined && !body.administradoraId.trim()) {
    return Response.json({ error: "Administradora não pode ser vazia." }, { status: 400 });
  }
  if (body.nome !== undefined && !body.nome.trim()) {
    return Response.json({ error: "Nome não pode ser vazio." }, { status: 400 });
  }
  if (body.tipoBem !== undefined && !body.tipoBem.trim()) {
    return Response.json({ error: "Tipo de bem não pode ser vazio." }, { status: 400 });
  }
  if (
    body.valorCreditoCentavos !== undefined &&
    body.valorCreditoCentavos !== null &&
    (!Number.isFinite(body.valorCreditoCentavos) || body.valorCreditoCentavos < 0)
  ) {
    return Response.json({ error: "Valor do crédito inválido." }, { status: 400 });
  }

  if (body.administradoraId !== undefined) {
    const adm = await getAdministradora(body.administradoraId.trim());
    if (!adm) {
      return Response.json({ error: "Administradora não encontrada." }, { status: 400 });
    }
  }

  try {
    const updated = await updatePlano(id, {
      ...(body.administradoraId !== undefined
        ? { administradoraId: body.administradoraId.trim() }
        : {}),
      ...(body.nome !== undefined ? { nome: body.nome.trim() } : {}),
      ...(body.tipoBem !== undefined ? { tipoBem: body.tipoBem.trim() } : {}),
      ...(body.valorCreditoCentavos !== undefined
        ? {
            valorCreditoCentavos:
              body.valorCreditoCentavos === null
                ? null
                : Math.trunc(body.valorCreditoCentavos),
          }
        : {}),
      ...(body.regrasComissaoJson !== undefined
        ? {
            regrasComissaoJson: body.regrasComissaoJson?.trim()
              ? body.regrasComissaoJson.trim()
              : null,
          }
        : {}),
      ...(body.regrasRecebimentoJson !== undefined
        ? {
            regrasRecebimentoJson: body.regrasRecebimentoJson?.trim()
              ? body.regrasRecebimentoJson.trim()
              : null,
          }
        : {}),
      ...(body.regrasEstornoJson !== undefined
        ? {
            regrasEstornoJson: body.regrasEstornoJson?.trim()
              ? body.regrasEstornoJson.trim()
              : null,
          }
        : {}),
    });
    if (!updated) {
      return Response.json({ error: "Plano não encontrado." }, { status: 404 });
    }
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Não foi possível atualizar o plano." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await deletePlano(id);
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
