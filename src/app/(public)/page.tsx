import { Card, CardBody } from "@/components/ui";
import { IconArrowRight, IconCard, IconClock, IconMapPin, IconQrCode, IconWifiOff } from "@/components/ui/icons";
import { formatDuration, formatMoney } from "@/lib/format";
import { HeroCurves } from "@/features/home/HeroCurves";
import { PillarTabs } from "@/features/home/PillarTabs";
import type { Pillar } from "@/features/home/PillarTabs";
import { PopularApartments } from "@/features/home/PopularApartments";
import { PopularRentalVehicles } from "@/features/home/PopularRentalVehicles";
import { ApartmentSearchForm } from "@/features/search/ApartmentSearchForm";
import { RentalVehicleSearchForm } from "@/features/search/RentalVehicleSearchForm";
import { TripSearchForm } from "@/features/search/TripSearchForm";

const LISTING_TITLE_BY_PILLAR: Record<Pillar, { title: string; subtitle?: string }> = {
  bus: { title: "Destinations populaires" },
  appartements: { title: "Les appartements", subtitle: "Quartiers prises : Assinie, Grand-Bassam, Jacqueville" },
  "location-auto": { title: "Vehicules sollicites" },
};

const PROMISES = [
  {
    icon: <IconCard className="h-6 w-6" />,
    title: "Paiement Wave, Orange & MTN Money",
  },
  {
    icon: <IconWifiOff className="h-6 w-6" />,
    title: "Fonctionne en 2G / 3G",
  },
  {
    icon: <IconQrCode className="h-6 w-6" />,
    title: "Billet QR, sans impression",
  },
];

const SPOTLIGHT_CARDS = [
  {
    badge: "Kaara",
    text: "Ligne Bonoua–Treichville : nouveaux départs 6h & 17h",
    gradient: "linear-gradient(150deg,#1cbbe8 0%,#00b4e6 55%,#0089b3 100%)",
  },
  {
    badge: "Publicité",
    text: "Studio meublé à Assinie dès 15 000 FCFA/nuit",
    gradient: "linear-gradient(150deg,#e6007e 0%,#b3005f 100%)",
  },
];

