import NovaAdministradoraForm from "../ui/NovaAdministradoraForm";

export default function NovaAdministradoraPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-zinc-500">Administradoras</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Nova administradora
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Cadastre uma nova administradora parceira com dados cadastrais e
          informações de contato.
        </p>
      </div>

      <NovaAdministradoraForm />
    </div>
  );
}

