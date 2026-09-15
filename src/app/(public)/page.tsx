import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui";
import {
  IconArrowRight,
  IconBuilding,
  IconClock,
  IconMapPin,
  IconPhone,
  IconQrCode,
  IconScan,
  IconShield,
  IconTicket,
  IconWifiOff,
} from "@/components/ui/icons";
import { formatDuration, formatMoney } from "@/lib/format";
import { PillarTabs } from "@/features/home/PillarTabs";
import type { Pillar } from "@/features/home/PillarTabs";
import { PopularApartments } from "@/features/home/PopularApartments";
import { PopularRentalVehicles } from "@/features/home/PopularRentalVehicles";
import { PromoBannerSlider } from "@/features/home/PromoBannerSlider";
import type { PromoBanner } from "@/features/home/PromoBannerSlider";
import { TrustBadgeGrid } from "@/features/home/TrustBadgeGrid";
import type { TrustBadge } from "@/features/home/TrustBadgeGrid";
import { ApartmentSearchForm } from "@/features/search/ApartmentSearchForm";
import { RentalVehicleSearchForm } from "@/features/search/RentalVehicleSearchForm";
import { TripSearchForm } from "@/features/search/TripSearchForm";

interface Step {
  icon: ReactNode;
  title: string;
  text: string;
}

const HERO_CONTENT: Record<Pillar, { kicker: string; title: string }> = {
  bus: {
    kicker: "Transport interurbain en Cote d'Ivoire",
    title: "Votre place dans le car, reservee en deux minutes.",
  },
  appartements: {
    kicker: "Locations meublees en Cote d'Ivoire",
    title: "Votre sejour a la mer, a portee de recherche.",
  },
  "location-auto": {
    kicker: "Location de vehicules en Cote d'Ivoire",
    title: "Votre vehicule, reserve ou que vous soyez.",
  },
};

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

const TRUST_BADGES_BY_PILLAR: Record<Pillar, TrustBadge[]> = {
  bus: [
    { icon: <IconShield className="h-5 w-5" />, title: "Paiement securise Mobile Money" },
    { icon: <IconWifiOff className="h-5 w-5" />, title: "Billet QR, fonctionne en 2G/3G" },
    { icon: <IconScan className="h-5 w-5" />, title: "Reservation en deux minutes" },
  ],
  appartements: [
    { icon: <IconShield className="h-5 w-5" />, title: "Paiement securise Mobile Money" },
    { icon: <IconScan className="h-5 w-5" />, title: "Annonces verifiees par nos partenaires" },
    { icon: <IconWifiOff className="h-5 w-5" />, title: "Contact direct avec l'agence" },
  ],
  "location-auto": [
    { icon: <IconShield className="h-5 w-5" />, title: "Paiement securise Mobile Money" },
    { icon: <IconScan className="h-5 w-5" />, title: "Vehicules recents et entretenus" },
    { icon: <IconWifiOff className="h-5 w-5" />, title: "Chauffeur disponible en option" },
  ],
};

const LISTING_TITLE_BY_PILLAR: Record<Pillar, { title: string; subtitle?: string }> = {
  bus: { title: "Destinations populaires" },
  appartements: { title: "Les appartements", subtitle: "Quartiers prises : Assinie, Grand-Bassam, Jacqueville" },
  "location-auto": { title: "Vehicules sollicites" },
};

const PROMISES = [
  {
    icon: <IconShield className="h-5 w-5" />,
    title: "Billet infalsifiable",
    text: "Verifie a l'embarquement",
  },
  {
    icon: <IconWifiOff className="h-5 w-5" />,
    title: "Pense pour la 2G/3G",
    text: "Fonctionne sur reseau lent",
  },
  {
    icon: <IconScan className="h-5 w-5" />,
    title: "Aucun ticket papier",
    text: "Tout tient dans le telephone",
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
    gradient: "linear-gradient(150deg,#ff9a2e 0%,#f77f00 55%,#b35700 100%)",
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
    gradient: "linear-gradient(150deg,#db6d00 0%,#8a4300 100%)",
  },
  {
    city: "Korhogo",
    from: "Abidjan",
    price: 9500,
    durationMinutes: 420,
    gradient: "linear-gradient(150deg,#57493c 0%,#241d17 100%)",
  },
];

