"use client";

import { PageHeader } from "@/components/ui";
import { IconWallet } from "@/components/ui/icons";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { CounterSale } from "@/features/counter/CounterSale";

export default function CounterPage() {
  return (
    <RequirePermission permission="sales.create">
      <PageHeader
        icon={<IconWallet className="h-5 w-5" />}
        title="Guichet"
        description="Vendez au comptoir en especes ou par mobile money. Sans reseau, les ventes en especes sont conservees sur ce poste et synchronisees au retour de la connexion."
      />
      <CounterSale />
    </RequirePermission>
  );
}
