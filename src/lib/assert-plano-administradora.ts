import { prisma } from "@/lib/prisma";

/**
 * Garante que, se `planoId` for informado, o plano exista e pertença à administradora.
 */
export async function assertPlanoBelongsToAdministradora(
  planoId: string | null | undefined,
  administradoraId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (planoId === null || planoId === undefined) return { ok: true };
  const trimmed = typeof planoId === "string" ? planoId.trim() : "";
  if (!trimmed) return { ok: true };

  const plano = await prisma.plano.findUnique({
    where: { id: trimmed },
    select: { administradoraId: true },
  });
  if (!plano) return { ok: false, message: "Plano não encontrado." };
  if (plano.administradoraId !== administradoraId) {
    return {
      ok: false,
      message: "O plano não pertence à administradora selecionada.",
    };
  }
  return { ok: true };
}