const PARTNERS = [
  { code: "UTB", name: "Union des Transports de Bouake" },
  { code: "STC", name: "Societe de Transport Cotier" },
];

const BANNERS: PromoBanner[] = [
  {
    title: "Ligne Bonoua-Treichville : nouveaux departs 6h & 17h",
    subtitle: "Reservez votre place en deux minutes",
    href: "/",
    gradient: "linear-gradient(150deg,#ff9a2e 0%,#f77f00 55%,#b35700 100%)",
  },
  {
    title: "Studio meuble a Assinie des 15 000 FCFA/nuit",
    subtitle: "Sejournez face a la lagune",
    href: "/?onglet=appartements",
    gradient: "linear-gradient(150deg,#2F9E68 0%,#1F7A4D 100%)",
  },
  {
    title: "Location auto des 25 000 FCFA/jour a Abidjan",
    subtitle: "Avec ou sans chauffeur",
    href: "/?onglet=location-auto",
    gradient: "linear-gradient(150deg,#2C3E5C 0%,#1B2A41 100%)",
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

  const hero = HERO_CONTENT[activeTab];
  const steps = STEPS_BY_PILLAR[activeTab];
  const trustBadges = TRUST_BADGES_BY_PILLAR[activeTab];
  const listing = LISTING_TITLE_BY_PILLAR[activeTab];

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Fond de marque : degrade orange et motif de bandes inclinees rappelant
            le drapeau, en retrait pour ne jamais concurrencer le formulaire. */}
        <div aria-hidden="true" className="grad-brand absolute inset-x-0 top-0 h-[26rem] sm:h-[26rem]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[26rem] opacity-[0.12] sm:h-[26rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #fff 0 18px, transparent 18px 64px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-16">
          <div className="max-w-2xl text-white">
            <p className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-flag-green)]" />
              {hero.kicker}
            </p>
            <h1 className="mt-4 max-w-sm text-[1.75rem] font-extrabold leading-[1.2] tracking-tight sm:max-w-none sm:text-5xl">
              {hero.title}
            </h1>
          </div>

          <div className="mt-6 sm:mt-8">
            <PillarTabs active={activeTab} />
          </div>

          <Card className="mt-4 sm:mt-5">
            <CardBody className="p-4 sm:p-6">
              {activeTab === "bus" ? <TripSearchForm layout="stacked" /> : null}
              {activeTab === "appartements" ? <ApartmentSearchForm layout="stacked" /> : null}
              {activeTab === "location-auto" ? <RentalVehicleSearchForm layout="stacked" /> : null}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Arguments forts : slider horizontal discret, pour ne pas alourdir la
          page d'un bloc de texte sur trois colonnes. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {PROMISES.map((promise) => (
            <div
              key={promise.title}
              className="flex w-[13.5rem] shrink-0 items-start gap-3 rounded-sm border border-[var(--hairline)] bg-[var(--surface)] p-3.5 shadow-card"
            >
              <span className="grad-brand-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-brand-600 dark:text-brand-400">
                {promise.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-snug">{promise.title}</span>
                <span className="block text-xs text-[var(--muted)]">{promise.text}</span>
              </span>
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

      {/* Badges de confiance : dernier rappel avant les affiches publicitaires. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <TrustBadgeGrid badges={trustBadges} />
      </section>

      {/* Affiches publicitaires : un pilier a la fois, defilement automatique. */}
      <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <PromoBannerSlider banners={BANNERS} />
      </section>

      {/* Partenaires : cree la confiance sans texte superflu. */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
          Nos partenaires de confiance
        </h2>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
          {PARTNERS.map((partner) => (
            <div key={partner.code} className="flex items-center gap-2.5" title={partner.name}>
              <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-[var(--hairline)] bg-[var(--surface)] text-xs font-extrabold text-stone-500 shadow-card dark:text-stone-400">
                <IconBuilding className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold text-stone-500 dark:text-stone-400">{partner.code}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
