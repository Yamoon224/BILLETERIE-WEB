"use client";

import { PageHeader } from "@/components/ui";
import { IconSparkle } from "@/components/ui/icons";
import { PromotionList } from "@/features/admin/PromotionList";

export default function AdminPromotionsPage() {
  return (
    <>
      <PageHeader icon={<IconSparkle className="h-5 w-5" />} title="Offres & Promotions" description="Banniere d'accueil et tuiles « A la une » — activer, suspendre ou creer une offre." />
      <PromotionList />
    </>
  );
}
