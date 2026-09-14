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
import { TripSearchForm } from "@/features/search/TripSearchForm";

const STEPS = [
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
];

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
  { label: "Orange Money", className: "bg-[#FF6600] text-white" },
  { label: "MTN MoMo", className: "bg-[#FFCB05] text-stone-900" },
  { label: "Moov Money", className: "bg-[#0072CE] text-white" },
  { label: "Wave", className: "bg-[#1DC8E5] text-stone-900" },
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

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Fond de marque : degrade orange et motif de bandes inclinees rappelant
            le drapeau, en retrait pour ne jamais concurrencer le formulaire. */}
        <div aria-hidden="true" className="grad-brand absolute inset-x-0 top-0 h-[24rem] sm:h-[24rem]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[24rem] opacity-[0.12] sm:h-[24rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #fff 0 18px, transparent 18px 64px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-16">
          <div className="max-w-2xl text-white">
            <p className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-flag-green)]" />
              Transport interurbain en Cote d&apos;Ivoire
            </p>
            <h1 className="mt-4 max-w-sm text-[1.75rem] font-extrabold leading-[1.2] tracking-tight sm:max-w-none sm:text-5xl">
              Votre place dans le car, reservee en deux minutes.
            </h1>
          </div>

          <Card className="mt-6 sm:mt-8">
            <CardBody className="p-4 sm:p-6">
              <TripSearchForm layout="stacked" />
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

      {/* Comment ca marche : liste verticale compacte, pas trois grandes cartes. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight">Comment ca marche</h2>
        <span aria-hidden="true" className="grad-brand mt-3 block h-[3px] w-12 rounded-full" />

        <Card className="mt-5">
          <ol>
            {STEPS.map((step, index) => (
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muted)]">Paiement accepte :</span>
          {PAYMENT_METHODS.map((method) => (
            <span
              key={method.label}
              className={`rounded-sm px-2.5 py-1 text-[11px] font-bold ${method.className}`}
            >
              {method.label}
            </span>
          ))}
        </div>
      </section>

      {/* Destinations populaires : cartes visuelles, legeres (degrade, pas de
          photo a telecharger) pour rester rapide en 2G/3G. */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight">Destinations populaires</h2>
        <span aria-hidden="true" className="grad-brand mt-3 block h-[3px] w-12 rounded-full" />

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4">
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
