import { getPlanoAdministradoraId } from "@/lib/firestore-repo";

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

  const admId = await getPlanoAdministradoraId(trimmed);
  if (!admId) return { ok: false, message: "Plano não encontrado." };
  if (admId !== administradoraId) {
    return {
      ok: false,
      message: "O plano não pertence à administradora selecionada.",
    };
  }
  return { ok: true };
}
