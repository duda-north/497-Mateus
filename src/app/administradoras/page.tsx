import AdministradorasClient from "./ui/AdministradorasClient";

export default function AdministradorasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-medium text-zinc-500">
            Base operacional
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Administradoras
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Cadastre administradoras parceiras com dados cadastrais e regras
            específicas por parceiro.
          </p>
        </div>
      </div>

      <AdministradorasClient />
    </div>
  );
}

