import { BottomNav } from "@/components/layout/BottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Coquille du site voyageur : en-tete court, contenu, pied de page.
 *
 * La navigation basse (mobile uniquement) flotte par-dessus le bas de page :
 * le padding du pied de page lui reserve la place pour qu'aucun lien ne se
 * retrouve cache derriere elle.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
