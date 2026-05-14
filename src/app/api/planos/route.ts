import { createPlano, getAdministradora, listPlanos } from "@/lib/firestore-repo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const administradoraId = url.searchParams.get("administradoraId")?.trim() || null;

  const planos = await listPlanos(administradoraId);
  return Response.json(planos);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    administradoraId?: string;
    nome?: string;
    tipoBem?: string;
    valorCreditoCentavos?: number | null;
    regrasComissaoJson?: string | null;
    regrasRecebimentoJson?: string | null;
    regrasEstornoJson?: string | null;
  };

  const administradoraId = body.administradoraId?.trim();
  if (!administradoraId) {
    return Response.json({ error: "Administradora é obrigatória." }, { status: 400 });
  }

  const adm = await getAdministradora(administradoraId);
  if (!adm) {
    return Response.json({ error: "Administradora não encontrada." }, { status: 400 });
  }

  const nome = body.nome?.trim();
  if (!nome) {
    return Response.json({ error: "Nome do plano é obrigatório." }, { status: 400 });
  }

  const tipoBem = body.tipoBem?.trim();
  if (!tipoBem) {
    return Response.json({ error: "Tipo de bem é obrigatório." }, { status: 400 });
  }

  const valorCreditoCentavos =
    body.valorCreditoCentavos === null || body.valorCreditoCentavos === undefined
      ? null
      : Number.isFinite(body.valorCreditoCentavos) && body.valorCreditoCentavos >= 0
        ? Math.trunc(body.valorCreditoCentavos)
        : NaN;
  if (Number.isNaN(valorCreditoCentavos as number)) {
    return Response.json({ error: "Valor do crédito inválido." }, { status: 400 });
  }

  try {
    const created = await createPlano({
      administradoraId,
      nome,
      tipoBem,
      valorCreditoCentavos:
        valorCreditoCentavos === null ? null : (valorCreditoCentavos as number),
      regrasComissaoJson: body.regrasComissaoJson?.trim()
        ? body.regrasComissaoJson.trim()
        : null,
      regrasRecebimentoJson: body.regrasRecebimentoJson?.trim()
        ? body.regrasRecebimentoJson.trim()
        : null,
      regrasEstornoJson: body.regrasEstornoJson?.trim() ? body.regrasEstornoJson.trim() : null,
    });
    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Não foi possível cadastrar o plano." }, { status: 400 });
  }
}
