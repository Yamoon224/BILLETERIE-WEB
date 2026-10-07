"use client";

import { PageHeader } from "@kaara/shared/components/ui";
import { IconDashboard } from "@kaara/shared/components/ui/icons";
import { DashboardOverview } from "@kaara/shared/features/dashboard/DashboardOverview";

/** Le suivi d'activite detaille, tel que le voit une compagnie - ici toutes compagnies confondues. */
export default function ActivityPage() {
  return (
    <>
      <PageHeader
        icon={<IconDashboard className="h-5 w-5" />}
        title="Activite de la plateforme"
        description="Ventes, recettes par moyen de paiement, taux de remplissage des departs, et exports."
      />
      <DashboardOverview />
    </>
  );
}
