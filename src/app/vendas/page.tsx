import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import VendasClient from "./ui/VendasClient";

export default function VendasPage() {
  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Vendas" },
        ]}
        title="Vendas"
        description="Cadastre e acompanhe vendas por administradora e plano. Use os filtros para localizar registros."
      />

      <VendasClient />
    </div>
  );
}