const DESTINATIONS = [
  {
    city: "Bouake",
    from: "Abidjan",
    price: 6000,
    durationMinutes: 240,
    gradient: "linear-gradient(150deg,#1cbbe8 0%,#00b4e6 55%,#036d8f 100%)",
  },
  {
    city: "Yamoussoukro",
    from: "Abidjan",
    price: 4500,
    durationMinutes: 165,
    gradient: "linear-gradient(150deg,#3a2f27 0%,#211a15 100%)",
  },
  {
    city: "San-Pedro",
    from: "Abidjan",
    price: 7500,
    durationMinutes: 330,
    gradient: "linear-gradient(150deg,#0089b3 0%,#0a5570 100%)",
  },
  {
    city: "Korhogo",
    from: "Abidjan",
    price: 9500,
    durationMinutes: 420,
    gradient: "linear-gradient(150deg,#57493c 0%,#241d17 100%)",
  },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pillarFrom(value: string | undefined): Pillar {
  return value === "appartements" || value === "location-auto" ? value : "bus";
}

/**
 * Accueil Kaara : trois piliers (Bus, Appartements, Location auto) en tabs.
 *
 * L'onglet actif vient de l'URL (`?onglet=...`), pas d'un etat client : la
 * recherche et les sections de decouverte s'adaptent toutes au meme
 * parametre, servi cote serveur.
 */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const activeTab = pillarFrom(first(params.onglet));

  const listing = LISTING_TITLE_BY_PILLAR[activeTab];

  return (
    <>
      <section className="relative overflow-hidden">
        <HeroCurves />
        <div className="relative mx-auto max-w-6xl px-4 pb-2 pt-6 sm:px-6 sm:pt-8">
          <div className="mb-3 rounded-2xl bg-brand-400 px-4 py-3 text-sm font-bold text-white shadow-sm">
            🔥 -20&nbsp;% sur votre 1er trajet reserve en ligne
          </div>

          <div className="mb-5 flex flex-col gap-2">
            <span className="rounded-2xl border border-fuchsia/25 bg-fuchsia/15 px-4 py-3 text-sm font-bold text-fuchsia-dark dark:text-fuchsia">
              🛡️ 100&nbsp;% ivoirien
            </span>
            <span className="rounded-2xl border border-fuchsia/25 bg-fuchsia/15 px-4 py-3 text-sm font-bold text-fuchsia-dark dark:text-fuchsia">
              🚌 Ligne pilote active
            </span>
          </div>

          <PillarTabs active={activeTab} />

          <div className="mt-4 sm:mt-5">
            {activeTab === "bus" ? <TripSearchForm layout="stacked" /> : null}
            {activeTab === "appartements" ? (
              <Card>
                <CardBody className="p-4 sm:p-6">
                  <ApartmentSearchForm layout="stacked" />
                </CardBody>
              </Card>
            ) : null}
            {activeTab === "location-auto" ? (
              <Card>
                <CardBody className="p-4 sm:p-6">
                  <RentalVehicleSearchForm layout="stacked" />
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      </section>

      {/* Video demo : aucun son, aucune donnee a charger en 2G - juste une
          promesse visuelle du parcours de reservation avant le bandeau
          d'arguments forts. */}
      <section className="mx-auto max-w-6xl px-4 pb-2 sm:px-6">
        <div className="flex aspect-video items-center justify-center rounded-sm bg-gradient-to-br from-[#0e1a3a] to-stone-900 shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <p className="mt-2.5 text-center text-xs font-semibold text-[var(--muted)]">
          Comment ça marche - en 15 secondes, sans son
        </p>
      </section>

      {/* Arguments forts : bandeau clair, trois colonnes centrees - le
          dernier rappel avant que le voyageur ne lance sa recherche. */}
      <section className="mt-6 bg-[var(--surface-muted)] py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 sm:px-6">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="flex flex-col items-center gap-2 text-center">
              <span className="text-fuchsia">{promise.icon}</span>
              <span className="text-xs font-semibold leading-snug text-[var(--foreground)] sm:text-sm">{promise.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* A la une : espace promo Kaara + un premier emplacement publicitaire
          pour les piliers pas encore reservables en ligne (Appartements,
          Location auto) - contenu fixe pour l'instant, pas de vraie regie. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight">À la une cette semaine</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Espace publicitaire - Appartements &amp; Location auto (aperçu, réservation à venir)
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SPOTLIGHT_CARDS.map((card) => (
            <div
              key={card.text}
              className="flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-card"
              style={{ backgroundImage: card.gradient }}
            >
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">{card.badge}</span>
              <p className="text-base font-extrabold leading-snug text-white">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decouverte : adaptative par pilier (destinations, appartements,
          vehicules). Cartes visuelles, legeres (degrade, pas de photo a
          telecharger) pour rester rapide en 2G/3G. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight">{listing.title}</h2>
        {listing.subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{listing.subtitle}</p> : null}
        <span aria-hidden="true" className="grad-brand mt-3 block h-[3px] w-12 rounded-full" />

        <div className="mt-5">
          {activeTab === "bus" ? (
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
              {DESTINATIONS.map((destination) => (
                <div
                  key={destination.city}
                  className="relative w-[15rem] shrink-0 overflow-hidden rounded-2xl shadow-card sm:w-auto"
                  style={{ backgroundImage: destination.gradient }}
                >
                  <div className="flex h-36 flex-col justify-between p-4 text-white">
                    <span className="inline-flex items-center gap-1 self-start rounded-sm bg-black/20 px-2 py-1 text-[11px] font-semibold">
                      <IconMapPin className="h-3 w-3" />
                      {destination.from} <IconArrowRight className="h-3 w-3" /> {destination.city}
                    </span>
                    <div>
                      <p className="text-base font-extrabold">A partir de {formatMoney(destination.price)}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
                        <IconClock className="h-3.5 w-3.5" />
                        {formatDuration(destination.durationMinutes)} de trajet
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "appartements" ? <PopularApartments /> : null}
          {activeTab === "location-auto" ? <PopularRentalVehicles /> : null}
        </div>
      </section>
    </>
  );
}
