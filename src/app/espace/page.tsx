"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { IconDashboard } from "@/components/ui/icons";
import { homeFor, useAuth } from "@/features/auth/AuthContext";
import { DashboardOverview } from "@/features/dashboard/DashboardOverview";

/**
 * Accueil de l'espace. Sans acces au suivi d'activite — un agent de guichet —,
 * on renvoie vers l'ecran de travail du profil plutot que d'afficher un refus.
 */
export default function SpaceHomePage() {
  const { user, can } = useAuth();
  const router = useRouter();
  const allowed = can("reports.view");

  useEffect(() => {
    if (user && !allowed) router.replace(homeFor(user));
  }, [user, allowed, router]);

  if (!allowed) return null;

  return (
    <>
      <PageHeader
        icon={<IconDashboard className="h-5 w-5" />}
        title={user?.company ? `Activite · ${user.company.name}` : "Activite de la plateforme"}
        description="Ventes, recettes par moyen de paiement, taux de remplissage des departs, et exports."
      />
      <DashboardOverview />
    </>
  );
}
