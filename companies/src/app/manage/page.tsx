"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconDashboard } from "@kaara/shared/components/ui/icons";
import { useAuth } from "@kaara/shared/features/auth/AuthContext";
import { RequirePermission } from "@kaara/shared/features/auth/RequirePermission";
import { DashboardOverview } from "@kaara/shared/features/dashboard/DashboardOverview";

/** Accueil de la gestion avancee : le suivi d'activite de la compagnie. */
export default function ManageHomePage() {
  const { user } = useAuth();

  return (
    <RequirePermission permission="reports.view">
      <PageHeader
        icon={<IconDashboard className="h-5 w-5" />}
        title={user?.company ? `Activite · ${user.company.name}` : "Activite"}
        description="Ventes, recettes par moyen de paiement, taux de remplissage des departs, et exports."
      />
      <DashboardOverview />
    </RequirePermission>
  );
}
