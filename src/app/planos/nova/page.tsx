import NovoPlanoForm from "../ui/NovoPlanoForm";

export default function NovoPlanoPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-zinc-500">Planos</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Novo plano</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Vincule o plano a uma administradora e defina tipo de bem, crédito e regras em
          JSON (evoluímos para formulários estruturados depois).
        </p>
      </div>

      <NovoPlanoForm />
    </div>
  );
}
