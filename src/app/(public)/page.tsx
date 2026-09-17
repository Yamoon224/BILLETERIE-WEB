import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui";
import {
  IconArrowRight,
  IconCard,
  IconClock,
  IconMapPin,
  IconPhone,
  IconQrCode,
  IconTicket,
  IconWifiOff,
} from "@/components/ui/icons";
import { formatDuration, formatMoney } from "@/lib/format";
import { HeroCurves } from "@/features/home/HeroCurves";
import { PillarTabs } from "@/features/home/PillarTabs";
import type { Pillar } from "@/features/home/PillarTabs";
import { PopularApartments } from "@/features/home/PopularApartments";
import { PopularRentalVehicles } from "@/features/home/PopularRentalVehicles";
import { ApartmentSearchForm } from "@/features/search/ApartmentSearchForm";
import { RentalVehicleSearchForm } from "@/features/search/RentalVehicleSearchForm";
import { TripSearchForm } from "@/features/search/TripSearchForm";

interface Step {
  icon: ReactNode;
  title: string;
  text: string;
}

const STEPS_BY_PILLAR: Record<Pillar, Step[]> = {
  bus: [
    {
      icon: <IconTicket className="h-5 w-5" />,
      title: "Choisissez votre place",
      text: "Comparez les horaires et reservez le siege qui vous convient.",
    },
    {
      icon: <IconPhone className="h-5 w-5" />,
      title: "Payez par mobile money",
      text: "Orange Money, MTN MoMo, Moov Money ou Wave, depuis votre telephone.",
    },
    {
      icon: <IconQrCode className="h-5 w-5" />,
      title: "Recevez votre billet",
      text: "Le QR code arrive par SMS, meme sans connexion a l'embarquement.",
    },
  ],
  appartements: [
    {
      icon: <IconTicket className="h-5 w-5" />,
      title: "Choisissez votre logement",
      text: "Comparez les appartements meubles selon la ville, les dates et le budget.",
    },
    {
      icon: <IconPhone className="h-5 w-5" />,
      title: "Contactez le partenaire",
      text: "Le telephone et le WhatsApp de l'agence ou du proprietaire vous sont communiques.",
    },
    {
      icon: <IconQrCode className="h-5 w-5" />,
      title: "Confirmez votre sejour",
      text: "Reservation en ligne bientot disponible : la confirmation se fait pour l'instant directement avec le partenaire.",
    },
  ],
  "location-auto": [
    {
      icon: <IconTicket className="h-5 w-5" />,
      title: "Choisissez votre vehicule",
      text: "Comparez les modeles disponibles selon la ville et les dates de location.",
    },
    {
      icon: <IconPhone className="h-5 w-5" />,
      title: "Contactez l'agence",
      text: "Le telephone et le WhatsApp du loueur vous sont communiques pour organiser la prise en charge.",
    },
    {
      icon: <IconQrCode className="h-5 w-5" />,
      title: "Recuperez votre vehicule",
      text: "Reservation en ligne bientot disponible : la remise des cles se fait pour l'instant directement avec l'agence.",
    },
  ],
};

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

const PAYMENT_METHODS = [
  { label: "Orange Money", src: "/payments/orange-money.jpg", width: 447, height: 447 },
  { label: "MTN MoMo", src: "/payments/mtn-momo.jpg", width: 416, height: 203 },
  { label: "Moov Money", src: "/payments/moov-money.png", width: 447, height: 447 },
  { label: "Wave", src: "/payments/wave.jpg", width: 597, height: 335 },
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
 * recherche, le "comment ca marche" et les sections de decouverte s'adaptent
 * tous au meme parametre, servi cote serveur.
 */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const activeTab = pillarFrom(first(params.onglet));

  const steps = STEPS_BY_PILLAR[activeTab];
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

      {/* Video demo : aucun son, aucune donnee a charger en 2G — juste une
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
          Comment ça marche — en 15 secondes, sans son
        </p>
      </section>

      {/* Arguments forts : bandeau clair, trois colonnes centrees — le
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

      {/* Comment ca marche : adaptatif par pilier. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight">Comment ca marche</h2>
        <span aria-hidden="true" className="grad-brand mt-3 block h-[3px] w-12 rounded-full" />

        <Card className="mt-5">
          <ol>
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={index > 0 ? "flex items-center gap-3.5 border-t border-[var(--hairline)] p-4" : "flex items-center gap-3.5 p-4"}
              >
                <span className="grad-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-white shadow-card">
                  {step.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    <span className="mr-1.5 text-brand-500">0{index + 1}.</span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-5">
          <p className="text-center text-xs font-semibold text-[var(--muted)]">Payez avec</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {PAYMENT_METHODS.map((method) => (
              // Fond blanc fixe, y compris en theme sombre : ce sont des logos
              // de marque en couleurs fixes, pas des icones qui suivent le
              // theme — sur une surface sombre, Orange Money en particulier
              // deviendrait illisible.
              <span
                key={method.label}
                className="flex h-11 items-center rounded-sm border border-[var(--hairline)] bg-white px-3 shadow-card"
              >
                <img
                  src={method.src}
                  alt={method.label}
                  width={method.width}
                  height={method.height}
                  className="h-7 w-auto object-contain"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
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
                  className="relative w-[15rem] shrink-0 overflow-hidden rounded-sm shadow-card sm:w-auto"
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
