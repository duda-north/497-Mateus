import NovaVendaForm from "../ui/NovaVendaForm";

export default function NovaVendaPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-zinc-500">Vendas</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nova venda</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Cadastre uma venda vinculada a uma administradora.
        </p>
      </div>

      <NovaVendaForm />
    </div>
  );
}

